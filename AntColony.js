export class AntColony {
  /**
    * Constructor for the AntColony class.
    *
    * @param {number[][]} distances - The matrix of distances between cities.
    * @param {number[][]} trains - The matrix of train information between cities.
    * @param {number} nAnts - The number of ants to be used in the algorithm.
    * @param {number} nBest - The number of best ants to deposit pheromone.
    * @param {number} nIterations - The number of iterations to run the algorithm.
    * @param {number} decay - The decay rate of pheromone.
    * @param {number} [alpha=1] - The importance factor of pheromone in ant decision-making.
    * @param {number} [beta=1] - The importance factor of heuristic information in ant decision-making.
    */
  constructor(distances, trains, nAnts, nBest, nIterations, decay, alpha = 1, beta = 1) {
    this.distances = distances;
    this.trains = trains;
    this.pheromone = Array.from({ length: distances.length }, () =>
      Array(distances.length).fill(1 / distances.length)
    );
    this.allInds = [...Array(distances.length).keys()];
    this.nAnts = nAnts;
    this.nBest = nBest;
    this.nIterations = nIterations;
    this.decay = decay;
    this.alpha = alpha;
    this.beta = beta;
  }

  /**
   * Runs the ant colony optimization algorithm and returns the shortest path found.
   * @returns {Array} An array representing the shortest path found, along with its distance.
   */
  run() {
    let shortestPath = null;
    let allTimeShortestPath = ["placeholder", Infinity];

    for (let i = 0; i < this.nIterations; i++) {
      const allPaths = this.genAllPaths();

      this.spreadPheromone(allPaths, this.nBest, shortestPath);

      shortestPath = allPaths.reduce((minPath, path) =>
        path[1] < minPath[1] ? path : minPath
      );

      if (shortestPath[1] < allTimeShortestPath[1]) {
        allTimeShortestPath = shortestPath;
      }

      this.pheromone = this.pheromone.map(row =>
        row.map(val => val * this.decay)
      );
    }

    return allTimeShortestPath;
  }

  /**
   * Spreads pheromone on the paths taken by the ants, based on the distance of each path.
   * @param {Array} allPaths - Array of all paths taken by the ants.
   * @param {number} nBest - Number of best paths to consider for spreading pheromone.
   * @param {Array} shortestPath - The current shortest path found.
   */
  spreadPheromone(allPaths, nBest, shortestPath) {
    const sortedPaths = allPaths.sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < nBest; i++) {
      const [path, dist] = sortedPaths[i];

      for (let j = 0; j < path.length; j++) {
        const [src, dest] = path[j];
        const trainNumber = this.trains[src][dest].number; 
        const trainTime = this.trains[src][dest].timeOrPrice;

        path[j] = [src, dest, trainNumber, trainTime]; 

        this.pheromone[src][dest] += 1 / this.distances[src][dest];
      }
    }
  }

  /**
   * Calculates the total distance of a given path.
   * @param {Array} path - The path to calculate the distance for.
   * @returns {number} The total distance of the path.
   */
  genPathDist(path) {
    let totalDist = 0;

    for (let i = 0; i < path.length; i++) {
      const [src, dest] = path[i];

      totalDist += this.distances[src][dest];
    }

    return totalDist;
  }

  /**
   * Generates all possible paths taken by the ants.
   * @returns {Array} Array of all paths taken by the ants, along with their distances.
   */
  genAllPaths() {
    const allPaths = [];

    for (let i = 0; i < this.nAnts; i++) {
      const path = this.genPath(0);

      allPaths.push([path, this.genPathDist(path)]);
    }

    return allPaths;
  }

  /**
   * Generates a path taken by an ant starting from the given node.
   * @param {number} start - The starting node for the path.
   * @returns {Array} The path taken by the ant.
   */
  genPath(start) {
    const path = [];
    const visited = new Set();

    visited.add(start);

    let prev = start;

    for (let i = 0; i < this.distances.length - 1; i++) {
      const move = this.pickMove(
        this.pheromone[prev],
        this.distances[prev],
        visited
      );

      path.push([prev, move]);
      prev = move;
      visited.add(move);
    }

    path.push([prev, start]); // Going back to where we started

    return path;
  }

  /**
   * Picks the next move for an ant based on the pheromone levels and distances.
   * @param {Array} pheromone - Array representing the pheromone levels.
   * @param {Array} dist - Array representing the distances between nodes.
   * @param {Set} visited - Set of visited nodes.
   * @returns {number} The next node to move to.
   */
  pickMove(pheromone, dist, visited) {
    const pheromoneCopy = pheromone.slice();

    for (const index of visited) {
      pheromoneCopy[index] = 0;
    }

    const row = pheromoneCopy.map((val, index) =>
      (val ** this.alpha) * ((1 / dist[index]) ** this.beta)
    );

    const sum = row.reduce((acc, val) => acc + val, 0);
    const normRow = row.map(val => val / sum);
    const move = this.npChoice(this.allInds, 1, normRow)[0];

    return move;
  }

  /**
   * Performs a choice operation based on probabilities.
   * @param {Array} array - Array of choices.
   * @param {number} size - Number of choices to make.
   * @param {Array} p - Array of probabilities for each choice.
   * @returns {Array} Array of chosen elements.
   */
  npChoice(array, size, p) {
    const cumulativeProb = [];
    let cumulativeSum = 0;

    for (const prob of p) {
      cumulativeSum += prob;
      cumulativeProb.push(cumulativeSum);
    }

    const result = [];

    for (let i = 0; i < size; i++) {
      const rand = Math.random();
      let index = 0;

      while (index < cumulativeProb.length && rand > cumulativeProb[index]) {
        index++;
      }

      result.push(array[index]);
    }

    return result;
  }
}

