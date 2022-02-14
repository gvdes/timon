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
const AccountMD_1 = __importDefault(require("../../models/AccountMD"));
const WrkpointsMD_1 = __importDefault(require("../../models/WrkpointsMD"));
const build = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const newuser = AccountMD_1.default.build({ nick: "Gaby", password: "123456789" });
    resp.json({ newuser });
});
const all = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield AccountMD_1.default.findAll({
        attributes: { exclude: ['password'] }
    });
    resp.json({ accounts });
});
const onWorkpoint = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const wkp = 5;
    // const accounts = await AccountMD.findAll({
    //     where:{ "_wp_principal":wkp },
    //     attributes: { exclude:['password'] }
    // });
    // console.log( accounts );
    // resp.json({ accounts });
    try {
        const accounts = yield WrkpointsMD_1.default.hasMany(AccountMD_1.default, {
            foreignKey: "_wp_principal"
        });
        console.log(accounts);
        resp.json({ accounts });
    }
    catch (error) {
        console.log(error);
        resp.status(500).json({ error });
    }
});
exports.default = { build, all, onWorkpoint };
//# sourceMappingURL=AccountCont.js.map