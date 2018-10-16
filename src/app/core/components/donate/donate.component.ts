import { Component, OnInit } from '@angular/core';

enum DonationStage {
  Init,
  Confirm,
  Complete
}

@Component({
  selector: 'pr-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
  public donationStage: DonationStage = DonationStage.Init;

  constructor() { }

  ngOnInit() {
  }

}
