
import { NextFunction, Response, Request } from "express";
import config from "../config/configSetup"
import { handleResponse, removeEnd } from "../utils/modules";
import { verify } from "jsonwebtoken";
import { ExtendedError, Socket } from "socket.io";
// const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";



export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
    //this is the url without query params
    let route: any = req.originalUrl.split('?').shift()
    route = removeEnd(route, '/');
    let publicRoutes: string[] = config.PUBLIC_ROUTES!;

    let isPublicRoute = publicRoutes.includes(route)

    if (isPublicRoute) return next();

    let token: any = req.headers.authorization;
    if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);
    token = token.split(' ')[1];

    if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);
    let verified: any = verify(token, config.TOKEN_SECRET);
    if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);
    if (verified.admin === true) {
        req.admin = verified;
    } else {
        req.user = verified;
    }

    next();
};


export const socketAuthorize = async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('Unauthorized'));
    }

    try {
        const decoded = verify(token, config.TOKEN_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Unauthorized'));
    }
};