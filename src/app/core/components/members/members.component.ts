import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  members: AccountVO[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Members',
      pathAsText: ['Members'],
      type: 'page'
    }), true);

    this.members = route.snapshot.data.members;
  }

  ngOnInit() {
    console.log(this.members);
  }

}
