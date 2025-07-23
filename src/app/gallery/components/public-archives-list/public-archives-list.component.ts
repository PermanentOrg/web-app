/* @format */
import { Component, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-public-archives-list',
  templateUrl: './public-archives-list.component.html',
  styleUrls: ['./public-archives-list.component.scss'],
  standalone: false,
})
export class PublicArchivesListComponent implements OnInit {
  public publicArchives: ArchiveVO[] = [];
  public waiting: boolean = true;
  public expanded: boolean = false;

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.publicArchives = await this.accountService.getAllPublicArchives();
      this.waiting = false;
    } catch (error) {
      this.waiting = false;
      this.messageService.showError({
        message: 'There was an error loading the archives',
      });
    }
  }

  public goToArchive(archive: ArchiveVO): void {
    this.router.navigate(['/p/archive', archive.archiveNbr]);
  }

  public toggleArchives(): void {
    this.expanded = !this.expanded;
  }
}
