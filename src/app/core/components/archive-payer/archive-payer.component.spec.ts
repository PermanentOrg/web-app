/* @format */
import { MessageService } from '../../../shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchivePayerComponent } from './archive-payer.component';

describe('ArchivePayerComponent', () => {
  let component: ArchivePayerComponent;
  let fixture: ComponentFixture<ArchivePayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArchivePayerComponent],
      providers: [HttpClient, HttpHandler, AccountService, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivePayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
