/* @format */
import { Shallow } from 'shallow-render';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
	let shallow: Shallow<ToggleComponent>;

	beforeEach(async () => {
		shallow = new Shallow(ToggleComponent, Shallow);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should have the checked class when the toggle is checked', async () => {
		const { instance, find, fixture } = await shallow.render();
		instance.isChecked = true;
		fixture.detectChanges();
		const toggle = find('.toggle-container').nativeElement;

		expect(toggle.classList).toContain('checked');
	});

	it('should have the disabled class when the toggle is disabled', async () => {
		const { instance, find, fixture } = await shallow.render();
		instance.disabled = true;
		fixture.detectChanges();
		const toggle = find('.toggle-container').nativeElement;

		expect(toggle.classList).toContain('disabled');
	});

	it('should emit the correct value when the toggle is clicked', async () => {
		const { instance, find, fixture } = await shallow.render();
		fixture.detectChanges();
		const toggle = find('.toggle-container').nativeElement;
		toggle.click();

		expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(true);

		instance.isChecked = true;
		fixture.detectChanges();
		toggle.click();

		expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(false);
	});

	it('should not emit when the toggle is disabled', async () => {
		const { instance, find, fixture } = await shallow.render();
		instance.disabled = true;
		fixture.detectChanges();
		const toggle = find('.toggle-container').nativeElement;
		toggle.click();

		expect(instance.isCheckedChange.emit).not.toHaveBeenCalled();
	});
});
