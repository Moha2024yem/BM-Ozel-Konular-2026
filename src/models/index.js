const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];
const logger = require('../lib/logger');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: env === 'test' ? false : msg => logger.debug(msg)
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modeller
db.Customer = require('./customer')(sequelize, Sequelize.DataTypes);
db.Order = require('./order')(sequelize, Sequelize.DataTypes);
db.Product = require('./product')(sequelize, Sequelize.DataTypes);
db.ProductPrice = require('./productPrice')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./orderItem')(sequelize, Sequelize.DataTypes);

// İlişkiler tanımlanması
// Customer ile Order arasında 1:N ilişki kurulur
if (db.Customer.associate) {
  db.Customer.associate(db);
}
if (db.Order.associate) {
  db.Order.associate(db);
}
if (db.Product.associate) {
  db.Product.associate(db);
}
if (db.ProductPrice.associate) {
  db.ProductPrice.associate(db);
}
if (db.OrderItem.associate) {
  db.OrderItem.associate(db);
}

// Eski ilişkiler (geriye dönük uyumluluk için)
db.Customer.hasMany(db.Order, { foreignKey: 'customerId' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customerId' });

module.exports = db;
