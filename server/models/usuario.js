const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

// Definir el modelo del Usuario
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es obligatorio']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Apply the uniqueValidator plugin to userSchema.
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});

// Modificar el método "toJSON" del Schema, el cual siempre se llama cuando se intenta "imprimir".
// Lo modificamos para cuando se solicite que se "imprima" el objeto, el password se elimine (no se podrá imprimir, devolver como json, ...)
usuarioSchema.methods.toJSON = function() {
    // Al utilizar el objeto "this", no puede ser una función "flecha"
    let user = this; // usuario actual
    let objUser = user.toObject(); // objeto de ese usuario
    delete objUser.password;

    // devolvemos el objeto sin la propiedad "password"
    return objUser;
};

// Exportar el modelo del Usuario
module.exports = mongoose.model('Usuario', usuarioSchema);