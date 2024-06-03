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
  public percentage: number = 0;
  public isOpen: boolean = true;
  public isDisplayed: boolean = true;

  constructor(@Inject(CHECKLIST_API) private api: ChecklistApi) {}

  public ngOnInit(): void {
    this.api
      .getChecklistItems()
      .then((items) => {
        this.items = items;
        if (this.items.length > 0) {
          this.percentage =
            (this.items.reduce((sum, i) => sum + +i.completed, 0) /
              this.items.length) *
            100;
        }
      })
      .catch(() => {
        // fail silently and let the finally block hide the component
      })
      .finally(() => {
        if (this.items.length == 0) {
          this.isDisplayed = false;
        }
      });
  }

  public minimize(): void {
    this.isOpen = false;
  }

  public open(): void {
    this.isOpen = true;
  }
}
