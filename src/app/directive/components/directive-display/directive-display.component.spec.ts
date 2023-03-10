import { Shallow } from 'shallow-render';

import { DirectiveDisplayComponent } from './directive-display.component';
import { DirectiveModule } from '../../directive.module';

import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';

import {
  MockAccountRepo,
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
    MockAccountRepo.reset();
    MockDirectiveRepo.reset();
    MockDirectiveRepo.mockStewardId = 1;
    MockDirectiveRepo.mockNote = 'Unit Testing!';
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
  });

  it('should fetch archive steward info from API', async () => {
    MockDirectiveRepo.reset();
    MockDirectiveRepo.mockStewardId = 1;
    MockAccountRepo.emailAddress = 'unittesting@example.com';
    const { find, fixture, instance } = await shallow.render();
    await fixture.whenStable();
    expect(instance.archiveStewardEmail).not.toBeUndefined();
    expect(find('.archive-steward-email')[0].nativeElement.innerText).toContain(
      'unittesting@example.com'
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

  it('should be able to handle API errors when fetching Archive Steward e-mail', async () => {
    MockAccountRepo.failRequest = true;
    const { find } = await shallow.render();
    expect(find('.error').length).toBe(1);
    expect(find('.archive-steward-table').length).toBe(0);
    expect(find('button').nativeElement.disabled).toBeTruthy();
  });
});
