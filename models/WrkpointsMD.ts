import { DataTypes } from 'sequelize';
import vizapi from '../db/vizapi';

const WorkpointMD = vizapi.define('workpoints',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{ type:DataTypes.STRING },
    alias:{ type:DataTypes.STRING },
    dominio:{ type:DataTypes.STRING },
    _type:{ type:DataTypes.INTEGER },
    _client: { type:DataTypes.INTEGER },
    active: { type:DataTypes.INTEGER }
},{
    freezeTableName:true,
    timestamps:false
});

export default WorkpointMD;