'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import electron from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import fixPath from 'fix-path';
import commandExists from 'command-exists';

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

export default class RevealMdPresenterUI extends React.Component {
  constructor(props) {
    super(props);
    this.presenterWindow = undefined;
    this.spawnedRevealMd = undefined;
    this.state = {
      isServerRunning: false,
      selectedPort: inkdrop.config.get('reveal-md-presenter.port'),
      showCopyNotification: inkdrop.config.get(
        'reveal-md-presenter.showCopyNotification'
      ),
    };

    inkdrop.config.onDidChange(
      'reveal-md-presenter.port',
      ({ newValue, oldValue }) => {
        this.setState({ selectedPort: newValue });
      }
    );
    inkdrop.config.onDidChange(
      'reveal-md-presenter.showCopyNotification',
      ({ newValue, oldValue }) => {
        this.setState({ showCopyNotification: newValue });
      }
    );

    this.createTempFileIfNotExisting();
  }

  componentWillMount() {
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
    if (this.spawnedRevealMd) {
      this.spawnedRevealMd.kill('SIGINT');
      this.spawnedRevealMd = undefined;
    }
  }

  async createWindow() {
    // TODO: Get different size?
    this.presenterWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Presenter Mode',
    });

    try {
      await this.presenterWindow.loadURL(this.urlToOpen());
    } catch (err) {
      console.error(
        'BrowserWindow: Error when loading url. Server not ready yet?',
        err
      );
    }
    this.presenterWindow.on('closed', () => {
      this.presenterWindow = undefined;
      if (this.spawnedRevealMd) {
        this.spawnedRevealMd.kill('SIGINT');
        this.spawnedRevealMd = undefined;
      }
    });
  }

  urlToOpen() {
    const { selectedPort } = this.state;
    const filenamePutToUrl = 'tmpPresentation.md';
    return `http://localhost:${selectedPort}/${filenamePutToUrl}`;
  }

  async revealMdRunning() {
    try {
      await fetch_retry(this.urlToOpen(), 5);
      return true;
    } catch (err) {
      console.error('Error when checking the urlToOpen: ', err);
      return false;
    }
  }

  startRevealMd() {
    const { selectedPort } = this.state;
    this.spawnedRevealMd = spawn('reveal-md', [
      `${this.getTempFilepath()}`,
      '-w',
      '--port',
      `${selectedPort}`,
      '--disable-auto-open',
    ]);
    this.spawnedRevealMd.stdout.on('data', (data) => {
      console.log('reveal-md stdout:', data.toString());
    });
    this.spawnedRevealMd.stderr.on('data', (data) => {
      console.log('reveal-md stderr:', data.toString());
    });
    this.spawnedRevealMd.on('close', (code) => {
      console.log('reveal-md process exited with code: ', code);
    });
  }

  async revealMdCommandFound() {
    return new Promise((resolve, reject) => {
      commandExists('reveal-md', function (err, commandExists) {
        if (err) {
          console.log('Error when tried to find location of reveal-md', err);
          reject(err);
        }
        resolve(commandExists);
      });
    });
  }

  async showPresenterWindow() {
    await this.saveMarkdown();
    fixPath();
    let isRevealMdCommandFound = await this.revealMdCommandFound();
    if (!isRevealMdCommandFound) {
      console.error('reveal-md command was not found!');
      inkdrop.notifications.addError('reveal-md is not installed?', {
        detail: 'Open the Help-dialog to see instructions',
        dismissable: true,
      });
    } else {
      let revealMdRunning = await this.revealMdRunning();
      if (!revealMdRunning) {
        this.startRevealMd();
        revealMdRunning = await this.revealMdRunning();
        if (!revealMdRunning) {
          console.error('reveal-md server not responding!');
          inkdrop.notifications.addError('Could not connect to reveal-md', {
            detail: 'Open the Help-dialog to see instructions',
            dismissable: true,
          });
        }
      }
      this.setState({ isServerRunning: revealMdRunning });

      if (this.state.isServerRunning && this.presenterWindow === undefined) {
        this.createWindow();
      }
    }
  }

  /**
   *
   * @param {string} text - Markdown where the horizontal and vertical slide change indicators are "cleaned"
   * @returns { string } Returns the sanitized Markdown
   */
  convertDashes(text) {
    return text.replace(/( -{3})+\n/g, '---').replace(/( -{4})+\n/g, '----');
  }

  async saveMarkdown() {
    const { editingNote } = inkdrop.store.getState();
    const { body: markdown } = editingNote;
    const filepath = this.getTempFilepath();
    const convertedText = this.convertDashes(markdown);
    await fs.promises.writeFile(filepath, convertedText, function (err) {
      if (err) {
        console.error('Error when tried to save Markdown', err);
      }
      console.info('Presentation Markdown saved at: ', filepath);
    });
    return filepath;
  }

  showHelp() {
    const { helpDialog } = this.refs;

    if (!helpDialog.isShown) {
      helpDialog.showDialog();
    } else {
      helpDialog.dismissDialog();
    }
  }

  getTempFilepath() {
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );
    const filename = 'tmpPresentation.md';
    return path.join(userDataPath, filename);
  }

  async createTempFileIfNotExisting() {
    const filepath = this.getTempFilepath();
    fs.access(filepath, function (err) {
      if (err) {
        // Does not exist
        fs.writeFile(filepath, 'tmp', function (err) {
          if (err) {
            console.error('Error when tried to save tmp-file');
          } else {
            console.info('Temp file saved at: ', filepath);
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
    if (this.state.showCopyNotification) {
      inkdrop.notifications.addSuccess('Start command copied!', {
        detail:
          'Open the terminal and start the reveal-md with the command copied to your cliboard',
        dismissable: true,
      });
    }
  }

  render() {
    const { MessageDialog: HelpDialog } = inkdrop.components.classes;
    return (
      <HelpDialog ref="helpDialog" title="How to use Presenter Mode">
        <div className="reveal-md-presenter help-dialog">
          <div>
            <h2>To start presentation</h2>
            <p>
              <a href="https://github.com/webpro/reveal-md">reveal-md</a> is
              required to use this plugin.
            </p>
            <p>
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
              Copy start command to clipboard
            </button>
          </div>
          <div className="ui divider"></div>
          <div>
            <h2>Open the Presenter Mode</h2>
            <p>
              Everytime you open the Presenter Mode, the presentation will be
              saved to temporal file. If the Presenter Mode is already open, it
              just saves and reveal-md's watch options should make sure that the
              updated presentation is reloaded.
            </p>
            <p>
              You can open it from the Plugins-menu or with the shortcut key
              (default)
            </p>
            {/* TODO: Able to show the current keymapping here? */}
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
              <kbd>F</kbd> = Fullscreen
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
      </HelpDialog>
    );
  }
}
