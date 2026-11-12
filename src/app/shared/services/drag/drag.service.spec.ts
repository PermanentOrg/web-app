import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BASE_TEST_CONFIG } from '@root/test/testbedConfig';
import { FolderVO, FolderType } from '@models/index';
import { DragTargetRouterLinkDirective } from '@shared/directives/drag-target-router-link.directive';
import { AccountService } from '../account/account.service';
import { DataService } from '../data/data.service';
import { DragService } from './drag.service';

describe('DragService', () => {
	let service: DragService;
	let accountService: AccountService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [...BASE_TEST_CONFIG.imports],
			providers: [...BASE_TEST_CONFIG.providers, DragService],
		});
		service = TestBed.inject(DragService);
		accountService = TestBed.inject(AccountService);
	});

	function buildSidebarLink(routerLink: string): DragTargetRouterLinkDirective {
		const sidebarLink = new DragTargetRouterLinkDirective(
			new ElementRef(document.createElement('a')),
			null,
			TestBed.inject(DataService),
		);
		sidebarLink.routerLink = [routerLink];
		return sidebarLink;
	}

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	const rootCases: Array<{
		rootSource: string;
		archiveRootType: FolderType;
		privateRootType: FolderType;
		publicRootType: FolderType;
	}> = [
		{
			rootSource: 'Stela',
			archiveRootType: 'root',
			privateRootType: 'private-root',
			publicRootType: 'public-root',
		},
		{
			rootSource: 'v1',
			archiveRootType: 'type.folder.root.root',
			privateRootType: 'type.folder.root.private',
			publicRootType: 'type.folder.root.public',
		},
	];

	rootCases.forEach(
		({ rootSource, archiveRootType, privateRootType, publicRootType }) => {
			describe(`with a root loaded from ${rootSource}`, () => {
				const privateRoot = new FolderVO({
					folderId: 1,
					type: privateRootType,
				});
				const publicRoot = new FolderVO({
					folderId: 2,
					type: publicRootType,
				});

				beforeEach(() => {
					accountService.setRootFolder(
						new FolderVO({
							type: archiveRootType,
							ChildItemVOs: [privateRoot, publicRoot],
						}),
					);
				});

				afterEach(() => {
					accountService.clearRootFolder();
				});

				it('should drop onto My Files through the My Files sidebar link', () => {
					expect(
						service.getDestinationFromDropTarget(buildSidebarLink('/private')),
					).toBe(privateRoot);
				});

				it('should drop onto Public through the Public sidebar link', () => {
					expect(
						service.getDestinationFromDropTarget(buildSidebarLink('/public')),
					).toBe(publicRoot);
				});
			});
		},
	);

	it('should have no destination for a sidebar link outside the workspaces', () => {
		expect(
			service.getDestinationFromDropTarget(buildSidebarLink('/apps')),
		).toBeUndefined();
	});
});
