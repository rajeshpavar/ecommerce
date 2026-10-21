import app from "./src/app";
import "dotenv/config"


const port=process.env.PORT || 4090;

app.listen(port,()=>{
    console.log("listing on port ", port);
    
})

