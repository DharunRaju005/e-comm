const express = require('express');
const { makePayment, webHook,getPayment } = require('../controllers/paymentController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(express.json()); 
router.post("/proceedToPay", verifyToken, makePayment);
router.post("/webhook", bodyParser.raw({ type: 'application/json' }), webHook);
router.get("/",verifyToken,getPayment);

module.exports = router;
