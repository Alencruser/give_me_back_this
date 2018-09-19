var app=require('express');
var express=app();
var bodyparser=require('body-parser');
var mysql = require('mysql');

//declaration DB
var connection = mysql.createConnection({
  host     : 'den1.mysql2.gear.host',
  user     : 'plugdj',
  password : 'Dz7x~JX~qgqj',
  database : 'plugdj'
});
//Utilisation body parser
app.use(bodyParser.urlencoded({ extended: false }));
//declaration dossier public
app.use(express.static('public'));
//utilisation de ejs
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
	res.render('')
});

app.listen(8080);