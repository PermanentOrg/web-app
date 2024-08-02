/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../../onboarding.module';
import { FinalizeArchiveCreationScreenComponent } from './finalize-archive-creation-screen.component';

describe('FinalizeArchiveCreationScreenComponent', () => {
  let shallow: Shallow<FinalizeArchiveCreationScreenComponent>;

  beforeEach(async () => {
    shallow = new Shallow(
      FinalizeArchiveCreationScreenComponent,
      OnboardingModule,
    );
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should display the archive name correctly', async () => {
    const name = 'Test Archive';
    const { fixture, find } = await shallow.render({ bind: { name } });
    const archiveNameElement = find('.archive-info p');

    expect(archiveNameElement.nativeElement.textContent).toContain(
      `The ${name} Archive`,
    );
  });

  it('should emit finalizeArchiveOutput when finalizeArchive is called', async () => {
    const { instance, outputs } = await shallow.render();
    instance.finalizeArchive();

    expect(outputs.finalizeArchiveOutput.emit).toHaveBeenCalled();
  });

  it('should call finalizeArchive when the Done button is clicked', async () => {
    const { instance, fixture, find } = await shallow.render();
    const doneButton = find('pr-button');
    spyOn(instance, 'finalizeArchive');
    doneButton.triggerEventHandler('buttonClick', null);

    expect(instance.finalizeArchive).toHaveBeenCalled();
  });
});
