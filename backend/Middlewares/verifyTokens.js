//import the jsonwebtoken
const jwt=require('jsonwebtoken')
require('dotenv').config()

function verifyTokens(req,res,next){
    //get bearer token from headers of req
    const bearerToken=req.headers.authorization;
    //if bearer token not avilable
    if(!bearerToken){
        return res.send({message:"unathorized access..plz login to continue"})
    }
    //extract token from bearer token
    const token=bearerToken.split(' ')[1]
    try{
        jwt.verify(token,process.env.SECRET_KEY)
    }catch(err){
        next(err)
    }

}


module.exports=verifyTokens;