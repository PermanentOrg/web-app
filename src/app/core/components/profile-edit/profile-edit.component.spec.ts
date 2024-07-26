/* @format */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { EventService } from '@shared/services/event/event.service';
import { CookieService } from 'ngx-cookie-service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ProfileEditComponent } from './profile-edit.component';

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;

  const mockDialogRef = { close: jasmine.createSpy('close') };
  const mockDialogService = jasmine.createSpyObj('DialogCdkService', ['open']);
  mockDialogService.open.and.returnValue(mockDialogRef);

  const mockCookieService = jasmine.createSpyObj('CookieService', ['check']);
  mockCookieService.check.and.returnValue(false);

  const mockProfileService = jasmine.createSpyObj('ProfileService', [
    'calculateProfileProgress',
    'getProfileItemDictionary',
    'fetchProfileItems',
    'checkProfilePublic',
  ]);
  mockProfileService.calculateProfileProgress.and.returnValue(0);
  mockProfileService.getProfileItemDictionary.and.returnValue({});
  mockProfileService.fetchProfileItems.and.returnValue(Promise.resolve());
  mockProfileService.checkProfilePublic.and.returnValue(true);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileEditComponent],
      providers: [
        { provide: DialogCdkService, useValue: mockDialogService },
        { provide: AccountService, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: MessageService, useValue: {} },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: FolderPickerService, useValue: {} },
        { provide: PromptService, useValue: {} },
        {
          provide: EventService,
          useValue: {
            dispatch: () => {},
          },
        },
        { provide: CookieService, useValue: mockCookieService },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open ProfileEditFirstTimeDialogComponent when showFirstTimeDialog is called', () => {
    component.totalProgress = 0; // Ensure the condition to open the dialog is met
    mockCookieService.check.and.returnValue(false);

    component.showFirstTimeDialog();

    expect(mockDialogService.open).toHaveBeenCalledWith(jasmine.any(Function), {
      width: '760px',
      height: 'auto',
    });
  });

  it('should open LocationPickerComponent when chooseLocationForItem is called', async () => {
    const item = {} as any;
    await component.chooseLocationForItem(item);

    expect(mockDialogService.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { profileItem: item },
      height: 'auto',
      width: '600px',
    });
  });
});
