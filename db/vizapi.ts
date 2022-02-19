import { Sequelize } from 'sequelize';

const { db, user, pass, host, port} = JSON.parse((process.env.VADB || ""));

const vizapi = new Sequelize(db, user, pass,{
    host:host,
    dialect:'mysql',
    port:port,
    logging: false
});

export default vizapi;