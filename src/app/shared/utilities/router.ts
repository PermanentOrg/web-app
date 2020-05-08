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


