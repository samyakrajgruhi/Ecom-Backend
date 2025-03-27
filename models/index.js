'use strict';

import { Sequelize } from "sequelize";
import defineProductModel from "./Product.js";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

// Initialize models
const Product = defineProductModel(sequelize);

// Sync database
const syncDatabase = async () => {
  await sequelize.sync();
};

export { sequelize, Product, syncDatabase };
