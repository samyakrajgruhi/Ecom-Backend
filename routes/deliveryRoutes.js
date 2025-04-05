import express from 'express';
import { DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get all delivery options
router.get("/", async (req, res) => {
  try {
    const deliveryOptions = await DeliveryOption.findAll();
    res.json(deliveryOptions);
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    res.status(500).json({ error: 'Failed to fetch delivery options' });
  }
});

export default router;
