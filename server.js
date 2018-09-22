let express=require('express');
let app=express();
let bodyparser=require('body-parser');
let mysql = require('mysql');

//settings DB
let connection = mysql.createConnection({
  host     : 'den1.mysql2.gear.host',
  user     : 'plugdj',
  password : 'Dz7x~JX~qgqj',
  database : 'plugdj'
});
//stock date here 
let rooms=[];
//Use of body-parser
app.use(bodyparser.urlencoded({ extended: false }));
//use of static folder
app.use(express.static('public'));
//use of ejs template engine
app.set('view engine', 'ejs');
//Home page
app.get('/',(req,res)=>{
	let getRooms = "SELECT * FROM rooms";
	connection.query(getRooms,(error,results,fields)=>{
		if(error){
			console.log(error);
			let message=['erreur','Problème pour la récupération de rooms'];
		}else if(results.length>0) {
			results.forEach((bl)=>{
				rooms.push(bl.created_at);
			})
			console.log(rooms[0]);
			res.render('index',{rooms:results})
		}
	});
});
//Create a room
app.post('/',(req,res)=>{
	let name=req.body.name;
	let description=req.body.description;
	let createRoom = `INSERT INTO rooms (name,description,created_at) VALUES ('${name}','${description}',NOW())`;
	connection.query(createRoom,(error,results,field)=>{
		if(error){
			console.log(error);
			let message=['Erreur','Problème dans la création de room'];
		}else {
			let message='success,Room créée avec succès';
			res.redirect('/');
		}
	})
});
//create an account
app.post('/register',(req,res)=>{
	let username=req.body.username;
	let email=req.body.email;
	let pass=req.body.password;
	let createAccount=`INSERT INTO users (username,email,pass) VALUES ('${username}','${email}','${pass}');`;
	connection.query(createAccount,(error,results,field)=>{
		if(error){
			console.log(error);
			let message=['Erreur','Echec dans la creation de compte'];
			res.redirect('/');
		}else{
			let message=['success','Compte bien crée'];
			res.redirect('/');
		}
	});
});
//Connect to an account
app.post('/connect',(req,res)=>{
	let username=req.body.pseudo;
	let pass=req.body.pass;
});
//Opening the server on the following port
app.listen(8080);