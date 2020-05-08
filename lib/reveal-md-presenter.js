'use babel';

import { markdownRenderer } from 'inkdrop';
import RevealMdPresenterMessageDialog from './reveal-md-presenter-message-dialog';
import parserPresenter from './markdownrenderer/parser-presenter';
// import ReactThreeDash from './markdownrenderer/react-three-dash';
// let originalHrComponent = null;

module.exports = {
  config: {
    port: {
      title: 'Port to use with reveal-md (default 1948)',
      type: 'integer',
      default: 1948,
      minimum: 0,
    },
  },
  activate() {
    inkdrop.components.registerClass(RevealMdPresenterMessageDialog);
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'RevealMdPresenterMessageDialog'
    );

    if (markdownRenderer) {
      // originalHrComponent = markdownRenderer.remarkCodeComponents.hr;
      markdownRenderer.remarkPlugins.push(parserPresenter);
      // markdownRenderer.remarkCodeComponents.hr = ReactThreeDash;
    }
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'RevealMdPresenterMessageDialog'
    );
    inkdrop.components.deleteClass(RevealMdPresenterMessageDialog);

    if (markdownRenderer) {
      const { remarkPlugins } = markdownRenderer;
      const i = remarkPlugins.indexOf(parserPresenter);

      if (i >= 0) {
        remarkPlugins.splice(i, 1);
      }

      // if (originalHrComponent) {
      //   markdownRenderer.remarkCodeComponents.hr = originalHrComponent;
      // } else if (remarkCodeComponents.hr === ReactThreeDash) {
      //   delete remarkCodeComponents.hr;
      // }
    }
  },
};
