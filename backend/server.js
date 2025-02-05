//create express app
const exp=require('express')
const app=exp()
require('dotenv').config()//impoting the env for port number
const mongoClient=require('mongodb').MongoClient;//importing mongodb

//connecction of frontend 
const path=require('path')
//deploy react build in this server
app.use(exp.static(path.join(__dirname,'../client/build')))


//to parse the body requst
app.use(exp.json())


//coonect the mongodb
mongoClient.connect(process.env.DB_URL)
.then(client=>{
//get the db obj
const blogdb=client.db('blogdb')

//get the collection obj
const userscollection=blogdb.collection('userscollection')
//get the articlescollection to view the user
const articlescollection=blogdb.collection('articlescollection')
//get the authors collection
const authorscollection=blogdb.collection('authorscollection')

//share the collection obj to the exp obj to use the apis
app.set('userscollection',userscollection)
//share the collection obj to the exp obj to use the apis
app.set('articlescollection',articlescollection)
//share the collection obj to the exp obj to use the apis
app.set('authorscollection',authorscollection)
//conform the db connection
console.log("db connected")
})
.catch(err=>console.log("err in db connection",err))




//import api routers
const userApp=require('./APIs/user-api')
const adminApp=require('./APIs/admin-api')
const authorApp=require('./APIs/author-api')

//sending the client rest to the required api
//if the path starts with '/user-api send req to user-api
app.use('/user-api',userApp)
//if the path starts with '/author-api send req to author-api
app.use('/author-api',authorApp)
//if the path starts with '/admin-api send req to admin-api
app.use('/admin-api',adminApp)



//deals with page refresh
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})

//error handling by the middle ware
app.use((err,req,res,next)=>{
    res.send({message:'error occured ',payload:err.message})
})








//assign port number
const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`server running at port number ${port}....`))