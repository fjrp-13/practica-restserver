const express = require('express');
const fs = require('fs'); // Para trabajar con los archivos de sistema
const path = require('path'); // Para trabajar con las rutas del filesystem
const app = express();

const { verificaTokenURL } = require('../middlewares/autenticacion');


// Parámetro "tipo": usuario o producto
// Parámetro "img": id del usuario  o producto
app.get('/imagen/:tipo/:img', verificaTokenURL, function(req, res) {
    let tipo = req.params.tipo;
    let filename = req.params.img;
    let folder = `${tipo}s`;
    let pathNoImg = path.resolve(__dirname, `../assets/img/no-image.jpg`);

    let pathImagen = path.resolve(__dirname, `../../uploads/${folder}/${filename}`);
    // Mirar si existe la imagen
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        res.sendFile(pathNoImg);
    }




});

module.exports = app;