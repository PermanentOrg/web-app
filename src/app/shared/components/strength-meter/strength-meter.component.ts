import { Component, Input, OnChanges } from '@angular/core';

interface StrengthLevel {
  message: string;
  class: string;
  bars: string[];
}

@Component({
  selector: 'pr-strength-meter',
  templateUrl: './strength-meter.component.html',
  styleUrls: ['./strength-meter.component.scss'],
})
export class StrengthMeterComponent implements OnChanges {
  progressBars: string[] = ['', '', ''];

  @Input() message: string = '';
  @Input() passwordClass: string = '';

  ngOnChanges(): void {
    this.updatePasswordStrength();
  }

  private updatePasswordStrength(): void {
    const strengthLevels: StrengthLevel[] = [
      {
        message: 'weak',
        class: 'too-weak',
        bars: ['weak', '', ''],
      },
      {
        message: 'medium',
        class: 'weak',
        bars: ['half', 'half', ''],
      },
      {
        message: 'strong',
        class: 'strong',
        bars: ['filled', 'filled', 'filled'],
      },
    ];

    const level = strengthLevels.find((lvl) => lvl.message === this.message);
    if (level) {
      this.progressBars = level.bars;
    } else {
      this.progressBars = ['', '', ''];
    }
  }
}
