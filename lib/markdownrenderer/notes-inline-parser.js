function locator(value, fromIndex) {
  return value.indexOf('Note', fromIndex);
}

const findNotesRegExp = /^(Notes?:.*)/s;
function tokenizer(eat, value, silent) {
  const match = findNotesRegExp.exec(value);
  if (match) {
    if (silent) {
      return true;
    }

    return eat(match[0])({
      type: 'speakerNotes',
      value: '',
    });
  }
}

tokenizer.locator = locator;
tokenizer.notInBlock = true;
tokenizer.notInList = true;
tokenizer.notInLink = true;

module.exports = tokenizer;
