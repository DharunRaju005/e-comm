const mongoose=require("mongoose");


const wishlistSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        require:true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

const Wishlist=mongoose.model('Wishlist',wishlistSchema);
module.exports=Wishlist;
