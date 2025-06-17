import 'express';

declare global {
    namespace Express {
        interface Request {
            requestId?: string; // Add your custom property here
        }
    }
}