/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { EventService } from '@shared/services/event/event.service';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';
import { ChecklistIconComponent } from './components/checklist-icon/checklist-icon.component';
import { TaskIconComponent } from './components/task-icon/task-icon.component';
import { MinimizeIconComponent } from './components/minimize-icon/minimize-icon.component';
import { CHECKLIST_API } from './types/checklist-api';
import { UserChecklistService } from './services/user-checklist.service';
import { ChecklistAnalyticsObserverService } from './services/checklist-analytics-observer.service';

@NgModule({
  declarations: [
    UserChecklistComponent,
    ChecklistIconComponent,
    TaskIconComponent,
    MinimizeIconComponent,
  ],
  exports: [UserChecklistComponent],
  imports: [CommonModule, SharedModule],
  providers: [
    {
      provide: CHECKLIST_API,
      useClass: UserChecklistService,
    },
    ChecklistAnalyticsObserverService,
  ],
})
export class UserChecklistModule {
  constructor(
    analytics: EventService,
    checklistAnalyticsObserver: ChecklistAnalyticsObserverService,
  ) {
    // analytics.addObserver(checklistAnalyticsObserver);
  }
}
