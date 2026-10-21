import express from "express"
import Cookieparser from  "cookie-parser"
import registerRoute from "../src/Routes/auth.register.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import productRoutes from "../src/Routes/product.route.js"
const app=express();

app.use(express.json())
app.use(Cookieparser())

app.use("/register",registerRoute)
app.use("",productRoutes)

app.use(errorHandler)
export default app;
