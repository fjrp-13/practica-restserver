const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();


app.post('/login', function(req, res) {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                success: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                success: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });

        }
        console.log(process.env.CADUCIDAD_TOKEN);
        let payload = {
            usuario: usuarioDB
        };
        let token = jwt.sign(payload, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        // esta función llamará a "toJSON", por lo que no devolverá la propiedad Password
        res.json({
            success: true,
            token
        });
    });
}); // app.post

module.exports = app;