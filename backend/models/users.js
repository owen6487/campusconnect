const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:function(){
            return !this.googleId; // Password is required only if googleId is not provided
        },
    },
    campus:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
        required: function(){
            return this.authProvider ==="local"
        },
    },
    branch:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: false,
    },
    googleId:{
        type:String,
    },
    profilePicture:{
        type:String,
    },
    authProvider:{
        type:String,
        enum:["local","google"],
        default:"local",
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    },
    loginAttempts:{
        type:Number,
        default:0,
    },
    lockUntil:{
        type:Date,
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    phoneNumber:{
        type:String,
        unique:true,
        sparse:true,
    },
    deletedAt:{
        type:Date,
    },
},{timestamps:true});


userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = async function(myPassword){
    if(!this.password)return false
    try{
        
        return await bcrypt.compare(myPassword, this.password);
    }
    catch(err){
        throw new Error(err);
    }
};

userSchema.methods.incrementLoginAttempts = async function(){
    try{ 
        if(this.lockUntil && this.lockUntil < Date.now()){
          return this.resetLoginAttempts(); // Reset login attempts if lock has expired
        } 
        this.loginAttempts += 1;
    if(this.loginAttempts >= 5){
        this.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lock
    }
     await this.save();
    }
    catch(err){
        throw new Error(err);
    };

};

userSchema.methods.resetLoginAttempts = async function(){
    try{
        this.loginAttempts = 0;
        this.lockUntil = undefined;
        await this.save();
    }
    catch(err){
        throw new Error(err);
    }
};


module.exports = mongoose.model("User", userSchema);