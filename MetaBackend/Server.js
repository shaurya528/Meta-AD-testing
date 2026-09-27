import express from 'express' 
import { leads } from './Data/LeadsData.js';
import AllRoutes from './Routes/DefineRoutes.js'
import http from 'http'
import { Server } from 'socket.io';
import 'dotenv/config';

const app=express();
const server = http.createServer(app);
app.use(express.json())



const PORT=3008;

const io = new Server(server, {
  cors: { origin: '*' } 
});
app.use((req, res, next) => {
    req.io = io;
    next();
  });
io.on('connection', (socket) => {
  console.log('Mobile App Connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Mobile App Disconnected:', socket.id);
  });
});
app.use('',AllRoutes)
app.get('/test',(req,res)=>{
    console.log("testing Successfully ");
    res.status(200).send({message:"server is running fine"});

})
app.get('/leads', (req, res) => {
    res.json(leads); 
  });
server.listen(PORT,()=>{
    console.log(`running on port${PORT}`)
})