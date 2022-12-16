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
const express_1 = __importDefault(require("express"));
const vizapi_1 = __importDefault(require("../db/vizapi"));
const fsol_1 = __importDefault(require("../routes/fsol"));
const accounts_1 = __importDefault(require("../routes/accounts"));
const workpoints_1 = __importDefault(require("../routes/workpoints"));
const helpers_1 = __importDefault(require("../routes/helpers"));
const simba_1 = require("../db/simba");
class Server {
    constructor() {
        this.paths = {
            fsol: "/fsol",
            gsol: '/gsol',
            accounts: '/accounts',
            workpoints: '/workpoints',
            helpers: '/helpers'
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "2200";
        this.vizapidb();
        this.middlewares();
        this.routes();
    }
    vizapidb() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield vizapi_1.default.authenticate();
                console.log("VizapiDB online!!");
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    middlewares() {
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express_1.default.static('./public'));
    }
    routes() {
        this.app.use(this.paths.fsol, fsol_1.default);
        this.app.use(this.paths.accounts, accounts_1.default);
        this.app.use(this.paths.workpoints, workpoints_1.default);
        this.app.use(this.paths.helpers, helpers_1.default);
    }
    run() {
        this.app.listen(this.port, () => {
            console.log("Timon runing's on", this.port, '...');
        });
        (0, simba_1.SIMBA)();
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map