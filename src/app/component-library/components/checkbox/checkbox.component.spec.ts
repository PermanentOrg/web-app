/* @format */
import { Shallow } from 'shallow-render';
import { ComponentsModule } from '../../components.module';
import { CheckboxComponent } from './checkbox.component';

describe('ToggleComponent', () => {
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

    expect(instance.isCheckedChange.emit).toHaveBeenCalledWith('value');
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
});
