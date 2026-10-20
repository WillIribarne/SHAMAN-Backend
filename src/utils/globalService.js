import mongoose from 'mongoose';

export const obtenerTodos = async (Modelo, filtro = {}) => {
    return Modelo.find(filtro);
};

export const obtenerPorId = async (Modelo, id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const doc = await Modelo.findById(id);
    if (!doc) throw crearError('No encontrado', 404);
    return doc;
};

export const modificar = async (Modelo, id, datos) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const doc = await Modelo.findByIdAndUpdate(id, datos, { returnDocument: 'after' });
    if (!doc) throw crearError('No encontrado', 404);
    return doc;
};

export const eliminar = async (Modelo, id, estadoActivo, estadoEliminado) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const doc = await Modelo.findOneAndUpdate(
        { _id: id, estado: estadoActivo },
        { estado: estadoEliminado },
        { returnDocument: 'after' }
    );
    if (!doc) throw crearError('No encontrado o ya eliminado', 404);
    return doc;
};