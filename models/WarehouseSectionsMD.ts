import { DataTypes } from "sequelize";
import vizapi from "../db/vizapi";

const WarehouseSectionMD = vizapi.define('celler_section',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{ type: DataTypes.STRING },
    alias:{ type: DataTypes.STRING },
    path:{ type: DataTypes.STRING },
    root:{ type: DataTypes.NUMBER },
    deep:{ type: DataTypes.NUMBER },
    details:{ type: DataTypes.STRING },
    _celler:{ type: DataTypes.NUMBER },
    deleted_at:{ type: DataTypes.DATE }
},{
    freezeTableName:true,
    timestamps:false
});

export default WarehouseSectionMD;