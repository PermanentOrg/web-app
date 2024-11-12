import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSearchBarResultsComponent } from './public-search-bar-results.component';

describe('PublicSearchBarResultsComponent', () => {
  let component: PublicSearchBarResultsComponent;
  let fixture: ComponentFixture<PublicSearchBarResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicSearchBarResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublicSearchBarResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
