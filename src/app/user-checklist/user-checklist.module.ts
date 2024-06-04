import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';
import { ChecklistIconComponent } from './components/checklist-icon/checklist-icon.component';
import { TaskIconComponent } from './components/task-icon/task-icon.component';

@NgModule({
  declarations: [UserChecklistComponent, ChecklistIconComponent, TaskIconComponent],
  exports: [UserChecklistComponent],
  imports: [CommonModule],
})
export class UserChecklistModule {}
