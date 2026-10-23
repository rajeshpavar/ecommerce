import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken"


declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}
export async function authMiddleware(req:Request,res:Response,next:NextFunction){

const token=req.cookies?.token;
 
if(!token){
  return  res.status(401).json({
        success:false,
        message:"not authorise user"
    })
}


  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "JWT secret not configured",
    });
  }
try {
    const decode=jwt.verify(token,jwtSecret) as {id:string,role:string};

    req.user=decode;
    
    next()
} catch (error) {
  return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid token",
    });
}





}

