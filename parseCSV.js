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
  const results = await readCSVFile(filePath);

  const routes = [];

  results.forEach(res => {
    const resSplited = res.split(";");

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
