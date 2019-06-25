
let EventEmitter = require('events')
let fs = require('fs')

class WriteStream extends EventEmitter {

    constructor(path, options) {
        super()

        this.path = path
        this.flags = options.flags || 'w'
        this.start = options.start
        this.pos = this.start
        this.mode = options.mode || 0o666
        this.highWaterMark = options.highWaterMark || 64 * 1024
        this.autoClose = options.autoClose || true
        this.buffer = []
        this.writing = false
        this.length = 0

        this.needDrain = false

        this.fd = null

        this.open()
    }

    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) {
                if (this.autoClose) {
                    this.destory()
                }
            }
            console.log('write_fd, ' + fd)
            this.fd = fd
            this.emit('open')
        })
    }

    write(chunk, encoding, cb) {
        let buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)
        this.length += buffer.length
        let ret = buffer.length > this.highWaterMark
        if (this.writing) {
            this.buffer.push({
                buffer,
                encoding,
                cb
            })
        } else {
            this.writing = true;
            console.log(buffer)
            this._write(buffer, encoding, () => {
                cb && cb()
                this.clearBufferList()
            })
        }

        this.needDrain = !ret

        return ret
    }

    clearBufferList() {
        let currentBuffer = this.buffer.shift()
        if (currentBuffer) {
            this._write(currentBuffer.buffer, currentBuffer.encoding, () => {
                currentBuffer.cb && currentBuffer.cb()
                this.clearBufferList()
            })
        } else {
            this.writing = false;
            if (this.needDrain) {
                this.emit('drain')
            }
        }

    }

    _write(buffer, encoding, cb) {

        if (typeof this.fd !== 'number') {
            this.once('open', () => this._write(buffer, encoding, cb))
            return 
        }

        fs.write(this.fd, buffer, 0, buffer.length, this.pos, (err, bytesWritten) => {
            if (err) {
                if(this.autoClose) {
                    this.destory()
                }
                this.emit('error')
            }
            this.length -= bytesWritten;
            this.pos += bytesWritten
            // this.writing = false;
            cb && cb()
        })

    }

    destory() {
        if (typeof this.fd === 'number') {
            fs.close(this.fd, () => {
                this.emit('close')
            })
        }
        this.emit('end')
    }
}


module.exports = WriteStream
