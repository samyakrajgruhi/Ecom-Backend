import express from 'express';
import { Product } from '../models/index.js';

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    
    if (search) {
      // Get all products first
      const allProducts = await Product.findAll();
      
      // Filter products in JavaScript where name or keywords match the search term
      const filteredProducts = allProducts.filter(product => {
        // Check if product name includes search term (case insensitive)
        const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
        
        // Check if any keyword in the array includes search term (case insensitive)
        const keywordMatch = product.keywords.some(keyword => 
          keyword.toLowerCase().includes(search.toLowerCase())
        );
        
        // Return true if either name or keywords match
        return nameMatch || keywordMatch;
      });
      
      res.json(filteredProducts);
    } else {
      // Return all products if no search parameter
      const products = await Product.findAll();
      res.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
