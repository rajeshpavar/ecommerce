#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/903c9fcc6c3ae18a62f21ba2f0c32b4bc9274334c74a3a2a66c3090447a30724/contract';
import startContractJson from '../../snapshots/903c9fcc6c3ae18a62f21ba2f0c32b4bc9274334c74a3a2a66c3090447a30724/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e26f38336c3d6e4bed244fa2b11871dfdd8b9bac2cc6d8ad69e0807ec3b8e3ab/contract';
import endContractJson from '../../snapshots/e26f38336c3d6e4bed244fa2b11871dfdd8b9bac2cc6d8ad69e0807ec3b8e3ab/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration';
import postgresAdapter from '@prisma/orm-postgres/adapter/runtime';
import { sql } from '@prisma/orm-postgres/builder/runtime';
import { createExecutionContext, createSqlExecutionStack } from '@prisma/orm-postgres/family-runtime';
import postgresTarget, { PostgresContractSerializer } from '@prisma/orm-postgres/target/runtime';

const endContract = new PostgresContractSerializer().deserializeContract<End>(endContractJson);
const stack = createSqlExecutionStack({ target: postgresTarget, adapter: postgresAdapter });

const db = sql<End>({
  context: createExecutionContext({ contract: endContract, stack }),
  rawCodecInferer: stack.adapter.rawCodecInferer,
});

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContractJson;
  override readonly endContractJson = endContractJson;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'ProductImage',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Review',
        columns: [
          col('comment', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewerName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Product',
        column: col('externalId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Product',
        column: col('brand', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-Product-brand', {
        check: () =>
          db.public.Product
            .select('id')
            .where((f, fns) => fns.eq(f.brand, null))
            .limit(1),
        run: () =>
          db.public.Product
            .update({ brand: 'Unknown' })
            .where((f, fns) => fns.eq(f.brand, null)),
      }),
      this.setNotNull({ schema: 'public', table: 'Product', column: 'brand' }),
      this.addUnique({
        schema: 'public',
        table: 'Product',
        constraint: 'Product_externalId_key',
        columns: ['externalId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductImage',
        index: 'ProductImage_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Review',
        index: 'Review_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProductImage',
        foreignKey: {
          name: 'ProductImage_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Review',
        foreignKey: {
          name: 'Review_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['id'] },
        },
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'Category' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'ProductImage' }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'Review' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
