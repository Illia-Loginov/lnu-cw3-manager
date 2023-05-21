import { Router } from 'express';
import { httpVerifyToken } from '../middlewares';
import { chatController } from '../controllers';

const router = Router();

router.route('/').get(httpVerifyToken, chatController.getChats);

export default router;
