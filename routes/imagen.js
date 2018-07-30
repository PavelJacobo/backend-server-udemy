var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');



app.get('/:tipodecoleccion/:img', (req, res, next) => {

    var tipodecoleccion = req.params.tipodecoleccion;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipodecoleccion }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});


module.exports = app;