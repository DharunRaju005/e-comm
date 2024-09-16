const wishList=require("../models/wishlist")
const Product=require("../models/product");
const mongoose=require("mongoose")



const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await wishList.findOne({ user: userId }).populate('products');
        
        if (!wishlist || wishlist.products.length === 0) {
            return res.status(400).json({ message: "Your Wishlist is empty" });
        }

        return res.status(200).json({ data: wishlist.products });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

const addToWishlist=async(req,res)=>{
    try{
        const{productId}=req.params;
        const userId=req.user.id;
        const product=await Product.findOne({_id:productId});
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        let wishlist=await wishList.findOne({user:userId});
        if(!wishlist){
            wishlist=new wishList ({
                user:userId,
                products:[productId]
            });
        }
        else if(wishlist.products.includes(productId)){
            return res.status(400).json({message:"This Product is already in Your whishlist"});
        }
        else{
            wishlist.products.push(productId);
        }

        await wishlist.save();
        return res.status(201).json({message:"Added to the wishlist successfully"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error adding product to wishlist" });
    }
}


const removeFromWhislist=async(req,res)=>{
    try{
        const userId=req.user.id;
        const{productId}=req.params;
        const wishlist=await wishList.findOne({user:userId});
        if(!wishlist){
            return res.status(400).json({message:"Your Whishlist is empty"});
        }
        wishlist.products.filter(product=>(product.toString!==productId));
        await wishlist.save();
        return res.status(200).json({message:"The item is removed successfully"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error deleting product from wishlist" });
    }
}

const clearWishlist=async(req,res)=>{
    try{
        const userId=req.user.id;
        const wishlist=await wishList.findOne({user:userId});
        if(!wishlist){
            return res.status(400).json({message:"Your Whishlist is empty"});
        }
        wishlist.products=[];
        await wishlist.save();
        return res.status(200).json({message:"All items are removed successfully"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error deleting product from wishlist" });
    }
    
}

module.exports={addToWishlist,clearWishlist,removeFromWhislist,getWishlist}