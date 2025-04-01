'use strict';

import { Sequelize } from "sequelize";
import defineProductModel from "./Product.js";
import defineDeliveryOptionModel from "./DeliveryOption.js";
import defineCartItemModel from "./CartItem.js";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

// Initialize models
const Product = defineProductModel(sequelize);
const DeliveryOption = defineDeliveryOptionModel(sequelize);
const CartItem = defineCartItemModel(sequelize);

// Define relationships
CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(DeliveryOption, { foreignKey: 'deliveryOptionId' });

// Sync database
const syncDatabase = async () => {
  await sequelize.sync();
};

export { sequelize, Product, DeliveryOption, CartItem, syncDatabase };
