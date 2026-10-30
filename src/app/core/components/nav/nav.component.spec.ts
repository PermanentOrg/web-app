import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { FolderVO, FolderType } from '@models/index';
import { RightMenuComponent } from '../right-menu/right-menu.component';

describe('NavComponent', () => {
	let component: NavComponent;
	let fixture: ComponentFixture<NavComponent>;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(NavComponent);
		config.declarations.push(LeftMenuComponent);
		config.declarations.push(RightMenuComponent);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(NavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show the new folder button outside the special folders', () => {
		expect(component.canShowNewFolderButton(undefined)).toBeTrue();
		expect(
			component.canShowNewFolderButton(new FolderVO({ type: 'private' })),
		).toBeTrue();
	});

	(
		[
			'type.folder.root.share',
			'share-root',
			'type.folder.root.app',
			'app-root',
		] as FolderType[]
	).forEach((hiddenFolderType) => {
		it(`should hide the new folder button in ${hiddenFolderType}`, () => {
			expect(
				component.canShowNewFolderButton(
					new FolderVO({ type: hiddenFolderType }),
				),
			).toBeFalse();
		});
	});
});
