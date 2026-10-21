import { Router } from "express";
import { loginUser, signupUser } from "../controllers/registerUser";

const route=Router();

route.post("/auth/v1/signup",signupUser);
route.post("/auth/v1/login",loginUser);



export default route;
