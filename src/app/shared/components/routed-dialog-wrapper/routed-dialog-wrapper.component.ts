/* @format */
import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DialogRef,
  DialogComponentToken,
} from '@root/app/dialog/dialog.module';
import { RouteData } from '@root/app/app.routes';
import { DialogOptions } from '@root/app/dialog/dialog.service';
import {
  HasSubscriptions,
  unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { RouteHistoryService } from '@root/app/route-history/route-history.service';
import { Title } from '@angular/platform-browser';
import { slideUpAnimation } from '@shared/animations';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

@Component({
  selector: 'pr-routed-dialog-wrapper',
  template: ` <ng-template #outletTemplate>
    <div [@slideUpAnimation]="o.isActivated ? o.activatedRoute : ''">
      <router-outlet #o="outlet"></router-outlet>
    </div>
  </ng-template>`,
  animations: [slideUpAnimation],
})
export class RoutedDialogWrapperComponent
  implements AfterViewInit, HasSubscriptions, OnDestroy
{
  private dialogToken: DialogComponentToken;
  private dialogOptions: DialogOptions;
  private dialogRef: DialogRef;
  private component: any;

  private closedByNavigate = false;

  @ViewChild('outletTemplate') private outletTemplate: TemplateRef<any>;

  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: DialogCdkService,
    private routeHistory: RouteHistoryService,
    private title: Title,
  ) {}

  ngAfterViewInit(): void {
    this.title.setTitle(`${this.route.snapshot.data.title} | Permanent.org`);

    console.log(this.route.snapshot.data);

    this.dialogToken = (this.route.snapshot.data as RouteData).dialogToken;
    this.component = (this.route.snapshot.data as RouteData).component;

    if (!this.dialogToken) {
      throw new Error(
        "RoutedDialogWrapperComponent - missing dialog token on route data, can't open dialog",
      );
    }

    if (!this.component) {
      throw new Error(
        "RoutedDialogWrapperComponent - missing dialog token on route data, can't open dialog",
      );
    }

    this.dialogOptions = (this.route.snapshot.data as RouteData).dialogOptions;

    const dialogData = {
      ...this.route.snapshot.data,
      activatedRoute: this.route,
      outletTemplate: this.outletTemplate,
    };

    // this.dialogRef = this.dialog.createDialog(
    //   this.dialogToken,
    //   dialogData,
    //   this.dialogOptions,
    //   this.outletTemplate,
    //   this.route,
    // );

    this.dialog.open(this.component, this.dialogOptions);

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
