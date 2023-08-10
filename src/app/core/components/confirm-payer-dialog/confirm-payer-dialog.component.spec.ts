/* @format */
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { ConfirmPayerDialogComponent } from './confirm-payer-dialog.component';
import { cloneDeep } from 'lodash';
import { SharedModule } from '../../../shared/shared.module';

describe('ConfirmPayerDialogComponent', () => {
  let component: ConfirmPayerDialogComponent;
  let fixture: ComponentFixture<ConfirmPayerDialogComponent>;
  let dialogRef: DialogRef;
  let dialogData: {
    archiveId: number;
    isPayerDifferentThanLoggedUser: boolean;
    handleAccountInfoChange: () => void;
    cancelAccountPayerSet: () => void;
  };

  beforeEach(async () => {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      archiveId: 1,
      isPayerDifferentThanLoggedUser: false,
      handleAccountInfoChange: () => {},
      cancelAccountPayerSet: () => {},
    };

    dialogRef = new DialogRef(1, null);

    config.imports.push(SharedModule);
    config.declarations.push(ConfirmPayerDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        sharerName: 'John Rando',
      },
    });
    config.providers.push({
      provide: DialogRef,
      useValue: dialogRef,
    });
    await TestBed.configureTestingModule(config).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
