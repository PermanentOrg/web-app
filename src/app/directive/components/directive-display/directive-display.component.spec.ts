import { Shallow } from 'shallow-render';

import { DirectiveDisplayComponent } from './directive-display.component';
import { DirectiveModule } from '../../directive.module';

import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';

import {
  MockAccountService,
  MockApiService,
  MockDirectiveRepo,
} from './test-utils';
import { ApiService } from '@shared/services/api/api.service';

describe('DirectiveDisplayComponent', () => {
  let shallow: Shallow<DirectiveDisplayComponent>;

  beforeEach(() => {
    shallow = new Shallow(DirectiveDisplayComponent, DirectiveModule)
      .provideMock({
        provide: AccountService,
        useClass: MockAccountService,
      })
      .provideMock({
        provide: ApiService,
        useClass: MockApiService,
      });
    MockAccountService.mockArchive = new ArchiveVO({
      archiveId: 1,
      fullName: 'The Test Archive',
    });
    MockDirectiveRepo.reset();
    MockDirectiveRepo.mockStewardEmail = 'test@example.com';
    MockDirectiveRepo.mockNote = 'Unit Testing!';
    MockDirectiveRepo.legacyContactName = 'Test User';
    MockDirectiveRepo.legacyContactEmail = 'test@example.com';
  });

  it('should create', async () => {
    const { find, instance } = await shallow.render();
    expect(instance).toBeTruthy();
    expect(find('.error').length).toBe(0);
  });

  it('should fill in current archive info', async () => {
    const { find } = await shallow.render();
    expect(
      find('.archive-steward-header')[0].nativeElement.innerText
    ).toContain('The Test Archive');
  });

  it('should fetch directive info from API', async () => {
    const { find, instance } = await shallow.render();
    expect(instance.directive).not.toBeUndefined();
    expect(find('.archive-steward-note')[0].nativeElement.innerText).toContain(
      'Unit Testing!'
    );
    expect(find('.archive-steward-email')[0].nativeElement.innerText).toContain(
      'test@example.com'
    );
  });

  it('should format null fields properly', async () => {
    MockDirectiveRepo.reset();
    const { find } = await shallow.render();
    expect(find('.not-assigned').length).toBeGreaterThan(0);
  });

  it('should format filled out fields properly', async () => {
    const { find } = await shallow.render();
    expect(find('.not-assigned').length).toBe(0);
  });

  it('should be able to handle API errors when fetching Directive', async () => {
    MockDirectiveRepo.failRequest = true;
    const { find } = await shallow.render();
    expect(find('.error').length).toBe(1);
    expect(find('.archive-steward-table').length).toBe(0);
    expect(find('button').nativeElement.disabled).toBeTruthy();
  });

  it('should show the "No Plan" warning if the user does not have a legacy contact', async () => {
    MockDirectiveRepo.legacyContactName = null;
    MockDirectiveRepo.legacyContactEmail = null;
    const { find } = await shallow.render();
    expect(find('.no-plan-warning').length).toBe(1);
    expect(find('button').nativeElement.disabled).toBeTruthy();
  });

  it('should not show the "No Plan" warning if the user does have a legacy contact', async () => {
    const { find } = await shallow.render();
    expect(find('.no-plan-warning').length).toBe(0);
    expect(find('button').nativeElement.disabled).toBeFalsy();
  });

  it('should be able to handle API errors when fetching Legacy Contact', async () => {
    MockDirectiveRepo.failLegacyRequest = true;
    const { find } = await shallow.render();
    expect(find('.error').length).toBe(1);
    expect(find('.archive-steward-table').length).toBe(0);
    expect(find('button').nativeElement.disabled).toBeTruthy();
  });

  it('should be able to disable the Legacy Contact check through an input', async () => {
    MockDirectiveRepo.legacyContactName = null;
    MockDirectiveRepo.legacyContactEmail = null;
    const { find } = await shallow.render(
      '<pr-directive-display [checkLegacyContact]="false"></pr-directive-display>'
    );
    expect(find('.no-plan-warning').length).toBe(0);
    expect(find('button').nativeElement.disabled).toBeFalsy();
  });
});
