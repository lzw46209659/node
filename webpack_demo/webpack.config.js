
let path = require('path')
// let js = require('./src/1.js')
// console.log(js)
module.exports = {
    entry: './src/1.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: '\.css$',
                loader: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
}