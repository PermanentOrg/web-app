import { Component, OnInit, Input } from '@angular/core';
import { FolderViewType, ItemVO, FolderVO } from '@models';
import { Router } from '@angular/router';
import { environment } from '@root/environments/environment';


@Component({
  selector: 'pr-sidebar-view-option',
  templateUrl: './sidebar-view-option.component.html',
  styleUrls: ['./sidebar-view-option.component.scss']
})
export class SidebarViewOptionComponent implements OnInit {
  @Input() folderView: FolderViewType;
  @Input() folder: FolderVO;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onLaunchClick() {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const rootArchive = this.folder.archiveNbr.split('-')[0] + '-0000';
    const base = `${baseUrl}/p/archive/${rootArchive}`;
    const folderView = this.folderView.split('.').pop();
    // const url = `${base}/${item.archiveNbr}/${item.folder_linkId}`;
  }

}
