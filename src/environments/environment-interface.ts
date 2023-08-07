interface FirebaseConfig {
  authDomain: string;
  databaseURL: string;
  functionsURL: string;
  projectId: string;
}

export interface Environment {
  production: boolean;
  apiUrl: string;
  hmr: boolean;
  firebase: FirebaseConfig;
  debug: boolean;
  release: string;
  environment: string;
  analyticsDebug: boolean;
}
