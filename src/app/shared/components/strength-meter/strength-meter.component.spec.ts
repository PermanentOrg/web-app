/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StrengthMeterComponent } from './strength-meter.component';

describe('StrengthMeterComponent', () => {
  let component: StrengthMeterComponent;
  let fixture: ComponentFixture<StrengthMeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StrengthMeterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StrengthMeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "weak" password strength correctly', () => {
    component.message = 'weak';
    component.passwordClass = 'too-weak';
    component.ngOnChanges();
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('p'));

    expect(component.progressBars).toEqual(['weak', '', '']);
    expect(message.nativeElement.textContent).toContain('Password is weak!');
    expect(message.nativeElement.className).toBe('too-weak');
  });

  it('should display "medium" password strength correctly', () => {
    component.message = 'medium';
    component.passwordClass = 'weak';
    component.ngOnChanges();
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('p'));

    expect(component.progressBars).toEqual(['half', 'half', '']);
    expect(message.nativeElement.textContent).toContain('Password is medium!');
    expect(message.nativeElement.className).toBe('weak');
  });

  it('should display "strong" password strength correctly', () => {
    component.message = 'strong';
    component.passwordClass = 'strong';
    component.ngOnChanges();
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('p'));

    expect(component.progressBars).toEqual(['filled', 'filled', 'filled']);
    expect(message.nativeElement.textContent).toContain('Password is strong!');
    expect(message.nativeElement.className).toBe('strong');
  });

  it('should handle invalid message gracefully', () => {
    component.message = 'invalid';
    component.passwordClass = '';
    component.ngOnChanges();
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('p'));

    expect(component.progressBars).toEqual(['', '', '']);
    expect(message.nativeElement.textContent).toContain('Password is invalid!');
    expect(message.nativeElement.className).toBe('');
  });

  it('should update progress bars on message change', () => {
    component.message = 'weak';
    component.passwordClass = 'too-weak';
    component.ngOnChanges();
    fixture.detectChanges();

    expect(component.progressBars).toEqual(['weak', '', '']);

    component.message = 'strong';
    component.passwordClass = 'strong';
    component.ngOnChanges();
    fixture.detectChanges();

    expect(component.progressBars).toEqual(['filled', 'filled', 'filled']);
  });
});
