// =============================
// Puerto
// =============================
process.env.PORT = process.env.PORT || 3000;

// =============================
// Entorno
// =============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =============================
// Vencimiento del token
// =============================
/* En milisegundos */
process.env.CADUCIDAD_TOKEN = 1000 * 60 * 60; // 1h = 1000 milisegundos (=1 segundo) * 60 (pasar a minutos) * 60 (pasar a horas) * 24 (pasar a días) * ...

// =============================
// SEED de autenticación
// =============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// =============================
// Base de datos
// =============================
let urlDB;

if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
// Guardamos la urlDB en una variable nueva que creamos para ello
process.env.URLDB = urlDB;

// =============================
// Google Client ID
// =============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '466986850393-6c3e1bkh6u9qegetjk6o5t4ck7o9a0l9.apps.googleusercontent.com';