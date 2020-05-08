function locator(value, fromIndex) {
  return value.indexOf('Note: ', fromIndex);
}

function tokenizer(eat, value, silent) {
  // TODO: [Note:][until empty line after?]
  const match = /^(Note:)/.exec(value);
  // console.log('tokenizer match', match);
  console.log('tokenizer value', value);
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
