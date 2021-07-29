import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState, oneOutputChartData, oneOutputTooltipFilter, handleOneOutputResult, clearOneOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coRW1 from '../../shaders/corw1.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function CoRW1() {
  testParams.memoryAliases[1] = 0;
  const thread = `0.1: r0=x
0.2: x=1`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread}/>
    </>)
  };

  const testState = getOneOutputState({first: "r0=0", second: "r0=1"})

  const props = {
      testName: "CoRW1",
      testDescription: "The CoRW1 litmus test checks to see if memory is coherent.",
      shaderCode: coRW1,
      chartData: oneOutputChartData(testState),
      chartFilter: oneOutputTooltipFilter,
      clearState: clearOneOutputState(testState),
      handleResult: handleOneOutputResult(testState, {
        first: function (result, memResult) {
          return result[0] == 0;
        },
        second: function (result, memResult) {
          return result[0] == 1;
        }
      })
  };

  return makeTestPage(props, testParams, pseudoCode);
}