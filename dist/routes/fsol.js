"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fsolCont_1 = require("../controllers/fsol/fsolCont");
const router = (0, express_1.Router)();
router.get('/clients', fsolCont_1.LISTCLIENTS);
// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/clients', fsolCont_1.SYNCCLIENTS);
exports.default = router;
//# sourceMappingURL=fsol.js.map