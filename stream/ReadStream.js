
let fs = require('fs')
let EventEmitter = require('events')

class ReadStream extends EventEmitter {
    constructor(path, options) {
        super()
        this.path = path
        this.start = options.start || 0
        this.flags = options.flags || 'r'
        this.length = 0
        this.pos = this.start
        this.end = options.end
        this.autoClose = options.autoClose || true
        this.highWaterMark = options.highWaterMark || 64 * 1024
        this.encoding = options.encoding
        this.buffer = Buffer.alloc(this.highWaterMark)
        this.fd = null;
        this.flowing = true

        this.open()

        this.on('newListener', (ev) => {
            if (ev == 'data') {
                this.read()
            }
        })

    }

    read() {
        if (typeof this.fd !== 'number') {
            return this.once('open', this.read)
        }

        let howMuchToRead = this.end ? Math.min(this.highWaterMark, this.end - this.pos + 1) : this.highWaterMark

        fs.read(this.fd, this.buffer, 0, howMuchToRead, this.pos, (err, bytesRead) => {
            if (err) {
                this.emit('error')
                if(this.autoClose) {
                    this.destory()
                }
                return 
            }

            if (bytesRead > 0) {
                this.pos += bytesRead
                let data = this.buffer.slice(0, bytesRead)
                data = this.encoding ? data.toString(this.encoding) : data

                this.emit('data', data)
            }

            if (this.pos > this.end) {
                this.destory()
                return 
            }

            if (this.flowing) {
                this.read()
            }

        })
    }

    pipe(ws) {
        this.on('data', (ch) => {
            console.log(ch.toString())
            if(!ws.write(ch)) {
                this.pause()
            }
        })

        ws.on('drain', () => {
            this.resume()
        })
    }

    resume() {
        this.flowing = true
        this.read()
    }

    pause() {
        this.flowing = false
    }

    destory() {
        if (typeof this.fd === 'number') {
            fs.close(this.fd, () => {
                this.emit('close')
            })
        }
        this.emit('end')
    }

    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) {
                this.emit('error')
                if(this.autoClose) {
                    this.destory()
                }
                return
            }
            this.fd = fd
            this.emit('open')
        })
    }
}

module.exports = ReadStream

