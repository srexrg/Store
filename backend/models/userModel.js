import mongoose, { Mongoose } from "mongoose";



const userSchema = mongoose.Schema({

  username:{

    type:String,
    required:true,
  },

  email:{

    type:String,
    required:true,
    isUnique:true,
  },
  password:{

    type:String,
    required:true,

  },

  isAdmin:{
    type:Boolean,
    default:false,
    required:true,
  }
},{timestamps:true}
);


const user = mongoose.model('Users',userSchema)

export default user