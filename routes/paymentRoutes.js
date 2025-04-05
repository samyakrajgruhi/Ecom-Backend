import express from 'express';
import { CartItem, Product, DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get payment summary
router.get("/", async (req, res) => {
  try {
    // Get all cart items with their associated products and delivery options
    const cartItems = await CartItem.findAll({
      include: [
        { model: Product, attributes: ['id', 'priceCents'] },
        { model: DeliveryOption, attributes: ['id', 'priceCents'] }
      ]
    });

    // Initialize counters
    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    // Calculate totals from cart items
    cartItems.forEach(item => {
      // Sum up quantities
      totalItems += item.quantity;
      
      // Calculate product cost (price * quantity)
      productCostCents += item.Product.priceCents * item.quantity;
      
      // Add shipping cost
      shippingCostCents += item.DeliveryOption.priceCents;
    });

    // Calculate subtotal, tax and total
    const subtotalCents = productCostCents + shippingCostCents;
    const taxCents = Math.round(subtotalCents * 0.1); // 10% tax
    const totalCents = subtotalCents + taxCents;

    // Return the payment summary
    res.json({
      totalItems,
      productCostCents,
      shippingCostCents,
      subtotalCents,
      taxCents,
      totalCents
    });
  } catch (error) {
    console.error('Error creating payment summary:', error);
    res.status(500).json({ error: 'Failed to create payment summary' });
  }
});

export default router;
