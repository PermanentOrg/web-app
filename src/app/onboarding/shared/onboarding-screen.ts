/* @format */
export enum OnboardingScreen {
  welcomeScreen = 'welcomeScreen',
  goals = 'goals',
  done = 'done',
  pendingArchives = 'pendingArchives',
}

export const reasons = [
  {
    tag: 'why:safe',
    text: 'Access to a safe and secure digital storage platform',
  },
  {
    tag: 'why:nonprofit',
    text: 'Supporting a mission-driven nonprofit',
  },
  {
    tag: 'why:genealogy',
    text: 'Preserving family history or genealogy research',
  },
  {
    tag: 'why:professional',
    text: 'Professional business needs/clients',
  },
  {
    tag: 'why:colalborate',
    text: 'Collaborate with a family member, friend, or colleague',
  },
  {
    tag: 'why:digipres',
    text: 'Interest in digital preservation solutions',
  },
];

export const goals = [
  {
    tag: 'goal:capture',
    text: 'Capture and preserve memories for storytelling',
  },
  {
    tag: 'goal:digitize',
    text: 'Digitize or transfer my materials securely',
  },
  {
    tag: 'goal:collaborate',
    text: 'Collaborate with others to build my archive',
  },
  {
    tag: 'goal:publish',
    text: 'Create a public archive to share a legacy',
  },
  {
    tag: 'goal:share',
    text: 'Share my archive with others securely',
  },
  {
    tag: 'goal:legacy',
    text: 'Create a plan for passing on my digital materials ',
  },
  {
    tag: 'goal:organize',
    text: 'Organize my materials',
  },
  {
    tag: 'goal:undefined',
    text: 'Something else',
  },
];

export const archiveOptions = [
  {
    value: 'type.archive.person',
    text: 'Myself',
    type: 'type:myself',
  },
  {
    value: 'type.archive.person',
    text: 'An individual',
    type: 'type:individual',
  },
  {
    value: 'type.archive.family',
    text: 'My family in the present',
    type: 'type:family',
  },
  {
    value: 'type.archive.family',
    text: "My family's history",
    type: 'type:famhist',
  },
  {
    value: 'type.archive.organization',
    text: "A community I'm part of",
    type: 'type:community',
  },
  {
    value: 'type.archive.organization',
    text: 'An organization, company, or nonprofit',
    type: 'type:org',
  },
  {
    value: 'type.archive.person',
    text: 'Something else',
    type: 'type:other',
  },
  {
    value: 'type.archive.person',
    text: "I'm not sure yet",
    type: 'type:unsure',
  },
];

export const archiveDescriptions = {
  'type:myself': 'Create an archive that captures my personal life journey.',
  'type:individual':
    'Create an archive that captures an individual person’s life journey other than your own.',
  'type:family': 'Create an archive that captures my family life.',
  'type:famhist':
    'Create an archive that preserves the memory of my ancestors, family history, or genealogy.',
  'type:community':
    'Create an archive that preserves the history of a community, group, or other association of people.',
  'type:org':
    'Create an archive that preserves the history of an organization or nonprofit.',
  'type:other': '',
  'type:unsure': '',
};
