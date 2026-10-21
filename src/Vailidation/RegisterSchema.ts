import {z} from "zod"


export const signupSchema=z.object({
   
    name:z.string(),
    email:z.email(),
    password:z.string().min(8,{error:"minimam 8 or more charachter required"}),
    role:z.string().optional(),
    gender:z.string().default("male")
    
})

export const loginSchema=z.object({
    email:z.string(),
    password:z.string().min(8,{error:"minimam 8 or more charachter required"})
})