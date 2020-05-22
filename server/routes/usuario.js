const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
// valores para bcrypt
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

const Usuario = require('../models/usuario');


const app = express();

app.get('/usuario', function(req, res) {
    let start = Number(req.query.start || 0);
    let maxRecords = Number(req.query.countDocuments || 5);
    let findOptions = { estado: true }; //{ role: 'ADMIN_ROLE' };
    let returnedFields = 'nombre email role estado google img';
    Usuario.find(findOptions, returnedFields)
        .skip(start)
        .limit(maxRecords)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            Usuario.count(findOptions, (err, total_usuarios) => {
                res.json({
                    success: true,
                    total: total_usuarios,
                    usuarios
                });
            })
        });
}); // app.get

app.post('/usuario', function(req, res) {
    let body = req.body;
    // Instanciamos el modelo del Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        //img: body.img,
        role: body.role
    });

    // La respuesta es el usuario que se grabó en la BD
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        // resp.password = null

        // esta función llamará a "toJSON", por lo que no devolverá la propiedad Password
        res.json({
            success: true,
            data: usuarioDB
        });
    });
}); // app.post

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'estado']);
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }

        res.json({
            success: true,
            usuario: usuarioDB
        });
    })
}); // app.put

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;

    /*
    // Borrar el registro físicamente
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            success: true,
            usuario: usuarioBorrado
        });
    });
    */
    let newEstado = { estado: false };
    Usuario.findByIdAndUpdate(id, newEstado, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }

        res.json({
            success: true,
            usuario: usuarioDB
        });
    })
});

module.exports = app;