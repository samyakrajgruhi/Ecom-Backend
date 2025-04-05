import express from 'express';
import { DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get all delivery options
router.get("/", async (req, res) => {
  try {
    const { expand } = req.query;
    const deliveryOptions = await DeliveryOption.findAll();
    
    // If expand=estimatedDeliveryTime parameter is present
    if (expand === 'estimatedDeliveryTime') {
      const currentTime = Date.now();
      
      // Add estimated delivery time in milliseconds for each option
      deliveryOptions.forEach(option => {
        const deliveryDays = option.deliveryDays;
        // Calculate milliseconds: days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
        const deliveryTimeMs = currentTime + (deliveryDays * 24 * 60 * 60 * 1000);
        option.setDataValue('estimatedDeliveryTimeMs', deliveryTimeMs);
      });
    }
    
    res.json(deliveryOptions);
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    res.status(500).json({ error: 'Failed to fetch delivery options' });
  }
});

export default router;
