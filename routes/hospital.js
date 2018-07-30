var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();


var Hospital = require('../models/hospital');

//==============================
//  Obtener todos los hospitales
//==============================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales ',
                        errors: err
                    });
                }
                if (!hospitales) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales ',
                        errors: err
                    });
                }
                if (hospitales.length <= 0) {

                    return res.status(400).json({
                        ok: true,
                        mensaje: 'No hay hospitales con esas credenciales en base de datos ',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });


            }
        );

});

//==============================
//  Crear un nuevo hospital
//==============================

app.post('/', mdAutenticacion.verifaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital - On Save',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});


//==============================
//  Actualizar actualizar
//==============================

app.put('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'EL hospital con id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

//==============================
//  Borrar un  hospital
//==============================

app.delete('/:id', mdAutenticacion.verifaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existen hospitales con ese ID',
                errors: { message: 'No existe ningún hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });

});

module.exports = app;