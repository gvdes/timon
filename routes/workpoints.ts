import { Router } from "express";
import Workpoints from "../controllers/vizapi/WrokpointsCont"

const router = Router();

router.get('/', Workpoints.all);

export default router;