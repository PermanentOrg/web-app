import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@root/app/app.module';
import { environment } from '@root/environments/environment';

import { hmrBootstrap } from '@root/hmr';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);
if (environment.hmr) {
  hmrBootstrap(module, bootstrap);
} else {
  bootstrap();
}
