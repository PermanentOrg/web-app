/* @format */
import { ApiService } from '@shared/services/api/api.service';
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { LegacyContact } from '@models/directive';
import { DirectiveModule } from '../../directive.module';
import { MockAccountService } from '../directive-display/test-utils';
import { MockMessageService } from '../directive-edit/test-utils';
import { LegacyContactDisplayComponent } from './legacy-contact-display.component';
import { MockApiService, MockDirectiveRepo } from './test-utils';

describe('LegacyContactDisplayComponent', () => {
  let shallow: Shallow<LegacyContactDisplayComponent>;

  beforeEach(() => {
    shallow = new Shallow(LegacyContactDisplayComponent, DirectiveModule)
      .provideMock({
        provide: ApiService,
        useClass: MockApiService,
      })
      .provideMock({
        provide: AccountService,
        useClass: MockAccountService,
      })
      .provideMock({
        provide: MessageService,
        useClass: MockMessageService,
      });
    MockDirectiveRepo.reset();
    MockMessageService.reset();
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should list legacy contact information', async () => {
    MockDirectiveRepo.legacyContactName = 'Test User';
    MockDirectiveRepo.legacyContactEmail = 'test@example.com';
    const { find } = await shallow.render();

    expect(find('.legacy-contact-name').length).toBe(1);
    expect(find('.legacy-contact-name')[0].nativeElement.innerText).toContain(
      'Test User',
    );

    expect(find('.legacy-contact-email').length).toBe(1);
    expect(find('.legacy-contact-email')[0].nativeElement.innerText).toContain(
      'test@example.com',
    );

    expect(find('.not-assigned').length).toBe(0);
  });

  it('should show "not assigned" if no legacy contact', async () => {
    const { find } = await shallow.render();

    expect(find('.legacy-contact-name')[0].nativeElement.innerText).toContain(
      'not assigned',
    );

    expect(find('.legacy-contact-email')[0].nativeElement.innerText).toContain(
      'not assigned',
    );

    expect(find('.not-assigned').length).toBe(2);
  });

  it('should show an error message if there was an error fetching legacy contact', async () => {
    MockDirectiveRepo.throwError = true;
    const { find } = await shallow.render();

    expect(find('.legacy-contact-name').length).toBe(0);
    expect(find('.legacy-contact-email').length).toBe(0);
    expect(find('.error').length).toBe(1);
  });

  it('should emit an event when the edit button is pressed', async () => {
    const { find, fixture, outputs } = await shallow.render();
    find('button').nativeElement.dispatchEvent(new Event('click'));

    expect(outputs.beginEdit.emit).toHaveBeenCalled();
  });

  it('should emit an event when the legacy contact is fetched', async () => {
    const { fixture, outputs } = await shallow.render();
    await fixture.whenStable();

    expect(outputs.loadedLegacyContact.emit).toHaveBeenCalled();
  });
});
