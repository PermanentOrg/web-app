import { NgModule } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';
import { DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { TagsService } from '@core/services/tags/tags.service';
import { ArchiveResponse } from '@shared/services/api/archive.repo';
import { ArchiveSettingsDialogComponent } from './archive-settings-dialog.component';

@NgModule()
class DummyModule {}

class MockDialogRef {
	close(value?: any): void {}
}

const mockApiService = {
	tag: {
		async getTagsByArchive(archive) {
			return await Promise.resolve({ getTagVOs: () => [] });
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
	beforeEach(
		async () =>
			await MockBuilder(ArchiveSettingsDialogComponent, DummyModule)
				.provide({
					provide: DialogRef,
					useClass: MockDialogRef,
				})
				.provide({
					provide: ActivatedRoute,
					useValue: { snapshot: { fragment: null } },
				})
				.provide({
					provide: ApiService,
					useValue: mockApiService,
				})
				.provide({
					provide: AccountService,
					useValue: mockAccountService,
				})
				.provide({
					provide: TagsService,
					useValue: mockTagsService,
				}),
	);

	it('should create', () => {
		const fixture = MockRender(ArchiveSettingsDialogComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should initialize with public-settings tab', () => {
		const fixture = MockRender(ArchiveSettingsDialogComponent);

		expect(fixture.point.componentInstance.activeTab).toBe('public-settings');
	});
});
