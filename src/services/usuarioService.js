import mongoose from 'mongoose';
import { Usuario, Jugador, Lugar } from '../models/usuarioModel.js';
import { TIPOS_USUARIO, ESTADOS_USUARIO } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { obtenerTodos, obtenerPorId, eliminar } from '../utils/globalService.js';

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

export const loginUsuario = async ({ mail, password } = {}) => {
    if (!mail || !password) throw crearError('Mail y contraseña son obligatorios', 400);

    // select('+password') porque el campo tiene select:false en el modelo.
    // Solo usuarios activos: una cuenta dada de baja (borrado lógico) no puede loguearse.
    const usuario = await Usuario.findOne({ mail: mail.toLowerCase(), estado: ESTADOS_USUARIO.ACTIVO })
        .select('+password');

    // Mismo mensaje para "no existe" y "contraseña incorrecta": así no se revela qué mails
    // están registrados. 401 = no autenticado.
    const passwordValida = usuario && await usuario.compararPassword(password);
    if (!passwordValida) throw crearError('Credenciales inválidas', 401);

    return usuario;
};

export const obtenerUsuarios = () => obtenerTodos(Usuario, { estado: 'activo' });

export const obtenerUsuarioPorId = (id) => obtenerPorId(Usuario, id);

// No usa el modificar() genérico (findByIdAndUpdate) porque ese NO ejecuta el hook pre('save'):
// si se cambiaba la password, quedaba guardada en texto plano. Con findById + save() se hashea
// y además corren las validaciones del Schema.
export const modificarUsuario = async (id, datos = {}) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);

    // Igual que en el registro: tipo y estado no se cambian por acá (el estado se maneja con
    // DELETE), y estadísticas/historial/equipos los actualiza el sistema, no el usuario.
    const { tipo, estado, estadisticas, historial, equipos_conformados, _id, ...camposPermitidos } = datos;

    const usuario = await Usuario.findOne({ _id: id, estado: ESTADOS_USUARIO.ACTIVO });
    if (!usuario) throw crearError('Usuario no encontrado', 404);

    usuario.set(camposPermitidos);
    return usuario.save();
};

export const eliminarUsuario = (id) => eliminar(Usuario, id, ESTADOS_USUARIO.ACTIVO, ESTADOS_USUARIO.ELIMINADO);

