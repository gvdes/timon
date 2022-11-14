import { Router } from 'express'
import Account from '../controllers/vizapi/AccountCont'

const router = Router();

router.get('/', Account.all);
router.get('/build', Account.build);
router.get('/wkp/:wkp', Account.onWorkpoint);

export default router;