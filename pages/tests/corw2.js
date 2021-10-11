import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRW2Handlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRW2 from '../../shaders/corw2.wgsl';
import coRW2_RMW from '../../shaders/corw2-rmw.wgsl';
import coRW2_workgroup from '../../shaders/corw2-workgroup.wgsl';
import coRW2_RMW_workgroup from '../../shaders/corw2-rmw-workgroup.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`, "1.1: atomicStore(x, 2)"]),
    shader: coRW2
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`, "1.1: atomicExchange(x, 2)"]),
    shader: coRW2_RMW
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`, "1.1: atomicStore(x, 2)"], true),
    shader: coRW2_workgroup
  },
  workgroup_rmw: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`, "1.1: atomicExchange(x, 2)"], true),
    shader: coRW2_RMW_workgroup
  }

}

export default function CoRW2() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 2 && *x == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && *x == 2",
      handler: coRW2Handlers.seq0
    },
    seq1: {
      label: "r0 == 2 && *x == 1",
      handler: coRW2Handlers.seq1
    },
    interleaved: {
      label: "r0 == 0 && *x == 1",
      handler: coRW2Handlers.interleaved
    },
    weak: {
      label: "r0 == 2 && *x == 2",
      handler: coRW2Handlers.weak
    }
  };

  const props = {
    testName: "CoRW2",
    testDescription: "The CoRW2 litmus test checks SC-per-location by ensuring that if a write from one thread is visible to a read on another thread, any subsequent writes are not re-ordered. Variants using rmw instructions are included.",
    testParams: testParams,
    shaderCode: coRW2,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTwoOutputLitmusTestPage(props);
}