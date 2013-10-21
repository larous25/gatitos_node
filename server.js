var express = require ('express.io'),
	swig = require('swig'),
	_ = require('underscore');

var RedisStore = require('connect-redis')(express);

var server = express();
server.http().io();

var users = [];
var gatosnum = [];

//View engine
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './app/views');


// Post, cookies and session --> Optimizar
server.configure(function(){
	//archivos estaticos
	server.use( express.static('./public') );

	server.use( express.logger() );
	server.use( express.cookieParser() );
	server.use( express.bodyParser() );

	server.use( express.session({
		secret : "lolcatz",
		store  : new RedisStore({})
		// store  : new RedisStore({
		//	host : conf.redis.host,
		//	port : conf.redis.port,
		//	user : conf.redis.user,
		//	pass : conf.redis.pass
		// });	
	}));
});

var isntLoggerIn = function (req, res, next) {
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	next();
};

var inLoggedIn = function (req, res, next) {
	if(req.session.user){
		res.redirect('/app');
		return;
	}

	next();
};

function aleatorio( ){
	numPosibilidades = 27 - 1;
	var aleat = Math.random() * numPosibilidades + 1;
		aleat = Math.round(aleat);
	return aleat;
};


server.get('/', inLoggedIn, function (req, res) {
	res.render('home');
});

server.get('/app', isntLoggerIn, function (req, res) {
	res.render('app', {
		user : req.session.user,
		users : users,
		gatosnum : gatosnum,
	});
});

server.post('/log-in', function (req, res){
	users.push(req.body.username);

	req.session.user = req.body.username;
	req.session.gatonum = aleatorio();

	gatosnum.push(req.session.gatonum);

	// A todos
	server.io.broadcast('log-in', {
				username : req.session.user,
				num : req.session.gatonum
				});


	res.redirect('/app');
});

server.get('/log-out', function (req, res){
	users = _.without(users, req.session.user);
	gatosnum = _.without(gatosnum, req.session.gatonum);

	server.io.broadcast('log-out', {
				username : req.session.user,
				num : req.session.gatonum
				});

	req.session.destroy();
	res.redirect('/');
});

server.io.route('hello?', function(req){
	//a un solo usuario
	req.io.emit('ready', {
		message : 'server ready to rock!!!'+req.session.gatonum
	});
});

server.listen(3000);
console.log('Corriendo en 3000');