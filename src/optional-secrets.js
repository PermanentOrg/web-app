const optionalSecrets = [
	{
		name: 'RECAPTCHA_API_KEY',
		default: '',
	},
	{
		name: 'FUSIONAUTH_HOST',
		default: 'https://permanent-dev.fusionauth.io',
	},
	{
		name: 'STELA_DOMAIN',
		default: '',
	},
	{
		name: 'MIXPANEL_TOKEN',
		default: '',
	},
];

module.exports = optionalSecrets;
