import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	TestModuleMetadata,
	tick,
} from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { cloneDeep } from 'lodash';
import * as Testing from '@root/test/testbedConfig';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ArchiveVO, RecordVO, ShareVO } from '@models';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { AccessRoleType } from '@models/access-role';
import { MessageService } from '@shared/services/message/message.service';
import { Shallow } from 'shallow-render';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { ShareLinkMappingService } from '@root/app/share-links/services/share-link-mapping.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { SharingDialogComponent } from './sharing-dialog.component';
import {
	MockAccountService,
	MockShareLinksApiService,
	MockRelationshipService,
	MockShareLinkMappingService,
	MockFeatureFlagService,
	MockGoogleAnalyticsService,
	NullDependency,
} from './shared-test-classes';

const archive1 = new ArchiveVO({
	fullName: 'Mr Archive',
	archiveId: 1,
});

const archive2 = new ArchiveVO({
	fullName: 'Archive 2',
	archiveId: 2,
});

const shareViewer = new ShareVO({
	ArchiveVO: archive1,
});
shareViewer.shareId = 2;
shareViewer.accessRole = 'access.role.viewer';

const shareEditor = new ShareVO({
	ArchiveVO: archive2,
});
shareEditor.shareId = 4;
shareEditor.accessRole = 'access.role.editor';

const pendingShare = new ShareVO({
	ArchiveVO: archive2,
});
pendingShare.shareId = 59;
pendingShare.accessRole = 'access.role.viewer';
pendingShare.status = 'status.generic.pending';
pendingShare.requestToken = 'testToken';

class MockDialogRef {
	close() {}
}

describe('SharingDialogComponent', () => {
	let component: SharingDialogComponent;
	let fixture: ComponentFixture<SharingDialogComponent>;
	let item: RecordVO;

	let relationUpdateSpy;

	let showMessageSpy;

	let apiService: ApiService;

	beforeEach(async () => {
		item = new RecordVO({
			accessRole: 'access.role.owner',
			displayName: 'shared item',
			ShareVOs: [],
		});

		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(SharedModule);
		config.declarations.push(SharingDialogComponent);
		config.providers.push({
			provide: DIALOG_DATA,
			useValue: {
				item,
			},
		});
		config.providers.push({
			provide: DialogRef,
			useClass: MockDialogRef,
		});
		await TestBed.configureTestingModule(config).compileComponents();

		relationUpdateSpy = spyOn(
			TestBed.inject(RelationshipService),
			'update',
		).and.returnValue(Promise.resolve());

		showMessageSpy = spyOn(
			TestBed.inject(MessageService),
			'showMessage',
		).and.returnValue(undefined);
		spyOn(TestBed.inject(MessageService), 'showError').and.returnValue(
			undefined,
		);

		apiService = TestBed.inject(ApiService);

		fixture = TestBed.createComponent(SharingDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should exist', () => {
		expect(component).toBeDefined();
	});

	it('should attempt to refresh RelationshipService on creation', () => {
		expect(relationUpdateSpy).toHaveBeenCalled();
	});

	it('should have empty share and pending share lists when share item has none', () => {
		expect(component.shares.length).toBe(0);
		expect(component.pendingShares.length).toBe(0);
	});

	it('should properly separate existing and pending shares', () => {
		component.shareItem = new RecordVO({
			...item,
			ShareVOs: [shareViewer, pendingShare],
		});
		component.ngOnInit();

		expect(component.shares.length).toBe(1);
		expect(component.shares[0].shareId).toBe(shareViewer.shareId);
		expect(component.pendingShares.length).toBe(1);
		expect(component.pendingShares[0].shareId).toBe(pendingShare.shareId);
	});

	it('should add a share to share list upon creation', fakeAsync(() => {
		const shareResponse = new ShareResponse({});
		shareResponse.isSuccessful = true;
		shareResponse.Results = [
			{
				data: [
					{
						ShareVO: shareViewer,
					},
				],
			},
		];

		const apiSpy = spyOn(apiService.share, 'upsert').and.returnValue(
			Promise.resolve(shareResponse),
		);

		component.onAddArchive(shareViewer.ArchiveVO);
		tick();

		expect(apiSpy).toHaveBeenCalled();
		expect(component.shares.length).toBe(1);
		expect(component.shares[0].shareId).toEqual(shareViewer.shareId);
		expect(component.isArchiveSharedWith(shareViewer.ArchiveVO)).toBeTruthy();
	}));

	it('should add a share request to share list upon approval and sort the list by name', fakeAsync(() => {
		component.shareItem = new RecordVO({
			...item,
			ShareVOs: [shareViewer, pendingShare],
		});
		component.ngOnInit();

		const shareResponse = new ShareResponse({});
		shareResponse.isSuccessful = true;
		shareResponse.Results = [
			{
				data: [
					{
						ShareVO: { ...pendingShare, status: 'status.generic.ok' },
					},
				],
			},
		];

		const apiSpy = spyOn(apiService.share, 'upsert').and.returnValue(
			Promise.resolve(shareResponse),
		);

		expect(component.pendingShares.length).toBe(1);

		component.approveShare(component.pendingShares[0]);

		tick();

		expect(apiSpy).toHaveBeenCalled();
		expect(showMessageSpy).toHaveBeenCalled();
		expect(component.pendingShares.length).toBe(0);
		expect(component.shares.length).toBe(2);
		expect(component.shares[0].shareId).toEqual(pendingShare.shareId);
		expect(component.shares[1].shareId).toEqual(shareViewer.shareId);
	}));

	it('should confirm removal and not remove if cancelled', fakeAsync(() => {
		component.shareItem = new RecordVO({ ...item, ShareVOs: [shareViewer] });
		component.ngOnInit();

		const confirmSpy = spyOn(component, 'confirmRemove').and.returnValue(
			Promise.reject(false),
		);

		const share = component.shares[0];
		share.accessRole = 'remove' as AccessRoleType;

		component.onAccessChange(share);

		tick();

		expect(confirmSpy).toHaveBeenCalled();
		expect(component.shares.length).toBe(1);
		expect(component.shares[0].accessRole).toBe(shareViewer.accessRole);
	}));

	it('should confirm adding a new owner and reset if denied', fakeAsync(() => {
		component.shareItem = new RecordVO({ ...item, ShareVOs: [shareViewer] });
		component.ngOnInit();

		const confirmSpy = spyOn(component, 'confirmOwnerAdd').and.returnValue(
			Promise.reject(false),
		);

		const share = component.shares[0];
		share.accessRole = 'access.role.owner';

		component.onAccessChange(share);

		tick();

		expect(confirmSpy).toHaveBeenCalled();
		expect(component.shares.length).toBe(1);
		expect(component.shares[0].accessRole).toBe(shareViewer.accessRole);
	}));
});

describe('SharingDialogComponent - Shallow Rendering', () => {
	it('should be able to save default access role on a share link', async () => {
		MockShareLinksApiService.reset();
		// We have to use another describe() here since we're creating a component with a
		// different set up, and these unit tests (and Angular's testing utilities in general)
		// only expect there to be one TestBed that you use per suite of unit tests.
		@NgModule({
			imports: [FormsModule, CommonModule, ReactiveFormsModule],
		})
		class ShallowTestingModule {}

		const shallow = new Shallow<SharingDialogComponent>(
			SharingDialogComponent,
			ShallowTestingModule,
		)
			.mock(AccountService, new MockAccountService())
			.mock(ApiService, new MockShareLinksApiService())
			.mock(ShareLinksApiService, new MockShareLinksApiService())
			.mock(ShareLinkMappingService, new MockShareLinkMappingService())
			.mock(RelationshipService, new MockRelationshipService())
			.mock(GoogleAnalyticsService, new MockGoogleAnalyticsService())
			.mock(PromptService, new NullDependency())
			.mock(FeatureFlagService, new MockFeatureFlagService())
			.mock(Router, new NullDependency())
			.mock(DialogRef, new NullDependency())
			.mock(MessageService, new NullDependency())
			.mock(ActivatedRoute, new NullDependency())
			.mock(DIALOG_DATA, {
				item: new RecordVO({
					recordId: '123',
					displayName: 'Test File',
					accessRole: 'access.role.owner',
				}),
			});
		const { instance } = await shallow.render();

		await instance.generateShareLink();

		expect(instance.newShareLink).toBeDefined();

		instance.linkDefaultAccessRole = 'access.role.owner';
		await instance.onShareLinkPropChange(
			'defaultAccessRole',
			'access.role.owner',
		);

		expect(instance.newShareLink.permissionsLevel).toBe('owner');
	});
});
