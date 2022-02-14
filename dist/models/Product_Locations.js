"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const ProductLocationsMD = vizapi_1.default.define('product_location', {
    _location: { type: sequelize_1.DataTypes.INTEGER },
    _product: { type: sequelize_1.DataTypes.INTEGER }
}, {
    freezeTableName: true,
    timestamps: false
});
exports.default = ProductLocationsMD;
//# sourceMappingURL=Product_Locations.js.map