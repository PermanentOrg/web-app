import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.api.auth.isLoggedIn()
    .subscribe(response => console.log(response));
  }
}
