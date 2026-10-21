#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/296ae3578e68e63b3d25f4977417dceeb545ed4c1ca14ea986f1097578b7cb3e/contract';
import startContract from '../../snapshots/296ae3578e68e63b3d25f4977417dceeb545ed4c1ca14ea986f1097578b7cb3e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/903c9fcc6c3ae18a62f21ba2f0c32b4bc9274334c74a3a2a66c3090447a30724/contract';
import endContract from '../../snapshots/903c9fcc6c3ae18a62f21ba2f0c32b4bc9274334c74a3a2a66c3090447a30724/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  lit,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Category',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('OTHER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Category_type_check_a051804c',
            `"type" IN ('CLOTHES', 'ELECTRONICS', 'FOOD', 'BEAUTY', 'FURNITURE', 'BOOKS', 'OTHER')`,
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Product',
        column: col('categoryId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-Product-categoryId', {
        check: () => placeholder('backfill-Product-categoryId:check'),
        run: () => placeholder('backfill-Product-categoryId:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'Product', column: 'categoryId' }),
      this.createIndex({
        schema: 'public',
        table: 'Product',
        index: 'Product_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Product',
        foreignKey: {
          name: 'Product_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'Category', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
