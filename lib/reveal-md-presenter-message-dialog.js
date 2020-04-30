'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import electron from 'electron';
import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
// import util from 'util';
// const fork = util.promisify(require('child_process').fork);

const BrowserWindow = electron.remote.BrowserWindow;

// Is this possible to have it outside the React class?
// Should it be in the React.class's constructor instead?
let createdWindow = null;

let forked = null;

export default class RevealMdPresenterMessageDialog extends React.Component {
  state = {
    serverRunning: false,
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
    createdWindow = null;
    if (forked) {
      forked.kill();
      forked = null;
    }
    this.subscriptions.dispose();
  }

  createWindow(url) {
    // TODO: Get different size?
    // TODO: get title from Inkdrop?
    createdWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Presenter Mode',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    // and load the index.html of the app.
    // win.loadURL(
    //   'http://localhost:1948/localFile?filepath=/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md'
    // );
    createdWindow.loadURL(url);
    createdWindow.on('closed', () => {
      if (forked) {
        forked.kill();
        forked = null;
      }
      createdWindow = null;
    });
  }

  render() {
    return (
      <>
        {/* TODO: Buttons to UI to stop/close BrowserWindow and the reveal-md server */}
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

    //
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );
    const thePath = path.join(userDataPath, 'kissa.md');
    console.log('thePath of the paths to save Markdown is: ', thePath);
    //
    this.createWindow(urlToOpen);
  }

  sleepForAwhile() {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // TODO: better name.. :D
  async toggle() {
    const { serverRunning } = this.state;
    console.log('RevealMdPresenter was called! serverRunning: ', serverRunning);

    let filepath = await this.saveMarkdown();
    console.log('saved to filepath: ', filepath);
    // TODO: Get the server-location from plugin config?
    if (!serverRunning) {
      this.setState({ serverRunning: true });

      // Start reveal-md child process with the given filepath --> watch-mode option given
      // FIXME: MAybe not possible top open child process from the plugin...
      // TODO: override for testing

      filepath =
        '/Volumes/LaCie/Projektit/inkdrop-jutut/reveal-md-presenter/lib/turha.md';

      // FIXME: "Worked" but promise never returned?..or what will the promise return?
      // should return when it is ready
      //
      // const forked = await fork(
      //   '/usr/local/bin/reveal-md',
      //   [filepath, '-w', '--disable-auto-open'],
      //   {}
      // );

      // FIXME: should kill it
      forked = fork('/usr/local/bin/reveal-md', [
        `${filepath}`,
        '-w',
        '--disable-auto-open',
      ]);
      await this.sleepForAwhile();
      // forked.stdout.on('data', (data) => {
      //   console.log('forked.stdout: ', data);
      // });
      // forked.stderr.on('data', (data) => {
      //   console.error('forked.stderr: ', data);
      // });
      // forked.pid
      forked.on('close', () => {
        console.log('Close of the forked reveal-md');
        electron.remote.shell.beep();
      });
      forked.on('exit', () => {
        this.setState({ serverRunning: false });
      });
      forked.on('error', (err) => {
        console.error('Error on forked reveal-md', err);
      });
      forked.on('message', (msg) => {
        console.log('Message from forked reveal-md', msg);
      });
      //
      //
      // TODO: When reveal-md is up and running create BrowserWindow with this url to see the actual presentation
      // TODO: how to know when it is ready?
      // TODO: how to get working on windows...?

      // const filename = 'turha.md';
      // const filename =
      //   '/Volumes/LaCie/Projektit/inkdrop-jutut/reveal-md-presenter/lib/turha.md';
      // const urlToOpen = `http://localhost:1948/${filepath}`;
      const filenamePutToUrl = 'turha.md';
      const urlToOpen = `http://localhost:1948/${filenamePutToUrl}`;
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
    return filepath;
  }
}
