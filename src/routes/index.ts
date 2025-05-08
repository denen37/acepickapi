import { Router } from 'express';
import { apiIndex } from '../controllers/index';

const routes = Router();

routes.get('/', apiIndex)

export default routes;