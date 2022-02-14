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
const Product_1 = __importDefault(require("../../models/Product")); // modelo de Products
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD")); // modelo de WorkPoints
const ProductLocationsMD_1 = __importDefault(require("../../models/ProductLocationsMD")); // modelo de Producto vs ubicacion
const WarehouseSectionsMD_1 = __importDefault(require("../../models/WarehouseSectionsMD")); // modelo de Secciones de almacen}
/**
 * @param wkp contains the host, port and all of about the workpoint such name, alias, etc
 * @param timeout time the promise will take to resolve
 * @returns A promise that always resolve an state true||false about de server status (meaning if server is on or off)
 */
const wkpConnection = (wkp, timeout = 1000) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        // const host="localhost", port=4400, alias=wkp.alias;
        const domain = wkp.dominio.split(":"); // enabled just in production mode
        const host = domain[0], port = domain[1], alias = wkp.alias; // just for production mode
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
        // setTimeout(()=>{
        const host = "localhost", port = 4400, alias = wkp.alias;
        const domain = wkp.dominio.split(":");
        // const host=domain[0], port=domain[1]; /// activar solo para produccion!!
        console.log("Sending REQUEST to:", host, port, alias, "...");
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
                    let resconv = JSON.parse(chunk);
                    resolve({ state: true, wkpresp: resconv });
                });
            });
            remotereq.on('error', error => { console.log(error); resolve({ state: false, error: `${alias} ==> ${error.message}` }); });
            remotereq.write(dataSend);
            remotereq.end();
        }
        catch (error) {
            console.log(error);
            resolve({ state: false, error });
        }
        // },300);
    });
});
exports.wkpRequest = wkpRequest;
/**
 * @function: this function it will try make a ping and request for eachone workpoints to know if server its on and responds to requests
 * @returns: it will return an object that contains workpoints (servers) status
 */
const PINGS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const wkpsreq = yield WrkpointsMD_1.default.findAll();
    const wkps = JSON.parse(JSON.stringify(wkpsreq)).filter((w) => (w.active && w.id != 1));
    // const wkps:Array<any> = JSON.parse(JSON.stringify(wkpsreq));
    const resume = { short: [], on: [], off: [] };
    try {
        try {
            for (var wkps_1 = __asyncValues(wkps), wkps_1_1; wkps_1_1 = yield wkps_1.next(), !wkps_1_1.done;) {
                const wkp = wkps_1_1.value;
                const con = yield (0, exports.wkpConnection)(wkp);
                console.log(con.resume);
                resume.short.push(con.resume);
                if (con.state) {
                    resume.on.push({ conection: true, wkp, api: null });
                    const remoteresp = yield (0, exports.wkpRequest)(wkp, { wkp });
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
});
exports.PINGS = PINGS;
const MASSIVELOCATIONS = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _b, e_3, _c, e_4, _d;
    let rows = req.body.rows; // filas que se resiven desde el cliente (filas del excel)
    let idwrh = req.body.idwrh; // id del almacen sobre el que se va a trabaja
    let productosNoEncontrados = []; // store para almacen de productos encontrados y no encontrados
    let ubicacionesNoEncontradas = []; // almacen de ubicaciones encontradas y no encontradas
    let porunir = []; // almacen para posibles uniones
    let uniones = { exitosas: [], erroneas: [] }; // uniones completadas y uniones que fracasaron
    let yaestaban = []; // uniones que ya existian
    try {
        for (var rows_1 = __asyncValues(rows), rows_1_1; rows_1_1 = yield rows_1.next(), !rows_1_1.done;) {
            const row = rows_1_1.value;
            const prod = yield Product_1.default.findOne({ where: { code: row.code } }); // busqueda del producto
            if (prod) {
                const product = JSON.parse(JSON.stringify(prod)); // parseo del producto encontrado
                const paths = row.location.split(","); // obtencion de las ubicaciones a asociar (viene separads por coma desde el excel)
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
    resp.json({ filasprocesadas: rows.length, productosNoEncontrados, ubicacionesNoEncontradas, porunir, uniones, yaestaban });
});
exports.MASSIVELOCATIONS = MASSIVELOCATIONS;
//# sourceMappingURL=HelpresCont.js.map