export function getIndexes(routes, reverse = false) {
  let indexes = {};
  const stations = [];

  for(let i = 0; i < routes.length; i++) {
    const ds = routes[i].departureStation;

    if(!stations.includes(ds)) {
      stations.push(ds);
    }
  }

  let index = 0;

  stations.sort((a, b) => a - b).forEach(station => {
    if(reverse) {
      indexes[index] = station;
    } else {
      indexes[station] = index;
    }

    index++;
  })

  return indexes;
}

function getTimeDifference(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  if (start > end) {
    end.setDate(end.getDate() + 1);
  }

  const elapsedMilliseconds = end - start;
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 1000 / 60);

  return elapsedMinutes;
}

function filterOptimalRoutesByTime(routes) {
  const routesByDirection = {};

  routes.forEach(route => {
    const direction = `${route.departureStation}-${route.arrivalStation}`;

    if (!routesByDirection[direction]) {
      routesByDirection[direction] = [];
    }

    routesByDirection[direction].push(route);
  });

  const optimalRoutesByStation = [];

  Object.values(routesByDirection).forEach(directionRoutes => {
    const sortedRoutes = directionRoutes.sort((a, b) =>
      getTimeDifference(a.departureTime, a.arrivalTime) -
      getTimeDifference(b.departureTime, b.arrivalTime)
    );

    const stationNumber = sortedRoutes[0].departureStation;

    if (!optimalRoutesByStation[stationNumber]) {
      optimalRoutesByStation[stationNumber] = [];
    }

    const optimalRoute = sortedRoutes[0];
    optimalRoutesByStation[stationNumber].push(optimalRoute);
  });

  const finalResult = optimalRoutesByStation.filter(Boolean);

  return finalResult;
}

export function getMatrix(routes) {
  const filteredRoutes = filterOptimalRoutesByTime(routes);

  const times = [[]];
  const trains = [[]];
  const indexes = getIndexes(routes);

  for(let i = 0; i < 6; i++) {
    if(!times[i]) times[i] = [];
    if(!trains[i]) trains[i] = [];

    for(let j = 0; j < 6; j++) {
      times[i][j] = Infinity;
      trains[i][j] = { time: null, number: null };
    }
  }

  for(let i = 0; i < 6; i++) {
    for(let j = 0; j < 6; j++) {
      const currentRoute = filteredRoutes[i][j];

      if(currentRoute && i != j) {
        const nestedIndex = indexes[currentRoute.arrivalStation];

        times[i][nestedIndex] = getTimeDifference(
          currentRoute.departureTime,
          currentRoute.arrivalTime
        );

        trains[i][nestedIndex] = {
          time: times[i][nestedIndex],
          number: currentRoute.train
        }
      }
    }
  }


  return [times, trains];
}

