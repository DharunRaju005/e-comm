const Analytics=require("../models/analytics")
const mongoose=require("mongoose")
const getMerchantAnalytics = async (req, res) => {
    try {
        const merchantId = req.user.id;

        // Use 'new mongoose.Types.ObjectId()' to create the ObjectId
        const analytics = await Analytics.aggregate([
            { $match: { merchantId: new mongoose.Types.ObjectId(merchantId) } }, // Fix here
            {
                $group: {
                    _id: '$productId',
                    totalSold: { $sum: '$quantitySold' },
                    totalProfit: { $sum: '$paymentDetails.amount' },
                    productId: { $first: '$productId' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    productName: '$product.name',
                    totalSold: 1,
                    totalProfit: 1
                }
            }
        ]);

        res.status(200).json({data:analytics});
    } catch (err) {
        console.error('Error fetching merchant analytics:', err.message);
        res.status(500).json({ message: err.message });
    }
};
module.exports={getMerchantAnalytics}
