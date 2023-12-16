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
exports.SYNCAGENTS = exports.LISTCLIENTS = exports.SYNCPRODSFAMS = exports.SYNCCLIENTS = void 0;
const node_adodb_1 = __importDefault(require("node-adodb"));
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = require("sequelize");
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD"));
const HelpresCont_1 = require("../vizapi/HelpresCont");
const fsol = node_adodb_1.default.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
const SYNCCLIENTS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    console.log("Iniciando sincronizacion de clientes..");
    const wkpreq = req.body.sucursal;
    let cambiosdetarifa = [];
    const today = (0, moment_1.default)().format('YYYY/MM/DD'); // se obtiene la fecha del dia en curso
    let query = `SELECT CODCLI,CCOCLI,NIFCLI,NOFCLI,NOCCLI,DOMCLI,POBCLI,CPOCLI,PROCLI,TELCLI,FAXCLI,PCOCLI,AGECLI,BANCLI,ENTCLI,OFICLI,DCOCLI,CUECLI,FPACLI,FINCLI,PPACLI,TARCLI,DP1CLI,DP2CLI,DP3CLI,TCLCLI,DT1CLI,DT2CLI,DT3CLI,TESCLI,CPRCLI,TPOCLI,PORCLI,IVACLI,TIVCLI,REQCLI,FALCLI,EMACLI,WEBCLI,MEMCLI,OBSCLI,HORCLI,VDECLI,VHACLI,CRFCLI,NVCCLI,NFCCLI,NICCLI,MONCLI,PAICLI,DOCCLI,DBACLI,PBACLI,SWFCLI,CO1CLI,CO2CLI,CO3CLI,CO4CLI,CO5CLI,IM1CLI,IM2CLI,IM3CLI,IM4CLI,IM5CLI,RUTCLI,SWICLI,GIRCLI,CUWCLI,CAWCLI,SUWCLI,MEWCLI,ESTCLI,AR1CLI,AR2CLI,AR3CLI,AR4CLI,AR5CLI,FELCLI,TRACLI,NCFCLI,FNACLI,FOTCLI,SKYCLI,NO1CLI,TF1CLI,EM1CLI,NO2CLI,TF2CLI,EM2CLI,NO3CLI,TF3CLI,EM3CLI,NO4CLI,TF4CLI,EM4CLI,NO5CLI,TF5CLI,EM5CLI,RETCLI,CTMCLI,MNPCLI,IFICLI,IMPCLI,NCACLI,CAMCLI,CO6CLI,IM6CLI,AR6CLI,CO7CLI,IM7CLI,AR7CLI,CO8CLI,IM8CLI,AR8CLI,CO9CLI,IM9CLI,AR9CLI,CO10CLI,IM10CLI,AR10CLI,CO11CLI,IM11CLI,AR11CLI,CO12CLI,IM12CLI,AR12CLI,ME1CLI,ME2CLI,ME3CLI,ME4CLI,ME5CLI,ME6CLI,ME7CLI,ME8CLI,ME9CLI,ME10CLI,ME11CLI,ME12CLI,CASCLI,EMOCLI,PRECLI,DTCCLI,EPETCLI,ERECCLI,ECLICLI,EPAGCLI,FUMCLI,PGCCLI,RESCLI,RFICLI,PRACLI,ACTCLI,ECOCLI,ECNCLI,EADCLI,TWICLI,A1KCLI,MOVCLI,CPFCLI,RCCCLI,MUTCLI,MRECLI,MFECLI,ACO1CLI,ADO1CLI,ACP1CLI,APO1CLI,APR1CLI,APA1CLI,ACO2CLI,ADO2CLI,ACP2CLI,APO2CLI,APR2CLI,APA2CLI,ACO3CLI,ADO3CLI,ACP3CLI,APO3CLI,APR3CLI,APA3CLI,IEUCLI,ACO4CLI,ADO4CLI,ACP4CLI,APO4CLI,APR4CLI,APA4CLI,BTRCLI,CFECLI,COPCLI,MDFCLI,APDCLI,PECCLI,MDACLI,TRECLI,CVICLI,FAVCLI,FCBCLI,ITGCLI,FEFCLI,ATVCLI,DECCLI,SDCCLI,CROCLI FROM F_CLI WHERE FUMCLI=#${today}#;`; // query por default a ejecutar
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
            query = `SELECT CODCLI,CCOCLI,NIFCLI,NOFCLI,NOCCLI,DOMCLI,POBCLI,CPOCLI,PROCLI,TELCLI,FAXCLI,PCOCLI,AGECLI,BANCLI,ENTCLI,OFICLI,DCOCLI,CUECLI,FPACLI,FINCLI,PPACLI,TARCLI,DP1CLI,DP2CLI,DP3CLI,TCLCLI,DT1CLI,DT2CLI,DT3CLI,TESCLI,CPRCLI,TPOCLI,PORCLI,IVACLI,TIVCLI,REQCLI,FALCLI,EMACLI,WEBCLI,MEMCLI,OBSCLI,HORCLI,VDECLI,VHACLI,CRFCLI,NVCCLI,NFCCLI,NICCLI,MONCLI,PAICLI,DOCCLI,DBACLI,PBACLI,SWFCLI,CO1CLI,CO2CLI,CO3CLI,CO4CLI,CO5CLI,IM1CLI,IM2CLI,IM3CLI,IM4CLI,IM5CLI,RUTCLI,SWICLI,GIRCLI,CUWCLI,CAWCLI,SUWCLI,MEWCLI,ESTCLI,AR1CLI,AR2CLI,AR3CLI,AR4CLI,AR5CLI,FELCLI,TRACLI,NCFCLI,FNACLI,FOTCLI,SKYCLI,NO1CLI,TF1CLI,EM1CLI,NO2CLI,TF2CLI,EM2CLI,NO3CLI,TF3CLI,EM3CLI,NO4CLI,TF4CLI,EM4CLI,NO5CLI,TF5CLI,EM5CLI,RETCLI,CTMCLI,MNPCLI,IFICLI,IMPCLI,NCACLI,CAMCLI,CO6CLI,IM6CLI,AR6CLI,CO7CLI,IM7CLI,AR7CLI,CO8CLI,IM8CLI,AR8CLI,CO9CLI,IM9CLI,AR9CLI,CO10CLI,IM10CLI,AR10CLI,CO11CLI,IM11CLI,AR11CLI,CO12CLI,IM12CLI,AR12CLI,ME1CLI,ME2CLI,ME3CLI,ME4CLI,ME5CLI,ME6CLI,ME7CLI,ME8CLI,ME9CLI,ME10CLI,ME11CLI,ME12CLI,CASCLI,EMOCLI,PRECLI,DTCCLI,EPETCLI,ERECCLI,ECLICLI,EPAGCLI,FUMCLI,PGCCLI,RESCLI,RFICLI,PRACLI,ACTCLI,ECOCLI,ECNCLI,EADCLI,TWICLI,A1KCLI,MOVCLI,CPFCLI,RCCCLI,MUTCLI,MRECLI,MFECLI,ACO1CLI,ADO1CLI,ACP1CLI,APO1CLI,APR1CLI,APA1CLI,ACO2CLI,ADO2CLI,ACP2CLI,APO2CLI,APR2CLI,APA2CLI,ACO3CLI,ADO3CLI,ACP3CLI,APO3CLI,APR3CLI,APA3CLI,IEUCLI,ACO4CLI,ADO4CLI,ACP4CLI,APO4CLI,APR4CLI,APA4CLI,BTRCLI,CFECLI,COPCLI,MDFCLI,APDCLI,PECCLI,MDACLI,TRECLI,CVICLI,FAVCLI,FCBCLI,ITGCLI,FEFCLI,ATVCLI,DECCLI,SDCCLI,CROCLI FROM F_CLI WHERE FUMCLI Between #${from}# and #${to}#;`;
        }
        else {
            from = today; // desde
            to = today; // hasta
        }
        try {
            let clrows = yield fsol.query(query); // se ejecuta el query y se obtienen filas
            cllength = clrows.length; //tamaño de las filas
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
                            for (var _d = true, wkps_1 = __asyncValues(wkps), wkps_1_1; wkps_1_1 = yield wkps_1.next(), _a = wkps_1_1.done, !_a; _d = true) {
                                _c = wkps_1_1.value;
                                _d = false;
                                const wkp = _c;
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
                                if (!_d && !_a && (_b = wkps_1.return)) yield _b.call(wkps_1);
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
        catch (error) { }
    }
    else {
        return resp.status(400).json({ error: `${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar` });
    }
});
exports.SYNCCLIENTS = SYNCCLIENTS;
const SYNCPRODSFAMS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, e_2, _f, _g;
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
                    for (var _h = true, wkps_2 = __asyncValues(wkps), wkps_2_1; wkps_2_1 = yield wkps_2.next(), _e = wkps_2_1.done, !_e; _h = true) {
                        _g = wkps_2_1.value;
                        _h = false;
                        const wkp = _g;
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
                        if (!_h && !_e && (_f = wkps_2.return)) yield _f.call(wkps_2);
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
const SYNCAGENTS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, e_3, _k, _l;
    console.log("Iniciando sincronizacion de Agentes...");
    const wkpreq = req.body.sucursal;
    const today = (0, moment_1.default)().format('YYYY/MM/DD'); // se obtiene la fecha del dia en curso
    const rangedates = req.body.periodo || null; // desde
    const command = req.body.accion || "ver"; // desde
    let from = undefined; // desde
    let to = undefined; // hasta
    let qagents = `SELECT * FROM F_AGE WHERE FALAGE=#${today}#;`; // query por default a ejecutar
    let qdeps = `SELECT T_DEP.* FROM T_DEP INNER JOIN F_AGE ON F_AGE.CODAGE = T_DEP.CODDEP WHERE F_AGE.FALAGE=${today}#`; // query por default a ejecutar
    let resumen = { goals: [], fails: [] };
    try {
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
                qagents = `SELECT * FROM F_AGE WHERE FALAGE Between #${from}# and #${to}#;`;
                qdeps = `SELECT T_DEP.* FROM T_DEP INNER JOIN F_AGE ON F_AGE.CODAGE = T_DEP.CODDEP WHERE F_AGE.FALAGE Between #${from}# and #${to}#;`;
            }
            else {
                from = today; // desde
                to = today; // hasta
            }
            let rset_agentes = yield fsol.query(qagents);
            let rset_dependientes = yield fsol.query(qdeps);
            if (rset_agentes.length || rset_dependientes.length) {
                let agentes = rset_agentes.map(a => `${a.CODAGE}::${a.NOMAGE}::${a.FALAGE}`);
                let dependientes = rset_dependientes.map(d => `${d.CODDEP}::${d.NOMDEP}::${d.CLADEP}`);
                console.log(`Agentes por sincronizar ==> ${agentes.length}`);
                if (command == "ver") {
                    return resp.json({ command, inicio: from, fin: to, resumen: { agentes, dependientes } });
                }
                if (command == "sync") {
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
                                console.log(`Actualizando agentes en ${wkp.alias}...`);
                                const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rset_agentes, rset_dependientes }, "/fsol/sync/agents", "POST");
                                console.log(`Actualizacion de agentes finalizada en ${wkp.alias}...`);
                                resp.json({ command, inicio: from, fin: to, action }); // send response about request
                            }
                            else {
                                resp.status(502).json({ wkp, con });
                            } // if there arent response, return a error server
                        }
                        else {
                            //if there are connection, return error server
                            resp.status(400).json({ "No hables tus mierdas meriyein": wkp ? `esta sucursal no esta activa (y-_-)y` : `${wkpreq} ni existe (y-_-)y` });
                        }
                    }
                    else {
                        const workpoints = yield WrkpointsMD_1.default.findAll();
                        const wkps = JSON.parse(JSON.stringify(workpoints)).filter((w) => (w.active && w.id > 2));
                        try {
                            for (var _m = true, wkps_3 = __asyncValues(wkps), wkps_3_1; wkps_3_1 = yield wkps_3.next(), _j = wkps_3_1.done, !_j; _m = true) {
                                _l = wkps_3_1.value;
                                _m = false;
                                const wkp = _l;
                                const con = yield (0, HelpresCont_1.wkpConnection)(wkp);
                                if (con.state) {
                                    console.log(`Actualizando agentes en ${wkp.alias}...`);
                                    const action = yield (0, HelpresCont_1.wkpRequest)(wkp, { rset_agentes, rset_dependientes }, "/fsol/sync/agents", "POST");
                                    console.log(`Actualizacion de agentes finalizada en ${wkp.alias}...`);
                                    resumen.goals.push(action);
                                }
                                else {
                                    const PING = `${wkp.alias} ==> REJECT!!`;
                                    resumen.fails.push({ PING });
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (!_m && !_j && (_k = wkps_3.return)) yield _k.call(wkps_3);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        console.log(`Actualizacion de agentes finalizada!!!`);
                        resp.json({ command, inicio: from, fin: to, resumen }); // send response about request
                    }
                }
            }
            else {
                return resp.json({ "msg": "Nada por Actualizar!", "accion": command, inicio: from, fin: to, rset_agentes, rset_dependientes });
            }
        }
        else {
            return resp.status(400).json({ error: `${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar` });
        }
    }
    catch (error) {
        resp.status(500).json(error);
    }
});
exports.SYNCAGENTS = SYNCAGENTS;
//# sourceMappingURL=fsolCont.js.map