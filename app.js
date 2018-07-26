// Requieres
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la base de datos

mongoose.connection.openUri(
	'mongodb://localhost:27017/hospitalDB',
	(err, res) => {
		if (err) throw err;

		console.log('Base de Datos:\x1b[34m%s\x1b[0m', 'online');
	}
);

// rutas

app.get('/', (request, response, next) => {
	response.status(200).json({
		ok: true,
		mensaje: 'Petición realizada correctamente'
	});
});

// Escuchar peticiones con express
app.listen(3000, () => {
	console.log(
		'Express Server corriendo en puerto 3000:\x1b[34m%s\x1b[0m',
		'online'
	);
});
