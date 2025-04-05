/* eslint-disable node/no-unsupported-features/es-syntax */
import express from "express";
import { Product, DeliveryOption, CartItem, Order, syncDatabase } from "./models/index.js";
import defaultProducts from "./defaultData/defaultProducts.js";
import defaultDeliveryOptions from "./defaultData/defaultDeliveryOptions.js";
import defaultCart from "./defaultData/defaultCart.js";
import defaultOrders from "./defaultData/defaultOrders.js"; // Use the new defaultOrders.js file

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

  // Check if orders exist in the database
  const orderCount = await Order.count();
  if (orderCount === 0) {
    console.log('No orders found in database. Loading default orders...');
    try {
      await Order.bulkCreate(defaultOrders);
      console.log('Successfully loaded default orders.');
    } catch (error) {
      console.error('Error loading default orders:', error);
    }
  } else {
    console.log(`Database already contains ${orderCount} orders.`);
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
        return res.status(200).json(cartItems);
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

  // DELETE endpoint to remove an item from cart
  app.delete("/cart-items/:productId", async (req, res) => {
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

  // Add a new API route for orders
  app.get("/orders", async (req, res) => {
    try {
      const { expand } = req.query;

      // Fetch all orders
      const orders = await Order.findAll();

      // If expand=product is specified, include product details
      if (expand === "product") {
        const productIds = new Set();
        orders.forEach(order => {
          order.products.forEach(product => productIds.add(product.productId));
        });

        // Fetch product details for all productIds in the orders
        const products = await Product.findAll({
          where: { id: Array.from(productIds) },
          attributes: ["id", "name", "image", "priceCents", "rating", "keywords"]
        });

        const productMap = {};
        products.forEach(product => {
          productMap[product.id] = product;
        });

        // Add product details to each product in the orders
        orders.forEach(order => {
          order.products = order.products.map(product => ({
            ...product,
            product: productMap[product.productId] || null
          }));
        });
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to fetch orders", details: error.message });
    }
  });

  // Add a new API route for creating an order
  app.post("/orders", async (req, res) => {
    try {
      const { cart } = req.body;

      // Validate the cart
      if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "Cart must be a non-empty array" });
      }

      // Log delivery options for debugging
      const allDeliveryOptions = await DeliveryOption.findAll();
      console.log("Available delivery options:", allDeliveryOptions.map(opt => opt.id));

      // Fetch all products and delivery options for validation and cost calculation
      const productIds = cart.map(item => item.productId);
      const products = await Product.findAll({
        where: { id: productIds }
      });
      const deliveryOptions = await DeliveryOption.findAll();

      // Create maps for quick lookup
      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });

      const deliveryOptionMap = {};
      deliveryOptions.forEach(option => {
        deliveryOptionMap[option.id] = option;
      });

      // Validate each cart item and calculate the total cost
      let totalCostCents = 0;
      let validatedCart = [];

      for (const item of cart) {
        const { productId, quantity, deliveryOptionId } = item;

        // Validate productId
        const product = productMap[productId];
        if (!product) {
          return res.status(400).json({ error: `Invalid productId: ${productId}` });
        }

        // Validate quantity
        if (!quantity || quantity < 1 || quantity > 10) {
          return res.status(400).json({ error: `Invalid quantity for productId: ${productId}` });
        }

        // Validate deliveryOptionId
        const deliveryOption = deliveryOptionMap[deliveryOptionId];
        if (!deliveryOption) {
          return res.status(400).json({ 
            error: `Invalid deliveryOptionId: ${deliveryOptionId}`,
            availableOptions: Object.keys(deliveryOptionMap)
          });
        }

        // Calculate cost for this cart item
        const productCost = product.priceCents * quantity;
        const shippingCost = deliveryOption.priceCents;
        totalCostCents += productCost + shippingCost;

        // Add to validated cart with delivery date calculation
        const currentDate = new Date();
        const deliveryDate = new Date(currentDate);
        deliveryDate.setDate(deliveryDate.getDate() + deliveryOption.deliveryDays);
        
        validatedCart.push({
          productId,
          quantity,
          estimatedDeliveryTimeMs: deliveryDate.getTime()
        });
      }

      // Add 10% tax
      totalCostCents = Math.round(totalCostCents * 1.1);

      // Generate a UUID for the order
      const orderId = crypto.randomUUID ? crypto.randomUUID() : 
        'order-' + Math.random().toString(36).substr(2, 9);

      // Create the order
      const newOrder = await Order.create({
        id: orderId,
        orderTimeMs: Date.now(),
        totalCostCents,
        products: validatedCart
      });

      await CartItem.destroy({where:{}});
      res.status(201).json(newOrder);

    } catch (error) {
      console.error("Error creating order:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to create order", details: error.message });
    }
  });

  // Add a DELETE API route for orders
  app.delete("/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the order by ID
      const order = await Order.findByPk(id);
      
      // Check if order exists
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Delete the order
      await order.destroy();
      
      // Return success response
      return res.status(200).json({ 
        message: 'Order deleted successfully',
        orderId: id 
      });
    } catch (error) {
      console.error('Error deleting order:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Failed to delete order', details: error.message });
    }
  });

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Images can be accessed at http://localhost:${PORT}/images/`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error.message);
  console.error('Stack trace:', error.stack);
});