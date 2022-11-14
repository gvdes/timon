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
exports.MASSIVELOCATIONS = exports.PINGS = exports.wkpRequest = exports.wkpConnection = void 0;
const net_1 = __importDefault(require("net"));
const http_1 = __importDefault(require("http"));
const sequelize_1 = require("sequelize");
const vizapi_1 = __importDefault(require("../../db/vizapi"));
const Product_1 = __importDefault(require("../../models/Product")); // modelo de Products
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD")); // modelo de WorkPoints
const ProductLocationsMD_1 = __importDefault(require("../../models/ProductLocationsMD")); // modelo de Producto vs ubicacion
const WarehouseSectionsMD_1 = __importDefault(require("../../models/WarehouseSectionsMD")); // modelo de Secciones de almacen
/**
 * @param wkp contains the host, port and all of about the workpoint such name, alias, etc
 * @param timeout time the promise will take to resolve
 * @returns A promise that always resolve an state true||false about de server status (meaning if server is on or off)
 */
const wkpConnection = (wkp, timeout = 1000) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const env = process.env.MODE || "dev";
        const domain = wkp.dominio.split(":"); // enabled just in production mode
        const host = env == "dev" ? "localhost" : domain[0];
        const alias = wkp.alias;
        const port = 44140; // domain[1] --> puerto
        // const host=domain[0], port=44140, alias=wkp.alias; // just for production mode
        const timer = setTimeout(() => {
            resolve({ state: false, resume: `${alias} ==> ${host}:${port} ==> TIMEOUT !!!` });
        }, timeout);
        const socket = net_1.default.createConnection(port, host, () => {
            clearTimeout(timer);
            socket.end();
            resolve({ state: true, wkp, resume: `${alias} ==> ${host}:${port} ==> DONE !!!` });
        });
        socket.on('error', (err) => {
            console.log(err.message);
            clearTimeout(timer);
            socket.end();
            resolve({ state: false, err, resume: `${alias} ==> ${host}:${port} ==> FAIL !!!` });
        });
    });
});
exports.wkpConnection = wkpConnection;
/**
 * @param wkp: Contains the info about the server workpoint such name, alias, etc
 * @param method: Method of request, default is GET
 * @param path: Request route
 * @param data: data into the object to send in request, it will always be an object
 * @returns: A promise that always resolves results of remote API
 */
const wkpRequest = (wkp, data = {}, path = "/fsol/ping", method = "GET") => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let env = process.env.MODE || "dev";
        const domain = wkp.dominio.split(":");
        const host = env == "dev" ? "localhost" : domain[0];
        const alias = wkp.alias;
        const port = 44140; // domain[1] --> puerto
        console.log("Sending REQUEST to:", `${host}:${port}`, alias, "...");
        const dataSend = JSON.stringify(data);
        const options = {
            host: host,
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(dataSend)
            }
        };
        try {
            const remotereq = http_1.default.request(options, (remoteresp) => {
                remoteresp.setEncoding('utf8');
                remoteresp.on('data', (chunk) => {
                    console.log("Response from remote server: ");
                    try {
                        let resconv = JSON.parse(chunk);
                        resolve({ state: true, wkpresp: resconv });
                    }
                    catch (error) {
                        resolve({ state: false, wkpresp: "PUMBA no devolvio una respuesta valida, revise que esté instalado, esté activo y que el puerto de conexion esté disponible" });
                    }
                });
            });
            remotereq.on('error', error => {
                const ERROR = {
                    wkpresp: "PUMBA no devolvio una respuesta valida, revise que esté instalado, esté activo y que el puerto de conexion esté disponible",
                    state: false,
                    error: `${alias} ==> ${error.message}`
                };
                console.log(error);
                resolve(ERROR);
            });
            remotereq.write(dataSend);
            remotereq.end();
        }
        catch (error) {
            console.log(error);
            resolve({ state: false, error });
        }
    });
});
exports.wkpRequest = wkpRequest;
/**
 * @function: this function it will try make a ping and request for eachone workpoints to know if server its on and responds to requests
 * @returns: it will return an object that contains workpoints (servers) status
 */
const PINGS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const wkpreq = req.body.sucursal;
    if (wkpreq) { // puede resivir una sucursal
        // look for workpoint to do the tests
        const wkp = yield WrkpointsMD_1.default.findOne({ where: {
                [sequelize_1.Op.or]: [
                    { id: wkpreq },
                    { alias: wkpreq }
                ]
            }
        });
        if (wkp && wkp.active == 1) { // validate workpoint existence and this is active
            const con = yield (0, exports.wkpConnection)(wkp); //test to knows there are connection
            if (con.state) { //if there are conection
                const remoteresp = yield (0, exports.wkpRequest)(wkp, { wkp }); // try make a request (the first wkp is to do test conection, second wkp is for show in console)
                resp.json({ wkp, con, remoteresp }); // send response about request
            }
            else {
                resp.status(502).json({ wkp, con });
            } // if there arent response, return a error server
        }
        else {
            resp.status(400).json({ "No hables tus mierdas meriyein": wkp ? `esta sucursal no esta activa (y-_-)y` : `${wkpreq} ni existe (y-_-)y` }); //if there are connection, return error server
        }
    }
    else { // if workpoint missing, it will iterate al workpoints
        const wkpsQuery = yield WrkpointsMD_1.default.findAll(); //obtiene todas las sucursales
        const wkps = JSON.parse(JSON.stringify(wkpsQuery)).filter((w) => (w.active && w.id != 1)); //filtra las sucursales a iterar
        const resume = { short: [], on: [], off: [] };
        try {
            try {
                for (var wkps_1 = __asyncValues(wkps), wkps_1_1; wkps_1_1 = yield wkps_1.next(), !wkps_1_1.done;) {
                    const wkp = wkps_1_1.value;
                    const con = yield (0, exports.wkpConnection)(wkp); //test to know if there are connection 
                    console.log(con.resume);
                    resume.short.push(con.resume); // ad short resume as good response
                    if (con.state) { //check if connection was exit
                        resume.on.push({ conection: true, wkp, api: null });
                        const remoteresp = yield (0, exports.wkpRequest)(wkp, { wkp }); //the first wkp is to do test conection, second wkp is for show in console
                        console.log(remoteresp);
                    }
                    else {
                        resume.off.push({ conection: false, wkp, api: null });
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
            resp.json({ resume });
        }
        catch (error) {
            resp.status(500).json({ resume });
        }
    }
});
exports.PINGS = PINGS;
const MASSIVELOCATIONS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _b, e_3, _c, e_4, _d;
    var _e;
    console.log("Ubicaciones masivas iniciada...");
    let rows = req.body.rows; // filas que se resiven desde el cliente (filas del excel)
    let idwrh = req.body.idwrh; // id del almacen sobre el que se va a trabajar
    const replace = (_e = req.body.replace) !== null && _e !== void 0 ? _e : false;
    let productosNoEncontrados = []; // store para almacen de productos encontrados y no encontrados
    let ubicacionesNoEncontradas = []; // almacen de ubicaciones encontradas y no encontradas
    let filasvacias = []; //almacen para filas que no tienen 
    let porunir = []; // almacen para posibles uniones
    let uniones = { exitosas: [], erroneas: [] }; // uniones completadas y uniones que fracasaron
    let desuniones = []; //almacena las desuniones realizadas
    let yaestaban = []; // uniones que ya existian
    try {
        for (var rows_1 = __asyncValues(rows), rows_1_1; rows_1_1 = yield rows_1.next(), !rows_1_1.done;) {
            const row = rows_1_1.value;
            if (row.code && row.location) {
                const prod = yield Product_1.default.findOne({ where: { code: row.code } }); // busqueda del producto
                if (prod) {
                    const product = JSON.parse(JSON.stringify(prod)); // parseo del producto encontrado
                    const paths = row.location.split(","); // obtencion de las ubicaciones a asociar (viene separads por coma desde el excel)
                    if (replace) { // eliminar las ubicaciones actuales del producto en cualquiera de los almacenes de la sucursal recibida
                        const [results] = yield vizapi_1.default.query(`
                        DELETE PL FROM product_location PL
                            INNER JOIN celler_section CS ON CS.id=PL._location
                            INNER JOIN celler C ON C.id=CS._celler
                            INNER JOIN products P ON P.id=PL._product
                            INNER JOIN workpoints W ON W.id=C._workpoint
                        WHERE W.id=${idwrh} AND P.code="${product.code}";
                    `);
                        if (results.affectedRows > 0) {
                            desuniones.push({ product: product.code, locs: results.affectedRows });
                        }
                    }
                    try {
                        for (var paths_1 = (e_3 = void 0, __asyncValues(paths)), paths_1_1; paths_1_1 = yield paths_1.next(), !paths_1_1.done;) {
                            const path = paths_1_1.value;
                            const location = yield WarehouseSectionsMD_1.default.findOne({ where: { path, _celler: idwrh } }); // se valida laexistencia de la ubicacion
                            location ?
                                porunir.push({ code: product.code, _product: product.id, _location: location.id, path }) : // producto y ubicacion que si pueden asociadas
                                ubicacionesNoEncontradas.push(path); // se agrega al store de ubicaciones no entradas
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (paths_1_1 && !paths_1_1.done && (_c = paths_1.return)) yield _c.call(paths_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                else {
                    productosNoEncontrados.push(row.code);
                } // se agrega al store de productos no encontrados
            }
            else {
                filasvacias.push(row);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (rows_1_1 && !rows_1_1.done && (_b = rows_1.return)) yield _b.call(rows_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    try {
        for (var porunir_1 = __asyncValues(porunir), porunir_1_1; porunir_1_1 = yield porunir_1.next(), !porunir_1_1.done;) {
            const row = porunir_1_1.value;
            const exAsoc = yield ProductLocationsMD_1.default.findOne({ where: { _product: row._product, _location: row._location } }); // validacion de existencia de asociacion
            if (!exAsoc) { // la asosiacion no existe 
                const Asoc = yield ProductLocationsMD_1.default.create({ _product: row._product, _location: row._location }); // inserta/crea la asociacion de producto vs ubicacion
                Asoc ? uniones.exitosas.push(row) : uniones.erroneas.push(row); // valida la creacion erronea o correcta del producto vs ubicacion 
            }
            else {
                yaestaban.push(row);
            } // si la asociacion existe, la agrega al store de ubicacion vs producto existente
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (porunir_1_1 && !porunir_1_1.done && (_d = porunir_1.return)) yield _d.call(porunir_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    resp.json({ filasprocesadas: rows.length, filasvacias, productosNoEncontrados, ubicacionesNoEncontradas, porunir, uniones, yaestaban, desuniones });
    console.log("Ubicaciones masivas finalizada...");
});
exports.MASSIVELOCATIONS = MASSIVELOCATIONS;
//# sourceMappingURL=HelpresCont.js.map