import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { FolderVO, RecordVO } from '@models/index';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { ArchiveVO } from '../../../models/archive-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { PublishComponent } from './publish.component';

const PUBLIC_ROOT = new FolderVO({
	folderId: '140683',
	folder_linkId: 55,
	archiveNbr: '0001-0000',
	type: 'type.folder.root.public',
});

// Shaped the way getWithChildren returns it: a v1-style envelope whose child items
// are the converted Stela folders.
function publicRootResponseWithChildren(
	children: Array<Record<string, unknown>>,
): FolderResponse {
	return new FolderResponse({
		isSuccessful: true,
		isSystemUp: true,
		Results: [
			{
				data: [
					{
						FolderVO: {
							...PUBLIC_ROOT,
							ChildItemVOs: children,
						},
					},
				],
			},
		],
	});
}

class MockDialogRef {
	close() {}
}

describe('PublishComponent', () => {
	let component: PublishComponent;
	let fixture: ComponentFixture<PublishComponent>;
	let mockApiService: any;
	let mockAccountService: any;
	let showErrorSpy: jasmine.Spy;

	beforeEach(async () => {
		mockAccountService = {
			getArchive: () => new ArchiveVO({ accessRole: 'access.role.owner' }),
			getRootFolder: () => ({ ChildItemVOs: [PUBLIC_ROOT] }),
			refreshAccountDebounced: () => {},
		};

		mockApiService = {
			folder: {
				copy: jasmine
					.createSpy('copy')
					.and.resolveTo(new FolderResponse({ isSuccessful: true })),
				getWithChildren: jasmine
					.createSpy('getWithChildren')
					.and.resolveTo(publicRootResponseWithChildren([])),
			},
			publish: {
				getInternetArchiveLink: async () => ({
					getPublishIaVO: () => null,
				}),
				publishToInternetArchive: async () => ({
					getPublishIaVO: () => null,
				}),
			},
			record: {
				copy: async () => ({
					getRecordVO: () => new RecordVO({}),
				}),
			},
		};

		showErrorSpy = jasmine.createSpy('showError');

		await TestBed.configureTestingModule({
			declarations: [PublishComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{
					provide: DIALOG_DATA,
					useValue: {
						item: { folder_linkType: 'linkType' },
					},
				},
				{ provide: DialogRef, useClass: MockDialogRef },
				EventService,
				{
					provide: MessageService,
					useValue: { showError: showErrorSpy },
				},
				{
					provide: Router,
					useValue: { navigate: () => {} },
				},
				{
					provide: GoogleAnalyticsService,
					useValue: { sendEvent: () => {} },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PublishComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should disaple the public to internet archive button if the user does not have the correct access role', () => {
		mockAccountService.getArchive = () =>
			new ArchiveVO({ accessRole: 'access.role.viewer' });
		fixture = TestBed.createComponent(PublishComponent);
		component = fixture.componentInstance;
		component.publicItem = new RecordVO({ recordId: 1 });
		component.publishIa = null;
		component.publicLink = null;

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.publish-to-archive');

		expect(button.disabled).toBeTruthy();
	});

	describe('publishing a folder', () => {
		beforeEach(() => {
			component.sourceItem = new FolderVO({
				folderId: '900',
				archiveNbr: '0002-0001',
				folder_linkId: 12,
				displayName: 'Trip to Iceland',
				type: 'type.folder.private',
			});
		});

		it('should load the public root through getWithChildren', async () => {
			mockApiService.folder.getWithChildren.and.resolveTo(
				publicRootResponseWithChildren([
					{
						folderId: '901',
						archiveNbr: '0001-0002',
						folder_linkId: 71,
						displayName: 'Trip to Iceland',
						type: 'type.folder.public',
						updatedDT: '2026-08-10T10:00:00Z',
						ChildItemVOs: [],
					},
				]),
			);

			await component.publishItem();

			expect(mockApiService.folder.getWithChildren).toHaveBeenCalledWith([
				PUBLIC_ROOT,
			]);

			expect(mockApiService.folder.getWithChildren).toHaveBeenCalledTimes(1);
		});

		it('should pick the most recently updated folder matching the source name', async () => {
			mockApiService.folder.getWithChildren.and.resolveTo(
				publicRootResponseWithChildren([
					{
						folderId: '901',
						archiveNbr: '0001-0002',
						folder_linkId: 71,
						displayName: 'Trip to Iceland',
						type: 'type.folder.public',
						updatedDT: '2026-01-01T10:00:00Z',
						ChildItemVOs: [],
					},
					{
						folderId: '902',
						archiveNbr: '0001-0003',
						folder_linkId: 72,
						displayName: 'Trip to Iceland',
						type: 'type.folder.public',
						updatedDT: '2026-08-10T10:00:00Z',
						ChildItemVOs: [],
					},
				]),
			);

			await component.publishItem();

			// The newer of the two copies. This asserts the selection given a mapped
			// updatedDT; that the Stela conversion actually populates it is covered
			// in folder.repo.spec.ts.
			expect(component.publicItem.folder_linkId).toBe(72);
			expect(component.publicLink).toContain('0001-0003');
		});

		it('should ignore child records when looking for the copy', async () => {
			mockApiService.folder.getWithChildren.and.resolveTo(
				publicRootResponseWithChildren([
					{
						recordId: '500',
						archiveNbr: '0001-0009',
						folder_linkId: 80,
						displayName: 'Trip to Iceland',
						updatedDT: '2026-08-10T12:00:00Z',
					},
					{
						folderId: '901',
						archiveNbr: '0001-0002',
						folder_linkId: 71,
						displayName: 'Trip to Iceland',
						type: 'type.folder.public',
						updatedDT: '2026-08-10T10:00:00Z',
						ChildItemVOs: [],
					},
				]),
			);

			await component.publishItem();

			expect(component.publicItem instanceof FolderVO).toBeTrue();
			expect(component.publicItem.folder_linkId).toBe(71);
		});

		it('should surface a generic error when the request rejects without a message', async () => {
			mockApiService.folder.getWithChildren.and.rejectWith(
				new Error('500 from the server'),
			);

			await component.publishItem();

			expect(showErrorSpy).toHaveBeenCalledWith({
				message: 'error.generic.internal',
				translate: true,
			});

			expect(component.waiting).toBeFalse();
		});

		it('should keep showing the server message when one is available', async () => {
			mockApiService.folder.copy.and.rejectWith({
				getMessage: () => 'warning.record.copy_status',
			});

			await component.publishItem();

			expect(showErrorSpy).toHaveBeenCalledWith({
				message:
					'Sorry, this record cannot be copied or published until processing completes.',
			});
		});
	});
});
