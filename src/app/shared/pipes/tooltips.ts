export const TOOLTIPS = {
  fileList: {
    actions: {
      delete: {
        enabled: 'Delete selected item(s)',
        disabled: 'You do not have permission to delete'
      },
      unshare: {
        enabled: 'Remove the current archive from this share',
        disabled: 'You do not have permission to unshare'
      },
      copy: {
        enabled: 'Copy selected item(s)',
        disabled: 'You do not have permission to copy'
      },
      move: {
        enabled: 'Move selected item(s)',
        disabled: 'You do not have permission to move'
      },
      share: {
        enabled: 'Share selected item',
        disabled: 'You do not have permission to share',
        disabledMulti: 'Items must be shared individually'
      },
      publish: {
        enabled: 'Publish selected item',
        disabled: 'You do not have permission to publish',
        disabledMulti: 'Items must be published individually'
      },
      upload: {
        enabled: 'Upload files and folders to the current folder',
        disabled: 'You do not have permission to upload to the current folder'
      },
      newFolder: {
        enabled: 'Create a new folder in the current folder',
        disabled: 'You do not have permission to create a folder in the current folder'
      }
    },
    sort: {
      name: {
        asc: 'Sort by name (A to Z)',
        desc: 'Sort by name (Z to A)'
      },
      type: {
        asc: 'Sort by type (A to Z)',
        desc: 'Sort by type (Z to A)'
      },
      date: {
        asc: 'Sort by date (earliest to latest)',
        desc: 'Sort by date (latest to earliest)'
      },
      save: 'Save current sort as default for this folder',
      singleCol: 'Choose sort for this folder'
    },
    col: {
      access: 'This archive\'s access level to a shared item',
      archive: 'The archive that shared the item'
    },
    viewToggle: {
      list: 'Switch to list view',
      grid: 'Switch to grid view'
    },
    icons: {
      share: 'This item is shared'
    },
  },
  sidebar: {
    share: {
      disabled: {
        public: 'Items in Public cannot be shared',
        access: 'You do not have permission to manage this share'
      },
    },
    views: {
      disabled: {
        public: 'Views can currently only be applied folders in Public'
      }
    }
  }
};
