import { responderError } from './responderError.js';

export const manejarRuta = (fn, status = 200) => {
    return async (req, res) => {
        try {
            const resultado = await fn(req);
            res.status(status).json(resultado);
        } catch (error) {
            responderError(res, error);
        }
    };  
};