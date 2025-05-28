import { Router } from "express";
import { getProfessionals, getCooperates, ProfAccountInfo,/* metricOperations,*/ getProfessionalById } from "../controllers/profiles";
import { updateProfile } from "../controllers/profiles"
import { getUser } from "../controllers/user";

const routes = Router();

routes.post('/profiles/professionals', getProfessionals);
routes.get('/profiles/professionals/:userId', getProfessionalById);
routes.get('/profiles/get_corporates', getCooperates);
routes.get('/profiles/me', ProfAccountInfo);
routes.post('/profiles/update', updateProfile);
// routes.post('/profiles/update-metrics/:userId', metricOperations);
routes.get('/users/:id', getUser);

export default routes;