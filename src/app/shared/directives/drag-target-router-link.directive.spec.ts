import { ElementRef } from '@angular/core';
import { FolderVO, FolderType } from '@models/index';
import { DataService } from '@shared/services/data/data.service';
import { DragTargetRouterLinkDirective } from './drag-target-router-link.directive';

describe('DragTargetRouterLinkDirective', () => {
	function buildDirective(
		routerLink: string,
		currentFolderType: FolderType,
	): DragTargetRouterLinkDirective {
		const dataService = {
			currentFolder: new FolderVO({ type: currentFolderType }),
		} as DataService;
		const directive = new DragTargetRouterLinkDirective(
			new ElementRef(document.createElement('a')),
			null,
			dataService,
		);
		directive.routerLink = [routerLink];
		return directive;
	}

	(['type.folder.root.private', 'private-root'] as FolderType[]).forEach(
		(privateRootType) => {
			it(`should not offer the My Files link as a drop target from inside My Files (${privateRootType})`, () => {
				expect(
					buildDirective('/private', privateRootType).checkCurrentFolder(),
				).toBeFalse();
			});
		},
	);

	(['type.folder.root.public', 'public-root'] as FolderType[]).forEach(
		(publicRootType) => {
			it(`should not offer the Public link as a drop target from inside Public (${publicRootType})`, () => {
				expect(
					buildDirective('/public', publicRootType).checkCurrentFolder(),
				).toBeFalse();
			});
		},
	);

	it('should offer the My Files link as a drop target from a folder inside My Files', () => {
		expect(
			buildDirective('/private', 'private').checkCurrentFolder(),
		).toBeTrue();
	});
});
