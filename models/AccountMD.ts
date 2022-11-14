import { DataTypes } from "sequelize";
import vizapi from "../db/vizapi";

const AccountMD = vizapi.define('accounts',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nick:{ type: DataTypes.STRING },
    password:{ type: DataTypes.STRING },
    picture:{ type: DataTypes.STRING },
    names:{ type: DataTypes.STRING },
    surname_pat:{ type: DataTypes.STRING },
    surname_mat:{ type: DataTypes.STRING },
    change_password:{ type: DataTypes.STRING },
    remember_token:{ type: DataTypes.STRING },
    _wp_principal:{ type: DataTypes.INTEGER },
    _rol:{ type: DataTypes.INTEGER }
},{
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default AccountMD;