module.exports.config = {
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  cucumberOpts: {
      require: ['src/steps/*.steps.js'],
      strict: true
  },
  specs: ['src/features/*.feature'],
  capabilities: {
      browserName: 'chrome',
  }
};