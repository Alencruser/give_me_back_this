let express = require('express');
let app = express();
let bodyparser = require('body-parser');
let mysql = require('mysql');
let session = require('express-session');
let http = require('http').Server(app);
let cors = require('cors');
let io = require('socket.io')(http);
let connection = require('./bdd');
//stock date here 
let rooms = [];
//app use of express session
app.use(session({
	secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true
}
));

app.use(cors());


//initialise socket io
io.on('connection', (socket) => {
	console.log('a new connection detected');
	let room = socket.handshake['query']['room'];
	socket.join(room);
	//ici socket on l'event d'envoyer une url et renvoyer le lien en broadcast emit
	socket.on('video',function (url){
		io.to(room).emit('video',url);
	});
});
//The let we will use for keep session storage
let sess;
//Use of body-parser
app.use(bodyparser.urlencoded({ extended: false }));
//use of static folder
app.use('/', express.static('public'));
app.use('/room', express.static('public'));
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
		replace(/--/g, '&#151;').
		replace(/'/g, '&#039;');
};
//Home page
app.get('/', (req, res) => {
	sess = req.session;
	let getRooms = "SELECT * FROM rooms";
	connection.query(getRooms, (error, results, fields) => {
		if (error) {
			console.log(error);
			let message = ['erreur', 'Problème pour la récupération de rooms'];
		} else if (results.length > 0) {
			results.forEach((bl) => {
				rooms.push(bl.created_at);
			})
			if (sess.username) {
				res.render('index', { rooms: results, username: sess.username });
			} else {
				res.render('index', { rooms: results });
			}
		} else {
			if (sess.username) {
				res.render('index', { username: sess.username });
			} else {
				res.render('index');
			}
		}
	});
});
//Create a room
app.post('/', (req, res) => {
	let name = blbl(req.body.name);
	let description = blbl(req.body.description);
	let createRoom = `INSERT INTO rooms (name,description,created_at) VALUES ('${name}','${description}',NOW())`;
	connection.query(createRoom, (error, results, field) => {
		if (error) {
			console.log(error);
			let message = ['Erreur', 'Problème dans la création de room'];
		} else {
			let message = 'success,Room créée avec succès';
			res.redirect('/');
		}
	})
});
//create an account
app.post('/register', (req, res) => {
	let username = blbl(req.body.username);
	let email = blbl(req.body.email);
	let pass = blbl(req.body.password);
	let createAccount = `INSERT INTO users (username,email,pass) VALUES ('${username}','${email}','${pass}');`;
	connection.query(createAccount, (error, results, field) => {
		if (error) {
			console.log(error);
			let message = ['Erreur', 'Echec dans la creation de compte'];
			res.redirect('/');
		} else {
			let message = ['success', 'Compte bien crée'];
			res.redirect('/');
		}
	});
});
//Connect to an account
app.post('/connect', (req, res) => {
	sess = req.session;
	let username = blbl(req.body.pseudo);
	let pass = blbl(req.body.pass);
	let connectAccount = `SELECT pass FROM users WHERE username='${username}'`;
	connection.query(connectAccount, (error, results, field) => {
		if (error) {
			console.log(error);
		} else if (pass == results[0].pass) {
			console.log('authentication success');
			sess.username = username;
			res.redirect('/');
		} else {
			console.log('wrong pass');
			res.redirect('/')
		}
	});
});
//Logout part
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});
//When going to a room
//creer une room io personnalisée ici
app.get('/room/:id', (req, res) => {
	sess = req.session;
	if (session.username) {
		res.render('room', { username: sess.username, room: req.params.id });
	}
	res.render('room', { room: req.params.id });
});
//When an user enter a youtube link
app.post('/room/:id', (req, res) => {
	let music = req.body.music.split('=');
	music = music[1];
	res.render('room', { music: music, room: req.params.id })
});

//Opening the server on the following port
http.listen(process.env.PORT || 8080, () => {
	console.log('listening on '+process.env.PORT || 8080);
});