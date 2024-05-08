import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shallow } from 'shallow-render';
import { Subject } from 'rxjs';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { archiveDescriptions } from '../types/archive-types';
import { GlamArchiveTypeSelectComponent } from './archive-type-select.component';

describe('ArchiveTypeSelectComponent', () => {
  let shallow: Shallow<GlamArchiveTypeSelectComponent>;
  let dialogRef: Subject<OnboardingTypes | undefined>;

  function expectCommunityDisplayed(find) {
    expect(find('.type-name').nativeElement.innerText).toContain('Community');
    expect(find('.type-description').nativeElement.innerText).toContain(
      archiveDescriptions['type:community']
    );
  }

  beforeEach(() => {
    if (dialogRef) {
      dialogRef.complete();
    }
    dialogRef = new Subject<OnboardingTypes | undefined>();
    shallow = new Shallow(GlamArchiveTypeSelectComponent)
      .provide({
        provide: DialogCdkService,
        useValue: {
          open() {
            return {
              closed: dialogRef,
            };
          },
        },
      })
      .dontMock(DialogCdkService);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should open a selection dialog on click', async () => {
    const { instance, inject } = await shallow.render();
    const dialogService = inject(DialogCdkService);
    const open = spyOn(dialogService, 'open').and.callThrough();
    instance.onClick();

    expect(open).toHaveBeenCalled();
  });

  it('should change displayed archive type when the dialog returns with a type', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.onClick();
    dialogRef.next(OnboardingTypes.community);
    fixture.detectChanges();

    expectCommunityDisplayed(find);
  });

  it('can change type multiple times', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.onClick();
    dialogRef.next(OnboardingTypes.famhist);
    instance.onClick();
    dialogRef.next(OnboardingTypes.community);
    fixture.detectChanges();

    expectCommunityDisplayed(find);
  });

  it('should not change the displayed archive type if the dialog is closed without any selection', async () => {
    const { find, fixture, instance } = await shallow.render();
    instance.onClick();
    dialogRef.next(OnboardingTypes.community);
    instance.onClick();
    dialogRef.next(undefined);

    fixture.detectChanges();

    expectCommunityDisplayed(find);
  });

  it('handles an invalid onboardingtype', async () => {
    const { find, fixture, instance } = await shallow.render();
    instance.onClick();
    dialogRef.next(OnboardingTypes.community);
    instance.onClick();
    dialogRef.next('not-valid-type' as OnboardingTypes);

    fixture.detectChanges();

    expectCommunityDisplayed(find);
  });

  it('emits the selected archive type', async () => {
    const { outputs, instance } = await shallow.render();
    instance.onClick();
    dialogRef.next(OnboardingTypes.famhist);

    expect(outputs.typeSelected.emit).toHaveBeenCalledWith(
      OnboardingTypes.famhist
    );
  });
});
