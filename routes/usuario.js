var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');

//==============================
//  Obtener todos los usuarios
//==============================
app.get('/', (req, res) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios ',
                        errors: err
                    });
                }
                if (!usuarios) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios ',
                        errors: err
                    });
                }
                if (usuarios.length <= 0) {

                    return res.status(400).json({
                        ok: true,
                        mensaje: 'No hay usuarios en base de datos ',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });


            });

});



//==============================
//  Actualizar usuario
//==============================

app.put('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'EL usuario con id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//==============================
//  Crear un nuevo usuario
//==============================

app.post('/', mdAutenticacion.verifaToken, (req, res) => {

    var body = req.body;
    console.log("PEtición REQ: ", req);
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});


//==============================
//  Borrar un  usuario
//==============================

app.delete('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existen usuarios con ese ID',
                errors: { message: 'No existe ningún usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});

module.exports = app;