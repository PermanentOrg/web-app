# Mdot

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

To run the app using `ng serve`, use the following `npm` scripts:

- `npm run dev_proxy_local` to run a dev server against your `local.permanent.org` VM accessible at `https://ng.permanent.org:4200`
	- You'll need to add a host file redirect to point ng.permanent.org to either localhost or 127.0.0.1
- `npm run dev_proxy_dev` to run a dev server against `dev.permanent.org` accessible at `https://local.permanent.org:4200`

If your development environment is missing the appropriate SSL certificates at `/etc/ssl`, you'll have to configure your browser and OS to trust the auto-generated SSL certificates.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
