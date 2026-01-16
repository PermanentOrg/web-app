import { Injectable } from '@angular/core';
import {
	FolderPickerComponent,
	FolderPickerOperations,
} from '@core/components/folder-picker/folder-picker.component';
import { FolderVO, RecordVO } from '@root/app/models';

@Injectable({
	providedIn: 'root',
})
export class FolderPickerService {
	private component: FolderPickerComponent;

	registerComponent(toRegister: FolderPickerComponent) {
		if (this.component) {
			throw new Error(
				'FolderPickerService - Folder picker component already registered',
			);
		}

		this.component = toRegister;
	}

	unregisterComponent() {
		this.component = null;
	}

	async chooseFolder(
		startingFolder: FolderVO,
		operation: FolderPickerOperations,
		savePromise?: Promise<any>,
		filterFolderLinkIds: number[] = null,
	) {
		if (!this.component) {
			throw new Error('FolderPickerService - Folder picker component missing');
		}

		return await this.component.show(
			startingFolder,
			operation,
			savePromise,
			filterFolderLinkIds,
		);
	}

	async chooseRecord(startingFolder: FolderVO): Promise<RecordVO> {
		if (!this.component) {
			throw new Error('FolderPickerService - Folder picker component missing');
		}

		return (await this.component.show(
			startingFolder,
			FolderPickerOperations.ChooseRecord,
			null,
			null,
			true,
		)) as RecordVO;
	}
}
