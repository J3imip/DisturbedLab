export class AntColony {
  constructor(distances, trains, n_ants, n_best, n_iterations, decay, alpha = 1, beta = 1) {
    this.distances = distances;
    this.trains = trains;
    this.pheromone = Array.from({ length: distances.length }, () =>
      Array(distances.length).fill(1 / distances.length)
    );
    this.all_inds = [...Array(distances.length).keys()];
    this.n_ants = n_ants;
    this.n_best = n_best;
    this.n_iterations = n_iterations;
    this.decay = decay;
    this.alpha = alpha;
    this.beta = beta;

  }

  run() {
    let shortest_path = null;
    let all_time_shortest_path = ["placeholder", Infinity];
    for (let i = 0; i < this.n_iterations; i++) {
      const all_paths = this.gen_all_paths();
      this.spread_pheromone(all_paths, this.n_best, shortest_path);
      shortest_path = all_paths.reduce((minPath, path) =>
        path[1] < minPath[1] ? path : minPath
      );
      if (shortest_path[1] < all_time_shortest_path[1]) {
        all_time_shortest_path = shortest_path;
      }
      this.pheromone = this.pheromone.map(row =>
        row.map(val => val * this.decay)
      );
    }
    return all_time_shortest_path;
  }

  spread_pheromone(all_paths, n_best, shortest_path) {
    const sorted_paths = all_paths.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < n_best; i++) {
      const [path, dist] = sorted_paths[i];
      for (let j = 0; j < path.length; j++) {
        const [src, dest] = path[j];
        const trainNumber = this.trains[src][dest].number; // Get the train number
        const trainTime = this.trains[src][dest].timeOrPrice; // Get the train time
        path[j] = [src, dest, trainNumber, trainTime]; // Add train number to path
        this.pheromone[src][dest] += 1 / this.distances[src][dest];
      }
    }
  }

  gen_path_dist(path) {
    let total_dist = 0;
    for (let i = 0; i < path.length; i++) {
      const [src, dest] = path[i];
      total_dist += this.distances[src][dest];
    }
    return total_dist;
  }

  gen_all_paths() {
    const all_paths = [];
    for (let i = 0; i < this.n_ants; i++) {
      const path = this.gen_path(0);
      all_paths.push([path, this.gen_path_dist(path)]);
    }
    return all_paths;
  }

  gen_path(start) {
    const path = [];
    const visited = new Set();
    visited.add(start);
    let prev = start;
    for (let i = 0; i < this.distances.length - 1; i++) {
      const move = this.pick_move(
        this.pheromone[prev],
        this.distances[prev],
        visited
      );
      path.push([prev, move]);
      prev = move;
      visited.add(move);
    }
    path.push([prev, start]); // going back to where we started
    return path;
  }

  pick_move(pheromone, dist, visited) {
    const pheromoneCopy = pheromone.slice();
    for (const index of visited) {
      pheromoneCopy[index] = 0;
    }

    const row = pheromoneCopy.map((val, index) =>
      (val ** this.alpha) * ((1 / dist[index]) ** this.beta)
    );

    const sum = row.reduce((acc, val) => acc + val, 0);
    const norm_row = row.map(val => val / sum);
    const move = this.np_choice(this.all_inds, 1, norm_row)[0];
    return move;
  }

  np_choice(array, size, p) {
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

