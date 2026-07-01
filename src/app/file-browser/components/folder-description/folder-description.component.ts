import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FolderVO } from '@models';

@Component({
	selector: 'pr-folder-description',
	templateUrl: './folder-description.component.html',
	styleUrls: ['./folder-description.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class FolderDescriptionComponent {
	@Input() folder: FolderVO;
}
