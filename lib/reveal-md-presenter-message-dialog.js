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
  constructor(props) {
    super(props);
    this.presenterWindow = undefined;
    this.state = {
      isServerRunning: false,
      selectedPort: inkdrop.config.get('reveal-md-presenter.port'),
      tmpFileCreated: inkdrop.config.get('reveal-md-presenter.tmpFileCreated'),
    };

    inkdrop.config.onDidChange(
      'reveal-md-presenter.port',
      ({ newValue, oldValue }) => {
        this.setState({ selectedPort: newValue });
      }
    );

    inkdrop.config.onDidChange(
      'reveal-md-presenter.tmpFileCreated',
      ({ newValue, oldValue }) => {
        this.setState({ tmpFileCreated: newValue });
      }
    );
  }

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        'reveal-md-presenter:show': () => this.showPresenterWindow(),
        'reveal-md-presenter:help': () => this.showHelp(),
        'reveal-md-presenter:copy': () => this.copyCommandToClipboard(),
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
    const filepath = getTempFilepath();
    await fs.promises.writeFile(filepath, markdown, function (err) {
      if (err) {
        console.error(err);
      }
      console.log('Presentation Markdown saved at: ', filepath);
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

  getTempFilepath() {
    // TODO: Get the preferred save location for temp-file from plugin config?
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );
    const filename = 'tmpPresentation.md';
    return path.join(userDataPath, filename);
  }
  // FIXME: call this when first-time-setup (or user resets/changes settings/folder)
  async createTempFileIfNotExisting() {
    const filepath = this.getTempFilepath();
    fs.access(filepath, function (err) {
      if (err) {
        // Does not exist
        fs.writeFile(filepath, 'tmp', function (err) {
          if (err) {
            console.error('Error when tried to save tmp-file');
          } else {
            console.log('Temp file saved at: ', filepath);
          }
        });
      }
    });
  }

  getCommandToCopy() {
    const { selectedPort } = this.state;
    return `reveal-md "${this.getTempFilepath()}" -w --port ${selectedPort} --disable-auto-open`;
  }

  copyCommandToClipboard() {
    electron.clipboard.writeText(this.getCommandToCopy());
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog ref="dialog" title="How to use Presenter Mode">
        <div className="reveal-md-presenter help-dialog">
          <div>
            <h2>To start presentation</h2>
            <p>
              <a href="https://github.com/webpro/reveal-md">reveal-md</a> is
              required to use this plugin.
            </p>
            <p>
              {/* TODO: generate the code based on the config */}
              To start the <b>reveal-md</b>, copy the command below and paste it
              to your terminal/command line and run it.
            </p>
            <div className="code-block ui attached segment">
              <code>{this.getCommandToCopy()}</code>
            </div>
            <button
              className="ui fluid bottom attached positive button"
              onClick={() => this.copyCommandToClipboard()}
            >
              Copy command to clipboard
            </button>
          </div>
          <div className="ui divider"></div>
          <div>
            <h2>Open the Presenter Mode</h2>
            {/* TODO: Able to show the current keymapping here? */}
            <p>
              You can open it from the Plugins-menu or with the shortcut key
            </p>
            <p>
              <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>P</kbd>
            </p>
          </div>
          <div className="ui divider"></div>
          <div>
            <h2>In the Presenter Mode</h2>
            <p>
              Here are the keys that reveal.js uses (These can not be configured
              from the plugin).
            </p>
            <p>
              <kbd>ESC</kbd> or <kbd>O</kbd> = Overview
            </p>
            <p>
              <kbd>S</kbd> = Speaker View
            </p>
            <p>
              <kbd>B</kbd> = Take a break
            </p>
          </div>
        </div>
      </MessageDialog>
    );
  }
}
