'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import NewWindow from 'react-new-window';

export default class RevealMdPresenterMessageDialog extends React.Component {
  state = {
    markdownUrl: undefined,
  };

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        'reveal-md-presenter:show': () => this.show(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  render() {
    const { markdownUrl } = this.state;

    return !!markdownUrl && <NewWindow url={markdownUrl}></NewWindow>;
  }

  // TODO: should be able to handle the update; when user wants to see updated version...
  // watch mode on to reveal-md?
  show() {
    console.log('RevealMdPresenter.show() was called!');
    // TODO: Get filepath from Inkdrop
    this.setState({
      markdownUrl:
        'http://localhost:1948/localFile?filepath=/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md',
    });
  }
}
