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
import { RecordVO } from '@root/app/models';
import { SharePreviewComponent } from './share-preview.component';

describe('SharePreviewComponent', () => {
	let component: SharePreviewComponent;
	let fixture: ComponentFixture<SharePreviewComponent>;
	let dialog: DialogCdkService;
	let router: Router;

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(SharedModule);
		config.imports.push(RouterTestingModule);
		config.declarations.push(SharePreviewComponent);

		const mockRoute = new ActivatedRoute();
		mockRoute.snapshot = new ActivatedRouteSnapshot();
		mockRoute.snapshot.data = {
			sharePreviewVO: {
				ArchiveVO: {},
				AccountVO: {},
				ShareVO: { accessRole: 'viewer', status: 'pending' },
				status: 'pending',
			},
			currentFolder: { displayName: 'test' },
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

	it('should open dialog shortly after loading if user logged out', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		component.isLoggedIn = false;
		tick(1005);

		expect(dialogSpy).toHaveBeenCalled();
	}));

	it('should not open dialog shortly after loading if user logged in', fakeAsync(() => {
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

		expect(dialogSpy).toHaveBeenCalled();
	}));
});
