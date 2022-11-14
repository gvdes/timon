"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AccountCont_1 = __importDefault(require("../controllers/vizapi/AccountCont"));
const router = (0, express_1.Router)();
router.get('/', AccountCont_1.default.all);
router.get('/build', AccountCont_1.default.build);
router.get('/wkp/:wkp', AccountCont_1.default.onWorkpoint);
exports.default = router;
//# sourceMappingURL=accounts.js.map