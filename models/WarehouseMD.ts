import { DataTypes } from "sequelize";
import vizapi from "../db/vizapi";

const WarehouseMD = vizapi.define('celler',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{ type:DataTypes.STRING },
    _workpoint:{ type:DataTypes.NUMBER },
    _type:{ type:DataTypes.NUMBER }
},{
    freezeTableName: true,
});