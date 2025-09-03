import { Shallow } from 'shallow-render';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { MessageService } from '@shared/services/message/message.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { ShareLinkSettingsComponent } from './share-link-settings.component';

const mockApiService = {
	share: {
		generateShareLink: jasmine.createSpy().and.returnValue(
			Promise.resolve({
				getShareByUrlVO: () => ({
					shareUrl: 'http://test/link',
					createdDT: new Date().toISOString(),
					autoApproveToggle: 1,
					previewToggle: 1,
					defaultAccessRole: 'viewer',
				}),
			}),
		),
		updateShareLink: jasmine.createSpy().and.returnValue(Promise.resolve({})),
		removeShareLink: jasmine.createSpy().and.returnValue(Promise.resolve({})),
	},
};

describe('ShareLinkSettingsComponent', () => {
	let shallow: Shallow<ShareLinkSettingsComponent>;

	beforeEach(() => {
		shallow = new Shallow(
			ShareLinkSettingsComponent,
			FileBrowserComponentsModule,
		)
			.mock(MessageService, { showError: jasmine.createSpy() })
			.mock(ApiService, mockApiService)
			.mock(GoogleAnalyticsService, { sendEvent: jasmine.createSpy() })
			.dontMock(NoopAnimationsModule)
			.import(NoopAnimationsModule);
	});

	it('should create component', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should set default form values when shareLink is null', async () => {
		const { instance } = await shallow.render({ bind: { shareLink: null } });
		instance.setShareLinkFormValue();

		expect(instance.previewToggle).toBe(1);
		expect(instance.expiration).toBe('Never');
	});

	it('should handle error on generateShareLink gracefully', async () => {
		mockApiService.share.generateShareLink.and.returnValue(
			Promise.reject({ getMessage: () => 'error' }),
		);
		const { instance } = await shallow.render();
		await instance.generateShareLink();

		expect(instance.updatingLink).toBeFalse();
	});

	it('should copy share link', async () => {
		const { instance } = await shallow.render({
			bind: { shareLink: { shareUrl: 'http://copy.link' } as any },
		});
		instance.shareUrlInput = {
			nativeElement: document.createElement('input'),
		} as any;
		spyOn(document, 'execCommand').and.returnValue(true);
		instance.copyShareLink();

		expect(instance.linkCopied).toBeTrue();
	});

	it('should update share ', async () => {
		const { instance } = await shallow.render({
			bind: {
				shareLink: {
					previewToggle: 1,
					createdDT: new Date().toISOString(),
				} as any,
			},
		});

		await instance.onShareLinkPropChange('previewToggle', 0);

		expect(mockApiService.share.updateShareLink).toHaveBeenCalledWith(
			jasmine.objectContaining({ previewToggle: 0 }),
		);

		expect(instance.shareLink.previewToggle).toBe(0);
	});

	it('should restore values if updating link property fails', async () => {
		mockApiService.share.updateShareLink.and.returnValue(
			Promise.reject({ getMessage: () => 'err' }),
		);
		const { instance } = await shallow.render({
			bind: {
				shareLink: {
					previewToggle: 1,
					createdDT: new Date().toISOString(),
				} as any,
			},
		});
		await instance.onShareLinkPropChange('previewToggle', 0);

		expect(instance.previewToggle).toBe(1);
	});

	it('should update share link property successfully', async () => {
		const testShareLink = {
			previewToggle: 1,
			autoApproveToggle: 1,
			createdDT: new Date().toISOString(),
		} as any;

		const { instance } = await shallow.render({
			bind: { shareLink: testShareLink },
		});

		mockApiService.share.updateShareLink.and.returnValue(Promise.resolve({}));

		await instance.onShareLinkPropChange('previewToggle', 0);

		testShareLink.previewToggle = 0;

		expect(mockApiService.share.updateShareLink).toHaveBeenCalledWith(
			jasmine.objectContaining({ previewToggle: 0 }),
		);

		expect(instance.shareLink.previewToggle).toBe(0);
	});

	it('should handle error when removeShareLink fails', async () => {
		mockApiService.share.removeShareLink.and.returnValue(
			Promise.reject({ getMessage: () => 'error' }),
		);
		const { instance, inject } = await shallow.render({
			bind: { shareLink: { shareUrl: 'x' } as any },
		});
		const promptService = inject(PromptService);

		spyOn(promptService, 'confirm').and.returnValue(Promise.resolve());
		await instance.removeShareLink();

		expect(instance.shareLink).not.toBeNull();
	});
});
