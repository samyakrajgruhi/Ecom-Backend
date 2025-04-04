'use strict';
import { DataTypes } from "sequelize";

const defineOrderModel = (sequelize) => {
  const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    orderTimeMs: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    totalCostCents: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false
    }
  });

  return Order;
};

export default defineOrderModel;
