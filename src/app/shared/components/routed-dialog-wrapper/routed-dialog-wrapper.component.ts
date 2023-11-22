import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DialogRef, Dialog, DialogComponentToken } from '@root/app/dialog/dialog.module';
import { RouteData } from '@root/app/app.routes';
import { DialogOptions } from '@root/app/dialog/dialog.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { RouteHistoryService } from '@root/app/route-history/route-history.service';
import { Title } from '@angular/platform-browser';
import { slideUpAnimation } from '@shared/animations';

@Component({
  selector: 'pr-routed-dialog-wrapper',
  template: `
  <ng-template #outletTemplate>
    <div [@slideUpAnimation]="o.isActivated ? o.activatedRoute : ''">
      <router-outlet #o="outlet"></router-outlet>
    </div>
  </ng-template>`,
  animations: [ slideUpAnimation ]
})
export class RoutedDialogWrapperComponent implements OnInit, AfterViewInit, HasSubscriptions, OnDestroy {
  private dialogToken: DialogComponentToken;
  private dialogOptions: DialogOptions;
  private dialogRef: DialogRef;

  private closedByNavigate = false;

  @ViewChild('outletTemplate') private outletTemplate: TemplateRef<any>;

  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: Dialog,
    private routeHistory: RouteHistoryService,
    private title: Title
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.title.setTitle(`${this.route.snapshot.data.title} | Permanent.org`);

    this.dialogToken = (this.route.snapshot.data as RouteData).dialogToken;

    if (!this.dialogToken) {
      throw new Error('RoutedDialogWrapperComponent - missing dialog token on route data, can\'t open dialog');
    }

    this.dialogOptions = (this.route.snapshot.data as RouteData).dialogOptions;

    const dialogData = {
      ...this.route.snapshot.data,
      activatedRoute: this.route,
      outletTemplate: this.outletTemplate
    };

    this.dialogRef = this.dialog.createDialog(this.dialogToken, dialogData, this.dialogOptions, this.outletTemplate, this.route);

    this.dialogRef.dialogComponent.show();

    this.dialogRef.closePromise.finally(() => {
      this.dialogRef = null;
      if (!this.closedByNavigate) {
        const targetRoute = this.routeHistory.previousRoute || '/app/';
        this.router.navigateByUrl(targetRoute);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.closedByNavigate = true;
    unsubscribeAll(this.subscriptions);
  }

}
