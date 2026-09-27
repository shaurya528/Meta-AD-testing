import express from 'express' 
import AllRoutes from './Routes/DefineRoutes.js'
import 'dotenv/config';

const app=express();
app.use(express.json())
app.get('/test',(req,res)=>{
    console.log("testing Successfully ");
    res.status(200).send({message:"server is running fine"});

})
app.use('',AllRoutes)
const PORT=3008;
app.listen(PORT,()=>{
    console.log(`running on port${PORT}`)
})