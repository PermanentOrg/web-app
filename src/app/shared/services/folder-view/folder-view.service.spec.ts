import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderView } from './folder-view.enum';

describe('FolderViewService', () => {
	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.providers;
		TestBed.configureTestingModule(config);
	});

	it('should be created', () => {
		const service = TestBed.inject(FolderViewService);

		expect(service).toBeTruthy();
	});

	it('should emit folder view changes', () => {
		const service = TestBed.inject(FolderViewService);
		const newFolderView = FolderView.Grid;

		service.viewChange.subscribe((folderViewEmitted: FolderView) => {
			expect(folderViewEmitted).toEqual(newFolderView);
		});

		service.setFolderView(newFolderView);
	});
});
