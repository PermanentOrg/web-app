import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models';

@Pipe({
	name: 'publicRoute',
	standalone: false,
})
export class PublicRoutePipe implements PipeTransform {
	transform(value: RecordVO | FolderVO, _?: any): any[] {
		const rootArchive = this.getPublicArchiveNbr(value);
		if (value instanceof RecordVO) {
			const route = ['/p', 'archive', rootArchive];
			const parentFolder = this.getFirstParentFolder(value);
			if (parentFolder && this.isNotPublicRoot(parentFolder)) {
				route.push(
					parentFolder.archiveNbr,
					parentFolder.folder_linkId.toString(),
				);
			} else if (
				value.parentFolderArchiveNumber &&
				value.parentFolder_linkId &&
				rootArchive !== value.parentFolderArchiveNumber
			) {
				route.push(value.parentFolderArchiveNumber, value.parentFolder_linkId);
			}
			route.push('record', value.archiveNbr);
			return route;
		} else {
			return [
				'/p',
				'archive',
				rootArchive,
				value.archiveNbr,
				value.folder_linkId,
			];
		}
	}

	private getFirstParentFolder(
		object: RecordVO | FolderVO,
	): FolderVO | undefined {
		const parentFolders = object.ParentFolderVOs as FolderVO[];
		if (parentFolders && parentFolders.length > 0) {
			return parentFolders[0];
		}
	}

	private getPublicArchiveNbr(value: RecordVO | FolderVO): string {
		if (value.archiveArchiveNbr) {
			return value.archiveArchiveNbr;
		}
		const parentFolder = this.getFirstParentFolder(value);
		if (parentFolder && parentFolder.archiveArchiveNbr) {
			return parentFolder.archiveArchiveNbr;
		}
		return value.archiveNbr.split('-')[0] + '-0000';
	}

	private isNotPublicRoot(folder: FolderVO): boolean {
		return (
			folder.folder_linkType !== 'type.folder_link.root.public' &&
			folder.type !== 'type.folder.root.public'
		);
	}
}
