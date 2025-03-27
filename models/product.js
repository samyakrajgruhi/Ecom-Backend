'use strict';
import { DataTypes } from "sequelize";

const defineProductModel = (sequelize) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.JSON, // Stores the nested rating object with stars and count
      allowNull: false
    },
    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    keywords: {
      type: DataTypes.JSON, // Stores the keywords array
      allowNull: false
    }
  });
  
  return Product;
};

export default defineProductModel;
