import type { Plant } from '../types'

export const DEFAULT_PLANTS: Omit<Plant, 'id' | 'isCustom'>[] = [
  // Tomatoes — all need a 2×2 ft cage footprint per SFG method
  { name: 'Tomato (Indeterminate)', spacingDensity: 1, footprintFt: 2, daysToHarvest: 75, indoorStartWeeks: 6, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#e74c3c', notes: 'Stake or cage. Pinch suckers for larger fruit.' },
  { name: 'Tomato (Determinate)', spacingDensity: 1, footprintFt: 2, daysToHarvest: 65, indoorStartWeeks: 6, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#c0392b', notes: 'Bush type. Good for canning.' },
  { name: 'Cherry Tomato', spacingDensity: 1, footprintFt: 2, daysToHarvest: 60, indoorStartWeeks: 6, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#ff6b6b', notes: 'Very productive. Great in containers.' },
  // Peppers
  { name: 'Bell Pepper', spacingDensity: 1, daysToHarvest: 70, indoorStartWeeks: 8, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#f39c12', notes: 'Start indoors early. Needs warm soil.' },
  { name: 'Hot Pepper', spacingDensity: 1, daysToHarvest: 75, indoorStartWeeks: 8, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#e67e22', notes: 'More heat = more capsaicin.' },
  // Eggplant
  { name: 'Eggplant', spacingDensity: 1, daysToHarvest: 75, indoorStartWeeks: 8, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#8e44ad', notes: 'Loves heat. Keep well watered.' },
  // Squash — 1 plant per 2×2 ft per SFG method
  { name: 'Zucchini', spacingDensity: 1, footprintFt: 2, daysToHarvest: 55, indoorStartWeeks: 0, transplantWeeksAfterFrost: 1, sunRequirement: 'full-sun', color: '#27ae60', notes: 'Prolific producer. Harvest when small.' },
  { name: 'Yellow Summer Squash', spacingDensity: 1, footprintFt: 2, daysToHarvest: 50, indoorStartWeeks: 0, transplantWeeksAfterFrost: 1, sunRequirement: 'full-sun', color: '#f1c40f', notes: 'Harvest young for best flavor.' },
  { name: 'Butternut Squash', spacingDensity: 1, footprintFt: 2, daysToHarvest: 110, indoorStartWeeks: 0, transplantWeeksAfterFrost: 1, sunRequirement: 'full-sun', color: '#e5a847', notes: 'Needs lots of space. Cure after harvest.' },
  { name: 'Pumpkin', spacingDensity: 1, footprintFt: 2, daysToHarvest: 100, indoorStartWeeks: 0, transplantWeeksAfterFrost: 1, sunRequirement: 'full-sun', color: '#d35400', notes: 'Plant after frost. Needs ample space.' },
  // Cucumbers — 2/sqft on trellis per SFG method
  { name: 'Cucumber (Bush)', spacingDensity: 2, daysToHarvest: 55, indoorStartWeeks: 0, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#2ecc71', notes: 'Compact bush type. Good for small spaces.' },
  { name: 'Cucumber (Vining)', spacingDensity: 2, daysToHarvest: 60, indoorStartWeeks: 0, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#1abc9c', notes: 'Train up trellis to save space.' },
  // Brassicas
  { name: 'Broccoli', spacingDensity: 1, daysToHarvest: 80, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#1e8449', notes: 'Cool season crop. Plant early or fall.' },
  { name: 'Cauliflower', spacingDensity: 1, daysToHarvest: 85, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#d5dbdb', notes: 'Blanch heads by folding leaves over.' },
  { name: 'Cabbage', spacingDensity: 1, daysToHarvest: 80, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#a9dfbf', notes: 'Cool season. Harvest before it splits.' },
  { name: 'Kale', spacingDensity: 1, daysToHarvest: 55, indoorStartWeeks: 4, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#1a5276', notes: 'Frost improves flavor. Harvest outer leaves.' },
  { name: 'Brussels Sprouts', spacingDensity: 1, daysToHarvest: 100, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#145a32', notes: 'Long season. Harvest after first frost.' },
  { name: 'Kohlrabi', spacingDensity: 4, daysToHarvest: 55, indoorStartWeeks: 4, transplantWeeksAfterFrost: -2, sunRequirement: 'full-sun', color: '#d2b4de', notes: 'Harvest when bulb is 2-3" across.' },
  { name: 'Bok Choy', spacingDensity: 4, daysToHarvest: 45, indoorStartWeeks: 4, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#82e0aa', notes: 'Quick-growing. Good succession crop.' },
  // Leafy Greens
  { name: 'Swiss Chard', spacingDensity: 4, daysToHarvest: 50, indoorStartWeeks: 0, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#c0392b', notes: 'Harvest outer stalks. Very heat tolerant.' },
  { name: 'Spinach', spacingDensity: 9, daysToHarvest: 40, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'partial-shade', color: '#145a32', notes: 'Cool season only. Bolts in heat.' },
  { name: 'Lettuce (Head)', spacingDensity: 4, daysToHarvest: 45, indoorStartWeeks: 4, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#58d68d', notes: 'Succession plant every 2 weeks.' },
  { name: 'Lettuce (Leaf)', spacingDensity: 4, daysToHarvest: 30, indoorStartWeeks: 4, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#82e0aa', notes: 'Cut-and-come-again. Ideal succession crop.' },
  { name: 'Arugula', spacingDensity: 4, daysToHarvest: 30, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'partial-shade', color: '#a9cce3', notes: 'Bolts quickly. Succession plant every 3 weeks.' },
  // Herbs
  { name: 'Basil', spacingDensity: 4, daysToHarvest: 60, indoorStartWeeks: 4, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#52be80', notes: 'Pinch flowers to extend harvest. Loves heat.' },
  { name: 'Cilantro', spacingDensity: 9, daysToHarvest: 30, indoorStartWeeks: 0, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#48c9b0', notes: 'Bolts in heat. Succession plant every 3 weeks.' },
  { name: 'Parsley', spacingDensity: 4, daysToHarvest: 70, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#1e8449', notes: 'Slow to germinate. Soak seeds overnight.' },
  { name: 'Dill', spacingDensity: 4, daysToHarvest: 40, indoorStartWeeks: 0, transplantWeeksAfterFrost: 0, sunRequirement: 'full-sun', color: '#a9dfbf', notes: 'Direct sow. Do not transplant.' },
  { name: 'Oregano', spacingDensity: 4, daysToHarvest: 90, indoorStartWeeks: 6, transplantWeeksAfterFrost: 1, sunRequirement: 'full-sun', color: '#7dcea0', notes: 'Perennial in zones 5+. Harvest before flowering.' },
  { name: 'Thyme', spacingDensity: 4, daysToHarvest: 90, indoorStartWeeks: 6, transplantWeeksAfterFrost: 0, sunRequirement: 'full-sun', color: '#a2d9ce', notes: 'Perennial. Drought tolerant once established.' },
  { name: 'Chives', spacingDensity: 16, daysToHarvest: 60, indoorStartWeeks: 6, transplantWeeksAfterFrost: -2, sunRequirement: 'partial-shade', color: '#76d7c4', notes: 'Perennial. Edible flowers. Cut to 2" to regrow.' },
  // Alliums
  { name: 'Green Onion (Scallion)', spacingDensity: 16, daysToHarvest: 60, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'partial-shade', color: '#a8e6cf', notes: 'Direct sow. Ideal succession crop.' },
  { name: 'Onion (Bulb)', spacingDensity: 16, daysToHarvest: 100, indoorStartWeeks: 10, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#f0e68c', notes: 'Long season. Cure 2-3 weeks before storage.' },
  { name: 'Garlic', spacingDensity: 9, daysToHarvest: 240, indoorStartWeeks: null, transplantWeeksAfterFrost: -26, sunRequirement: 'full-sun', color: '#f5cba7', notes: 'Plant in fall, harvest next summer. Fall plant.' },
  { name: 'Leek', spacingDensity: 9, daysToHarvest: 120, indoorStartWeeks: 10, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#d5f5e3', notes: 'Blanch by hilling soil up around stem.' },
  // Root Vegetables
  { name: 'Carrot', spacingDensity: 16, daysToHarvest: 70, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#e67e22', notes: 'Direct sow only. Thin to 3" spacing.' },
  { name: 'Beet', spacingDensity: 9, daysToHarvest: 60, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#922b21', notes: 'Each seed = cluster. Thin after germination.' },
  { name: 'Radish', spacingDensity: 16, daysToHarvest: 25, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'partial-shade', color: '#e74c3c', notes: 'Fastest crop. Great succession filler.' },
  { name: 'Turnip', spacingDensity: 9, daysToHarvest: 50, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#d5dbdb', notes: 'Cool season. Leaves edible as greens.' },
  { name: 'Parsnip', spacingDensity: 4, daysToHarvest: 120, indoorStartWeeks: 0, transplantWeeksAfterFrost: -4, sunRequirement: 'full-sun', color: '#fef9e7', notes: 'Long season. Frost improves sweetness.' },
  // Legumes
  { name: 'Peas (Snap)', spacingDensity: 8, daysToHarvest: 60, indoorStartWeeks: 0, transplantWeeksAfterFrost: -6, sunRequirement: 'full-sun', color: '#82e0aa', notes: 'Direct sow as soon as soil workable. Needs trellis.' },
  { name: 'Peas (Shell)', spacingDensity: 8, daysToHarvest: 65, indoorStartWeeks: 0, transplantWeeksAfterFrost: -6, sunRequirement: 'full-sun', color: '#58d68d', notes: 'Plant early spring. Dislikes heat.' },
  { name: 'Bush Beans (Green)', spacingDensity: 9, daysToHarvest: 55, indoorStartWeeks: 0, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#28b463', notes: 'Direct sow after frost. Great succession crop after garlic.' },
  { name: 'Pole Beans', spacingDensity: 4, daysToHarvest: 65, indoorStartWeeks: 0, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#1d8348', notes: 'Needs sturdy trellis. More productive than bush beans.' },
  // Corn
  { name: 'Corn (Sweet)', spacingDensity: 1, daysToHarvest: 80, indoorStartWeeks: 0, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#f9e79f', notes: 'Plant in blocks for pollination. Harvest when silks brown.' },
  // Melons
  { name: 'Watermelon', spacingDensity: 1, footprintFt: 2, daysToHarvest: 90, indoorStartWeeks: 4, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#f1948a', notes: 'Needs space. Check for hollow thump when ripe.' },
  { name: 'Cantaloupe', spacingDensity: 1, footprintFt: 2, daysToHarvest: 85, indoorStartWeeks: 4, transplantWeeksAfterFrost: 2, sunRequirement: 'full-sun', color: '#fad7a0', notes: 'Slip from vine when ripe. Fragrant when ready.' },
  // Other
  { name: 'Strawberry', spacingDensity: 4, daysToHarvest: 60, indoorStartWeeks: null, transplantWeeksAfterFrost: 0, sunRequirement: 'full-sun', color: '#e74c3c', notes: 'Perennial. Everbearing or June-bearing varieties.' },
  { name: 'Celery', spacingDensity: 4, daysToHarvest: 130, indoorStartWeeks: 10, transplantWeeksAfterFrost: 0, sunRequirement: 'partial-shade', color: '#a9cce3', notes: 'Needs consistent moisture. Long season crop.' },
]
