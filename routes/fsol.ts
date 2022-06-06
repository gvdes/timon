import { Router } from "express";
import { SYNCCLIENTS,SYNCPRODSFAMS,SYNCAGENTS } from "../controllers/fsol/fsolCont";
const router = Router();

// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/agents', SYNCAGENTS);
router.get('/sync/clients', SYNCCLIENTS);
router.get('/sync/familiarizations', SYNCPRODSFAMS);

export default router;