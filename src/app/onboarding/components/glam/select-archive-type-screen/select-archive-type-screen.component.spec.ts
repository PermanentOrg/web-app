/* @format */
import { Shallow } from 'shallow-render';
import { By } from '@angular/platform-browser';
import { OnboardingModule } from '../../../onboarding.module';
import { SelectArchiveTypeScreenComponent } from './select-archive-type-screen.component';

describe('SelectArchiveTypeScreenComponent', () => {
  let shallow: Shallow<SelectArchiveTypeScreenComponent>;

  beforeEach(async () => {
    shallow = new Shallow(SelectArchiveTypeScreenComponent, OnboardingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize with default values', async () => {
    const { instance } = await shallow.render();

    expect(instance.selectedValue).toBe('');
    expect(instance.buttonText).toBe('a Personal');
    expect(instance['headerText']).toBe('');
    expect(instance['tag']).toBe('');
    expect(instance['type']).toBe('');
  });

  it('should emit navigation event when navigate is called with start', async () => {
    const { instance, outputs } = await shallow.render();
    instance.navigate('start');

    expect(outputs.submitEmitter.emit).toHaveBeenCalledWith('start');
  });

  it('should emit submit event when navigate is called with other screen', async () => {
    const { instance, outputs } = await shallow.render();
    instance['type'] = 'mockType';
    instance['tag'] = 'mockTag';
    instance['headerText'] = 'mockHeaderText';

    instance.navigate('name-archive');

    expect(outputs.submitEmitter.emit).toHaveBeenCalledWith({
      screen: 'name-archive',
      type: 'mockType',
      tag: 'mockTag',
      headerText: 'mockHeaderText',
    });
  });

  it('should call navigate with start when Back button is clicked', async () => {
    const { fixture, instance } = await shallow.render();
    spyOn(instance, 'navigate');
    const backButton = fixture.debugElement.query(By.css('.back-button'));
    backButton.triggerEventHandler('buttonClick', null);

    expect(instance.navigate).toHaveBeenCalledWith('start');
  });

  it('should call navigate with name-archive when create archive button is clicked', async () => {
    const { fixture, instance } = await shallow.render();
    spyOn(instance, 'navigate');
    instance.selectedValue = 'someValue';
    fixture.detectChanges();

    const createButton = fixture.debugElement.query(
      By.css('.create-archive-button'),
    );
    createButton.triggerEventHandler('buttonClick', null);

    expect(instance.navigate).toHaveBeenCalledWith('name-archive');
  });
});
