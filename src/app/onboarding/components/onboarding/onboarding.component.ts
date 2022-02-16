import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { ArchiveVO } from '@models/archive-vo';
import { AccountVO } from '@models/account-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import { routes } from '@onboarding/onboarding.routes';

import { partition as lodashPartition } from 'lodash';

@Component({
  selector: 'pr-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  public screen: OnboardingScreen = OnboardingScreen.welcomeScreen;
  public currentArchive: ArchiveVO;
  public pendingArchives: ArchiveVO[] = [];
  public useApi: boolean = true;
  public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

  public skipOnboarding: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private api: ApiService,
    private account: AccountService,
  ) {
    if (route.snapshot.data.onboardingScreen) {
      this.screen = route.snapshot.data.onboardingScreen as OnboardingScreen;
    }
  }

  ngOnInit(): void {
    this.account.refreshArchives().then((archives) => {
      const [ownArchives, pendingArchives] = lodashPartition<ArchiveVO>(
        archives,
        (archive) => !archive.status.endsWith('pending')
      );
      if (ownArchives.length > 0 && false) {
        // This user already has archives. They don't need to onboard.
        this.skipOnboarding = true;
        this.router.navigate(['/app', 'myfiles']);
      } else {
        this.pendingArchives = pendingArchives;
        this.skipOnboarding = false;
      }
    });
  }

  public setScreen(screen: OnboardingScreen): void {
    this.screen = screen;
    const correspondingRoute = routes.find(route => {
      if (route.data?.onboardingScreen) {
        if (route.data.onboardingScreen as OnboardingScreen === screen) {
          return true;
        }
      }
      return false;
    });
    if (correspondingRoute) {
      this.location.go('app/onboarding/' + correspondingRoute.path);
    }
    if (screen === OnboardingScreen.done) {
      this.router.navigate(['/app']);
    }
  }

  public setNewArchive(archive: ArchiveVO): void {
    this.currentArchive = archive;
    this.setScreen(OnboardingScreen.done);
  }

  public setState(state: Partial<OnboardingComponent>): void {
    if (state.pendingArchives) {
      this.pendingArchives = state.pendingArchives;
    }
    if (state.screen) {
      this.screen = state.screen;
    }
    if (state.currentArchive) {
      this.currentArchive = state.currentArchive;
    }
  }

  public acceptArchiveInvitation(archive: ArchiveVO): void {
    this.skipOnboarding = true;
    this.api.archive.accept(archive).then(() => {
      this.skipOnboarding = false;
      this.account.setArchive(archive);
      this.setNewArchive(archive);
    }).catch(() => {
      // TODO: This should be a MessageService message.
      // However, MessageService and its Component aren't working properly.
      // This will be changed in a later commit.
      console.error(`There was an error trying to accept the invitation to The ${archive.fullName} Archive. Please try again.`);
    });
  }
}
