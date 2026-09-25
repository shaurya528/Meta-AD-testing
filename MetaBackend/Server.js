import express from 'express' 

const app=express();
app.get('/test',(req,res)=>{
    console.log("testing Successfully ");
    res.status(200).send({message:"server is running fine"});

})
const PORT=3008;
app.listen(PORT,()=>{
    console.log(`running on port${PORT}`)
})