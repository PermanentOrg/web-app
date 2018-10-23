// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const fs = require('fs');
const { SpecReporter } = require('jasmine-spec-reporter');
const JSONReporter = require('jasmine-bamboo-reporter');
const jsonReportPath = 'e2e/jasmine-results.json';

exports.config = {
  allScriptsTimeout: 15000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        // "--no-sandbox", "--headless", "--disable-gpu"
      ]
    },
    acceptInsecureCerts : true
  },
  directConnect: true,
  baseUrl: 'https://local.permanent.org:4200',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  beforeLaunch() {
    if (fs.existsSync(`${jsonReportPath}.lock`)) {
      fs.unlinkSync(`${jsonReportPath}.lock`);
    }
    if (fs.existsSync(jsonReportPath)) {
      fs.unlinkSync(jsonReportPath);
    }
  }
  ,
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    jasmine.getEnv().addReporter(new JSONReporter({
      file: jsonReportPath,
      beautify: true,
      indentationLevel: 4
    }));
    browser.baseUrl = 'https://local.permanent.org:4200';
  }
};