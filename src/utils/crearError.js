export const crearError = (mensaje, status) => 
    Object.assign(new Error(mensaje), { status });