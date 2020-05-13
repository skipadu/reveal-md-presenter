# reveal-md-presenter

reveal-md-presenter is a plugin for [Inkdrop](https://www.inkdrop.app/)

- You can create and show your presentation straight from the Inkdrop!
- It uses [reveal-md](https://github.com/webpro/reveal-md) to show the presentation.

## Install

```
ipm install reveal-md-presenter
```

## Requirements

You need to install [reveal-md](https://github.com/webpro/reveal-md) to your system

Install `reveal-md` globally
```
npm install -g reveal-md
```

## Quick quide

Write your presentation with Inkdrop and using Markdown.

### To make horizontal slide change
```
 ---
```
It is <kbd>Space</kbd> and three dashes <kbd>-</kbd><kbd>-</kbd><kbd>-</kbd>

### To make vertical slide change

```
----
```
It is four dashes <kbd>-</kbd><kbd>-</kbd><kbd>-</kbd><kbd>-</kbd>

### Speaker notes

You can add notes that are shown in speaker notes window, opened with the <kbd>S</kbd>.

You can look [this example presentation](/demo/example.md).

### Keys in the Presenter Mode

When the Presenter Mode is activated and the window is opened.
Everytime you open the Presenter Mode, the presentation will be saved to temporal file. If the Presenter Mode is already open, it just saves and reveal-md's watch options should make sure that the updated presentation is reloaded.

Here are the keys that [reveal.js](https://github.com/hakimel/reveal.js) uses (These can not be configured
from the plugin).
- <kbd>F</kbd> = Fullscreen
- <kbd>ESC</kbd> or <kbd>O</kbd> = Overview
- <kbd>S</kbd> = Speaker View
- <kbd>B</kbd> = Take a break

## Screenshots

![Horizontal slide](/docs/horizontal-slide.png?raw=true "Horizontal slide")

![Vertical slide](/docs/vertical-slide.png?raw=true "Vertical slide")

![Speaker notes](/docs/speaker-notes.png?raw=true "Speaker notes")

## Licensing

MIT [LICENSE](/LICENSE)