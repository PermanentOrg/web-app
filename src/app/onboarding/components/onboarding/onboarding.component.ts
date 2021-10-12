import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { ArchiveVO } from '@models/archive-vo';

import { routes } from '@onboarding/onboarding.routes';

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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ) {
    if (route.snapshot.data.onboardingScreen) {
      this.screen = route.snapshot.data.onboardingScreen as OnboardingScreen;
    }
  }

  ngOnInit(): void {
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
}
