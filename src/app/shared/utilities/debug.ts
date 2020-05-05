import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import debug from 'debug';

export function debugSubscribable(name: string, d: debug.Debugger, obs: Observable<any> | Subject<any> | EventEmitter<any>) {
  const d2 = debug(`${d.namespace}:\$:${name}`);
  return obs.subscribe(event => d2('%o', event));
}
