'use babel';

import { markdownRenderer } from 'inkdrop';
import RevealMdPresenterMessageDialog from './reveal-md-presenter-message-dialog';
import presenterPlugin from './markdownrenderer/presenter-plugin';
import HorizontalSlideChange from './markdownrenderer/horizontal-slide-change';
let originalHrComponent = null;

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
      originalHrComponent = markdownRenderer.remarkReactComponents.hr;
      markdownRenderer.remarkPlugins.push(presenterPlugin);
      markdownRenderer.remarkReactComponents.hr = HorizontalSlideChange;
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
      const i = remarkPlugins.indexOf(presenterPlugin);

      if (i >= 0) {
        remarkPlugins.splice(i, 1);
      }

      if (originalHrComponent) {
        markdownRenderer.remarkReactComponents.hr = originalHrComponent;
      } else if (remarkReactComponents.hr === HorizontalSlideChange) {
        delete remarkReactComponents.hr;
      }
    }
  },
};
