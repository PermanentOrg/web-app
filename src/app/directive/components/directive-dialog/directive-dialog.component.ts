import { Component } from '@angular/core';
import { Directive } from '@models/directive';
import { EventService } from '@shared/services/event/event.service';

export type DialogState = 'display' | 'edit';

@Component({
	selector: 'pr-directive-dialog',
	templateUrl: './directive-dialog.component.html',
	styleUrls: ['./directive-dialog.component.scss'],
	standalone: false,
})
export class DirectiveDialogComponent {
	constructor(private event: EventService) {
		this.event.dispatch({
			entity: 'account',
			action: 'open_archive_steward',
		});
	}
	public mode: DialogState = 'display';
	public directive: Directive;

	public setSavedDirective(directive: Directive): void {
		this.directive = directive;
	}

	public switchToEdit(directive: Directive): void {
		this.setSavedDirective(directive);
		this.mode = 'edit';
	}

	public saveEditedDirective(directive: Directive): void {
		this.setSavedDirective(directive);
		this.mode = 'display';
	}
}
