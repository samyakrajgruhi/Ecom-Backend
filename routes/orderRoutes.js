/* eslint-disable node/no-unsupported-features/es-syntax */
import express from 'express';
import { Order, Product, CartItem, DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const { expand } = req.query;

    // Fetch all orders
    const orders = await Order.findAll();

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
    const { cart } = req.body;

    // Validate the cart
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart must be a non-empty array" });
    }

    // Log delivery options for debugging
    const allDeliveryOptions = await DeliveryOption.findAll();
    console.log("Available delivery options:", allDeliveryOptions.map(opt => opt.id));

    // Fetch all products and delivery options for validation and cost calculation
    const productIds = cart.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds }
    });
    const deliveryOptions = await DeliveryOption.findAll();

    // Create maps for quick lookup
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });

    const deliveryOptionMap = {};
    deliveryOptions.forEach(option => {
      deliveryOptionMap[option.id] = option;
    });

    // Validate each cart item and calculate the total cost
    let totalCostCents = 0;
    let validatedCart = [];

    for (const item of cart) {
      const { productId, quantity, deliveryOptionId } = item;

      // Validate productId
      const product = productMap[productId];
      if (!product) {
        return res.status(400).json({ error: `Invalid productId: ${productId}` });
      }

      // Validate quantity
      if (!quantity || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: `Invalid quantity for productId: ${productId}` });
      }

      // Validate deliveryOptionId
      const deliveryOption = deliveryOptionMap[deliveryOptionId];
      if (!deliveryOption) {
        return res.status(400).json({ 
          error: `Invalid deliveryOptionId: ${deliveryOptionId}`,
          availableOptions: Object.keys(deliveryOptionMap)
        });
      }

      // Calculate cost for this cart item
      const productCost = product.priceCents * quantity;
      const shippingCost = deliveryOption.priceCents;
      totalCostCents += productCost + shippingCost;

      // Add to validated cart with delivery date calculation
      const currentDate = new Date();
      const deliveryDate = new Date(currentDate);
      deliveryDate.setDate(deliveryDate.getDate() + deliveryOption.deliveryDays);
      
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
