import { Router } from "express";
import { MASSIVELOCATIONS, PINGS } from "../controllers/vizapi/HelpresCont";

const router = Router();

router.get('/pings',PINGS);
router.post('/masivelocations', MASSIVELOCATIONS);

export default router;