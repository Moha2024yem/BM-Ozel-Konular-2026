module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        basePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'base_price'
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'stock_quantity'
        },
        trackInventory: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'track_inventory',
            comment: 'Bazı ürünlerin stok takibi yapılmıyor'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'products',
        underscored: true
    });

    Product.associate = (models) => {
        Product.hasMany(models.ProductPrice, {
            foreignKey: 'productId',
            as: 'prices'
        });
        Product.hasMany(models.OrderItem, {
            foreignKey: 'productId',
            as: 'orderItems'
        });
    };

    return Product;
};
