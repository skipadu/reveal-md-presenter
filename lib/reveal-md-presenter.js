'use babel';

import RevealMdPresenterMessageDialog from './reveal-md-presenter-message-dialog';

module.exports = {
  config: {
    port: {
      title: 'Port to use with reveal-md (default 1948)',
      type: 'integer',
      default: 1948,
      minimum: 0,
    },
    tmpFileCreated: {
      title: 'Temporal file for saving presentations to is created',
      type: 'boolean',
      default: false,
    }
  },
  activate() {
    inkdrop.components.registerClass(RevealMdPresenterMessageDialog);
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'RevealMdPresenterMessageDialog'
    );
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'RevealMdPresenterMessageDialog'
    );
    inkdrop.components.deleteClass(RevealMdPresenterMessageDialog);
  },
};
