var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Medico = require('../models/medico');

//==============================
//  Obtener todos los medicos
//==============================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre usuario img hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos ',
                        errors: err
                    });
                }
                if (!medicos) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos ',
                        errors: err
                    });
                }
                if (medicos.length <= 0) {

                    return res.status(400).json({
                        ok: true,
                        mensaje: 'No hay medicos en base de datos ',
                        errors: err
                    });
                }


                Medico.count({}, (err, conteo) => {
                    if (err) {

                        res.status(400).json({
                            ok: false,
                            message: 'Error al cuantificar el número de usuarios, Posible problema de base de datos'
                        });

                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });


            });

});



//==============================
//  Actualizar medico
//==============================

app.put('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'EL medico con id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            medicoGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

//==============================
//  Crear un nuevo medico
//==============================

app.post('/', mdAutenticacion.verifaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        img: body.img,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});


//==============================
//  Borrar un  medico
//==============================

app.delete('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existen medicos con ese ID',
                errors: { message: 'No existe ningún medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;