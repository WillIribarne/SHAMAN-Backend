import mongoose from 'mongoose';
import { Usuario, Jugador, Lugar } from '../models/usuarioModel.js';
import { TIPOS_USUARIO, ESTADOS_USUARIO } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { obtenerTodos, obtenerPorId, modificar, eliminar } from '../utils/globalService.js';

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

export const loginUsuario = async ({ mail, password }) => {
    // select('+password') porque el campo tiene select:false en el modelo
    const usuario = await Usuario.findOne({ mail }).select('+password');

    if (!usuario) throw crearError('Usuario no encontrado');

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) throw crearError(`Contraseña incorrecta`);

    return usuario;
};

export const obtenerUsuarios = () => obtenerTodos(Usuario, { estado: 'activo' });

export const obtenerUsuarioPorId = (id) => obtenerPorId(Usuario, id);

export const modificarUsuario = (id, datos) => modificar(Usuario, id, datos);

export const eliminarUsuario = (id) => eliminar(Usuario, id, ESTADOS_USUARIO.ACTIVO, ESTADOS_USUARIO.ELIMINADO);

