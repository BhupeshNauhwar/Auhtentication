const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        enum:["male","female","other"],
        required:true
    },
    image:{
        type:String,
        required:true
    },
    
    is_verified:{
        type:Number,
        default:0,
        required:true
    },
    token:{
        type:String,
        default:''
    }
})

module.exports=mongoose.model("User",userSchema);