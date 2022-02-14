import { DataTypes } from 'sequelize';
import vizapi from '../db/vizapi';

const ProductLocationsMD = vizapi.define('product_location',{
    _location:{ type:DataTypes.INTEGER },
    _product:{ type:DataTypes.INTEGER, primaryKey: true }
},{
    freezeTableName: true,
    timestamps:false
});

export default ProductLocationsMD;