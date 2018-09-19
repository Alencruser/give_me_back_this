var express=require('express');
var app=express();
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
app.use(bodyparser.urlencoded({ extended: false }));
//declaration dossier public
app.use(express.static('public'));
//utilisation de ejs
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
	var getRooms = "SELECT * FROM rooms";
	connection.query(getRooms,function(error,results,fields){
		if(error){
			console.log(error);
		}else if(results.length>0) {
			res.render('index',{rooms:results})
		}
	});
});

app.post('/',(req,res)=>{

})
app.listen(8080);