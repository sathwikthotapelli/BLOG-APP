//create the mini app fro admin
const exp = require('express')
const userApp=exp.Router()
const bcryptjs=require('bcryptjs')//for hashing the password
const expressAsyncHandler=require("express-async-handler")//to find the errors which are async
const jwt=require('jsonwebtoken')//creating the tokens
require('dotenv').config()//to using the secrete from the env file
const veerifyToken=require('../Middlewares/verifyTokens')

//get usercollection app
let usercollection;
let articlecollection;
userApp.use((req,res,next)=>{
    usercollection=req.app.get('userscollection')
    articlecollection=req.app.get('articlescollection')
    next()
})



//user registration
userApp.post('/user',expressAsyncHandler(async(req,res)=>{

    //get user data from client
    const newUser=req.body;
    //check id duplicant user anr ther baser on username
    const dbuser=await usercollection.findOne({username:newUser.username})
    //if user found in db then its duplicant
    if(dbuser!== null){

        res.send({ message: "User existed" });

    }
    else{
    //hash the passwors
    const hashedPassword=await bcryptjs.hash(newUser.password,6)
    //replate plain pw with hashed pw
    newUser.password=hashedPassword;
    //create user
    await usercollection.insertOne(newUser)
    res.send({ message:"User created" })
    }
}))



//user login
userApp.post('/login',expressAsyncHandler(async(req,res)=>{

    //get user login data from client
    const userCred=req.body;
    //check for username
    const dbuser=await usercollection.findOne({username:userCred.username})
    //check if user is exist in the database or not
    if(dbuser===null){
        res.send({ message: "Invalid username" });
    }
    else{
        //check for password
        const status=await bcryptjs.compare(userCred.password,dbuser.password)
       //
       if(status===false){
        res.send({ message: "Invalid password" });
       }
       else{
        //create jsonwebtoken
        const signedToken=jwt.sign({username:dbuser.username}, process.env.SECRET_KEY,{expiresIn:20});
        //send response
        res.send({message: "login success",token: signedToken, user: dbuser});

       }
    }

}))





//viewing the articles by user
userApp.get('/articles',veerifyToken,expressAsyncHandler(async(req,res)=>{
    //get the articlescollection from express app
    const articlescollection=req.app.get('articlescollection')
    //get the articles where status is ture i.e, not deleted
    const articlesList=await articlescollection.find({status:true}).toArray()
    //send response
    res.send({message: "articles",payload: articlesList})

}))





//writing the comments by user
userApp.post('/comment/:articleId',veerifyToken,expressAsyncHandler(async(req,res)=>{

     //get the users comment obj from client
     const usercomment=req.body;
     //get artile id from url
     const articleIdFromurl=(+req.params.articleId);
     //insert usercomment obj to comments array of article by id 
     let result=await articlecollection.updateOne({articleId:articleIdFromurl},{$addToSet:{comments:usercomment}});
     //send res
     res.send({message: "comment posted" })
}))





//export the admin
module.exports=userApp