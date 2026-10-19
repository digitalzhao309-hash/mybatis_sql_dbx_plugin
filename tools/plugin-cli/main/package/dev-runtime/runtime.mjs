import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../plugins/sdk/dev-host/node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/constants.js"(exports, module) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/debug.js"(exports, module) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/internal/re.js
var require_re = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/re.js"(exports, module) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/parse-options.js"(exports, module) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/identifiers.js"(exports, module) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/classes/semver.js"(exports, module) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0; i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/parse.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/valid.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/clean.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/inc.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/diff.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/major.js
var require_major = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/major.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/minor.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/patch.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/prerelease.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/compare.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/rcompare.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/compare-loose.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/compare-build.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/sort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/rsort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/gt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/lt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/eq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/neq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/gte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/lte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/cmp.js"(exports, module) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/coerce.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/truncate.js
var require_truncate = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/truncate.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version, options) => {
      const versionStringToParse = version instanceof SemVer ? version.version : version;
      return parse(versionStringToParse, options);
    };
    var doTruncation = (version, truncation) => {
      if (isPrerelease(truncation)) {
        return version.version;
      }
      version.prerelease = [];
      switch (truncation) {
        case "major":
          version.minor = 0;
          version.patch = 0;
          break;
        case "minor":
          version.patch = 0;
          break;
      }
      return version.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module.exports = truncate;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/internal/lrucache.js"(exports, module) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/classes/range.js
var require_range = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/classes/range.js"(exports, module) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        range = range.replace(BUILDSTRIPRE, "");
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      src,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        if (invalidXRangeOrder(M, m, p)) {
          return comp;
        }
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/classes/comparator.js"(exports, module) {
    "use strict";
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/functions/satisfies.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module.exports = satisfies;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/to-comparators.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/min-version.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/valid.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/outside.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/gtr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module.exports = gtr;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/ltr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module.exports = ltr;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/intersects.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/simplify.js"(exports, module) {
    "use strict";
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/ranges/subset.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !c.test(gt.semver)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !c.test(lt.semver)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// ../../plugins/sdk/dev-host/node_modules/semver/index.js
var require_semver2 = __commonJS({
  "../../plugins/sdk/dev-host/node_modules/semver/index.js"(exports, module) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// ../../plugins/sdk/dev-host/runtime.mjs
import { spawn as spawn3 } from "node:child_process";
import { mkdir as mkdir3, writeFile as writeFile3, chmod as chmod2 } from "node:fs/promises";
import { resolve as resolve3, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ../../plugins/sdk/dev-host/server.mjs
var import_semver = __toESM(require_semver2(), 1);
import http from "node:http";
import { randomUUID as randomUUID3, randomBytes } from "node:crypto";
import { readFile as readFile4, realpath as realpath2, watch, mkdir as mkdir2, writeFile as writeFile2, rename as rename2 } from "node:fs/promises";
import { resolve as resolve2, relative as relative2, isAbsolute as isAbsolute2, sep, join as join3 } from "node:path";

// ../../plugins/sdk/dev-host/sidecar.mjs
import { EventEmitter } from "node:events";
import { spawn as spawn2 } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ../../plugins/sdk/dev-host/process-tree.mjs
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
async function stopProcessTree(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve4) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.once("error", resolve4);
      killer.once("close", resolve4);
    });
    return;
  }
  const signal = (value) => {
    try {
      process.kill(-child.pid, value);
      return true;
    } catch (error) {
      if (error.code === "ESRCH" || value === 0 && error.code === "EPERM") return false;
      throw error;
    }
  };
  if (!signal("SIGTERM")) return;
  for (let i = 0; i < 40; i++) {
    await delay(50);
    if (!signal(0)) return;
  }
  signal("SIGKILL");
}

// ../../plugins/sdk/dev-host/sidecar.mjs
var JSON_LIMIT = 8 * 1024 * 1024;
var BINARY_LIMIT = 64 * 1024 * 1024;
function protocolName(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/.test(value)) throw new Error("Invalid protocol name");
  return value;
}
function frame(kind, payload) {
  const header = Buffer.alloc(5);
  header[0] = kind;
  header.writeUInt32BE(payload.length, 1);
  return Buffer.concat([header, payload]);
}
function binaryPayload(channel, data) {
  const name = Buffer.from(protocolName(channel));
  if (data.length > BINARY_LIMIT) throw new Error("Binary payload exceeds limit");
  const header = Buffer.alloc(2);
  header.writeUInt16BE(name.length);
  return Buffer.concat([header, name, data]);
}
var FrameDecoder = class {
  buffer = Buffer.alloc(0);
  constructor(onFrame) {
    this.onFrame = onFrame;
  }
  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 5) {
      const kind = this.buffer[0], length = this.buffer.readUInt32BE(1);
      if (![0, 1].includes(kind)) throw new Error("Unknown frame kind");
      if (length > (kind === 0 ? JSON_LIMIT : BINARY_LIMIT + 1024)) throw new Error("Frame exceeds limit");
      if (this.buffer.length < length + 5) return;
      const payload = this.buffer.subarray(5, length + 5);
      this.buffer = this.buffer.subarray(length + 5);
      if (kind === 0) this.onFrame({ kind, message: JSON.parse(payload.toString("utf8")) });
      else {
        if (payload.length < 2) throw new Error("Invalid binary frame");
        const size = payload.readUInt16BE(0);
        if (!size || size + 2 > payload.length) throw new Error("Invalid binary channel");
        const channel = protocolName(new TextDecoder("utf-8", { fatal: true }).decode(payload.subarray(2, 2 + size)));
        this.onFrame({ kind, channel, data: payload.subarray(2 + size) });
      }
    }
  }
};
var JsonLineDecoder = class {
  buffer = Buffer.alloc(0);
  constructor(onFrame) {
    this.onFrame = onFrame;
  }
  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    let newline;
    while ((newline = this.buffer.indexOf(10)) !== -1) {
      if (newline > JSON_LIMIT) throw new Error("JSON line exceeds limit");
      const line = this.buffer.subarray(0, newline).toString("utf8").trim();
      this.buffer = this.buffer.subarray(newline + 1);
      if (line) this.onFrame({ kind: 0, message: JSON.parse(line) });
    }
    if (this.buffer.length > JSON_LIMIT) throw new Error("JSON line exceeds limit");
  }
};
var Sidecar = class extends EventEmitter {
  pending = /* @__PURE__ */ new Map();
  sequence = 0;
  state = "stopped";
  constructor({ executable, args = [], cwd, manifest, manifestPath, transport }) {
    super();
    Object.assign(this, { executable, args, cwd, manifest, manifestPath });
    this.transport = transport || manifest.entrypoints?.backend?.transport || "stdio-jsonl";
  }
  identityMatches(info) {
    return info?.protocolVersion === 1 && info?.plugin?.id === this.manifest.id && info?.plugin?.version === this.manifest.version;
  }
  // The manifest is a source file during development: version bumps and field
  // edits made after this host started leave the in-memory copy stale. Re-read
  // it from disk before declaring a freshly spawned sidecar incompatible.
  async refreshManifestFromDisk() {
    const path = this.manifestPath || (this.cwd ? join(this.cwd, "manifest.json") : "");
    if (!path) return false;
    try {
      const parsed = JSON.parse(await readFile(path, "utf8"));
      if (typeof parsed?.id !== "string" || typeof parsed?.version !== "string") return false;
      this.manifest = parsed;
      return true;
    } catch {
      return false;
    }
  }
  async start() {
    if (!this.executable) {
      this.state = "frontend";
      this.emit("status", this.state);
      return null;
    }
    if (this.child) throw new Error("Sidecar is already running");
    this.state = "starting";
    this.emit("status", this.state);
    const child = spawn2(this.executable, this.args, { cwd: this.cwd, stdio: ["pipe", "pipe", "pipe"], detached: process.platform !== "win32" });
    this.child = child;
    const Decoder = this.transport === "stdio-framed" ? FrameDecoder : JsonLineDecoder;
    const decoder = new Decoder((packet) => {
      if (packet.kind === 1) return this.emit("binary", { channel: packet.channel, dataBase64: packet.data.toString("base64") });
      const message = packet.message;
      if (message.jsonrpc !== "2.0") throw new Error("Invalid JSON-RPC message");
      if (message.id !== void 0) {
        const waiter = this.pending.get(message.id);
        if (!waiter) return;
        this.pending.delete(message.id);
        clearTimeout(waiter.timer);
        if (message.error) waiter.reject(Object.assign(new Error(message.error.message || "Sidecar error"), { rpc: message.error }));
        else waiter.resolve(message.result);
      } else if (message.method) this.emit("event", { method: protocolName(message.method), params: message.params });
    });
    child.stdout.on("data", (chunk) => {
      try {
        decoder.push(chunk);
      } catch {
        this.emit("diagnostic", { level: "error", message: "\u540E\u7AEF\u534F\u8BAE\u89E3\u6790\u5931\u8D25", details: { reason: "invalid-frame" } });
        this.fail("Invalid sidecar frame");
        child.kill();
      }
    });
    child.stderr.resume();
    child.on("error", () => this.fail("Cannot start sidecar executable"));
    child.stdin.on("error", () => this.fail("Sidecar input closed"));
    child.on("exit", (code) => {
      this.emit("diagnostic", { level: this.state === "stopping" ? "info" : "error", message: "\u540E\u7AEF\u8FDB\u7A0B\u9000\u51FA", details: { exitCode: code } });
      this.child = void 0;
      this.cleanup = stopProcessTree(child);
      if (this.state !== "stopping") this.fail("Sidecar exited");
      else {
        this.state = "stopped";
        this.emit("status", this.state);
      }
    });
    try {
      const info = await this.request("plugin/initialize", { host: { protocolVersions: [1] } }, 1e4);
      if (!this.identityMatches(info)) {
        const refreshed = await this.refreshManifestFromDisk();
        if (!refreshed || !this.identityMatches(info)) throw new Error("Sidecar identity or protocol does not match manifest");
        this.emit("diagnostic", { level: "info", message: "manifest.json \u5DF2\u91CD\u65B0\u52A0\u8F7D", details: { version: this.manifest.version } });
      }
      this.state = "ready";
      this.emit("status", this.state);
      return info;
    } catch (error) {
      await this.stop();
      this.fail(error.message);
      throw error;
    }
  }
  fail(message, state = "failed") {
    this.state = state;
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error(message));
    }
    this.pending.clear();
    this.emit("status", this.state);
  }
  write(kind, payload) {
    if (!this.executable) return Promise.reject(new Error("This plugin has no backend"));
    if (kind === 1 && this.transport !== "stdio-framed") return Promise.reject(new Error("Binary channels require stdio-framed transport"));
    if (!this.child || !["starting", "ready"].includes(this.state)) return Promise.reject(new Error("Sidecar is not ready"));
    if (kind === 0 && payload.length > JSON_LIMIT) return Promise.reject(new Error("JSON payload exceeds limit"));
    if (this.child.stdin.writableLength > 16 * 1024 * 1024) return Promise.reject(new Error("Sidecar input is busy"));
    const output = this.transport === "stdio-framed" ? frame(kind, payload) : Buffer.concat([payload, Buffer.from("\n")]);
    return new Promise((resolve4, reject) => this.child.stdin.write(output, (error) => error ? reject(new Error("Sidecar write failed")) : resolve4()));
  }
  request(method, params = null, timeoutMs = 3e4) {
    protocolName(method);
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 3e5) throw new Error("Invalid request timeout");
    if (this.pending.size >= 256) return Promise.reject(new Error("Too many pending requests"));
    const id = ++this.sequence;
    const started = performance.now();
    this.emit("diagnostic", { level: "debug", message: "RPC \u5F00\u59CB", details: { requestId: id, method, transport: this.transport, params } });
    return new Promise((resolve4, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Sidecar request timed out; operation may still be running"));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolve4, reject, timer });
      this.write(0, Buffer.from(JSON.stringify({ jsonrpc: "2.0", id, method, params }))).catch((error) => {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      });
    }).then(
      (result) => {
        this.emit("diagnostic", { level: "debug", message: "RPC \u5B8C\u6210", details: { requestId: id, method, result, durationMs: Math.round(performance.now() - started) } });
        return result;
      },
      (error) => {
        const reason = error.message.startsWith("Sidecar request timed out") ? "timeout" : error.rpc ? "backend-error" : "transport-error";
        this.emit("diagnostic", { level: "error", message: "RPC \u5931\u8D25", details: { requestId: id, method, reason, error: error.rpc ? { code: error.rpc.code, data: error.rpc.data } : { reason }, durationMs: Math.round(performance.now() - started) } });
        throw error;
      }
    );
  }
  notify(method, params) {
    return this.write(0, Buffer.from(JSON.stringify({ jsonrpc: "2.0", method: protocolName(method), params })));
  }
  sendBinary(channel, data) {
    return this.write(1, binaryPayload(channel, data));
  }
  async stop() {
    const child = this.child;
    if (!child) {
      await this.cleanup;
      return;
    }
    if (!child.pid) {
      this.child = void 0;
      this.state = "stopped";
      return;
    }
    this.fail("Sidecar stopped", "stopping");
    if (process.platform !== "win32") child.stdin.end();
    await stopProcessTree(child);
    await this.cleanup;
  }
};

// ../../plugins/sdk/dev-host/connections.mjs
import { mkdir, readFile as readFile2, writeFile, rename, chmod, lstat } from "node:fs/promises";
import { join as join2 } from "node:path";
import { randomUUID } from "node:crypto";
function providerFor(manifest, id) {
  const provider = manifest.contributions?.find((c) => c.type === "connection-provider" && c.id === id);
  if (!provider) throw new Error("Unknown connection provider");
  return provider;
}
function binding(field) {
  return field.binding || (field.type === "password" ? "secret" : "config");
}
function validateRecord(manifest, record, required = true) {
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error("Invalid connection record");
  if (record.id !== void 0 && (typeof record.id !== "string" || !/^[a-zA-Z0-9_.-]{1,128}$/.test(record.id))) throw new Error("Invalid connection ID");
  const provider = providerFor(manifest, record.providerId);
  if (!record.values || typeof record.values !== "object" || Array.isArray(record.values)) throw new Error("Invalid connection fields");
  if (Object.keys(record.values).some((key) => !provider.fields.some((f) => f.key === key))) throw new Error("Unknown connection field");
  const values = {};
  for (const f of provider.fields) {
    const value = record.values[f.key] ?? f.default;
    const empty = value === void 0 || value === null || value === "";
    if (empty) {
      if (required && f.required) throw new Error(`Missing field: ${f.key}`);
      continue;
    }
    if (f.type === "number" ? typeof value !== "number" || !Number.isFinite(value) : f.type === "boolean" ? typeof value !== "boolean" : typeof value !== "string") {
      throw new Error(`Invalid field type: ${f.key}`);
    }
    if (["select", "radio"].includes(f.type) && !f.options?.some((option) => option.value === value)) throw new Error(`Invalid option: ${f.key}`);
    if (binding(f) === "port" && (!Number.isInteger(value) || value < 0 || value > 65535)) throw new Error("Port must be between 0 and 65535");
    Object.defineProperty(values, f.key, { enumerable: true, configurable: true, writable: true, value });
  }
  if (record.readOnly !== void 0 && typeof record.readOnly !== "boolean") throw new Error("Invalid read-only value");
  return { id: record.id || randomUUID(), providerId: provider.id, values, readOnly: record.readOnly || false };
}
function lifecyclePayload(manifest, record) {
  const provider = providerFor(manifest, record.providerId);
  const c = {
    id: record.id,
    db_type: "plugin",
    plugin_id: manifest.id,
    plugin_connection_provider: provider.id,
    plugin_connection_type: provider.database_type,
    name: provider.label,
    host: "",
    port: 0,
    username: "",
    external_config: {},
    connection_secrets: {},
    read_only: record.readOnly,
    query_timeout_secs: 60,
    idle_timeout_secs: 60
  };
  for (const f of provider.fields) {
    const value = record.values[f.key] ?? f.default;
    if (value === void 0 || value === null) continue;
    const target = binding(f);
    if (target === "config") Object.defineProperty(c.external_config, f.key, { value, enumerable: true });
    else if (target === "secret") Object.defineProperty(c.connection_secrets, f.key, { value: String(value), enumerable: true });
    else if (["name", "host", "port", "username", "password", "database"].includes(target)) c[target] = value;
    else throw new Error("Unsupported field binding");
  }
  return { provider: { id: provider.id, databaseType: provider.database_type }, connection: c, runtime: null };
}
function summary(manifest, record) {
  const provider = providerFor(manifest, record.providerId);
  const name = provider.fields.find((f) => binding(f) === "name");
  return { id: record.id, providerId: record.providerId, name: name ? record.values[name.key] || provider.label : provider.label, label: provider.label };
}
var ConnectionStore = class {
  records = [];
  constructor(directory, manifest) {
    this.directory = directory;
    this.manifest = manifest;
    this.file = join2(directory, "connections.json");
  }
  async load() {
    await mkdir(this.directory, { recursive: true, mode: 448 });
    if ((await lstat(this.directory)).isSymbolicLink()) throw new Error("Data directory cannot be a symlink");
    await chmod(this.directory, 448);
    try {
      if ((await lstat(this.file)).isSymbolicLink()) throw new Error("Connection store cannot be a symlink");
      const stored = JSON.parse(await readFile2(this.file, "utf8"));
      if (stored.pluginId !== this.manifest.id || stored.version !== 1 || !Array.isArray(stored.connections)) throw new Error("Invalid connection store");
      this.records = stored.connections.map((r) => validateRecord(this.manifest, r, false));
      if (new Set(this.records.map((r) => r.id)).size !== this.records.length) throw new Error("Duplicate connection IDs");
      await chmod(this.file, 384);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  get(id) {
    const record = this.records.find((r) => r.id === id);
    if (!record) throw new Error("Connection not found");
    return structuredClone(record);
  }
  async replace(records) {
    const next = records.map((r) => validateRecord(this.manifest, r, false));
    const temporary = join2(this.directory, `.connections-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ version: 1, pluginId: this.manifest.id, connections: next }, null, 2), { mode: 384, flag: "wx" });
    await rename(temporary, this.file);
    this.records = next;
  }
};

// ../../plugins/sdk/dev-host/assets.mjs
import { readFile as readFile3, realpath, stat } from "node:fs/promises";
import { resolve, relative, isAbsolute, extname } from "node:path";
async function readAsset(root, path) {
  if (typeof path !== "string" || !path || path.includes("\0") || isAbsolute(path)) throw new Error("Invalid asset path");
  const base = await realpath(root), file = await realpath(resolve(base, path));
  const rel = relative(base, file);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new Error("Asset is outside UI root");
  const info = await stat(file);
  if (!info.isFile() || info.size > 8 * 1024 * 1024) throw new Error("Asset exceeds limit or is not a file");
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
  return { dataBase64: (await readFile3(file)).toString("base64"), contentType: types[extname(file)] || "application/octet-stream" };
}

// ../../plugins/sdk/dev-host/browser-bridge.mjs
function installBridge(channel) {
  let sequence = 0, context = {}, locale = "zh-CN", theme;
  const pending = /* @__PURE__ */ new Map(), listeners = { context: /* @__PURE__ */ new Set(), init: /* @__PURE__ */ new Set(), event: /* @__PURE__ */ new Set(), binary: /* @__PURE__ */ new Set() };
  let resolveReady;
  const ready = new Promise((resolve4) => {
    resolveReady = resolve4;
  });
  let initialized = false;
  const readyTimer = setInterval(() => {
    if (!initialized) parent.postMessage({ source: "dbx-plugin", version: 1, channel, type: "ready" }, "*");
  }, 200);
  const encode = (input) => {
    const data = input instanceof Uint8Array ? input : new Uint8Array(input);
    let result = "";
    for (let i = 0; i < data.length; i += 8192) result += String.fromCharCode(...data.subarray(i, i + 8192));
    return btoa(result);
  };
  const decode = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  const stream = async (method, params = {}, options = {}) => {
    const streamId = options.streamId || globalThis.crypto?.randomUUID?.() || "stream-" + Date.now() + "-" + ++sequence;
    const closeMethod = options.closeMethod || "filesystem/stream/close";
    let removeListener;
    let closeRequested = false;
    let resolveOpen;
    let rejectOpen;
    const metadata = {};
    const opened = new Promise((resolve4, reject) => {
      resolveOpen = resolve4;
      rejectOpen = reject;
    });
    const readable = new ReadableStream({
      start(controller) {
        const onEvent = (message) => {
          if (message?.method !== "host.stream.chunk" && message?.method !== "host.stream.end" && message?.method !== "host.stream.error") return;
          const event = message.params || {};
          if (event.streamId !== streamId) return;
          if (message.method === "host.stream.chunk") {
            try {
              controller.enqueue(decode(event.dataBase64 || ""));
            } catch (error) {
              controller.error(error);
            }
            return;
          }
          removeListener?.();
          removeListener = void 0;
          if (message.method === "host.stream.error") {
            const error = new Error(event.message || "Plugin stream failed");
            rejectOpen(error);
            controller.error(error);
          } else {
            Object.assign(metadata, event);
            controller.close();
          }
        };
        removeListener = () => listeners.event.delete(onEvent);
        listeners.event.add(onEvent);
        request("backend.invoke", { method, params: { ...params, streamId }, timeoutMs: options.timeoutMs }).then(resolveOpen, (error) => {
          removeListener?.();
          removeListener = void 0;
          rejectOpen(error);
          controller.error(error);
        });
      },
      cancel() {
        removeListener?.();
        removeListener = void 0;
        if (closeRequested) return void 0;
        closeRequested = true;
        return request("backend.invoke", { method: closeMethod, params: { streamId } }).catch(() => void 0);
      }
    });
    Object.assign(metadata, await opened);
    return { stream: readable, metadata };
  };
  const request = (method, params) => new Promise((resolve4, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Mock host request timed out"));
    }, 31e4);
    pending.set(id, { resolve: resolve4, reject, timer });
    parent.postMessage({ source: "dbx-plugin", version: 1, channel, type: "request", id, method, params }, "*");
  });
  const listen = (kind, callback) => {
    listeners[kind].add(callback);
    return () => listeners[kind].delete(callback);
  };
  function applyTheme(value) {
    if (!value) return;
    theme = value;
    document.documentElement.dataset.dbxTheme = value.appearance;
    for (const [name, token] of Object.entries(value.tokens || {})) {
      if (/^--[a-z0-9-]+$/i.test(name) && typeof token === "string") document.documentElement.style.setProperty(name, token);
    }
  }
  window.dbxPlugin = Object.freeze({
    ready,
    get context() {
      return context;
    },
    get locale() {
      return locale;
    },
    get theme() {
      return theme;
    },
    request,
    invoke: (method, params, options = {}) => request("backend.invoke", { method, params, timeoutMs: options.timeoutMs }),
    stream,
    notify: (method, params) => request("backend.notify", { method, params }),
    sendBinary: (channel2, data) => request("backend.sendBinary", { channel: channel2, dataBase64: typeof data === "string" ? data : encode(data) }),
    readAsset: (path) => request("ui.readAsset", { path }),
    readAssetUrl: async (path) => {
      const asset = await request("ui.readAsset", { path });
      return URL.createObjectURL(new Blob([decode(asset.dataBase64)], { type: asset.contentType }));
    },
    openWorkbench: (contributionId, context2) => request("host.openWorkbench", { contributionId, context: context2 }),
    openFilesystem: (providerId, context2) => request("host.openFilesystem", { providerId, context: context2 }),
    copy: (text) => request("host.copy", { text }),
    onContext: (fn) => listen("context", fn),
    onEvent: (fn) => listen("event", fn),
    onBinary: (fn) => listen("binary", fn),
    onInit: (fn) => {
      const off = listen("init", fn);
      if (initialized) fn(context);
      return off;
    },
    encodeBase64: encode,
    decodeBase64: decode
  });
  addEventListener("message", (event) => {
    const m = event.data;
    if (event.source !== parent || m?.source !== "dbx-host" || m.channel !== channel || m.version !== 1) return;
    if (m.type === "init") {
      initialized = true;
      clearInterval(readyTimer);
      context = m.context || {};
      locale = m.locale || "zh-CN";
      applyTheme(m.theme);
      resolveReady(context);
      for (const fn of listeners.init) fn(context);
      dispatchEvent(new CustomEvent("dbx-plugin-init", { detail: m }));
    }
    if (m.type === "context") {
      context = m.context || {};
      for (const fn of listeners.context) fn(context);
      dispatchEvent(new CustomEvent("dbx-plugin-context", { detail: context }));
    }
    if (m.type === "env") {
      locale = m.locale || locale;
      applyTheme(m.theme);
      for (const fn of listeners.event) fn(m);
      dispatchEvent(new CustomEvent("dbx-plugin-env", { detail: m }));
    }
    if (m.type === "event") {
      for (const fn of listeners.event) fn(m);
      dispatchEvent(new CustomEvent("dbx-plugin-event", { detail: m }));
    }
    if (m.type === "binary") {
      const payload = { channel: m.binaryChannel, data: decode(m.dataBase64) };
      for (const fn of listeners.binary) fn(payload);
      dispatchEvent(new CustomEvent("dbx-plugin-binary", { detail: payload }));
    }
    if (m.type === "response") {
      const waiter = pending.get(m.id);
      if (!waiter) return;
      pending.delete(m.id);
      clearTimeout(waiter.timer);
      if (m.error) waiter.reject(Object.assign(new Error(m.error.message || "Host request failed"), { code: m.error.code, data: m.error.data }));
      else waiter.resolve(m.result);
    }
  });
}
function sandboxDocument(html, channel, assets = /* @__PURE__ */ new Map()) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline' blob:; img-src data: blob:; font-src data: blob:; media-src data: blob:; connect-src 'none';">`;
  const bootstrap = `<script>(${installBridge.toString()})(${JSON.stringify(channel)});</script>`;
  const inlineAsset = (url) => {
    const asset = assets.get(url);
    if (!asset) return void 0;
    return Buffer.from(asset.dataBase64, "base64").toString("utf8");
  };
  const withInlineScripts = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*(["'])([^"']+)\2([^>]*)>\s*<\/script>/gi, (match, before, _quote, url, after) => {
    const content = inlineAsset(url);
    return content === void 0 ? match : `<script${before}${after}>${content.replace(/<\/script/gi, "<\\/script")}</script>`;
  });
  const withInlineStyles = withInlineScripts.replace(/<link\b([^>]*)>/gi, (match, attributes) => {
    if (!/\brel\s*=\s*(["'])[^"']*\bstylesheet\b[^"']*\1/i.test(attributes)) return match;
    const href = attributes.match(/\bhref\s*=\s*(["'])([^"']+)\1/i);
    if (!href) return match;
    const content = inlineAsset(href[2]);
    return content === void 0 ? match : `<style>${content.replace(/<\/style/gi, "<\\/style")}</style>`;
  });
  if (/<head\b[^>]*>/i.test(withInlineStyles)) return withInlineStyles.replace(/<head\b[^>]*>/i, (match) => match + csp + bootstrap);
  return `<!doctype html><html><head>${csp}${bootstrap}</head><body>${withInlineStyles}</body></html>`;
}

// ../../plugins/sdk/dev-host/diagnostics.mjs
import { EventEmitter as EventEmitter2 } from "node:events";
import { randomUUID as randomUUID2 } from "node:crypto";
var sensitive = /password|passwd|secret|token|authorization|cookie|credential|private.?key|access.?key|api.?key|csrf/i;
function redact(value, secretKeys = /* @__PURE__ */ new Set()) {
  let budget = 8192, nodes = 0;
  const seen = /* @__PURE__ */ new WeakSet();
  function visit(v, key = "", depth = 0) {
    if (sensitive.test(key) || secretKeys.has(key) || key === "headers" || key === "channel") return "[REDACTED]";
    if (/base64|binary|^html$/i.test(key)) return "[content omitted]";
    if (++nodes > 150 || budget <= 0 || depth > 6) return "[truncated]";
    if (typeof v === "string") {
      const limit = Math.min(2048, budget), source = v.slice(0, limit);
      if (/-----BEGIN [^-]*PRIVATE KEY-----/.test(source)) return "[REDACTED]";
      const safe = source.replace(/(\b[a-z][a-z0-9+.-]{0,30}:\/\/)[^\s/@]+:[^\s/@]+@/gi, "$1[REDACTED]@").replace(/([?&](?:[^=&\s]*(?:token|key|password|secret)[^=&\s]*)=)[^&#\s]*/gi, "$1[REDACTED]");
      budget -= source.length;
      return safe + (v.length > limit ? " [truncated]" : "");
    }
    if (v === null || typeof v === "boolean" || typeof v === "number") return v;
    if (typeof v !== "object") return String(v);
    if (seen.has(v)) return "[circular]";
    seen.add(v);
    if (Array.isArray(v))
      return v.slice(0, 40).map((item) => visit(item, "", depth + 1)).concat(v.length > 40 ? ["[truncated]"] : []);
    return Object.fromEntries(
      Object.entries(v).slice(0, 40).map(([k, item]) => [k.slice(0, 128), visit(item, k, depth + 1)])
    );
  }
  return visit(value);
}
var Diagnostics = class extends EventEmitter2 {
  instanceId = randomUUID2();
  entries = [];
  sequence = 0;
  secretKeys = /* @__PURE__ */ new Set();
  context = {};
  constructor(output = (line) => console.log(line)) {
    super();
    this.output = output;
  }
  record(level, category, message, details = {}) {
    const safe = { ...this.context };
    for (const key of ["requestId", "status", "durationMs", "bytes", "port", "exitCode"]) {
      if (Number.isFinite(details[key])) safe[key] = details[key];
    }
    for (const key of ["method", "state", "reason", "transport"]) {
      if (typeof details[key] === "string" && /^[A-Za-z0-9._:/-]{1,256}$/.test(details[key])) safe[key] = details[key];
    }
    for (const key of ["path", "project", "uiRoot", "backend", "params", "result", "error"]) {
      if (details[key] !== void 0) safe[key] = redact(details[key], this.secretKeys);
    }
    const entry = { id: ++this.sequence, time: (/* @__PURE__ */ new Date()).toISOString(), level, category, message, details: safe };
    this.entries.push(entry);
    if (this.entries.length > 500) this.entries.shift();
    this.output(`[dbx-dev] ${JSON.stringify(entry)}`);
    this.emit("entry", entry);
    return entry;
  }
  snapshot() {
    return structuredClone(this.entries);
  }
  query(params) {
    for (const key of params.keys()) if (!["after", "limit", "level", "instanceId"].includes(key) || params.getAll(key).length !== 1) throw new Error("Invalid diagnostics query");
    const integer = (key, fallback, max) => {
      const raw = params.get(key);
      if (raw === null) return fallback;
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > max) throw new Error(`Invalid ${key}`);
      return Number(raw);
    };
    const after = integer("after", 0, Number.MAX_SAFE_INTEGER), limit = integer("limit", 100, 500);
    const level = params.get("level");
    if (limit < 1 || level && !["debug", "info", "error"].includes(level)) throw new Error("Invalid diagnostics filter");
    const reset = !!(params.get("instanceId") && params.get("instanceId") !== this.instanceId) || after > this.sequence;
    const cursor = reset ? 0 : after, oldestId = this.entries[0]?.id || 0;
    const matched = this.entries.filter((e) => e.id > cursor && (!level || e.level === level));
    const entries = matched.slice(0, limit), hasMore = matched.length > limit;
    return { instanceId: this.instanceId, entries: structuredClone(entries), nextAfter: hasMore ? entries.at(-1).id : this.sequence, hasMore, reset, truncated: oldestId > cursor + 1, oldestId, latestId: this.sequence };
  }
};

// ../../plugins/sdk/dev-host/auto-reload.mjs
var AutoReload = class {
  enabled = false;
  running = false;
  pending = false;
  timer;
  constructor(action, delay2 = 500) {
    this.action = action;
    this.delay = delay2;
  }
  enable(value) {
    this.enabled = value;
    if (!value) {
      clearTimeout(this.timer);
      this.pending = false;
    }
  }
  changed() {
    if (!this.enabled) return;
    this.pending = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.delay);
  }
  async flush() {
    if (!this.enabled || !this.pending || this.running) return;
    this.pending = false;
    this.running = true;
    try {
      await this.action();
    } finally {
      this.running = false;
      if (this.pending && this.enabled) this.changed();
    }
  }
};

// ../../plugins/sdk/dev-host/server.mjs
var BRIDGE_LIMIT = 2 * 1024 * 1024;
var UI_BINARY_LIMIT = 8 * 1024 * 1024;
function jsonSize(value) {
  return Buffer.byteLength(JSON.stringify(value) ?? "null");
}
function requirePermission(manifest, permission) {
  if (!manifest.permissions?.includes(permission)) throw new Error(`Plugin permission required: ${permission}`);
}
function ensureSucceeded(result) {
  if (result?.success === false) throw new Error(result.message || "Plugin connection operation failed");
}
function pageId(value = "legacy") {
  if (typeof value !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(value)) throw new Error("Invalid page ID");
  return value;
}
function localDocumentAssetPath(url, entry) {
  if (typeof url !== "string" || /^(?:data|blob|https?):/i.test(url) || url.startsWith("//") || url.startsWith("#")) return void 0;
  try {
    const parsed = new URL(url, `http://dbx-plugin.local/${entry}`);
    if (parsed.origin !== "http://dbx-plugin.local") return void 0;
    const path = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
    return path || void 0;
  } catch {
    return void 0;
  }
}
async function createMockHost(options) {
  const diagnostics = options.diagnostics || new Diagnostics();
  const project = resolve2(options.project), manifestPath = resolve2(project, "manifest.json");
  let manifest = JSON.parse(await readFile4(manifestPath, "utf8"));
  const refreshSecretKeys = () => {
    diagnostics.secretKeys.clear();
    for (const contribution of manifest.contributions || [])
      for (const field of contribution.fields || []) {
        if (field.type === "password" || ["password", "secret"].includes(field.binding)) diagnostics.secretKeys.add(field.key);
      }
  };
  refreshSecretKeys();
  if (manifest.manifest_version !== void 0 && manifest.manifest_version !== 1) throw new Error("Unsupported manifest version");
  if (manifest.engines?.host_api && !import_semver.default.satisfies("1.0.0", manifest.engines.host_api.replaceAll(",", " "))) throw new Error("Plugin does not support Host API 1.0.0");
  const backendEntry = manifest.entrypoints?.backend;
  const transport = backendEntry?.transport || "stdio-jsonl";
  if (backendEntry && (!["stdio-framed", "stdio-jsonl"].includes(transport) || !(backendEntry.protocol_versions || [1]).includes(1))) throw new Error("Unsupported backend transport or protocol version");
  const declaredRoot = resolve2(project, manifest.entrypoints.ui.root || "ui");
  const uiRoot = resolve2(project, options.uiRoot || declaredRoot);
  const entry = relative2(declaredRoot, resolve2(project, manifest.entrypoints.ui.entry));
  await readAsset(uiRoot, entry);
  const store = new ConnectionStore(resolve2(options.dataDir), manifest);
  await store.load();
  const dataRelative = relative2(await realpath2(uiRoot), await realpath2(store.directory));
  if (!dataRelative || !isAbsolute2(dataRelative) && dataRelative !== ".." && !dataRelative.startsWith(`..${sep}`)) {
    throw new Error("Development data directory must be outside the UI resource root");
  }
  if (backendEntry && !options.backend) throw new Error("Backend executable is required");
  const sidecar = new Sidecar({ executable: backendEntry ? resolve2(project, options.backend) : void 0, args: options.backendArgs || [], cwd: project, manifest, manifestPath, transport });
  const connected = /* @__PURE__ */ new Set(), frames = /* @__PURE__ */ new Map(), sessions = /* @__PURE__ */ new Map(), streams = /* @__PURE__ */ new Set();
  const pages = /* @__PURE__ */ new Map();
  let revision = 0, restarting = false, closing = false, origin, cookieName;
  let lifecycleQueue = Promise.resolve();
  const serialize = (action) => {
    const task = lifecycleQueue.then(action);
    lifecycleQueue = task.catch(() => {
    });
    return task;
  };
  const settingsDirectory = resolve2(options.dataDir), settingsFile = join3(settingsDirectory, "settings.json");
  const readSettings = async () => {
    try {
      const parsed = JSON.parse(await readFile4(settingsFile, "utf8"));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  const writeSettings = async (settings) => {
    await mkdir2(settingsDirectory, { recursive: true, mode: 448 });
    const temporary = join3(settingsDirectory, `.settings-${randomUUID3()}.tmp`);
    await writeFile2(temporary, JSON.stringify({ version: 1, ...settings }, null, 2), { mode: 384, flag: "wx" });
    await rename2(temporary, settingsFile);
  };
  let autoReload = (await readSettings()).autoReload === true;
  const backendReload = new AutoReload(async () => {
    try {
      await serialize(async () => {
        if (autoReload && !closing) await restartBackend();
      });
    } catch {
      broadcast("auto-reload-error", {});
    }
  });
  backendReload.enable(autoReload);
  const broadcast = (type, payload) => {
    const message = `data: ${JSON.stringify({ type, ...payload })}

`;
    for (const stream of streams) {
      if (stream.writableLength > 16 * 1024 * 1024) {
        stream.destroy();
        streams.delete(stream);
      } else stream.write(message);
    }
  };
  const onDiagnostic = (entry2) => broadcast("diagnostic", { entry: entry2 });
  diagnostics.on("entry", onDiagnostic);
  sidecar.on("diagnostic", (event) => diagnostics.record(event.level, "rpc", event.message, event.details));
  sidecar.on("status", (state) => diagnostics.record(state === "failed" ? "error" : "info", "backend", "\u540E\u7AEF\u72B6\u6001\u53D8\u5316", { state, transport }));
  sidecar.on("event", () => diagnostics.record("debug", "event", "\u6536\u5230\u540E\u7AEF\u4E8B\u4EF6"));
  sidecar.on("binary", (event) => diagnostics.record("debug", "binary", "\u6536\u5230\u4E8C\u8FDB\u5236\u5E27", { bytes: Buffer.byteLength(event.dataBase64, "base64") }));
  sidecar.on("status", (state) => {
    if (state !== "ready") connected.clear();
    broadcast("status", { state });
  });
  sidecar.on("event", (event) => {
    if (manifest.permissions?.includes("host.events")) broadcast("event", event);
  });
  sidecar.on("binary", (event) => {
    if (manifest.permissions?.includes("host.binary") && event.dataBase64.length <= UI_BINARY_LIMIT / 3 * 4 + 4) broadcast("binary", event);
  });
  try {
    await sidecar.start();
  } catch (error) {
    diagnostics.removeListener("entry", onDiagnostic);
    throw error;
  }
  const listing = () => store.records.map((r) => ({ ...summary(manifest, r), connected: connected.has(r.id) }));
  async function disconnect(id) {
    if (connected.has(id) && sidecar.state === "ready") {
      ensureSucceeded(await sidecar.request("connection/disconnect", lifecyclePayload(manifest, store.get(id)), 1e4));
    }
    connected.delete(id);
  }
  async function connect(record) {
    if (restarting || sidecar.state !== "ready") throw new Error("Backend is not ready; restart it first");
    const provider = providerFor(manifest, record.providerId);
    if (!provider.capabilities?.includes("connect")) throw new Error("Provider does not support connect");
    validateRecord(manifest, record);
    if (!connected.has(record.id)) {
      ensureSucceeded(await sidecar.request("connection/connect", lifecyclePayload(manifest, record), 6e4));
      connected.add(record.id);
    }
  }
  async function openFrame(session, connectionId, contributionId, suppliedContext) {
    const record = connectionId ? store.get(connectionId) : void 0;
    const provider = record ? providerFor(manifest, record.providerId) : void 0;
    const contribution = manifest.contributions.find((c) => c.id === (contributionId || provider?.workbench) && c.type === "workbench");
    if (!contribution) throw new Error("Unknown workbench contribution");
    if (record) await connect(record);
    const context = record ? { ...suppliedContext, connectionId: record.id, providerId: provider.id, connectionType: provider.database_type } : { ...suppliedContext };
    const name = record ? summary(manifest, record).name : contribution.label;
    if (jsonSize(context) > BRIDGE_LIMIT) throw new Error("Context exceeds limit");
    const existing = [...frames.values()].find((f) => f.session === session.id && f.page === session.page && f.connectionId === connectionId && f.contributionId === contribution.id);
    if (existing) {
      existing.context = context;
      existing.name = name;
      return expose(existing);
    }
    const frame2 = { id: randomUUID3(), channel: randomUUID3(), session: session.id, page: session.page, connectionId, contributionId: contribution.id, context, name };
    frames.set(frame2.id, frame2);
    return expose(frame2);
  }
  async function frameDocument(html, channel) {
    const urls = /* @__PURE__ */ new Set();
    for (const match of html.matchAll(/<script\b[^>]*?\bsrc\s*=\s*(["'])([^"']+)\1[^>]*>/gi)) urls.add(match[2]);
    for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
      if (!/\brel\s*=\s*(["'])[^"']*\bstylesheet\b[^"']*\1/i.test(match[1])) continue;
      const href = match[1].match(/\bhref\s*=\s*(["'])([^"']+)\1/i);
      if (href) urls.add(href[2]);
    }
    const assets = /* @__PURE__ */ new Map();
    await Promise.all(
      [...urls].map(async (url) => {
        const path = localDocumentAssetPath(url, entry);
        if (path) assets.set(url, await readAsset(uiRoot, path));
      })
    );
    return sandboxDocument(html, channel, assets);
  }
  function expose(frame2) {
    const { session: _session, page: _page, ...safe } = frame2;
    return structuredClone(safe);
  }
  function frameFor(session, id) {
    const f = frames.get(id);
    if (!f || f.session !== session.id || f.page !== session.page) throw new Error("Unknown workbench frame");
    return f;
  }
  async function bridge(session, input) {
    const frame2 = frameFor(session, input.frameId), p = input.params || {};
    if (input.channel !== frame2.channel) throw new Error("Stale workbench generation");
    if (input.method !== "backend.sendBinary" && jsonSize(p) > BRIDGE_LIMIT) throw new Error("Bridge request exceeds 2 MiB");
    switch (input.method) {
      case "host.getContext":
        return structuredClone(frame2.context);
      case "backend.invoke": {
        if (p.timeoutMs !== void 0 && (typeof p.timeoutMs !== "number" || !Number.isFinite(p.timeoutMs))) throw new Error("Invalid request timeout");
        const timeout = p.timeoutMs === void 0 ? 3e4 : Math.min(12e4, Math.max(1, Math.round(p.timeoutMs)));
        return sidecar.request(protocolName(p.method), p.params ?? null, timeout);
      }
      case "backend.notify":
        await sidecar.notify(protocolName(p.method), p.params ?? null);
        return null;
      case "backend.sendBinary": {
        requirePermission(manifest, "host.binary");
        if (typeof p.dataBase64 !== "string" || p.dataBase64.length > Math.ceil(UI_BINARY_LIMIT / 3) * 4) throw new Error("Invalid base64 or binary exceeds limit");
        const data = Buffer.from(p.dataBase64, "base64");
        if (data.toString("base64") !== p.dataBase64) throw new Error("Invalid base64");
        if (data.length > UI_BINARY_LIMIT) throw new Error("Bridge binary exceeds 8 MiB");
        await sidecar.sendBinary(p.channel, data);
        return null;
      }
      case "ui.readAsset": {
        const prefix = (manifest.entrypoints.ui.root || "ui").replace(/\/$/, "") + "/";
        const path = typeof p.path === "string" && p.path.startsWith(prefix) ? p.path.slice(prefix.length) : p.path;
        return readAsset(uiRoot, path);
      }
      case "host.openWorkbench": {
        requirePermission(manifest, "host.workbench");
        return { mockHostOpenFrame: await serialize(() => openFrame(session, p.context?.connectionId || frame2.connectionId, p.contributionId, p.context)) };
      }
      default:
        throw new Error(`Unsupported mock host method: ${input.method}`);
    }
  }
  async function api(session, route, p) {
    if (route === "/api/bridge") return bridge(session, p);
    if (route === "/api/icon") {
      const contribution = p.contributionId === void 0 ? void 0 : manifest.contributions?.find((item) => item.id === p.contributionId);
      if (p.contributionId !== void 0 && !contribution) throw new Error("Unknown icon contribution");
      const icon = contribution?.icon || manifest.icon;
      if (!icon) return null;
      if (typeof icon !== "string" || icon.includes(":") || icon.includes("\\") || icon.includes("\0") || icon.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("Invalid plugin icon path");
      const asset = await readAsset(project, icon);
      if (!asset.contentType.startsWith("image/")) throw new Error("Plugin icon is not an image");
      return asset;
    }
    if (route === "/api/frame-document") {
      const f = frameFor(session, p.frameId);
      const asset = await readAsset(uiRoot, entry);
      f.channel = randomUUID3();
      return { ...expose(f), html: await frameDocument(Buffer.from(asset.dataBase64, "base64").toString("utf8"), f.channel) };
    }
    return serialize(async () => {
      switch (route) {
        case "/api/auto-reload": {
          if (typeof p.enabled !== "boolean") throw new Error("Invalid automatic reload setting");
          autoReload = p.enabled;
          backendReload.enable(autoReload);
          try {
            await writeSettings({ autoReload });
          } catch (error) {
            diagnostics.record("error", "build", "\u81EA\u52A8\u91CD\u8F7D\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25", { reason: String(error.message || error) });
          }
          broadcast("auto-reload", { enabled: autoReload });
          diagnostics.record("info", "build", autoReload ? "\u81EA\u52A8\u91CD\u8F7D\u5DF2\u542F\u7528" : "\u81EA\u52A8\u91CD\u8F7D\u5DF2\u5173\u95ED");
          return { enabled: autoReload };
        }
        case "/api/workbenches/open":
          return { frame: await openFrame(session, void 0, p.contributionId) };
        case "/api/connections/edit":
          return store.get(p.id);
        case "/api/connections/save": {
          const existing = p.id ? store.get(p.id) : void 0;
          const record = validateRecord(manifest, p);
          if (existing && existing.providerId !== record.providerId) throw new Error("Create a new connection to change its provider");
          if (existing) await disconnect(existing.id);
          await store.replace([...store.records.filter((r) => r.id !== record.id), record]);
          return { connections: listing(), id: record.id };
        }
        case "/api/connections/test": {
          const record = validateRecord(manifest, { ...p, id: randomUUID3() });
          if (!providerFor(manifest, record.providerId).capabilities?.includes("test")) throw new Error("Provider does not support test");
          ensureSucceeded(await sidecar.request("connection/test", lifecyclePayload(manifest, record), 6e4));
          return { message: "\u8FDE\u63A5\u6D4B\u8BD5\u6210\u529F" };
        }
        case "/api/connections/connect":
          return { frame: await openFrame(session, p.id), connections: listing() };
        case "/api/connections/disconnect":
          await disconnect(p.id);
          return { connections: listing() };
        case "/api/connections/delete": {
          store.get(p.id);
          await disconnect(p.id);
          await store.replace(store.records.filter((r) => r.id !== p.id));
          for (const f of frames.values()) if (f.connectionId === p.id) frames.delete(f.id);
          broadcast("frames-removed", { connectionId: p.id });
          return { connections: listing() };
        }
        case "/api/connections/import": {
          if (!Array.isArray(p.connections) || p.connections.length > 100) throw new Error("Invalid connection import");
          const imported = p.connections.map((r) => validateRecord(manifest, { ...r, id: randomUUID3() }));
          await store.replace([...store.records, ...imported]);
          return { connections: listing() };
        }
        case "/api/frames/close": {
          const f = frameFor(session, p.id);
          if (f.connectionId && ![...frames.values()].some((other) => other.id !== f.id && other.connectionId === f.connectionId)) await disconnect(f.connectionId);
          frames.delete(f.id);
          return { connections: listing() };
        }
        case "/api/backend/restart":
          return restartBackend();
        default:
          throw new Error("Unknown mock host endpoint");
      }
    });
  }
  async function restartBackend() {
    restarting = true;
    diagnostics.record("info", "build", "\u5F00\u59CB\u91CD\u5EFA\u540E\u7AEF");
    try {
      for (const id of connected) await disconnect(id).catch(() => connected.delete(id));
      await sidecar.stop();
      if (options.buildBackend) await options.buildBackend();
      await sidecar.start();
      diagnostics.record("info", "build", "\u540E\u7AEF\u91CD\u5EFA\u5B8C\u6210");
      return { connections: listing(), state: sidecar.state };
    } catch (error) {
      diagnostics.record("error", "build", "\u540E\u7AEF\u91CD\u5EFA\u5931\u8D25");
      throw error;
    } finally {
      restarting = false;
    }
  }
  const server = http.createServer(async (request, response) => {
    const started = performance.now();
    let route = "unknown", rejection;
    response.on("finish", () => {
      if (route === "diagnostics" || route === "events" || route === "bootstrap" && response.statusCode < 400) return;
      diagnostics.record(response.statusCode >= 400 ? "error" : "debug", "http", "HTTP \u8BF7\u6C42\u5B8C\u6210", {
        method: route,
        path: route === "unknown" ? "[unknown route]" : route.startsWith("/") ? route : `/api/${route}`,
        status: response.statusCode,
        durationMs: Math.round(performance.now() - started),
        reason: rejection
      });
    });
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    try {
      if (request.headers.host !== new URL(origin).host) {
        rejection = "invalid-host";
        return respond(response, 403, { error: { message: "Invalid Host" } });
      }
      if (request.headers["sec-fetch-site"] === "cross-site" || request.headers.origin && request.headers.origin !== origin) {
        rejection = "invalid-origin";
        return respond(response, 403, { error: { message: "Invalid Origin" } });
      }
      const path = new URL(request.url, origin).pathname;
      const known = [
        "/",
        "/api/bootstrap",
        "/api/events",
        "/api/bridge",
        "/api/frame-document",
        "/api/workbenches/open",
        "/api/icon",
        "/api/connections/edit",
        "/api/connections/save",
        "/api/connections/test",
        "/api/connections/connect",
        "/api/connections/disconnect",
        "/api/connections/delete",
        "/api/connections/import",
        "/api/frames/close",
        "/api/backend/restart"
      ];
      route = known.includes(path) ? path.replace("/api/", "") || "/" : "unknown";
      if (path === "/api/diagnostics") {
        route = "diagnostics";
        if (request.method !== "GET") return respond(response, 405, { error: { message: "Diagnostics is read-only; use GET" } });
        return respond(response, 200, { ...diagnostics.query(new URL(request.url, origin).searchParams), plugin: { id: manifest.id, version: manifest.version }, backendState: sidecar.state, port: server.address().port });
      }
      const cookie = (request.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
      let session = sessions.get(cookie);
      if (path === "/api/bootstrap" && request.method === "GET") {
        if (!session) {
          if (sessions.size >= 128) throw new Error("Too many browser sessions");
          session = { id: randomBytes(24).toString("hex"), csrf: randomBytes(24).toString("hex") };
          sessions.set(session.id, session);
          response.setHeader("Set-Cookie", `${cookieName}=${session.id}; HttpOnly; SameSite=Strict; Path=/`);
        }
        return respond(response, 200, { manifest, connections: listing(), csrf: session.csrf, state: sidecar.state, revision, autoReload, diagnostics: diagnostics.snapshot() });
      }
      if (path === "/api/events" && request.method === "GET" && session) {
        const page = pageId(new URL(request.url, origin).searchParams.get("page") || void 0);
        const key = `${session.id}:${page}`;
        let lease = pages.get(key);
        if (!lease) {
          lease = { count: 0 };
          pages.set(key, lease);
        }
        clearTimeout(lease.timer);
        lease.count++;
        response.writeHead(200, { "Content-Type": "text/event-stream", Connection: "keep-alive" });
        response.write(`data: ${JSON.stringify({ type: "page-frames", ids: [...frames.values()].filter((f) => f.session === session.id && f.page === page).map((f) => f.id) })}

`);
        response.write(`data: ${JSON.stringify({ type: "status", state: sidecar.state })}

`);
        streams.add(response);
        response.write(`data: ${JSON.stringify({ type: "auto-reload", enabled: autoReload })}

`);
        response.write(`data: ${JSON.stringify({ type: "diagnostic-history", entries: diagnostics.snapshot() })}

`);
        const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), 2e4);
        response.on("close", () => {
          streams.delete(response);
          clearInterval(heartbeat);
          if (--lease.count || closing) return;
          lease.timer = setTimeout(() => {
            void serialize(async () => {
              if (closing || lease.count || pages.get(key) !== lease) return;
              pages.delete(key);
              const ids = /* @__PURE__ */ new Set();
              for (const f of frames.values()) {
                if (f.session !== session.id || f.page !== page) continue;
                frames.delete(f.id);
                if (f.connectionId) ids.add(f.connectionId);
              }
              for (const id of ids) {
                if ([...frames.values()].some((f) => f.connectionId === id)) continue;
                try {
                  await disconnect(id);
                } catch {
                  diagnostics.record("error", "backend", "\u9875\u9762\u56DE\u6536\u65F6\u65AD\u5F00\u8FDE\u63A5\u5931\u8D25");
                }
              }
              broadcast("connections", { connections: listing() });
            });
          }, options.pageGraceMs ?? 3e4);
        });
        return;
      }
      if (path.startsWith("/api/")) {
        if (request.method !== "POST" || !session || request.headers.origin !== origin || request.headers["x-mock-csrf"] !== session.csrf || !request.headers["content-type"]?.startsWith("application/json")) {
          rejection = request.method !== "POST" ? "invalid-method" : !session ? "missing-or-expired-session" : request.headers.origin !== origin ? "missing-origin" : request.headers["x-mock-csrf"] !== session.csrf ? "csrf-mismatch" : "invalid-content-type";
          return respond(response, 403, { error: { message: "Invalid browser session or request" } });
        }
        let bytes = 0;
        const chunks = [];
        for await (const chunk of request) {
          bytes += chunk.length;
          if (bytes > 12 * 1024 * 1024) throw new Error("HTTP payload exceeds limit");
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const page = pageId(request.headers["x-dbx-page"]);
        return respond(response, 200, { value: await api({ ...session, page }, path, body) });
      }
      if (path === "/" && request.method === "GET") {
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.setHeader(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: blob:; font-src 'self' data: blob:; media-src 'self' data: blob:; frame-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
        );
        return response.end(await readFile4(options.shellHtml));
      }
      respond(response, 404, { error: { message: "Not found" } });
    } catch (error) {
      const rpc = error.rpc;
      rejection = rpc ? "backend-error" : error.message?.startsWith("Plugin permission required:") ? "permission-denied" : error.message?.startsWith("Unsupported mock host method:") ? "unsupported-method" : error.message === "Stale workbench generation" ? "stale-frame" : "operation-failed";
      const message = error.code ? "Local development service operation failed" : error.message;
      respond(response, 400, { error: { message, ...rpc ? { code: rpc.code, data: rpc.data } : {} } });
    }
  });
  server.requestTimeout = 32e4;
  try {
    await new Promise((accept, reject) => {
      server.once("error", (error) => {
        if (error.code === "EADDRINUSE") {
          server.once("error", reject);
          server.listen(0, "127.0.0.1", accept);
        } else reject(error);
      });
      server.listen(options.port ?? 5190, "127.0.0.1", accept);
    });
  } catch (error) {
    await sidecar.stop();
    throw error;
  }
  origin = `http://127.0.0.1:${server.address().port}`;
  cookieName = `dbx_dev_session_${server.address().port}`;
  diagnostics.context = { port: server.address().port };
  diagnostics.record("info", "server", "\u8C03\u8BD5\u670D\u52A1\u5DF2\u542F\u52A8", { port: server.address().port, project, uiRoot, backend: options.backend });
  const watchStop = new AbortController();
  if (options.backendWatch && options.buildBackend)
    void (async () => {
      try {
        for await (const event of watch(options.backendWatch, { signal: watchStop.signal, recursive: true })) {
          const path = String(event.filename || "").replaceAll("\\", "/");
          if (path.split("/").some((p) => ["target", ".git", ".dbx-dev", "node_modules", "vendor"].includes(p))) continue;
          if (/\.(rs|go)$|(^|\/)(Cargo\.toml|Cargo\.lock|build\.rs|go\.mod|go\.sum)$/.test(path)) backendReload.changed();
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          diagnostics.record("error", "build", "\u540E\u7AEF\u6E90\u7801\u76D1\u542C\u5DF2\u505C\u6B62");
          broadcast("auto-reload-error", {});
        }
      }
    })();
  let manifestDebounce;
  void (async () => {
    try {
      for await (const event of watch(project, { signal: watchStop.signal })) {
        if (String(event.filename || "").replaceAll("\\", "/") !== "manifest.json") continue;
        clearTimeout(manifestDebounce);
        manifestDebounce = setTimeout(async () => {
          try {
            const fresh = JSON.parse(await readFile4(manifestPath, "utf8"));
            if (typeof fresh?.id !== "string" || typeof fresh?.version !== "string") throw new Error("Invalid manifest identity");
            if (fresh.manifest_version !== void 0 && fresh.manifest_version !== 1) throw new Error("Unsupported manifest version");
            manifest = fresh;
            sidecar.manifest = fresh;
            refreshSecretKeys();
            diagnostics.record("info", "build", "manifest.json \u5DF2\u91CD\u65B0\u52A0\u8F7D", { version: fresh.version });
          } catch (error) {
            diagnostics.record("error", "build", "manifest.json \u91CD\u65B0\u52A0\u8F7D\u5931\u8D25", { reason: String(error.message || error) });
          }
        }, 200);
      }
    } catch (error) {
      if (error.name !== "AbortError") diagnostics.record("error", "build", "manifest \u76D1\u542C\u5DF2\u505C\u6B62");
    }
  })();
  let debounce;
  void (async () => {
    try {
      for await (const _event of watch(uiRoot, { signal: watchStop.signal, recursive: true })) {
        if (options.uiBuildSignals) continue;
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          try {
            await readAsset(uiRoot, entry);
            broadcast("ui-rebuilt", { revision: ++revision });
          } catch {
            broadcast("watch-error", {});
          }
        }, 500);
      }
    } catch (error) {
      if (error.name !== "AbortError") broadcast("watch-error", {});
    }
  })();
  return {
    origin,
    server,
    sidecar,
    store,
    diagnostics,
    async uiBuilt() {
      await readAsset(uiRoot, entry);
      broadcast("ui-rebuilt", { revision: ++revision });
    },
    async close() {
      if (closing) return;
      closing = true;
      for (const lease of pages.values()) clearTimeout(lease.timer);
      pages.clear();
      backendReload.enable(false);
      watchStop.abort();
      clearTimeout(debounce);
      for (const stream of streams) stream.end();
      streams.clear();
      server.close();
      await serialize(async () => {
        for (const id of connected) await disconnect(id).catch(() => {
        });
        await sidecar.stop();
      });
      server.closeAllConnections();
      diagnostics.record("info", "server", "\u8C03\u8BD5\u670D\u52A1\u5DF2\u505C\u6B62");
      diagnostics.removeListener("entry", onDiagnostic);
    }
  };
}
function respond(response, code, value) {
  if (response.headersSent || response.destroyed) return;
  response.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

// ../../plugins/sdk/dev-host/runtime.mjs
async function startDevelopment(options) {
  const diagnostics = options.diagnostics || new Diagnostics();
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("dbx-plugin dev requires Node.js 22+");
  const project = resolve3(options.project), dataDir = resolve3(options.dataDir || resolve3(project, ".dbx-dev"));
  await mkdir3(dataDir, { recursive: true, mode: 448 });
  await chmod2(dataDir, 448);
  await mkdir3(resolve3(dataDir, "bin"), { recursive: true });
  const children = /* @__PURE__ */ new Set();
  let host, stopping = false;
  async function spawnCommand(spec, watch2 = false) {
    if (stopping) throw new Error("Development host is stopping");
    if (Array.isArray(spec)) spec = { command: spec[0], args: spec.slice(1), cwd: project };
    if (!spec?.command || !Array.isArray(spec.args) || spec.args.some((a) => typeof a !== "string")) throw new Error("Invalid build command");
    const env = { ...process.env };
    if (spec.goWorkspace) {
      const work = resolve3(dataDir, "go.work");
      await writeFile3(work, `go 1.22

use (
${spec.goWorkspace.map((p) => "	" + JSON.stringify(p)).join("\n")}
)
`, { mode: 384 });
      env.GOWORK = work;
    }
    let command = spec.command === "node" ? process.execPath : spec.command;
    let args = spec.args;
    if (process.platform === "win32" && command === "npm") {
      const npm = process.env.npm_execpath || resolve3(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
      command = process.execPath;
      args = [npm, ...args];
    }
    if (stopping) throw new Error("Development host is stopping");
    const child = spawn3(command, args, { cwd: spec.cwd || project, env, stdio: ["ignore", watch2 ? "pipe" : "inherit", "inherit"], detached: process.platform !== "win32" });
    children.add(child);
    child.once("exit", () => {
      child.cleanup = stopProcessTree(child);
      child.cleanup.then(
        () => children.delete(child),
        () => {
        }
      );
    });
    return child;
  }
  async function run(spec) {
    diagnostics.record("info", "build", "\u6784\u5EFA\u547D\u4EE4\u5F00\u59CB");
    const child = await spawnCommand(spec);
    await new Promise((accept, reject) => {
      child.once("error", () => reject(new Error("Cannot start build command")));
      child.once("exit", (code) => code === 0 ? accept() : reject(new Error(`Build failed (exit ${code})`)));
    }).catch((error) => {
      diagnostics.record("error", "build", "\u6784\u5EFA\u547D\u4EE4\u5931\u8D25");
      throw error;
    });
    diagnostics.record("info", "build", "\u6784\u5EFA\u547D\u4EE4\u5B8C\u6210");
    if (stopping) throw new Error("Development host is stopping");
  }
  async function stopChildren() {
    await Promise.all([...children].map((child) => child.cleanup || stopProcessTree(child)));
  }
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
    await stopChildren();
    await host?.close();
  };
  const onSignal = () => void stop();
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    const commands = options.commands || {};
    if (commands.backend) await run(commands.backend);
    if (commands.ui?.length) await run(commands.ui);
    if (stopping) throw new Error("Development host is stopping");
    host = await createMockHost({
      ...options,
      project,
      dataDir,
      diagnostics,
      uiBuildSignals: Boolean(commands.watch?.length),
      shellHtml: options.shellHtml || resolve3(dirname(fileURLToPath(import.meta.url)), "ui/index.html"),
      buildBackend: commands.backend ? () => run(commands.backend) : void 0
    });
    if (stopping) {
      await host.close();
      throw new Error("Development host is stopping");
    }
    if (commands.watch?.length) {
      const watcher = await spawnCommand(commands.watch, true);
      let line = "", oversized = false;
      watcher.stdout.setEncoding("utf8");
      watcher.stdout.on("data", (chunk) => {
        process.stdout.write(chunk);
        for (const character of chunk) {
          if (character === "\n") {
            if (!oversized && line.replace(/\r$/, "") === "DBX_UI_BUILD_SUCCESS") {
              void host.uiBuilt().catch(() => diagnostics.record("error", "build", "\u524D\u7AEF\u6784\u5EFA\u4EA7\u7269\u4E0D\u53EF\u8BFB\u53D6"));
            }
            line = "";
            oversized = false;
          } else if (line.length < 1024) line += character;
          else oversized = true;
        }
      });
      watcher.on("error", () => diagnostics.record("error", "build", "\u524D\u7AEF\u6784\u5EFA\u76D1\u542C\u542F\u52A8\u5931\u8D25"));
      watcher.on("exit", (code) => {
        if (!stopping) diagnostics.record("error", "build", "\u524D\u7AEF\u6784\u5EFA\u76D1\u542C\u5DF2\u9000\u51FA", { exitCode: code });
      });
    }
    console.log(`Plugin dev host: ${host.origin}`);
    console.log("Development credentials are stored locally as plaintext in the configured data directory.");
    return { ...host, close: stop };
  } catch (error) {
    await stop();
    throw error;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve3(process.argv[1])).href) {
  try {
    if (process.argv[2] !== "--config" || !process.argv[3]) throw new Error("Start this runtime using dbx-plugin dev");
    await startDevelopment(JSON.parse(process.argv[3]));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
export {
  startDevelopment
};
