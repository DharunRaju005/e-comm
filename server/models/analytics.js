const mongoose=require("mongoose");
const analyticsSchema = new mongoose.Schema({
    eventType: { type: String, required: true }, // e.g., 'payment'
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Buyer
    timestamp: { type: Date, default: Date.now },
    paymentDetails: {
        amount: { type: Number, required: true }, // Total amount paid
        currency: { type: String, required: true }
    },
    quantitySold: { type: Number, required: true }, // How many items were sold
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
