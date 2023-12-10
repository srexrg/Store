import jwt from 'jsonwebtoken'
import user from '../models/userModel.js'
import asyncHandler from './asyncHandler.js'

const authenticate =asyncHandler(async(req,res,next)=>{

  let token;

  token = req.cookies.jwt;

  if(token){
    try {

      const decoded = jwt.verify(token,process.env.JWT_SECTRT)
      req.user = await user.findbyId(decoded.userId).select('-password')
      next();
      
    } catch (error) {
      res.status(401)
      throw new Error("Not authorized");
      
    }
  }else{
    throw new Error("No token");
  }

})

const authorizeAdmin = (req,res,next)=>{

  if(req.user && req.user.isAdmin){
    next();
  }else{
    res.status(401).send("Not authorized")
  }
}

export {authenticate,authorizeAdmin}