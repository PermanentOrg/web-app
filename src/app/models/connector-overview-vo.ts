import { BaseVO } from '@models/base-vo';

export class ConnectorOverviewVO extends BaseVO {
  public connector_overviewId;
  public archiveId;
  public lastExecuteDT;
  public token;
  public userId;
  public currentState;
  public checkpointDT;
  public errorCount;
  public type;
  public status;
}
