/* @format */
import { InjectionToken } from '@angular/core';
import { ChecklistItem } from './checklist-item';

export interface ChecklistApi {
  getChecklistItems(): Promise<ChecklistItem[]>;
  isAccountHidingChecklist(): boolean;
  isDefaultArchiveOwnedByAccount(): boolean;
  setChecklistHidden(): Promise<void>;
}

export const CHECKLIST_API = new InjectionToken<ChecklistApi>('ChecklistApi');
