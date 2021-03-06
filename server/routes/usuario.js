const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
// destructuración de objeto para importación de la función "verificaToken"
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
// valores para bcrypt
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

const Usuario = require('../models/usuario');


const app = express();

app.get('/usuario', verificaToken, function(req, res) {

    // Aquí podríamos usar directamente el usuario ya que el middleware de verificación del token (verificaToken) 
    // devuelve el usuario "verificado" y, por eso, lo tenemos accesible en la respuesta (parámetro "res")
    /*     
        return res.json({
            usuario: req.usuario,
            nombre: req.usuario.nombre,
            email: req.usuario.email
        });
     */

    let start = Number(req.query.start || 0);
    let limit = Number(req.query.limit || 5);
    let findOptions = { estado: true }; //{ role: 'ADMIN_ROLE' };
    let returnedFields = 'nombre email role estado google img';
    Usuario.find(findOptions, returnedFields)
        .skip(start)
        .limit(limit)
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

app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {
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

app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'estado']);
    // mongoose: unique validation on update    
    // https://liuzhenglai.com/post/5dbd385f8dea5b6b578765d9
    // For technical reasons, this plugin requires that you also set the context option to query.
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {
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

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
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