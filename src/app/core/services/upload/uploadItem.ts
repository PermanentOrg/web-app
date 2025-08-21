import { FolderVO, RecordVO } from '@root/app/models';

export enum UploadStatus {
	Init,
	Meta,
	Transfer,
	Done,
	Cancelled,
}

export class UploadItem {
	public RecordVO: RecordVO;
	public uploadStatus: UploadStatus = UploadStatus.Init;
	public transferProgress = 0;

	constructor(
		public file: File,
		public parentFolder: FolderVO,
	) {
		this.RecordVO = new RecordVO({
			parentFolderId: parentFolder.folderId,
			parentFolder_linkId: parentFolder.folder_linkId,
			displayName: file.name,
			uploadFileName: file.name,
			size: file.size,
			derivedCreatedDT: new Date(file.lastModified),
		});
	}
}
