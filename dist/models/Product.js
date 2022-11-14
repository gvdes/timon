"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const ProductMD = vizapi_1.default.define('products', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: { type: sequelize_1.DataTypes.STRING },
    name: { type: sequelize_1.DataTypes.STRING },
    description: { type: sequelize_1.DataTypes.STRING },
    label: { type: sequelize_1.DataTypes.STRING },
    stock: { type: sequelize_1.DataTypes.DOUBLE },
    pieces: { type: sequelize_1.DataTypes.INTEGER },
    weight: { type: sequelize_1.DataTypes.DOUBLE },
    _category: { type: sequelize_1.DataTypes.INTEGER },
    _status: { type: sequelize_1.DataTypes.INTEGER },
    _unit: { type: sequelize_1.DataTypes.INTEGER },
    _provider: { type: sequelize_1.DataTypes.INTEGER },
    cost: { type: sequelize_1.DataTypes.FLOAT },
    barcode: { type: sequelize_1.DataTypes.STRING },
    large: { type: sequelize_1.DataTypes.STRING },
    dimensions: { type: sequelize_1.DataTypes.STRING },
}, {
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
exports.default = ProductMD;
//# sourceMappingURL=Product.js.map