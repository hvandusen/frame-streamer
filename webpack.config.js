const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
  devServer: {
    proxy: {
        '/json': 'http://localhost:3002'
      }
    },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname, '/app/build'),
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
};
