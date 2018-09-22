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
//variable des rooms
var rooms=[];
//Utilisation body parser
app.use(bodyparser.urlencoded({ extended: false }));
//declaration dossier public
app.use(express.static('public'));
//utilisation de ejs
app.set('view engine', 'ejs');
//Page accueil
app.get('/',(req,res)=>{
	let getRooms = "SELECT * FROM rooms";
	connection.query(getRooms,(error,results,fields)=>{
		if(error){
			console.log(error);
		}else if(results.length>0) {
			results.forEach((bl)=>{
				rooms.push(bl.created_at);
			})
			console.log(rooms[0]);
			res.render('index',{rooms:results})
		}
	});
});
//Creation d'une room
app.post('/',(req,res)=>{
	let name=req.body.name;
	let description=req.body.description;
	let createRoom = `INSERT INTO rooms (name,description,created_at) VALUES ('${name}','${description}',NOW())`;
	connection.query(createRoom,(error,results,field)=>{
		if(error){
			console.log(error);
		}else {
			res.redirect('/');
		}
	})
})
app.listen(8080);