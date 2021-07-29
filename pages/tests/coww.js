import React, { useState } from 'react';
import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTestPage } from '../../components/test-page-setup.js';
import { buildThrottle } from '../../components/test-page-utils.js'
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coWW from './coww.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

function getState() {
    const [one, setOne] = useState(0);
    const [two, setTwo] = useState(0);
    return {
        one: {
            visibleState: one,
            internalState: 0,
            syncUpdate: setOne,
            throttledUpdate: buildThrottle(setOne),
            label: "x=1"
        },
        two: {
            visibleState: two,
            internalState: 0,
            syncUpdate: setTwo,
            throttledUpdate: buildThrottle(setTwo),
            label: "x=2"
        }
    }
}

function clearState(state) {
    return function () {
        state.one.internalState = 0;
        state.one.syncUpdate(0);
        state.two.internalState = 0;
        state.two.syncUpdate(0);
    }
}

function handleResult(state) {
    return function (readResult, memResult) {
        if (memResult[0] == 2) {
            state.two.internalState = state.two.internalState + 1;
            state.two.throttledUpdate(state.two.internalState);
        } else if (memResult[0] == 1) {
            state.one.internalState = state.one.internalState + 1;
            state.one.throttledUpdate(state.one.internalState);
        }
    }
}

function chartData(testState) {
  return {
    labels: [testState.two.label, testState.one.label],
    datasets: [
      {
        label: "Coherent",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.two.visibleState, null]
      },
      {
        label: "Not Coherent",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, testState.one.visibleState]
      }
    ]
  }
}

function tooltipFilter(tooltipItem, data) {
    if (tooltipItem.datasetIndex == 0 && tooltipItem.dataIndex == 0) {
        return true;
    } else if (tooltipItem.datasetIndex == 1 && tooltipItem.dataIndex == 1) {
        return true;
    } else {
        return false;
    }
}

export default function CoRR() {
  testParams.memoryAliases[1] = 0;
  const thread = `0.1: x=1
0.2: x=2`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="x=1"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread}/>
    </>)
  };

  const testState = getState();

  const props = {
      testName: "CoWW",
      testDescription: "The CoWW litmus test checks to see if memory is coherent.",
      shaderCode: coWW,
      chartData: chartData(testState),
      chartFilter: tooltipFilter,
      clearState: clearState(testState),
      handleResult: handleResult(testState)
  }

  return makeTestPage(props, testParams, pseudoCode);
}