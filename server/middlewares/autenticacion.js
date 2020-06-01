const jwt = require('jsonwebtoken');

// =============================
// Verificar Token
// =============================
let verificaToken = (req, res, next) => {
    let token = req.get('token');
    // Comprobar que el token es válido
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        // decoded: es el "payload" del JWT
        if (err) {
            return res.status(401).json({
                success: false,
                err: {
                    message: 'token no válido'
                }
            });
        }

        // Nuestro "payload" definido en el login.js devuelve el objeto "usuario"
        req.usuario = decoded.usuario;
        // Le decimos que continúe con la siguiente función
        next();
    });

}; // verificaToken

// =============================
// Verificar Token URL
// =============================
let verificaTokenURL = (req, res, next) => {
    let token = req.query.token;
    // Comprobar que el token es válido
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        // decoded: es el "payload" del JWT
        if (err) {
            return res.status(401).json({
                success: false,
                err: {
                    message: 'token no válido'
                }
            });
        }

        // Nuestro "payload" definido en el login.js devuelve el objeto "usuario"
        req.usuario = decoded.usuario;
        // Le decimos que continúe con la siguiente función
        next();
    });

}; // verificaTokenURL

// =============================
// Verificar ADMIN_ROLE
// =============================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            success: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
    next();
}; // verificaToken

module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenURL
}