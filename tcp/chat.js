
let net = require('net')

let allClient = {};
let server = net.createServer(function(socket) {
    socket.setEncoding('utf8')

    socket.write(`请输入您的用户名:\r\n`)
    let username;
    socket.on('data', function(data) {
        if (!username) {
            username = data
            allClient[username] = socket
            broadcast(username, `欢迎${username}加入了聊天室\r\n`)
        } else {
            broadcast(username, data)
        }
    })
    
    socket.on('end', function() {
        broadcast(username, `欢送${username}离开了聊天室\r\n`)
        allClient[name] && allClient[name].destory()
        delete allClient[name]
    })

})

function broadcast(userName, msg) {
    for (var name in allClient) {
        if (name != userName) {
            allClient[name].write(`${msg}\r\n`);
        }
    }
}

server.listen(8080, 'localhost', () => {
    console.log(server.address())
})