let express=require('express');
let app=express();
let bodyparser=require('body-parser');
let mysql = require('mysql');
let session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//settings DB
let connection = mysql.createConnection({
	host     : 'den1.mysql2.gear.host',
	user     : 'plugdj',
	password : 'Dz7x~JX~qgqj',
	database : 'plugdj'
});
//stock date here 
let rooms=[];
//app use of express session
app.use(session({secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true}
	));
//initialise socket io
	io.on('connection',(socket)=>{
	console.log('a new connection detected');
});
//The let we will use for keep session storage
let sess;
//Use of body-parser
app.use(bodyparser.urlencoded({ extended: false }));
//use of static folder
app.use('/',express.static('public'));
app.use('/room',express.static('public'));
//use of ejs template engine
app.set('view engine', 'ejs');
//Securisation input
 function blbl(str) {
        if (str == null) return '';

        return String(str).
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
    };
//Home page
app.get('/',(req,res)=>{
	sess=req.session;
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
			if(sess.username){
				res.render('index',{rooms:results,username:sess.username});
			}else{
				res.render('index',{rooms:results});
			}
		}else{
			if(sess.username){
				res.render('index',{username:sess.username});
			}else{
				res.render('index');
			}
		}
	});
});
//Create a room
app.post('/',(req,res)=>{
	let name=blbl(req.body.name);
	let description=blbl(req.body.description);
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
	let username=blbl(req.body.username);
	let email=blbl(req.body.email);
	let pass=blbl(req.body.password);
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
	sess=req.session;
	let username=blbl(req.body.pseudo);
	let pass=blbl(req.body.pass);
	let connectAccount=`SELECT pass FROM users WHERE username='${username}'`;
	connection.query(connectAccount,(error,results,field)=>{
		if(error){
			console.log(error);
		}else if(pass==results[0].pass){
			console.log('authentication success');
			sess.username=username;
			res.redirect('/');
		}else {
			console.log('wrong pass');
			res.redirect('/')
		}
	});
});
//Logout part
app.get('/logout',(req,res)=>{
	req.session.destroy((err)=> {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});
//When going to a room
app.get('/room/:id',(req,res)=>{
	sess=req.session;
	if(session.username){
		res.render('room',{username:sess.username,room:req.params.id});
	}
	res.render('room',{room:req.params.id});
});
//When an user enter a youtube link
app.post('/room/:id',(req,res)=>{
	let music=req.body.music.split('=');
	music=music[1];
	res.render('room',{music:music,room:req.params.id})
});
//Opening the server on the following port
http.listen(8080, ()=>{
	console.log('listening on 8080');
});