const mongoose= require('mongoose')

mongoose.set('strictQuery', false)
let uri=`mongodb+srv://rajat:ecommerce@cluster0.dlxwwee.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(uri,(err)=>{
    if(err){
        console.log('connection failed')
    }
    else{
        console.log('connected successfully')
    }
})