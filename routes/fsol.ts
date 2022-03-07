import { Router } from "express";
import { SYNCCLIENTS,SYNCPRODSFAMS, SYNCPRODUCTSPRICES } from "../controllers/fsol/fsolCont";
const router = Router();

// router.get('/clients', LISTCLIENTS);

// =================================
// === Trabajo con sincronizador ===
// =================================
router.get('/sync/clients', SYNCCLIENTS);
router.get('/sync/familiarizations', SYNCPRODSFAMS);
// router.get('/sync/productsprices', SYNCPRODUCTSPRICES);

export default router;