const optionalSecrets = [
  {
    name: 'FEATURED_ARCHIVES',
    default: '[]',
  },
  {
    name: 'RECAPTCHA_API_KEY',
    default: '',
  },
  {
    name: 'FUSIONAUTH_HOST',
    default: 'https://permanent-dev.fusionauth.io',
  },
];

module.exports = optionalSecrets;
