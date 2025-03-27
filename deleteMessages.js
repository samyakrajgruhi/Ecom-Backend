import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Adjust this to your database configuration
});

const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Function to delete all messages
async function deleteAllMessages() {
  try {
    await sequelize.sync();
    await Message.destroy({ where: {}, truncate: true });
    console.log("All messages have been deleted");
  } catch (error) {
    console.error("Error deleting messages:", error);
  } finally {
    await sequelize.close();
  }
}

// Execute the function
deleteAllMessages();