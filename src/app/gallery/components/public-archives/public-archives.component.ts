/* @format */
import { Component, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-public-archives',
  templateUrl: './public-archives.component.html',
  styleUrls: ['./public-archives.component.scss'],
})
export class PublicArchivesComponent implements OnInit {
  public publicArchives: ArchiveVO[] = [];
  public waiting: boolean = true;

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.publicArchives = await this.accountService.getAllPublicArchives();
      this.waiting = false;
    } catch (error) {
      this.waiting = false;
      this.messageService.showError('There was an error loading the archives');
    }
  }

  public goToArchive(archive: ArchiveVO): void {
    this.router.navigate(['/p/archive', archive.archiveNbr]);
  }
}
