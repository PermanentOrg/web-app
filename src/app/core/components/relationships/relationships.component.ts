import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { RelationVO, FolderVO, ArchiveVO } from '@models/index';
import { Deferred } from '@root/vendor/deferred';
import { RelationResponse } from '@shared/services/api/index.repo';
import { remove, find } from 'lodash';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { RELATIONSHIP_FIELD_INITIAL, RELATIONSHIP_FIELD } from '../prompt/prompt-fields';
import { DataService } from '@shared/services/data/data.service';
import { Dialog } from '@root/app/dialog/dialog.module';
import { ArchivePickerComponentConfig } from '@shared/components/archive-picker/archive-picker.component';

const RelationActions: {[key: string]: PromptButton} = {
  Edit: {
    buttonName: 'edit',
    buttonText: 'Edit'
  },
  Accept: {
    buttonName: 'accept',
    buttonText: 'Accept'
  },
  Decline: {
    buttonName: 'decline',
    buttonText: 'decline',
    class: 'btn-danger'
  },
  Remove: {
    buttonName: 'remove',
    buttonText: 'Remove',
    class: 'btn-danger'
  }
};

interface RelationType {
  type?: string;
  name?: string;
}

@Component({
  selector: 'pr-relationships',
  templateUrl: './relationships.component.html',
  styleUrls: ['./relationships.component.scss']
})
export class RelationshipsComponent implements OnDestroy {
  relations: RelationVO[] = [];
  relationRequests: RelationVO[] = [];
  sentRelationRequests: RelationVO[] = [];

  relationOptions: FormInputSelectOption[];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private dataService: DataService,
    private promptService: PromptService,
    private messageService: MessageService,
    private prConstants: PrConstantsService,
    private accountService: AccountService,
    private dialog: Dialog
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Relationships',
      pathAsText: ['Relationships'],
      type: 'page'
    }), true);
    this.route.snapshot.data.relations.map((relation: RelationVO) => {
      if (relation.status.includes('ok')) {
        // existing relationship
        this.relations.push(relation);
      } else if (relation.ArchiveVO.archiveId === this.accountService.getArchive().archiveId) {
        // sent relationship request
        this.sentRelationRequests.push(relation);
      } else {
        // incoming relationship request
        this.relationRequests.push(relation);
      }
    });
    this.relationOptions = this.prConstants.getRelations().map((type) => {
      return {
        text: type.name,
        value: type.type
      };
    });
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

  onRelationClick(relation: RelationVO) {
    const buttons = [ RelationActions.Edit, RelationActions.Remove ];
    this.promptService.promptButtons(buttons, `Relationship with ${relation.RelationArchiveVO.fullName}`)
      .then((value: string) => {
        switch (value) {
          case 'edit':
            this.editRelation(relation);
            break;
          case 'remove':
            this.removeRelation(relation);
            break;
        }
      })
      .catch(() => {});
  }

  onSentRelationRequestClick(relation: RelationVO) {
    const buttons = [ RelationActions.Remove ];
    this.promptService.promptButtons(buttons, `Relationship with ${relation.RelationArchiveVO.fullName}`)
      .then((value: string) => {
        switch (value) {
          case 'remove':
            this.removeRelation(relation);
            break;
        }
      })
      .catch(() => {});
  }

  onRelationRequestClick(relation: RelationVO) {
    const deferred = new Deferred();
    this.promptService.prompt(
      [RELATIONSHIP_FIELD],
      `Accept relationship with ${relation.ArchiveVO.fullName}?`,
      deferred.promise,
      'Accept',
      'Decline'
    ).then((value) => {
      const relationMyVo = new RelationVO({
        type: value.relationType
      });
      return this.api.relation.accept(relation, relationMyVo)
        .then((response: RelationResponse) => {
          this.messageService.showMessage('Relationship created successfully.', 'success');
          const newRelation = response.getRelationVO();
          relation.relationId = newRelation.relationId;
          relation.archiveId = newRelation.archiveId;
          relation.relationArchiveId = newRelation.relationArchiveId;
          relation.status = newRelation.status;
          relation.type = newRelation.type;

          const archiveVo = relation.ArchiveVO;
          const relationArchiveVo = relation.RelationArchiveVO;

          relation.ArchiveVO = relationArchiveVo;
          relation.RelationArchiveVO = archiveVo;

          remove(this.relationRequests, relation);
          this.relations.push(relation);

          deferred.resolve();
        });
    })
    .catch((response: RelationResponse) => {
      if (response) {
        deferred.resolve();
        this.messageService.showError(response.getMessage(), true);
      } else {
        deferred.resolve();
        this.removeRelation(relation);
      }
    });
  }

  addRelation() {
    const newRelation: RelationVO = new RelationVO({});
    return this.dialog.open('ArchivePickerComponent')
      .then((archive: ArchiveVO) => {
        if (find(this.relations, {relationArchiveId: archive.archiveId})) {
          return this.messageService.showMessage('You already have a relationship with this archive.', 'info');
        }

        newRelation.relationArchiveId = archive.archiveId;
        newRelation.RelationArchiveVO = archive;
        this.relations.push(newRelation);
        return this.editRelation(newRelation);
      })
      .catch(() => {});
  }

  editRelation(relation: RelationVO) {
    let updatedRelation: RelationVO;
    const isNewRelation = !relation.relationId;
    const deferred = new Deferred();
    const fields: PromptField[] = [ RELATIONSHIP_FIELD_INITIAL(relation.type) ];

    return this.promptService.prompt(
      fields,
      `Relationship with ${relation.RelationArchiveVO.fullName}`,
      deferred.promise,
      'Save'
      )
      .then((value) => {
        updatedRelation = new RelationVO({
          relationId: relation.relationId,
          type: value.relationType
        });

        if (updatedRelation.relationId) {
          return this.api.relation.update(updatedRelation);
        } else {
          updatedRelation.relationArchiveId = relation.relationArchiveId;
          return this.api.relation.create(updatedRelation);
        }
      })
      .then((response: RelationResponse) => {
        this.messageService.showMessage('Relationship saved successfully.', 'success');
        relation.type = updatedRelation.type;
        if (isNewRelation) {
          relation.relationId = response.getRelationVO().relationId;
        }
        deferred.resolve();
      })
      .catch((response: RelationResponse) => {
        if (response) {
          this.messageService.showError(response.getMessage(), true);
          deferred.reject();
        } else if (isNewRelation) {
          remove(this.relations, relation);
        }
      });
  }

  removeRelation(relation: RelationVO) {
    const deferred = new Deferred();
    let confirmTitle = `Remove relationship with ${relation.RelationArchiveVO.fullName}?`;
    let confirmText = 'Remove';

    if (relation.RelationArchiveVO.archiveId === this.accountService.getArchive().archiveId) {
      confirmTitle = `Decline relationship with ${relation.ArchiveVO.fullName}?`;
      confirmText = 'Decline';
    }

    this.promptService.confirm(confirmText, confirmTitle, deferred.promise, 'btn-danger')
      .then(() => {
        this.api.relation.delete(relation)
        .then((response: RelationResponse) => {
          this.messageService.showMessage(response.getMessage(), 'success', true);
          remove(this.relations, relation);
          remove(this.relationRequests, relation);
          remove(this.sentRelationRequests, relation);
          deferred.resolve();
        })
        .catch((response: RelationResponse) => {
          deferred.resolve();
          this.messageService.showError(response.getMessage(), true);
        });
      })
      .catch(() => {
        deferred.resolve();
      });
  }

}
