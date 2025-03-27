'use strict';

import { Sequelize } from "sequelize";
import defineMessageModel from "./message.js";
import defineProductModel from "./product.js";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

// Initialize models
const Message = defineMessageModel(sequelize);
const Product = defineProductModel(sequelize);

// Sync database
const syncDatabase = async () => {
  await sequelize.sync();
};

export { sequelize, Message, Product, syncDatabase };
