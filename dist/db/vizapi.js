"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const { db, user, pass, host, port } = JSON.parse((process.env.VADB || ""));
const vizapi = new sequelize_1.Sequelize(db, user, pass, {
    host: host,
    dialect: 'mysql',
    port: port,
    logging: false
});
exports.default = vizapi;
//# sourceMappingURL=vizapi.js.map