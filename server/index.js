const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const makeConnection = require("./config/db");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const paymentRoute = require("./routes/paymentRoute");
const orderRoute = require("./routes/orderRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const analyticsRoute=require("./routes/analyticsRoute")
const verifyToken=require("./middleware/verifyToken")

dotenv.config();
const app = express();
makeConnection();

app.use(cookieParser());
// app.use(
//   bodyParser.json({
//     verify: (req, res, buf) => {
//       if (req.originalUrl.startsWith('/payment/webhook')) {
//         req.rawBody = buf.toString();
//       }
//     },
//   })
// );

// Middleware to handle raw body for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/payment/webhook')) {
    // Capture raw body for webhook verification
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);  // Apply express.json() for other routes
  }
});
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/success", (req, res) => {
  return res.status(200).json({ message: "successful" });
});
app.get("/cancel", (req, res) => {
  return res.status(200).json({ message: "payment Failed" });
});

app.use("/", userRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/payment", paymentRoute);
app.use("/order",verifyToken,orderRoute);
app.use("/wishlist",verifyToken,wishlistRoute);
app.use("/analytics",verifyToken,analyticsRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
