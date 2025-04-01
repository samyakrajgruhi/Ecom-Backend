import express from "express";
import { Product, DeliveryOption, CartItem, syncDatabase } from "./models/index.js";
import defaultProducts from "./defaultData/defaultProducts.js";
import defaultDeliveryOptions from "./defaultData/defaultDeliveryOptions.js";
import defaultCart from "./defaultData/defaultCart.js";
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());

// Serve static files from the images directory
app.use('/images', express.static('images'));

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

  // Check if delivery options exist in the database
  const deliveryOptionCount = await DeliveryOption.count();
  
  // If no delivery options exist, load the default delivery options
  if (deliveryOptionCount === 0) {
    console.log('No delivery options found in database. Loading default delivery options...');
    try {
      await DeliveryOption.bulkCreate(defaultDeliveryOptions);
      console.log('Successfully loaded default delivery options.');
    } catch (error) {
      console.error('Error loading default delivery options:', error);
    }
  } else {
    console.log(`Database already contains ${deliveryOptionCount} delivery options.`);
  }

  // Check if cart items exist in the database
  const cartItemCount = await CartItem.count();
  
  // If no cart items exist, load the default cart items
  if (cartItemCount === 0) {
    console.log('No cart items found in database. Loading default cart items...');
    try {
      await CartItem.bulkCreate(defaultCart);
      console.log('Successfully loaded default cart items.');
    } catch (error) {
      console.error('Error loading default cart items:', error);
    }
  } else {
    console.log(`Database already contains ${cartItemCount} cart items.`);
  }
};

// Initialize database and start server
initializeData().then(() => {
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
  app.get("/products/:id", async (req, res) => {
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

  app.get("/delivery-options", async (req, res) => {
    try {
      const deliveryOptions = await DeliveryOption.findAll();
      res.json(deliveryOptions);
    } catch (error) {
      console.error('Error fetching delivery options:', error);
      res.status(500).json({ error: 'Failed to fetch delivery options' });
    }
  });

  // Add a new API route for cart items
  app.get("/cart-items", async (req, res) => {
    try {
      const cartItems = await CartItem.findAll();
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: 'Failed to fetch cart items' });
    }
  });

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Images can be accessed at http://localhost:${PORT}/images/`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});