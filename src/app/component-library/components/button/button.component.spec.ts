import { Shallow } from 'shallow-render';
import { ComponentsModule } from '../../components.module';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
	let shallow: Shallow<ButtonComponent>;

	beforeEach(async () => {
		shallow = new Shallow(ButtonComponent, ComponentsModule);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should have the correct class based on variant', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		expect(button.nativeElement.classList).toContain('button-primary');

		instance.variant = 'secondary';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-secondary');

		instance.variant = 'tertiary';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-tertiary');
	});

	it('should have the correct class based on size', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		expect(button.nativeElement.classList).toContain('button-hug');

		instance.size = 'fill';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-fill');
	});

	it('should disable the button', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		instance.disabled = true;
		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTrue();
	});

	it('should emit the @Output when clicking the button', async () => {
		const { instance, find } = await shallow.render();
		const button = find('.button').nativeElement;

		button.click();

		expect(instance.buttonClick.emit).toHaveBeenCalled();
	});

	it('should have the correct class based on mode', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		expect(button.nativeElement.classList).toContain('button-light');

		instance.mode = 'dark';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-dark');
	});

	it('should have the correct class based on orientation', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		instance.orientation = 'right';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-reverse');
	});

	it('should have the correct class based on height', async () => {
		const { instance, fixture, find } = await shallow.render();
		const button = find('.button');

		expect(button.nativeElement.classList).toContain('button-medium');

		instance.height = 'large';
		fixture.detectChanges();

		expect(button.nativeElement.classList).toContain('button-large');
	});

	it('should have the correct type based on the type input', async () => {
		const { instance, fixture, find } = await shallow.render();

		const button = find('.button');

		expect(button.nativeElement.type).toEqual('button');

		instance.buttonType = 'submit';
		fixture.detectChanges();

		expect(button.nativeElement.type).toEqual('submit');

		instance.buttonType = 'reset';
		fixture.detectChanges();

		expect(button.nativeElement.type).toEqual('reset');
	});
});
