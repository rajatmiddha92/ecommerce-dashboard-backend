const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
 name: String,
 price: String,
 category:String,
 userId: String,
 company:String
})

const product = mongoose.model('products',productSchema)

module.exports = product