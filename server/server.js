require('./config/config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

/*
// Middleware: instrucción o callback que se ejecutará siempre (da igual qué URL se solicite)
app.use(express.static(__dirname + '/public'));

// Express HBS
hbs.registerPartials(__dirname + '/views/partials', function(err) {});
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
    let data = {
        nombre: myName,
        anyo: new Date().getFullYear()
    };
    res.render('home.hbs', data);
});
app.get('/about', function(req, res) {
    let data = {
        nombre: myName,
        anyo: new Date().getFullYear()
    };
    res.render('about', data);
});
*/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/usuario', function(req, res) {
    res.json('get usuario');
});
app.post('/usuario', function(req, res) {
    let body = req.body;
    if (body.nombre === undefined) {
        res.status(400).json({
            success: false,
            error_msg: 'El nombre es necesario'
        });
    } else {
        res.json({ user: body });
    }
});
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    res.json({
        id
    });
});
app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

app.listen(process.env.PORT, () => { console.log(`Escuchando peticiones en el puerto ${process.env.PORT}`); });