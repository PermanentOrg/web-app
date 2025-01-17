import { TestBed } from '@angular/core/testing';

import { SidebarActionPortalService } from './sidebar-action-portal.service';

describe('SidebarActionPortalService', () => {
  let service: SidebarActionPortalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SidebarActionPortalService],
    });
    service = TestBed.inject(SidebarActionPortalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
