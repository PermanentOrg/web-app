export interface DirectiveTrigger {
  directiveTriggerId: string;
  directiveId: string;
  type: string;
  createdDt: Date;
  updatedDt: Date;
}

export interface Directive {
  directiveId: string;
  archiveId: number;
  type: string;
  createdDt: Date;
  updatedDt: Date;
  trigger: DirectiveTrigger;
  stewardEmail?: string;
  note?: string;
  executionDt?: Date;
}

export interface LegacyContact {
  name: string;
  email: string;
}

export interface DirectiveCreateRequest {
  archiveId: number;
  type: string;
  trigger: {
    type: string;
  };
  stewardEmail?: string;
  note?: string;
}
