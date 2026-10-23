// Crea un usuario Admin directamente en la base.
// Existe porque el registro público NO permite crear admins (a propósito, por seguridad),
// así que el primero hay que crearlo "desde adentro", con acceso al servidor y al .env.
//
// Uso:  npm run crear-admin -- <mail> <password> [username]
// Ej.:  npm run crear-admin -- admin@shaman.com admin12345

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/usuarioModel.js';

const [mail, password, username = 'admin'] = process.argv.slice(2);

async function crearAdmin() {
  if (!mail || !password) {
    console.error('Uso: npm run crear-admin -- <mail> <password> [username]');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();
    // create() dispara el pre('save') del modelo, así que la password se guarda hasheada
    const admin = await Admin.create({
      username,
      mail,
      password,
      nombre: 'Administrador',
      telefono: '0000000000',
    });
    console.log(`Admin creado: ${admin.username} (${admin.mail}) - id ${admin._id}`);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Ya existe un usuario con ese mail o username.');
    } else {
      console.error('No se pudo crear el admin:', error.message);
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

crearAdmin();
