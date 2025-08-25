import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';
import { ChecklistItem } from './checklist-item';

export interface ChecklistApi {
	getChecklistItems(): Promise<ChecklistItem[]>;
	isAccountHidingChecklist(): boolean;
	isDefaultArchiveOwnedByAccount(): boolean;
	setChecklistHidden(): Promise<void>;
	getArchiveChangedEvent(): Subject<void>;
	getRefreshChecklistEvent(): Subject<void>;
}

export const CHECKLIST_API = new InjectionToken<ChecklistApi>('ChecklistApi');
