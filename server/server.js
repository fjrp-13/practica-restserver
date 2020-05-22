require('./config/config.js');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// importar rutas de usuario
app.use(require('./routes/usuario'));

mongoose.connect(process.env.URLDB, { //'mongodb://localhost:27017/cafe', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => { console.log(`Escuchando peticiones en el puerto ${process.env.PORT}`); });