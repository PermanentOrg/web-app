import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicArchiveWebLinksComponent } from './public-archive-web-links.component';

describe('PublicArchiveWebLinksComponent', () => {
  let component: PublicArchiveWebLinksComponent;
  let fixture: ComponentFixture<PublicArchiveWebLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicArchiveWebLinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicArchiveWebLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
