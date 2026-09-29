import mongoose from 'mongoose';
import { Usuario, Jugador, Lugar } from '../models/usuarioModel.js';
import { TIPOS_USUARIO, ESTADOS_USUARIO } from '../config/constantes.js';

// Crea un Error con un código HTTP asociado, para que el controller sepa qué status devolver.
const crearError = (mensaje, status) => Object.assign(new Error(mensaje), { status });

// Tipos que se pueden crear desde el registro público. Un Admin NO puede autoregistrarse:
// si alguien manda "tipo": "admin", se rechaza igual que un tipo inexistente.
const MODELOS_REGISTRABLES = Object.freeze({
  [TIPOS_USUARIO.JUGADOR]: Jugador,
  [TIPOS_USUARIO.LUGAR]: Lugar,
});

export const registrarUsuario = async (datos = {}) => {
  // Se descartan los campos que maneja el sistema y no el usuario: nadie debería poder
  // registrarse ya "eliminado", ni con estadísticas/historial/equipos cargados a mano.
  const { tipo, estado, estadisticas, historial, equipos_conformados, ...camposPermitidos } = datos;

  const Modelo = MODELOS_REGISTRABLES[tipo];
  if (!Modelo) {
    const tiposValidos = Object.keys(MODELOS_REGISTRABLES).join(' o ');
    throw crearError(`Tipo de usuario inválido (debe ser ${tiposValidos})`, 400);
  }

  // create() valida contra el Schema y guarda. Si falla (validación, username/mail repetido)
  // lanza el error y lo resuelve el controller -- acá NO se atrapa, para no ocultarlo.
  return Modelo.create(camposPermitidos);
};

// Baja lógica: no se borra el documento, se cambia su estado a "eliminado".
export const eliminarUsuario = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw crearError('ID de usuario inválido', 400);
  }

  const usuario = await Usuario.findOneAndUpdate(
    { _id: id, estado: ESTADOS_USUARIO.ACTIVO },
    { estado: ESTADOS_USUARIO.ELIMINADO },
    { returnDocument: 'after' } // devuelve el documento ya actualizado
  );

  if (!usuario) {
    throw crearError('Usuario no encontrado o ya eliminado', 404);
  }

  return usuario;
};
