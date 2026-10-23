export const responderError = (res, error) => {
    if (error.status) {
        return res.status(error.status).json({ error: error.message });
    }
    if (error.name === 'ValidationError') {
        const detalles = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ error: 'Datos inválidos', detalles });
    }
    // CastError: Mongoose no pudo convertir un valor al tipo del Schema (p.ej. un id mal
    // formado dentro del body, o un número donde va un texto). Es un error del cliente -> 400.
    if (error.name === 'CastError') {
        return res.status(400).json({ error: `Valor inválido para el campo '${error.path}'` });
    }
    if (error.code === 11000) {
        const campos = Object.keys(error.keyValue ?? {}).join(', ');
        return res.status(409).json({ error: `Ya existe un registro con ese ${campos}` });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
};