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
exports.SYNCPRODUCTSPRICES = exports.LISTCLIENTS = exports.SYNCPRODSFAMS = exports.SYNCCLIENTS = void 0;
const node_adodb_1 = __importDefault(require("node-adodb"));
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = require("sequelize");
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD"));
const HelpresCont_1 = require("../vizapi/HelpresCont");
const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
const SYNCCLIENTS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    console.log("Iniciando sincronizacion de clientes..");
    const wkpreq = req.body.sucursal;
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
            cllength = clrows.length; //tama??o de las filas
            console.log(cllength);
            if (cllength) {
                rows = clrows.map((cl) => {
                    if (cl.TARCLI == 7) {
                        cl.TARCLI = 6;
                        cambiosdetarifa.push({ cliente: cl.NOFCLI, codigo: cl.CODCLI });
                    }
                    resumen.clientes.push(`${(0, moment_1.default)(cl.FUMCLI).format("YYYY/MM/DD")} ==> ${cl.CODCLI} ${cl.NOFCLI}, TAR: ${cl.TARCLI}`);
                    return cl;
                });
                if (command == "ver") { // opcion para solo visualizar
                    return resp.json({ "accion": command, inicio: from, fin: to, resumen, cambiosdetarifa });
                }
                if (command == "sync") { //opcion para sincronizar
                    if (wkpreq) { // si solo se solicita la actualizacion en una tienda
                        const wkp = yield WrkpointsMD_1.default.findOne({ where: {
                                [sequelize_1.Op.or]: [
                                    { id: wkpreq },
                                    { alias: wkpreq }
                                ]
                            }
                        });
                        if (wkp && wkp.active == 1) { // validate workpoint existence and this is active
                            const con = yield (0, HelpresCont_1.wkpConnection)(wkp); //test to knows there are connection
                            if (con.state) { //if there are conection
                                console.log("Conexion exitosa");
                                const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rows }, "/fsol/sync/clients", "POST");
                                const PING = `${wkp.alias} ==> OK!!`;
                                console.log(PING, action);
                                resp.json({ wkp, con, action }); // send response about request
                            }
                            else {
                                resp.status(502).json({ wkp, con });
                            } // if there arent response, return a error server
                        }
                        else {
                            resp.status(400).json({ "No hables tus mierdas meriyein": wkp ? `esta sucursal no esta activa (y-_-)y` : `${wkpreq} ni existe (y-_-)y` }); //if there are connection, return error server
                        }
                    }
                    else { // si la actualizacion debe ser completa (en todas las tiendas)
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
                                    resumen.goals.push({ PING }, action);
                                }
                                else {
                                    const PING = `${wkp.alias} ==> REJECT!!`;
                                    resumen.fails.push({ PING });
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
const SYNCPRODSFAMS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _b;
    const wkpreq = req.body.sucursal;
    const fecha = req.body.fecha;
    const accion = req.body.accion;
    let qday = (0, moment_1.default)().format('YYYY/MM/DD');
    let resumen = { goals: [], fails: [] };
    if (fecha) { // recibi contenido en la variable fecha
        //la fecha es una fecha valida
        if (fecha.length == 10 && (0, moment_1.default)(fecha, "YYYY/MM/DD").isValid()) {
            qday = fecha; // nueva fecha a considerar
        }
        else { //la fecha no es valida, notificar al cliente
            return resp.status(400).json({ "meriyein": `La fecha: ${fecha}, no es una fecha valida (y-_-)y` });
        }
    }
    //ejecucion de query
    const rows = yield fsol.query(`SELECT F_EAN.* FROM F_EAN
        INNER JOIN F_ART ON F_ART.CODART = F_EAN.ARTEAN
        WHERE F_ART.FUMART>=#${qday}#;`);
    if (accion && accion == "sync") { //validacion del comando recibido
        if (rows.length) { //hay registros en este periodo de fecha
            if (wkpreq) { //actualizacion individual
                const wkp = yield WrkpointsMD_1.default.findOne({ where: {
                        [sequelize_1.Op.or]: [
                            { id: wkpreq },
                            { alias: wkpreq }
                        ]
                    }
                });
                if (wkp && wkp.active == 1) { // validate workpoint existence and this is active
                    const con = yield (0, HelpresCont_1.wkpConnection)(wkp); //test to knows there are connection
                    if (con.state) { //if there are conection
                        console.log("Conexion exitosa");
                        const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rows }, "/fsol/sync/familiarizations", "POST");
                        const PING = `${wkp.alias} ==> OK!!`;
                        console.log(PING, action);
                        resp.json({ wkp, con, action }); // send response about request
                    }
                    else {
                        return resp.status(502).json({ wkp, con });
                    } // if there arent response, return a error server
                }
                else {
                    return resp.status(400).json({ "meriyein": wkp ? `esta sucursal no esta activa (y-_-)y` : `${wkpreq} ni existe (y-_-)y` }); //if there are connection, return error server
                }
            }
            else { // actualizacion masiva, a todas las tiendas
                const workpoints = yield WrkpointsMD_1.default.findAll();
                const wkps = JSON.parse(JSON.stringify(workpoints)).filter((w) => (w.active && w.id > 2));
                try {
                    for (var wkps_2 = __asyncValues(wkps), wkps_2_1; wkps_2_1 = yield wkps_2.next(), !wkps_2_1.done;) {
                        const wkp = wkps_2_1.value;
                        const con = yield (0, HelpresCont_1.wkpConnection)(wkp);
                        if (con.state) {
                            const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rows }, "/fsol/sync/familiarizations", "POST");
                            const PING = `${wkp.alias} ==> OK!!`;
                            console.log(PING, action);
                            resumen.goals.push({ PING }, action);
                        }
                        else {
                            const PING = `${wkp.alias} ==> REJECT!!`;
                            resumen.fails.push({ PING });
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (wkps_2_1 && !wkps_2_1.done && (_b = wkps_2.return)) yield _b.call(wkps_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return resp.json({ resumen });
            }
        }
        else {
            return resp.json({ "meriyein": "Sin familiarizaciones disponibles" });
        }
    }
    else { //el comando no es sync, se devuelven las filas para visualizarlas
        return rows.length ?
            resp.json({ fecha, familiarizaciones: rows }) :
            resp.json({ "meriyein": "Sin familiarizaciones aqui!!" });
    }
});
exports.SYNCPRODSFAMS = SYNCPRODSFAMS;
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
const SYNCPRODUCTSPRICES = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\n\nSincronizando precios...");
    //validacion de parametros a recibir
    const fecha = req.body.fecha;
    const accion = req.body.accion;
    let command = "productosyprecios";
    let period = "";
    let msg = "";
    if (fecha) {
        if (fecha == "hoy") {
            period = (0, moment_1.default)().format('YYYY/MM/DD');
        }
        else if ((0, moment_1.default)(fecha, "YYYY/MM/DD").isValid()) {
            period = fecha;
        }
        else {
            return resp.status(400).json({ msg: "No es una fecha valida!" });
        }
    }
    else {
        period = (0, moment_1.default)().format('YYYY/MM/DD');
    }
    if (accion && accion == "precios") {
        command = accion;
    }
    console.time("SELECTS");
    const rsetprods = yield fsol.query(`SELECT * FROM F_ART WHERE FUMART >= #${period}#`);
    const rsetprices = yield fsol.query(`
                                            SELECT
                                            F_LTA.*
                                            FROM F_LTA 
                                            INNER JOIN F_ART ON F_ART.CODART = F_LTA.ARTLTA
                                            WHERE F_ART.FUMART >= #${period}# AND F_LTA.TARLTA NOT IN (7);`);
    console.timeEnd("SELECTS");
    if (rsetprods.length || rsetprices.length) {
        //Primero registrar los cambios en MYSQL
        // Crear un api para que se haga la solicitud hacia tiendas de una actualizacion de precios, y en cada tienda
        // se haga esta actualizacion
        // const [workpoints]:Array<any> = await vizapi.query('SELECT * FROM workpoints WHERE active=1 AND id>2;');
        // for await (const wkp of workpoints) {
        //     // console.log(wkp.id, wkp.name);
        //     const con:any = await wkpConnection(wkp);//test to knows there are connection
        //     if(con.state){
        //         console.log(wkp.name, "==> DONE!!");
        //         const action:any = await wkpRequest(wkp,{rsetprods,rsetprices},"/fsol/sync/productsprices","POST");
        //         console.log(action);
        //     }else{
        //         console.log(wkp.name, "==> REFUSED!!");
        //     }
        // }
    }
    else {
        return resp.json({ msg: "Nada por actualizar o crear" });
    }
    //sincronizar en MYSQL
    return resp.json({
        msg: "Vamo a actualizar precios!!",
        period,
        command,
        products: rsetprods.length,
        precios: rsetprices.length,
    });
});
exports.SYNCPRODUCTSPRICES = SYNCPRODUCTSPRICES;
//# sourceMappingURL=fsolCont.js.map