import fs from "fs";
import csv from "csv-parser";

async function readCSVFile(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on('data', (data) => {
        const rowData = Object.values(data).join(";");

        results.push(rowData);
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

export async function parseResults(filePath) {
  let results;
  try {
    results = await readCSVFile(filePath);
  } catch (error) {
    console.log(`Incorrect .csv file structure\n${error.message}`)
    return;
  }

  const routes = [];

  results.forEach(res => {
    const resSplited = res
      .split(";")
      .map(item => item.trim())
      .filter(Boolean);

    if(resSplited.length < 6) {
      throw new Error("Incorrect .csv file structure!")
    }

    const departureTimeSplitted = resSplited[4]
      .split(":")
      .map(time => parseInt(time));

    const arrivalTimeSplitted = resSplited[5]
      .split(":")
      .map(time => parseInt(time));

    if(
      departureTimeSplitted[0] > 24 ||
      departureTimeSplitted[1] > 60 ||
      departureTimeSplitted[2] > 60 ||

      arrivalTimeSplitted[0] > 24 ||
      arrivalTimeSplitted[1] > 60 ||
      arrivalTimeSplitted[2] > 60 
    ) {
      throw new Error(`Incorrect departure date structure in №${resSplited[0]} train!`);
    }

    routes.push({
      train: parseInt(resSplited[0]),
      price: parseFloat(resSplited[3]),
      departureTime: resSplited[4],
      arrivalTime: resSplited[5],
      departureStation: parseInt(resSplited[1]),
      arrivalStation: parseInt(resSplited[2])
    });
  });

  return routes;
}
