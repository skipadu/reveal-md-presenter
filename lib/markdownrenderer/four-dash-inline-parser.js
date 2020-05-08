function locator(value, fromIndex) {
  // return value.indexOf('----', fromIndex);
  return value.indexOf('|||', fromIndex);
}

function tokenizer(eat, value, silent) {
  // [space][dash][dash][dash][dash][space OR lineChange]
  // const match = /^( -{3}(\n| ))/.exec(value);
  // FIXME: now using three = and telling reveal-md to use the same...
  // Would like to use the default
  const match = /^(\|{3})/.exec(value);
  if (match) {
    if (silent) {
      return true;
    }

    const verticalSlide = '--- Vertical slide ---';

    return eat(match[0])({
      type: 'fourDash',
      value: verticalSlide,
    });
  }
}

tokenizer.locator = locator;
tokenizer.notInBlock = true;
tokenizer.notInList = true;
tokenizer.notInLink = true;

module.exports = tokenizer;
