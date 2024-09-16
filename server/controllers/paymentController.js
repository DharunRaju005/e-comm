const Cart = require('../models/cart');
const Payment = require('../models/payment');
const Order = require('../models/order');
const Product = require('../models/product');
const Analytics=require('../models/analytics');
const { sendEmail } = require('../utils/emailService');
const {sendInvoice}=require('../utils/sendInvoice')
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');
const axios=require('axios');

dotenv.config();
// stripe listen --forward-to localhost:5000/payment/webhook

const stripe = require('stripe')(STRIPE_SECRET_KEY);

const makePayment = async (req, res) => {
    const userId = req.user.id;
    const { shippingAddress } = req.body;
    console.log(req.headers);
    const sig = req.headers['stripe-signature']; console.log("line168",sig);
    
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) return res.status(400).json({ message: "No products are in the cart" });

        const lineItems = cart.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.name,
                    description: item.product.description || ''
                },
                unit_amount: item.product.price * 100,
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: "http://localhost:5000/success",
            cancel_url: "http://localhost:5000/cancel",
            shipping_address_collection: {
                allowed_countries: ['IN', 'US']
            },
            metadata: {
                userId: userId,
                shippingAddress: JSON.stringify(shippingAddress)
            }
        });
        console.log("line 50",session);
        return res.status(200).json({ id: session.id });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

async function generateInvoicePDF(items, session) {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        try {
            // Fetch the logo image from the internet
            const response = await axios.get('https://lh3.googleusercontent.com/p/AF1QipNLfXxjj5MX0CSy4CbUeyyog6elpx_dhIwIO7E=s680-w680-h510', { responseType: 'arraybuffer' });
            const logo = Buffer.from(response.data, 'binary');

            // Add the logo image to the document
            doc.image(logo, 50, 45, { width: 50 });
        } catch (error) {
            console.error('Error fetching logo:', error.message);
            // Proceed without the logo if there's an error
        }

        // Header with company information
        doc.font('Helvetica') // Set to normal font
           .fontSize(20)
           .text('DR&Co', 110, 57)
           .fontSize(10)
           .text('Peelamedu', 200, 65, { align: 'right' })
           .text('Coimbatore, TN-625218', 200, 80, { align: 'right' })
           .moveDown();

        // Invoice title
        doc.fontSize(20)
           .text('INVOICE', { align: 'left' })
           .moveDown();

        // Invoice details
        doc.fontSize(12)
           .text(`Invoice Number:${session.id}`,50, doc.y, { align: 'left' })
           .text(`Date: ${new Date().toLocaleDateString()}`,50, doc.y, { align: 'left' })
           .moveDown();

        // Customer details
        doc.font('Helvetica-Bold') // Set font to bold for "Billed To"
           .text('Billed To:', 50, doc.y)
           .font('Helvetica') // Revert to normal font
           .text(`Name: ${session.customer_details.name}`, 50, doc.y + 15)
           .text(`Email: ${session.customer_details.email}`, 50, doc.y + 17)
           .moveDown();

        // Table Headers
        const tableTop = doc.y + 20; // Define the top position of the table
        doc.font('Helvetica-Bold') // Bold font for headers
           .fontSize(15)
           .text('Item', 50, tableTop, { align: 'left' })
           .text('Quantity', 250, tableTop, { align: 'left' })
           .text('Price', 350, tableTop, { align: 'left' })
           .text('Total', 450, tableTop, { align: 'left' });

        // Draw a line below the table headers
        doc.moveTo(50, tableTop + 20)
           .lineTo(550, tableTop + 20)
           .stroke();

        // Items Section
        let position = tableTop + 25; // Starting y position for items
        doc.font('Helvetica') // Revert to normal font for items
           .fontSize(12);

        items.forEach((item) => {
            const total = (item.quantity * item.product.price).toFixed(2);

            doc.text(item.product.name, 50, position, { width: 200, align: 'left' })
               .text(item.quantity, 250, position, { width: 50, align: 'left' })
               .text(`${item.product.price} USD`, 350, position, { width: 100, align: 'left' })
               .text(`${total} USD`, 450, position, { width: 100, align: 'left' });

            position += 20; // Move to the next line
        });

        // Draw a line above the total
        doc.moveTo(50, position + 5)
           .lineTo(550, position + 5)
           .stroke();

        // Total Amount
        doc.font('Helvetica-Bold') // Bold font for "Total:"
   .fontSize(15)
   .text('Total:', 400, position + 10, { align: 'left' }) // Position and align "Total:"

   .font('Helvetica') // Normal font for the amount
   .text(`${(session.amount_total / 100).toFixed(2)} USD`, 450, position + 10, { align: 'left' }) // Position and align the amount
   .moveDown();


        // Footer with a thank you message
        const pageHeight = doc.page.height;
        const contentHeight = doc.y;
        const remainingHeight = pageHeight - contentHeight;
        const footerPosition = contentHeight + remainingHeight / 2;

        doc.y = footerPosition;
        doc.x = 50; // Reset x position to the left margin

        doc.fontSize(12)
           .text('Thank you for your business!', { align: 'center' })
           .moveDown();

        doc.end();
    });
}

const webHook = async (req, res) => {
    const sig = req.headers['stripe-signature']; console.log("line168",sig);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // console.log("line170",endpointSecret);
    
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // console.log("hello");
            
            console.log(session);

            // Get the cart
            const cart = await Cart.findOne({ user: session.metadata.userId })
    .populate({
        path: 'items.product',
        populate: {
            path: 'merchant', // This will populate the merchant field
            select: '_id name', // Select specific fields from the User model, like _id and name
        }
    });

            if (!cart) return res.status(204).json({ message: "Your Cart is empty" });

            let customerId = session.customer; // Use customer ID from Stripe session
            if (!customerId) {
                // Create a new customer if none exists
                const customer = await stripe.customers.create({
                    email: session.customer_details.email,
                    name: session.customer_details.name,
                    address: session.customer_details.address,
                });
                customerId = customer.id;
            }

            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);

            // Create the order
            const order = await Order.create({
                user: session.metadata.userId,
                items: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                totalPrice: session.amount_total / 100,
                shippingAddress: session.shipping_details.address || '',
                deliveryDate: deliveryDate,
            });

            // Create a payment record
            await Payment.create({
                user: session.metadata.userId,
                paymentId: session.id,
                order: order._id,
                paymentMethod: session.payment_method_types[0],
                amount: session.amount_total / 100,
                status: 'completed',
                address: session.shipping_details.address || '',
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: session.payment_intent
            });

            // Clear the cart
            await Cart.deleteOne({ user: session.metadata.userId });

// Update product stock and log analytics data
await Promise.all(
    cart.items.map(async item => {
        try {
            // Update stock for the product
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
            );
            console.log(`Stock updated for product ID: ${item.product._id}`);

            await Analytics.create({
                eventType: 'payment',
                merchantId: item.product.merchant._id,
                userId: session.metadata.userId,
                productId: item.product._id,
                timestamp: new Date(),
                paymentDetails: {
                    amount: item.quantity * item.product.price, // Track individual product's price
                    currency: session.currency || 'usd'
                },
                quantitySold: item.quantity // Track quantity sold
            });
            
            console.log(`Analytics created for product ID: ${item.product._id}`);
            
        } catch (err) {
            console.error(`Error processing product ID: ${item.product._id}`, err.message);
        }
    })
);


            // Finalize the order
            await Order.findByIdAndUpdate(order._id, { status: 'completed' });

            for (const item of cart.items) {
                await stripe.invoiceItems.create({
                    customer: customerId,
                    amount: item.quantity * item.product.price * 100,
                    currency: 'usd',
                    description: item.product.name,
                });
            }

            const invoiceItems = cart.items.map(item => ({
                description: item.product.name,
                amount: item.product.price * item.quantity
            }));
            const invoiceBuffer = await generateInvoicePDF(cart.items, session);
            const invoiceUrl = await sendInvoice(session.customer_details.email, invoiceItems);

            const emailText = `
                Dear ${session.customer_details.name},

                Thank you for your purchase! Your order has been successfully placed.

                Order ID: ${session.id}
                Total Price: ${session.amount_total / 100} USD
                Delivery Date: ${deliveryDate.toDateString()}

                Products:
                ${cart.items.map(item => `- ${item.product.name} x ${item.quantity}`).join('\n')}

                Shipping Address:
                ${session.shipping_details.address.line1}
                ${session.shipping_details.address.line2 || ''}
                ${session.shipping_details.address.city}, ${session.shipping_details.address.state} ${session.shipping_details.address.postal_code}
                ${session.shipping_details.address.country}

                An invoice has been generated for your purchase. You can view it [here](${invoiceUrl}).

                Thank you for shopping with us!

                Best regards,
                DR&Co
            `;

            await sendEmail(session.customer_details.email, 'Order Confirmation and Invoice', emailText, invoiceBuffer);

            return res.status(200).json({ message: "Payment successful and order placed" });
        } else {
            return res.status(400).json({ message: "Unhandled event type" });
        }
    } catch (err) {
        console.error('Error handling webhook event:', err.message);
        return res.status(500).json({ message: err.message });
    }
};


const getPayment=async(req,res)=>{
    const userId=req.user.userId;
    try{
        const payment=await Payment.find({user:userId});
        if(!payment) return res.status(401).json({message:"No Didn't purchased anything!!!"})
            console.log(payment);
        return res.status(200).json(payment);
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

module.exports = { makePayment, webHook,getPayment };
