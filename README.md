# reveal-md-presenter

reveal-md-presenter is a plugin for [Inkdrop](https://www.inkdrop.app/)

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

Here are the keys that reveal.js uses (These can not be configured
from the plugin).
- <kbd>F</kbd> = Fullscreen
- <kbd>ESC</kbd> or <kbd>O</kbd> = Overview
- <kbd>S</kbd> = Speaker View
- <kbd>B</kbd> = Take a break

## Licensing

MIT [LICENSE](/LICENSE)