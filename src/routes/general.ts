import { Router } from "express";
import { getSectors } from "../controllers/sector";

const routes = Router();

routes.get("/sectors", getSectors);

export default routes;