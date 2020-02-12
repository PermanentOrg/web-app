import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-item-not-found',
  templateUrl: './item-not-found.component.html',
  styleUrls: ['./item-not-found.component.scss']
})
export class ItemNotFoundComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
    setTimeout(() => {
      window.location.assign('/');
    }, 5000);
  }

}
