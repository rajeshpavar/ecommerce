

export interface Product{
  id:number,
  title:string,
  images:string[],
  price:number,
  description:string,
  category:string,
  reviews:{
    reviewerName:string,
    comment:string
  }[],
stock:number
}


export async function fetchProducts(){

     try {
         const products=await fetch("https://dummyjson.com/products");
      if(!products.ok){
        throw new Error ("fetch error from dummyjson")
      }
      const data:{products:Product[]}=await products.json();
      return data
     } catch (error) {
        console.error(error)

     }

}