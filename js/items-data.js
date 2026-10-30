// Firstlight item/food data (Radix). Kept separate from data.js to avoid merge clashes; can be pasted into data.js later.
window.FL = window.FL || {};
(function (FL) {
  // hunger restore + spoil days (in hand / storage) from design/SYSTEMS.md §7. 0 = never.
  FL.FOOD = {
    Berries: { hunger: 60, spoil: [1, 0] },          // storage berries kept as v0.1 (villagers rely on them)
    'Raw Meat': { hunger: 40, spoil: [0.5, 1], cooksTo: 'Cooked Meat', sick: 1 }, // eating raw costs 1 HP
    'Cooked Meat': { hunger: 80, spoil: [2, 4] },
    'Raw Fish': { hunger: 30, spoil: [0.5, 1], cooksTo: 'Cooked Fish', sick: 1 }, // not obtainable yet (needs Mythorion's water work)
    'Cooked Fish': { hunger: 60, spoil: [2, 4] }
  };
  FL.STACK = { default: 20, Berries: 30, Wood: 30, Fiber: 30, Stone: 20, Torch: 10, 'Flint Axe': 1, 'Flint Spear': 1, 'Hide Wrap': 1, 'Clay Pot': 5, 'Raw Meat': 10, 'Cooked Meat': 10, 'Raw Fish': 10, 'Cooked Fish': 10 };
  FL.INV_SLOTS = 16;
  FL.HUNGER_DAY = 100;   // player hunger lost per full day, same as villagers
  FL.COOK_RANGE = 2.5;   // tiles from a finished campfire
  Object.assign(FL.RES_COLOR = FL.RES_COLOR || {}, { 'Raw Meat': '#c2412f', 'Cooked Meat': '#8a4a24', 'Raw Fish': '#7fa6c2', 'Cooked Fish': '#c29a5a' });
  FL.ITEM_DESC = { Berries: 'Edible. +60 hunger. Spoils after a day in hand.', 'Raw Meat': 'Edible (+40, -1 HP). Cook at a campfire.', 'Cooked Meat': 'Edible. +80 hunger.', Torch: 'Carry light. T places one.' };
})(window.FL);
