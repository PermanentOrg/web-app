import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { filter } from 'lodash';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';

interface FamilySearchPersonI {
  id: string;
  display: {
    name: string;
    lifespan: string;
    ascendancyNumber: number;
  };
  isSelected?: boolean;
  permExists?: boolean;
}

interface FamilyMember {
  name: string;
  isSelected?: boolean;
  born?: number;
}

@Component({
  selector: 'pr-family-search-import',
  templateUrl: './family-search-import.component.html',
  styleUrls: ['./family-search-import.component.scss']
})
export class FamilySearchImportComponent implements OnInit {
  public stage: 'people' | 'memories' | 'importing' = 'people';
  public importMemories = 'yes';
  public familyMembers: FamilySearchPersonI[] = [];
  public currentUser: FamilySearchPersonI;
  public waiting = false;
  public showImportSpinner = true;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private api: ApiService,
    private message: MessageService,
    private account: AccountService
  ) {
    this.currentUser = data.currentUserData;
    this.familyMembers = filter(data.treeData, person => person.id !== this.currentUser.id);
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

  async startImport() {
    const selected = this.familyMembers.filter(person => person.isSelected);
    if (!selected.length) {
      return this.cancel();
    }

    this.stage = 'importing';
    const archivesToCreate = selected.map(person => {
      return new ArchiveVO({
        fullName: person.display.name,
        type: 'type.archive.person',
        relationType: this.getRelationshipFromAncestryNumber(person.display.ascendancyNumber)
      });
    });

    this.waiting = true;

    const total = archivesToCreate.length;

    this.message.showMessage(
      `Starting archive import for ${total} person(s). Do not close this window or refresh your browser.`,
      'info'
    );

    this.showImportSpinner = true;
    const response = await this.api.archive.create(archivesToCreate);

    const newArchives = response.getArchiveVOs();
    const personIds = [];
    for (let index = 0; index < newArchives.length; index++) {
      personIds.push(selected[index].id);
    }

    try {
      await this.api.connector.familysearchFactImportRequest(newArchives, personIds);

      if (this.importMemories === 'yes') {
        await this.api.connector.familysearchMemoryImportRequest(newArchives, personIds);
      }
    } catch (err) {
      this.message.showError('There was an error importing facts and memories. Please try again later.');
    }

    this.showImportSpinner = false;

    this.message.showMessage(
      `Import complete. Tap here to view your new archives.`,
      'success',
      false,
      ['/choosearchive']
    );

    this.waiting = false;
    this.dialogRef.close();
  }

  getSelectedCount() {
    return this.familyMembers.filter(person => person.isSelected).length;
  }

  getRelationshipFromAncestryNumber(ancestryNumber: number) {
    switch (1 * ancestryNumber) {
      case 2:
        return 'relation.family.father';
      case 3:
        return 'relation.family.mother';
      case 4:
      case 6:
        return 'relation.family.grandfather';
      case 5:
      case 7:
        return 'relation.family.grandmother';
      default:
        return 'relation.family_member';
    }
  }
}
