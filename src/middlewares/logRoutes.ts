import { Request, Response, NextFunction } from 'express';
import { removeEnd } from '../utils/modules';
import log from '../services/logger';

export const logRoutes = (req: Request, res: Response, next: NextFunction) => {
    let route: any = req.originalUrl.split('?').shift()

    route = removeEnd(route, '/');

    log(`${req.method} - ${route}`);

    next();
}