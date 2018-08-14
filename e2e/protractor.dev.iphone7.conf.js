// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
  capabilities: {
    'browserName': 'safari',
    'browserstack.user': 'danielhurlbert1',
    'browserstack.key': 'eCW3yyoq6xLJ8TbDGKyk',
    'device': 'iPhone 7',
    'realMobile': 'true',
    'os_version': '10.3'
  },
  baseUrl: 'https://dev.permanent.org',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    browser.baseUrl = 'https://dev.permanent.org/';
  }
};