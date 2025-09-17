import { Router } from "express";
import { emailUser, getAllUsers, toggleSuspension } from "../controllers/admin/user";
import { UserAccountInfo } from "../controllers/profiles";
import { approveProducts, getProducts } from "../controllers/admin/product";
import { getActivities, getTopPerformers, overviewStat } from "../controllers/admin/dashboard";

const routes = Router();

routes.get('/:role/all', getAllUsers);
routes.get('/user/:userId', UserAccountInfo);
routes.post('/user/togggle-suspend/:userId', toggleSuspension);
routes.post('/email/message', emailUser);

routes.get('/products', getProducts);
routes.post('/products/approve/:productId', approveProducts)
routes.get('/dashboard/overview', overviewStat)
routes.get('/dashboard/activities', getActivities);
routes.get('/dashboard/top-performers', getTopPerformers)

export default routes;