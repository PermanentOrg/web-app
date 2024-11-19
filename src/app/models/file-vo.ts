export const enum FileFormat {
  Original = 'file.format.original',
  Converted = 'file.format.converted',
  ArchivematicaAccess = 'file.format.archivematica.access',
}

export interface PermanentFile {
  fileId: number;
  size: number;
  format: FileFormat;
  parentFileId?: number;
  fileURL: string;
  downloadURL: string;
  type: string;
}
