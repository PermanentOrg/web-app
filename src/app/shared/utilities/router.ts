import { Observable } from 'rxjs';
import {
	RouterEvent,
	ActivatedRouteSnapshot,
	ActivationEnd,
} from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { RouteData } from '@root/app/app.routes';

export const getLastChildRouteDataOperator =
	() => (source: Observable<RouterEvent>) =>
		source.pipe(
			filter((x) => x instanceof ActivationEnd && !x.snapshot.firstChild),
			map((x) => {
				if (x instanceof ActivationEnd) {
					return x.snapshot.data as RouteData;
				} else {
					return {} as RouteData;
				}
			}),
		);

export function findRouteData(
	snapshot: ActivatedRouteSnapshot,
	dataProp: string,
) {
	let lastChild = snapshot;

	while (lastChild.firstChild) {
		const { firstChild } = snapshot;
		lastChild = firstChild;
	}

	let data = null;
	let currentSnapshot = lastChild;

	while (!data && currentSnapshot) {
		const { [dataProp]: dataValue } = currentSnapshot.data;
		data = dataValue;
		const { parent } = currentSnapshot;
		currentSnapshot = parent;
	}

	return data;
}

export function routeHasDialog(event: RouterEvent) {
	return event.url.includes('(');
}
