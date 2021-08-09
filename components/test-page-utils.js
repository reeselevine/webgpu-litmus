import { useState } from 'react';
import _ from 'lodash'

export function buildThrottle(updateFunc) {
  return _.throttle((newValue) => updateFunc(newValue), 50);
}

function buildStateValues(key, config, state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    syncUpdate: updateFunc,
    throttledUpdate: buildThrottle(updateFunc),
    label: config[key].label,
    resultHandler: config[key].handler
  }
}

export function getOneOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 1,
    seq: {
      ...buildStateValues("seq", config, seq, setSeq)
    },
    weak: {
      ...buildStateValues("weak", config, weak, setWeak)
    }
  }
}

export function getTwoOutputState(config) {
  const [seq0, setSeq0] = useState(0);
  const [seq1, setSeq1] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 2,
    seq0: {
      ...buildStateValues("seq0", config, seq0, setSeq0)
    },
    seq1: {
      ...buildStateValues("seq1", config, seq1, setSeq1)
    },
    interleaved: {
      ...buildStateValues("interleaved", config, interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues("weak", config, weak, setWeak)
    }
  }
}

export function getFourOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 4,
    seq: {
      ...buildStateValues("seq", config, seq, setSeq)
    },
    interleaved: {
      ...buildStateValues("interleaved", config, interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues("weak", config, weak, setWeak)
    }
  }
}

export function clearState(state, keys) {
  for (const key of keys) {
    state[key].internalState = 0;
    state[key].syncUpdate(0);
  }
}

export function handleResult(state, keys) {
  return function (result, memResult) {
    for (const key of keys) {
      if (state[key].resultHandler(result, memResult)) {
        state[key].internalState = state[key].internalState + 1;
        state[key].throttledUpdate(state[key].internalState);
        break;
      }
    }
  }
}

// Result handlers common to many litmus tests
export const commonHandlers = {
  bothOne: function (result, memResult) {
    return result[0] == 1 && result[1] == 1;
  },
  bothZero: function (result, memResult) {
    return result[0] == 0 && result[1] == 0;
  },
  zeroOne: function (result, memResult) {
    return result[0] == 0 && result[1] == 1;
  },
  oneZero: function (result, memResult) {
    return result[0] == 1 && result[1] == 0;
  },
  zero: function(result, memResult) {
    return result[0] == 0;
  },
  one: function(result, memResult) {
    return result[0] == 1;
  },
  na: function(result, memResult) {
    return false;
  }
};

export const coRRHandlers = {
  seq: function (result, memResult) {
    return commonHandlers.bothZero(result, memResult) || commonHandlers.bothOne(result, memResult);
  },
  seq0: commonHandlers.bothZero,
  seq1: commonHandlers.bothOne,
  interleaved: commonHandlers.zeroOne,
  weak: commonHandlers.oneZero
};

function coRR4Seq(result, memResult) {
  return (result[0] == result[1]) && (result[2] == result[3]);
}

function coRR4Weak(result, memResult) {
  let r0 = result[0];
  let r1 = result[1];
  let r2 = result[2];
  let r3 = result[3];
  return (r0 == 1 && r1 == 2 && r2 == 2 && r3 == 1) || 
    (r0 == 2 && r1 == 1 && r2 == 1 && r3 == 2) ||
    (r0 != 0 && r1 == 0) ||
    (r2 != 0 && r3 == 0);
}

export const coRR4Handlers = {
  seq: coRR4Seq,
  interleaved: function (result, memResult) {
    return !coRR4Seq(result, memResult) && !coRR4Weak(result, memResult);
  },
  weak: coRR4Weak
}

export const coWWHandlers = {
  seq: function (result, memResult) {
    return memResult[0] = 2;
  },
  interleaved: commonHandlers.na,
  weak: function (result, memResult) {
    return memResult[0] == 1;
  }
};

function coWRSeq0(result, memResult) {
  return result[0] == 1 && memResult[0] == 2;
}

function coWRSeq1(result, memResult) {
  return result[0] == 1 && memResult[0] == 1;
}

export const coWRHandlers = {
  seq: function (result, memResult) {
    return coWRSeq0(result, memResult) || coWRSeq1(result, memResult);
  },
  seq0: coWRSeq0,
  seq1: coWRSeq1,
  interleaved: function (result, memResult) {
    return result[0] == 2 && memResult[0] == 2;
  },
  weak: function (result, memResult) {
    return result[0] == 2 && memResult[0] == 1;
  }
};

export const coRW1Handlers = {
  seq: commonHandlers.zero,
  interleaved: commonHandlers.na,
  weak: commonHandlers.one
}

function coRW2Seq0(result, memResult) {
  return result[0] == 0 && memResult[0] == 2;
}

function coRW2Seq1(result, memResult) {
  return result[0] == 2 && memResult[0] == 1;
}

export const coRW2Handlers = {
  seq: function (result, memResult) {
    return coRW2Seq0(result, memResult) || coRW2Seq1(result, memResult);
  },
  seq0: coRW2Seq0,
  seq1: coRW2Seq1,
  interleaved: function (result, memResult) {
    return result[0] == 0 && memResult[0] == 1;
  },
  weak: function (result, memResult) {
    return result[0] == 2 && memResult[0] == 2;
  }
};

function atomicitySeq0(result, memResult) {
  return result[0] == 0 && memResult[0] == 2;
}

function atomicitySeq1(result, memResult) {
  return result[0] == 2 && memResult[0] == 1;
}

export const atomicityHandlers = {
  seq: function (result, memResult) {
    return atomicitySeq0(result, memResult) || atomicitySeq1(result, memResult);
  },
  seq0: atomicitySeq0,
  seq1: atomicitySeq1,
  interleaved: commonHandlers.na,
  weak: function (result, memResult) {
    return result[0] == 0 && memResult[0] == 1;
  }
}

export const barrierStoreLoadHandlers = {
  seq: commonHandlers.one,
  interleaved: commonHandlers.na,
  weak: commonHandlers.zero
}


