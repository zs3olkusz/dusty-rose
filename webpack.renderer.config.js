const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.s[ac]ss$/i,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'sass-loader' },
    // { loader: 'file-loader' },
  ],
});

rules.push({
  test: /\.ttf$/,
  use: [
    {
      loader: 'file-loader',
    },
  ],
});

rules.push(
  {
    test: /src.*\.html$/,
    use: 'html-loader'
  })

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.sass', '.scss', '.ttf'],
  },
};
