function aleatorio( ){
	numPosibilidades = 27 - 1;
	var aleat = Math.random() * numPosibilidades + 1;
		aleat = Math.round(aleat);
	return aleat;
}

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

	io.on('log-in', function(data){
		//pasa algo al loog imagen gato

		$('#users').append('<li>'+data.username+'</li>');
		$('#gatos').append('<img src="/img/cat_'+data.num+'.png" alt="'+data.num+'" />');

	});

	io.on('log-out', function(data){
		//quito imagen gato
		$("#users li").each(function (i, item){
			if(item.innerText === data.username){
				$(item).remove();
			}
		});

		$("#gatos img").each(function (i, item){
			if(item.alt === ''+data.num){				
				$(item).remove();		
				console.log('Este es el itmem'+item.alt+'se va por '+data.num);		
			}
		});
		
	});

});