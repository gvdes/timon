"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fsolCont_1 = require("../controllers/fsol/fsolCont");
const router = (0, express_1.Router)();
// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/agents', fsolCont_1.SYNCAGENTS);
router.get('/sync/clients', fsolCont_1.SYNCCLIENTS);
router.get('/sync/familiarizations', fsolCont_1.SYNCPRODSFAMS);
exports.default = router;
//# sourceMappingURL=fsol.js.map