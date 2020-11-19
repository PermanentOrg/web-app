import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-loading-archive',
  templateUrl: './loading-archive.component.html',
  styleUrls: ['./loading-archive.component.scss']
})
export class LoadingArchiveComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/app', 'myfiles']);
    }, 1000);
  }
}
