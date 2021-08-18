import { useState } from 'react';
import { defaultTestParams } from '../../components/litmus-setup.js'
import { buildStateValues, barrierWorkgroupSync, commonTooltipFilter } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierSync from '../../shaders/barrier-workgroup-sync.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

function chartData(testState) {
  return {
    labels: [testState.nosync.label, testState.sync.label, testState.weak.label],
    datasets: [
      {
        label: "No Synchronization",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.nosync.visibleState, null, null]
      },
      {
        label: "Synchronized",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, testState.sync.visibleState, null]
      },
      {
        label: "Bad Synchronization",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, testState.weak.visibleState]
      }
    ]
  }
}

export default function BarrierWorkgroupSynchronization() {
  testParams.numMemLocations = 2;
  testParams.numOutputs = 2;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1 && r1=0"/>,
    code: buildPseudoCode([`0.1: x=1
0.2: barrier()
0.3: store(y, 1)`, `1.1: r0=load(y)
1.2: barrier()
1.3: if (r0 == 1):
1.4:   r1=x`])
  };

  const stateConfig = {
    nosync: {
      label: "r0=0 && r1=0", 
      handler: barrierWorkgroupSync.nosync
    },
    sync: {
      label: "r0=1 && r1=1",
      handler: barrierWorkgroupSync.sync
    },
    weak: {
      label: "r0=1 && r1=0",
      handler: barrierWorkgroupSync.weak
    }
  };

  const [nosync, setNoSync] = useState(0);
  const [sync, setSync] = useState(0);
  const [weak, setWeak] = useState(0);
  const state = {
    nosync: {
      ...buildStateValues(stateConfig["nosync"], nosync, setNoSync)
    },
    sync: {
      ...buildStateValues(stateConfig["sync"], sync, setSync)
    },
    weak: {
      ...buildStateValues(stateConfig["weak"], weak, setWeak)
    }
  };

  const props = {
    testName: "Barrier Workgroup Synchronization",
    testDescription: "The barrier load store test checks to see if the barrier works correctly",
    testParams: testParams,
    testState: state,
    shaderCode: barrierSync,
    pseudoCode: pseudoCode,
    chartData: chartData(state),
    tooltipFilter: commonTooltipFilter,
    keys: ["nosync", "sync", "weak"]
  };

  return makeTestPage(props);
}
