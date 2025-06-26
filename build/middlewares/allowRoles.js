"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
const allowRoles = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (user && (roles.includes(user.role) || roles.includes('*'))) {
            next();
        }
        else {
            res.status(403).json({ message: 'Forbidden' });
        }
    };
};
exports.allowRoles = allowRoles;
