import { FileFormat, PermanentFile } from './file-vo';

export interface HasFiles {
  FileVOs: PermanentFile[];
}

function getArchivematicaAccess(files: PermanentFile[]) {
  return files.find((file) => file.format === FileFormat.ArchivematicaAccess);
}

function getPrioritizedConvertedFile(files: PermanentFile[]) {
  return files
    .filter((file) => file.format === FileFormat.Converted)
    .sort((a, b) => {
      const preferredType = 'pdf';
      return (
        Number(b.type.includes(preferredType)) -
        Number(a.type.includes(preferredType))
      );
    })[0];
}

export function GetAccessFile(record: HasFiles): PermanentFile | undefined {
  const files = record?.FileVOs ?? [];
  return (
    getArchivematicaAccess(files) ||
    getPrioritizedConvertedFile(files) ||
    files[0]
  );
}
