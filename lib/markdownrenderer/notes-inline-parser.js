function locator(value, fromIndex) {
  return value.indexOf('Note', fromIndex);
}

// const findNotesRegExp = /^(?:Notes|Note:.+\n)(?:.+\n)+/;
const findNotesRegExp = /^((?:Notes|Note:.+\n)(?:.+\n)+(.*$))/;
function tokenizer(eat, value, silent) {
  // TODO: [Note:][until empty line after?]
  console.log('tokenizer value', value);
  const match = findNotesRegExp.exec(value);
  console.log('tokenizer match', match);
  if (match) {
    if (silent) {
      return true;
    }


    return eat(match[0])({
      type: 'threeDash',
      value: 'lollero',
    });
  }
}

tokenizer.locator = locator;
tokenizer.notInBlock = true;
tokenizer.notInList = true;
tokenizer.notInLink = true;

module.exports = tokenizer;
