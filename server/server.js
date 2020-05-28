// Configuración
require('./config/config.js');

// Require necesarios
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // importar la utilidad "PATH" de Node para poder resolver path's

// Iniciar el express
const app = express();

// Configuración del Body Parser (se podría poner en la configuración)
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


// Habilitar la carpeta public
const publicPath = path.resolve(__dirname, '../public'); // Resolver el path
app.use(express.static(publicPath));

// Importación global de rutas
app.use(require('./routes/index'));

// Mongoose (podría estar en su propio archivo)
mongoose.connect(process.env.URLDB, { //'mongodb://localhost:27017/cafe', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

// Escuchar el puerto definido
app.listen(process.env.PORT, () => { console.log(`Escuchando peticiones en el puerto ${process.env.PORT}`); });