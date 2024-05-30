/* @format */
import { Shallow } from 'shallow-render';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { OnboardingModule } from '../../onboarding.module';
import { NameArchiveScreenComponent } from './name-archive-screen.component';

describe('NameArchiveScreenComponent', () => {
  let shallow: Shallow<NameArchiveScreenComponent>;

  beforeEach(async () => {
    shallow = new Shallow(NameArchiveScreenComponent, OnboardingModule).import(
      ReactiveFormsModule
    );
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize with default values', async () => {
    const { instance } = await shallow.render();

    expect(instance.nameForm).toBeTruthy();
    expect(instance.nameForm.controls['name'].value).toBe('');
  });

  it('should patch the form value with input name on init', async () => {
    const { instance } = await shallow.render({
      bind: { name: 'Test Archive' },
    });
    instance.ngOnInit();

    expect(instance.nameForm.controls['name'].value).toBe('Test Archive');
  });

  it('should emit backToCreate event when backToCreate is called', async () => {
    const { instance, outputs } = await shallow.render();
    instance.backToCreate();

    expect(outputs.backToCreateEmitter.emit).toHaveBeenCalledWith('create');
  });

  it('should emit archiveCreated event with form value when createArchive is called and form is valid', async () => {
    const { instance, outputs } = await shallow.render();
    instance.nameForm.controls['name'].setValue('Valid Archive Name');
    instance.createArchive();

    expect(outputs.archiveCreatedEmitter.emit).toHaveBeenCalledWith(
      'Valid Archive Name'
    );
  });

  it('should not emit archiveCreated event when createArchive is called and form is invalid', async () => {
    const { instance, outputs } = await shallow.render();
    instance.nameForm.controls['name'].setValue('');
    instance.createArchive();

    expect(outputs.archiveCreatedEmitter.emit).not.toHaveBeenCalled();
  });

  it('should call backToCreate when Back button is clicked', async () => {
    const { fixture, instance } = await shallow.render();
    spyOn(instance, 'backToCreate');
    const backButton = fixture.debugElement.query(By.css('.back-button'));
    backButton.triggerEventHandler('buttonClick', null);

    expect(instance.backToCreate).toHaveBeenCalled();
  });

  it('should call createArchive when create archive button is clicked', async () => {
    const { fixture, instance } = await shallow.render();
    spyOn(instance, 'createArchive');
    instance.nameForm.controls['name'].setValue('Valid Archive Name');
    fixture.detectChanges();

    const createButton = fixture.debugElement.query(
      By.css('.create-archive-button')
    );
    createButton.triggerEventHandler('buttonClick', null);

    expect(instance.createArchive).toHaveBeenCalled();
  });

  it('should call createArchive when create archive button is clicked and form is valid', async () => {
    const { fixture, instance } = await shallow.render();
    instance.nameForm.controls['name'].setValue('Valid Archive Name');
    fixture.detectChanges();

    spyOn(instance, 'createArchive');

    const createButton = fixture.debugElement.query(
      By.css('.create-archive-button')
    );

    createButton.triggerEventHandler('buttonClick', null);

    expect(instance.createArchive).toHaveBeenCalled();
  });
});
