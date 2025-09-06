import { Router } from "express";
import { emailUser, getAllUsers, toggleSuspension } from "../controllers/admin/user";
import { UserAccountInfo } from "../controllers/profiles";
import { approveProducts, getProducts } from "../controllers/admin/product";

const routes = Router();

routes.get('/:role/all', getAllUsers);
routes.get('/user/:userId', UserAccountInfo);
routes.post('/user/togggle-suspend/:userId', toggleSuspension);
routes.post('/email/message', emailUser);

routes.get('/products', getProducts);
routes.post('/products/approve/:productId', approveProducts)

export default routes;