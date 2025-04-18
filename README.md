![Ecom-Backend](https://socialify.git.ci/samyakrajgruhi/Ecom-Backend/image?font=Raleway&language=1&name=1&owner=1&pattern=Transparent&theme=Dark)

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
All API routes are prefixed with `/api` except for image assets which are available directly at `/images`.

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products?search=query` | Search products by name or keywords with fuzzy matching |
| GET | `/api/products/:id` | Get a specific product by ID |

#### Product Search Features
The search functionality includes fuzzy matching, which means:
- It finds exact and partial matches in product names and keywords
- It's forgiving of typos and misspellings (e.g., "bsktball" will match "basketball")
- It's case-insensitive

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart-items` | Get all items in cart (use `?expand=product` for product details) |
| POST | `/api/cart-items` | Add product to cart |
| PUT | `/api/cart-items/:productId` | Update cart item (quantity or delivery option) |
| DELETE | `/api/cart-items/:productId` | Remove item from cart |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment-summary` | Get detailed cost breakdown of current cart |

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
| GET | `/api/orders` | Get all orders (use `?expand=product` for product details) |
| GET | `/api/orders/:id` | Get a specific order (use `?expand=products` for product details) |
| POST | `/api/orders` | Create a new order from cart (automatically empties cart) |
| DELETE | `/api/orders/:id` | Cancel/delete an order |

### Shipping Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery-options` | Get all available shipping methods |
| GET | `/api/delivery-options?expand=estimatedDeliveryTime` | Get shipping methods with estimated delivery times |

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
| POST | `/api/reset` | Reset database to default state (caution: deletes all data) |

## Quick Start Guide

This sequence demonstrates a typical checkout flow:

1. **Browse products**
   ```
   GET /api/products
   ```

2. **Search for products**
   ```
   GET /api/products?search=basketball
   ```

3. **Add item to cart**
   ```
   POST /api/cart-items
   {"productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6", "quantity": 2}
   ```

4. **Check payment summary**
   ```
   GET /api/payment-summary
   ```

5. **Get delivery options with estimated times**
   ```
   GET /api/delivery-options?expand=estimatedDeliveryTime
   ```

6. **Update delivery option**
   ```
   PUT /api/cart-items/e43638ce-6aa0-4b85-b27f-e1d07eb678c6
   {"deliveryOptionId": "2"}
   ```

7. **Place an order**
   ```
   POST /api/orders
   {"cart": [{"productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6", "quantity": 2, "deliveryOptionId": "1"}]}
   ```

8. **Check order status**
   ```
   GET /api/orders
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
