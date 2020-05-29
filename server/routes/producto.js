const express = require('express');
const _ = require('underscore');

// destructuración de objeto para importación de la función "verificaToken"
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();
const Producto = require('../models/producto');


// =============================
// Mostrar todos los productos
// =============================
app.get('/producto', verificaToken, function(req, res) {
    let start = Number(req.query.start || 0);
    let limit = Number(req.query.limit || 5);
    //let findOptions = { estado: true }; //{ role: 'ADMIN_ROLE' };
    let findOptions = { disponible: true };
    let returnedFields = ''; //'nombre precioUni';
    Producto.find(findOptions, returnedFields)
        .sort('nombre')
        .populate('usuario', 'nombre email') // Revisa los objectID que existen y carga su información de otra tabla
        .populate('categoria', 'descripcion') // Si hubiera más objetos de otras tablas, los añadimos con más "populate"
        .skip(start)
        .limit(limit)
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            // Producto.estimatedDocumentCount()
            //     .then(count => {
            //         return res.json({
            //             success: true,
            //             from: 'estimatedDocumentCount',
            //             total: count,
            //             productos
            //         });
            //     })
            //     .catch(err => {
            //         return res.status(400).json({
            //             success: false,
            //             err
            //         });
            //     });

            Producto.countDocuments(findOptions, (err, total_productos) => {
                return res.json({
                    success: true,
                    from: 'countDocuments',
                    total: total_productos,
                    //                    total2: numProductos,
                    productos
                });
            })

        });
}); // app.get

// =============================
// Mostrar un producto por ID
// =============================
app.get('/producto/:id', verificaToken, function(req, res) {
    let id = req.params.id;
    let returnedFields = 'nombre precioUni disponible descripcion';
    Producto.findById(id, returnedFields)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    success: false,
                    err: {
                        message: 'Producto no encontrado.'
                    }
                });
            }
            res.json({
                success: true,
                productoDB
            });
        });
}); // app.get (id)

// =============================
// Mostrar un producto por ID
// =============================
app.get('/producto/search/:termino', verificaToken, function(req, res) {
    let termino = req.params.termino;
    let searchRegExp = new RegExp(termino, 'gi');
    let returnedFields = 'nombre precioUni disponible descripcion';
    let findOptions = { nombre: searchRegExp };
    Producto.find(findOptions, returnedFields)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            if (!productosDB) {
                return res.status(400).json({
                    success: false,
                    err: {
                        message: 'Productos no encontrados.'
                    }
                });
            }
            res.json({
                success: true,
                productosDB
            });
        });
}); // app.get (search)

// =============================
// Crea un producto
// =============================
app.post('/producto', verificaToken, function(req, res) {
    let body = req.body;
    let usuario = req.usuario; // lo tenemos en el request gracias a que lo manda "verificaToken"
    // Instanciamos el modelo de la Categoría
    let producto = new Producto({
        usuario: usuario._id, // id del usuario actual
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    // La respuesta es el producto que se grabó en la BD
    producto.save((err, productoDB) => {
        // Hay error
        if (err) {
            return res.status(500).json({
                success: false,
                err
            });
        }
        // No se pudo crear el producto
        if (!productoDB) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        // Devolvemos el producto creado
        res.status(201).json({
            success: true,
            data: productoDB
        });
    });
}); // app.post


// =============================
// Actualiza un producto
// =============================
app.put('/producto/:id', [verificaToken], function(req, res) {
    let id = req.params.id;
    /*
        let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

        // mongoose: unique validation on update    
        // https://liuzhenglai.com/post/5dbd385f8dea5b6b578765d9
        // For technical reasons, this plugin requires that you also set the context option to query.
        Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            res.json({
                success: true,
                producto: productoDB
            });
        })
    */
    let body = req.body;
    Producto.findById(id, (err, productoDB) => {
        // Hay error
        if (err) {
            return res.status(500).json({
                success: false,
                err
            });
        }
        // No se pudo crear el producto
        if (!productoDB) {
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            // Hay error
            if (err) {
                return res.status(500).json({
                    success: false,
                    err
                });
            }
            // No se pudo crear el producto
            if (!productoDB) {
                return res.status(400).json({
                    success: false,
                    err: {
                        message: 'No se ha podido guardar el producto.'
                    }
                });
            }
            // Devolvemos el producto guardado
            res.status(201).json({
                success: true,
                data: productoGuardado
            });
        })

    })

}); // app.put

// =============================
// Elimina un producto
// =============================
//app.delete('/producto/:id', [verificaToken, verificaAdminRole], function(req, res) {
app.delete('/producto/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;

    let newEstado = { disponible: false };
    Producto.findByIdAndUpdate(id, newEstado, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        res.json({
            success: true,
            producto: productoDB
        });
    })
}); // app.del

module.exports = app;