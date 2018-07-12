import { Component, OnInit } from '@angular/core';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'pr-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  displayText: string;
  visible: Boolean;
  style: string;

  private displayTime = 4000;

  constructor(private service: MessageService) {
    this.service.registerComponent(this);
  }

  ngOnInit() {
  }

  display(textToDisplay: string, style?: string, displayTime = this.displayTime) {
    this.displayText = textToDisplay;
    this.style = style ? `alert-${style}` : null;
    this.visible = true;
    setTimeout(this.dismiss.bind(this), displayTime);
  }

  dismiss() {
    this.visible = false;
    return false;
  }

}
