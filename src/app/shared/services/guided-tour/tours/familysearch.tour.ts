import { ShepherdStep } from '../step';
import {
  AccountDropdownArchives,
  FamilySearchImportFamilyTree,
} from '../elements';

export const ImportFamilyTree: ShepherdStep = {
  id: 'importFamilyTree',
  attachTo: FamilySearchImportFamilyTree,
  advanceOn: {
    selector: FamilySearchImportFamilyTree.element,
    event: 'click',
  },
  text: ['You can now import your family tree'],
  buttons: [
    {
      classes: 'btn btn-white',
      text: 'Awesome!',
      type: 'next',
    },
  ],
};

export const CreateArchivesComplete: ShepherdStep = {
  id: 'importFamilyTreeComplete',
  attachTo: AccountDropdownArchives,
  advanceOn: {
    selector: AccountDropdownArchives.element,
    event: 'click',
  },
  text: [
    'We’ve created individual Permanent Archives from your existing FamilySearch family tree. Switch archives and navigate to Apps to view imported memories.',
  ],
  buttons: [
    {
      classes: 'btn btn-white',
      text: 'OK!',
      type: 'next',
    },
  ],
};
