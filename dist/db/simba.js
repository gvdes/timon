"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMBA = void 0;
const node_adodb_1 = __importDefault(require("node-adodb"));
const moment_1 = __importDefault(require("moment"));
const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
const SIMBA = () => __awaiter(void 0, void 0, void 0, function* () {
    const simbainit = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
    console.log(`\n${simbainit}`);
    const rows = yield fsol.query('SELECT ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="DES" OR ALMSTO="GEN" ORDER BY ARTSTO;');
    if (rows.length) {
        console.log(rows.length, "==> resultados!!");
        console.log(rows[1]);
    }
    const simbaends = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
    console.log(`${simbaends}\n`);
});
exports.SIMBA = SIMBA;
//# sourceMappingURL=simba.js.map