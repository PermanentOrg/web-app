/* @format */
import { Shallow } from 'shallow-render';
import { ComponentsModule } from '../../components.module';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxCompoent', () => {
  let shallow: Shallow<CheckboxComponent>;

  beforeEach(async () => {
    shallow = new Shallow(CheckboxComponent, ComponentsModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should have the disabled class if the checkbox is disabled', async () => {
    const { instance, find, fixture } = await shallow.render();
    instance.disabled = true;
    fixture.detectChanges();
    const checkbox = find('.checkbox-container').nativeElement;

    expect(checkbox.classList).toContain('checkbox-container-disabled');
    expect(checkbox.classList).not.toContain('checkbox-container-enabled');
  });

  it('should have the enabled class if the checkbox is enabled', async () => {
    const { find } = await shallow.render();
    const checkbox = find('.checkbox-container').nativeElement;

    expect(checkbox.classList).toContain('checkbox-container-enabled');
    expect(checkbox.classList).not.toContain('checkbox-container-disabled');
  });

  it('should have the checked class if the checkbox is checked', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.isChecked = true;
    fixture.detectChanges();
    const checkbox = find('.checkbox').nativeElement;

    expect(checkbox.classList).toContain('checked');
  });

  it('should emit the correct value when the checkbox is clicked', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.value = 'value';
    fixture.detectChanges();
    const checkbox = find('.checkbox-container').nativeElement;

    checkbox.click();

<<<<<<< HEAD
<<<<<<< HEAD
    expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(true);
=======
    expect(instance.isCheckedChange.emit).toHaveBeenCalledWith('value');
>>>>>>> ef230f5b (PER-9488-glam-checkbox)
=======
    expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(true);
>>>>>>> 67b7e169 (PER-9491-new-sign-in)
  });

  it("should not emit any value when the checkbox is clicked and it's disabled ", async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.disabled = true;
    instance.value = 'value';
    fixture.detectChanges();
    const checkbox = find('.checkbox-container').nativeElement;

    checkbox.click();

    expect(instance.isCheckedChange.emit).not.toHaveBeenCalled();
  });

  it('should have the primary class if the variant is set to primary', async () => {
    const { instance, find, fixture } = await shallow.render();
    instance.variant = 'primary';
    fixture.detectChanges();
    const checkbox = find('.checkbox-container').nativeElement;

    expect(checkbox.classList).toContain('checkbox-container-primary');
  });

  it('should have the secondary class if the variant is set to secondary', async () => {
    const { instance, find, fixture } = await shallow.render();
    instance.variant = 'secondary';
    fixture.detectChanges();
    const checkbox = find('.checkbox-container').nativeElement;

    expect(checkbox.classList).toContain('checkbox-container-secondary');
  });
<<<<<<< HEAD

  it('should be focusable and have correct ARIA attributes', async () => {
    const { find } = await shallow.render();
<<<<<<< HEAD
    const checkboxContainer = find('.checkbox').nativeElement;
=======
    const checkboxContainer = find('.checkbox-container').nativeElement;
>>>>>>> 127dd02e (PER-9491 new sign in)

    expect(checkboxContainer.getAttribute('role')).toEqual('checkbox');
    expect(checkboxContainer.getAttribute('tabindex')).toEqual('0');
    expect(checkboxContainer.getAttribute('aria-checked')).toEqual('false');
    expect(checkboxContainer.getAttribute('aria-disabled')).toEqual('false');
  });

  it('should toggle checked state on Enter key press', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.isChecked = false;
    fixture.detectChanges();

    const checkboxContainer = find('.checkbox-container').nativeElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    checkboxContainer.dispatchEvent(event);

    expect(instance.isChecked).toBeTruthy();
  });

  it('should toggle checked state on Space key press', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.isChecked = false;
    fixture.detectChanges();

    const checkboxContainer = find('.checkbox-container').nativeElement;
    const event = new KeyboardEvent('keydown', { key: ' ' });
    checkboxContainer.dispatchEvent(event);

    expect(instance.isChecked).toBeTruthy();
  });

  it('should not toggle checked state when disabled and Enter key is pressed', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.disabled = true;
    fixture.detectChanges();

    const checkboxContainer = find('.checkbox-container').nativeElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    checkboxContainer.dispatchEvent(event);

    // Since the component is disabled, the isChecked state should not change
    expect(instance.isChecked).toBeFalsy();
  });

  it("should have aria-disabled set to 'true' when disabled", async () => {
    const { find, instance, fixture } = await shallow.render({
      bind: { disabled: true },
    });
    fixture.detectChanges();
<<<<<<< HEAD
    const checkboxContainer = find('.checkbox').nativeElement;
=======
    const checkboxContainer = find('.checkbox-container').nativeElement;
>>>>>>> 127dd02e (PER-9491 new sign in)

    expect(checkboxContainer.getAttribute('aria-disabled')).toEqual('true');
  });
=======
>>>>>>> ef230f5b (PER-9488-glam-checkbox)
});
