/* @format */
import { DataService } from '../../../shared/services/data/data.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSearchResultsComponent } from './public-search-results.component';
import { SearchService } from '@search/services/search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PublicSearchResultsComponent', () => {
  let component: PublicSearchResultsComponent;
  let fixture: ComponentFixture<PublicSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicSearchResultsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get(): string {
                  return '123';
                },
              },
            },
          },
        },
        Router,
        SearchService,
        Location,
        DataService,
      ],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
