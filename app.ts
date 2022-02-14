import dotenv from 'dotenv';
dotenv.config();

import Server from './models/server'

console.log("Starting server...");

const server = new Server();

server.run();

// const FSOL = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

// if(FSOL){
//     FSOL.query('SELECT COUNT(*) as total FROM F_ART').then( data =>{
//         // let total = JSON.stringify(data);
//         console.log(data);
//     }).catch( err => {
//         console.log(err);
//     });
// }else{ console.log("no conectado"); }