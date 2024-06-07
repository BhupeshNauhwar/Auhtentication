const express=require('express');
const app=express();
const Port=5000;
const mongoose=require('mongoose');

mongoose.connect("mongodb+srv://bhupeshkumar052000:1lkcRqum9TtRnDKb@authe.sk0vpkm.mongodb.net/?retryWrites=true&w=majority&appName=Authem")
.then(()=>{
    console.log('mongodb connected');
})
.catch(()=>{
    console.log('failed to connected');
})
const userRoutes=require('./routes/Routes')
app.use('/',userRoutes);


app.listen(Port,()=>{
    console.log(`Server Started at http://localhost:${Port}`);
})