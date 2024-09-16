const express=require("express");
const verifyToken = require('../middleware/verifyToken');
const {getMerchantAnalytics}=require('../controllers/analyticsController')
const router=express.Router();

router.get("/getAnalytics",getMerchantAnalytics);
module.exports=router;
