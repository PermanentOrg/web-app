import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@models';
import { ProfileItemVOData, FieldNameUI } from '@models/profile-item-vo';
import { ActivatedRoute } from '@angular/router';
import { groupBy } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';

type ProfileItemsStringDataCol =
'string1' |
'string2' |
'string3' |
'datetime1' |
'datetime2' |
'textData1' |
'textData2' |
'day1' |
'day2'
;

type ProfileItemsIntDataCol =
'int1' |
'int2' |
'int3' |
'locnId1' |
'locnId2' |
'otherId1' |
'otherId2' |
'text_dataId1' |
'text_dataId2'
;

type ProfileItemsDictionary = {
  [Field in FieldNameUI]: ProfileItemVOData[]
};

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  profileItems: ProfileItemsDictionary;

  canEdit: boolean;

  constructor(
    private data: DataService,
    private account: AccountService,
    private route: ActivatedRoute
  ) {
    this.data.setCurrentFolder(
      new FolderVO({
        type: 'page',
        displayName: 'Profile',
        pathAsText: ['Profile']
      })
    );

    const profileItems = this.route.snapshot.data.profileItems as ProfileItemVOData[];
    this.profileItems = groupBy(profileItems, 'fieldNameUI') as ProfileItemsDictionary;

    this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
  }

  ngOnInit(): void {
  }

  onSaveStringProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsStringDataCol, value: string) {
    console.log(fieldName, value);
  }

  onSaveIntProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsIntDataCol, value: number) {
    console.log(fieldName, value);
  }
}
