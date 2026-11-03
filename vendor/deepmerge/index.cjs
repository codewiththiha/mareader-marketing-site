// CJS mirror of index.mjs for require() consumers.
const UNSAFE = new Set(["__proto__", "constructor", "prototype"]);
const plain = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

module.exports = function deepmerge(target, source, options = {}) {
  const arrayMerge = options.arrayMerge;
  const merge = (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) return arrayMerge ? arrayMerge(a, b) : b;
    if (!plain(a) || !plain(b)) return b === undefined ? a : b;
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) {
      if (UNSAFE.has(k)) continue;
      out[k] = k in a ? merge(a[k], v) : v;
    }
    return out;
  };
  return merge(target, source);
};
