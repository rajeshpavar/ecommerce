import { z } from "zod";

export const productSchema = z.array(
    z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  brand: z.string().default("Unknown"),

  images: z.array(z.string()).optional(), 
  reviews: z.array(
   z.object().loose()
  ).optional(),
})
);
export const addProductSchema=z.object({
      brand:z.string().default("Unknown"),
  title       :z.string(),
  description :z.string(),
  stock       :z.number().int({error:"must be whole number with no decimals"}),
    reviews: z.array(
   z.object().loose()
  ).optional(),
  images: z.array(z.string()).optional(), 

  price       :z.number().refine(num=>{
    const splitNum=num.toString().split(".");

   return splitNum.length===2&& splitNum[1].length===2

  },{error:"must be provide 2 decimals"}),
  category :z.string(),
  
})

 // allows extra fields if API adds more
