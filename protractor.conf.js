module.exports.config = {
  framework: 'custom',
  frameworkPath: 'node_modules/protractor-cucumber-framework',
  cucumberOpts: {
      require: ['e2e/src/steps/*.steps.js'],
      strict: true
  },
  specs: ['e2e/src/features/*.feature'],
  capabilities: {
      browserName: 'chrome',
  }
};