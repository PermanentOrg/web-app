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
	public directives: Directive[] = [];
	public editing: Directive | null = null;

	public setLoadedDirectives(directives: Directive[]): void {
		this.directives = directives;
	}

	public switchToEdit(directive: Directive | null): void {
		this.editing = directive;
		this.mode = 'edit';
	}

	public saveEditedDirective(directive: Directive): void {
		const matchingIndex = this.directives.findIndex(
			(existing) => existing.directiveId === directive.directiveId,
		);
		if (matchingIndex >= 0) {
			this.directives = [
				...this.directives.slice(0, matchingIndex),
				directive,
				...this.directives.slice(matchingIndex + 1),
			];
		} else {
			this.directives = [...this.directives, directive];
		}
		this.editing = null;
		this.mode = 'display';
	}
}
