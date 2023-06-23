import { 
  getIndices, 
  getMatrixWithPrices, 
  getMatrixWithTimes 
} from "./getMatrix.js";

import { dfs } from "./DFS.js";
import { AntColony } from "./AntColony.js";
import { parseResults } from "./parseCSV.js";

/**
  * Converts minutes to time in hh:mm:ss structure
  * @param {number} minutes - Time in minutes to convert
  * @returns {number} Time in hh:mm:ss structure
  */
function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const seconds = 0;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function calculateBest(timesOrPrices, trains, numAnts) {
  const antColony = new AntColony(
    timesOrPrices,
    trains,
    numAnts, //it's recommended to use as many ants as we have routes
    1,
    150,
    0.95
  );

  return antColony.run();
}

function removeDuplicates(arr) {
  const uniqueArr = arr.filter((item, index) => {
    const stringified = JSON.stringify(item);
    return index === arr.findIndex((elem) => JSON.stringify(elem) === stringified);
  });

  return uniqueArr;
}

async function main() {
  let routes;
  let indices;

  try {
    routes = await parseResults("./test_task_data.csv");
    indices = getIndices(routes, true);

    let uStations = [];

    Object.keys(getIndices(routes)).forEach(station => 
      uStations.push(dfs(routes, parseInt(station)))
    );

    if(removeDuplicates(uStations).length > 1) {
      console.log("Found 2 separate graphs!");
      return;
    }
  } catch (error) {
    console.log(error.message);
    return;
  }

  const bestRoutesByTime = calculateBest(...getMatrixWithTimes(routes), 
    Object.keys(indices).length);

  const bestRoutesByPrice = calculateBest(...getMatrixWithPrices(routes), 
    Object.keys(indices).length);

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
}

main();
