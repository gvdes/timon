"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../db/vizapi"));
const AccountMD = vizapi_1.default.define('accounts', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nick: { type: sequelize_1.DataTypes.STRING },
    password: { type: sequelize_1.DataTypes.STRING },
    picture: { type: sequelize_1.DataTypes.STRING },
    names: { type: sequelize_1.DataTypes.STRING },
    surname_pat: { type: sequelize_1.DataTypes.STRING },
    surname_mat: { type: sequelize_1.DataTypes.STRING },
    change_password: { type: sequelize_1.DataTypes.STRING },
    remember_token: { type: sequelize_1.DataTypes.STRING },
    _wp_principal: { type: sequelize_1.DataTypes.INTEGER },
    _rol: { type: sequelize_1.DataTypes.INTEGER }
}, {
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
exports.default = AccountMD;
//# sourceMappingURL=AccountMD.js.map