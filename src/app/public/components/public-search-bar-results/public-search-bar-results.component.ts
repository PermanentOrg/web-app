import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderVO, RecordVO, TagVOData } from '@models/index';

@Component({
	selector: 'pr-public-search-bar-results',
	templateUrl: './public-search-bar-results.component.html',
	styleUrl: './public-search-bar-results.component.scss',
	standalone: false,
})
export class PublicSearchBarResultsComponent {
	@Input() searchResults: FolderVO[] | RecordVO[] = [];
	@Input() tags: TagVOData[] = [];

	@Output() searchTriggered = new EventEmitter<void>();
	@Output() tagClickOutput = new EventEmitter<TagVOData[]>();

	constructor(
		public router: Router,
		public route: ActivatedRoute,
	) {}

	public viewAllResults(): void {
		this.searchTriggered.emit();
	}

	public onTagClick(tag: TagVOData): void {
		this.tagClickOutput.emit([tag]);
	}

	public goToFile(item: RecordVO | FolderVO): void {
		if (item.type === 'type.folder.public') {
			this.router.navigate([item.archiveNbr, item.folder_linkId], {
				relativeTo: this.route,
			});
		} else {
			this.router.navigate([item.parentArchiveNbr, item.parentFolder_linkId], {
				relativeTo: this.route,
			});
		}
	}
}
