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
  }
};