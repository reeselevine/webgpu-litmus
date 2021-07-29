import React, { useState } from 'react';
import _ from 'lodash'

export function buildThrottle(updateFunc) {
  return _.throttle((newValue) => updateFunc(newValue), 50);
}

export function getTwoOutputState() {
  const [bothOneVal, setBothOne] = useState(0);
  const [oneZeroVal, setOneZero] = useState(0);
  const [zeroOneVal, setZeroOne] = useState(0);
  const [bothZeroVal, setBothZero] = useState(0);
  return {
    bothOne: {
      visibleState: bothOneVal,
      internalState: 0,
      syncUpdate: setBothOne,
      throttledUpdate: buildThrottle(setBothOne),
      label: "r0=1 and r1=1"
    },
    bothZero: {
      visibleState: bothZeroVal,
      internalState: 0,
      syncUpdate: setBothZero,
      throttledUpdate: buildThrottle(setBothZero),
      label: "r0=0 and r1=0"
    },
    zeroOne: {
      visibleState: zeroOneVal,
      internalState: 0,
      syncUpdate: setZeroOne,
      throttledUpdate: buildThrottle(setZeroOne),
      label: "r0=0 and r1=1"
    },
    oneZero: {
      visibleState: oneZeroVal,
      internalState: 0,
      syncUpdate: setOneZero,
      throttledUpdate: buildThrottle(setOneZero),
      label: "r0=1 and r1=0"
    }
  }
}

export function clearTwoOutputState(state) {
    return function () {
      state.bothOne.internalState = 0;
      state.bothOne.syncUpdate(0);
      state.bothZero.internalState = 0;
      state.bothZero.syncUpdate(0);
      state.zeroOne.internalState = 0;
      state.zeroOne.syncUpdate(0);
      state.oneZero.internalState = 0;
      state.oneZero.syncUpdate(0);
    }
}

export function handleTwoOutputResult(state) {
  return function (result, memResult) {
    if (result[0] == 1 && result[1] == 1) {
      state.bothOne.internalState = state.bothOne.internalState + 1;
      state.bothOne.throttledUpdate(state.bothOne.internalState);
    } else if (result[0] == 0 && result[1] == 0) {
      state.bothZero.internalState = state.bothZero.internalState + 1;
      state.bothZero.throttledUpdate(state.bothZero.internalState);
    } else if (result[0] == 0 && result[1] == 1) {
      state.zeroOne.internalState = state.zeroOne.internalState + 1;
      state.zeroOne.throttledUpdate(state.zeroOne.internalState);
    } else if (result[0] == 1 && result[1] == 0) {
      state.oneZero.internalState = state.oneZero.internalState + 1;
      state.oneZero.throttledUpdate(state.oneZero.internalState);
    }
  }
}

export function twoOutputChartData(behaviors) {
  return {
    labels: [behaviors.sequential[0].label, behaviors.sequential[1].label, behaviors.interleaved.label, behaviors.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [behaviors.sequential[0].visibleState, behaviors.sequential[1].visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, null, behaviors.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, null, behaviors.weak.visibleState]
      }
    ]
  }
}

export function twoOutputTooltipFilter(tooltipItem, data) {
  if (tooltipItem.datasetIndex == 0 && tooltipItem.dataIndex < 2) {
    return true;
  } else if (tooltipItem.datasetIndex == 1 && tooltipItem.dataIndex == 2) {
    return true;
  } else if (tooltipItem.datasetIndex == 2 && tooltipItem.dataIndex == 3) {
    return true;
  } else {
    return false;
  }
}