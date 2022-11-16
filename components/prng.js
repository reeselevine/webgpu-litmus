function hashCode(s) {
  var h = 0, l = s.length, i = 0;
  if ( l > 0 )
    while (i < l)
      h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return h;
}

class PRNGInternal {
  constructor(seed, computeHash) {
    if (computeHash) {
      this._seed = hashCode(seed);
    } else {
      this._seed = seed;
    }
    if (this._seed <= 0) this._seed += 2147483646;
  }
}

export function PRNG(seed, computeHash=true) {
  const prng = new PRNGInternal(seed, computeHash);
  return function() {
    prng._seed = Math.imul(prng._seed, 16807) % 2147483646;
    if (prng._seed < 0) prng._seed += 2147483646;

    return prng._seed;
  }
}