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
    //urlDB = 'mongodb+srv://bsn_admin:Pwy5uh7vf34RaFZl@cluster0-viu0r.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';
    urlDB = 'mongodb+srv://bsn_admin:Pwy5uh7vf34RaFZl@cluster0-viu0r.mongodb.net/cafe?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';
}
// Guardamos la urlDB en una variable nueva que creamos para ello
process.env.URLDB = urlDB;