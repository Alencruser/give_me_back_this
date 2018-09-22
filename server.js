let express=require('express');
let app=express();
let bodyparser=require('body-parser');
let mysql = require('mysql');

//declaration DB
let connection = mysql.createConnection({
  host     : 'den1.mysql2.gear.host',
  user     : 'plugdj',
  password : 'Dz7x~JX~qgqj',
  database : 'plugdj'
});
//variable des rooms
let rooms=[];
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
//Creation d'une room
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
//creation de compte
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
//Ouverture du serveur sur le port suivant 
app.listen(8080);