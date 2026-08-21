import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderVO } from '@root/app/models';
import { TimelineViewComponent } from './timeline-view.component';

const buildFolderResponse = (displayName: string) =>
	new FolderResponse({
		isSuccessful: true,
		Results: [{ data: [{ FolderVO: { displayName, ChildItemVOs: [] } }] }],
	});

describe('TimelineViewComponent', () => {
	let component: TimelineViewComponent;
	let fixture: ComponentFixture<TimelineViewComponent>;
	let api: ApiService;
	let dataService: DataService;
	let message: MessageService;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(TimelineViewComponent);
		config.providers.push(DataService);
		config.providers.push(ApiService);
		config.providers.push({
			provide: ActivatedRoute,
			useValue: {
				snapshot: { data: { currentFolder: new FolderVO({}) }, params: {} },
			},
		});

		TestBed.configureTestingModule(config).compileComponents();

		// Deliberately no detectChanges: ngOnInit stands up vis-timeline against a
		// real canvas, and none of that is under test here.
		fixture = TestBed.createComponent(TimelineViewComponent);
		component = fixture.componentInstance;

		api = TestBed.inject(ApiService);
		dataService = TestBed.inject(DataService);
		message = TestBed.inject(MessageService);

		// ngOnDestroy still runs when the fixture is torn down, and it tears down
		// the two things the skipped lifecycle hooks would have created.
		component.timeline = { destroy: () => {} } as any;
		(component as any).dataServiceSubscription = new Subscription();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onFolderClick', () => {
		it('should publish the loaded folder as the current folder', async () => {
			spyOn(api.folder, 'getWithChildrenByIdentifier').and.resolveTo(
				buildFolderResponse('Photos'),
			);
			const setCurrentFolderSpy = spyOn(dataService, 'setCurrentFolder');

			await component.onFolderClick(new FolderVO({ folderId: '77' }));

			expect(setCurrentFolderSpy).toHaveBeenCalled();
			expect(setCurrentFolderSpy.calls.mostRecent().args[0].displayName).toBe(
				'Photos',
			);

			expect(component.isNavigating).toBeFalse();
		});

		it('should pass a breadcrumb folder through unchanged', async () => {
			const getSpy = spyOn(
				api.folder,
				'getWithChildrenByIdentifier',
			).and.resolveTo(buildFolderResponse('Ancestor'));
			spyOn(dataService, 'setCurrentFolder');

			await component.onFolderClick(
				new FolderVO({ archiveNbr: '0001-0005', folder_linkId: 99 }),
			);

			const requestedFolder = getSpy.calls.mostRecent().args[0];

			expect(requestedFolder.archiveNbr).toBe('0001-0005');
			expect(requestedFolder.folder_linkId).toBe(99);
			expect(requestedFolder.folderId).toBeUndefined();
		});

		it('should show an error instead of rejecting when the load fails', async () => {
			spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
				new Error('Network down'),
			);
			const setCurrentFolderSpy = spyOn(dataService, 'setCurrentFolder');
			const showErrorSpy = spyOn(message, 'showError');

			await expectAsync(
				component.onFolderClick(new FolderVO({ folderId: '77' })),
			).toBeResolved();

			expect(showErrorSpy).toHaveBeenCalledWith({
				message: 'error.generic.internal',
				translate: true,
			});

			expect(setCurrentFolderSpy).not.toHaveBeenCalled();
		});

		it('should stop navigating even when the load fails', async () => {
			spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
				new Error('Network down'),
			);
			spyOn(message, 'showError');

			await component.onFolderClick(new FolderVO({ folderId: '77' }));

			expect(component.isNavigating).toBeFalse();
		});
	});
});
