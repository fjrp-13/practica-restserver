const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs'); // Para trabajar con los archivos de sistema
const path = require('path'); // Para trabajar con las rutas del filesystem
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length)

// default options
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/public/tmp/'
}));

app.get('/upload/:tipo/:filename', function(req, res) {
    let tipo = req.params.tipo;
    let filename = req.params.filename;

});

// Parámetro "tipo": usuario o producto
// Parámetro "id": id del usuario  o producto
app.put('/upload/:tipo/:id', function(req, res) {
    let tiposValidos = ['producto', 'usuario'];
    let tipo = req.params.tipo;
    let id = req.params.id;

    // Validar tipo del Upload
    if (tiposValidos.indexOf(tipo.toLowerCase()) < 0) {
        return res.status(500).json({
            success: false,
            err: {
                message: "Tipo de upload permitidos: " + tiposValidos.join(', ')
            }
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            success: false,
            err: {
                message: 'No se ha subido ningún archivo.'
            }
        });
    }

    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let arrNombreArchivo = archivo.name.split('.');
    let extension = arrNombreArchivo[arrNombreArchivo.length - 1];

    // Validar extensión del fichero
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension.toLowerCase()) < 0) {
        return res.status(500).json({
            success: false,
            err: {
                message: "Extensiones permitidas: " + extensionesValidas.join(', ')
            }
        });
    }

    // Cambiar el nombre del archivo para hacerlo único (y añadir un extra para prevenir la cache del browser)
    let sufijo = generateRandomString();
    let nombreArchivo = `${id}-${sufijo}.${extension}`;
    let filepath = `uploads/${tipo}s/${nombreArchivo}`;
    return res.json({
        success: true,
        fjrp: "fjrp"
    });

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(filepath, function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                err
            });
        }

        if (tipo === 'usuario') {
            return imagenUsuario(res, id, nombreArchivo);
        } else {
            return imagenProducto(res, id, nombreArchivo);
        }

    });
});

function borrarArchivo(folder, filename) {
    let deleted = false;
    let pathImagen = path.resolve(__dirname, `../../uploads/${folder}/${filename}`);
    // Mirar si existe la imagen
    if (fs.existsSync(pathImagen)) {
        // eliminar la imagen
        fs.unlinkSync(pathImagen);
        // marcamos como eliminada
        deleted = true;
    }
    return deleted;
}



function imagenUsuario(res, id, filename) {
    let folder = 'usuarios';
    // Buscar el usuario
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            // Borrar la imagen subida
            borrarArchivo(folder, filename);
            return res.status(500).json({
                success: false,
                err
            });
        }
        if (!usuarioDB) {
            // Borrar la imagen subida
            borrarArchivo(folder, filename);
            return res.status(500).json({
                success: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        // Borrar la imagen actual
        let imagenActual = usuarioDB.img;
        borrarArchivo(folder, imagenActual);

        // Actualizar imagen
        usuarioDB.img = filename;
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    err
                });
            }
            return res.json({
                success: true,
                usuario: usuarioGuardado,
                img: filename
            })
        });
    })
}; // imagenUsuario

function imagenProducto(res, id, filename) {
    let folder = 'productos';
    // Buscar el producto
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            // Borrar la imagen subida
            borrarArchivo(folder, filename);
            return res.status(500).json({
                success: false,
                err
            });
        }
        if (!productoDB) {
            // Borrar la imagen subida
            borrarArchivo(folder, filename);
            return res.status(500).json({
                success: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }
        // Borrar la imagen actual
        let imagenActual = productoDB.img;
        console.log(imagenActual);
        borrarArchivo(folder, imagenActual);

        // Actualizar imagen
        productoDB.img = filename;
        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    err
                });
            }
            return res.json({
                success: true,
                producto: productoGuardado,
                img: filename
            })
        });
    })
}; // imagenProducto

module.exports = app;