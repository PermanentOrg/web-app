import { ShepherdStep } from "../step";
import { AccountDropdownArchives, FamilySearchImportFamilyTree } from "../elements";

export const ImportFamilyTreeStep: ShepherdStep = {
  id: 'importFamilyTree',
  attachTo: FamilySearchImportFamilyTree,
  text: ['You can now import your family tree'],
  buttons: [
    {
      classes: 'btn btn-primary',
      text: 'Awesome!',
      type: 'next'
    }
  ]

};