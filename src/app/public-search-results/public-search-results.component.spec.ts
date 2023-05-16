import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSearchResultsComponent } from './public-search-results.component';

describe('PublicSearchResultsComponent', () => {
  let component: PublicSearchResultsComponent;
  let fixture: ComponentFixture<PublicSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicSearchResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
