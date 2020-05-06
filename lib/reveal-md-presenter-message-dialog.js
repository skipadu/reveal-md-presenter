'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import electron from 'electron';
import path from 'path';
import fs from 'fs';

const BrowserWindow = electron.remote.BrowserWindow;

function sleepFor(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const fetch_retry = async (url, retries) => {
  try {
    return await fetch(url);
  } catch (err) {
    if (retries === 1) throw err;
    await sleepFor(1000);
    return await fetch_retry(url, retries - 1);
  }
};

export default class RevealMdPresenterMessageDialog extends React.Component {
  state = {
    isServerRunning: false,
  };

  constructor(props) {
    super(props);
    this.presenterWindow = undefined;
  }

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        'reveal-md-presenter:show': () => this.showPresenterWindow(),
        'reveal-md-presenter:help': () => this.showHelp(),
      })
    );
  }

  componentWillUnmount() {
    if (this.presenterWindow) {
      this.presenterWindow.close();
    }
    this.presenterWindow = undefined;
    this.subscriptions.dispose();
  }

  async createWindow(url) {
    // TODO: Get different size?
    this.presenterWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Presenter Mode',
    });

    try {
      await this.presenterWindow.loadURL(url);
    } catch (err) {
      console.error('Error when loading url. Server not ready yet?', err);
    }
    // TODO: ready to show -event to not get "flickering"? if eveny any happening...
    //
    this.presenterWindow.on('closed', () => {
      this.presenterWindow = undefined;
      console.log('createdWindow closed');
    });
  }

  async showPresenterWindow() {
    console.log(
      '#1 RevealMdPresenter was called! serverRunning: ',
      this.state.isServerRunning
    );
    // We want to save everytime; if reveal-md is already started with the watch-option, it will autoload on our BrowserWindow
    let tmpFileSaveLocation = await this.saveMarkdown();
    console.log('saved to location: ', tmpFileSaveLocation);

    // TODO: Checking if reveal-md server is up and running.
    // maybe not need to check every single time... making it from the settings after first time
    const filenamePutToUrl = 'tmpPresentation.md';
    const urlToOpen = `http://localhost:1948/${filenamePutToUrl}`;
    if (!this.state.isServerRunning) {
      // TODO: port from config
      let revealMdServerResponding = false;
      try {
        const response = await fetch_retry(urlToOpen, 20);
        console.log('response ok?', response.ok);
        console.log('Response when trying to reach web-server:', response);
        revealMdServerResponding = true;
      } catch (err) {
        console.log('Error when checking the urlToOpen: ', err);
      }
      this.setState({ isServerRunning: revealMdServerResponding });
      if (!revealMdServerResponding) {
        // TODO: show something to the UI
        console.error('reveal-md server not started! Some error...?');
      }
    }
    console.log(
      '#2 RevealMdPresenter was called! serverRunning: ',
      this.state.isServerRunning
    );
    if (this.state.isServerRunning && this.presenterWindow === undefined) {
      // We need to create the BrowserWindow
      console.log('urlToOpen:', urlToOpen);
      this.createWindow(urlToOpen);
    }
  }

  async saveMarkdown() {
    const { editingNote } = inkdrop.store.getState();
    const { body: markdown } = editingNote;

    // TODO: Get the preferred save location for temp-file from plugin config?
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );
    const filename = 'tmpPresentation.md';
    const filepath = path.join(userDataPath, filename);
    // TODO: Handle the case when this fails...
    await fs.promises.writeFile(filepath, markdown, function (err) {
      if (err) {
        console.error(err);
      }
      console.log('File created at: ', filepath);
    });

    // TODO: could generated the reveal-md start command with this, e.g
    // TODO: port from config
    const previewFilepath = `reveal-md "${filepath}" -w --disable-auto-open --port 1948`;
    console.log('previewFilePath to show on UI: ', previewFilepath);
    return filepath;
  }

  showHelp() {
    const { dialog } = this.refs;
    if (!dialog.isShown) {
      dialog.showDialog();
    } else {
      dialog.dismissDialog();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog ref="dialog" title="How to use Presenter Mode">
        <div className="reveal-md-presenter help-dialog">
          <h2>Steps</h2>
          <ul className="ui list">
            <li>
              <a href="https://github.com/webpro/reveal-md">reveal-md</a> is
              required to use this plugin
            </li>
            <li>
              {/* TODO: generate the code based on the config */}
              To start the reveal-md, copy this command to your terminal/command
              line and run it
              <div className="code-block">
                <code>
                  reveal-md "/Users/username/Library/Application
                  Support/inkdrop/tmpPresentation.md" -w --port 1948
                  --disable-auto-open
                </code>
              </div>
              <button
                className="ui button"
                onClick={() =>
                  electron.clipboard.writeText('testi tekstiä leikepöydällä')
                }
              >
                Copy command to clipboard
              </button>
            </li>
            <li>
              Keys in Presenter Mode
              <ul className="ui list">
                <li>
                  <kbd>ESC</kbd> or <kbd>O</kbd> = Overview
                </li>
                <li>
                  <kbd>S</kbd> = Speaker View
                </li>
                <li>
                  <kbd>B</kbd> = Take a break
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </MessageDialog>
    );
  }
}
