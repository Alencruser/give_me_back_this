let express = require('express'),
	app = express(),
	fs = require('fs'),
	bodyparser = require('body-parser'),
	mysql = require('mysql'),
	session = require('express-session'),
	http = require('http').Server(app),
	cors = require('cors'),
	io = require('socket.io')(http),
	bcrypt = require('bcrypt'),
	connection,
	message = ["", "",""];
if (fs.existsSync('./bdd.js')) {
	connection = require('./bdd');
} else {
	connection = mysql.createConnection({
		host: process.env.ENV_HOST,
		user: process.env.ENV_USER,
		password: process.env.ENV_PASS,
		database: process.env.ENV_DB
	});

}
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
	io.to(room).emit('join');
	socket.on('join',function (player){
		io.to(room).emit('player',player.player,player.list);
	})
	//ici socket on l'event d'envoyer une url et renvoyer le lien en broadcast emit
	socket.on('video', function (url) {
		if(url.includes('youtu') || url.length == 11){
			if(url.includes('/'))url = url.split('/')[url.split('/').length-1];
			if(url.includes('v='))url= url.split('v=')[1];
			if(url.includes('&'))url= url.split('&')[0];
			io.to(room).emit('video', url);
		}
	});

	socket.on('disconnect',function(){
		socket.leave(room);
	})
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
			message = ['negative', 'Problème pour la récupération de rooms'];
			res.render('index', { message: message })
		} else if (results.length > 0) {

			results.forEach((bl) => {
				rooms.push(bl.created_at);
			})
			if (sess.username) {
				res.render('index', { rooms: results, username: sess.username, message: message });
			} else {
				res.render('index', { rooms: results, message: message });
			}
		} else {
			if (sess.username) {
				res.render('index', { username: sess.username, message: message });
			} else {
				res.render('index', { message: message });
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
			res.redirect('/')
		} else {
			res.redirect('/');
		}
	})
});
//create an account
app.post('/register', (req, res) => {
	let username = blbl(req.body.username);
	let email = blbl(req.body.email);
	let pass = blbl(req.body.password);
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(pass, salt, (err, hash) => {
			pass = hash;
			let createAccount = `INSERT INTO users (username,email,pass) VALUES ('${username}','${email}','${pass}');`;
			connection.query(createAccount, (error, results, field) => {
				if (error) {
					console.log(error);
					message = ['negative', 'Echec dans la creation de compte'];
					res.redirect('/');
				} else {
					message = ['success', 'Compte bien crée'];
					res.redirect('/');
				}
			});
		})
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
		} else {
			bcrypt.compare(pass, results[0].pass, (err, result) => {
				if (result) {
					message = ['success',"Vous vous êtes connecté avec succès"];
					sess.username = username;
					res.redirect('/');
				} else {
					message = ['negative','Mot de passe incorrect'];
					res.redirect('/')
				}
			})
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


//Opening the server on the following port
http.listen(process.env.PORT || 8080, () => {
	console.log('listening on ' + process.env.PORT || 8080);
});