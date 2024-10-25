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
    var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j, _k, e_4, _l, _m, _o, e_5, _p, _q;
    const hourstart = (0, moment_1.default)('08:55:00', 'hh:mm:ss');
    const hourend = (0, moment_1.default)('22:00:00', 'hh:mm:ss');
    const now = (0, moment_1.default)();
    const nday = (0, moment_1.default)().format("d");
    const workpoint = JSON.parse((process.env.WORKPOINT || ""));
    // Se ejecuta todos los dias que no son domingo desde las 8:55 am hasta las 9:00 pm
    try {
        if ((now.isBetween(hourstart, hourend))) {
            const simbainit = `\n[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
            console.log(`\n${simbainit}`);
            let rset = { SAN: [], PAN: [], TCO: [], BOL: [], BRA: [] };
            console.time('SELECTS');
            const CEDISSANrows = yield fsol.query(`SELECT
                    F_STO.ARTSTO AS CODIGO,
                    SUM(IIF(F_STO.ALMSTO = "GEN", F_STO.ACTSTO,0)) AS GEN,
                    SUM(IIF(F_STO.ALMSTO = "236", F_STO.ACTSTO,0)) AS V23,
                    SUM(IIF(F_STO.ALMSTO = "LRY",F_STO.ACTSTO,0)) AS LRY,
                    SUM(IIF(F_STO.ALMSTO = 'DES', F_STO.ACTSTO,0 )) AS DES,
                    SUM(IIF(F_STO.ALMSTO = 'RTA', F_STO.ACTSTO,0 )) AS RTA
                FROM F_STO GROUP BY F_STO.ARTSTO;`);
            const CEDISTCOrows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="STC" ORDER BY ARTSTO;');
            const CEDISPANrows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
            const CEDISBOLrows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="BOL" ORDER BY ARTSTO;');
            const CEDISBRArows = yield fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="BRA" ORDER BY ARTSTO;');
            console.timeEnd('SELECTS');
            console.time('UPDATEDS');
            if (CEDISSANrows.length) {
                console.log("Sincronizando CEDISSAP (GENERAL y DESCOMPUESTO)");
                try {
                    for (var _r = true, CEDISSANrows_1 = __asyncValues(CEDISSANrows), CEDISSANrows_1_1; CEDISSANrows_1_1 = yield CEDISSANrows_1.next(), _a = CEDISSANrows_1_1.done, !_a; _r = true) {
                        _c = CEDISSANrows_1_1.value;
                        _r = false;
                        const row = _c;
                        const [results] = yield vizapi_1.default.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                        SET
                            STO.stock= ${row.GEN},
                            STO.gen= ${row.GEN},
                            STO.V23 = ${row.V23},
                            STO.LRY = ${row.LRY},
                            STO.des= ${row.DES},
                            STO.in_transit = ${row.RTA}
                        WHERE P.code="${row.CODIGO}" AND STO._workpoint = 1`);
                        if (results.changedRows) {
                            rset.SAN.push({ code: row.CODIGO });
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_r && !_a && (_b = CEDISSANrows_1.return)) yield _b.call(CEDISSANrows_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                ;
            }
            if (CEDISPANrows.length) {
                console.log("Sincronizando CEDIS PANTACO...");
                try {
                    for (var _s = true, CEDISPANrows_1 = __asyncValues(CEDISPANrows), CEDISPANrows_1_1; CEDISPANrows_1_1 = yield CEDISPANrows_1.next(), _d = CEDISPANrows_1_1.done, !_d; _s = true) {
                        _f = CEDISPANrows_1_1.value;
                        _s = false;
                        const row = _f;
                        const [results] = yield vizapi_1.default.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=21;
                    `);
                        if (results.changedRows) {
                            rset.PAN.push({ code: row.ARTSTO });
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_s && !_d && (_e = CEDISPANrows_1.return)) yield _e.call(CEDISPANrows_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (CEDISTCOrows.length) {
                console.log("Sincronizando CEDIS TEXCOCO...");
                try {
                    for (var _t = true, CEDISTCOrows_1 = __asyncValues(CEDISTCOrows), CEDISTCOrows_1_1; CEDISTCOrows_1_1 = yield CEDISTCOrows_1.next(), _g = CEDISTCOrows_1_1.done, !_g; _t = true) {
                        _j = CEDISTCOrows_1_1.value;
                        _t = false;
                        const row = _j;
                        const [results] = yield vizapi_1.default.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=2;
                    `);
                        if (results.changedRows) {
                            rset.TCO.push({ code: row.ARTSTO });
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (!_t && !_g && (_h = CEDISTCOrows_1.return)) yield _h.call(CEDISTCOrows_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            if (CEDISBOLrows.length) {
                console.log("Sincronizando CEDIS BOLIVIA...");
                try {
                    for (var _u = true, CEDISBOLrows_1 = __asyncValues(CEDISBOLrows), CEDISBOLrows_1_1; CEDISBOLrows_1_1 = yield CEDISBOLrows_1.next(), _k = CEDISBOLrows_1_1.done, !_k; _u = true) {
                        _m = CEDISBOLrows_1_1.value;
                        _u = false;
                        const row = _m;
                        const [results] = yield vizapi_1.default.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=24;
                    `);
                        if (results.changedRows) {
                            rset.BOL.push({ code: row.ARTSTO });
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (!_u && !_k && (_l = CEDISBOLrows_1.return)) yield _l.call(CEDISBOLrows_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            if (CEDISBRArows.length) {
                console.log("Sincronizando CEDIS BOLIVIA...");
                try {
                    for (var _v = true, CEDISBRArows_1 = __asyncValues(CEDISBRArows), CEDISBRArows_1_1; CEDISBRArows_1_1 = yield CEDISBRArows_1.next(), _o = CEDISBRArows_1_1.done, !_o; _v = true) {
                        _q = CEDISBRArows_1_1.value;
                        _v = false;
                        const row = _q;
                        const [results] = yield vizapi_1.default.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=16;
                    `);
                        if (results.changedRows) {
                            rset.BRA.push({ code: row.ARTSTO });
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (!_v && !_o && (_p = CEDISBRArows_1.return)) yield _p.call(CEDISBRArows_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            // console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISTCOrows.length+CEDISBOLrows.length+CEDISPANrows.length));
            console.log("FILAS TOTALES:", (CEDISSANrows.length + CEDISTCOrows.length + CEDISPANrows.length + CEDISBOLrows.length + CEDISBRArows.length));
            console.log("CEDISSAN:", CEDISSANrows.length, " UPDATEDS:", rset.SAN.length);
            console.log("CEDISPAN:", CEDISTCOrows.length, " UPDATEDS:", rset.TCO.length);
            console.log("CEDISBOL:", CEDISBOLrows.length, " UPDATEDS:", rset.BOL.length);
            console.log("CEDISTCO:", CEDISPANrows.length, " UPDATEDS:", rset.PAN.length);
            console.log("CEDISTCO:", CEDISBRArows.length, " UPDATEDS:", rset.BRA.length);
            const simbaends = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado, siguiente vuelta en 10 segundos...`;
            console.timeEnd('UPDATEDS');
            console.log(`${simbaends}\n`);
            setTimeout(() => { (0, exports.SIMBA)(); }, 10000);
        }
        else {
            setTimeout(() => { (0, exports.SIMBA)(); }, 300000);
        }
    }
    catch (error) {
        console.error(error);
        console.log("El programa tuvo un error de jecucion, esperando siguiente vuelta en 10s...");
        setTimeout(() => { (0, exports.SIMBA)(); }, 10000);
    }
});
exports.SIMBA = SIMBA;
//# sourceMappingURL=simba.js.map