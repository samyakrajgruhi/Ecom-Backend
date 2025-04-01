'use strict';
import { DataTypes } from "sequelize";

const defineCartItemModel = (sequelize) => {
  const CartItem = sequelize.define("CartItem", {
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    deliveryOptionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'DeliveryOptions',
        key: 'id'
      }
    }
  });
  
  return CartItem;
};

export default defineCartItemModel;
