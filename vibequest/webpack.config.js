const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

require('dotenv').config();

const appDir = __dirname;

// Packages that ship uncompiled JSX/ESM and must be transpiled by babel-loader
const RN_PACKAGES_TO_TRANSPILE = [
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-svg',
  '@react-navigation',
];

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.join(appDir, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      // Map all react-native imports to react-native-web
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include(modulePath) {
          // Always transpile app source
          if (!/node_modules/.test(modulePath)) return true;
          // Transpile specific RN packages that ship as uncompiled source
          return RN_PACKAGES_TO_TRANSPILE.some(
            (pkg) => modulePath.includes(path.join('node_modules', pkg))
          );
        },
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new webpack.DefinePlugin({
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(process.env.ANTHROPIC_API_KEY),
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
