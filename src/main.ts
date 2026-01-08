import { enableProdMode, ɵresetCompiledComponents, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

declare let module: any;
if (module.hot) {
	module.hot.accept();
	module.hot.dispose(() => ɵresetCompiledComponents());
}

platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], });
