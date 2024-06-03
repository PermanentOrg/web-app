/* @format */
import { Component, Inject, OnInit } from '@angular/core';
import { CHECKLIST_API, ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

@Component({
  selector: 'pr-user-checklist',
  templateUrl: './user-checklist.component.html',
  styleUrl: './user-checklist.component.scss',
})
export class UserChecklistComponent implements OnInit {
  public items: ChecklistItem[] = [];

  constructor(@Inject(CHECKLIST_API) private api: ChecklistApi) {}

  public ngOnInit(): void {
    this.api.getChecklistItems().then((items) => {
      this.items = items;
    });
  }
}
