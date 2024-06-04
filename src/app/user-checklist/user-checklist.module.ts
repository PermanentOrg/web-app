import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';
import { ChecklistIconComponent } from './components/checklist-icon/checklist-icon.component';

@NgModule({
  declarations: [UserChecklistComponent, ChecklistIconComponent],
  exports: [UserChecklistComponent],
  imports: [CommonModule],
})
export class UserChecklistModule {}
