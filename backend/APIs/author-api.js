//create the mini app fro admin
const exp = require('express')
const authorApp=exp.Router()
const bcryptjs=require('bcryptjs')//for hashing the password
const expressAsyncHandler=require("express-async-handler")//to find the errors which are async
const jwt=require('jsonwebtoken')//creating the tokens
require('dotenv').config()//to using the secrete from the env file
const veerifyToken=require('../Middlewares/verifyTokens')//fpr appling of middle wares

let authorcollection;
let articlecollection;
//get authorcollection app
authorApp.use((req,res,next)=>{
    authorcollection=req.app.get('authorscollection')
    articlecollection=req.app.get('articlescollection')
    next()
})



//author registration
authorApp.post('/user',expressAsyncHandler(async(req,res)=>{

    //get author data from client
    const newUser=req.body;
    //check id duplicant user anr ther baser on username
    const dbuser=await authorcollection.findOne({username:newUser.username})
    //if author found in db then its duplicant
    if(dbuser!== null){

        res.send({message:"User existed"})

    }
    //hash the passwors
    const hashedPassword=await bcryptjs.hash(newUser.password,6)
    //replate plain pw with hashed pw
    newUser.password=hashedPassword;
    //create author
    await authorcollection.insertOne(newUser)
    res.send({message:"Author created"})
}))



//author login
authorApp.post('/login',expressAsyncHandler(async(req,res)=>{

    //get author login data from client
    const userCred=req.body;
    //check for username
    const dbuser=await authorcollection.findOne({username:userCred.username})
    //check if author is exist in the database or not
    if(dbuser===null){
        res.send({message:"invalid username"})
    }
    else{
        //check for password
        const status=await bcryptjs.compare(userCred.password,dbuser.password)
       //
       if(status===false){
        res.send({message:"invalid password"})
       }
       else{
        //create jsonwebtoken
        const signedToken=jwt.sign({username:dbuser.username}, process.env.SECRET_KEY,{expiresIn:20});
        //send response
        res.send({message:"login success",token: signedToken, author: dbuser});

       }
    }

}))





//add the articles by author
authorApp.post('/article',veerifyToken,expressAsyncHandler(async(req,res)=>{
    //get the author data body fom client
    const newArticle=req.body;
    //get the articles collection to add this author article
    await articlecollection.insertOne(newArticle)
    //send response
    res.send({message:"New article created"})

}))





//update the articles
authorApp.put('/article',veerifyToken,expressAsyncHandler(async(req,res)=>{
    //get the body
    const newupdate=req.body;
   // console.log(newupdate)
   //update by article id
    const result=await articlecollection.updateOne({articleId:newupdate.articleId},{$set:{...newupdate}})
    const latestArticle=await articlecollection.findOne({articleId:newupdate.articleId})
    //send response
    res.send({message:"Articles modified",article:latestArticle})
}))





//delete the article by article id
authorApp.put('/article/:articleId',veerifyToken,expressAsyncHandler(async(req,res)=>{

    //get the arcticlesid from url
    const articleIdFromUrl=(+req.params.articleId);
    const articleToDelete=req.body
    //update the status of article to false

    //for delete
    if(articleToDelete.status===true){
        let modifiedArt= await articlecollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
        res.send({message:"article deleted",payload:modifiedArt.status})
     }
     //for restore
     if(articleToDelete.status===false){
         let modifiedArt= await articlecollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
         res.send({message:"article restored",payload:modifiedArt.status})
     }
    

}))




//viewing the articles by author 
authorApp.get('/articles/:username',veerifyToken,expressAsyncHandler(async(req,res)=>{
    //get the author name from the reuest url
   const authorName=req.params.username;
    //get the articles whose status is only ture i.e, not deleted articles are viewing
    const articlesList=await articlecollection.find({status:true,username:authorName}).toArray()
    //send response
    res.send({message:"List of articles",payload:articlesList})
}))



//export the admin
module.exports=authorApp