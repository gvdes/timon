import { Router } from "express";
import { SYNCCLIENTS,SYNCPRODSFAMS } from "../controllers/fsol/fsolCont";
const router = Router();

// router.get('/clients', LISTCLIENTS);

// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/clients', SYNCCLIENTS);
router.get('/sync/familiarizations', SYNCPRODSFAMS);

export default router;