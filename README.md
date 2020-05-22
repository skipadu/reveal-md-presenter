# reveal-md-presenter

reveal-md-presenter is a plugin for [Inkdrop](https://www.inkdrop.app/)

- You can create and show your presentation straight from the Inkdrop!
- It uses [reveal-md](https://github.com/webpro/reveal-md) to show the presentation.

## Install

```
ipm install reveal-md-presenter
```

## Next steps


### 1.) Install reveal-md
You need to install [reveal-md](https://github.com/webpro/reveal-md) to your system

Install `reveal-md` globally
```
npm install -g reveal-md
```

### 1b.) Manual start of reveal-md
If you are using Windows, you need to start `reveal-md` manually. Or if you are using macOS and want to start it manually for some reason.

1. First enable manual start from the plugin's config.

2. Then you will need to start the `reveal-md` with the generated start command. You can get it copied to your clipboard by selecting the **"Copy start command"** from the plugins menu or by pressing the shortcut <kbd>Ctrl</kbd>+<kbd>Opt</kbd><kbd>C</kbd>.

3. Paste the start command to your terminal and start it.

### 2.) Start making the presentation

Now you are ready to write your presentation in the Inkdrop.

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

![Horizontal slide](https://raw.githubusercontent.com/skipadu/reveal-md-presenter/master/docs/horizontal-slide.png "Horizontal slide")

![Vertical slide](https://raw.githubusercontent.com/skipadu/reveal-md-presenter/master/docs/vertical-slide.png "Vertical slide")

![Speaker notes](https://raw.githubusercontent.com/skipadu/reveal-md-presenter/master/docs/speaker-notes.png "Speaker notes")

## Licensing

MIT [LICENSE](https://raw.githubusercontent.com/skipadu/reveal-md-presenter/master/LICENSE)
