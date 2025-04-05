# E-Commerce API

A robust RESTful API for an e-commerce platform, built with Express.js and Sequelize.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Product Endpoints](#product-endpoints)
  - [Cart Endpoints](#cart-endpoints)
  - [Payment Endpoints](#payment-endpoints)
  - [Order Endpoints](#order-endpoints)
  - [Shipping Endpoints](#shipping-endpoints)
  - [Utility Endpoints](#utility-endpoints)
- [Quick Start Guide](#quick-start-guide)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ecom-back-end.git
cd ecom-back-end

# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Start the server
node server.js
```

The server will start on port 3000 by default: http://localhost:3000

## API Documentation

All endpoints return responses in JSON format. Most errors return appropriate HTTP status codes with error messages.

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get a specific product by ID |

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart-items` | Get all items in cart (use `?expand=product` for product details) |
| POST | `/cart-items` | Add product to cart |
| PUT | `/cart-items/:productId` | Update cart item (quantity or delivery option) |
| DELETE | `/cart-items/:productId` | Remove item from cart |

#### Adding to Cart Example:
```json
POST /cart-items
{
  "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
  "quantity": 2
}
```

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payment-summary` | Get detailed cost breakdown of current cart |

#### Payment Summary Response Example:
```json
{
  "totalItems": 3,
  "productCostCents": 4285,
  "shippingCostCents": 499,
  "subtotalCents": 4784,
  "taxCents": 478,
  "totalCents": 5262
}
```

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders (use `?expand=product` for product details) |
| GET | `/orders/:id` | Get a specific order (use `?expand=products` for product details) |
| POST | `/orders` | Create a new order from cart (automatically empties cart) |
| DELETE | `/orders/:id` | Cancel/delete an order |

#### Creating Order Example:
```json
POST /orders
{
  "cart": [
    {
      "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      "quantity": 2,
      "deliveryOptionId": "1"
    }
  ]
}
```

### Shipping Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery-options` | Get all available shipping methods |
| GET | `/delivery-options?expand=estimatedDeliveryTime` | Get shipping methods with estimated delivery times |

#### Estimated Delivery Time:
When using the `expand=estimatedDeliveryTime` parameter, each delivery option will include an additional field:
- `estimatedDeliveryTimeMs`: Timestamp in milliseconds when the delivery is expected (based on current time + delivery days)

Example response:
```json
[
  {
    "id": "1",
    "deliveryDays": 7,
    "priceCents": 0,
    "estimatedDeliveryTimeMs": 1692458765432
  },
  {
    "id": "2",
    "deliveryDays": 3,
    "priceCents": 499,
    "estimatedDeliveryTimeMs": 1692199565432
  }
]
```

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reset` | Reset database to default state (caution: deletes all data) |

## Quick Start Guide

This sequence demonstrates a typical checkout flow:

1. **Browse products**
   ```
   GET /products
   ```

2. **Add item to cart**
   ```
   POST /cart-items
   {"productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6", "quantity": 2}
   ```

3. **Check payment summary**
   ```
   GET /payment-summary
   ```

4. **Update delivery option**
   ```
   PUT /cart-items/e43638ce-6aa0-4b85-b27f-e1d07eb678c6
   {"deliveryOptionId": "2"}
   ```

5. **Place an order**
   ```
   POST /orders
   {"cart": [{"productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6", "quantity": 2, "deliveryOptionId": "1"}]}
   ```

6. **Check order status**
   ```
   GET /orders
   ```

## Project Structure

```
ecom-back-end/
├── defaultData/         # Default data for database initialization
├── models/              # Sequelize models
├── routes/              # Express route handlers
├── images/              # Product images
├── server.js            # Main application entry point
└── README.md            # This documentation
```

## License

This project is licensed under the MIT License.
