import { AntColony } from "./AntColony.js";
import { getIndexes, getMatrixWithPrices, getMatrixWithTimes } from "./getMatrix.js";
import { parseResults } from "./parseCSV.js";

function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const seconds = 0;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const routes = await parseResults("./test_task_data.csv");

/*
[[
  x, 4, 5, 1
  4, x, 2, 6,
  5, 2, x, 2,
  1, 6, 2, x
]]
*/

function calculateBest(timesOrPrices, trains) {
  const antColony = new AntColony(
    timesOrPrices,
    trains,
    6,
    1,
    100,
    0.95
  );

  return antColony.run();
}

const bestRoutesByTime = calculateBest(...getMatrixWithTimes(routes));
const bestRoutesByPrice = calculateBest(...getMatrixWithPrices(routes));

const indices = getIndexes(routes, true);

console.log("The best in terms of time spent:\n");

bestRoutesByTime[0].forEach(route => {
  console.log(`Train №${route[2]}:
    From ${indices[route[0]]} to ${indices[route[1]]}
    Time spent: ${convertMinutesToTime(route[3])}`)
});

console.log(`\nTotal time spent ${convertMinutesToTime(bestRoutesByTime[1])}`);
console.log("\n\nThe best by price:\n");
bestRoutesByPrice[0].forEach(route => {
  console.log(`Train №${route[2]}:
    From ${indices[route[0]]} to ${indices[route[1]]}
    Price: ${route[3]}`)
});

console.log(`\nTotal money spent ${bestRoutesByPrice[1].toFixed(2)}`);
