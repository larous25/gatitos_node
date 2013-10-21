var express = require ('express.io'),
	swig = require('swig'),
	_ = require('underscore');

var RedisStore = require('connect-redis')(express);

var server = express();
server.http().io();

var gatos = [];

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


server.get('/', inLoggedIn, function (req, res) {
	res.render('home');
});

server.get('/app', isntLoggerIn , function (req, res) {
	res.render('app', {
		user : req.session.user,
		gatos : gatos,
	});
});
function aleatorio(){
	numPosibilidades = 27 - 1;
	var aleat = Math.random() * numPosibilidades + 1;
		aleat = Math.round(aleat);
	return aleat;
}
server.post('/log-in', function (req, res){
	var gato = aleatorio();
	gatos.push({'nombre':req.body.username, 'imagen':gato});

	req.session.user = req.body.username;
	// A todos
	server.io.broadcast('log-in', {nombre : req.session.user, imagen : gato });


	res.redirect('/app');
});

server.get('/log-out', function (req, res){
	for(i = 0; i<= gatos.length - 1; i++){
		if(gatos[i].nombre === req.session.user){
			gatos = _.without( gatos , gatos[i]);
		}
	}

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