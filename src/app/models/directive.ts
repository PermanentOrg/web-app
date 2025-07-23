export interface DirectiveTrigger {
	directiveTriggerId: string;
	directiveId: string;
	type: string;
	createdDt: Date;
	updatedDt: Date;
}

export interface ArchiveSteward {
	name?: string;
	email: string;
}

export interface DirectiveData {
	directiveId: string;
	archiveId: number;
	type: string;
	createdDt: Date;
	updatedDt: Date;
	trigger: DirectiveTrigger;
	steward?: ArchiveSteward;
	note?: string;
	executionDt?: Date;
}

export class Directive implements DirectiveData {
	public directiveId: string = '';
	public archiveId: number;
	public type: string;
	public createdDt: Date;
	public updatedDt: Date;
	public trigger: DirectiveTrigger;
	public steward: ArchiveSteward;
	public note: string;
	public executionDt: Date | null;

	constructor(data: any) {
		for (const key in data) {
			if (data[key] !== undefined && typeof data[key] !== 'function') {
				this[key] = data[key];
			}
		}
	}
}

export interface LegacyContact {
	legacyContactId?: string;
	accountId?: string;
	name: string;
	email: string;
}

export interface DirectiveCreateRequest {
	archiveId: string | number;
	type: string;
	trigger: {
		type: string;
	};
	stewardEmail?: string;
	note?: string;
}

export interface DirectiveUpdateRequest {
	directiveId: string;
	note?: string;
	stewardEmail?: string;
}
