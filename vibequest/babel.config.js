module.exports = (api) => {
  const isTest = api.env('test');
  return {
    presets: [
      ['@babel/preset-env', {
        targets: isTest ? { node: 'current' } : { browsers: ['last 2 versions'] },
      }],
      '@babel/preset-react',
    ],
  };
};
