module.exports = (sequelize, DataTypes) => {
    const ProductPrice = sequelize.define('ProductPrice', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id'
        },
        priceType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'price_type',
            comment: 'base, wholesale, retail, bulk, etc.'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        minQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'min_quantity'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'product_prices',
        underscored: true
    });

    ProductPrice.associate = (models) => {
        ProductPrice.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        });
    };

    return ProductPrice;
};
