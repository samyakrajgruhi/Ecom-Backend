import express from "express";
import { Message, Product, syncDatabase } from "./models/index.js";
import defaultProducts from "./defaultData/defaultProducts.js";
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());

// Sync database and initialize with default data if needed
const initializeData = async () => {
  await syncDatabase();
  
  // Check if products exist in the database
  const productCount = await Product.count();
  
  // If no products exist, load the default products
  if (productCount === 0) {
    console.log('No products found in database. Loading default products...');
    try {
      await Product.bulkCreate(defaultProducts);
      console.log('Successfully loaded default products.');
    } catch (error) {
      console.error('Error loading default products:', error);
    }
  } else {
    console.log(`Database already contains ${productCount} products.`);
  }
};

// Initialize database and start server
initializeData().then(() => {
  // Message API Route
  app.get("/api/message", async (req, res) => {
    let message = await Message.findAll();
    let messages = message.map((message) => message.text);
    res.json(messages);
  });

  // Products API Route - Get all products
  app.get("/products", async (req, res) => {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Products API Route - Get product by ID
  app.get("/api/products/:id", async (req, res) => {
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

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});