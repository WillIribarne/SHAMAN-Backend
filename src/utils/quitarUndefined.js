// Devuelve una copia del objeto sin las claves cuyo valor es undefined.
// Se usa en los PUT: si el body no trae un campo, no hay que tocarlo. Ojo: el set() de
// Mongoose NO ignora los undefined, los interpreta como "borrar este campo".
export const quitarUndefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, valor]) => valor !== undefined));
