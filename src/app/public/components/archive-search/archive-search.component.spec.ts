/* @format */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { ArchiveSearchComponent } from './archive-search.component';

describe('ArchiveSearchComponent', () => {
  let component: ArchiveSearchComponent;
  let fixture: ComponentFixture<ArchiveSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArchiveSearchComponent],
      imports: [HttpClientTestingModule],
      providers: [FormBuilder, Router],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
