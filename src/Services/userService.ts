import { db } from "../prisma/db";

export async function findUserByEmail(email:string){

    return db.orm.public.User.first({
        email
    })

}