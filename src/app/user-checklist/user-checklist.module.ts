import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';

@NgModule({
  declarations: [UserChecklistComponent],
  exports: [UserChecklistComponent],
  imports: [CommonModule],
})
export class UserChecklistModule {}
