import type { NextFunction, Request,Response } from "express";
import {  addProductSchema, productSchema } from "../Vailidation/ProductSchema";
import { errorHandler } from "../middlewares/errorHandler";
import { db } from "../prisma/db";
import { fetchProducts } from "../Services/fetchProducts";


const categoryMap: Record<string,
  "OTHER" | "CLOTHES" | "ELECTRONICS" | "FOOD" | "BEAUTY" | "FURNITURE" | "BOOKS"
> = {
  beauty: "BEAUTY",
  fragrances: "BEAUTY",
  groceries: "FOOD",
  smartphones: "ELECTRONICS",
  laptops: "ELECTRONICS",
  furniture: "FURNITURE",
  tops: "CLOTHES",
  shirts: "CLOTHES",
  books: "BOOKS",
  default: "OTHER",
};

export async function getProducts(req:Request,res:Response,next:NextFunction){




  try {
    
     const getAllProducts=await db.orm.public.Product.all();

     if(!getAllProducts){
     return res.status(400).json(
       {
    
        success:false,
        message:"no product in dubmmjson"
       }
      )
     }

     res.status(200).json({
          success:true,
          message:"got all products",
          products:getAllProducts
     })
     
    
  } catch (error) {
    next(error)
  }


}

export async function addProducts(req:Request,res:Response,next:NextFunction){

  const role=req.user?.role;

  if(role!=='ADMIN'){
    return res.status(403).json({
      success:false,
      message:"not authorise for this action "
    })
  }

  let products;

  if(req.body && Object.keys(req.body).length > 0){
    // case 1 admin providing json data  product 
    const parser=addProductSchema.safeParse(req.body);

    if(!parser.success){
       return res.status(400).json({
      success:false,
      message:"admins provoided product schema does not match with zod schema ",
       error:parser.error
    })
     
    }

    products=[parser.data]
  }
else{
  // case 2 sync from dummyJson
    const data=await fetchProducts()
 
 if(!data){
  return res.status(400).json({
      success:false,
      message:"fetching error",
       
    })
 }

  const parser=productSchema.safeParse(data.products);

  if(!parser.success){
     return res.status(400).json({
      success:false,
      message:"product schema does not match with zod schema",
       error:parser.error
    })
     
    
  }

  products=parser.data
}
  
 

  try {
    
       for(const product of products){
      
        let category=await db.orm.public.Category.first({
          type: product.category.toUpperCase() as "OTHER" | "CLOTHES" | "ELECTRONICS" | "FOOD" | "BEAUTY" | "FURNITURE" | "BOOKS"
        })

      
        if(product.category==="groceries"){
          category={id:"3",type:"FOOD"}
        }
        if(product.category==="fragrances"){
          category={id:"4",type:"BEAUTY"}
        }
        if(!category){
          category={ id: "7", type: "OTHER" }
        }

     

     const dataProduct= await db.orm.public.Product.upsert({
        create:{
          externalId:product.id ?? null,
      title: product.title,
      description: product.description,
      categoryId: String(category.id),
      price: String(product.price),
      stock: Number(product.stock),
      brand: product.brand,
      
        },
        update: {
      title: product.title,
      description: product.description,
      categoryId: String(category.id),
      price: String(product.price),
      stock: Number(product.stock),
      brand: product.brand,
      
    },
    conflictOn:{
      externalId:product.id ?? null
    }
      })

      


        for(const imgUrl of product.images ?? []){
             await db.orm.public.ProductImage.create(
              {
                productId:dataProduct.id,
                url:imgUrl
              }
             )
        }


        for(const review of product.reviews ?? []){
          await db.orm.public.Review.create({
            comment:review.comment as string,
            productId:dataProduct.id,
            reviewerName:review.reviewerName as string

          })
        }




    }

    

    return res.status(201).json({
      success:true,
      message:"product created successfully",

    })
  } catch (error) {
     next(error)
  }


}

export async function getProduct(req:Request,res:Response,next:NextFunction){

  const id=String(req.params.id);

  try {
    
    const data=await db.orm.public.Product.first({
       id
    })

    if(!data){
      return res.status(400).json({
        success:false,
        message:"no product found of this id"
      })
    }

     return res.status(200).json({
      success:true,
      message:data
     })

  } catch (error) {
      next(error)
  }

}


export async function updateProduct(req:Request,res:Response,next:NextFunction){


  const role=req.user?.role;

  if(role!=="ADMIN"){
    res.status(403).json({
      success:false,
      message:"anuthorized for this action"
    })
  }

  try {
    const id=String(req.params.id);
    const products=await db.orm.public.Product.first({
      id
    })

    const body=req.body;

    if(!products){
      return res.status(400).json({
        success:false,
        message:"no product found to update"
      })
    }

    const filterProduct={...products,...body};

    

    const update=await db.orm.public.Product.where({id:products.id}).update({
      ...filterProduct
    })

    return res.status(201).json({
      success:true,
      message:update
    })

  } catch (error) {
    next(error)
  }

}

export async function deleteProduct(req:Request,res:Response,next:NextFunction) {
  const id=String(req.params.id);


  try {

    const deleteProduct=await db.orm.public.Product.where({id}).delete()
    if(!deleteProduct){
      return res.status(400).json({
        success:false,
        message:"can not delete product"
      })
    }

    return res.status(200).json({
      success:true,
      message:"product delete successfully",
      product:deleteProduct
    })

  } catch (error) {
    next(error)
  }
}