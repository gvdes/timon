import { DataTypes } from 'sequelize';
import vizapi from '../db/vizapi';

const ProductMD = vizapi.define('products',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    code:{ type:DataTypes.STRING },
    name:{ type:DataTypes.STRING },
    description:{ type:DataTypes.STRING },
    label:{ type:DataTypes.STRING },
    stock: { type:DataTypes.DOUBLE },
    pieces: { type:DataTypes.INTEGER },
    weight: { type:DataTypes.DOUBLE },
    _category:{ type:DataTypes.INTEGER },
    _status:{ type:DataTypes.INTEGER },
    _unit:{ type:DataTypes.INTEGER },
    _provider:{ type:DataTypes.INTEGER },
    cost:{ type:DataTypes.FLOAT },
    barcode:{ type:DataTypes.STRING },
    large:{ type:DataTypes.STRING },
    dimensions:{ type:DataTypes.STRING },
},{
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ProductMD;