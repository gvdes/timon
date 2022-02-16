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
exports.LISTCLIENTS = exports.SYNCCLIENTS = void 0;
const node_adodb_1 = __importDefault(require("node-adodb"));
const moment_1 = __importDefault(require("moment"));
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD"));
const HelpresCont_1 = require("../vizapi/HelpresCont");
const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
const SYNCCLIENTS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    console.log("Iniciando sincronizacion de clientes..");
    let cambiosdetarifa = [];
    const today = (0, moment_1.default)().format('YYYY/MM/DD'); // se obtiene la fecha del dia en curso
    let query = `SELECT * FROM F_CLI WHERE FUMCLI=#${today}#;`; // query por default a ejecutar
    const rangedates = req.body.periodo || null; // desde
    const command = req.body.accion || "ver"; // desde
    let from = undefined; // desde
    let to = undefined; // hasta
    let cllength = 0;
    let resumen = { clientes: [], goals: [], fails: [] };
    let rows = [];
    if (command == "ver" || command == "sync") {
        if (rangedates) {
            if (rangedates.inicio && rangedates.inicio.length == 10 && (0, moment_1.default)(rangedates.inicio, "YYYY/MM/DD").isValid()) {
                from = rangedates.inicio;
                if (rangedates.fin) {
                    if (rangedates.fin.length == 10 && (0, moment_1.default)(rangedates.fin, "YYYY/MM/DD").isValid()) {
                        to = rangedates.fin;
                    }
                    else {
                        return resp.status(400).json({ "Error": `La fecha de fin no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)` });
                    }
                }
                else {
                    to = today;
                }
            }
            else {
                return resp.status(400).json({ "Error": `La fecha de inicio no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)` });
            }
            query = `SELECT * FROM F_CLI WHERE FUMCLI Between #${from}# and #${to}#;`;
        }
        else {
            from = today; // desde
            to = today; // hasta
        }
        try {
            let clrows = yield fsol.query(query); // se ejecuta el query y se obtienen filas
            cllength = clrows.length; //tamaño de las filas
            if (cllength) {
                rows = clrows.map((cl) => {
                    if (cl.TARCLI == 7) {
                        cl.TARCLI = 6;
                        cambiosdetarifa.push({ cliente: cl.NOFCLI, codigo: cl.CODCLI });
                    }
                    resumen.clientes.push(`${(0, moment_1.default)(cl.FUMCLI).format("YYYY/MM/DD")} ==> ${cl.CODCLI} ${cl.NOFCLI}, TAR: ${cl.TARCLI}`);
                    return cl;
                });
                if (command == "ver") {
                    return resp.json({ "accion": command, inicio: from, fin: to, resumen, cambiosdetarifa });
                }
                if (command == "sync") {
                    const workpoints = yield WrkpointsMD_1.default.findAll();
                    const wkps = JSON.parse(JSON.stringify(workpoints)).filter((w) => (w.active && w.id > 2));
                    try {
                        for (var wkps_1 = __asyncValues(wkps), wkps_1_1; wkps_1_1 = yield wkps_1.next(), !wkps_1_1.done;) {
                            const wkp = wkps_1_1.value;
                            const con = yield (0, HelpresCont_1.wkpConnection)(wkp);
                            if (con.state) {
                                const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rows }, "/fsol/sync/clients", "POST");
                                const PING = `${wkp.alias} ==> OK!!`;
                                console.log(PING, action);
                                resumen.goals.push(`${wkp.alias} ==> PING OK!!`, action);
                            }
                            else {
                                const PING = `${wkp.alias} ==> REJECT!!`;
                                resumen.fails.push(PING);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (wkps_1_1 && !wkps_1_1.done && (_a = wkps_1.return)) yield _a.call(wkps_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return resp.json({ "accion": command, inicio: from, fin: to, resumen, cambiosdetarifa });
                }
            }
            else {
                resumen.clientes = "Nada por actualizar";
                return resp.json({ resumen });
            }
        }
        catch (error) {
        }
    }
    else {
        return resp.status(400).json({ error: `${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar` });
    }
});
exports.SYNCCLIENTS = SYNCCLIENTS;
const LISTCLIENTS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
    try {
        let clients = yield fsol.query(`SELECT * FROM F_CLI`);
        resp.json({ clients });
    }
    catch (error) {
        resp.status(500).json(error);
    }
});
exports.LISTCLIENTS = LISTCLIENTS;
//# sourceMappingURL=fsolCont.js.map