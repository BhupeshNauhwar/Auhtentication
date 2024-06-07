const express=require('express');
const app=express();
const Port=5000;
const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/VotingSystem")
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