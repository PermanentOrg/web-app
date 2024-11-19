import { TestBed } from '@angular/core/testing';
import { ArchiveVO } from '@models/index';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can register a created archive and fetch it', () => {
    service.registerArchive(
      new ArchiveVO({ fullName: 'Unit Test', accessRole: 'access.role.owner' }),
    );
    const archives = service.getFinalArchives();

    expect(archives.length).toBe(1);
    expect(archives[0].fullName).toBe('Unit Test');
    expect(archives[0].accessRole).toBe('access.role.owner');
  });
});
