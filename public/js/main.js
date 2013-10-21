$(document).ready(function () {
	window.io = io.connect();


	io.on('connect', function(socket){
		console.log('hi');
		//mensaje al server
		io.emit('hello?');
	});

	io.on('ready', function(data){
		console.log(data);
	});

	io.on('log-in', function(gato){
		//pasa algo al loog imagen gato
		// debugger;
		// console.log(data);
		$('#users').append('<li>'+gato.nombre+'</li>');
		$('.lista-gatos').append('<img src="/img/cat_'+gato.imagen+'.png" alt="'+gato.nombre+'" />');
	});

	io.on('log-out', function(data){
		//quito imagen gato
		// console.log(data);
		// debugger;
		$("#users li").each(function (i, item){
			if(item.innerText === data.username){
				$(item).remove();
			}
		});

		$(".lista-gatos img").each(function (i, item){
			if(item.alt === data.username){
				$(item).remove();
			}
		});
		
	});

});