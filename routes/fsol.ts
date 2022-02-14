import { Router } from "express";
import { LISTCLIENTS, SYNCCLIENTS } from "../controllers/fsol/fsolCont";
const router = Router();

router.get('/clients', LISTCLIENTS);

// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/clients', SYNCCLIENTS);

export default router;