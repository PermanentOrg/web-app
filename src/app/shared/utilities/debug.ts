import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import debug from 'debug';

export function debugSubscribable(
	name: string,
	d: debug.Debugger,
	obs: Observable<any> | Subject<any> | EventEmitter<any>,
) {
	const d2 = debug(`${d.namespace}:$:${name}`);
	d2.color = d.color;
	return obs.subscribe((event) => d2('%o', event));
}
