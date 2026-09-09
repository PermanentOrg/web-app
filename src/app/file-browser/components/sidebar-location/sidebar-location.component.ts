import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocnVOData } from '@models';
import { SharedModule } from '@shared/shared.module';

@Component({
	selector: 'pr-sidebar-location',
	standalone: true,
	imports: [CommonModule, SharedModule],
	templateUrl: './sidebar-location.component.html',
	styleUrls: ['./sidebar-location.component.scss'],
})
export class SidebarLocationComponent {
	@Input() location: LocnVOData | null = null;
	@Input() canEdit = false;

	@Output() editRequested = new EventEmitter<void>();

	public onEditClick(): void {
		if (this.canEdit) {
			this.editRequested.emit();
		}
	}
}
