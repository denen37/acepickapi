import { Router } from "express";
import { createSector, deleteSector, getSectors, getSectorsMetrics, updateSector } from "../controllers/sector";
import { createProfession, deleteProfession, getProfessionById, getProfessions, updateProfession } from "../controllers/professions";
import { getProfessionalById, getProfessionals } from "../controllers/professionals";
import { getCooperates } from "../controllers/cooperates";
import { createJobOrder, generateInvoice, getJobById, getJobs, getLatestJob, payforJob, respondToJob, viewInvoice } from "../controllers/Jobs";
import { UserRole } from "../enum";
import { allowRoles } from "../middlewares/allowRoles";
import { findPersonsNearby, sendEmailTest, sendSMSTest, testNotification } from "../controllers/test";
import { updateLocation } from "../controllers/location";
import { getClient } from "../controllers/client";

const routes = Router();

routes.get("/sectors", getSectors);
routes.get("/sectors/details", getSectorsMetrics);
routes.post("/sectors", createSector);
routes.put("/sectors/:id", updateSector);
routes.delete("/sectors/:id", deleteSector);

routes.get("/clients/:id", allowRoles(UserRole.CLIENT, UserRole.PROFESSIONAL), getClient);

routes.get("/professions", getProfessions);
routes.get("/professions/:id", getProfessionById);
routes.post("/professions", createProfession);
routes.put("/professions/:id", updateProfession);
routes.delete("/professions/:id", deleteProfession);

routes.get("/professionals", getProfessionals);
routes.get('/professionals/:professionalId', getProfessionalById); // Allow any role to get professional by userId

routes.get("/cooperates", getCooperates);

routes.get('/jobs/latest', getLatestJob);
routes.get('/jobs', allowRoles(UserRole.CLIENT, UserRole.PROFESSIONAL), getJobs);
routes.get('/jobs/:id', allowRoles('*'), getJobById);
routes.post('/jobs', allowRoles(UserRole.CLIENT), createJobOrder);

routes.put('/jobs/response/:jobId', allowRoles(UserRole.PROFESSIONAL), respondToJob);
routes.post('/jobs/invoice', allowRoles(UserRole.PROFESSIONAL), generateInvoice);
routes.get('/jobs/invoice/:jobId', allowRoles(UserRole.PROFESSIONAL, UserRole.CLIENT), viewInvoice);
routes.post('/jobs/payment', allowRoles(UserRole.CLIENT), payforJob);

routes.post('/notification-test', testNotification);
routes.post('/send-sms', sendSMSTest)
routes.post('/send-email', sendEmailTest)
routes.post('/nearest-person', findPersonsNearby)

routes.put('/location', updateLocation);

export default routes;