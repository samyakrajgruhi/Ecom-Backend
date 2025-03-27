'use strict';
import { DataTypes } from "sequelize";

const defineDeliveryOptionModel = (sequelize) => {
  const DeliveryOption = sequelize.define("DeliveryOption", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
  
  return DeliveryOption;
};

export default defineDeliveryOptionModel;
