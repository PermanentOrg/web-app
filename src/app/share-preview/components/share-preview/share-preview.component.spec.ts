import {
	fakeAsync,
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
	tick,
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import {
	Router,
	ActivatedRoute,
	ActivatedRouteSnapshot,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';

import { SharedModule } from '@shared/shared.module';
import * as Testing from '@root/test/testbedConfig';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { AccountVO, ArchiveVO, RecordVO } from '@root/app/models';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { Subject } from 'rxjs';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { CreateAccountDialogComponent } from '../create-account-dialog/create-account-dialog.component';
import { SharePreviewComponent } from './share-preview.component';

export const mockAccountService = jasmine.createSpyObj('AccountService', [
	'getAccount',
	'getArchive',
	'isLoggedIn',
	'signUp',
	'logIn',
	'refreshArchives',
	'getArchives',
	'changeArchive',
	'promptForArchiveChange',
	'setRedirect',
]);

// Provide default return values
const defaultAccount = new AccountVO({ primaryEmail: 'test@example.com' });
const defaultArchive = new ArchiveVO({ archiveId: 123 });

mockAccountService.getAccount.and.returnValue(defaultAccount);
mockAccountService.getArchive.and.returnValue(defaultArchive);
mockAccountService.isLoggedIn.and.returnValue(true);
mockAccountService.signUp.and.returnValue(Promise.resolve(defaultAccount));

const authResponse = new AuthResponse({});
authResponse.needsMFA = () => false;
mockAccountService.logIn.and.returnValue(Promise.resolve(authResponse));

mockAccountService.refreshArchives.and.returnValue(Promise.resolve());
mockAccountService.getArchives.and.returnValue([defaultArchive]);
mockAccountService.changeArchive.and.returnValue(Promise.resolve());
mockAccountService.promptForArchiveChange.and.returnValue(Promise.resolve());
mockAccountService.setRedirect.and.stub();

// Subjects for subscriptions
mockAccountService.archiveChange = new Subject<ArchiveVO>();
mockAccountService.accountChange = new Subject<AccountVO>();

const mockShareLinksService = {
	currentShareToken: null,
	isUnlistedShare: () => true,
};

describe('SharePreviewComponent', () => {
	let component: SharePreviewComponent;
	let fixture: ComponentFixture<SharePreviewComponent>;
	let dialog: DialogCdkService;
	let router: Router;

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(SharedModule, RouterTestingModule);
		config.declarations.push(SharePreviewComponent);

		const mockRoute = new ActivatedRoute();
		mockRoute.snapshot = new ActivatedRouteSnapshot();
		mockRoute.snapshot.data = {
			sharePreviewVO: {
				ArchiveVO: {},
				AccountVO: { fullName: 'Sharer Name' },
				ShareVO: { accessRole: 'viewer', status: 'pending' },
				status: 'pending',
			},
			currentFolder: { displayName: 'test', archiveId: 123 },
		};
		mockRoute.snapshot.params = { shareToken: 'test' };
		mockRoute.snapshot.queryParams = { requestAccess: 'test' };

		const firstChild = new ActivatedRouteSnapshot();
		firstChild.data = { sharePreviewView: {} };
		spyOnProperty(mockRoute.snapshot, 'firstChild', 'get').and.returnValue(
			firstChild,
		);

		const parent = new ActivatedRoute();
		spyOnProperty(mockRoute, 'parent', 'get').and.returnValue(parent);

		config.providers.push({
			provide: ActivatedRoute,
			useValue: mockRoute,
		});

		config.providers.push({
			provide: ShareLinksService,
			useValue: mockShareLinksService,
		});

		await TestBed.configureTestingModule(config).compileComponents();

		dialog = TestBed.inject(DialogCdkService);
		router = TestBed.inject(Router);
		spyOn(router, 'navigate');

		fixture = TestBed.createComponent(SharePreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should mark it as unlisted share if restrictions are none', fakeAsync(() => {
		spyOn(mockShareLinksService, 'isUnlistedShare').and.returnValue(true);
		component.ngOnInit();

		expect(mockShareLinksService.isUnlistedShare).toHaveBeenCalled();
		tick(1005);

		expect(component.isUnlistedShare).toEqual(true);
	}));

	it('should open dialog shortly after loading if user is logged out', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		component.isLoggedIn = false;
		component.showCreateAccountDialog();
		tick(1005);

		expect(dialogSpy).toHaveBeenCalledWith(CreateAccountDialogComponent, {
			data: { sharerName: 'Sharer Name' },
		});
	}));

	it('should not open dialog if already open', () => {
		const dialogSpy = spyOn(dialog, 'open');
		component.createAccountDialogIsOpen = true;

		component.showCreateAccountDialog();

		expect(dialogSpy).not.toHaveBeenCalled();
	});

	it('should not open dialog shortly after loading if share is unlisted', fakeAsync(() => {
		const dialogSpy = spyOn(dialog, 'open');
		component.isUnlistedShare = true;
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog shortly after loading if user is logged in', fakeAsync(() => {
		const dialogSpy = spyOn(dialog, 'open');
		component.isLoggedIn = true;
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should open dialog when a thumbnail is clicked', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		const mockFileList = { itemClicked: new EventEmitter<any>() };

		component.subscribeToItemClicks(mockFileList);
		mockFileList.itemClicked.emit({
			item: new RecordVO({}),
			selectable: false,
		});
		tick();

		expect(dialogSpy).toHaveBeenCalledWith(CreateAccountDialogComponent, {
			data: { sharerName: 'Sharer Name' },
		});
	}));

	it('should unsubscribe from item clicks', () => {
		const mockFileList = { itemClicked: new EventEmitter<any>() };
		component.subscribeToItemClicks(mockFileList);
		const unsubscribeSpy = spyOn(
			component.fileListClickListener,
			'unsubscribe',
		);
		component.unsubscribeFromItemClicks();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should toggle cover visibility', () => {
		component.showCover = false;
		component.toggleCover();

		expect(component.showCover).toBeTrue();

		component.toggleCover();

		expect(component.showCover).toBeFalse();
	});

	it('should dispatch banner close', () => {
		const spy = jasmine.createSpy();
		component.hideBannerObservable.subscribe(spy);
		component.dispatchBannerClose();

		expect(spy).toHaveBeenCalled();
	});

	it('should stop event propagation', () => {
		const event = jasmine.createSpyObj('Event', ['stopPropagation']);
		component.stopPropagation(event);

		expect(event.stopPropagation).toHaveBeenCalled();
	});

	it('should navigate to auth login if relationship share', () => {
		component.isRelationshipShare = true;
		component.navToAuth();

		expect(router.navigate).toHaveBeenCalledWith(['/app', 'auth', 'login']);
	});

	it('should navigate to auth signup if not relationship share', () => {
		component.isRelationshipShare = false;
		component.navToAuth();

		expect(router.navigate).toHaveBeenCalledWith(['/app', 'auth', 'signup']);
	});
});
