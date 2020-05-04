'use babel';

import RevealMdPresenterMessageDialog from './reveal-md-presenter-message-dialog';

module.exports = {
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
