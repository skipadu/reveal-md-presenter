'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';

export default class RevealMdPresenterMessageDialog extends React.Component {
  state = {
    showDialog: false,
  };

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this dialog
    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        'reveal-md-presenter:toggle': () => this.toggle(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  showWebviewStuff() {
    // const w = window.innerWidth;
    // const h = window.innerHeight;
    // console.log(`Width: [${w}] Height: [${h}]`);
    // const { editingNote } = inkdrop.store.getState();
    // console.log('editingNote.body:\n', editingNote.body);
    // TODO: generate with reveal-md
    // --> rip off a version where it is inside this plugin instead of having need for the server

    return (
      <webview
        style={{
          display: 'flex',
          flex: 1,
          // height: `${h}px`,
          // width: `${w}px`,
          width: '100%',
          height: '100%',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: 'red',
          margin: '0 auto',
        }}
        allowpopups
        src="http://localhost:1948/localFile?filepath=/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md"
      ></webview>
    );
  }

  render() {
    // const { MessageDialog } = inkdrop.components.classes;
    const { showDialog } = this.state;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // console.log(`Width: [${w}] Height: [${h}]`);
    return (
      // <MessageDialog
      //   ref="dialog"
      //   title="RevealMdPresenter"
      //   style={{
      //     display: 'flex',
      //     flex: 1,
      //     height: `${h}px`,
      //     width: `${w}px`,
      //     borderStyle: 'solid',
      //     borderWidth: 1,
      //     borderColor: 'brown',
      //   }}
      // >
      //   RevealMdPresenter was toggled!
      //   {showDialog && (
      //     <div
      //       style={{
      //         borderStyle: 'solid',
      //         borderWidth: 1,
      //         borderColor: 'blue',
      //       }}
      //     >
      //       <span>Shown only when really shown.. wat?!</span>
      //       {this.showWebviewStuff()}
      //     </div>
      //   )}
      // </MessageDialog>
      <>
        {showDialog && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              height: `${h}px`,
              width: `${w}px`,
            }}
          >
            {this.showWebviewStuff()}
            <button onClick={() => this.toggle()}>Close</button>
            <button onClick={() => this.postMarkdown()}>Post Markdown</button>
          </div>
        )}
      </>
    );
  }

  async postMarkdown() {
    const { editingNote } = inkdrop.store.getState();
    console.log('editingNote.body:\n', editingNote.body);

    const data = {
      filepath: '/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md',
      markdown: editingNote.body,
    };

    const response = await fetch('http://localhost:1948/localFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const derp = await response.text();
    console.log('Response:\n', derp);
    
    // Decoding back to "normal"
    // const text = await Buffer.from(base64Text, 'base64').toString('ascii');
    // console.log('Text: ', text);
  }

  toggle() {
    console.log('RevealMdPresenter was toggled!');
    // TODO: Get the url and show it with webview
    const { showDialog } = this.state;
    this.setState({ showDialog: !showDialog });

    // const { dialog } = this.refs;
    // if (!dialog.isShown) {
    //   dialog.showDialog();
    // } else {
    //   this.setState({ showDialog: false });
    //   dialog.dismissDialog();
    // }
  }
}
