import { BaseVO } from '@models/base-vo';

export type ConnectorType =
	| 'type.connector.facebook'
	| 'type.connector.familysearch';

export interface ConnectorOverviewVOData {
	connector_overviewId?: number;
	archiveId?: number;
	lastExecuteDT?: string;
	token?: string;
	userId?: number;
	currentState?: any;
	checkpointDT?: string;
	errorCount?: any;
	type?: ConnectorType;
	status?: 'status.connector.not_setup' | 'status.connector.connected';

	ConnectorFamilysearchVO?: any;
}

export class ConnectorOverviewVO extends BaseVO {
	public connector_overviewId;
	public archiveId;
	public lastExecuteDT;
	public token;
	public userId;
	public currentState;
	public checkpointDT;
	public errorCount;
	public type: ConnectorType;
	public status;

	public ConnectorFamilysearchVO;

	constructor(voData: ConnectorOverviewVOData) {
		super(voData);
	}
}
