/* @format */
import {
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';
import { SharedModule } from '@shared/shared.module';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import * as Testing from '@root/test/testbedConfig';
import { CreateAccountDialogComponent } from './create-account-dialog.component';

class MockDialogRef {
	close() {}
}

describe('CreateAccountDialogComponent', () => {
	let component: CreateAccountDialogComponent;
	let fixture: ComponentFixture<CreateAccountDialogComponent>;
	let dialogData: { sharerName: string };
	let dialogRefSpy: jasmine.SpyObj<DialogRef<CreateAccountDialogComponent>>;

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

		dialogData = {
			sharerName: 'John Rando',
		};

		config.imports.push(SharedModule);
		config.imports.push(
			RouterTestingModule.withRoutes([
				{ path: 'app/signup', redirectTo: '' },
				{ path: 'app/login', redirectTo: '' },
			]),
		);
		config.declarations.push(CreateAccountDialogComponent);
		config.providers.push({
			provide: DIALOG_DATA,
			useValue: {
				sharerName: 'John Rando',
			},
		});

		dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

		config.providers.push({
			provide: DialogRef,
			useValue: dialogRefSpy,
		});
		await TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(CreateAccountDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should should take sharerName from the dialog data', () => {
		expect(component.sharerName).toEqual('John Rando');
	});

	it('should close when close method is called', () => {
		component.close();

		expect(dialogRefSpy.close).toHaveBeenCalled();
	});

	it('should call the close method when signup link is clicked', async () => {
		const button = findLink(fixture, 'a.btn.btn-primary');

		expectLinkClosesDialog(button, '/app/signup', dialogRefSpy.close);
	});

	it('should call the close method when login link is clicked', () => {
		const link = findLink(fixture, '.login');

		expectLinkClosesDialog(link, '/app/login', dialogRefSpy.close);
	});

	function findLink(
		fixture: ComponentFixture<CreateAccountDialogComponent>,
		selector: string,
	) {
		const element: HTMLElement = fixture.nativeElement;
		const button = element.querySelector(selector) as HTMLAnchorElement;

		expect(button).toBeTruthy();
		return button;
	}

	function expectLinkClosesDialog(
		link: HTMLAnchorElement,
		expectedPath: string,
		dialogRefSpy: jasmine.Spy<jasmine.Func>,
	) {
		expect(link.href).toContain(expectedPath);
		link.click();

		expect(dialogRefSpy).toHaveBeenCalled();
	}
});
