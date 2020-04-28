'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import electron from 'electron';
const BrowserWindow = electron.remote.BrowserWindow;

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

  createWindow(url) {
    // TODO: Get different size?
    // TODO: get title from Inkdrop?
    let win = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Presenter Mode',
      webPreferences: {
        nodeIntegration: true,
      },
    });

    // and load the index.html of the app.
    // win.loadURL(
    //   'http://localhost:1948/localFile?filepath=/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md'
    // );
    win.loadURL(url);
    win.on('closed', () => {
      win = null;
    });
  }

  render() {
    // const { showDialog } = this.state;
    return (
      <>
        {/* {showDialog && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              height: '100%',
              width: '100%',
            }}
          >
            <button onClick={() => this.toggle()}>Close</button>
            <button onClick={() => this.postMarkdown()}>Post Markdown</button>
          </div>
        )} */}
      </>
    );
  }

  async postMarkdown() {
    const { editingNote } = inkdrop.store.getState();

    const data = {
      filename: 'eka-testi.md',
      markdown: editingNote.body,
    };

    const response = await fetch('http://localhost:1948/localFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseJson = await response.json();
    // console.log('Response:\n', responseJson);
    // Should be filepath what it returns inside
    const { filepath } = responseJson;
    console.log('filepath from responseJson:', filepath);

    const urlToOpen = `http://localhost:1948/localFile?filepath=${encodeURI(
      filepath
    )}`;
    this.createWindow(urlToOpen);
  }

  async toggle() {
    console.log('RevealMdPresenter was toggled!');
    // TODO: Get the url and show it with webview
    //   const { showDialog } = this.state;
    //   this.setState({ showDialog: !showDialog });

    await this.postMarkdown();
  }
}
