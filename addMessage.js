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

sequelize.sync(); 


Message.create({ text: 'This is another messages.' });