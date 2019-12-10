const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ["@babel/preset-env", {
                targets: {
                  node: "6.10"
                }
              }],
              "@babel/preset-typescript",
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js','.ts'],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  }
};
