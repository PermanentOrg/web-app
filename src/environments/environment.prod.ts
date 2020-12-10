import { version as release } from '../../package.json';

export const environment = {
  production: true,
  apiKey: 'Xr$k?fopgA"FdWFoPKmmh6n7',
  apiUrl: 'https://www.permanent.org/api',
  stripeKey: 'pk_live_ssjpUZtdv9SPpmydHkQLOtxm',
  hmr: false,
  firebase: {
    apiKey: 'AIzaSyAcBDvNQWiDogLtq-L9pEkG7M9snK97rKo',
    authDomain: 'prpledgeprod.firebaseapp.com',
    databaseURL: 'https://prpledgeprod.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgeprod.cloudfunctions.net',
    projectId: 'prpledgeprod',
    storageBucket: 'prpledgeprod.appspot.com',
    messagingSenderId: '802935961762'
  },
  google: {
    apiKey: 'AIzaSyBPlEoumk_gQ0aNCOeaEU61ZKNU94TfCjk'
  },
  debug: false,
  release,
  environment: 'prod'
};
