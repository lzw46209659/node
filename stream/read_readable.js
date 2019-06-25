
// 暂停模式

let fs = require('fs')

let rs = fs.createReadStream('./1.txt', {
    start: 3,
    end: 8,
    encoding: 'utf8',
    highWaterMark: 3
})

rs.on('readable', function() {
    console.log(rs._readableState)
    rs.read(1);
})