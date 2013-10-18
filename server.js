var express = require ('express.io'),
	swig = require('swig'),
	_ = require('underscore');

var RedisStore = require('connect-redis')(express);

var server = express();
server.http().io();

var users = [];

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
}


server.get('/', inLoggedIn, function (req, res) {
	res.render('home');
});

server.get('/app', function (req, res) {
	res.render('app', { 
		user : req.session.user,
		users : users,
	});
});

server.post('/log-in', function (req, res){
	users.push(req.body.username);

	req.session.user = req.body.username;
	// A todos
	server.io.broadcast('log-in', {username : req.session.user });


	res.redirect('/app');
});

server.get('/log-out', function (req, res){
	users = _.without(users, req.session.user);

	server.io.broadcast('log-out', {username : req.session.user});
	req.session.destroy();
	res.redirect('/');
});

server.io.route('hello?', function(req){
	//a un solo usuario
	req.io.emit('ready', {
		message : 'server ready to rock!!!'
	});
});

server.listen(3000);
console.log('Corriendo en 3000');