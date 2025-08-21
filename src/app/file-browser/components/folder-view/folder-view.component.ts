import { Component, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { Subscription } from 'rxjs';

@Component({
	selector: 'pr-folder-view',
	templateUrl: './folder-view.component.html',
	styleUrls: ['./folder-view.component.scss'],
	standalone: false,
})
export class FolderViewComponent implements OnDestroy {
	public currentView: FolderView;
	private dataServiceSubscription: Subscription;
	constructor(private data: DataService) {
		if (this.data.currentFolder) {
			this.currentView = data.currentFolder.view;
		}
		this.dataServiceSubscription = this.data.currentFolderChange.subscribe(
			(folder) => {
				this.currentView = folder.view;
			},
		);
	}

	ngOnDestroy() {
		this.dataServiceSubscription.unsubscribe();
	}
}
