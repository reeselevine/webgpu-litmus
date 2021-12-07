import { defaultTestParams } from '../../components/litmus-setup.js'
import { atomicityHandlers, makeAtomicityLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import atom from '../../shaders/atom/atomicity.wgsl'
import atomWorkgroup from '../../shaders/atom/atomicity-workgroup.wgsl'
import atomStorageWorkgroup from '../../shaders/atom/atomicity-storage-workgroup.wgsl'
import atomResults from '../../shaders/atom/atomicity-results.wgsl'
import atomWorkgroupResults from '../../shaders/atom/atomicity-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: let r0 = atomicExchange(x, 1)`;
const thread1 = "1.1: atomicStore(x, 2)";

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0, thread1]),
    shader: atom,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: atomWorkgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: atomStorageWorkgroup,
    workgroup: true
  }
}

export default function Atomicity() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 0 && *x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && *x == 2",
      handler: atomicityHandlers.seq0
    },
    seq1: {
      label: "r0 == 2 && *x == 1",
      handler: atomicityHandlers.seq1
    },
    interleaved: {
      label: "N/A (same as weak)",
      handler: atomicityHandlers.interleaved
    },
    weak: {
      label: "r0 == 0 && *x == 1",
      handler: atomicityHandlers.weak
    }
  };

  const props = {
    testName: "Atomicity",
    testDescription: "The atomicity litmus test checks to see if a read-modify-write instruction is atomic. One thread in one workgroup performs an atomic rmw, while one thread in a second workgroup performs an atomic write. If the read part of the rmw does not observe the write by the other thread, then the value in memory after the test finishes must be the write by the thread in the second workgroup.",
    testParams: testParams,
    shaderCode: atom,
    resultShaderCode: {
      default: atomResults,
      workgroup: atomWorkgroupResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };
  return makeAtomicityLitmusTestPage(props);
}