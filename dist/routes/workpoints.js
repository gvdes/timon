"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WrokpointsCont_1 = __importDefault(require("../controllers/vizapi/WrokpointsCont"));
const router = (0, express_1.Router)();
router.get('/', WrokpointsCont_1.default.all);
exports.default = router;
//# sourceMappingURL=workpoints.js.map