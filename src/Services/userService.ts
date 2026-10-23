import { db } from "../prisma/db.js";

export async function findUserByEmail(email:string){

    return db.orm.public.User.first({
        email
    })

}