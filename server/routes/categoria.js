const express = require('express');
const _ = require('underscore');

// destructuración de objeto para importación de la función "verificaToken"
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');


const app = express();


// =============================
// Mostrar todas las categoriías
// =============================
app.get('/categoria', verificaToken, function(req, res) {
    //let findOptions = { estado: true }; //{ role: 'ADMIN_ROLE' };
    let findOptions = {};
    let returnedFields = 'descripcion usuario';
    Categoria.find(findOptions, returnedFields)
        .sort('descripcion')
        .populate('usuario', 'nombre email') // Revisa los objectID que existen y carga su información de otra tabla
        //.populate('campo_2', 'campos_del_campo_2') // Si hubiera más objetos de otras tablas, los añadimos con más "populate"
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            Categoria.count(findOptions, (err, total_categorias) => {
                res.json({
                    success: true,
                    total: total_categorias,
                    categorias
                });
            })
        });
}); // app.get

// =============================
// Mostrar una categoría por ID
// =============================
app.get('/categoria/:id', verificaToken, function(req, res) {
    let id = req.params.id;
    let returnedFields = 'descripcion';
    Categoria.findById(id, returnedFields)
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    success: false,
                    err: {
                        message: 'Categoría no encontrada'
                    }
                });
            }
            res.json({
                success: true,
                categoriaDB
            });
        });
}); // app.get (id)

// =============================
// Crea una categoría
// =============================
app.post('/categoria', verificaToken, function(req, res) {
    let body = req.body;
    let usuario = req.usuario; // lo tenemos en el request gracias a que lo manda "verificaToken"
    // Instanciamos el modelo de la Categoría
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario._id // id del usuario actual
    });

    // La respuesta es la categoría que se grabó en la BD
    categoria.save((err, categoriaDB) => {
        // Hay error
        if (err) {
            return res.status(500).json({
                success: false,
                err
            });
        }
        // No se pudo crear la categoría
        if (!categoriaDB) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        // Devolvemos la categoría creada
        res.json({
            success: true,
            data: categoriaDB
        });
    });
}); // app.post

// =============================
// Actualiza una categoría
// =============================
app.put('/categoria/:id', [verificaToken], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);
    // mongoose: unique validation on update    
    // https://liuzhenglai.com/post/5dbd385f8dea5b6b578765d9
    // For technical reasons, this plugin requires that you also set the context option to query.
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        res.json({
            success: true,
            categoria: categoriaDB
        });
    })
}); // app.put

// =============================
// Elimina una categoría
// =============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;

    // Borrar el registro físicamente
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }
        res.json({
            success: true,
            categoria: categoriaBorrada,
            message: 'Categoría eliminada correctamente'
        });
    });
});


/* 
app.get('/categoria', verificaToken, function(req, res) {
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

 */

module.exports = app;