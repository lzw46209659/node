

let net = require('net')

let server = net.createServer();

server.on('connection', function(socket) {
	console.log('有人连接上了')
	socket.setEncoding('utf8')
	socket.on('data', function(data) {
		console.log(data)
	})
})

server.listen('8080', () =>{
	console.log(server.address())
})



