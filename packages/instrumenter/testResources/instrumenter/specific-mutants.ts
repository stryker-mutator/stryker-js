const a = 1 + 1;
const b = 1 - 1;

if (a === 2 && b === 0) {
  console.log('a');
}

if (a === 2 && b === 0) {
  console.log('b');
}

const itemWithLongName = {
  longPropertyName1: 1,
  longPropertyName2: 2,
  longPropertyName3: 3,
};

const item = () =>
  itemWithLongName.longPropertyName1 === itemWithLongName.longPropertyName2 &&
  itemWithLongName.longPropertyName1 === itemWithLongName.longPropertyName3;
