import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { ComponentsModule } from '../../components.module';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
	let fixture: ComponentFixture<ButtonComponent>;
	let instance: ButtonComponent;

	beforeEach(async () => {
		await MockBuilder(ButtonComponent, ComponentsModule);

		fixture = TestBed.createComponent(ButtonComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});

	it('should have the correct class based on variant', () => {
		const button = ngMocks.find('.button');

		expect(button.nativeElement.classList).toContain('button-primary');

		instance.variant = 'secondary';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-secondary');

		instance.variant = 'tertiary';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-tertiary');
	});

	it('should have the correct class based on size', () => {
		const button = ngMocks.find('.button');

		expect(button.nativeElement.classList).toContain('button-hug');

		instance.size = 'fill';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-fill');
	});

	it('should disable the button', () => {
		const button = ngMocks.find('.button');

		instance.disabled = true;
		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTrue();
	});

	it('should emit the @Output when clicking the button', () => {
		spyOn(instance.buttonClick, 'emit');
		const button = ngMocks.find('.button').nativeElement;

		button.click();

		expect(instance.buttonClick.emit).toHaveBeenCalled();
	});

	it('should have the correct class based on mode', () => {
		const button = ngMocks.find('.button');

		expect(button.nativeElement.classList).toContain('button-light');

		instance.mode = 'dark';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-dark');
	});

	it('should have the correct class based on orientation', () => {
		const button = ngMocks.find('.button');

		instance.orientation = 'right';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-reverse');
	});

	it('should have the correct class based on height', () => {
		const button = ngMocks.find('.button');

		expect(button.nativeElement.classList).toContain('button-medium');

		instance.height = 'large';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-large');
	});

	it('should have the correct type based on the type input', () => {
		const button = ngMocks.find('.button');

		expect(button.nativeElement.type).toEqual('button');

		instance.buttonType = 'submit';
		fixture.detectChanges();

		expect(button.nativeElement.type).toEqual('submit');

		instance.buttonType = 'reset';
		fixture.detectChanges();

		expect(button.nativeElement.type).toEqual('reset');
	});
});
