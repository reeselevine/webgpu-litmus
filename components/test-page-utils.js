import { useState } from 'react';
import _ from 'lodash'
import { makeTestPage } from './test-page-setup';

export function makeOneOutputLitmusTestPage(props) {
  props.testState = getOneOutputState(props.stateConfig);
  props.chartData = oneOutputChartData(props.testState);
  props.keys = ["seq", "weak"];
  props.tooltipFilter = commonTooltipFilter;
  props.tuningHeader = <OneOutputTuningHeader testState={props.testState}/>;
  props.dynamicRowOutputs = <OneOutputDynamicTuningRow testState={props.testState}/>;
  props.buildStaticRowOutputs = buildOneOutputStaticTuningRow;
  return makeTestPage(props);
}

function OneOutputTuningHeader(props) {
  return (
    <>
      <th className="sequentialTH">{props.testState.seq.label}</th>
      <th className="weakTH">{props.testState.weak.label}</th>
    </>
  );
}

function OneOutputDynamicTuningRow(props) {
  return (
    <>
      <td>
        {props.testState.seq.visibleState}
      </td>
      <td>
        {props.testState.weak.visibleState}
      </td>
    </>
  );
}

function buildOneOutputStaticTuningRow(testState) {
  return (
    <>
      <td>
        {testState.seq.internalState}
      </td>
      <td>
        {testState.weak.internalState}
      </td>
    </>
  );
}

function _makeTwoOutputLitmusTestPage(props) {
  props.testState = getTwoOutputState(props.stateConfig);
  props.chartData = twoOutputChartData(props.testState);
  props.tooltipFilter = twoOutputTooltipFilter;
  props.tuningHeader = <TwoOutputTuningHeader testState={props.testState}/>;
  props.dynamicRowOutputs = <TwoOutputDynamicTuningRow testState={props.testState}/>;
  props.buildStaticRowOutputs = buildTwoOutputStaticTuningRow;
  return makeTestPage(props);
}

export function makeTwoOutputLitmusTestPage(props) {
  props.keys = ["seq0", "seq1", "interleaved", "weak"];
  return _makeTwoOutputLitmusTestPage(props);
}

export function makeAtomicityLitmusTestPage(props) {
  props.keys = ["seq0", "seq1", "weak"];
  return _makeTwoOutputLitmusTestPage(props);
}

function TwoOutputTuningHeader(props) {
  return (
    <>
      <th className="sequentialTH">{props.testState.seq0.label}</th>
      <th className="sequentialTH">{props.testState.seq1.label}</th>
      <th className="interleavedTH">{props.testState.interleaved.label}</th>
      <th className="weakTH">{props.testState.weak.label}</th>
    </>
  );
}

function TwoOutputDynamicTuningRow(props) {
  return (
    <>
      <td>
        {props.testState.seq0.visibleState}
      </td>
      <td>
        {props.testState.seq1.visibleState}
      </td>
      <td>
        {props.testState.interleaved.visibleState}
      </td>
      <td>
        {props.testState.weak.visibleState}
      </td>
    </>
  );
}

function buildTwoOutputStaticTuningRow(testState) {
  return (
    <>
      <td>
        {testState.seq0.internalState}
      </td>
      <td>
        {testState.seq1.internalState}
      </td>
      <td>
        {testState.interleaved.internalState}
      </td>
      <td>
        {testState.weak.internalState}
      </td>
    </>
  );
}


export function makeFourOutputLitmusTestPage(props) {
  props.testState = getFourOutputState(props.stateConfig);
  props.chartData = fourOutputChartData(props.testState);
  props.keys = ["seq", "interleaved", "weak"];
  props.tooltipFilter = commonTooltipFilter;
  props.tuningHeader = <FourOutputTuningHeader testState={props.testState}/>;
  props.dynamicRowOutputs = <FourOutputDynamicTuningRow testState={props.testState}/>;
  props.buildStaticRowOutputs = buildFourOutputStaticTuningRow;

  return makeTestPage(props);
}

function FourOutputTuningHeader(props) {
  return (
    <>
      <th className="sequentialTH">{props.testState.seq.label}</th>
      <th className="interleavedTH">{props.testState.interleaved.label}</th>
      <th className="weakTH">{props.testState.weak.label}</th>
    </>
  );
}

function FourOutputDynamicTuningRow(props) {
  return (
    <>
      <td>
        {props.testState.seq.visibleState}
      </td>
      <td>
        {props.testState.interleaved.visibleState}
      </td>
      <td>
        {props.testState.weak.visibleState}
      </td>
    </>
  );
}

function buildFourOutputStaticTuningRow(testState) {
  return (
    <>
      <td>
        {testState.seq.internalState}
      </td>
      <td>
        {testState.interleaved.internalState}
      </td>
      <td>
        {testState.weak.internalState}
      </td>
    </>
  );
}

export function buildThrottle(updateFunc) {
  return _.throttle((newValue) => updateFunc(newValue), 50);
}

export function buildStateValues(config, state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    syncUpdate: updateFunc,
    throttledUpdate: buildThrottle(updateFunc),
    label: config.label,
    resultHandler: config.handler
  }
}

export function getOneOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    seq: {
      ...buildStateValues(config["seq"], seq, setSeq)
    },
    weak: {
      ...buildStateValues(config["weak"], weak, setWeak)
    }
  }
}

export function getTwoOutputState(config) {
  const [seq0, setSeq0] = useState(0);
  const [seq1, setSeq1] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    seq0: {
      ...buildStateValues(config["seq0"], seq0, setSeq0)
    },
    seq1: {
      ...buildStateValues(config["seq1"], seq1, setSeq1)
    },
    interleaved: {
      ...buildStateValues(config["interleaved"], interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues(config["weak"], weak, setWeak)
    }
  }
}

export function getFourOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    seq: {
      ...buildStateValues(config["seq"], seq, setSeq)
    },
    interleaved: {
      ...buildStateValues(config["interleaved"], interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues(config["weak"], weak, setWeak)
    }
  }
}

function oneOutputChartData(testState) {
  return {
    labels: [testState.seq.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, testState.weak.visibleState]
      }
    ]
  }
}

function twoOutputChartData(testState) {
  return {
    labels: [testState.seq0.label, testState.seq1.label, testState.interleaved.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq0.visibleState, testState.seq1.visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, null, testState.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, null, testState.weak.visibleState]
      }
    ]
  }
}

function fourOutputChartData(testState) {
  return {
    labels: [testState.seq.label, testState.interleaved.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq.visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, testState.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, testState.weak.visibleState]
      }
    ]
  }
}

export function commonTooltipFilter(tooltipItem, data) {
  return tooltipItem.datasetIndex == tooltipItem.dataIndex;
}

function twoOutputTooltipFilter(tooltipItem, data) {
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

export function clearState(state, keys) {
  for (const key of keys) {
    state[key].internalState = 0;
    state[key].syncUpdate(0);
  }
}

export function handleResult(state, keys) {
  return function (result) {
    for (let i = 0; i < keys.length; i++) {
      state[keys[i]].internalState = state[keys[i]].internalState + result[i];
      state[keys[i]].throttledUpdate(state[keys[i]].internalState);
    }
  }
}

// random config generation
// Generates a random number between min and max (inclusive)
function randomGenerator(min, max, generator){
  return Math.floor(generator() * (max - min + 1) + min);
}

// Rounds a percentage to the closest lower multiple of 5, to provide a smaller search space.
function roundedPercentage(generator) {
  return Math.floor(randomGenerator(0, 100, generator) / 5) * 5;
}

// Gets either a discrete or continuous percentage, based on the smoothedParameters value.
function getPercentage(generator, smoothedParameters) {
  if (smoothedParameters) {
    return roundedPercentage(generator);
  } else {
    return randomGenerator(0, 1, generator) * 100;
  }
}

export function randomConfig(generator, smoothedParameters=true) {
  let testingWorkgroups = randomGenerator(2, 1024, generator);
  let maxWorkgroups =  randomGenerator(testingWorkgroups, 1024, generator);
  let stressLineSize = Math.pow(2, randomGenerator(2,10, generator));
  let stressTargetLines = randomGenerator(1,16, generator);
  let memStride = randomGenerator(1, 7, generator);
  return {
    testingWorkgroups: testingWorkgroups,
    maxWorkgroups: maxWorkgroups,
    shufflePct: getPercentage(generator, smoothedParameters),
    barrierPct: getPercentage(generator, smoothedParameters),
    memStressPct: getPercentage(generator, smoothedParameters),
    preStressPct: getPercentage(generator, smoothedParameters),
    scratchMemorySize: 32 * stressLineSize * stressTargetLines,
    memStride: memStride,
    stressLineSize: stressLineSize,
    stressTargetLines: stressTargetLines,
    memStressIterations: randomGenerator(0, 1024, generator),
    preStressIterations: randomGenerator(0, 128, generator),
    stressStrategyBalancePct: getPercentage(generator, smoothedParameters),
    memStressStoreFirstPct: getPercentage(generator, smoothedParameters),
    memStressStoreSecondPct: getPercentage(generator, smoothedParameters),
    preStressStoreFirstPct: getPercentage(generator, smoothedParameters),
    preStressStoreSecondPct: getPercentage(generator, smoothedParameters)
  };
}