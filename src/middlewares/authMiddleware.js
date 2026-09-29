import jwt from 'jsonwebtoken';

// Verifica el JWT del header "Authorization: Bearer <token>".
// Si es válido, deja los datos del token en req.user y pasa al siguiente handler.
export const verificarToken = (req, res, next) => {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    // 401 (no autenticado): el token no sirve. 403 queda para "autenticado pero sin permiso".
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
