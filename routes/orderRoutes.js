/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import crypto from 'crypto';
import { Order, Product, CartItem, DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const { expand } = req.query;

    // Fetch all orders and sort by orderTimeMs in descending order (newest first)
    const orders = await Order.findAll({
      order: [['orderTimeMs', 'DESC']]
    });

    // If expand=product is specified, include product details
    if (expand === "product") {
      const productIds = new Set();
      orders.forEach(order => {
        order.products.forEach(product => productIds.add(product.productId));
      });

      // Fetch product details for all productIds in the orders
      const products = await Product.findAll({
        where: { id: Array.from(productIds) },
        attributes: ["id", "name", "image", "priceCents", "rating", "keywords"]
      });

      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });

      // Add product details to each product in the orders
      orders.forEach(order => {
        order.products = order.products.map(product => ({
          ...product,
          product: productMap[product.productId] || null
        }));
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { expand } = req.query;

    // Find the order by ID
    const order = await Order.findByPk(id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If expand=product is specified, include product details
    if (expand === "products") {
      const productIds = new Set();
      order.products.forEach(product => productIds.add(product.productId));

      // Fetch product details for all productIds in the order
      const products = await Product.findAll({
        where: { id: Array.from(productIds) },
        attributes: ["id", "name", "image", "priceCents", "rating", "keywords"]
      });

      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });

      // Add product details to each product in the order
      order.products = order.products.map(product => ({
        ...product,
        product: productMap[product.productId] || null
      }));
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to fetch order", details: error.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  try {
    // Fetch cart items from the database instead of using req.body
    const cartItems = await CartItem.findAll({
      include: [
        { model: Product, attributes: ['id', 'priceCents'] },
        { model: DeliveryOption, attributes: ['id', 'priceCents', 'deliveryDays'] }
      ]
    });

    // Check if cart is empty
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Please add items to cart before placing an order." });
    }

    // Calculate the total cost and prepare the order products
    let totalCostCents = 0;
    const validatedCart = [];

    for (const item of cartItems) {
      const productId = item.productId;
      const quantity = item.quantity;
      
      // Calculate cost for this cart item
      const productCost = item.Product.priceCents * quantity;
      const shippingCost = item.DeliveryOption.priceCents;
      totalCostCents += productCost + shippingCost;

      // Add to validated cart with delivery date calculation
      const currentDate = new Date();
      const deliveryDate = new Date(currentDate);
      deliveryDate.setDate(deliveryDate.getDate() + item.DeliveryOption.deliveryDays);
      
      validatedCart.push({
        productId,
        quantity,
        estimatedDeliveryTimeMs: deliveryDate.getTime()
      });
    }

    // Add 10% tax
    totalCostCents = Math.round(totalCostCents * 1.1);

    // Generate a UUID for the order
    const orderId = crypto.randomUUID ? crypto.randomUUID() : 
      'order-' + Math.random().toString(36).substr(2, 9);

    // Create the order
    const newOrder = await Order.create({
      id: orderId,
      orderTimeMs: Date.now(),
      totalCostCents,
      products: validatedCart
    });

    // Clear the cart after creating the order
    await CartItem.destroy({where:{}});
    
    res.status(201).json(newOrder);

  } catch (error) {
    console.error("Error creating order:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order by ID
    const order = await Order.findByPk(id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Delete the order
    await order.destroy();
    
    // Return success response
    return res.status(200).json({ 
      message: 'Order deleted successfully',
      orderId: id 
    });
  } catch (error) {
    console.error('Error deleting order:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

export default router;
