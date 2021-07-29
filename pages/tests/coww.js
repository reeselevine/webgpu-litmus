import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState, oneOutputChartData, oneOutputTooltipFilter, handleOneOutputResult, clearOneOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coWW from '../../shaders/coww.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

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

  const testState = getOneOutputState({first: "x=2", second: "x=1"})

  const props = {
      testName: "CoWW",
      testDescription: "The CoWW litmus test checks to see if memory is coherent.",
      shaderCode: coWW,
      chartData: oneOutputChartData(testState),
      chartFilter: oneOutputTooltipFilter,
      clearState: clearOneOutputState(testState),
      handleResult: handleOneOutputResult(testState, {
        first: function (result, memResult) {
          return memResult[0] == 2;
        },
        second: function (result, memResult) {
          return memResult[0] == 1;
        }
      })
  };

  return makeTestPage(props, testParams, pseudoCode);
}