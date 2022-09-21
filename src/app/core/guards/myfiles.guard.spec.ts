/* @format */
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MyfilesGuard } from './myfiles.guard';

describe('MyfilesGuard', () => {
  let guard: MyfilesGuard;
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyRouterState: (s: string) => RouterStateSnapshot = (url: string) =>
    ({ url } as RouterStateSnapshot);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    guard = TestBed.inject(MyfilesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect /app/myfiles to /app/private', () => {
    const tree: UrlTree = guard.canActivate(
      dummyRoute,
      dummyRouterState('/app/myfiles')
    ) as UrlTree;
    expect(tree.toString()).toBe('/app/private');
  });

  it('should redirect a myfiles subdirectory to /app/private/*', () => {
    const tree: UrlTree = guard.canActivate(
      dummyRoute,
      dummyRouterState('/app/myfiles/0001-000m/22')
    ) as UrlTree;
    expect(tree.toString()).toBe('/app/private/0001-000m/22');
  });
});
