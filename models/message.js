'use strict';
import { DataTypes } from "sequelize";

const defineMessageModel = (sequelize) => {
  const Message = sequelize.define("Message", {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  
  return Message;
};

export default defineMessageModel;