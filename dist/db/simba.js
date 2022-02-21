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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMBA = void 0;
const node_adodb_1 = __importDefault(require("node-adodb"));
const moment_1 = __importDefault(require("moment"));
const vizapi_1 = __importDefault(require("../db/vizapi"));
const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
const SIMBA = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a, e_2, _b, e_3, _c;
    const workpoint = JSON.parse((process.env.WORKPOINT || ""));
    if (workpoint.id) {
        console.time('t1');
        const simbainit = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
        console.log(`\n${simbainit}`);
        let WRHGEN = [], WRHDES = [];
        let rset = { GEN: [], DES: [], PAN: [] };
        const CEDISSANrows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="DES" OR ALMSTO="GEN" ORDER BY ARTSTO;');
        const CEDISPANrows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
        if (CEDISSANrows.length) {
            console.log("Sincronizando CEDIS SANPABLO...");
            WRHGEN = CEDISSANrows.filter(r => r.ALMSTO == "GEN");
            WRHDES = CEDISSANrows.filter(r => r.ALMSTO == "DES");
            console.log("ALMACEN GENERAL...");
            try {
                for (var WRHGEN_1 = __asyncValues(WRHGEN), WRHGEN_1_1; WRHGEN_1_1 = yield WRHGEN_1.next(), !WRHGEN_1_1.done;) {
                    const row = WRHGEN_1_1.value;
                    const [results] = yield vizapi_1.default.query(`
                    UPDATE product_stock STO
                        INNER JOIN products P ON P.id = STO._product
                        INNER JOIN workpoints W ON W.id = STO._workpoint
                    SET gen=${row.ACTSTO}
                    WHERE P.code="${row.ARTSTO}" AND W.id="${workpoint.id}";
                `);
                    if (results.changedRows) {
                        rset.GEN.push({ code: row.ARTSTO });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (WRHGEN_1_1 && !WRHGEN_1_1.done && (_a = WRHGEN_1.return)) yield _a.call(WRHGEN_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("ALMACEN DESCOMPUESTO...");
            try {
                for (var WRHDES_1 = __asyncValues(WRHDES), WRHDES_1_1; WRHDES_1_1 = yield WRHDES_1.next(), !WRHDES_1_1.done;) {
                    const row = WRHDES_1_1.value;
                    const [results] = yield vizapi_1.default.query(`
                    UPDATE product_stock STO
                        INNER JOIN products P ON P.id = STO._product
                        INNER JOIN workpoints W ON W.id = STO._workpoint
                    SET des=${row.ACTSTO}
                    WHERE P.code="${row.ARTSTO}" AND W.id="${workpoint.id}";
                `);
                    if (results.changedRows) {
                        rset.DES.push({ code: row.ARTSTO });
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (WRHDES_1_1 && !WRHDES_1_1.done && (_b = WRHDES_1.return)) yield _b.call(WRHDES_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (CEDISPANrows.length) {
            console.log("Sincronizando CEDIS PANTACO...");
            try {
                for (var CEDISPANrows_1 = __asyncValues(CEDISPANrows), CEDISPANrows_1_1; CEDISPANrows_1_1 = yield CEDISPANrows_1.next(), !CEDISPANrows_1_1.done;) {
                    const row = CEDISPANrows_1_1.value;
                    const [results] = yield vizapi_1.default.query(`
                    UPDATE product_stock STO
                        INNER JOIN products P ON P.id = STO._product
                        INNER JOIN workpoints W ON W.id = STO._workpoint
                    SET gen=${row.ACTSTO}
                    WHERE P.code="${row.ARTSTO}" AND W.id=2;
                `);
                    if (results.changedRows) {
                        rset.PAN.push({ code: row.ARTSTO });
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (CEDISPANrows_1_1 && !CEDISPANrows_1_1.done && (_c = CEDISPANrows_1.return)) yield _c.call(CEDISPANrows_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        console.log("FILAS TOTALES:", (CEDISSANrows.length + CEDISPANrows.length));
        console.log("ALMACEN GENERAL:", WRHGEN.length, " UPDATEDS:", rset.GEN.length);
        console.log("ALMACEN DESCOMPUESTOS:", WRHDES.length, " UPDATEDS:", rset.DES.length);
        console.log("ALMACEN PANTACO:", CEDISPANrows.length, " UPDATEDS:", rset.PAN.length);
        const simbaends = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
        console.log(`${simbaends}\n`);
        console.timeEnd('t1');
    }
    else {
        console.log("No hay ID definido par ala sincornizacion de stocks");
    }
});
exports.SIMBA = SIMBA;
//# sourceMappingURL=simba.js.map