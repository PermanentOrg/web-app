import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { EventService } from '@shared/services/event/event.service';
import { RouterModule } from '@angular/router';
import { UserChecklistComponent } from './components/user-checklist/user-checklist.component';
import { ChecklistIconComponent } from './components/checklist-icon/checklist-icon.component';
import { TaskIconComponent } from './components/task-icon/task-icon.component';
import { MinimizeIconComponent } from './components/minimize-icon/minimize-icon.component';
import { CHECKLIST_API } from './types/checklist-api';
import { UserChecklistService } from './services/user-checklist.service';
import { ChecklistEventObserverService } from './services/checklist-event-observer.service';
import { TaskLinkPipe } from './pipes/task-link.pipe';

@NgModule({
	declarations: [
		UserChecklistComponent,
		ChecklistIconComponent,
		TaskIconComponent,
		MinimizeIconComponent,
		TaskLinkPipe,
	],
	exports: [UserChecklistComponent],
	imports: [CommonModule, SharedModule, RouterModule],
	providers: [
		{
			provide: CHECKLIST_API,
			useClass: UserChecklistService,
		},
		ChecklistEventObserverService,
	],
})
export class UserChecklistModule {
	constructor(
		event: EventService,
		checklistEventObserver: ChecklistEventObserverService,
	) {
		event.addObserver(checklistEventObserver);
	}
}
