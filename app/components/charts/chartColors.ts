/* "Color Grouping" guideline: color order by number of series
   1: 1 | 2: 1+3 | 3: 1+3+5 | 4: 1+3+5+7 | 5: 1+3+5+7+9 | 6: 1+3+5+7+9+2
   Beyond 6, add 4, 6, 8, 10. */

const groupOrder = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10];

/** Standard color n (1 to 10), defined in tokens/chart-colors.css */
export const chartColor = (n: number) => `var(--color-chart-${n})`;

/** Colors to use for a chart of `count` series */
export const groupColors = (count: number) => groupOrder.slice(0, count).map(chartColor);