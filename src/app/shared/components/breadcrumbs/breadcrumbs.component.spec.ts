import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';
import { DataService } from '@shared/services/data/data.service';
import { Router } from '@angular/router';
import { FolderVO } from '@root/app/models';
import { of } from 'rxjs';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

describe('BreadcrumbsComponent', () => {
	let component: BreadcrumbsComponent;
	let fixture: ComponentFixture<BreadcrumbsComponent>;
	let dataService: DataService;
	const mockShareLinkService = {
		isUnlistedShare: jasmine.createSpy().and.returnValue(of(false)),
	};

	async function init(currentUrl?: string) {
		TestBed.resetTestingModule();
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(BreadcrumbsComponent);
		config.providers.push(DataService);
		config.providers.push({
			provide: ShareLinksService,
			useValue: mockShareLinkService,
		});

		config.providers.push({
			provide: Router,
			useValue: {
				routerState: {
					snapshot: {
						url: currentUrl || '/',
					},
				},
			},
		});

		await TestBed.configureTestingModule(config).compileComponents();

		dataService = TestBed.inject(DataService);
		fixture = TestBed.createComponent(BreadcrumbsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}

	it('should create', async () => {
		await init();

		expect(component).toBeTruthy();
	});

	it('should update the current folder when dataService is updated', async () => {
		await init();

		expect(component.currentFolder).toBeFalsy();
		const testFolder = new FolderVO({
			pathAsText: ['test'],
			pathAsArchiveNbr: ['test'],
			pathAsFolder_linkId: [1],
		});
		dataService.setCurrentFolder(testFolder);

		expect(component.currentFolder).toEqual(testFolder);
		dataService.setCurrentFolder();

		expect(component.currentFolder).toBeFalsy();
	});

	it('should create the proper amount of breadcrumbs with proper links', async () => {
		await init();
		const testFolder = new FolderVO({
			pathAsArchiveNbr: ['test1', 'test2', 'test3'],
			pathAsText: ['My Files', 'Test Folder Parent', 'Test Folder'],
			pathAsFolder_linkId: [1, 2, 3],
		});
		dataService.setCurrentFolder(testFolder);

		expect(component.breadcrumbs.length).toBe(
			testFolder.pathAsArchiveNbr.length,
		);
		const expectedUrl = `/private/${testFolder.pathAsArchiveNbr[1]}/${testFolder.pathAsFolder_linkId[1]}`;

		expect(component.breadcrumbs[1].routerPath).toEqual(expectedUrl);
	});

	it('should link to My Files for folders in My Files', async () => {
		await init('/private');
		const testFolder = new FolderVO({
			pathAsArchiveNbr: ['test1', 'test2', 'test3'],
			pathAsText: ['My Files', 'Test Folder Parent', 'Test Folder'],
			pathAsFolder_linkId: [1, 2, 3],
		});
		TestBed.inject(DataService).setCurrentFolder(testFolder);

		expect(component.breadcrumbs[0].routerPath).toEqual('/private');
		expect(component.breadcrumbs[1].routerPath).toContain('/private');
	});

	it('should link to Apps for folders in Apps', async () => {
		await init('/apps');
		const testFolder = new FolderVO({
			pathAsArchiveNbr: ['test1', 'test2', 'test3'],
			pathAsText: ['Apps', 'Facebook', 'Everything'],
			pathAsFolder_linkId: [1, 2, 3],
		});
		TestBed.inject(DataService).setCurrentFolder(testFolder);

		expect(component.breadcrumbs[0].routerPath).toEqual('/apps');
		expect(component.breadcrumbs[1].routerPath).toContain('/apps');
	});

	it('should link to Shares for folders in Shares', async () => {
		await init('/shares');
		const testFolder = new FolderVO({
			pathAsArchiveNbr: ['test1', 'test2', 'test3'],
			pathAsText: ['Shares', 'Archive Name', 'Shared Folder'],
			pathAsFolder_linkId: [1, 2, 3],
		});
		TestBed.inject(DataService).setCurrentFolder(testFolder);

		expect(component.breadcrumbs[0].routerPath).toEqual('/shares');
		expect(component.breadcrumbs[0].text).toEqual('Shares');
		expect(component.breadcrumbs[1].routerPath).toContain('/shares/test2');
	});
});
