import { ShepherdStep } from "../step";
import { AccountDropdownArchives, FamilySearchImportFamilyTree } from "../elements";

export const ImportFamilyTree: ShepherdStep = {
  id: 'importFamilyTree',
  attachTo: FamilySearchImportFamilyTree,
  advanceOn: {
    selector: FamilySearchImportFamilyTree.element,
    event: 'click'
  },
  text: ['You can now import your family tree'],
  buttons: [
    {
      classes: 'btn btn-primary',
      text: 'Awesome!',
      type: 'next'
    }
  ]
};

export const CreateArchivesComplete: ShepherdStep = {
  id: 'importFamilyTreeComplete',
  attachTo: AccountDropdownArchives,
  advanceOn: {
    selector: AccountDropdownArchives.element,
    event: 'click'
  },
  text: ['We made archives for your family tree'],
  buttons: [
    {
      classes: 'btn btn-primary',
      text: 'Wow!',
      type: 'next'
    }
  ],
  
};