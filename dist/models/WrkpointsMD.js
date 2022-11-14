"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const WorkpointMD = vizapi_1.default.define('workpoints', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: sequelize_1.DataTypes.STRING },
    alias: { type: sequelize_1.DataTypes.STRING },
    dominio: { type: sequelize_1.DataTypes.STRING },
    _type: { type: sequelize_1.DataTypes.INTEGER },
    _client: { type: sequelize_1.DataTypes.INTEGER },
    active: { type: sequelize_1.DataTypes.INTEGER }
}, {
    freezeTableName: true,
    timestamps: false
});
exports.default = WorkpointMD;
//# sourceMappingURL=WrkpointsMD.js.map