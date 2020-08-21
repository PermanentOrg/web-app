import { Observable } from 'rxjs';
import { RouterEvent, RoutesRecognized, NavigationEnd, ActivatedRouteSnapshot, ActivationEnd } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { RouteData } from '@root/app/app.routes';

export const getLastChildRouteDataOperator = () => (source: Observable<RouterEvent>) => {
  return source.pipe(
    filter(x => x instanceof ActivationEnd && !x.snapshot.firstChild),
    map(x => {
      if (x instanceof ActivationEnd) {
        return x.snapshot.data as RouteData;
      } else {
        return {} as RouteData;
      }
    })
  );
};

export function findRouteData(snapshot: ActivatedRouteSnapshot, dataProp: string) {
  let lastChild = snapshot;

  while (lastChild.firstChild) {
    lastChild = snapshot.firstChild;
  }

  let data = null;
  let currentSnapshot = lastChild;

  while (!data && currentSnapshot) {
    data = currentSnapshot.data[dataProp];
    currentSnapshot = currentSnapshot.parent;
  }

  return data;
}

export function routeHasDialog(event: RouterEvent) {
  return event.url.includes('(');
}
