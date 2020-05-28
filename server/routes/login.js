const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
}

/*
1.- Cuando hacemos un POSTEO de google, recibimos el token
2.- Verificamos el token recibido con la función de google "verify"
3.- Si la verificación es correcta, obtendremos un objeto "googleUser" con cierta información del usuario
4.- Utilizamos ese "googleUser" para buscar en nuestra BD un usuario con ese "email"
5.- Si el usuario existe en nuestra BD:
5.1.- Si no estaba creado desde google (propiedad google=false), use usuario debe utilizar el método de autenticación "normal"
5.2.- Si estaba creado desde google (propiedad google=true), le renovamos el token 
6.- Si el usuario NO existe en nuestra BD:
6.1.- Creamos el usuario en nuestra BD, asignándole un pwd por defecto que no podrá utilizarse para identificarse
*/
app.post('/google', async function(req, res) {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(err => {
            return res.json({
                success: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // Se produce un error
        if (err) {
            /* 
                        return res.status(500).json({
                            success: false,
                            err
                        });
             */
            return res.json({
                success: false,
                err
            });
        }

        if (usuarioDB) {
            // Se encuentra el usuario, pero no está creado "desde desde google"
            if (usuarioDB.google === false) {
                /*                 
                                return res.status(400).json({
                                    success: false,
                                    err: {
                                        message: 'Debe de usar su autenticación normal'
                                    }
                                });
                 */
                // return {
                //     success: false,
                //     err: {
                //         message: 'Debe de usar su autenticación normal'
                //     }
                // };
                return res.json({
                    success: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                // Usuario creado desde google: hay que renovar su token
                let payload = {
                    usuario: usuarioDB
                };
                let token = jwt.sign(payload, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    success: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {

            // El usuario no existe en la BD
            let usuario = new Usuario();
            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)'; // Definimos algo para pasar la validación de nuestra BD. No se podrán identificar con este password porque si pasan este valor, se le hará "hash" de N vueltas, por lo que nunca coincidirá. 

            // Creamos el usuario en la DB
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.json({
                        success: false,
                        err
                    });
                }

                let payload = {
                    usuario: usuarioDB
                };
                let token = jwt.sign(payload, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    success: true,
                    usuario: usuarioDB,
                    token
                });

            })
        }

    })

    //res.json(user);
});

module.exports = app;