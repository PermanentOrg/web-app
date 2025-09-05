import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import {
  faLeafOak,
  faListCheck,
  faCircleVideo,
  faUserGroupSimple,
} from '@fortawesome/pro-regular-svg-icons';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct icon bindings', () => {
    expect(component.leafOakIcon).toBe(faLeafOak);
    expect(component.listCheckIcon).toBe(faListCheck);
    expect(component.circleVideoIcon).toBe(faCircleVideo);
    expect(component.userGroupSimpleIcon).toBe(faUserGroupSimple);
  });

  it('should open legacy lab URL in same tab when openLegacyLab is called', () => {
    spyOn(window, 'open');
    component.openLegacyLab();
    expect(window.open).toHaveBeenCalledWith('http://permanent.org/legacy-lab/', '_self');
  });
});
