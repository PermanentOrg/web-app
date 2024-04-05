/* @format */
import { AccessRolePipe } from './access-role.pipe';

describe('GetAltTextPipe', () => {
  let pipe: AccessRolePipe;

  beforeEach(() => {
    pipe = new AccessRolePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns the correct access role for the viewer', () => {
    const value = 'access.role.viewer';
    const result = pipe.transform(value);

    expect(result).toEqual('Viewer');
  });

  it('returns the correct access role for the owner', () => {
    const value = 'access.role.owner';
    const result = pipe.transform(value);

    expect(result).toEqual('Owner');
  });

  it('returns the correct access role for the curator', () => {
    const value = 'access.role.curator';
    const result = pipe.transform(value);

    expect(result).toEqual('Curator');
  });

  it('returns the correct access role for the contributor', () => {
    const value = 'access.role.contributor';
    const result = pipe.transform(value);

    expect(result).toEqual('Contributor');
  });

  it('returns the correct access role for the manager', () => {
    const value = 'access.role.manager';
    const result = pipe.transform(value);

    expect(result).toEqual('Manager');
  });

  it('returns the correct access role for the editor', () => {
    const value = 'access.role.editor';
    const result = pipe.transform(value);

    expect(result).toEqual('Editor');
  });
});
