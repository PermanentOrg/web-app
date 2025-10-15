import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import debug from 'debug';

export function debugSubscribable(
	name: string,
	d: debug.Debugger,
	obs: Observable<any> | Subject<any> | EventEmitter<any>,
) {
	const { namespace, color } = d;
	const d2 = debug(`${namespace}:$:${name}`);
	d2.color = color;
	return obs.subscribe((event) => d2('%o', event));
}
