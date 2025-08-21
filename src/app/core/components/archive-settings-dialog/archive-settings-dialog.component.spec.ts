import { Shallow } from 'shallow-render';
import { CoreModule } from '@core/core.module';
import { DialogRef } from '@angular/cdk/dialog';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { TagsService } from '@core/services/tags/tags.service';
import { ArchiveResponse } from '@shared/services/api/archive.repo';
import { ArchiveSettingsDialogComponent } from './archive-settings-dialog.component';

class MockDialogRef {
	close(value?: any): void {}
}

const mockApiService = {
	tag: {
		async getTagsByArchive(archive) {
			return await Promise.resolve([]);
		},
	},
	archive: {
		async getMembers(archive) {
			return await Promise.resolve(
				new ArchiveResponse({
					Results: [],
				}),
			);
		},
	},
};

const mockTagsService = {
	resetTags() {},
};

const mockAccountService = {
	getArchive() {
		return new ArchiveVO({});
	},
};

describe('ArchiveSettingsDialogComponent', () => {
	let shallow: Shallow<ArchiveSettingsDialogComponent>;

	beforeEach(() => {
		shallow = new Shallow(ArchiveSettingsDialogComponent, CoreModule)
			.provide({
				provide: DialogRef,
				useClass: MockDialogRef,
			})
			.provideMock({
				provide: ApiService,
				useValue: mockApiService,
			})
			.provideMock({
				provide: AccountService,
				useValue: mockAccountService,
			})
			.provide({
				provide: TagsService,
				useValue: mockTagsService,
			});
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should initialize with public-settings tab', async () => {
		const { instance } = await shallow.render();

		expect(instance.activeTab).toBe('public-settings');
	});
});
