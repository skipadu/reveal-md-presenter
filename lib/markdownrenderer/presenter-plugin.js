module.exports = function () {
  const Parser = this.Parser;
  const inlineTokenizers = Parser.prototype.inlineTokenizers;
  const inlineMethods = Parser.prototype.inlineMethods;
  const blockTokenizers = Parser && Parser.prototype.blockTokenizers;
  const blockMethods = Parser && Parser.prototype.blockMethods;

  if (blockTokenizers) {
    blockTokenizers.verticalSlideChange = require('./vertical-slide-change');
    blockMethods.splice(
      blockMethods.indexOf('thematicBreak'),
      0,
      'verticalSlideChange'
    );
  }
  inlineTokenizers.speakerNotes = require('./notes-inline-parser');
  inlineMethods.splice(inlineMethods.indexOf('break'), 0, 'speakerNotes');
};
