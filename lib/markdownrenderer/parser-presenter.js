module.exports = function (processor) {
  const Parser = this.Parser;
  const inlineTokenizers = Parser.prototype.inlineTokenizers;
  const inlineMethods = Parser.prototype.inlineMethods;

  // inlineTokenizers.speakerNotes = require('./notes-inline-parser');
  // inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'speakerNotes');
  inlineTokenizers.fourDash = require('./four-dash-inline-parser');
  inlineMethods.splice(inlineMethods.indexOf('html'), 0, 'fourDash');
  inlineTokenizers.threeDash = require('./three-dash-inline-parser');
  inlineMethods.splice(inlineMethods.indexOf('html'), 0, 'threeDash');
  // inlineMethods.splice(0, 0, 'threeDash');
};
