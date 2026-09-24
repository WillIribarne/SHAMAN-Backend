import { Jugador, Lugar, Admin } from '../models/usuarioModel.js';
import { TIPOS_USUARIO } from '../config/constantes.js';
//import { Usuario } from '../models/usuarioModel.js';

export const registrarUsuario = async (datos) => {
    console.log('datos recibidos:', datos);
    const { tipo, ...resto } = datos;
    // desestructuramos el tipo del resto de los dato

    let usuario;

    if (tipo === TIPOS_USUARIO.JUGADOR) {
        usuario = new Jugador(resto);
        console.log('1 usuario creado:', usuario);
    } else if (tipo === TIPOS_USUARIO.LUGAR) {
        usuario = new Lugar(resto);
        console.log('2 usuario creado:', usuario);
    } else if (tipo === TIPOS_USUARIO.ADMIN) {
        usuario = new Admin(resto);
        console.log('3 usuario creado:', usuario);
    } else {
        console.log('4 err');
        throw new Error('Tipo de usuario inválido');
    }

    /*await usuario.save();
    console.log('usuario guardado:', usuario); // ¿llega acá?
    console.log('guardado exitosamente');
    return usuario;*/
    try {
        await usuario.save();
        console.log('guardado exitosamente');
        return usuario;
    } catch (error) {
        console.log('error al guardar:', error.message);
    }
};

