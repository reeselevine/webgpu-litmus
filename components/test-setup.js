// Message Passing tests
import messagePassing from '../shaders/mp/message-passing.wgsl'
import messagePassingCoherency from '../shaders/mp/message-passing-coherency.wgsl'
import messagePassingBarrier from '../shaders/mp/message-passing-barrier.wgsl'
import messagePassingBarrier1 from '../shaders/mp/message-passing-barrier1.wgsl'
import messagePassingBarrier2 from '../shaders/mp/message-passing-barrier2.wgsl'
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import messagePassingCoherencyResults from '../shaders/mp/message-passing-coherency-results.wgsl';
import messagePassingCoherencyTuningResults from '../shaders/mp/message-passing-coherency-tuning-results.wgsl';

// Store tests
import store from '../shaders/store/store.wgsl'
import storeCoherency from '../shaders/store/store-coherency.wgsl'
import storeBarrier from '../shaders/store/store-barrier.wgsl'
import storeBarrier1 from '../shaders/store/store-barrier1.wgsl'
import storeBarrier2 from '../shaders/store/store-barrier2.wgsl'
import storeResults from '../shaders/store/store-results.wgsl';
import storeCoherencyResults from '../shaders/store/store-coherency-results.wgsl';
import storeCoherencyTuningResults from '../shaders/store/store-coherency-tuning-results.wgsl';

// Load Buffer tests
import loadBuffer from '../shaders/lb/load-buffer.wgsl'
import loadBufferCoherency from '../shaders/lb/load-buffer-coherency.wgsl'
import loadBufferBarrier from '../shaders/lb/load-buffer-barrier.wgsl'
import loadBufferBarrier1 from '../shaders/lb/load-buffer-barrier1.wgsl'
import loadBufferBarrier2 from '../shaders/lb/load-buffer-barrier2.wgsl'
import loadBufferResults from '../shaders/lb/load-buffer-results.wgsl';
import loadBufferCoherencyResults from '../shaders/lb/load-buffer-coherency-results.wgsl';
import loadBufferCoherencyTuningResults from '../shaders/lb/load-buffer-coherency-tuning-results.wgsl';

// Read tests
import readRMW from '../shaders/read/read-rmw.wgsl'
import readCoherency from '../shaders/read/read-coherency.wgsl'
import readRMWBarrier from '../shaders/read/read-rmw-barrier.wgsl'
import readRMWBarrier1 from '../shaders/read/read-rmw-barrier1.wgsl'
import readRMWBarrier2 from '../shaders/read/read-rmw-barrier2.wgsl'
import readResults from '../shaders/read/read-results.wgsl'
import readCoherencyResults from '../shaders/read/read-coherency-results.wgsl'
import readCoherencyTuningResults from '../shaders/read/read-coherency-tuning-results.wgsl'

// Store Buffer tests
import storeBufferRMW from '../shaders/sb/store-buffer-rmw.wgsl'
import storeBufferCoherency from '../shaders/sb/store-buffer-coherency.wgsl'
import storeBufferRMWBarrier from '../shaders/sb/store-buffer-rmw-barrier.wgsl'
import storeBufferRMWBarrier1 from '../shaders/sb/store-buffer-rmw-barrier1.wgsl'
import storeBufferRMWBarrier2 from '../shaders/sb/store-buffer-rmw-barrier2.wgsl'
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl'
import storeBufferCoherencyResults from '../shaders/sb/store-buffer-coherency-results.wgsl'
import storeBufferCoherencyTuningResults from '../shaders/sb/store-buffer-coherency-tuning-results.wgsl'

// 2+2 Write tests
import twoPlusTwoWriteRMW from '../shaders/2+2w/2+2-write-rmw.wgsl'
import twoPlusTwoWriteCoherency from '../shaders/2+2w/2+2-write-coherency.wgsl'
import twoPlusTwoWriteRMWBarrier from '../shaders/2+2w/2+2-write-rmw-barrier.wgsl'
import twoPlusTwoWriteRMWBarrier1 from '../shaders/2+2w/2+2-write-rmw-barrier1.wgsl'
import twoPlusTwoWriteRMWBarrier2 from '../shaders/2+2w/2+2-write-rmw-barrier2.wgsl'
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl';
import twoPlusTwoWriteCoherencyResults from '../shaders/2+2w/2+2-write-coherency-results.wgsl';
import twoPlusTwoWriteCoherencyTuningResults from '../shaders/2+2w/2+2-write-coherency-tuning-results.wgsl';

// RR tests
import rr from '../shaders/rr/rr.wgsl';
import rrMutant from '../shaders/rr/rr-mutant.wgsl';
import rrRMW from '../shaders/rr/rr-rmw.wgsl';
import rrRMWMutant from '../shaders/rr/rr-rmw-mutant.wgsl';
import rrResults from '../shaders/rr/rr-results.wgsl';

// RR tests
import rw from '../shaders/rw/rw.wgsl';
import rwMutant from '../shaders/rw/rw-mutant.wgsl';
import rwRMW from '../shaders/rw/rw-rmw.wgsl';
import rwRMWMutant from '../shaders/rw/rw-rmw-mutant.wgsl';
import rwResults from '../shaders/rw/rw-results.wgsl';
import rwMutantResults from '../shaders/rw/rw-mutant-results.wgsl';

// WR tests
import wr from '../shaders/wr/wr.wgsl';
import wrMutant from '../shaders/wr/wr-mutant.wgsl';
import wrRMW from '../shaders/wr/wr-rmw.wgsl';
import wrRMWMutant from '../shaders/wr/wr-rmw-mutant.wgsl';
import wrResults from '../shaders/wr/wr-results.wgsl';
import wrMutantResults from '../shaders/wr/wr-mutant-results.wgsl';

// WW tests
import ww from '../shaders/ww/ww.wgsl';
import wwMutant from '../shaders/ww/ww-mutant.wgsl';
import wwRMW from '../shaders/ww/ww-rmw.wgsl';
import wwRMWMutant from '../shaders/ww/ww-rmw-mutant.wgsl';
import wwResults from '../shaders/ww/ww-results.wgsl';

export const conformanceTests = {
  messagePassingCoherency: {
    shader: messagePassingCoherency,
    resultShader: messagePassingCoherencyResults,
    coherency: true
  },
  messagePassingBarrier: {
    shader: messagePassingBarrier,
    resultShader: messagePassingResults,
    coherency: false
  },

  loadBufferCoherency: {
    shader: loadBufferCoherency,
    resultShader: loadBufferCoherencyResults,
    coherency: true 
  },
  loadBufferBarrier: {
    shader: loadBufferBarrier,
    resultShader: loadBufferResults,
    coherency: false
  },

  storeCoherency: {
    shader: storeCoherency,
    resultShader: storeCoherencyResults,
    coherency: true 
  },
  storeBarrier: {
    shader: storeBarrier,
    resultShader: storeResults,
    coherency: false
  },

  readCoherency: {
    shader: readCoherency,
    resultShader: readCoherencyResults,
    coherency: true 
  },
  readRMWBarrier: {
    shader: readRMWBarrier,
    resultShader: readResults,
    coherency: false
  },

  storeBufferCoherency: {
    shader: storeBufferCoherency,
    resultShader: storeBufferCoherencyResults,
    coherency: true 
  },
  storeBufferRMWBarrier: {
    shader: storeBufferRMWBarrier,
    resultShader: storeBufferResults,
    coherency: false
  },

  twoPlusTwoWriteCoherency: {
    shader: twoPlusTwoWriteCoherency,
    resultShader: twoPlusTwoWriteCoherencyResults,
    coherency: true 
  },
  twoPlusTwoWriteRMWBarrier: {
    shader: twoPlusTwoWriteRMWBarrier,
    resultShader: twoPlusTwoWriteResults,
    coherency: false
  },

  rr: {
    shader: rr,
    resultShader: rrResults,
    coherency: true
  },
  rrRMW: {
    shader: rrRMW,
    resultShader: rrResults,
    coherency: true
  },

  rw: {
    shader: rw,
    resultShader: rwResults,
    coherency: true
  },
  rwRMW: {
    shader: rwRMW,
    resultShader: rwResults,
    coherency: true
  },

  wr: {
    shader: wr,
    resultShader: wrResults,
    coherency: true
  },
  wrRMW: {
    shader: wrRMW,
    resultShader: wrResults,
    coherency: true
  },

  ww: {
    shader: ww,
    resultShader: wwResults,
    coherency: true
  },
  wwRMW: {
    shader: wwRMW,
    resultShader: wwResults,
    coherency: true
  }
}

export const tuningTests = {
  messagePassing: {
    shader: messagePassing,
    resultShader: messagePassingResults,
    coherency: false,
    conformanceTest: "messagePassingBarrier"
  },
  messagePassingBarrier1: {
    shader: messagePassingBarrier1,
    resultShader: messagePassingResults,
    coherency: false,
    conformanceTest: "messagePassingBarrier"
  },
  messagePassingBarrier2: {
    shader: messagePassingBarrier2,
    resultShader: messagePassingResults,
    coherency: false,
    conformanceTest: "messagePassingBarrier"
  },
  messagePassingCoherencyTuning: {
    shader: messagePassingCoherency,
    resultShader: messagePassingCoherencyTuningResults,
    coherency: false,
    conformanceTest: "messagePassingCoherency"
  },

  loadBuffer: {
    shader: loadBuffer,
    resultShader: loadBufferResults,
    coherency: false,
    conformanceTest: "loadBufferBarrier"
  },
  loadBufferBarrier1: {
    shader: loadBufferBarrier1,
    resultShader: loadBufferResults,
    coherency: false,
    conformanceTest: "loadBufferBarrier"
  },
  loadBufferBarrier2: {
    shader: loadBufferBarrier2,
    resultShader: loadBufferResults,
    coherency: false,
    conformanceTest: "loadBufferBarrier"
  },
  loadBufferCoherencyTuning: {
    shader: loadBufferCoherency,
    resultShader: loadBufferCoherencyTuningResults,
    coherency: false,
    conformanceTest: "loadBufferCoherency"
  },

  store: {
    shader: store,
    resultShader: storeResults,
    coherency: false,
    conformanceTest: "storeBarrier"
  },
  storeBarrier1: {
    shader: storeBarrier1,
    resultShader: storeResults,
    coherency: false,
    conformanceTest: "storeBarrier"
  },
  storeBarrier2: {
    shader: storeBarrier2,
    resultShader: storeResults,
    coherency: false,
    conformanceTest: "storeBarrier"
  },
  storeCoherencyTuning: {
    shader: storeCoherency,
    resultShader: storeCoherencyTuningResults,
    coherency: false,
    conformanceTest: "storeCoherency"
  },

  readRMW: {
    shader: readRMW,
    resultShader: readResults,
    coherency: false,
    conformanceTest: "readRMWBarrier"
  },
  readRMWBarrier1: {
    shader: readRMWBarrier1,
    resultShader: readResults,
    coherency: false,
    conformanceTest: "readRMWBarrier"
  },
  readRMWBarrier2: {
    shader: readRMWBarrier2,
    resultShader: readResults,
    coherency: false,
    conformanceTest: "readRMWBarrier"
  },
  readCoherencyTuning: {
    shader: readCoherency,
    resultShader: readCoherencyTuningResults,
    coherency: false,
    conformanceTest: "readCoherency"
  },

  storeBufferRMW: {
    shader: storeBufferRMW,
    resultShader: storeBufferResults,
    coherency: false,
    conformanceTest: "storeBufferRMWBarrier"
  },
  storeBufferRMWBarrier1: {
    shader: storeBufferRMWBarrier1,
    resultShader: storeBufferResults,
    coherency: false,
    conformanceTest: "storeBufferRMWBarrier"
  },
  storeBufferRMWBarrier2: {
    shader: storeBufferRMWBarrier2,
    resultShader: storeBufferResults,
    coherency: false,
    conformanceTest: "storeBufferRMWBarrier"
  },
  storeBufferCoherencyTuning: {
    shader: storeBufferCoherency,
    resultShader: storeBufferCoherencyTuningResults,
    coherency: false,
    conformanceTest: "storeBufferCoherency"
  },

  twoPlusTwoWriteRMW: {
    shader: twoPlusTwoWriteRMW,
    resultShader: twoPlusTwoWriteResults,
    coherency: false,
    conformanceTest: "twoPlusTwoWriteRMWBarrier"
  },
  twoPlusTwoWriteRMWBarrier1: {
    shader: twoPlusTwoWriteRMWBarrier1,
    resultShader: twoPlusTwoWriteResults,
    coherency: false,
    conformanceTest: "twoPlusTwoWriteRMWBarrier"
  },
  twoPlusTwoWriteRMWBarrier2: {
    shader: twoPlusTwoWriteRMWBarrier2,
    resultShader: twoPlusTwoWriteResults,
    coherency: false,
    conformanceTest: "twoPlusTwoWriteRMWBarrier"
  },
  twoPlusTwoWriteCoherencyTuning: {
    shader: twoPlusTwoWriteCoherency,
    resultShader: twoPlusTwoWriteCoherencyTuningResults,
    coherency: false,
    conformanceTest: "twoPlusTwoWriteCoherency"
  },

  rrMutant: {
    shader: rrMutant,
    resultShader: rrResults,
    coherency: true,
    conformanceTest: "rr"
  },
  rrRMWMutant: {
    shader: rrRMWMutant,
    resultShader: rrResults,
    coherency: true,
    conformanceTest: "rrRMW"
  },

  rwMutant: {
    shader: rwMutant,
    resultShader: rwMutantResults,
    coherency: true,
    conformanceTest: "rw"
  },
  rwRMWMutant: {
    shader: rwRMWMutant,
    resultShader: rwMutantResults,
    coherency: true,
    conformanceTest: "rwRMW"
  },

  wrMutant: {
    shader: wrMutant,
    resultShader: wrMutantResults,
    coherency: true,
    conformanceTest: "wr"
  },
  wrRMWMutant: {
    shader: wrRMWMutant,
    resultShader: wrMutantResults,
    coherency: true,
    conformanceTest: "wrRMW"
  },

  wwMutant: {
    shader: wwMutant,
    resultShader: wwResults,
    coherency: true,
    conformanceTest: "ww"
  },
  wwRMWMutant: {
    shader: wwRMWMutant,
    resultShader: wwResults,
    coherency: true,
    conformanceTest: "wwRMW"
  }
}