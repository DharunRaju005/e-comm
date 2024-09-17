---

# E-Commerce Platform (Backend)

This is the backend server for an e-commerce platform built with Node.js, Express, and MongoDB. The project handles user authentication, product management, cart management, orders, payments, and wishlist features.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [License](#license)

## Features

- **User Authentication**: Signup, login, logout, and profile management.
- **Product Management**: Add, update, delete products with support for categories and images.
- **Cart Management**: Add, edit, and remove items from the cart.
- **Order Management**: Place orders and view order history.
- **Payment Processing**: Handle payments via integrated payment gateway.
- **Wishlist**: Add and remove products to/from the wishlist.
- **Analytics**: Get analytics for merchants on their products.
- **Comments and Ratings**: Users can leave comments and ratings on products.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Stripe
- **File Storage**: Firebase for image storage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DharunRaju005/e-comm.git
   cd e-comm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_jwt_secret

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=your_firebase_auth_uri
FIREBASE_TOKEN_URI=your_firebase_token_uri
FIREBASE_AUTH_PROVIDER_CERT=your_firebase_auth_provider_cert
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_CERT_URL=your_firebase_client_cert_url
FIREBASE_PRIVATE_KEY=your_firebase_private_key

```

## Usage

The backend server can be accessed at:  
**Live URL**: [https://e-comm-5-93iv.onrender.com](https://e-comm-5-93iv.onrender.com)

You can interact with the API using Postman or similar API testing tools since there is **no frontend available at the moment**. A frontend will be developed in future iterations.

## API Endpoints

### User Routes

- **POST** `/signup` - User registration.
- **POST** `/login` - User login.
- **POST** `/logout` - User logout (requires token).
- **POST** `/profile` - Edit user profile (requires token).

### Product Routes

- **POST** `/product` - Add a new product (requires token).
- **GET** `/product` - Get all products.
- **GET** `/product/id/:id` - Get a product by ID.
- **POST** `/product/:id/comment` - Add a comment to a product (requires token).
- **PUT** `/product/:id/comment` - Update a comment (requires token).
- **DELETE** `/product/:id/comment` - Delete a comment (requires token).

### Cart Routes

- **GET** `/cart` - View cart (requires token).
- **POST** `/cart/:id` - Add product to cart (requires token).
- **PUT** `/cart` - Edit cart (requires token).

### Payment Routes

- **POST** `/payment/proceedToPay` - Proceed to payment (requires token).
- **POST** `/payment/webhook` - Stripe webhook for payment events.

### Order Routes

- **GET** `/order` - View user orders (requires token).

### Wishlist Routes

- **GET** `/wishlist` - View wishlist (requires token).
- **POST** `/wishlist/:productId` - Add product to wishlist (requires token).
- **DELETE** `/wishlist/:productId` - Remove product from wishlist (requires token).

## Testing

You can only test the server using **Postman** or similar API testing tools because there is no proper frontend developed yet. In future iterations, a frontend will be added to provide a complete user experience.

To test the endpoints:

1. Open Postman or any API testing service.
2. Use the **Live URL** `https://e-comm-5-93iv.onrender.com` as the base URL for the API.
3. Make API requests to the various routes described above.

## License

This project is licensed under the [MIT License](./LICENSE).

---
