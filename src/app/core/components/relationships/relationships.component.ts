import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { RelationVO } from '@models/index';

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

}
