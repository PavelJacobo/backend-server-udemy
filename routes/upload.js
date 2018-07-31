var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');



app.put('/:tipocoleccion/:id', (req, res, next) => {

    var tipocoleccion = req.params.tipocoleccion;
    var id = req.params.id;

    // tipos de colección válidos

    var tiposDeColeccionValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposDeColeccionValidos.indexOf(tipocoleccion) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Colección no válida para este tipo de acción',
            error: { message: 'La colección indicada no es válida' }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'Archivo No seleccionado',
            error: { message: 'Imagen no seleccionada, es necesario seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var splitDeArchivo = archivo.name.split('.');
    extensionArchivo = splitDeArchivo[splitDeArchivo.length - 1];

    // Solo aceptamos éstas extensiones
    var extensionesValidas = ['png', 'jpeg', 'jpg', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión No Valida',
            error: { message: 'Los formatos válidos son' + extensionesValidas.join(', ') }
        });
    }


    //nombre personalizado del archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // mover el archivo del temporal a un path
    var path = `./uploads/${ tipocoleccion }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }
        subirPorTipo(tipocoleccion, id, nombreArchivo, res);

    });



});


function subirPorTipo(tipocoleccion, id, nombreArchivo, res) {

    if (tipocoleccion == 'usuarios') {
        Usuario.findById(id, 'nombre email role', (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error, usuario no encontrado',
                    error: err
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al subir el archivo',
                            error: err
                        });
                    }

                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipocoleccion == 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error, medico no encontrado',
                    error: err
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al subir el archivo',
                            error: err
                        });
                    }

                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipocoleccion == 'hospitales') {


        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error, hospital no encontrado',
                    error: err
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al subir el archivo',
                            error: err
                        });
                    }

                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}



module.exports = app;