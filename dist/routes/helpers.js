"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HelpresCont_1 = require("../controllers/vizapi/HelpresCont");
const router = (0, express_1.Router)();
router.get('/pings', HelpresCont_1.PINGS);
router.post('/masivelocations', HelpresCont_1.MASSIVELOCATIONS);
exports.default = router;
//# sourceMappingURL=helpers.js.map