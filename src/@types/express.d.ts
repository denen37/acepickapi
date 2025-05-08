export { }

declare global {
    namespace Express {
        export interface Request {
            user?: any;
            admin?: any;
            query?: any;
            token?: string
        }
    }
}