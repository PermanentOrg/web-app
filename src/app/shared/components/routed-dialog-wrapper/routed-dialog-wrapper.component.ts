import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { RouteData } from '@root/app/app.routes';
import { RouteHistoryService } from '@root/app/route-history/route-history.service';
import { Title } from '@angular/platform-browser';
import { slideUpAnimation } from '@shared/animations';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

@Component({
  selector: 'pr-routed-dialog-wrapper',
  template: `
    <ng-template #outletTemplate>
      <div [@slideUpAnimation]="o.isActivated ? o.activatedRoute : ''">
        <router-outlet #o="outlet"></router-outlet>
      </div>
    </ng-template>
  `,
  animations: [slideUpAnimation],
})
export class RoutedDialogWrapperComponent
  implements AfterViewInit, HasSubscriptions, OnDestroy
{
  @ViewChild('outletTemplate') private outletTemplate: TemplateRef<any>;

  subscriptions: Subscription[] = [];
  private dialogRef: DialogRef<any> | null = null;
  private closedByNavigate = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogCdkService,
    private routeHistory: RouteHistoryService,
    private title: Title
  ) {}

  ngAfterViewInit(): void {
    this.title.setTitle(`${this.route.snapshot.data.title} | Permanent.org`);

    const component = (this.route.snapshot.data as RouteData).component;

    const dialogOptions = (this.route.snapshot.data as RouteData).dialogOptions;

    const dialogData = {
      ...this.route.snapshot.data,
      activatedRoute: this.route,
      outletTemplate: this.outletTemplate,
    };

    console.log('dialogData', dialogData.activatedRoute.snapshot.params);

    this.openDialog(component, dialogData, dialogOptions);
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.closedByNavigate = true;
    unsubscribeAll(this.subscriptions);
  }

  private openDialog(component: any, dialogData: any, dialogOptions: any): void {
    const config = {
      ...dialogOptions,
      data: dialogData,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'custom-dialog-panel', // Add any custom class you want
    };

    this.dialogRef = this.dialogService.open(component, config);

    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      if (!this.closedByNavigate) {
        const targetRoute = this.routeHistory.previousRoute || '/app/';
        this.router.navigateByUrl(targetRoute);
      }
    });
  }
}
