import { Router } from "express";
import { createSector, deleteSector, getSectors, getSectorsMetrics, updateSector } from "../controllers/sector";
import { createProfession, deleteProfession, getProfessionById, getProfessions, updateProfession } from "../controllers/professions";
import { getProfessionals } from "../controllers/professionals";

const routes = Router();

routes.get("/sectors", getSectors);
routes.get("/sectors/details", getSectorsMetrics);
routes.post("/sectors", createSector);
routes.put("/sectors/:id", updateSector);
routes.delete("/sectors/:id", deleteSector);

routes.get("/professions", getProfessions)
routes.get("/professions/:id", getProfessionById)
routes.post("/professions", createProfession)
routes.put("/professions/:id", updateProfession)
routes.delete("professions/:id", deleteProfession)

routes.get("/professionals", getProfessionals)

export default routes;