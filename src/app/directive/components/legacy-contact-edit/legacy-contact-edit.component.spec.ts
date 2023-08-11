/* @format */
import { Type, DebugElement } from '@angular/core';
import { Shallow } from 'shallow-render';
import { QueryMatch } from 'shallow-render/dist/lib/models/query-match';
import { LegacyContact } from '@models/directive';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DirectiveModule } from '../../directive.module';
import { MockDirectiveRepo } from '../legacy-contact-display/test-utils';
import { MockMessageService } from '../directive-edit/test-utils';
import { LegacyContactEditComponent } from './legacy-contact-edit.component';

type Find = (
  cssOrDirective: string | Type<any>,
  options?: {
    query?: string;
  }
) => QueryMatch<DebugElement>;

class MockApiService {
  public directive = new MockDirectiveRepo();
}

describe('LegacyContactEditComponent', () => {
  let shallow: Shallow<LegacyContactEditComponent>;

  const fillOutForm = (find: Find, email: string, name: string) => {
    const emailInput = find('.legacy-contact-email')[0]
      .nativeElement as HTMLInputElement;
    const nameInput = find('.legacy-contact-name')[0]
      .nativeElement as HTMLTextAreaElement;

    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    shallow = new Shallow(
      LegacyContactEditComponent,
      DirectiveModule
    ).provideMock(
      {
        provide: ApiService,
        useClass: MockApiService,
      },
      {
        provide: MessageService,
        useClass: MockMessageService,
      }
    );
    MockDirectiveRepo.reset();
  });

  it('should create', async () => {
    const { instance } = await shallow.render();
    expect(instance).toBeTruthy();
  });

  it('should be able to fill out legacy contact form', async () => {
    const { instance, find } = await shallow.render();
    expect(find('.legacy-contact-name').length).toBe(1);
    expect(find('.legacy-contact-email').length).toBe(1);

    fillOutForm(find, 'test@example.com', 'Unit Testing');

    expect(instance.name).toBe('Unit Testing');
    expect(instance.email).toBe('test@example.com');
  });

  it('should be able to save a legacy contact', async () => {
    const { instance, find, fixture } = await shallow.render();

    fillOutForm(find, 'save@example.com', 'Save Test');

    expect(find('.save-btn').length).toBe(1);
    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(find('*[disabled]').length).toBe(3);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(find('*[disabled]').length).toBe(0);

    expect(MockDirectiveRepo.savedLegacyContact.email).toBe('save@example.com');
    expect(MockDirectiveRepo.savedLegacyContact.name).toBe('Save Test');
    expect(MockDirectiveRepo.createdLegacyContact).toBeTrue();
  });

  it('should be able to have existing legacy contact data passed in', async () => {
    const legacyContact: LegacyContact = {
      name: 'Existing Contact',
      email: 'existing@example.com',
    };
    const { instance } = await shallow.render({
      bind: {
        legacyContact,
      },
    });

    expect(instance.email).toBe('existing@example.com');
    expect(instance.name).toBe('Existing Contact');
  });

  it('should make an update call if the legacy contact already exists', async () => {
    const legacyContact: LegacyContact = {
      name: 'Existing Contact',
      email: 'existing@example.com',
    };
    const { instance, find, fixture } = await shallow.render({
      bind: {
        legacyContact,
      },
    });

    fillOutForm(find, 'existing@example.com', 'Existing Updated Contact');

    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(MockDirectiveRepo.savedLegacyContact.name).toBe(
      'Existing Updated Contact'
    );
    expect(MockDirectiveRepo.createdLegacyContact).toBeFalse();
    expect(MockDirectiveRepo.updatedLegacyContact).toBeTrue();
  });

  it('should handle API errors on creation', async () => {
    MockDirectiveRepo.throwError = true;
    const { instance, find, fixture } = await shallow.render();

    fillOutForm(find, 'error@example.com', 'Throw Error');

    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(MockMessageService.errorShown).toBeTrue();
    expect(MockDirectiveRepo.savedLegacyContact).toBeUndefined();
  });

  it('should handle API errors on editing', async () => {
    MockDirectiveRepo.throwError = true;
    const legacyContact: LegacyContact = {
      name: 'Test',
      email: 'test@example.com',
    };
    const { instance, find, fixture } = await shallow.render({
      bind: {
        legacyContact,
      },
    });

    fillOutForm(find, 'error@example.com', 'Throw Error');

    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(MockMessageService.errorShown).toBeTrue();
    expect(MockDirectiveRepo.savedLegacyContact).toBeUndefined();
  });

  it('should emit an output after saving (creation)', async () => {
    const { instance, find, fixture, outputs } = await shallow.render();

    fillOutForm(find, 'output@example.com', 'Test Output');

    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(outputs.savedLegacyContact.emit).toHaveBeenCalled();
  });

  it('should emit an output after saving (update)', async () => {
    const { instance, find, fixture, outputs } = await shallow.render({
      bind: {
        legacyContact: {
          name: 'Test Output',
          email: 'output@example.com',
        },
      },
    });

    fillOutForm(find, 'output@example.com', 'Test Update Output');

    find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(outputs.savedLegacyContact.emit).toHaveBeenCalled();
  });

  it('should not allow the form to submit until all fields are filled out', async () => {
    const { find, fixture } = await shallow.render();

    expect(find('.save-btn[disabled]').length).toBe(1);

    fillOutForm(find, '', 'Test No Submit');
    fixture.detectChanges();
    expect(find('.save-btn[disabled]').length).toBe(1);

    fillOutForm(find, 'no-submit@example.com', '');
    fixture.detectChanges();
    expect(find('.save-btn[disabled]').length).toBe(1);

    fillOutForm(find, 'submit@example.com', 'Submit Now Works');
    fixture.detectChanges();
    expect(find('.save-btn[disabled]').length).toBe(0);
  });
});
