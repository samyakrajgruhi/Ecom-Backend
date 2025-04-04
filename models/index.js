'use strict';

import { Sequelize } from "sequelize";
import defineProductModel from "./Product.js";
import defineDeliveryOptionModel from "./DeliveryOption.js";
import defineCartItemModel from "./CartItem.js";
import defineOrderModel from "./Order.js";

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

// Initialize models
const Product = defineProductModel(sequelize);
const DeliveryOption = defineDeliveryOptionModel(sequelize);
const CartItem = defineCartItemModel(sequelize);
const Order = defineOrderModel(sequelize);

// Define relationships
CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(DeliveryOption, { foreignKey: 'deliveryOptionId' });

// Sync database
const syncDatabase = async () => {
  await sequelize.sync(); // Force sync to recreate tables with the correct schema
};

export { sequelize, Product, DeliveryOption, CartItem, Order, syncDatabase };
