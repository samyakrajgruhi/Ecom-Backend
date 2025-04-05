import express from 'express';
import { Product } from '../models/index.js';

const router = express.Router();

// Helper function to calculate Levenshtein distance (edit distance) for fuzzy search
function levenshteinDistance(a, b) {
  // Create a matrix of size (a.length+1) x (b.length+1)
  const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  
  // Initialize the matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
}

// Helper function to determine if two strings are similar enough
function isFuzzyMatch(str1, str2, threshold = 0.7) {
  if (!str1 || !str2) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact substring match is always a match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // For very short search terms, be more lenient
  if (s2.length <= 3) {
    return s1.includes(s2);
  }
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  
  // Calculate similarity ratio based on the longer string length
  const maxLength = Math.max(s1.length, s2.length);
  const similarityRatio = 1 - distance / maxLength;
  
  return similarityRatio >= threshold;
}

// Get all products
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    
    if (search) {
      // Get all products first
      const allProducts = await Product.findAll();
      
      // Filter products with fuzzy search
      const filteredProducts = allProducts.filter(product => {
        // Check if product name fuzzy matches search term
        const nameMatch = isFuzzyMatch(product.name, search);
        
        // Check if any keyword fuzzy matches search term
        const keywordMatch = product.keywords.some(keyword => 
          isFuzzyMatch(keyword, search)
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
