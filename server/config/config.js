// =============================
// Puerto
// =============================
process.env.PORT = process.env.PORT || 3000;

// =============================
// Entorno
// =============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =============================
// Base de datos
// =============================
let urlDB;

if (process.env.NODE_ENV == 'dev' && false) {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
// Guardamos la urlDB en una variable nueva que creamos para ello
process.env.URLDB = urlDB;