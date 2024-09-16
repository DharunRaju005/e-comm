const express=require('express');
const { addToWishlist, getWishlist, removeFromWhislist, clearWishlist } = require('../controllers/wishlistController');
const router=express.Router();


router.get("/",getWishlist);
router.post("/:productId",addToWishlist);
router.delete("/:productId",removeFromWhislist);
router.delete("/",clearWishlist);

module.exports=router;