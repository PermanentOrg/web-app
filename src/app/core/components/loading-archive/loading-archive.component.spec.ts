import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoadingArchiveComponent } from './loading-archive.component';

describe('LoadingArchiveComponent', () => {
  let component: LoadingArchiveComponent;
  let fixture: ComponentFixture<LoadingArchiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [ LoadingArchiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect after loading', (done) => {
    fixture = TestBed.createComponent(LoadingArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const routerSpy = spyOn(router, 'navigate');

    setTimeout(() => {
      expect(routerSpy).toHaveBeenCalledWith(['/app' , 'private']);
      done();
    }, 2500);
  });
});
