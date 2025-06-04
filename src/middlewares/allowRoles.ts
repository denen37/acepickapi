export const allowRoles = (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
        const user = req.user;
        console.log('user', user)
        if (user && roles.includes(user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    };
}