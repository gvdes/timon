"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resportsCont_1 = require("../controllers/vizapi/resportsCont");
const router = (0, express_1.Router)();
router.get('/sales-by-section-by-year', resportsCont_1.salesbysectionbyyear);
exports.default = router;
//# sourceMappingURL=reports.js.map