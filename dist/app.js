"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_1 = __importDefault(require("./models/server"));
console.log("Starting server...");
const server = new server_1.default();
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
//# sourceMappingURL=app.js.map