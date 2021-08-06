import { defaultTestParams } from '../../components/litmus-setup.js'
import { getFourOutputState, coRR4Handlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import { TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRR4 from '../../shaders/corr4.wgsl';
import coRR4_RMW from '../../shaders/corr4-rmw.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: x=1`, `1.1: r0=x
1.2: r1=x`, `2.1: x=2`, `3.1: r2=x
3.2: r3=x`]),
    shader: coRR4
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)`, `1.1: r0=x
1.2: r1=add(x, 0)`, `2.1: exchange(x, 2)`, `3.1: r2=x
3.2: r3=add(x, 0)`]),
    shader: coRR4_RMW
  }
}

export default function CoRR4() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="(r0=1 && r1=2 && r2=2 && r3=1) || (r0=2 && r1=1 && r2=1 && r3=2) || (r0 != 0 && r1 == 0) || (r2 != 0 && r3 == 0)"/>,
    code: variants.default.pseudo
  };

  const testState = getFourOutputState({
    seq: {
      label: "Sequential Outcomes",
      handler: coRR4Handlers.seq
    },
    interleaved: {
      label: "Interleaved Outcomes",
      handler: coRR4Handlers.interleaved
    },
    weak: {
      label: "Weak outcomes",
      handler: coRR4Handlers.weak
    }
  });

  const props = {
      testName: "4-Threaded CoRR",
      testDescription: "The 4-Threaded CoRR litmus test checks to see if memory is coherent.",
      testParams: testParams,
      shaderCode: coRR4,
      testState: testState,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTestPage(props);
}