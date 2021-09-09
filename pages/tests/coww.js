import { defaultTestParams } from '../../components/litmus-setup.js'
import { coWWHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coWW from '../../shaders/coww.wgsl';
import coWW_RMW from '../../shaders/coww-rmw.wgsl';
import coWW_workgroup from '../../shaders/coww-workgroup.wgsl';
import coWW_RMW_workgroup from '../../shaders/coww-rmw-workgroup.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: atomicStore(x, 2)`]),
    shader: coWW
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: atomicExchange(x, 2)`]),
    shader: coWW_RMW
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: atomicStore(x, 2)`], true),
    shader: coWW_workgroup
  },
  workgroup_rmw: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: atomicExchange(x, 2)`], true),
    shader: coWW_RMW_workgroup
  }
}

export default function CoWW() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="*x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "*x == 2", 
      handler: coWWHandlers.seq
    },
    weak: {
      label: "*x == 1",
      handler: coWWHandlers.weak
    }
  };

  const props = {
    testName: "CoWW",
    testDescription: "The CoWW litmus test checks SC-per-location by ensuring two writes to the same address on the same thread cannot be re-ordered.",
    testParams: testParams,
    shaderCode: coWW,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}