/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';
import { ChecklistIconComponent } from './components/checklist-icon/checklist-icon.component';
import { TaskIconComponent } from './components/task-icon/task-icon.component';
import { MinimizeIconComponent } from './components/minimize-icon/minimize-icon.component';
import { CHECKLIST_API } from './types/checklist-api';
import { UserChecklistService } from './services/user-checklist.service';

@NgModule({
  declarations: [
    UserChecklistComponent,
    ChecklistIconComponent,
    TaskIconComponent,
    MinimizeIconComponent,
  ],
  exports: [UserChecklistComponent],
  imports: [CommonModule],
  providers: [
    {
      provide: CHECKLIST_API,
      useClass: UserChecklistService,
    },
  ],
})
export class UserChecklistModule {}
