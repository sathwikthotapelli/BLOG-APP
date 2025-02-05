//create the mini app fro admin
const exp = require('express')
const adminApp=exp.Router()



adminApp.get('/test-admin',(req,res)=>{
    
    res.send({message:"admin data"})
})








//export the admin
module.exports=adminApp