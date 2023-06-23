// Функция DFS
export function dfs(routes, start) {
  const visited = {}; 
  const unavailable = {};

  function dfsRecursive(station) {
    visited[station] = true; 

    // search for routes with this station as a departure or arrival
    for (const route of routes) {
      if (route.departureStation === station && !visited[route.arrivalStation]) {
        dfsRecursive(route.arrivalStation); 
      } else if (route.arrivalStation === station && !visited[route.departureStation]) {
        dfsRecursive(route.departureStation);
      }
    }
  }

  dfsRecursive(start); 

  // Check which stations remain unavailable
  for (const route of routes) {
    if (!visited[route.departureStation]) {
      unavailable[route.departureStation] = true;
    }
    if (!visited[route.arrivalStation]) {
      unavailable[route.arrivalStation] = true;
    }
  }

  const unavailableStations = Object.keys(unavailable);
  if (unavailableStations.length > 0) {
    return unavailableStations;
  }
}
