import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ArchiveVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PublicSettingsComponent } from './public-settings.component';

@NgModule({
	declarations: [],
	imports: [],
	providers: [ApiService],
	bootstrap: [],
})
class DummyModule {}

let archive: ArchiveVO;
let throwError: boolean = false;
let updatedDownload: boolean = false;
let updated: boolean = false;
let patchArchiveThrowError: boolean = false;
let patchArchiveCalled: boolean = false;
let patchArchiveCalledWith: { archiveId: string; order: string } | null = null;
let showErrorCalled: boolean = false;
const mockApiService = {
	archive: {
		update: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			updated = true;
			updatedDownload = data.allowPublicDownload as boolean;
		},
		patchArchive: async (archiveId: string, milestoneSortOrder: string) => {
			if (patchArchiveThrowError) {
				throw { error: { message: 'Test Error' } };
			}
			patchArchiveCalled = true;
			patchArchiveCalledWith = { archiveId, order: milestoneSortOrder };
		},
	},
};

describe('PublicSettingsComponent', () => {
	beforeEach(async () => {
		throwError = false;
		updatedDownload = null;
		updated = false;
		patchArchiveThrowError = false;
		patchArchiveCalled = false;
		patchArchiveCalledWith = null;
		showErrorCalled = false;
		archive = {
			allowPublicDownload: true,
		} as ArchiveVO;
		await MockBuilder(PublicSettingsComponent, DummyModule)
			.provide({
				provide: ApiService,
				useValue: mockApiService,
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: () => {
						showErrorCalled = true;
					},
				},
			});
	});

	function defaultRender(a: ArchiveVO = archive) {
		return MockRender(
			`<pr-public-settings [archive]="archive"></pr-public-settings>`,
			{ archive: a },
		);
	}

	it('should exist', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	describe('it should have the proper option checked by default', () => {
		it('on', () => {
			defaultRender();
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			expect(instance.allowDownloadsToggle).toBeTruthy();
		});

		it('off', () => {
			defaultRender({
				allowPublicDownload: false,
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			expect(instance.allowDownloadsToggle).toBeFalsy();
		});
	});

	it('should save the archive setting when changed', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(PublicSettingsComponent);

		expect(updated).toBeFalse();
		instance.allowDownloadsToggle = 0;
		await instance.onAllowDownloadsChange();

		expect(updated).toBeTrue();
		expect(updatedDownload).toBeFalse();
		instance.allowDownloadsToggle = 1;
		await instance.onAllowDownloadsChange();

		expect(updatedDownload).toBeTrue();
	});

	it('should fail silently', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(PublicSettingsComponent);

		throwError = true;
		instance.allowDownloadsToggle = 0;
		await instance.onAllowDownloadsChange();

		expect(updated).toBeFalse();
	});

	describe('milestoneSortOrder initialization', () => {
		it('should default to reverse_chronological when not set on archive', () => {
			defaultRender({ allowPublicDownload: false } as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			expect(instance.milestoneSortOrder).toBe('reverse_chronological');
		});

		it('should initialize to chronological when archive has chronological', () => {
			defaultRender({
				allowPublicDownload: false,
				milestoneSortOrder: 'chronological',
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			expect(instance.milestoneSortOrder).toBe('chronological');
		});

		it('should initialize to reverse_chronological when archive has reverse_chronological', () => {
			defaultRender({
				allowPublicDownload: false,
				milestoneSortOrder: 'reverse_chronological',
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			expect(instance.milestoneSortOrder).toBe('reverse_chronological');
		});
	});

	describe('onMilestoneSortOrderChange', () => {
		it('should call patchArchive with the archive id and new sort order', async () => {
			defaultRender({
				allowPublicDownload: false,
				archiveId: 'abc123',
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			instance.milestoneSortOrder = 'chronological';
			await instance.onMilestoneSortOrderChange();

			expect(patchArchiveCalled).toBeTrue();
			expect(patchArchiveCalledWith).toEqual({
				archiveId: 'abc123',
				order: 'chronological',
			});
		});

		it('should update archive.milestoneSortOrder', async () => {
			const a = {
				allowPublicDownload: false,
				archiveId: 'abc123',
				milestoneSortOrder: 'reverse_chronological',
			} as ArchiveVO;
			defaultRender(a);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			instance.milestoneSortOrder = 'chronological';
			await instance.onMilestoneSortOrderChange();

			expect(a.milestoneSortOrder).toBe('chronological');
		});

		it('should show an error when patchArchive throws', async () => {
			defaultRender({
				allowPublicDownload: false,
				archiveId: 'abc123',
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			patchArchiveThrowError = true;
			await instance.onMilestoneSortOrderChange();

			expect(showErrorCalled).toBeTrue();
		});

		it('should set updating to true while saving and reset to false after', async () => {
			defaultRender({
				allowPublicDownload: false,
				archiveId: 'abc123',
			} as ArchiveVO);
			const instance = ngMocks.findInstance(PublicSettingsComponent);

			let updatingWhileSaving: boolean;
			const originalPatchArchive = mockApiService.archive.patchArchive;
			mockApiService.archive.patchArchive = async (id, order) => {
				updatingWhileSaving = instance.updating;
				return await originalPatchArchive(id, order);
			};

			await instance.onMilestoneSortOrderChange();

			expect(updatingWhileSaving).toBeTrue();
			expect(instance.updating).toBeFalse();

			mockApiService.archive.patchArchive = originalPatchArchive;
		});
	});
});
