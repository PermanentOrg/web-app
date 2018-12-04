import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { RelationVO } from '@models/index';

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

@Component({
  selector: 'pr-relationships',
  templateUrl: './relationships.component.html',
  styleUrls: ['./relationships.component.scss']
})
export class RelationshipsComponent implements OnInit {
  relations: RelationVO[];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private accountService: AccountService,
    private promptService: PromptService,
    private messageService: MessageService
  ) {
    this.relations = this.route.snapshot.data.relations;
  }

  ngOnInit() {
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

  }

  removeRelation(relation: RelationVO) {
    if (confirm('Are you sure you want to remove this relationship?')) {
      this.api.relation.delete(relation);
    }
  }

}
