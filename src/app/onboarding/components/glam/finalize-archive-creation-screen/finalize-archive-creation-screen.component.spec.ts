/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { ArchiveVO } from '@models/index';
import { AccessRolePipe } from '@shared/pipes/access-role.pipe';
import { OnboardingModule } from '../../../onboarding.module';
import { FinalizeArchiveCreationScreenComponent } from './finalize-archive-creation-screen.component';

describe('FinalizeArchiveCreationScreenComponent', () => {
  let shallow: Shallow<FinalizeArchiveCreationScreenComponent>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    onboardingService = new OnboardingService();
    shallow = new Shallow(
      FinalizeArchiveCreationScreenComponent,
      OnboardingModule,
    )
      .provide({ provide: OnboardingService, useValue: onboardingService })
      .dontMock(OnboardingService)
      .dontMock(AccessRolePipe);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should display the archive name correctly', async () => {
    const name = 'John Doe';
    onboardingService.registerArchive(new ArchiveVO({ fullName: name }));
    const { fixture, find } = await shallow.render();
    const archiveNameElement = find('.archive-info p');

    expect(archiveNameElement.nativeElement.textContent).toContain(
      `The ${name} Archive`,
    );
  });

  it('it should display multiple archives with access roles correctly', async () => {
    onboardingService.registerArchive(
      new ArchiveVO({ fullName: 'Unit Test', accessRole: 'access.role.owner' }),
    );
    onboardingService.registerArchive(
      new ArchiveVO({
        fullName: 'Unit Test 2',
        accessRole: 'access.role.editor',
      }),
    );
    onboardingService.registerArchive(
      new ArchiveVO({
        fullName: 'Unit Test 3',
        accessRole: 'access.role.viewer',
      }),
    );

    const { find } = await shallow.render();
    const archiveNameElement = find('.archive-info .single-archive');

    expect(archiveNameElement.length).toBe(3);
    expect(archiveNameElement[0].nativeElement.textContent).toContain(
      'Unit Test Archive',
    );

    expect(archiveNameElement[0].nativeElement.textContent).toContain('Owner');
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

  it('should disable the done button when it is clicked', async () => {
    const { instance, fixture, find } = await shallow.render();
    const doneButton = find('pr-button');
    doneButton.triggerEventHandler('buttonClick', null);

    fixture.detectChanges();

    expect(instance.isArchiveSubmitted).toBe(true);
  });
});
