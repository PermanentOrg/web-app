/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { GiftStorageComponent } from './gift-storage.component';

describe('GiftStorageComponent', () => {
  let component: GiftStorageComponent;
  let fixture: ComponentFixture<GiftStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GiftStorageComponent],
      providers: [HttpClient, HttpHandler],
    }).compileComponents();

    fixture = TestBed.createComponent(GiftStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
