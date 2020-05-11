const C_DASH = '-';
const C_NEWLINE = '\n';
const DASH_COUNT = 4;

function tokenizer(eat, value, silent) {
  const character = value.charAt(0);

  if (character !== C_DASH) {
    return;
  }

  const indexEOL = value.indexOf(C_NEWLINE);
  const subvalue = value.substr(0, indexEOL);

  if (subvalue.length !== DASH_COUNT) {
    return;
  }

  if (silent) {
    return true;
  }

  return eat(subvalue)({
    type: 'verticalSlideChange',
    value: '[- - - -| Vertical Slide Change |- - - -]',
  });
}

module.exports = tokenizer;
