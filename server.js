import express, { text } from "express";
import { Sequelize, DataTypes } from "sequelize";
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

// Define Message model
const Message = sequelize.define("Message", {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Sync database
sequelize.sync();

// Sample API Route
app.get("/api/message", async (req, res) => {
    let message = await Message.findAll();
  res.json(message);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});