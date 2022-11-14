import { Router } from "express";
import { salesbysectionbyyear } from "../controllers/vizapi/resportsCont";
const router = Router();

router.get('/sales-by-section-by-year', salesbysectionbyyear);

export default router;