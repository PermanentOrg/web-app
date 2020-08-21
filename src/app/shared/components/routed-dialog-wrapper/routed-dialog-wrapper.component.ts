import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DialogRef, Dialog, DialogComponentToken } from '@root/app/dialog/dialog.module';
import { RouteData } from '@root/app/app.routes';
import { DialogOptions } from '@root/app/dialog/dialog.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { RouteHistoryService } from 'ngx-route-history';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'pr-routed-dialog-wrapper',
  template: ''
})
export class RoutedDialogWrapperComponent implements OnInit, HasSubscriptions, OnDestroy {
  private dialogToken: DialogComponentToken;
  private dialogOptions: DialogOptions;
  private dialogRef: DialogRef;

  private previousTitle: string;

  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: Dialog,
    private routeHistory: RouteHistoryService,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle(`${this.route.snapshot.data.title} | Permanent.org`);

    this.dialogToken = (this.route.snapshot.data as RouteData).dialogToken;

    if (!this.dialogToken) {
      throw new Error('RoutedDialogWrapperComponent - missing dialog token on route data, can\'t open dialog');
    }

    this.dialogOptions = (this.route.snapshot.data as RouteData).dialogOptions;

    this.dialogRef = this.dialog.createDialog(this.dialogToken, this.route.snapshot.data, this.dialogOptions);

    this.dialogRef.dialogComponent.show();

    this.dialogRef.closePromise.finally(() => {
      this.dialogRef = null;
      const targetRoute = this.routeHistory.previousRoute || '/m/';
      this.router.navigateByUrl(targetRoute);
    });
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    unsubscribeAll(this.subscriptions);
  }

}
