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
  stewardAccountId?: number;
  note?: string;
  executionDt?: Date;
}
