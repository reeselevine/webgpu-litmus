import { defaultTestParams } from '../../components/litmus-setup.js'
import { coWRHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coWR from '../../shaders/cowr.wgsl';
import coWR_RMW from '../../shaders/cowr-rmw.wgsl';
import coWR_workgroup from '../../shaders/cowr-workgroup.wgsl';
import coWR_RMW_workgroup from '../../shaders/cowr-rmw-workgroup.wgsl';
import coWR_RMW1 from '../../shaders/cowr-rmw1.wgsl';
import coWR_RMW2 from '../../shaders/cowr-rmw2.wgsl';
import coWR_RMW3 from '../../shaders/cowr-rmw3.wgsl';
import coWR_RMW4 from '../../shaders/cowr-rmw4.wgsl';
import coWR_RMW5 from '../../shaders/cowr-rmw5.wgsl';
import coWR_RMW6 from '../../shaders/cowr-rmw6.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`, "1.1: atomicStore(x, 2)"]),
    shader: coWR
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)
0.2: let r0 = atomicAdd(x, 0)`, "1.1: atomicExchange(x, 2)"]),
    shader: coWR_RMW
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`, "1.1: atomicStore(x, 2)"], true),
    shader: coWR_workgroup
  },
  workgroup_rmw: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)
0.2: let r0 = atomicAdd(x, 0)`, "1.1: atomicExchange(x, 2)"], true),
    shader: coWR_RMW_workgroup
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)
0.2: let r0 = atomicLoad(x)`, "1.1: atomicStore(x, 2)"]),
    shader: coWR_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicAdd(x, 0)`, "1.1: atomicStore(x, 2)"]),
    shader: coWR_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`, "1.1: atomicExchange(x, 2)"]),
    shader: coWR_RMW3
  },
  rmw4: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)
0.2: let r0 = atomicLoad(x)`, "1.1: atomicExchange(x, 2)"]),
    shader: coWR_RMW4
  },
  rmw5: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)
0.2: let r0 = atomicAdd(x, 0)`, "1.1: atomicStore(x, 2)"]),
    shader: coWR_RMW5
  },
  rmw6: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicAdd(x, 0)`, "1.1: atomicExchange(x, 2)"]),
    shader: coWR_RMW6
  }
}

export default function CoWR() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  const thread0 = `0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 2 && *x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && *x == 2",
      handler: coWRHandlers.seq0
    },
    seq1: {
      label: "r0 == 1 && *x == 1",
      handler: coWRHandlers.seq1
    },
    interleaved: {
      label: "r0 == 2 && *x == 2",
      handler: coWRHandlers.interleaved
    },
    weak: {
      label: "r0 == 2 && *x == 1",
      handler: coWRHandlers.weak
    }
  };

  const props = {
    testName: "CoWR",
    testDescription: "The CoWR litmus test checks SC-per-location by ensuring that if a read observes a write from another thread, any prior writes to the same address are not re-ordered beyond the read. Variants using rmw instructions are included.",
    testParams: testParams,
    shaderCode: coWR,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTwoOutputLitmusTestPage(props);
}