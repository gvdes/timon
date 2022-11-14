"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const WarehouseMD = vizapi_1.default.define('celler', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: { type: sequelize_1.DataTypes.STRING },
    _workpoint: { type: sequelize_1.DataTypes.NUMBER },
    _type: { type: sequelize_1.DataTypes.NUMBER }
}, {
    freezeTableName: true,
});
//# sourceMappingURL=WarehouseMD.js.map