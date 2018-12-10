import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { RelationVO, FolderVO } from '@models/index';
import { Deferred } from '@root/vendor/deferred';
import { RelationResponse } from '@shared/services/api/index.repo';
import { remove, cloneDeep } from 'lodash';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { RELATIONSHIP_FIELD_INITIAL } from '../prompt/prompt-fields';
import { DataService } from '@shared/services/data/data.service';

const RelationActions: {[key: string]: PromptButton} = {
  Edit: {
    buttonName: 'edit',
    buttonText: 'Edit'
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
  relations: RelationVO[];
  relationOptions: FormInputSelectOption[];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private accountService: AccountService,
    private dataService: DataService,
    private promptService: PromptService,
    private messageService: MessageService,
    private prConstants: PrConstantsService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Relationships',
      pathAsText: ['Relationships'],
      type: 'page'
    }), true);
    this.relations = this.route.snapshot.data.relations;
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
      });
  }

  editRelation(relation: RelationVO) {
    let updatedRelation: RelationVO;
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

        return this.api.relation.update(updatedRelation);
      })
      .then((response: RelationResponse) => {
        this.messageService.showMessage('Relationship saved successfully.', 'success');
        relation.type = updatedRelation.type;
        deferred.resolve();
      })
      .catch((response: RelationResponse) => {
        this.messageService.showError(response.getMessage(), true);
        deferred.reject();
      });
  }

  removeRelation(relation: RelationVO) {
    const deferred = new Deferred();
    const confirmTitle = `Remove relationship with ${relation.RelationArchiveVO.fullName}?`;
    this.promptService.confirm('Remove', confirmTitle, deferred.promise, 'btn-danger')
      .then(() => {
        this.api.relation.delete(relation)
        .then((response: RelationResponse) => {
          this.messageService.showMessage(response.getMessage(), 'success', true);
          remove(this.relations, relation);
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
