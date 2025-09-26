import { Router } from "express";
import { emailUser, getAllUsers, toggleSuspension } from "../controllers/admin/user";
import { UserAccountInfo } from "../controllers/profiles";
import { approveProducts, getProducts } from "../controllers/admin/product";
import { getActivities, getTopPerformers, overviewStat } from "../controllers/admin/dashboard";
import { newUsersTodayCount, cumulativeUsersByMonth, getWeeklyUserGrowth, getCurrentVsPreviousWeekGrowth } from "../controllers/admin/user_analytics";
import { createCommission, deleteCommission, getCommissionById, getCommissions, toggleCommission, updateCommission } from "../controllers/admin/commision";
import { getMonthlyRevenue, getMonthlyRevenueByCategory, getMonthlyRevenueWithCumulative, getRevenueByCategory } from "../controllers/admin/revenue_analytics";

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
routes.get('/dashboard/cummulative-users', cumulativeUsersByMonth);
routes.get('/dashboard/weekly-user-growth', getWeeklyUserGrowth);
routes.get('/dashboard/curr-vs-prev-week-growth', getCurrentVsPreviousWeekGrowth);

routes.get('/revenue/monthly', getMonthlyRevenue);
routes.get('/revenue/monthly-cummulative', getMonthlyRevenueWithCumulative);
routes.get('/revenue/by-category', getRevenueByCategory);
routes.get('/revenue/monthly-by-category', getMonthlyRevenueByCategory);

routes.get('/commission', getCommissions);
routes.get('/commission/:id', getCommissionById);
routes.post('/commission', createCommission);
routes.put('/commission/:id', updateCommission);
routes.delete('/commission/:id', deleteCommission);
routes.post('/toggle-commission/:id', toggleCommission);

export default routes;