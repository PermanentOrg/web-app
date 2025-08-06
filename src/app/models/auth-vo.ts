import { BaseVO } from '@models/base-vo';

export class AuthVO extends BaseVO {
	public authId;
	public accountId;
	public archiveId;
	public token;
	public expiresDT;
	public ipAddress;
	public status;
	public type;
}
