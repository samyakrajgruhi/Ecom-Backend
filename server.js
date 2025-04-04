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
        return res.status(200).json({ message: 'No items in cart', items: [] });
      }

      res.status(200).json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: 'Failed to fetch cart items' });
    }
  });

  // POST endpoint to add item to cart
  app.post("/cart-items", async (req, res) => {
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

  // PUT endpoint to update a cart item
  app.put("/cart-items/:productId", async (req, res) => {
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
        if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10) {
          return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
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

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Images can be accessed at http://localhost:${PORT}/images/`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});