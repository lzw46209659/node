
// 流动模式
let fs = require('fs')
let ReadStream = require('./ReadStream')
let WriteStream = require('./WriteStream')

let rs = new ReadStream('./1.txt', {
    start: 3,
    end: 8,
    // encoding: 'utf8',
    highWaterMark: 3
})

let ws = new WriteStream('./2.txt', {
    autoClose: true,
    start: 0,
    highWaterMark: 4
})

// rs.pipe(ws)



rs.on('open', function(data) {
    console.log('open')
})

rs.on('data', function(data) {
    console.log(rs)
    console.log('data = ' + data)
    let flag = ws.write(data, 'utf8', function() {
        'write success'
    })

    if (!flag) {
        rs.pause()
    }
})

ws.on('drain', function() {
    rs.resume()
})




rs.on('error', function(err) {
    console.error(err)
})

rs.on('end', function() {
    console.log('end')
})

rs.on('close', function() {
    console.log('close')
})


