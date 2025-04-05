import express from 'express';
import { CartItem, Product, DeliveryOption } from '../models/index.js';

const router = express.Router();

// Get all cart items
router.get("/", async (req, res) => {
  try {
    const { expand } = req.query;
    let queryOptions = {};

    // Check if expand=product is specified in the query
    if (expand === 'product') {
      queryOptions.include = [
        {
          model: Product,
          attributes: ['id', 'name', 'image', 'priceCents', 'rating', 'keywords']
        }
      ];
    }

    const cartItems = await CartItem.findAll(queryOptions);

    if (cartItems.length === 0) {
      return res.status(200).json(cartItems);
    }

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add item to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Validate quantity
    const parsedQuantity = parseInt(quantity) || 1;
    if (parsedQuantity < 1 || parsedQuantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
    }

    // Check if product exists in database
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product already exists in cart
    let cartItem = await CartItem.findOne({
      where: { productId }
    });

    if (cartItem) {
      // Product already in cart, update quantity (but don't exceed 10)
      const newQuantity = Math.min(cartItem.quantity + parsedQuantity, 10);
      
      await cartItem.update({ quantity: newQuantity });
      
      return res.status(200).json({
        cartItem
      });
    } else {
      // Product not in cart, add new item with default delivery option
      cartItem = await CartItem.create({
        productId,
        quantity: parsedQuantity,
        deliveryOptionId: "1" // Default delivery option
      });

      return res.status(201).json({
        cartItem
      });
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item
router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;
    
    // Find the cart item
    const cartItem = await CartItem.findOne({
      where: { productId }
    });
    
    // Check if cart item exists
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    
    // Prepare update object
    const updateData = {};
    
    // Validate and add quantity if provided
    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ error: 'Quantity must be between a number greater than 0' });
      }
      updateData.quantity = parsedQuantity;
    }
    
    // Validate and add deliveryOptionId if provided
    if (deliveryOptionId !== undefined) {
      // Check if delivery option exists
      const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
      if (!deliveryOption) {
        return res.status(400).json({ error: 'Invalid delivery option' });
      }
      updateData.deliveryOptionId = deliveryOptionId;
    }
    
    // If no update data was provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid update data provided' });
    }
    
    // Update the cart item
    await cartItem.update(updateData);
    
    // Return the updated cart item
    return res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Delete cart item
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the cart item
    const cartItem = await CartItem.findOne({
      where: { productId }
    });
    
    // Check if cart item exists
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    
    // Delete the cart item
    await cartItem.destroy();
    
    // Return success response
    return res.status(200).json({ 
      message: 'Product removed from cart',
      productId 
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

export default router;
