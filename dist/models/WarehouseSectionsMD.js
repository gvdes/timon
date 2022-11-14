"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const WarehouseSectionMD = vizapi_1.default.define('celler_section', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: { type: sequelize_1.DataTypes.STRING },
    alias: { type: sequelize_1.DataTypes.STRING },
    path: { type: sequelize_1.DataTypes.STRING },
    root: { type: sequelize_1.DataTypes.NUMBER },
    deep: { type: sequelize_1.DataTypes.NUMBER },
    details: { type: sequelize_1.DataTypes.STRING },
    _celler: { type: sequelize_1.DataTypes.NUMBER },
    deleted_at: { type: sequelize_1.DataTypes.DATE }
}, {
    freezeTableName: true,
    timestamps: false
});
exports.default = WarehouseSectionMD;
//# sourceMappingURL=WarehouseSectionsMD.js.map