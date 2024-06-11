/* @format */
import { InjectionToken } from '@angular/core';
import { ChecklistItem } from './checklist-item';

export interface ChecklistApi {
  getChecklistItems(): Promise<ChecklistItem[]>;
  isAccountHidingChecklist(): boolean;
  isArchiveOwnedByAccount(): boolean;
}

export const CHECKLIST_API = new InjectionToken<ChecklistApi>('ChecklistApi');
