import type { Request, Response ,NextFunction} from "express";
import { loginSchema, signupSchema } from "../Vailidation/RegisterSchema.js";
import { db } from "../prisma/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { findUserByEmail } from "../Services/userService.js";



export async function signupUser(req:Request,res:Response,next:NextFunction) {

    const parse=signupSchema.safeParse(req.body);

    if(!parse.success){
    return res.status(400).json({
        success:false,
        message:"invailid inputs",
        errors:parse.error
    })
    }

    const {name,email,password,gender="MALE"}=parse.data;
    const role = (parse.data.role ?? "USER") as "USER" | "ADMIN";



try {
    
    const existingUser=await findUserByEmail(email)

    if(existingUser){
       return res.status(400).json({
        success:false,
        message:"user Already exists"
    })
}

    const passwordHash=await bcrypt.hash(password,10);
    
    const newUser=await db.orm.public.User.create({
        name,
        email,
        password:passwordHash,
        gender,
        role
    })

   const jwtScerete=process.env.JWT_SECRET;

   if(!jwtScerete){
    throw new Error("jwt secrete key does not provided ");
    
   }

   const token=jwt.sign({id:newUser.id,role:newUser.role},jwtScerete,{expiresIn:"24h"})
  
   res.cookie("token",token,{httpOnly:true,secure:true})

   res.status(201).json({
    sucess:true,
    user:{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        gender: newUser.gender,
    }
   })

} 
catch (error:any) {
    next(error)

}}

export async function loginUser(req:Request,res:Response,next:NextFunction){

const parse=loginSchema.safeParse(req.body);

if(!parse.success){
    
   return res.status(400).json({
        success:false,
        message:"not vailid inputs provided"
    })
}

const { email,password}=parse.data;

try {
    const existingUser=await findUserByEmail(email)

    if(!existingUser){
        return res.status(400).json({
            success:false,
            message:"user does not existis"
        })
    }

    const vailidPassword=await bcrypt.compare(password,existingUser.password);

    if(!vailidPassword){
        return res.status(401).json({
            success:false,
            message:"password does not match with current password "
        })
    }

    const jwtScerete=process.env.JWT_SECRET;

    if(!jwtScerete){
        throw new Error("jwt token is missing ")
    }

    const token=jwt.sign({id:existingUser.id,role:existingUser.role},jwtScerete,{expiresIn:'24h'});
    
     res.cookie('token',token,{httpOnly:true,secure:true})

     res.status(200).json({
        success:true,
        message:`welcome back ${existingUser.name}`,
        token,
  user: {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
    gender: existingUser.gender,
  }
     })

} catch (error:any) {

   next(error)
}


}