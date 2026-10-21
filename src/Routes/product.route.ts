import { Router } from "express";
import { addProducts, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product";
import { authMiddleware } from "../middlewares/auth.middlewares";

const route=Router();


route.get("/api/v1/products",authMiddleware,getProducts); //get all products
 route.post("/api/v1/products",authMiddleware,addProducts);  //add Products
route.get("/api/v1/products/:id",authMiddleware,getProduct) //read one product
route.put("/api/v1/products/:id",authMiddleware,updateProduct) // update singl product
route.delete("/api/v1/products/:id",authMiddleware,deleteProduct)  //delete single product
                                                                        


export default route;