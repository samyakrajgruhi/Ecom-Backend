import express from 'express';
import { sequelize, Product, DeliveryOption, CartItem, Order } from '../models/index.js';
import defaultProducts from '../defaultData/defaultProducts.js';
import defaultDeliveryOptions from '../defaultData/defaultDeliveryOptions.js';
import defaultCart from '../defaultData/defaultCart.js';
import defaultOrders from '../defaultData/defaultOrders.js';

const router = express.Router();

// Reset database
router.post("/", async (req, res) => {
  try {
    console.log("Resetting database...");
    
    // Drop and recreate all tables in a single operation
    await sequelize.sync({ force: true });
    console.log("Database reset successful - all tables dropped and recreated");
    
    // Reload default data
    console.log("Loading default data after reset...");
    
    // Load default products
    try {
      await Product.bulkCreate(defaultProducts);
      console.log('Successfully loaded default products.');
    } catch (error) {
      console.error('Error loading default products:', error);
    }
    
    // Load default delivery options
    try {
      await DeliveryOption.bulkCreate(defaultDeliveryOptions);
      console.log('Successfully loaded default delivery options.');
    } catch (error) {
      console.error('Error loading default delivery options:', error);
    }
    
    // Load default cart items
    try {
      await CartItem.bulkCreate(defaultCart);
      console.log('Successfully loaded default cart items.');
    } catch (error) {
      console.error('Error loading default cart items:', error);
    }
    
    // Load default orders
    try {
      await Order.bulkCreate(defaultOrders);
      console.log('Successfully loaded default orders.');
    } catch (error) {
      console.error('Error loading default orders:', error);
    }
    
    return res.status(200).json({ 
      message: 'Database reset successfully with default data loaded',
      stats: {
        products: await Product.count(),
        deliveryOptions: await DeliveryOption.count(),
        cartItems: await CartItem.count(),
        orders: await Order.count()
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to reset database', details: error.message });
  }
});

export default router;
