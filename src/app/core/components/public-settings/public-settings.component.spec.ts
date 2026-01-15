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
const mockApiService = {
	archive: {
		update: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			updated = true;
			updatedDownload = data.allowPublicDownload as boolean;
		},
	},
};

describe('PublicSettingsComponent', () => {
	beforeEach(async () => {
		throwError = false;
		updatedDownload = null;
		updated = false;
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
					showError: () => {},
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
});
