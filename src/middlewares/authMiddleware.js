import jwt from 'jsonwebtoken';
import { TIPOS_USUARIO } from '../config/constantes.js';

// Verifica el JWT del header "Authorization: Bearer <token>".
// Si es válido, deja los datos del token en req.user y pasa al siguiente handler.
export const verificarToken = (req, res, next) => {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');

  if (esquema !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Token no proporcionado' });
  }else{
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    }catch {
      // 401 (no autenticado): el token no sirve. 403 queda para "autenticado pero sin permiso".
      res.status(401).json({ error: 'Token inválido o expirado' });
    }
  }
};

export const verificarAdmin = (req, res, next) => {
  if (req.user.tipo != TIPOS_USUARIO.ADMIN) {
    res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
  }else{
    next();
  }
};

export const verificarPropioUsuarioOAdmin = (req, res, next) => {
  const esPropioUsuario = req.user.id === req.params.id;
  const esAdmin = req.user.tipo === TIPOS_USUARIO.ADMIN;
    
  if (esPropioUsuario || esAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado' });
  }
};
