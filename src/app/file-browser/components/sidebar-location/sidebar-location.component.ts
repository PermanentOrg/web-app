import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocnVOData } from '@models';
import { SharedModule } from '@shared/shared.module';
import { Coordinates } from '@shared/utilities/coordinates';
import { SidebarCoordinatesComponent } from '@fileBrowser/components/sidebar-coordinates/sidebar-coordinates.component';

@Component({
	selector: 'pr-sidebar-location',
	standalone: true,
	imports: [CommonModule, SharedModule, SidebarCoordinatesComponent],
	templateUrl: './sidebar-location.component.html',
	styleUrls: ['./sidebar-location.component.scss'],
})
export class SidebarLocationComponent {
	@Input() location: LocnVOData | null = null;
	@Input() canEdit = false;
	@Input() showUncertainLocations = false;

	@Output() editRequested = new EventEmitter<void>();
	@Output() coordinatesChange = new EventEmitter<Coordinates | null>();
	@Output() coordinatesMapRequested = new EventEmitter<void>();

	public onEditClick(): void {
		if (this.canEdit) {
			this.editRequested.emit();
		}
	}
}
