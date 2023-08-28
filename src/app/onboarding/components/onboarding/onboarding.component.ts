/* @format */
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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
export class OnboardingComponent implements OnInit, OnDestroy {
  public screen: OnboardingScreen = OnboardingScreen.welcomeScreen;
  public currentArchive: ArchiveVO;
  public pendingArchives: ArchiveVO[] = [];
  public useApi: boolean = true;
  public progress: number = 0;
  public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

  public showOnboarding: boolean = false;
  public accountName: string = '';
  public errorMessage: string = '';

  public acceptedInvite: boolean = false;
  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private api: ApiService,
    private account: AccountService,
    private detector: ChangeDetectorRef,
  ) {
    if (route.snapshot.data.onboardingScreen) {
      this.screen = route.snapshot.data.onboardingScreen as OnboardingScreen;
    }
  }

  ngOnInit(): void {
    this.accountName = this.account.getAccount().fullName;
    this.account.refreshArchives().then((archives) => {
      const [ownArchives, pendingArchives] = lodashPartition<ArchiveVO>(
        archives,
        (archive) => !archive.status.endsWith('pending')
      );
      if (ownArchives.length > 0 && false) {
        // This user already has archives. They don't need to onboard.
        this.showOnboarding = false;
        this.router.navigate(['/app', 'private']);
      } else {
        this.pendingArchives = pendingArchives;
        this.showOnboarding = true;
        if (this.pendingArchives.length > 0) {
          this.screen = OnboardingScreen.pendingArchives
        }
      }

      this.subscription = this.account.createAccountForMe$?.subscribe((archive: ArchiveVO) => {
        if (archive.archiveId) {
          this.setNewArchive(archive)
        }
      })

    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
      if (this.acceptedInvite) {
        this.router.navigate(['/app', 'welcome-invitation']);
      } else {
        this.router.navigate(['/app', 'welcome']);
      }
    }
  }

  public setNewArchive(archive: ArchiveVO): void {
    this.currentArchive = archive;
    const updateAccount = new AccountVO({ defaultArchiveId: archive.archiveId });
    this.account.updateAccount(updateAccount).then(() => {
      this.account.setArchive(archive);
      this.api.archive.change(archive).then(() => {
        this.setScreen(OnboardingScreen.done);
      });
    });
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

  public getProgressChunkClasses(num: number) {
    return {
      'progress-chunk': true,
      'completed': this.progress >= num,
    };
  }

  public setProgress(num: number) {
    this.errorMessage = '';
    this.progress = num;
    this.detector.detectChanges();
  }

  public acceptArchiveInvitation(archive: ArchiveVO): void {
    this.showOnboarding = false;
    this.progress = 1;
    this.api.archive.accept(archive).then(() => {
      this.progress = 2;
      this.showOnboarding = true;
      this.acceptedInvite = true;
      this.setNewArchive(archive);
    }).catch(() => {
      this.progress = 0
      this.showOnboarding = true;
      this.errorMessage = `There was an error trying to accept the invitation to The ${archive.fullName} Archive. Please try again.`;
    });
  }

  public logOut(): void {
    this.account.clear();
    this.router.navigate(['/app', 'auth']);
  }
}
