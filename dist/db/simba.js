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
    var e_1, _a;
    const hourstart = (0, moment_1.default)('08:55:00', 'hh:mm:ss');
    const hourend = (0, moment_1.default)('21:00:00', 'hh:mm:ss');
    const now = (0, moment_1.default)();
    const nday = (0, moment_1.default)().format("d");
    const workpoint = JSON.parse((process.env.WORKPOINT || ""));
    // Se ejecuta todos los dias que no son domingo entre las 8:55 am hasta las 9:00 pm
    if ((nday != 7) && (now.isBetween(hourstart, hourend))) {
        const simbainit = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
        console.log(`\n${simbainit}`);
        let WRHGEN = [], WRHDES = [];
        let rset = { SAN: [], PAN: [] };
        console.time('SELECTS');
        const CEDISSANrows = yield fsol.query(`
                SELECT DISTINCT
                ARTICULO,
                GRAL,
                DESCOMPUESTO,
                TOTAL
                FROM (

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_ENT.FECENT AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LEN ON F_LEN.ARTLEN = F_STO.ARTSTO)
                INNER JOIN F_ENT ON F_ENT.TIPENT = F_LEN.TIPLEN AND F_ENT.CODENT = F_LEN.CODLEN)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES" 

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FRE.FECFRE AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFR ON F_LFR.ARTLFR = F_STO.ARTSTO)
                INNER JOIN F_FRE ON F_FRE.TIPFRE = F_LFR.TIPLFR AND F_FRE.CODFRE = F_LFR.CODLFR)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FRD.FECFRD AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFD ON F_LFD.ARTLFD = F_STO.ARTSTO)
                INNER JOIN F_FRD ON F_FRD.TIPFRD = F_LFD.TIPLFD AND F_FRD.CODFRD = F_LFD.CODLFD)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FAC.FECFAC AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFA ON F_LFA.ARTLFA = F_STO.ARTSTO)
                INNER JOIN F_FAC ON F_FAC.TIPFAC = F_LFA.TIPLFA AND F_FAC.CODFAC = F_LFA.CODLFA)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FAB.FECFAB AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFB ON F_LFB.ARTLFB = F_STO.ARTSTO)
                INNER JOIN F_FAB ON F_FAB.TIPFAB = F_LFB.TIPLFB AND F_FAB.CODFAB = F_LFB.CODLFB)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_TRA.FECTRA AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LTR ON F_LTR.ARTLTR = F_STO.ARTSTO)
                INNER JOIN F_TRA ON F_TRA.DOCTRA = F_LTR.DOCLTR)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FCO.FECFCO AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFC ON F_LFC.ARTLFC = F_STO.ARTSTO)
                INNER JOIN F_FCO ON F_FCO.CODFCO = F_LFC.CODLFC)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_CIN.FECCIN AS FECHA
                FROM (((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_CIN ON F_CIN.ARTCIN = F_STO.ARTSTO)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES")

                WHERE FECHA = #2022-03-01#;
            `);
        // const CEDISPANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
        console.log(CEDISSANrows);
        console.log(CEDISSANrows.length);
        console.timeEnd('SELECTS');
        console.time('UPDATEDS');
        if (CEDISSANrows.length) {
            console.log("Sincronizando CEDISSAP (GENERAL y DESCOMPUESTO)");
            try {
                for (var CEDISSANrows_1 = __asyncValues(CEDISSANrows), CEDISSANrows_1_1; CEDISSANrows_1_1 = yield CEDISSANrows_1.next(), !CEDISSANrows_1_1.done;) {
                    const row = CEDISSANrows_1_1.value;
                    const [results] = yield vizapi_1.default.query(`
                    UPDATE product_stock STO
                        INNER JOIN products P ON P.id = STO._product
                        INNER JOIN workpoints W ON W.id = STO._workpoint
                    SET
                        STO.stock="${row.TOTAL}",
                        STO.gen="${row.GRAL}",
                        STO.des="${row.DESCOMPUESTO}"
                    WHERE P.code="${row.ARTICULO}" AND W.id=1;
                `);
                    if (results.changedRows) {
                        rset.SAN.push({ code: row.ARTICULO });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (CEDISSANrows_1_1 && !CEDISSANrows_1_1.done && (_a = CEDISSANrows_1.return)) yield _a.call(CEDISSANrows_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            ;
        }
        // if(CEDISPANrows.length){
        //     console.log("Sincronizando CEDIS PANTACO...");
        //     for await (const row of CEDISPANrows) {
        //         const [results]:any = await vizapi.query(`
        //             UPDATE product_stock STO
        //                 INNER JOIN products P ON P.id = STO._product
        //                 INNER JOIN workpoints W ON W.id = STO._workpoint
        //             SET gen=${row.ACTSTO}
        //             WHERE P.code="${row.ARTSTO}" AND W.id=2;
        //         `);
        //         if(results.changedRows){ rset.PAN.push({code:row.ARTSTO}); }
        //     }
        // }
        // console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISPANrows.length));
        console.log("CEDISSAN:", CEDISSANrows.length, " UPDATEDS:", rset.SAN.length);
        // console.log("CEDISPAN:",CEDISPANrows.length," UPDATEDS:",rset.PAN.length);
        const simbaends = `[${(0, moment_1.default)().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
        console.log(`${simbaends}\n`);
        console.timeEnd('UPDATEDS');
    }
    else {
        console.log("lazy day!", nday);
    }
});
exports.SIMBA = SIMBA;
//# sourceMappingURL=simba.js.map