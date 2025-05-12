/* @format */
import { FileFormat, PermanentFile } from './file-vo';
import { GetAccessFile, HasFiles } from './get-access-file';

describe('GetAccessFile', () => {
  function makeTestFile(params: Partial<PermanentFile> = {}): PermanentFile {
    return Object.assign(
      {
        fileId: 0,
        size: 0,
        format: FileFormat.Original,
        fileURL: 'test',
        downloadURL: 'test',
        type: 'test',
      },
      params,
    );
  }

  it('should return null for an undefined object being passed in', () => {
    let files: HasFiles;

    expect(GetAccessFile(files)).toBeFalsy();
  });

  it('should return null for an object with no FileVOs', () => {
    expect(GetAccessFile({ files: [] })).toBeFalsy();
  });

  it('should return the only given FileVO', () => {
    expect(
      GetAccessFile({
        files: [makeTestFile()],
      }),
    ).toEqual(makeTestFile());
  });

  it('should prefer archivematica access copies every time', () => {
    const archivematicaFile = makeTestFile({
      format: FileFormat.ArchivematicaAccess,
      fileId: 1,
    });

    expect(
      GetAccessFile({
        files: [
          makeTestFile(),
          makeTestFile({ format: FileFormat.Converted }),
          archivematicaFile,
          makeTestFile(),
          makeTestFile({ format: FileFormat.Converted }),
        ],
      }),
    ).toEqual(archivematicaFile);
  });

  it('should prefer converted copies to original files', () => {
    const convertedFile = makeTestFile({
      format: FileFormat.Converted,
      fileId: 1,
    });

    expect(
      GetAccessFile({
        files: [makeTestFile(), convertedFile, makeTestFile()],
      }),
    ).toEqual(convertedFile);
  });

  it('should prefer pdf converted copies to other converted formats', () => {
    const convertedFile = makeTestFile({
      format: FileFormat.Converted,
      fileId: 1,
      type: 'type.file.pdf.pdfa',
    });

    expect(
      GetAccessFile({
        files: [
          makeTestFile(),
          makeTestFile({ format: FileFormat.Converted, fileId: 2 }),
          convertedFile,
        ],
      }),
    ).toEqual(convertedFile);
  });
});
