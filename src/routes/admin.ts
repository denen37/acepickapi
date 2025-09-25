import { Router } from "express";
import { emailUser, getAllUsers, toggleSuspension } from "../controllers/admin/user";
import { UserAccountInfo } from "../controllers/profiles";
import { approveProducts, getProducts } from "../controllers/admin/product";
import { getActivities, getTopPerformers, overviewStat } from "../controllers/admin/dashboard";
import {newUsersTodayCount} from "../controllers/admin/user_analytics";
import { createCommission, deleteCommission, getCommissionById, getCommissions, toggleCommission, updateCommission } from "../controllers/admin/commision";

const routes = Router();

routes.get('/:role/all', getAllUsers);
routes.get('/user/:userId', UserAccountInfo);
routes.post('/user/togggle-suspend/:userId', toggleSuspension);
routes.post('/email/message', emailUser);

routes.get('/products', getProducts);
routes.post('/products/approve/:productId', approveProducts);
routes.get('/dashboard/overview', overviewStat);
routes.get('/dashboard/activities', getActivities);
routes.get('/dashboard/top-performers', getTopPerformers);
routes.get('/dashboard/new-users-today', newUsersTodayCount);

routes.get('/commission', getCommissions);
routes.get('/commission/:id', getCommissionById);
routes.post('/commission', createCommission);
routes.put('/commission/:id', updateCommission);
routes.delete('/commission/:id', deleteCommission);
routes.post('/toggle-commission/:id', toggleCommission);

export default routes;