import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    //leer el header
    const authHeader = req.headers.authorization;

    //verificar que exista
    if (!authHeader) {
        res.status(401).json({ error: 'Token no proporcionado' });
    }else{
        //extraer el token
        const token = authHeader.split(' ')[1];

        //verificar que sea válido
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                res.status(403).json({ error: 'Token inválido o expirado' });
            }else{
                req.user = user;
                next();
            }
        });
    }
};