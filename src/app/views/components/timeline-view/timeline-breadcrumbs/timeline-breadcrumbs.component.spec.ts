import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import { TimelineBreadcrumbsComponent } from './timeline-breadcrumbs.component';

describe('TimelineBreadcrumbsComponent', () => {
	let component: TimelineBreadcrumbsComponent;
	let fixture: ComponentFixture<TimelineBreadcrumbsComponent>;
	let dataService: DataService;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(TimelineBreadcrumbsComponent);
		config.providers.push(DataService);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(TimelineBreadcrumbsComponent);
		component = fixture.componentInstance;
		dataService = TestBed.inject(DataService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should build a crumb per path entry from a converted folder', () => {
		dataService.currentFolder = new FolderVO({
			pathAsText: ['My Files', 'Photos'],
			pathAsArchiveNbr: ['0001-0000', '0002-0000'],
			pathAsFolder_linkId: [11, 22],
		});

		component.setFolderBreadcrumbs();

		expect(component.breadcrumbs.length).toBe(2);
		expect(component.breadcrumbs[0]).toEqual(
			jasmine.objectContaining({
				type: 'folder',
				text: 'My Files',
				archiveNbr: '0001-0000',
				folder_linkId: 11,
			}),
		);

		expect(component.breadcrumbs[1]).toEqual(
			jasmine.objectContaining({
				text: 'Photos',
				archiveNbr: '0002-0000',
				folder_linkId: 22,
			}),
		);
	});

	it('should build no crumbs without a current folder', () => {
		dataService.currentFolder = undefined;

		component.setFolderBreadcrumbs();

		expect(component.breadcrumbs).toEqual([]);
	});
});
