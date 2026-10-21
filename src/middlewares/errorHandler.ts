import type { Response,Request,NextFunction,ErrorRequestHandler} from "express";

export function errorHandler(err:ErrorRequestHandler,req:Request,res:Response,next:NextFunction){

console.log(err);
res.status(400).json({
    success:false,
    message:err || "internal server Error "
})

} 

