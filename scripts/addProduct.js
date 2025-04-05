/* eslint-disable no-process-exit */
import { Product, syncDatabase } from '../models/index.js';

// Define the new product you want to add
const newProduct = {
  id: crypto.randomUUID(), 
  image: "images/products/web-shooters.jpg",// Generate a unique ID for the product
  name: "Spider-Man Web-Shooters",
  rating: {
    stars: 4.5,
    count: 42
  },
  priceCents: 2999,
  keywords: ["accessories", "spiderman", "web-shooters","gadgets"]
};

// Function to add a product if it doesn't exist
async function addProductIfNotExists() {
  try {
    // Make sure database is initialized
    await syncDatabase();
    
    // Check if product already exists
    const existingProduct = await Product.findByPk(newProduct.id);
    
    if (existingProduct) {
      console.log('Product already exists:', existingProduct.name);
      return;
    }
    
    // Create the new product
    const createdProduct = await Product.create(newProduct);
    console.log('Product added successfully:', createdProduct.name);
  } catch (error) {
    console.error('Error adding product:', error);
  } finally {
    // Exit the process when done
    process.exit();
  }
}

// Run the function
addProductIfNotExists();
