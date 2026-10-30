import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BASE_TEST_CONFIG } from '@root/test/testbedConfig';
import { FolderVO } from '@models/index';
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

	it('should drop onto My Files through the My Files sidebar link', () => {
		const privateRoot = new FolderVO({ folderId: 1, type: 'private-root' });
		spyOn(accountService, 'getPrivateRoot').and.returnValue(privateRoot);

		expect(
			service.getDestinationFromDropTarget(buildSidebarLink('/private')),
		).toBe(privateRoot);
	});

	it('should drop onto Public through the Public sidebar link', () => {
		const publicRoot = new FolderVO({ folderId: 2, type: 'public-root' });
		spyOn(accountService, 'getPublicRoot').and.returnValue(publicRoot);

		expect(
			service.getDestinationFromDropTarget(buildSidebarLink('/public')),
		).toBe(publicRoot);
	});

	it('should have no destination for a sidebar link outside the workspaces', () => {
		expect(
			service.getDestinationFromDropTarget(buildSidebarLink('/apps')),
		).toBeUndefined();
	});
});
