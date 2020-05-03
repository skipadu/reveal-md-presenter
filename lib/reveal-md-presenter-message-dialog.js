'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import electron from 'electron';
import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
// import url from 'url';

const BrowserWindow = electron.remote.BrowserWindow;
//TODO: electron.remote.app.on('quit') to close the fork? or does the unmount be enough?

// Is this possible to have it outside the React class?
// Should it be in the React.class's constructor instead?
let createdWindow = null;
let forked = null;

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

  async createWindow(url) {
    // TODO: Get different size?
    // TODO: get title from Inkdrop?
    createdWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Presenter Mode',
    });

    // and load the index.html of the app.
    // win.loadURL(
    //   'http://localhost:1948/localFile?filepath=/Volumes/LaCie/Projektit/inkdrop-jutut/testi.md'
    // );
    try {
      await createdWindow.loadURL(url);
    } catch (err) {
      console.error('Error when loading url. Server not ready yet?', err);
    }
    // TODO: ready to show -event to not get "flickering"? if eveny any happening...
    //
    createdWindow.on('closed', () => {
      if (forked) {
        forked.kill();
        forked = null;
      }
      createdWindow = null;
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

  // TODO: is there some way to do this better?
  // Try again few times even after this???
  // sleepForAwhile() {
  //   return new Promise((resolve) => setTimeout(resolve, 2000));
  // }

  // TODO: better name.. :D
  async toggle() {
    const { serverRunning } = this.state;
    console.log('RevealMdPresenter was called! serverRunning: ', serverRunning);

    let filepath = await this.saveMarkdown();
    console.log('saved to filepath: ', filepath);
    // TODO: Get the server-location from plugin config?
    if (!serverRunning) {
      // filepath =
      //   '/Volumes/LaCie/Projektit/inkdrop-jutut/reveal-md-presenter/lib/turha.md';

      // TODO: cannot use same args and command; need to use those that are possible..
      //
      //
      // TODO: Try to change working directory for reveal-md to work nicely?
      console.log('### working dir BEFORE change: ', process.cwd());
      process.chdir('/Users/sk/Library/Application Support/inkdrop');
      console.log('@@@ working dir AFTER change: ', process.cwd());
      // FIXME: Did not make wonders :(

      //
      //
      //
      const forked = fork(
        '/usr/local/bin/reveal-md',
        ['tmpPresentation.md', '-w', '--disable-auto-open', '--port', '1948'],
        { cwd: '/Users/sk/Library/Application Support/inkdrop/' }
      );

      // const forked = spawn('/usr/local/bin/reveal-md', [
      //   '"/Users/sk/Library/Application Support/inkdrop/tmpPresentation.md"',
      //   '-w',
      //   '--disable-auto-open',
      // ]);

      // const args = [`"${filepath}"`, '-w', '--disable-auto-open'];
      // const args = ['tmpPresentation.md', '-w', '--disable-auto-open'];
      // console.log('args:', args);
      // forked = fork(
      //   '/usr/local/bin/reveal-md',
      //   args
      //   );
      // [
      //   `"${filepath}"`,
      //   '-w',
      //   '--disable-auto-open',
      // ]

      // TODO: get from configure
      // const port = 1948;
      // const revealMdHost = `http://localhost:${port}`;

      // forked.pid
      forked.on('close', (code, signal) => {
        console.log(
          'Close of the forked reveal-md, code & signal',
          code,
          signal
        );
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
      // const filenamePutToUrl = 'turha.md';
      const filenamePutToUrl = 'tmpPresentation.md';
      const urlToOpen = `http://localhost:1948/${filenamePutToUrl}`;
      let isAlive = false;
      try {
        // const response = await fetch(urlToOpen);
        const response = await fetch_retry(urlToOpen, 20);
        console.log('response ok?', response.ok);
        console.log('Response when trying to reach web-server:', response);
        isAlive = true;
      } catch (err) {
        console.log('Error when checking the urlToOpen: ', err);
      }
      if (isAlive) {
        this.setState({ serverRunning: true });
        console.log('urlToOpen:', urlToOpen);

        this.createWindow(urlToOpen);
      } else {
        this.setState({ serverRunning: false });
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
    return filepath;
  }
}
