import { Component, Input } from '@angular/core';

@Component({
  selector: 'pr-glam-user-survey-square',
  templateUrl: './glam-user-survey-square.component.html',
  styleUrl: './glam-user-survey-square.component.scss',
})
export class GlamUserSurveySquareComponent {
  @Input() text: string;
  @Input() tag: string;
  @Input() selected: boolean = false;
}
