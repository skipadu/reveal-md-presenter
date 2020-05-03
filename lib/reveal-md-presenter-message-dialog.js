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
    serverRunning: false,
  };

  constructor(props) {
    super(props);
    this.presenterWindow = undefined;
  }

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
    this.presenterWindow = null;
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
      this.presenterWindow = null;
      console.log('createdWindow closed');
    });
  }

  render() {
    return (
      <>
        {/* TODO: Buttons to UI to stop/close BrowserWindow and the reveal-md server */}
      </>
    );
  }

  // TODO: better name.. :D
  async toggle() {
    const { serverRunning } = this.state;
    console.log('RevealMdPresenter was called! serverRunning: ', serverRunning);
    // We want to save everytime; if reveal-md is already started with the watch-option, it will autoload on our BrowserWindow
    let tmpFileSaveLocation = await this.saveMarkdown();
    console.log('saved to location: ', tmpFileSaveLocation);

    // TODO: maybe check every time if the reveal-md server is running...
    // TODO: maybe better check if the BrowserWindow is still open instead?
    console.log('browserWindow', !!this.presenterWindow);
    if (!serverRunning) {
      const filenamePutToUrl = 'tmpPresentation.md';
      // TODO: port from config
      const urlToOpen = `http://localhost:1948/${filenamePutToUrl}`;
      let revealMdServerResponding = false;
      try {
        const response = await fetch_retry(urlToOpen, 20);
        console.log('response ok?', response.ok);
        console.log('Response when trying to reach web-server:', response);
        revealMdServerResponding = true;
      } catch (err) {
        console.log('Error when checking the urlToOpen: ', err);
      }
      this.setState({ serverRunning: revealMdServerResponding });
      if (revealMdServerResponding) {
        console.log('urlToOpen:', urlToOpen);
        this.createWindow(urlToOpen);
      } else {
        console.error('reveal-md server not started! Some error...?');
      }
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
}
