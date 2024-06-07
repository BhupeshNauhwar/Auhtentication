const mongoose=require('mongoose');

const otpSchema=new mongoose.Schema({
    email:{type:String,unique:true},
    otp:{
        type:String
    }
   
})
module.exports=mongoose.model("OTP",otpSchema);