const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
const LESS_NAME = isProduction ? '[hash:base64:8]' : '[name]_[local]_[hash:base64:4]'
module.exports = {
  entry: isProduction ? path.resolve(__dirname, '../src/prodIndex') : path.resolve(__dirname, '../src/devIndex'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'), // 将 '@' 映射到 'src' 目录
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less'],
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              modules: {
                localIdentName: LESS_NAME,
              },
            },
          },
          'less-loader',
        ],
        include: path.resolve(__dirname, '../src'),
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|svg|eot|ttf)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
      },
    ],
  },
}
