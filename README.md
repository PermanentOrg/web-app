# Mdot

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Secrets

Prior to building, be sure to create a `.env` file with any necessary secrets for your environment, using `.env.template` as a guide if needed. 

If adding any new secrets, update `.env.template` and `src/required-secrets.js` with the new variable names.

## Development server

To run the app using `ng serve`, use the following `npm` scripts:

- `npm run dev` to run a dev server against your `local.permanent.org` VM accessible at `https://ng.permanent.org:4200`
	- You'll need to add a host file redirect to point ng.permanent.org to either localhost or 127.0.0.1

If your development environment is missing the appropriate SSL certificates at `/etc/ssl`, you'll have to configure your browser and OS to trust the auto-generated SSL certificates.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
