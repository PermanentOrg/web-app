import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

export interface HasSubscriptions extends OnDestroy {
  subscriptions: Subscription[];
}

export function unsubscribeAll(subscriptions: Subscription[]) {
  while (subscriptions.length) {
    const current = subscriptions.pop();
    current.unsubscribe();
  }
}
