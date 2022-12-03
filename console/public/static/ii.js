
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
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
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/json-logic-js/logic.js
  var require_logic = __commonJS({
    "node_modules/json-logic-js/logic.js"(exports, module) {
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define(factory);
        } else if (typeof exports === "object") {
          module.exports = factory();
        } else {
          root.jsonLogic = factory();
        }
      })(exports, function() {
        "use strict";
        if (!Array.isArray) {
          Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
          };
        }
        function arrayUnique(array) {
          var a = [];
          for (var i = 0, l = array.length; i < l; i++) {
            if (a.indexOf(array[i]) === -1) {
              a.push(array[i]);
            }
          }
          return a;
        }
        var jsonLogic2 = {};
        var operations = {
          "==": function(a, b) {
            return a == b;
          },
          "===": function(a, b) {
            return a === b;
          },
          "!=": function(a, b) {
            return a != b;
          },
          "!==": function(a, b) {
            return a !== b;
          },
          ">": function(a, b) {
            return a > b;
          },
          ">=": function(a, b) {
            return a >= b;
          },
          "<": function(a, b, c) {
            return c === void 0 ? a < b : a < b && b < c;
          },
          "<=": function(a, b, c) {
            return c === void 0 ? a <= b : a <= b && b <= c;
          },
          "!!": function(a) {
            return jsonLogic2.truthy(a);
          },
          "!": function(a) {
            return !jsonLogic2.truthy(a);
          },
          "%": function(a, b) {
            return a % b;
          },
          "log": function(a) {
            console.log(a);
            return a;
          },
          "in": function(a, b) {
            if (!b || typeof b.indexOf === "undefined")
              return false;
            return b.indexOf(a) !== -1;
          },
          "cat": function() {
            return Array.prototype.join.call(arguments, "");
          },
          "substr": function(source, start, end) {
            if (end < 0) {
              var temp = String(source).substr(start);
              return temp.substr(0, temp.length + end);
            }
            return String(source).substr(start, end);
          },
          "+": function() {
            return Array.prototype.reduce.call(arguments, function(a, b) {
              return parseFloat(a, 10) + parseFloat(b, 10);
            }, 0);
          },
          "*": function() {
            return Array.prototype.reduce.call(arguments, function(a, b) {
              return parseFloat(a, 10) * parseFloat(b, 10);
            });
          },
          "-": function(a, b) {
            if (b === void 0) {
              return -a;
            } else {
              return a - b;
            }
          },
          "/": function(a, b) {
            return a / b;
          },
          "min": function() {
            return Math.min.apply(this, arguments);
          },
          "max": function() {
            return Math.max.apply(this, arguments);
          },
          "merge": function() {
            return Array.prototype.reduce.call(arguments, function(a, b) {
              return a.concat(b);
            }, []);
          },
          "var": function(a, b) {
            var not_found = b === void 0 ? null : b;
            var data = this;
            if (typeof a === "undefined" || a === "" || a === null) {
              return data;
            }
            var sub_props = String(a).split(".");
            for (var i = 0; i < sub_props.length; i++) {
              if (data === null || data === void 0) {
                return not_found;
              }
              data = data[sub_props[i]];
              if (data === void 0) {
                return not_found;
              }
            }
            return data;
          },
          "missing": function() {
            var missing = [];
            var keys4 = Array.isArray(arguments[0]) ? arguments[0] : arguments;
            for (var i = 0; i < keys4.length; i++) {
              var key = keys4[i];
              var value = jsonLogic2.apply({ "var": key }, this);
              if (value === null || value === "") {
                missing.push(key);
              }
            }
            return missing;
          },
          "missing_some": function(need_count, options) {
            var are_missing = jsonLogic2.apply({ "missing": options }, this);
            if (options.length - are_missing.length >= need_count) {
              return [];
            } else {
              return are_missing;
            }
          }
        };
        jsonLogic2.is_logic = function(logic) {
          return typeof logic === "object" && logic !== null && !Array.isArray(logic) && Object.keys(logic).length === 1;
        };
        jsonLogic2.truthy = function(value) {
          if (Array.isArray(value) && value.length === 0) {
            return false;
          }
          return !!value;
        };
        jsonLogic2.get_operator = function(logic) {
          return Object.keys(logic)[0];
        };
        jsonLogic2.get_values = function(logic) {
          return logic[jsonLogic2.get_operator(logic)];
        };
        jsonLogic2.apply = function(logic, data) {
          if (Array.isArray(logic)) {
            return logic.map(function(l) {
              return jsonLogic2.apply(l, data);
            });
          }
          if (!jsonLogic2.is_logic(logic)) {
            return logic;
          }
          var op = jsonLogic2.get_operator(logic);
          var values = logic[op];
          var i;
          var current;
          var scopedLogic;
          var scopedData;
          var initial;
          if (!Array.isArray(values)) {
            values = [values];
          }
          if (op === "if" || op == "?:") {
            for (i = 0; i < values.length - 1; i += 2) {
              if (jsonLogic2.truthy(jsonLogic2.apply(values[i], data))) {
                return jsonLogic2.apply(values[i + 1], data);
              }
            }
            if (values.length === i + 1) {
              return jsonLogic2.apply(values[i], data);
            }
            return null;
          } else if (op === "and") {
            for (i = 0; i < values.length; i += 1) {
              current = jsonLogic2.apply(values[i], data);
              if (!jsonLogic2.truthy(current)) {
                return current;
              }
            }
            return current;
          } else if (op === "or") {
            for (i = 0; i < values.length; i += 1) {
              current = jsonLogic2.apply(values[i], data);
              if (jsonLogic2.truthy(current)) {
                return current;
              }
            }
            return current;
          } else if (op === "filter") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData)) {
              return [];
            }
            return scopedData.filter(function(datum) {
              return jsonLogic2.truthy(jsonLogic2.apply(scopedLogic, datum));
            });
          } else if (op === "map") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData)) {
              return [];
            }
            return scopedData.map(function(datum) {
              return jsonLogic2.apply(scopedLogic, datum);
            });
          } else if (op === "reduce") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            initial = typeof values[2] !== "undefined" ? values[2] : null;
            if (!Array.isArray(scopedData)) {
              return initial;
            }
            return scopedData.reduce(
              function(accumulator, current2) {
                return jsonLogic2.apply(
                  scopedLogic,
                  { current: current2, accumulator }
                );
              },
              initial
            );
          } else if (op === "all") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return false;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (!jsonLogic2.truthy(jsonLogic2.apply(scopedLogic, scopedData[i]))) {
                return false;
              }
            }
            return true;
          } else if (op === "none") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return true;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (jsonLogic2.truthy(jsonLogic2.apply(scopedLogic, scopedData[i]))) {
                return false;
              }
            }
            return true;
          } else if (op === "some") {
            scopedData = jsonLogic2.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return false;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (jsonLogic2.truthy(jsonLogic2.apply(scopedLogic, scopedData[i]))) {
                return true;
              }
            }
            return false;
          }
          values = values.map(function(val) {
            return jsonLogic2.apply(val, data);
          });
          if (operations.hasOwnProperty(op) && typeof operations[op] === "function") {
            return operations[op].apply(data, values);
          } else if (op.indexOf(".") > 0) {
            var sub_ops = String(op).split(".");
            var operation = operations;
            for (i = 0; i < sub_ops.length; i++) {
              if (!operation.hasOwnProperty(sub_ops[i])) {
                throw new Error("Unrecognized operation " + op + " (failed at " + sub_ops.slice(0, i + 1).join(".") + ")");
              }
              operation = operation[sub_ops[i]];
            }
            return operation.apply(data, values);
          }
          throw new Error("Unrecognized operation " + op);
        };
        jsonLogic2.uses_data = function(logic) {
          var collection = [];
          if (jsonLogic2.is_logic(logic)) {
            var op = jsonLogic2.get_operator(logic);
            var values = logic[op];
            if (!Array.isArray(values)) {
              values = [values];
            }
            if (op === "var") {
              collection.push(values[0]);
            } else {
              values.forEach(function(val) {
                collection.push.apply(collection, jsonLogic2.uses_data(val));
              });
            }
          }
          return arrayUnique(collection);
        };
        jsonLogic2.add_operation = function(name, code) {
          operations[name] = code;
        };
        jsonLogic2.rm_operation = function(name) {
          delete operations[name];
        };
        jsonLogic2.rule_like = function(rule, pattern) {
          if (pattern === rule) {
            return true;
          }
          if (pattern === "@") {
            return true;
          }
          if (pattern === "number") {
            return typeof rule === "number";
          }
          if (pattern === "string") {
            return typeof rule === "string";
          }
          if (pattern === "array") {
            return Array.isArray(rule) && !jsonLogic2.is_logic(rule);
          }
          if (jsonLogic2.is_logic(pattern)) {
            if (jsonLogic2.is_logic(rule)) {
              var pattern_op = jsonLogic2.get_operator(pattern);
              var rule_op = jsonLogic2.get_operator(rule);
              if (pattern_op === "@" || pattern_op === rule_op) {
                return jsonLogic2.rule_like(
                  jsonLogic2.get_values(rule, false),
                  jsonLogic2.get_values(pattern, false)
                );
              }
            }
            return false;
          }
          if (Array.isArray(pattern)) {
            if (Array.isArray(rule)) {
              if (pattern.length !== rule.length) {
                return false;
              }
              for (var i = 0; i < pattern.length; i += 1) {
                if (!jsonLogic2.rule_like(rule[i], pattern[i])) {
                  return false;
                }
              }
              return true;
            } else {
              return false;
            }
          }
          return false;
        };
        return jsonLogic2;
      });
    }
  });

  // node_modules/@exodus/schemasafe/src/safe-format.js
  var require_safe_format = __commonJS({
    "node_modules/@exodus/schemasafe/src/safe-format.js"(exports, module) {
      "use strict";
      var SafeString = class extends String {
      };
      var compares = /* @__PURE__ */ new Set(["<", ">", "<=", ">="]);
      var escapeCode = (code) => `\\u${code.toString(16).padStart(4, "0")}`;
      var jsval = (val) => {
        if ([Infinity, -Infinity, NaN, void 0, null].includes(val))
          return `${val}`;
        const primitive = ["string", "boolean", "number"].includes(typeof val);
        if (!primitive) {
          if (typeof val !== "object")
            throw new Error("Unexpected value type");
          const proto = Object.getPrototypeOf(val);
          const ok = proto === Array.prototype && Array.isArray(val) || proto === Object.prototype;
          if (!ok)
            throw new Error("Unexpected object given as value");
        }
        return JSON.stringify(val).replace(/([{,])"__proto__":/g, '$1["__proto__"]:').replace(/[^\\]"__proto__":/g, () => {
          throw new Error("Unreachable");
        }).replace(/[\u2028\u2029]/g, (char) => escapeCode(char.charCodeAt(0)));
      };
      var format = (fmt, ...args) => {
        const res = fmt.replace(/%[%drscjw]/g, (match) => {
          if (match === "%%")
            return "%";
          if (args.length === 0)
            throw new Error("Unexpected arguments count");
          const val = args.shift();
          switch (match) {
            case "%d":
              if (typeof val === "number")
                return val;
              throw new Error("Expected a number");
            case "%r":
              if (val instanceof RegExp)
                return format("new RegExp(%j, %j)", val.source, val.flags);
              throw new Error("Expected a RegExp instance");
            case "%s":
              if (val instanceof SafeString)
                return val;
              throw new Error("Expected a safe string");
            case "%c":
              if (compares.has(val))
                return val;
              throw new Error("Expected a compare op");
            case "%j":
              return jsval(val);
            case "%w":
              if (Number.isInteger(val) && val >= 0)
                return " ".repeat(val);
              throw new Error("Expected a non-negative integer for indentation");
          }
          throw new Error("Unreachable");
        });
        if (args.length !== 0)
          throw new Error("Unexpected arguments count");
        return new SafeString(res);
      };
      var safe = (string) => {
        if (!/^[a-z][a-z0-9_]*$/i.test(string))
          throw new Error("Does not look like a safe id");
        return new SafeString(string);
      };
      var safewrap = (fun) => (...args) => {
        if (!args.every((arg) => arg instanceof SafeString))
          throw new Error("Unsafe arguments");
        return new SafeString(fun(...args));
      };
      var safepriority = (arg) => /^[a-z][a-z0-9_().]*$/i.test(arg) || /^\([^()]+\)$/i.test(arg) ? arg : format("(%s)", arg);
      var safeor = safewrap(
        (...args) => args.some((arg) => `${arg}` === "true") ? "true" : args.join(" || ") || "false"
      );
      var safeand = safewrap(
        (...args) => args.some((arg) => `${arg}` === "false") ? "false" : args.join(" && ") || "true"
      );
      var safenot = (arg) => {
        if (`${arg}` === "true")
          return safe("false");
        if (`${arg}` === "false")
          return safe("true");
        return format("!%s", safepriority(arg));
      };
      var safenotor = (...args) => safenot(safeor(...args));
      module.exports = { format, safe, safeand, safenot, safenotor };
    }
  });

  // node_modules/@exodus/schemasafe/src/scope-utils.js
  var require_scope_utils = __commonJS({
    "node_modules/@exodus/schemasafe/src/scope-utils.js"(exports, module) {
      "use strict";
      var { safe } = require_safe_format();
      var caches = /* @__PURE__ */ new WeakMap();
      var scopeMethods = (scope) => {
        if (!caches.has(scope))
          caches.set(scope, { sym: /* @__PURE__ */ new Map(), ref: /* @__PURE__ */ new Map(), format: /* @__PURE__ */ new Map(), pattern: /* @__PURE__ */ new Map() });
        const cache = caches.get(scope);
        const gensym = (name) => {
          if (!cache.sym.get(name))
            cache.sym.set(name, 0);
          const index = cache.sym.get(name);
          cache.sym.set(name, index + 1);
          return safe(`${name}${index}`);
        };
        const genpattern = (p) => {
          if (cache.pattern.has(p))
            return cache.pattern.get(p);
          const n = gensym("pattern");
          scope[n] = new RegExp(p, "u");
          cache.pattern.set(p, n);
          return n;
        };
        if (!cache.loop)
          cache.loop = "ijklmnopqrstuvxyz".split("");
        const genloop = () => {
          const v = cache.loop.shift();
          cache.loop.push(`${v}${v[0]}`);
          return safe(v);
        };
        const getref = (sub) => cache.ref.get(sub);
        const genref = (sub) => {
          const n = gensym("ref");
          cache.ref.set(sub, n);
          return n;
        };
        const genformat = (impl) => {
          let n = cache.format.get(impl);
          if (!n) {
            n = gensym("format");
            scope[n] = impl;
            cache.format.set(impl, n);
          }
          return n;
        };
        return { gensym, genpattern, genloop, getref, genref, genformat };
      };
      module.exports = { scopeMethods };
    }
  });

  // node_modules/@exodus/schemasafe/src/scope-functions.js
  var require_scope_functions = __commonJS({
    "node_modules/@exodus/schemasafe/src/scope-functions.js"(exports, module) {
      "use strict";
      var stringLength = (string) => /[\uD800-\uDFFF]/.test(string) ? [...string].length : string.length;
      var isMultipleOf = (value, divisor, factor, factorMultiple) => {
        if (value % divisor === 0)
          return true;
        let multiple = value * factor;
        if (multiple === Infinity || multiple === -Infinity)
          multiple = value;
        if (multiple % factorMultiple === 0)
          return true;
        const normal = Math.floor(multiple + 0.5);
        return normal / factor === value && normal % factorMultiple === 0;
      };
      var deepEqual = (obj, obj2) => {
        if (obj === obj2)
          return true;
        if (!obj || !obj2 || typeof obj !== typeof obj2)
          return false;
        if (obj !== obj2 && typeof obj !== "object")
          return false;
        const proto = Object.getPrototypeOf(obj);
        if (proto !== Object.getPrototypeOf(obj2))
          return false;
        if (proto === Array.prototype) {
          if (!Array.isArray(obj) || !Array.isArray(obj2))
            return false;
          if (obj.length !== obj2.length)
            return false;
          return obj.every((x, i) => deepEqual(x, obj2[i]));
        } else if (proto === Object.prototype) {
          const [keys4, keys22] = [Object.keys(obj), Object.keys(obj2)];
          if (keys4.length !== keys22.length)
            return false;
          const keyset2 = /* @__PURE__ */ new Set([...keys4, ...keys22]);
          return keyset2.size === keys4.length && keys4.every((key) => deepEqual(obj[key], obj2[key]));
        }
        return false;
      };
      var unique = (array) => {
        if (array.length < 2)
          return true;
        if (array.length === 2)
          return !deepEqual(array[0], array[1]);
        const objects = [];
        const primitives = array.length > 20 ? /* @__PURE__ */ new Set() : null;
        let primitivesCount = 0;
        let pos = 0;
        for (const item of array) {
          if (typeof item === "object") {
            objects.push(item);
          } else if (primitives) {
            primitives.add(item);
            if (primitives.size !== ++primitivesCount)
              return false;
          } else {
            if (array.indexOf(item, pos + 1) !== -1)
              return false;
          }
          pos++;
        }
        for (let i = 1; i < objects.length; i++)
          for (let j = 0; j < i; j++)
            if (deepEqual(objects[i], objects[j]))
              return false;
        return true;
      };
      var deBase64 = (string) => {
        if (typeof Buffer !== "undefined")
          return Buffer.from(string, "base64").toString("utf-8");
        const b = atob(string);
        return new TextDecoder("utf-8").decode(new Uint8Array(b.length).map((_2, i) => b.charCodeAt(i)));
      };
      var hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
      hasOwn[Symbol.for("toJayString")] = "Function.prototype.call.bind(Object.prototype.hasOwnProperty)";
      var pointerPart = (s) => /~\//.test(s) ? `${s}`.replace(/~/g, "~0").replace(/\//g, "~1") : s;
      var toPointer = (path) => path.length === 0 ? "#" : `#/${path.map(pointerPart).join("/")}`;
      var errorMerge = ({ keywordLocation, instanceLocation }, schemaBase, dataBase) => ({
        keywordLocation: `${schemaBase}${keywordLocation.slice(1)}`,
        instanceLocation: `${dataBase}${instanceLocation.slice(1)}`
      });
      var propertyIn = (key, [properties, patterns]) => properties.includes(true) || properties.some((prop) => prop === key) || patterns.some((pattern) => new RegExp(pattern, "u").test(key));
      var dynamicResolve = (anchors, id) => (anchors.filter((x) => x[id])[0] || {})[id];
      var extraUtils = { toPointer, pointerPart, errorMerge, propertyIn, dynamicResolve };
      module.exports = { stringLength, isMultipleOf, deepEqual, unique, deBase64, hasOwn, ...extraUtils };
    }
  });

  // node_modules/@exodus/schemasafe/src/javascript.js
  var require_javascript = __commonJS({
    "node_modules/@exodus/schemasafe/src/javascript.js"(exports, module) {
      "use strict";
      var { format, safe } = require_safe_format();
      var { scopeMethods } = require_scope_utils();
      var functions = require_scope_functions();
      var types = new Map(
        Object.entries({
          null: (name) => format("%s === null", name),
          boolean: (name) => format('typeof %s === "boolean"', name),
          array: (name) => format("Array.isArray(%s)", name),
          object: (n) => format('typeof %s === "object" && %s && !Array.isArray(%s)', n, n, n),
          number: (name) => format('typeof %s === "number"', name),
          integer: (name) => format("Number.isInteger(%s)", name),
          string: (name) => format('typeof %s === "string"', name)
        })
      );
      var buildName = ({ name, parent, keyval, keyname }) => {
        if (name) {
          if (parent || keyval || keyname)
            throw new Error("name can be used only stand-alone");
          return name;
        }
        if (!parent)
          throw new Error("Can not use property of undefined parent!");
        const parentName = buildName(parent);
        if (keyval !== void 0) {
          if (keyname)
            throw new Error("Can not use key value and name together");
          if (!["string", "number"].includes(typeof keyval))
            throw new Error("Invalid property path");
          if (/^[a-z][a-z0-9_]*$/i.test(keyval))
            return format("%s.%s", parentName, safe(keyval));
          return format("%s[%j]", parentName, keyval);
        } else if (keyname) {
          return format("%s[%s]", parentName, keyname);
        }
        throw new Error("Unreachable");
      };
      var jsonProtoKeys = new Set(
        [].concat(
          ...[Object, Array, String, Number, Boolean].map((c) => Object.getOwnPropertyNames(c.prototype))
        )
      );
      var jsHelpers = (fun, scope, propvar, { unmodifiedPrototypes, isJSON }, noopRegExps) => {
        const { gensym, genpattern, genloop } = scopeMethods(scope, propvar);
        const present = (obj) => {
          const name = buildName(obj);
          const { parent, keyval, keyname, inKeys, checked } = obj;
          if (checked || inKeys && isJSON)
            throw new Error("Unreachable: useless check for undefined");
          if (inKeys)
            return format("%s !== undefined", name);
          if (parent && keyname) {
            scope.hasOwn = functions.hasOwn;
            const pname = buildName(parent);
            if (isJSON)
              return format("%s !== undefined && hasOwn(%s, %s)", name, pname, keyname);
            return format("%s in %s && hasOwn(%s, %s)", keyname, pname, pname, keyname);
          } else if (parent && keyval !== void 0) {
            if (unmodifiedPrototypes && isJSON && !jsonProtoKeys.has(`${keyval}`))
              return format("%s !== undefined", name);
            scope.hasOwn = functions.hasOwn;
            const pname = buildName(parent);
            if (isJSON)
              return format("%s !== undefined && hasOwn(%s, %j)", name, pname, keyval);
            return format("%j in %s && hasOwn(%s, %j)", keyval, pname, pname, keyval);
          }
          throw new Error("Unreachable: present() check without parent");
        };
        const forObjectKeys = (obj, writeBody) => {
          const key = gensym("key");
          fun.block(format("for (const %s of Object.keys(%s))", key, buildName(obj)), () => {
            writeBody(propvar(obj, key, true), key);
          });
        };
        const forArray = (obj, start, writeBody) => {
          const i = genloop();
          const name = buildName(obj);
          fun.block(format("for (let %s = %s; %s < %s.length; %s++)", i, start, i, name, i), () => {
            writeBody(propvar(obj, i, unmodifiedPrototypes, true), i);
          });
        };
        const patternTest = (pat, key) => {
          const r = pat.replace(/[.^$|*+?(){}[\]\\]/gu, "");
          if (pat === `^${r}$`)
            return format("(%s === %j)", key, pat.slice(1, -1));
          if (noopRegExps.has(pat))
            return format("true");
          if ([r, `${r}+`, `${r}.*`, `.*${r}.*`].includes(pat))
            return format("%s.includes(%j)", key, r);
          if ([`^${r}`, `^${r}+`, `^${r}.*`].includes(pat))
            return format("%s.startsWith(%j)", key, r);
          if ([`${r}$`, `.*${r}$`].includes(pat))
            return format("%s.endsWith(%j)", key, r);
          const subr = [...r].slice(0, -1).join("");
          if ([`${r}*`, `${r}?`].includes(pat))
            return subr.length === 0 ? format("true") : format("%s.includes(%j)", key, subr);
          if ([`^${r}*`, `^${r}?`].includes(pat))
            return subr.length === 0 ? format("true") : format("%s.startsWith(%j)", key, subr);
          return format("%s.test(%s)", genpattern(pat), key);
        };
        const compare = (name, val) => {
          if (!val || typeof val !== "object")
            return format("%s === %j", name, val);
          let type3;
          const shouldInline = (arr) => arr.length <= 3 && arr.every((x) => !x || typeof x !== "object");
          if (Array.isArray(val)) {
            type3 = types.get("array")(name);
            if (shouldInline(val)) {
              let k = format("%s.length === %d", name, val.length);
              for (let i = 0; i < val.length; i++)
                k = format("%s && %s[%d] === %j", k, name, i, val[i]);
              return format("%s && %s", type3, k);
            }
          } else {
            type3 = types.get("object")(name);
            const [keys4, values] = [Object.keys(val), Object.values(val)];
            if (shouldInline(values)) {
              let k = format("Object.keys(%s).length === %d", name, keys4.length);
              if (keys4.length > 0)
                scope.hasOwn = functions.hasOwn;
              for (const key of keys4)
                k = format("%s && hasOwn(%s, %j)", k, name, key);
              for (const key of keys4)
                k = format("%s && %s[%j] === %j", k, name, key, val[key]);
              return format("%s && %s", type3, k);
            }
          }
          scope.deepEqual = functions.deepEqual;
          return format("%s && deepEqual(%s, %j)", type3, name, val);
        };
        return { present, forObjectKeys, forArray, patternTest, compare, propvar };
      };
      var isArrowFnWithParensRegex = /^\([^)]*\) *=>/;
      var isArrowFnWithoutParensRegex = /^[^=]*=>/;
      var toJayString = Symbol.for("toJayString");
      function jaystring(item) {
        if (typeof item === "function") {
          if (item[toJayString])
            return item[toJayString];
          if (Object.getPrototypeOf(item) !== Function.prototype)
            throw new Error("Can not stringify: a function with unexpected prototype");
          const stringified = `${item}`;
          if (item.prototype) {
            if (!/^function[ (]/.test(stringified))
              throw new Error("Unexpected function");
            return stringified;
          }
          if (isArrowFnWithParensRegex.test(stringified) || isArrowFnWithoutParensRegex.test(stringified))
            return stringified;
          throw new Error("Can not stringify: only either normal or arrow functions are supported");
        } else if (typeof item === "object") {
          const proto = Object.getPrototypeOf(item);
          if (item instanceof RegExp && proto === RegExp.prototype)
            return format("%r", item);
          throw new Error("Can not stringify: an object with unexpected prototype");
        }
        throw new Error(`Can not stringify: unknown type ${typeof item}`);
      }
      module.exports = { types, buildName, jsHelpers, jaystring };
    }
  });

  // node_modules/@exodus/schemasafe/src/generate-function.js
  var require_generate_function = __commonJS({
    "node_modules/@exodus/schemasafe/src/generate-function.js"(exports, module) {
      "use strict";
      var { format, safe, safenot } = require_safe_format();
      var { jaystring } = require_javascript();
      var INDENT_START = /[{[]/;
      var INDENT_END = /[}\]]/;
      module.exports = () => {
        const lines = [];
        let indent = 0;
        const pushLine = (line) => {
          if (INDENT_END.test(line.trim()[0]))
            indent--;
          lines.push({ indent, code: line });
          if (INDENT_START.test(line[line.length - 1]))
            indent++;
        };
        const build = () => {
          if (indent !== 0)
            throw new Error("Unexpected indent at build()");
          const joined = lines.map((line) => format("%w%s", line.indent * 2, line.code)).join("\n");
          return /^[a-z][a-z0-9]*$/i.test(joined) ? `return ${joined}` : `return (${joined})`;
        };
        const processScope = (scope) => {
          const entries = Object.entries(scope);
          for (const [key, value] of entries) {
            if (!/^[a-z][a-z0-9]*$/i.test(key))
              throw new Error("Unexpected scope key!");
            if (!(typeof value === "function" || value instanceof RegExp))
              throw new Error("Unexpected scope value!");
          }
          return entries;
        };
        return {
          optimizedOut: false,
          size: () => lines.length,
          write(fmt, ...args) {
            if (typeof fmt !== "string")
              throw new Error("Format must be a string!");
            if (fmt.includes("\n"))
              throw new Error("Only single lines are supported");
            pushLine(format(fmt, ...args));
            return true;
          },
          block(prefix, writeBody, noInline = false) {
            const oldIndent = indent;
            this.write("%s {", prefix);
            const length = lines.length;
            writeBody();
            if (length === lines.length) {
              lines.pop();
              indent = oldIndent;
              return false;
            } else if (length === lines.length - 1 && !noInline) {
              const { code } = lines[lines.length - 1];
              if (!/^(if|for) /.test(code)) {
                lines.length -= 2;
                indent = oldIndent;
                return this.write("%s %s", prefix, code);
              }
            }
            return this.write("}");
          },
          if(condition, writeBody, writeElse) {
            if (`${condition}` === "false") {
              if (writeElse)
                writeElse();
              if (writeBody)
                this.optimizedOut = true;
            } else if (`${condition}` === "true") {
              if (writeBody)
                writeBody();
              if (writeElse)
                this.optimizedOut = true;
            } else if (writeBody && this.block(format("if (%s)", condition), writeBody, !!writeElse)) {
              if (writeElse)
                this.block(format("else"), writeElse);
            } else if (writeElse) {
              this.if(safenot(condition), writeElse);
            }
          },
          makeModule(scope = {}) {
            const scopeDefs = processScope(scope).map(
              ([key, val]) => `const ${safe(key)} = ${jaystring(val)};`
            );
            return `(function() {
'use strict'
${scopeDefs.join("\n")}
${build()}`;
          },
          makeFunction(scope = {}) {
            const scopeEntries = processScope(scope);
            const keys4 = scopeEntries.map((entry) => entry[0]);
            const vals = scopeEntries.map((entry) => entry[1]);
            return Function(...keys4, `'use strict'
${build()}`)(...vals);
          }
        };
      };
    }
  });

  // node_modules/@exodus/schemasafe/src/known-keywords.js
  var require_known_keywords = __commonJS({
    "node_modules/@exodus/schemasafe/src/known-keywords.js"(exports, module) {
      "use strict";
      var knownKeywords = [
        ...["$schema", "$vocabulary"],
        ...["id", "$id", "$anchor", "$ref", "definitions", "$defs"],
        ...["$recursiveRef", "$recursiveAnchor", "$dynamicAnchor", "$dynamicRef"],
        ...["type", "required", "default"],
        ...["enum", "const"],
        ...["not", "allOf", "anyOf", "oneOf", "if", "then", "else"],
        ...["maximum", "minimum", "exclusiveMaximum", "exclusiveMinimum", "multipleOf", "divisibleBy"],
        ...["items", "maxItems", "minItems", "additionalItems", "prefixItems"],
        ...["contains", "minContains", "maxContains", "uniqueItems"],
        ...["maxLength", "minLength", "format", "pattern"],
        ...["contentEncoding", "contentMediaType", "contentSchema"],
        ...["properties", "maxProperties", "minProperties", "additionalProperties", "patternProperties"],
        ...["propertyNames", "dependencies", "dependentRequired", "dependentSchemas"],
        ...["unevaluatedProperties", "unevaluatedItems"],
        ...["title", "description", "deprecated", "readOnly", "writeOnly", "examples", "$comment"],
        "discriminator",
        "removeAdditional"
      ];
      var schemaDrafts = [
        ...["draft/next"],
        ...["draft/2020-12", "draft/2019-09"],
        ...["draft-07", "draft-06", "draft-04", "draft-03"]
      ];
      var schemaVersions = schemaDrafts.map((draft) => `https://json-schema.org/${draft}/schema`);
      var vocab2019 = ["core", "applicator", "validation", "meta-data", "format", "content"];
      var vocab2020 = [
        ...["core", "applicator", "unevaluated", "validation"],
        ...["meta-data", "format-annotation", "format-assertion", "content"]
      ];
      var knownVocabularies = [
        ...vocab2019.map((v) => `https://json-schema.org/draft/2019-09/vocab/${v}`),
        ...vocab2020.map((v) => `https://json-schema.org/draft/2020-12/vocab/${v}`)
      ];
      module.exports = { knownKeywords, schemaVersions, knownVocabularies };
    }
  });

  // node_modules/@exodus/schemasafe/src/pointer.js
  var require_pointer = __commonJS({
    "node_modules/@exodus/schemasafe/src/pointer.js"(exports, module) {
      "use strict";
      var { knownKeywords } = require_known_keywords();
      function untilde(string) {
        if (!string.includes("~"))
          return string;
        return string.replace(/~[01]/g, (match) => {
          switch (match) {
            case "~1":
              return "/";
            case "~0":
              return "~";
          }
          throw new Error("Unreachable");
        });
      }
      function get(obj, pointer, objpath) {
        if (typeof obj !== "object")
          throw new Error("Invalid input object");
        if (typeof pointer !== "string")
          throw new Error("Invalid JSON pointer");
        const parts = pointer.split("/");
        if (!["", "#"].includes(parts.shift()))
          throw new Error("Invalid JSON pointer");
        if (parts.length === 0)
          return obj;
        let curr = obj;
        for (const part of parts) {
          if (typeof part !== "string")
            throw new Error("Invalid JSON pointer");
          if (objpath)
            objpath.push(curr);
          const prop = untilde(part);
          if (typeof curr !== "object")
            return void 0;
          if (!Object.prototype.hasOwnProperty.call(curr, prop))
            return void 0;
          curr = curr[prop];
        }
        return curr;
      }
      var protocolRegex = /^https?:\/\//;
      function joinPath(baseFull, sub) {
        if (typeof baseFull !== "string" || typeof sub !== "string")
          throw new Error("Unexpected path!");
        if (sub.length === 0)
          return baseFull;
        const base = baseFull.replace(/#.*/, "");
        if (sub.startsWith("#"))
          return `${base}${sub}`;
        if (!base.includes("/") || protocolRegex.test(sub))
          return sub;
        if (protocolRegex.test(base))
          return `${new URL(sub, base)}`;
        if (sub.startsWith("/"))
          return sub;
        return [...base.split("/").slice(0, -1), sub].join("/");
      }
      function objpath2path(objpath) {
        const ids = objpath.map((obj) => obj && (obj.$id || obj.id) || "");
        return ids.filter((id) => id && typeof id === "string").reduce(joinPath, "");
      }
      var withSpecialChilds = ["properties", "patternProperties", "$defs", "definitions"];
      function resolveReference(root, additionalSchemas, ref, base = "") {
        const ptr = joinPath(base, ref);
        const schemas = new Map(additionalSchemas);
        const self2 = (base || "").split("#")[0];
        if (self2)
          schemas.set(self2, root);
        const results = [];
        const [main, hash = ""] = ptr.split("#");
        const local = decodeURI(hash).replace(/\/$/, "");
        const visit = (sub, oldPath, specialChilds = false, dynamic = false) => {
          if (!sub || typeof sub !== "object")
            return;
          const id = sub.$id || sub.id;
          let path = oldPath;
          if (id && typeof id === "string") {
            path = joinPath(path, id);
            if (path === ptr || path === main && local === "") {
              results.push([sub, root, oldPath]);
            } else if (path === main && local[0] === "/") {
              const objpath = [];
              const res = get(sub, local, objpath);
              if (res !== void 0)
                results.push([res, root, joinPath(oldPath, objpath2path(objpath))]);
            }
          }
          const anchor = dynamic ? sub.$dynamicAnchor : sub.$anchor;
          if (anchor && typeof anchor === "string") {
            if (anchor.includes("#"))
              throw new Error("$anchor can't include '#'");
            if (anchor.startsWith("/"))
              throw new Error("$anchor can't start with '/'");
            path = joinPath(path, `#${anchor}`);
            if (path === ptr)
              results.push([sub, root, oldPath]);
          }
          for (const k of Object.keys(sub)) {
            if (!specialChilds && !Array.isArray(sub) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            visit(sub[k], path, !specialChilds && withSpecialChilds.includes(k));
          }
          if (!dynamic && sub.$dynamicAnchor)
            visit(sub, oldPath, specialChilds, true);
        };
        visit(root, "");
        if (main === "" && (local[0] === "/" || local === "")) {
          const objpath = [];
          const res = get(root, local, objpath);
          if (res !== void 0)
            results.push([res, root, objpath2path(objpath)]);
        }
        if (schemas.has(main)) {
          const additional = resolveReference(schemas.get(main), additionalSchemas, `#${hash}`);
          results.push(...additional.map(([res, rRoot, rPath]) => [res, rRoot, joinPath(main, rPath)]));
        }
        if (schemas.has(ptr))
          results.push([schemas.get(ptr), schemas.get(ptr), ptr]);
        return results;
      }
      function getDynamicAnchors(schema) {
        const results = /* @__PURE__ */ new Map();
        const visit = (sub, specialChilds = false) => {
          if (!sub || typeof sub !== "object")
            return;
          if (sub !== schema && (sub.$id || sub.id))
            return;
          const anchor = sub.$dynamicAnchor;
          if (anchor && typeof anchor === "string") {
            if (anchor.includes("#"))
              throw new Error("$dynamicAnchor can't include '#'");
            if (!/^[a-zA-Z0-9_-]+$/.test(anchor))
              throw new Error(`Unsupported $dynamicAnchor: ${anchor}`);
            if (results.has(anchor))
              throw new Error(`duplicate $dynamicAnchor: ${anchor}`);
            results.set(anchor, sub);
          }
          for (const k of Object.keys(sub)) {
            if (!specialChilds && !Array.isArray(sub) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            visit(sub[k], !specialChilds && withSpecialChilds.includes(k));
          }
        };
        visit(schema);
        return results;
      }
      function hasKeywords(schema, keywords) {
        const visit = (sub, specialChilds = false) => {
          if (!sub || typeof sub !== "object")
            return false;
          for (const k of Object.keys(sub)) {
            if (keywords.includes(k))
              return true;
            if (!specialChilds && !Array.isArray(sub) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            if (visit(sub[k], !specialChilds && withSpecialChilds.includes(k)))
              return true;
          }
          return false;
        };
        return visit(schema);
      }
      var buildSchemas = (input) => {
        if (input) {
          switch (Object.getPrototypeOf(input)) {
            case Object.prototype:
              return new Map(Object.entries(input));
            case Map.prototype:
              return new Map(input);
            case Array.prototype: {
              const schemas = /* @__PURE__ */ new Map();
              const cleanId = (id) => id && typeof id === "string" && !/#./.test(id) ? id.replace(/#$/, "") : null;
              for (const schema of input) {
                const visit = (sub) => {
                  if (!sub || typeof sub !== "object")
                    return;
                  const id = cleanId(sub.$id || sub.id);
                  if (id && id.includes("://")) {
                    if (schemas.has(id))
                      throw new Error("Duplicate schema $id in 'schemas'");
                    schemas.set(id, sub);
                  } else if (sub === schema) {
                    throw new Error("Schema with missing or invalid $id in 'schemas'");
                  }
                  for (const k of Object.keys(sub))
                    visit(sub[k]);
                };
                visit(schema);
              }
              return schemas;
            }
          }
        }
        throw new Error("Unexpected value for 'schemas' option");
      };
      module.exports = { get, joinPath, resolveReference, getDynamicAnchors, hasKeywords, buildSchemas };
    }
  });

  // node_modules/@exodus/schemasafe/src/formats.js
  var require_formats = __commonJS({
    "node_modules/@exodus/schemasafe/src/formats.js"(exports, module) {
      "use strict";
      var core = {
        email: (input) => {
          if (input.length > 318)
            return false;
          const fast = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]{1,20}(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]{1,21}){0,2}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,60}[a-z0-9])?){0,3}$/i;
          if (fast.test(input))
            return true;
          if (!input.includes("@") || /(^\.|^"|\.@|\.\.)/.test(input))
            return false;
          const [name, host, ...rest] = input.split("@");
          if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253)
            return false;
          if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name))
            return false;
          return host.split(".").every((part) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part));
        },
        hostname: (input) => {
          if (input.length > (input.endsWith(".") ? 254 : 253))
            return false;
          const hostname = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.?$/i;
          return hostname.test(input);
        },
        date: (input) => {
          if (input.length !== 10)
            return false;
          if (input[5] === "0" && input[6] === "2") {
            if (/^\d\d\d\d-02-(?:[012][1-8]|[12]0|[01]9)$/.test(input))
              return true;
            const matches = input.match(/^(\d\d\d\d)-02-29$/);
            if (!matches)
              return false;
            const year = matches[1] | 0;
            return year % 16 === 0 || year % 4 === 0 && year % 25 !== 0;
          }
          if (input.endsWith("31"))
            return /^\d\d\d\d-(?:0[13578]|1[02])-31$/.test(input);
          return /^\d\d\d\d-(?:0[13-9]|1[012])-(?:[012][1-9]|[123]0)$/.test(input);
        },
        time: (input) => {
          if (input.length > 9 + 12 + 6)
            return false;
          const time = /^(?:2[0-3]|[0-1]\d):[0-5]\d:(?:[0-5]\d|60)(?:\.\d+)?(?:z|[+-](?:2[0-3]|[0-1]\d)(?::?[0-5]\d)?)?$/i;
          if (!time.test(input))
            return false;
          if (!/:60/.test(input))
            return true;
          const p = input.match(/([0-9.]+|[^0-9.])/g);
          let hm = Number(p[0]) * 60 + Number(p[2]);
          if (p[5] === "+")
            hm += 24 * 60 - Number(p[6] || 0) * 60 - Number(p[8] || 0);
          else if (p[5] === "-")
            hm += Number(p[6] || 0) * 60 + Number(p[8] || 0);
          return hm % (24 * 60) === 23 * 60 + 59;
        },
        "date-time": (input) => {
          if (input.length > 10 + 1 + 9 + 12 + 6)
            return false;
          const full = /^\d\d\d\d-(?:0[1-9]|1[0-2])-(?:[0-2]\d|3[01])[t\s](?:2[0-3]|[0-1]\d):[0-5]\d:(?:[0-5]\d|60)(?:\.\d+)?(?:z|[+-](?:2[0-3]|[0-1]\d)(?::?[0-5]\d)?)$/i;
          const feb = input[5] === "0" && input[6] === "2";
          if (feb && input[8] === "3" || !full.test(input))
            return false;
          if (input[17] === "6") {
            const p = input.slice(11).match(/([0-9.]+|[^0-9.])/g);
            let hm = Number(p[0]) * 60 + Number(p[2]);
            if (p[5] === "+")
              hm += 24 * 60 - Number(p[6] || 0) * 60 - Number(p[8] || 0);
            else if (p[5] === "-")
              hm += Number(p[6] || 0) * 60 + Number(p[8] || 0);
            if (hm % (24 * 60) !== 23 * 60 + 59)
              return false;
          }
          if (feb) {
            if (/^\d\d\d\d-02-(?:[012][1-8]|[12]0|[01]9)/.test(input))
              return true;
            const matches = input.match(/^(\d\d\d\d)-02-29/);
            if (!matches)
              return false;
            const year = matches[1] | 0;
            return year % 16 === 0 || year % 4 === 0 && year % 25 !== 0;
          }
          if (input[8] === "3" && input[9] === "1")
            return /^\d\d\d\d-(?:0[13578]|1[02])-31/.test(input);
          return /^\d\d\d\d-(?:0[13-9]|1[012])-(?:[012][1-9]|[123]0)/.test(input);
        },
        ipv4: (ip) => ip.length <= 15 && /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)$/.test(ip),
        ipv6: (input) => {
          if (input.length > 45 || input.length < 2)
            return false;
          let s0 = 0, s1 = 0, hex = 0, short = false, letters = false, last = 0, start = true;
          for (let i = 0; i < input.length; i++) {
            const c = input.charCodeAt(i);
            if (i === 1 && last === 58 && c !== 58)
              return false;
            if (c >= 48 && c <= 57) {
              if (++hex > 4)
                return false;
            } else if (c === 46) {
              if (s0 > 6 || s1 >= 3 || hex === 0 || letters)
                return false;
              s1++;
              hex = 0;
            } else if (c === 58) {
              if (s1 > 0 || s0 >= 7)
                return false;
              if (last === 58) {
                if (short)
                  return false;
                short = true;
              } else if (i === 0)
                start = false;
              s0++;
              hex = 0;
              letters = false;
            } else if (c >= 97 && c <= 102 || c >= 65 && c <= 70) {
              if (s1 > 0)
                return false;
              if (++hex > 4)
                return false;
              letters = true;
            } else
              return false;
            last = c;
          }
          if (s0 < 2 || s1 > 0 && (s1 !== 3 || hex === 0))
            return false;
          if (short && input.length === 2)
            return true;
          if (s1 > 0 && !/(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(input))
            return false;
          const spaces = s1 > 0 ? 6 : 7;
          if (!short)
            return s0 === spaces && start && hex > 0;
          return (start || hex > 0) && s0 < spaces;
        },
        uri: /^[a-z][a-z0-9+\-.]*:(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/?(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
        "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/?(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?)?(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
        "uri-template": /^(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2}|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
        "json-pointer": /^(?:|\/(?:[^~]|~0|~1)*)$/,
        "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:|#|\/(?:[^~]|~0|~1)*)$/,
        uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        duration: (input) => input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input))
      };
      var extra = {
        alpha: /^[a-zA-Z]+$/,
        alphanumeric: /^[a-zA-Z0-9]+$/,
        "hex-digits": /^[0-9a-f]+$/i,
        "hex-digits-prefixed": /^0x[0-9a-f]+$/i,
        "hex-bytes": /^([0-9a-f][0-9a-f])+$/i,
        "hex-bytes-prefixed": /^0x([0-9a-f][0-9a-f])+$/i,
        base64: (input) => input.length % 4 === 0 && /^[a-z0-9+/]*={0,3}$/i.test(input),
        "json-pointer-uri-fragment": /^#(|\/(\/|[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)$/i,
        "host-name": core.hostname,
        "ip-address": core.ipv4,
        color: /^(#[0-9A-Fa-f]{3,6}|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|rgb\(\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*\)|rgb\(\s*(\d?\d%|100%)\s*,\s*(\d?\d%|100%)\s*,\s*(\d?\d%|100%)\s*\))$/
      };
      var weak = {
        regex: (str) => {
          if (str.length > 1e5)
            return false;
          const Z_ANCHOR = /[^\\]\\Z/;
          if (Z_ANCHOR.test(str))
            return false;
          try {
            new RegExp(str);
            return true;
          } catch (e) {
            return false;
          }
        }
      };
      module.exports = { core, extra, weak };
    }
  });

  // node_modules/@exodus/schemasafe/src/tracing.js
  var require_tracing = __commonJS({
    "node_modules/@exodus/schemasafe/src/tracing.js"(exports, module) {
      "use strict";
      var merge = (a, b) => [.../* @__PURE__ */ new Set([...a, ...b])].sort();
      var intersect = (a, b) => a.filter((x) => b.includes(x));
      var wrapArgs = (f) => (...args) => f(...args.map(normalize));
      var wrapFull = (f) => (...args) => normalize(f(...args.map(normalize)));
      var typeIsNot = (type3, t) => type3 && !type3.includes(t);
      var normalize = ({ type: type3 = null, dyn: d = {}, ...A }) => ({
        type: type3 ? [...type3].sort() : type3,
        items: typeIsNot(type3, "array") ? Infinity : A.items || 0,
        properties: typeIsNot(type3, "object") ? [true] : [...A.properties || []].sort(),
        patterns: typeIsNot(type3, "object") ? [] : [...A.patterns || []].sort(),
        required: typeIsNot(type3, "object") ? [] : [...A.required || []].sort(),
        fullstring: typeIsNot(type3, "string") || A.fullstring || false,
        dyn: {
          item: typeIsNot(type3, "array") ? false : d.item || false,
          items: typeIsNot(type3, "array") ? 0 : Math.max(A.items || 0, d.items || 0),
          properties: typeIsNot(type3, "object") ? [] : merge(A.properties || [], d.properties || []),
          patterns: typeIsNot(type3, "object") ? [] : merge(A.patterns || [], d.patterns || [])
        },
        unknown: A.unknown && !(typeIsNot(type3, "object") && typeIsNot(type3, "array")) || false
      });
      var initTracing = () => normalize({});
      var andDelta = wrapFull((A, B) => ({
        type: A.type && B.type ? intersect(A.type, B.type) : A.type || B.type || null,
        items: Math.max(A.items, B.items),
        properties: merge(A.properties, B.properties),
        patterns: merge(A.patterns, B.patterns),
        required: merge(A.required, B.required),
        fullstring: A.fullstring || B.fullstring,
        dyn: {
          item: A.dyn.item || B.dyn.item,
          items: Math.max(A.dyn.items, B.dyn.items),
          properties: merge(A.dyn.properties, B.dyn.properties),
          patterns: merge(A.dyn.patterns, B.dyn.patterns)
        },
        unknown: A.unknown || B.unknown
      }));
      var regtest = (pattern, value) => value !== true && new RegExp(pattern, "u").test(value);
      var intersectProps = ({ properties: a, patterns: rega }, { properties: b, patterns: regb }) => {
        const af = a.filter((x) => b.includes(x) || b.includes(true) || regb.some((p) => regtest(p, x)));
        const bf = b.filter((x) => a.includes(x) || a.includes(true) || rega.some((p) => regtest(p, x)));
        const ar = rega.filter((x) => regb.includes(x) || b.includes(true));
        const br = regb.filter((x) => rega.includes(x) || a.includes(true));
        return { properties: merge(af, bf), patterns: merge(ar, br) };
      };
      var inProperties = ({ properties: a, patterns: rega }, { properties: b, patterns: regb }) => b.every((x) => a.includes(x) || a.includes(true) || rega.some((p) => regtest(p, x))) && regb.every((x) => rega.includes(x) || a.includes(true));
      var orDelta = wrapFull((A, B) => ({
        type: A.type && B.type ? merge(A.type, B.type) : null,
        items: Math.min(A.items, B.items),
        ...intersectProps(A, B),
        required: typeIsNot(A.type, "object") && B.required || typeIsNot(B.type, "object") && A.required || intersect(A.required, B.required),
        fullstring: A.fullstring && B.fullstring,
        dyn: {
          item: A.dyn.item || B.dyn.item,
          items: Math.max(A.dyn.items, B.dyn.items),
          properties: merge(A.dyn.properties, B.dyn.properties),
          patterns: merge(A.dyn.patterns, B.dyn.patterns)
        },
        unknown: A.unknown || B.unknown
      }));
      var applyDelta = (stat, delta) => Object.assign(stat, andDelta(stat, delta));
      var isDynamic = wrapArgs(({ unknown, items, dyn, ...stat }) => ({
        items: items !== Infinity && (unknown || dyn.items > items || dyn.item),
        properties: !stat.properties.includes(true) && (unknown || !inProperties(stat, dyn))
      }));
      module.exports = { initTracing, andDelta, orDelta, applyDelta, isDynamic, inProperties };
    }
  });

  // node_modules/@exodus/schemasafe/src/compile.js
  var require_compile = __commonJS({
    "node_modules/@exodus/schemasafe/src/compile.js"(exports, module) {
      "use strict";
      var { format, safe, safeand, safenot, safenotor } = require_safe_format();
      var genfun = require_generate_function();
      var { resolveReference, joinPath, getDynamicAnchors, hasKeywords } = require_pointer();
      var formats = require_formats();
      var { toPointer, ...functions } = require_scope_functions();
      var { scopeMethods } = require_scope_utils();
      var { buildName, types, jsHelpers } = require_javascript();
      var { knownKeywords, schemaVersions, knownVocabularies } = require_known_keywords();
      var { initTracing, andDelta, orDelta, applyDelta, isDynamic, inProperties } = require_tracing();
      var noopRegExps = /* @__PURE__ */ new Set(["^[\\s\\S]*$", "^[\\S\\s]*$", "^[^]*$", "", ".*", "^", "$"]);
      var primitiveTypes = ["null", "boolean", "number", "integer", "string"];
      var schemaTypes = new Map(
        Object.entries({
          boolean: (arg) => typeof arg === "boolean",
          array: (arg) => Array.isArray(arg) && Object.getPrototypeOf(arg) === Array.prototype,
          object: (arg) => arg && Object.getPrototypeOf(arg) === Object.prototype,
          finite: (arg) => Number.isFinite(arg),
          natural: (arg) => Number.isInteger(arg) && arg >= 0,
          string: (arg) => typeof arg === "string",
          jsonval: (arg) => functions.deepEqual(arg, JSON.parse(JSON.stringify(arg)))
        })
      );
      var isPlainObject = schemaTypes.get("object");
      var schemaIsOlderThan = ($schema, ver) => schemaVersions.indexOf($schema) > schemaVersions.indexOf(`https://json-schema.org/${ver}/schema`);
      var propvar = (parent, keyname, inKeys = false, number = false) => Object.freeze({ parent, keyname, inKeys, number });
      var propimm = (parent, keyval, checked = false) => Object.freeze({ parent, keyval, checked });
      var evaluatedStatic = Symbol("evaluatedStatic");
      var optDynamic = Symbol("optDynamic");
      var optDynAnchors = Symbol("optDynAnchors");
      var optRecAnchors = Symbol("optRecAnchors");
      var constantValue = (schema) => {
        if (typeof schema === "boolean")
          return schema;
        if (isPlainObject(schema) && Object.keys(schema).length === 0)
          return true;
        return void 0;
      };
      var rootMeta = /* @__PURE__ */ new WeakMap();
      var generateMeta = (root, $schema, enforce, requireSchema) => {
        if ($schema) {
          const version = $schema.replace(/^http:\/\//, "https://").replace(/#$/, "");
          enforce(schemaVersions.includes(version), "Unexpected schema version:", version);
          rootMeta.set(root, {
            exclusiveRefs: schemaIsOlderThan(version, "draft/2019-09"),
            contentValidation: schemaIsOlderThan(version, "draft/2019-09"),
            newItemsSyntax: !schemaIsOlderThan(version, "draft/2020-12"),
            containsEvaluates: !schemaIsOlderThan(version, "draft/2020-12")
          });
        } else {
          enforce(!requireSchema, "[requireSchema] $schema is required");
          rootMeta.set(root, {});
        }
      };
      var compileSchema = (schema, root, opts, scope, basePathRoot = "") => {
        const {
          mode = "default",
          useDefaults = false,
          removeAdditional = false,
          includeErrors = false,
          allErrors = false,
          contentValidation,
          dryRun,
          allowUnusedKeywords = opts.mode === "lax",
          allowUnreachable = opts.mode === "lax",
          requireSchema = opts.mode === "strong",
          requireValidation = opts.mode === "strong",
          requireStringValidation = opts.mode === "strong",
          forbidNoopValues = opts.mode === "strong",
          complexityChecks = opts.mode === "strong",
          unmodifiedPrototypes = false,
          isJSON = false,
          $schemaDefault = null,
          formats: optFormats = {},
          weakFormats = opts.mode !== "strong",
          extraFormats = false,
          schemas,
          ...unknown
        } = opts;
        const fmts = {
          ...formats.core,
          ...weakFormats ? formats.weak : {},
          ...extraFormats ? formats.extra : {},
          ...optFormats
        };
        if (Object.keys(unknown).length !== 0)
          throw new Error(`Unknown options: ${Object.keys(unknown).join(", ")}`);
        if (!["strong", "lax", "default"].includes(mode))
          throw new Error(`Invalid mode: ${mode}`);
        if (!includeErrors && allErrors)
          throw new Error("allErrors requires includeErrors to be enabled");
        if (requireSchema && $schemaDefault)
          throw new Error("requireSchema forbids $schemaDefault");
        if (mode === "strong") {
          const strong = { requireValidation, requireStringValidation, complexityChecks, requireSchema };
          const weak = { weakFormats, allowUnusedKeywords };
          for (const [k, v] of Object.entries(strong))
            if (!v)
              throw new Error(`Strong mode demands ${k}`);
          for (const [k, v] of Object.entries(weak))
            if (v)
              throw new Error(`Strong mode forbids ${k}`);
        }
        const { gensym, getref, genref, genformat } = scopeMethods(scope);
        const buildPath = (prop) => {
          const path = [];
          let curr = prop;
          while (curr) {
            if (!curr.name)
              path.unshift(curr);
            curr = curr.parent || curr.errorParent;
          }
          if (path.every((part) => part.keyval !== void 0))
            return format("%j", toPointer(path.map((part) => part.keyval)));
          const stringParts = ["#"];
          const stringJoined = () => {
            const value = stringParts.map(functions.pointerPart).join("/");
            stringParts.length = 0;
            return value;
          };
          let res = null;
          for (const { keyname, keyval, number } of path) {
            if (keyname) {
              if (!number)
                scope.pointerPart = functions.pointerPart;
              const value = number ? keyname : format("pointerPart(%s)", keyname);
              const str = `${stringJoined()}/`;
              res = res ? format("%s+%j+%s", res, str, value) : format("%j+%s", str, value);
            } else if (keyval)
              stringParts.push(keyval);
          }
          return stringParts.length > 0 ? format("%s+%j", res, `/${stringJoined()}`) : res;
        };
        const funname = genref(schema);
        let validate2 = null;
        const wrap = (...args) => {
          const res = validate2(...args);
          wrap.errors = validate2.errors;
          return res;
        };
        scope[funname] = wrap;
        const hasRefs = hasKeywords(schema, ["$ref", "$recursiveRef", "$dynamicRef"]);
        const hasDynAnchors = opts[optDynAnchors] && hasRefs && hasKeywords(schema, ["$dynamicAnchor"]);
        const dynAnchorsHead = () => {
          if (!opts[optDynAnchors])
            return format("");
          return hasDynAnchors ? format(", dynAnchors = []") : format(", dynAnchors");
        };
        const recAnchorsHead = opts[optRecAnchors] ? format(", recursive") : format("");
        const fun = genfun();
        fun.write("function validate(data%s%s) {", recAnchorsHead, dynAnchorsHead());
        if (includeErrors)
          fun.write("validate.errors = null");
        if (allErrors)
          fun.write("let errorCount = 0");
        if (opts[optDynamic])
          fun.write("validate.evaluatedDynamic = null");
        let dynamicAnchorsNext = opts[optDynAnchors] ? format(", dynAnchors") : format("");
        if (hasDynAnchors) {
          fun.write("const dynLocal = [{}]");
          dynamicAnchorsNext = format(", [...dynAnchors, dynLocal[0] || []]");
        }
        const helpers = jsHelpers(fun, scope, propvar, { unmodifiedPrototypes, isJSON }, noopRegExps);
        const { present, forObjectKeys, forArray, patternTest, compare } = helpers;
        const recursiveLog = [];
        const getMeta = () => rootMeta.get(root);
        const basePathStack = basePathRoot ? [basePathRoot] : [];
        const visit = (errors, history, current, node, schemaPath, trace = {}, { constProp } = {}) => {
          const isSub = history.length > 0 && history[history.length - 1].prop === current;
          const queryCurrent = () => history.filter((h) => h.prop === current);
          const definitelyPresent = !current.parent || current.checked || current.inKeys && isJSON || queryCurrent().length > 0;
          const name = buildName(current);
          const currPropImm = (...args) => propimm(current, ...args);
          const error = ({ path = [], prop = current, source, suberr }) => {
            const schemaP = toPointer([...schemaPath, ...path]);
            const dataP = includeErrors ? buildPath(prop) : null;
            if (includeErrors === true && errors && source) {
              scope.errorMerge = functions.errorMerge;
              const args = [source, schemaP, dataP];
              if (allErrors) {
                fun.write("if (validate.errors === null) validate.errors = []");
                fun.write("validate.errors.push(...%s.map(e => errorMerge(e, %j, %s)))", ...args);
              } else
                fun.write("validate.errors = [errorMerge(%s[0], %j, %s)]", ...args);
            } else if (includeErrors === true && errors) {
              const errorJS = format("{ keywordLocation: %j, instanceLocation: %s }", schemaP, dataP);
              if (allErrors) {
                fun.write("if (%s === null) %s = []", errors, errors);
                fun.write("%s.push(%s)", errors, errorJS);
              } else
                fun.write("%s = [%s]", errors, errorJS);
            }
            if (suberr)
              mergeerror(suberr);
            if (allErrors)
              fun.write("errorCount++");
            else
              fun.write("return false");
          };
          const errorIf = (condition, errorArgs) => fun.if(condition, () => error(errorArgs));
          const fail = (msg, value) => {
            const comment = value !== void 0 ? ` ${JSON.stringify(value)}` : "";
            throw new Error(`${msg}${comment} at ${joinPath(basePathRoot, toPointer(schemaPath))}`);
          };
          const enforce = (ok, ...args) => ok || fail(...args);
          const laxMode = (ok, ...args) => enforce(mode === "lax" || ok, ...args);
          const enforceMinMax = (a, b) => laxMode(!(node[b] < node[a]), `Invalid ${a} / ${b} combination`);
          const enforceValidation = (msg, suffix = "should be specified") => enforce(!requireValidation, `[requireValidation] ${msg} ${suffix}`);
          const subPath = (...args) => [...schemaPath, ...args];
          const uncertain = (msg) => enforce(!removeAdditional && !useDefaults, `[removeAdditional/useDefaults] uncertain: ${msg}`);
          const complex = (msg, arg) => enforce(!complexityChecks, `[complexityChecks] ${msg}`, arg);
          const saveMeta = ($sch) => generateMeta(root, $sch || $schemaDefault, enforce, requireSchema);
          const stat2 = initTracing();
          const evaluateDelta = (delta) => applyDelta(stat2, delta);
          if (typeof node === "boolean") {
            if (node === true) {
              enforceValidation("schema = true", "is not allowed");
              return { stat: stat2 };
            }
            errorIf(definitelyPresent || current.inKeys ? true : present(current), {});
            evaluateDelta({ type: [] });
            return { stat: stat2 };
          }
          enforce(isPlainObject(node), "Schema is not an object");
          for (const key of Object.keys(node))
            enforce(knownKeywords.includes(key) || allowUnusedKeywords, "Keyword not supported:", key);
          if (Object.keys(node).length === 0) {
            enforceValidation("empty rules node", "is not allowed");
            return { stat: stat2 };
          }
          const unused = new Set(Object.keys(node));
          const consume = (prop, ...ruleTypes) => {
            enforce(unused.has(prop), "Unexpected double consumption:", prop);
            enforce(functions.hasOwn(node, prop), "Is not an own property:", prop);
            enforce(ruleTypes.every((t) => schemaTypes.has(t)), "Invalid type used in consume");
            enforce(ruleTypes.some((t) => schemaTypes.get(t)(node[prop])), "Unexpected type for", prop);
            unused.delete(prop);
          };
          const get = (prop, ...ruleTypes) => {
            if (node[prop] !== void 0)
              consume(prop, ...ruleTypes);
            return node[prop];
          };
          const handle2 = (prop, ruleTypes, handler, errorArgs = {}) => {
            if (node[prop] === void 0)
              return false;
            consume(prop, ...ruleTypes);
            if (handler !== null) {
              const condition = handler(node[prop]);
              if (condition !== null)
                errorIf(condition, { path: [prop], ...errorArgs });
            }
            return true;
          };
          if (node === root) {
            saveMeta(get("$schema", "string"));
            handle2("$vocabulary", ["object"], ($vocabulary) => {
              for (const [vocab, flag] of Object.entries($vocabulary)) {
                if (flag === false)
                  continue;
                enforce(flag === true && knownVocabularies.includes(vocab), "Unknown vocabulary:", vocab);
              }
              return null;
            });
          } else if (!getMeta())
            saveMeta(root.$schema);
          handle2("examples", ["array"], null);
          for (const ignore of ["title", "description", "$comment"])
            handle2(ignore, ["string"], null);
          for (const ignore of ["deprecated", "readOnly", "writeOnly"])
            handle2(ignore, ["boolean"], null);
          handle2("$defs", ["object"], null) || handle2("definitions", ["object"], null);
          const compileSub = (sub, subR, path) => sub === schema ? safe("validate") : getref(sub) || compileSchema(sub, subR, opts, scope, path);
          const basePath = () => basePathStack.length > 0 ? basePathStack[basePathStack.length - 1] : "";
          const setId = ($id) => {
            basePathStack.push(joinPath(basePath(), $id));
            return null;
          };
          if (!getMeta().exclusiveRefs || !node.$ref) {
            handle2("$id", ["string"], setId) || handle2("id", ["string"], setId);
            handle2("$anchor", ["string"], null);
            handle2("$dynamicAnchor", ["string"], null);
            if (node.$recursiveAnchor || !forbidNoopValues) {
              handle2("$recursiveAnchor", ["boolean"], (isRecursive) => {
                if (isRecursive)
                  recursiveLog.push([node, root, basePath()]);
                return null;
              });
            }
          }
          const isDynScope = hasDynAnchors && (node === schema || node.id || node.$id);
          if (isDynScope) {
            const allDynamic = getDynamicAnchors(node);
            if (node !== schema)
              fun.write("dynLocal.unshift({})");
            for (const [key, subcheck] of allDynamic) {
              const resolved = resolveReference(root, schemas, `#${key}`, basePath());
              const [sub, subRoot, path] = resolved[0] || [];
              enforce(sub === subcheck, `Unexpected $dynamicAnchor resolution: ${key}`);
              const n = compileSub(sub, subRoot, path);
              fun.write("dynLocal[0][%j] = %s", `#${key}`, n);
            }
          }
          const needUnevaluated = (rule2) => opts[optDynamic] && (node[rule2] || node[rule2] === false || node === schema);
          const local2 = Object.freeze({
            item: needUnevaluated("unevaluatedItems") ? gensym("evaluatedItem") : null,
            items: needUnevaluated("unevaluatedItems") ? gensym("evaluatedItems") : null,
            props: needUnevaluated("unevaluatedProperties") ? gensym("evaluatedProps") : null
          });
          const dyn = Object.freeze({
            item: local2.item || trace.item,
            items: local2.items || trace.items,
            props: local2.props || trace.props
          });
          const canSkipDynamic = () => (!dyn.items || stat2.items === Infinity) && (!dyn.props || stat2.properties.includes(true));
          const evaluateDeltaDynamic = (delta) => {
            if (dyn.item && delta.item && stat2.items !== Infinity)
              fun.write("%s.push(%s)", dyn.item, delta.item);
            if (dyn.items && delta.items > stat2.items)
              fun.write("%s.push(%d)", dyn.items, delta.items);
            if (dyn.props && delta.properties.includes(true) && !stat2.properties.includes(true)) {
              fun.write("%s[0].push(true)", dyn.props);
            } else if (dyn.props) {
              const inStat = (properties2, patterns2) => inProperties(stat2, { properties: properties2, patterns: patterns2 });
              const properties = delta.properties.filter((x) => !inStat([x], []));
              const patterns = delta.patterns.filter((x) => !inStat([], [x]));
              if (properties.length > 0)
                fun.write("%s[0].push(...%j)", dyn.props, properties);
              if (patterns.length > 0)
                fun.write("%s[1].push(...%j)", dyn.props, patterns);
            }
          };
          const applyDynamicToDynamic = (target, item, items, props) => {
            if (isDynamic(stat2).items && target.item && item)
              fun.write("%s.push(...%s)", target.item, item);
            if (isDynamic(stat2).items && target.items && items)
              fun.write("%s.push(...%s)", target.items, items);
            if (isDynamic(stat2).properties && target.props && props) {
              fun.write("%s[0].push(...%s[0])", target.props, props);
              fun.write("%s[1].push(...%s[1])", target.props, props);
            }
          };
          const makeRecursive = () => {
            if (!opts[optRecAnchors])
              return format("");
            if (recursiveLog.length === 0)
              return format(", recursive");
            return format(", recursive || %s", compileSub(...recursiveLog[0]));
          };
          const applyRef = (n, errorArgs) => {
            const delta = scope[n] && scope[n][evaluatedStatic] || { unknown: true };
            evaluateDelta(delta);
            const call = format("%s(%s%s%s)", n, name, makeRecursive(), dynamicAnchorsNext);
            if (!includeErrors && canSkipDynamic())
              return format("!%s", call);
            const res = gensym("res");
            const err2 = gensym("err");
            const suberr = gensym("suberr");
            if (includeErrors)
              fun.write("const %s = validate.errors", err2);
            fun.write("const %s = %s", res, call);
            if (includeErrors)
              fun.write("const %s = %s.errors", suberr, n);
            if (includeErrors)
              fun.write("validate.errors = %s", err2);
            errorIf(safenot(res), { ...errorArgs, source: suberr });
            fun.if(res, () => {
              const item = isDynamic(delta).items ? format("%s.evaluatedDynamic[0]", n) : null;
              const items = isDynamic(delta).items ? format("%s.evaluatedDynamic[1]", n) : null;
              const props = isDynamic(delta).properties ? format("%s.evaluatedDynamic[2]", n) : null;
              applyDynamicToDynamic(dyn, item, items, props);
            });
            return null;
          };
          const allIn = (arr, valid) => arr && arr.every((s) => valid.includes(s));
          const someIn = (arr, possible) => possible.some((x) => arr === null || arr.includes(x));
          const parentCheckedType = (...valid) => queryCurrent().some((h) => allIn(h.stat.type, valid));
          const definitelyType = (...valid) => allIn(stat2.type, valid) || parentCheckedType(...valid);
          const typeApplicable = (...possible) => someIn(stat2.type, possible) && queryCurrent().every((h) => someIn(h.stat.type, possible));
          const enforceRegex = (source, target = node) => {
            enforce(typeof source === "string", "Invalid pattern:", source);
            if (requireValidation || requireStringValidation)
              enforce(/^\^.*\$$/.test(source), "Should start with ^ and end with $:", source);
            if (/([{+*].*[{+*]|\)[{+*]|^[^^].*[{+*].)/.test(source) && target.maxLength === void 0)
              complex("maxLength should be specified for pattern:", source);
          };
          const havePattern = node.pattern && !noopRegExps.has(node.pattern);
          const haveComplex = node.uniqueItems || havePattern || node.patternProperties || node.format;
          const prev = allErrors && haveComplex ? gensym("prev") : null;
          const prevWrap = (shouldWrap, writeBody) => fun.if(shouldWrap && prev !== null ? format("errorCount === %s", prev) : true, writeBody);
          const nexthistory = () => [...history, { stat: stat2, prop: current }];
          const rule = (...args) => visit(errors, nexthistory(), ...args).stat;
          const subrule = (suberr, ...args) => {
            if (args[0] === current) {
              const constval = constantValue(args[1]);
              if (constval === true)
                return { sub: format("true"), delta: {} };
              if (constval === false)
                return { sub: format("false"), delta: { type: [] } };
            }
            const sub = gensym("sub");
            fun.write("const %s = ", sub);
            if (allErrors)
              fun.write("let errorCount = 0");
            const { stat: delta } = visit(suberr, nexthistory(), ...args);
            if (allErrors) {
              fun.write("return errorCount === 0");
            } else
              fun.write("return true");
            fun.write("})()");
            return { sub, delta };
          };
          const suberror = () => {
            const suberr = includeErrors && allErrors ? gensym("suberr") : null;
            if (suberr)
              fun.write("let %s = null", suberr);
            return suberr;
          };
          const mergeerror = (suberr) => {
            if (errors === null || suberr === null)
              return;
            fun.if(suberr, () => fun.write("%s.push(...%s)", errors, suberr));
          };
          const willRemoveAdditional = () => {
            if (!removeAdditional)
              return false;
            if (removeAdditional === true)
              return true;
            if (removeAdditional === "keyword") {
              if (!node.removeAdditional)
                return false;
              consume("removeAdditional", "boolean");
              return true;
            }
            throw new Error(`Invalid removeAdditional: ${removeAdditional}`);
          };
          const additionalItems = (rulePath, limit, extra) => {
            const handled = handle2(rulePath, ["object", "boolean"], (ruleValue) => {
              if (ruleValue === false && willRemoveAdditional()) {
                fun.write("if (%s.length > %s) %s.length = %s", name, limit, name, limit);
                return null;
              }
              if (ruleValue === false && !extra)
                return format("%s.length > %s", name, limit);
              forArray(current, limit, (prop, i) => {
                if (extra)
                  fun.write("if (%s) continue", extra(i));
                return rule(prop, ruleValue, subPath(rulePath));
              });
              return null;
            });
            if (handled)
              evaluateDelta({ items: Infinity });
          };
          const additionalProperties = (rulePath, condition) => {
            const handled = handle2(rulePath, ["object", "boolean"], (ruleValue) => {
              forObjectKeys(current, (sub, key) => {
                fun.if(condition(key), () => {
                  if (ruleValue === false && willRemoveAdditional())
                    fun.write("delete %s[%s]", name, key);
                  else
                    rule(sub, ruleValue, subPath(rulePath));
                });
              });
              return null;
            });
            if (handled)
              evaluateDelta({ properties: [true] });
          };
          const additionalCondition = (key, properties, patternProperties) => safeand(
            ...properties.map((p) => format("%s !== %j", key, p)),
            ...patternProperties.map((p) => safenot(patternTest(p, key)))
          );
          const checkNumbers = () => {
            const minMax = (value, operator) => format("!(%d %c %s)", value, operator, name);
            if (Number.isFinite(node.exclusiveMinimum)) {
              handle2("exclusiveMinimum", ["finite"], (min) => minMax(min, "<"));
            } else {
              handle2("minimum", ["finite"], (min) => minMax(min, node.exclusiveMinimum ? "<" : "<="));
              handle2("exclusiveMinimum", ["boolean"], null);
            }
            if (Number.isFinite(node.exclusiveMaximum)) {
              handle2("exclusiveMaximum", ["finite"], (max) => minMax(max, ">"));
              enforceMinMax("minimum", "exclusiveMaximum");
              enforceMinMax("exclusiveMinimum", "exclusiveMaximum");
            } else if (node.maximum !== void 0) {
              handle2("maximum", ["finite"], (max) => minMax(max, node.exclusiveMaximum ? ">" : ">="));
              handle2("exclusiveMaximum", ["boolean"], null);
              enforceMinMax("minimum", "maximum");
              enforceMinMax("exclusiveMinimum", "maximum");
            }
            const multipleOf = node.multipleOf === void 0 ? "divisibleBy" : "multipleOf";
            handle2(multipleOf, ["finite"], (value) => {
              enforce(value > 0, `Invalid ${multipleOf}:`, value);
              const [frac, exp] = `${value}.`.split(".")[1].split("e-");
              const e = frac.length + (exp ? Number(exp) : 0);
              if (Number.isInteger(value * 2 ** e))
                return format("%s %% %d !== 0", name, value);
              scope.isMultipleOf = functions.isMultipleOf;
              const args = [name, value, e, Math.round(value * Math.pow(10, e))];
              return format("!isMultipleOf(%s, %d, 1e%d, %d)", ...args);
            });
          };
          const checkStrings = () => {
            handle2("maxLength", ["natural"], (max) => {
              scope.stringLength = functions.stringLength;
              return format("%s.length > %d && stringLength(%s) > %d", name, max, name, max);
            });
            handle2("minLength", ["natural"], (min) => {
              scope.stringLength = functions.stringLength;
              return format("%s.length < %d || stringLength(%s) < %d", name, min, name, min);
            });
            enforceMinMax("minLength", "maxLength");
            prevWrap(true, () => {
              const checkFormat = (fmtname, target, formatsObj = fmts) => {
                const known = typeof fmtname === "string" && functions.hasOwn(formatsObj, fmtname);
                enforce(known, "Unrecognized format used:", fmtname);
                const formatImpl = formatsObj[fmtname];
                const valid = formatImpl instanceof RegExp || typeof formatImpl === "function";
                enforce(valid, "Invalid format used:", fmtname);
                if (formatImpl instanceof RegExp) {
                  if (functions.hasOwn(optFormats, fmtname))
                    enforceRegex(formatImpl.source);
                  return format("!%s.test(%s)", genformat(formatImpl), target);
                }
                return format("!%s(%s)", genformat(formatImpl), target);
              };
              handle2("format", ["string"], (value) => {
                evaluateDelta({ fullstring: true });
                return checkFormat(value, name);
              });
              handle2("pattern", ["string"], (pattern) => {
                enforceRegex(pattern);
                evaluateDelta({ fullstring: true });
                return noopRegExps.has(pattern) ? null : safenot(patternTest(pattern, name));
              });
              enforce(node.contentSchema !== false, "contentSchema cannot be set to false");
              const cV = contentValidation === void 0 ? getMeta().contentValidation : contentValidation;
              const haveContent = node.contentEncoding || node.contentMediaType || node.contentSchema;
              const contentErr = '"content*" keywords are disabled by default per spec, enable with { contentValidation = true } option (see doc/Options.md for more info)';
              enforce(!haveContent || cV || allowUnusedKeywords, contentErr);
              if (haveContent && cV) {
                const dec = gensym("dec");
                if (node.contentMediaType)
                  fun.write("let %s = %s", dec, name);
                if (node.contentEncoding === "base64") {
                  errorIf(checkFormat("base64", name, formats.extra), { path: ["contentEncoding"] });
                  if (node.contentMediaType) {
                    scope.deBase64 = functions.deBase64;
                    fun.write("try {");
                    fun.write("%s = deBase64(%s)", dec, dec);
                  }
                  consume("contentEncoding", "string");
                } else
                  enforce(!node.contentEncoding, "Unknown contentEncoding:", node.contentEncoding);
                let json = false;
                if (node.contentMediaType === "application/json") {
                  fun.write("try {");
                  fun.write("%s = JSON.parse(%s)", dec, dec);
                  json = true;
                  consume("contentMediaType", "string");
                } else
                  enforce(!node.contentMediaType, "Unknown contentMediaType:", node.contentMediaType);
                if (node.contentSchema) {
                  enforce(json, "contentSchema requires contentMediaType application/json");
                  const decprop = Object.freeze({ name: dec, errorParent: current });
                  rule(decprop, node.contentSchema, subPath("contentSchema"));
                  consume("contentSchema", "object", "array");
                  evaluateDelta({ fullstring: true });
                }
                if (node.contentMediaType) {
                  fun.write("} catch (e) {");
                  error({ path: ["contentMediaType"] });
                  fun.write("}");
                  if (node.contentEncoding) {
                    fun.write("} catch (e) {");
                    error({ path: ["contentEncoding"] });
                    fun.write("}");
                  }
                }
              }
            });
          };
          const checkArrays = () => {
            handle2("maxItems", ["natural"], (max) => {
              const prefixItemsName = getMeta().newItemsSyntax ? "prefixItems" : "items";
              if (Array.isArray(node[prefixItemsName]) && node[prefixItemsName].length > max)
                fail(`Invalid maxItems: ${max} is less than ${prefixItemsName} array length`);
              return format("%s.length > %d", name, max);
            });
            handle2("minItems", ["natural"], (min) => format("%s.length < %d", name, min));
            enforceMinMax("minItems", "maxItems");
            const checkItemsArray = (items) => {
              for (let p = 0; p < items.length; p++)
                rule(currPropImm(p), items[p], subPath(`${p}`));
              evaluateDelta({ items: items.length });
              return null;
            };
            if (getMeta().newItemsSyntax) {
              handle2("prefixItems", ["array"], checkItemsArray);
              additionalItems("items", format("%d", (node.prefixItems || []).length));
            } else if (Array.isArray(node.items)) {
              handle2("items", ["array"], checkItemsArray);
              additionalItems("additionalItems", format("%d", node.items.length));
            } else {
              handle2("items", ["object", "boolean"], (items) => {
                forArray(current, format("0"), (prop) => rule(prop, items, subPath("items")));
                evaluateDelta({ items: Infinity });
                return null;
              });
            }
            handle2("contains", ["object", "boolean"], () => {
              uncertain("contains");
              const passes = gensym("passes");
              fun.write("let %s = 0", passes);
              const suberr = suberror();
              forArray(current, format("0"), (prop, i) => {
                const { sub } = subrule(suberr, prop, node.contains, subPath("contains"));
                fun.if(sub, () => {
                  fun.write("%s++", passes);
                  if (getMeta().containsEvaluates) {
                    enforce(!removeAdditional, `Can't use removeAdditional with draft2020+ "contains"`);
                    evaluateDelta({ dyn: { item: true } });
                    evaluateDeltaDynamic({ item: i, items: [], properties: [], patterns: [] });
                  }
                });
              });
              if (!handle2("minContains", ["natural"], (mn) => format("%s < %d", passes, mn), { suberr }))
                errorIf(format("%s < 1", passes), { path: ["contains"], suberr });
              handle2("maxContains", ["natural"], (max) => format("%s > %d", passes, max));
              enforceMinMax("minContains", "maxContains");
              return null;
            });
            const itemsSimple = (ischema) => {
              if (!isPlainObject(ischema))
                return false;
              if (ischema.enum || functions.hasOwn(ischema, "const"))
                return true;
              if (ischema.type) {
                const itemTypes = Array.isArray(ischema.type) ? ischema.type : [ischema.type];
                if (itemTypes.every((itemType) => primitiveTypes.includes(itemType)))
                  return true;
              }
              if (ischema.$ref) {
                const [sub] = resolveReference(root, schemas, ischema.$ref, basePath())[0] || [];
                if (itemsSimple(sub))
                  return true;
              }
              return false;
            };
            const itemsSimpleOrFalse = (ischema) => ischema === false || itemsSimple(ischema);
            const uniqueSimple = () => {
              if (node.maxItems !== void 0 || itemsSimpleOrFalse(node.items))
                return true;
              if (Array.isArray(node.items) && itemsSimpleOrFalse(node.additionalItems))
                return true;
              return false;
            };
            prevWrap(true, () => {
              handle2("uniqueItems", ["boolean"], (uniqueItems) => {
                if (uniqueItems === false)
                  return null;
                if (!uniqueSimple())
                  complex("maxItems should be specified for non-primitive uniqueItems");
                Object.assign(scope, { unique: functions.unique, deepEqual: functions.deepEqual });
                return format("!unique(%s)", name);
              });
            });
          };
          const checked = (p) => !allErrors && (stat2.required.includes(p) || queryCurrent().some((h) => h.stat.required.includes(p)));
          const checkObjects = () => {
            const propertiesCount = format("Object.keys(%s).length", name);
            handle2("maxProperties", ["natural"], (max) => format("%s > %d", propertiesCount, max));
            handle2("minProperties", ["natural"], (min) => format("%s < %d", propertiesCount, min));
            enforceMinMax("minProperties", "maxProperties");
            handle2("propertyNames", ["object", "boolean"], (s) => {
              forObjectKeys(current, (sub, key) => {
                const nameSchema = typeof s === "object" && !s.$ref ? { type: "string", ...s } : s;
                const nameprop = Object.freeze({ name: key, errorParent: sub, type: "string" });
                rule(nameprop, nameSchema, subPath("propertyNames"));
              });
              return null;
            });
            handle2("required", ["array"], (required) => {
              for (const req of required) {
                if (checked(req))
                  continue;
                const prop = currPropImm(req);
                errorIf(safenot(present(prop)), { path: ["required"], prop });
              }
              evaluateDelta({ required });
              return null;
            });
            for (const dependencies of ["dependencies", "dependentRequired", "dependentSchemas"]) {
              handle2(dependencies, ["object"], (value) => {
                for (const key of Object.keys(value)) {
                  const deps = typeof value[key] === "string" ? [value[key]] : value[key];
                  const item = currPropImm(key, checked(key));
                  if (Array.isArray(deps) && dependencies !== "dependentSchemas") {
                    const clauses = deps.filter((k) => !checked(k)).map((k) => present(currPropImm(k)));
                    const condition = safenot(safeand(...clauses));
                    const errorArgs = { path: [dependencies, key] };
                    if (clauses.length === 0) {
                    } else if (item.checked) {
                      errorIf(condition, errorArgs);
                      evaluateDelta({ required: deps });
                    } else {
                      errorIf(safeand(present(item), condition), errorArgs);
                    }
                  } else if ((typeof deps === "object" && !Array.isArray(deps) || typeof deps === "boolean") && dependencies !== "dependentRequired") {
                    uncertain(dependencies);
                    fun.if(item.checked ? true : present(item), () => {
                      const delta = rule(current, deps, subPath(dependencies, key), dyn);
                      evaluateDelta(orDelta({}, delta));
                      evaluateDeltaDynamic(delta);
                    });
                  } else
                    fail(`Unexpected ${dependencies} entry`);
                }
                return null;
              });
            }
            handle2("properties", ["object"], (properties) => {
              for (const p of Object.keys(properties)) {
                if (constProp === p)
                  continue;
                rule(currPropImm(p, checked(p)), properties[p], subPath("properties", p));
              }
              evaluateDelta({ properties: Object.keys(properties) });
              return null;
            });
            prevWrap(node.patternProperties, () => {
              handle2("patternProperties", ["object"], (patternProperties) => {
                forObjectKeys(current, (sub, key) => {
                  for (const p of Object.keys(patternProperties)) {
                    enforceRegex(p, node.propertyNames || {});
                    fun.if(patternTest(p, key), () => {
                      rule(sub, patternProperties[p], subPath("patternProperties", p));
                    });
                  }
                });
                evaluateDelta({ patterns: Object.keys(patternProperties) });
                return null;
              });
              if (node.additionalProperties || node.additionalProperties === false) {
                const properties = Object.keys(node.properties || {});
                const patternProperties = Object.keys(node.patternProperties || {});
                const condition = (key) => additionalCondition(key, properties, patternProperties);
                additionalProperties("additionalProperties", condition);
              }
            });
          };
          const checkConst = () => {
            const handledConst = handle2("const", ["jsonval"], (val) => safenot(compare(name, val)));
            if (handledConst && !allowUnusedKeywords)
              return true;
            const handledEnum = handle2("enum", ["array"], (vals) => {
              const objects = vals.filter((value) => value && typeof value === "object");
              const primitive = vals.filter((value) => !(value && typeof value === "object"));
              return safenotor(...[...primitive, ...objects].map((value) => compare(name, value)));
            });
            return handledConst || handledEnum;
          };
          const checkGeneric = () => {
            handle2("not", ["object", "boolean"], (not) => subrule(null, current, not, subPath("not")).sub);
            if (node.not)
              uncertain("not");
            const thenOrElse = node.then || node.then === false || node.else || node.else === false;
            if (thenOrElse || allowUnusedKeywords)
              handle2("if", ["object", "boolean"], (ifS) => {
                uncertain("if/then/else");
                const { sub, delta: deltaIf } = subrule(null, current, ifS, subPath("if"), dyn);
                let handleElse, handleThen, deltaElse, deltaThen;
                handle2("else", ["object", "boolean"], (elseS) => {
                  handleElse = () => {
                    deltaElse = rule(current, elseS, subPath("else"), dyn);
                    evaluateDeltaDynamic(deltaElse);
                  };
                  return null;
                });
                handle2("then", ["object", "boolean"], (thenS) => {
                  handleThen = () => {
                    deltaThen = rule(current, thenS, subPath("then"), dyn);
                    evaluateDeltaDynamic(andDelta(deltaIf, deltaThen));
                  };
                  return null;
                });
                fun.if(sub, handleThen, handleElse);
                evaluateDelta(orDelta(deltaElse || {}, andDelta(deltaIf, deltaThen || {})));
                return null;
              });
            const performAllOf = (allOf, rulePath = "allOf") => {
              enforce(allOf.length > 0, `${rulePath} cannot be empty`);
              for (const [key, sch] of Object.entries(allOf))
                evaluateDelta(rule(current, sch, subPath(rulePath, key), dyn));
              return null;
            };
            handle2("allOf", ["array"], (allOf) => performAllOf(allOf));
            let handleDiscriminator = null;
            handle2("discriminator", ["object"], (discriminator) => {
              const seen = /* @__PURE__ */ new Set();
              const fix = (check, message, arg) => enforce(check, `[discriminator]: ${message}`, arg);
              const { propertyName: pname, mapping: map, ...e0 } = discriminator;
              const prop = currPropImm(pname);
              fix(pname && !node.oneOf !== !node.anyOf, "need propertyName, oneOf OR anyOf");
              fix(Object.keys(e0).length === 0, 'only "propertyName" and "mapping" are supported');
              const keylen = (obj) => isPlainObject(obj) ? Object.keys(obj).length : null;
              handleDiscriminator = (branches, ruleName) => {
                const runDiscriminator = () => {
                  fun.write("switch (%s) {", buildName(prop));
                  let delta;
                  for (const [i, branch] of Object.entries(branches)) {
                    const { const: myval, enum: myenum, ...e1 } = (branch.properties || {})[pname] || {};
                    let vals = myval !== void 0 ? [myval] : myenum;
                    if (!vals && branch.$ref) {
                      const [sub] = resolveReference(root, schemas, branch.$ref, basePath())[0] || [];
                      enforce(isPlainObject(sub), "failed to resolve $ref:", branch.$ref);
                      const rprop = (sub.properties || {})[pname] || {};
                      vals = rprop.const !== void 0 ? [rprop.const] : rprop.enum;
                    }
                    const ok1 = Array.isArray(vals) && vals.length > 0;
                    fix(ok1, "branches should have unique string const or enum values for [propertyName]");
                    const ok2 = Object.keys(e1).length === 0 && (!myval || !myenum);
                    fix(ok2, "only const OR enum rules are allowed on [propertyName] in branches");
                    for (const val of vals) {
                      const okMapping = !map || functions.hasOwn(map, val) && map[val] === branch.$ref;
                      fix(okMapping, "mismatching mapping for", val);
                      const valok = typeof val === "string" && !seen.has(val);
                      fix(valok, "const/enum values for [propertyName] should be unique strings");
                      seen.add(val);
                      fun.write("case %j:", val);
                    }
                    const subd = rule(current, branch, subPath(ruleName, i), dyn, { constProp: pname });
                    evaluateDeltaDynamic(subd);
                    delta = delta ? orDelta(delta, subd) : subd;
                    fun.write("break");
                  }
                  fix(map === void 0 || keylen(map) === seen.size, "mismatching mapping size");
                  evaluateDelta(delta);
                  fun.write("default:");
                  error({ path: [ruleName] });
                  fun.write("}");
                };
                const propCheck = () => {
                  if (!checked(pname)) {
                    const errorPath = ["discriminator", "propertyName"];
                    fun.if(present(prop), runDiscriminator, () => error({ path: errorPath, prop }));
                  } else
                    runDiscriminator();
                };
                if (allErrors || !functions.deepEqual(stat2.type, ["object"])) {
                  fun.if(types.get("object")(name), propCheck, () => error({ path: ["discriminator"] }));
                } else
                  propCheck();
                fix(functions.deepEqual(stat2.type, ["object"]), "has to be checked for type:", "object");
                fix(stat2.required.includes(pname), "propertyName should be placed in required:", pname);
                return null;
              };
              return null;
            });
            const uncertainBranchTypes = (key, arr) => {
              const btypes = arr.map((x) => x.type || (Array.isArray(x.const) ? "array" : typeof x.const));
              const maybeObj = btypes.filter((x) => !primitiveTypes.includes(x) && x !== "array").length;
              const maybeArr = btypes.filter((x) => !primitiveTypes.includes(x) && x !== "object").length;
              if (maybeObj > 1 || maybeArr > 1)
                uncertain(`${key}, use discriminator to make it certain`);
            };
            handle2("anyOf", ["array"], (anyOf) => {
              enforce(anyOf.length > 0, "anyOf cannot be empty");
              if (anyOf.length === 1)
                return performAllOf(anyOf);
              if (handleDiscriminator)
                return handleDiscriminator(anyOf, "anyOf");
              const suberr = suberror();
              if (!canSkipDynamic()) {
                uncertainBranchTypes("anyOf", anyOf);
                const entries = Object.entries(anyOf).map(
                  ([key, sch]) => subrule(suberr, current, sch, subPath("anyOf", key), dyn)
                );
                evaluateDelta(entries.reduce((acc, cur) => orDelta(acc, cur.delta), {}));
                const condition = safenotor(...entries.map(({ sub }) => sub));
                errorIf(condition, { path: ["anyOf"], suberr });
                for (const { delta: delta2, sub } of entries)
                  fun.if(sub, () => evaluateDeltaDynamic(delta2));
                return null;
              }
              const constBlocks = anyOf.filter((x) => functions.hasOwn(x, "const"));
              const otherBlocks = anyOf.filter((x) => !functions.hasOwn(x, "const"));
              uncertainBranchTypes("anyOf", otherBlocks);
              const blocks = [...constBlocks, ...otherBlocks];
              let delta;
              let body = () => error({ path: ["anyOf"], suberr });
              for (const [key, sch] of Object.entries(blocks).reverse()) {
                const oldBody = body;
                body = () => {
                  const { sub, delta: deltaVar } = subrule(suberr, current, sch, subPath("anyOf", key));
                  fun.if(safenot(sub), oldBody);
                  delta = delta ? orDelta(delta, deltaVar) : deltaVar;
                };
              }
              body();
              evaluateDelta(delta);
              return null;
            });
            handle2("oneOf", ["array"], (oneOf) => {
              enforce(oneOf.length > 0, "oneOf cannot be empty");
              if (oneOf.length === 1)
                return performAllOf(oneOf);
              if (handleDiscriminator)
                return handleDiscriminator(oneOf, "oneOf");
              uncertainBranchTypes("oneOf", oneOf);
              const passes = gensym("passes");
              fun.write("let %s = 0", passes);
              const suberr = suberror();
              let delta;
              let i = 0;
              const entries = Object.entries(oneOf).map(([key, sch]) => {
                if (!includeErrors && i++ > 1)
                  errorIf(format("%s > 1", passes), { path: ["oneOf"] });
                const entry = subrule(suberr, current, sch, subPath("oneOf", key), dyn);
                fun.if(entry.sub, () => fun.write("%s++", passes));
                delta = delta ? orDelta(delta, entry.delta) : entry.delta;
                return entry;
              });
              evaluateDelta(delta);
              errorIf(format("%s !== 1", passes), { path: ["oneOf"] });
              fun.if(format("%s === 0", passes), () => mergeerror(suberr));
              for (const entry of entries)
                fun.if(entry.sub, () => evaluateDeltaDynamic(entry.delta));
              return null;
            });
          };
          const typeWrap = (checkBlock, validTypes, queryType) => {
            const [funSize, unusedSize] = [fun.size(), unused.size];
            fun.if(definitelyType(...validTypes) ? true : queryType, checkBlock);
            if (funSize !== fun.size() || unusedSize !== unused.size)
              enforce(typeApplicable(...validTypes), `Unexpected rules in type`, node.type);
          };
          const checkArraysFinal = () => {
            if (stat2.items === Infinity) {
              if (node.unevaluatedItems === false)
                consume("unevaluatedItems", "boolean");
            } else if (node.unevaluatedItems || node.unevaluatedItems === false) {
              if (isDynamic(stat2).items) {
                if (!opts[optDynamic])
                  throw new Error("Dynamic unevaluated tracing is not enabled");
                const limit = format("Math.max(%d, ...%s)", stat2.items, dyn.items);
                const extra = (i) => format("%s.includes(%s)", dyn.item, i);
                additionalItems("unevaluatedItems", limit, getMeta().containsEvaluates ? extra : null);
              } else {
                additionalItems("unevaluatedItems", format("%d", stat2.items));
              }
            }
          };
          const checkObjectsFinal = () => {
            prevWrap(stat2.patterns.length > 0 || stat2.dyn.patterns.length > 0 || stat2.unknown, () => {
              if (stat2.properties.includes(true)) {
                if (node.unevaluatedProperties === false)
                  consume("unevaluatedProperties", "boolean");
              } else if (node.unevaluatedProperties || node.unevaluatedProperties === false) {
                const notStatic = (key) => additionalCondition(key, stat2.properties, stat2.patterns);
                if (isDynamic(stat2).properties) {
                  if (!opts[optDynamic])
                    throw new Error("Dynamic unevaluated tracing is not enabled");
                  scope.propertyIn = functions.propertyIn;
                  const notDynamic = (key) => format("!propertyIn(%s, %s)", key, dyn.props);
                  const condition = (key) => safeand(notStatic(key), notDynamic(key));
                  additionalProperties("unevaluatedProperties", condition);
                } else {
                  additionalProperties("unevaluatedProperties", notStatic);
                }
              }
            });
          };
          const performValidation = () => {
            if (prev !== null)
              fun.write("const %s = errorCount", prev);
            if (checkConst()) {
              const typeKeys = [...types.keys()];
              evaluateDelta({ properties: [true], items: Infinity, type: typeKeys, fullstring: true });
              if (!allowUnusedKeywords) {
                enforce(unused.size === 0, "Unexpected keywords mixed with const or enum:", [...unused]);
                return;
              }
            }
            typeWrap(checkNumbers, ["number", "integer"], types.get("number")(name));
            typeWrap(checkStrings, ["string"], types.get("string")(name));
            typeWrap(checkArrays, ["array"], types.get("array")(name));
            typeWrap(checkObjects, ["object"], types.get("object")(name));
            checkGeneric();
            typeWrap(checkArraysFinal, ["array"], types.get("array")(name));
            typeWrap(checkObjectsFinal, ["object"], types.get("object")(name));
            applyDynamicToDynamic(trace, local2.item, local2.items, local2.props);
          };
          const writeMain = () => {
            if (local2.item)
              fun.write("const %s = []", local2.item);
            if (local2.items)
              fun.write("const %s = [0]", local2.items);
            if (local2.props)
              fun.write("const %s = [[], []]", local2.props);
            handle2("$ref", ["string"], ($ref) => {
              const resolved = resolveReference(root, schemas, $ref, basePath());
              const [sub, subRoot, path] = resolved[0] || [];
              if (!sub && sub !== false)
                fail("failed to resolve $ref:", $ref);
              if (sub.type) {
                const type3 = Array.isArray(sub.type) ? sub.type : [sub.type];
                evaluateDelta({ type: type3 });
                if (requireValidation) {
                  if (type3.includes("array"))
                    evaluateDelta({ items: Infinity });
                  if (type3.includes("object"))
                    evaluateDelta({ properties: [true] });
                }
              }
              return applyRef(compileSub(sub, subRoot, path), { path: ["$ref"] });
            });
            if (node.$ref && getMeta().exclusiveRefs) {
              enforce(!opts[optDynamic], "unevaluated* is supported only on draft2019-09 and above");
              return;
            }
            handle2("$recursiveRef", ["string"], ($recursiveRef) => {
              if (!opts[optRecAnchors])
                throw new Error("Recursive anchors are not enabled");
              enforce($recursiveRef === "#", 'Behavior of $recursiveRef is defined only for "#"');
              const resolved = resolveReference(root, schemas, "#", basePath());
              const [sub, subRoot, path] = resolved[0];
              laxMode(sub.$recursiveAnchor, "$recursiveRef without $recursiveAnchor");
              const n = compileSub(sub, subRoot, path);
              const nrec = sub.$recursiveAnchor ? format("(recursive || %s)", n) : n;
              return applyRef(nrec, { path: ["$recursiveRef"] });
            });
            handle2("$dynamicRef", ["string"], ($dynamicRef) => {
              if (!opts[optDynAnchors])
                throw new Error("Dynamic anchors are not enabled");
              enforce(/^[^#]*#[a-zA-Z0-9_-]+$/.test($dynamicRef), "Unsupported $dynamicRef format");
              const dynamicTail = $dynamicRef.replace(/^[^#]+/, "");
              const resolved = resolveReference(root, schemas, $dynamicRef, basePath());
              enforce(resolved[0], "$dynamicRef bookending resolution failed", $dynamicRef);
              const [sub, subRoot, path] = resolved[0];
              const ok = sub.$dynamicAnchor && `#${sub.$dynamicAnchor}` === dynamicTail;
              laxMode(ok, "$dynamicRef without $dynamicAnchor in the same scope");
              const n = compileSub(sub, subRoot, path);
              scope.dynamicResolve = functions.dynamicResolve;
              const nrec = ok ? format("(dynamicResolve(dynAnchors || [], %j) || %s)", dynamicTail, n) : n;
              return applyRef(nrec, { path: ["$recursiveRef"] });
            });
            let typeCheck = null;
            handle2("type", ["string", "array"], (type3) => {
              const typearr = Array.isArray(type3) ? type3 : [type3];
              for (const t of typearr)
                enforce(typeof t === "string" && types.has(t), "Unknown type:", t);
              if (current.type) {
                enforce(functions.deepEqual(typearr, [current.type]), "One type allowed:", current.type);
                evaluateDelta({ type: [current.type] });
                return null;
              }
              if (parentCheckedType(...typearr))
                return null;
              const filteredTypes = typearr.filter((t) => typeApplicable(t));
              if (filteredTypes.length === 0)
                fail("No valid types possible");
              evaluateDelta({ type: typearr });
              typeCheck = safenotor(...filteredTypes.map((t) => types.get(t)(name)));
              return null;
            });
            if (typeCheck && allErrors) {
              fun.if(typeCheck, () => error({ path: ["type"] }), performValidation);
            } else {
              if (typeCheck)
                errorIf(typeCheck, { path: ["type"] });
              performValidation();
            }
            if (stat2.items < Infinity && node.maxItems <= stat2.items)
              evaluateDelta({ items: Infinity });
          };
          if (node.default !== void 0 && useDefaults) {
            if (definitelyPresent)
              fail("Can not apply default value here (e.g. at root)");
            const defvalue = get("default", "jsonval");
            fun.if(present(current), writeMain, () => fun.write("%s = %j", name, defvalue));
          } else {
            handle2("default", ["jsonval"], null);
            fun.if(definitelyPresent ? true : present(current), writeMain);
          }
          if (recursiveLog[0] && recursiveLog[recursiveLog.length - 1][0] === node)
            recursiveLog.pop();
          if (isDynScope && node !== schema)
            fun.write("dynLocal.shift()");
          if (!allowUnreachable)
            enforce(!fun.optimizedOut, "some checks are never reachable");
          if (isSub) {
            const logicalOp = ["not", "if", "then", "else"].includes(schemaPath[schemaPath.length - 1]);
            const branchOp = ["oneOf", "anyOf", "allOf"].includes(schemaPath[schemaPath.length - 2]);
            const depOp = ["dependencies", "dependentSchemas"].includes(schemaPath[schemaPath.length - 2]);
            enforce(logicalOp || branchOp || depOp, "Unexpected");
          } else if (!schemaPath.includes("not")) {
            if (!stat2.type)
              enforceValidation("type");
            if (typeApplicable("array") && stat2.items !== Infinity)
              enforceValidation(node.items ? "additionalItems or unevaluatedItems" : "items rule");
            if (typeApplicable("object") && !stat2.properties.includes(true))
              enforceValidation("additionalProperties or unevaluatedProperties");
            if (typeof node.propertyNames !== "object") {
              for (const sub of ["additionalProperties", "unevaluatedProperties"])
                if (node[sub])
                  enforceValidation(`wild-card ${sub}`, "requires propertyNames");
            }
            if (!stat2.fullstring && requireStringValidation) {
              const stringWarning = "pattern, format or contentSchema should be specified for strings";
              fail(`[requireStringValidation] ${stringWarning}, use pattern: ^[\\s\\S]*$ to opt-out`);
            }
          }
          if (node.properties && !node.required)
            enforceValidation("if properties is used, required");
          enforce(unused.size === 0 || allowUnusedKeywords, "Unprocessed keywords:", [...unused]);
          return { stat: stat2, local: local2 };
        };
        const { stat, local } = visit(format("validate.errors"), [], { name: safe("data") }, schema, []);
        if (opts[optDynamic] && (isDynamic(stat).items || isDynamic(stat).properties)) {
          if (!local)
            throw new Error("Failed to trace dynamic properties");
          fun.write("validate.evaluatedDynamic = [%s, %s, %s]", local.item, local.items, local.props);
        }
        if (allErrors)
          fun.write("return errorCount === 0");
        else
          fun.write("return true");
        fun.write("}");
        validate2 = fun.makeFunction(scope);
        validate2[evaluatedStatic] = stat;
        delete scope[funname];
        scope[funname] = validate2;
        return funname;
      };
      var compile = (schema, opts) => {
        try {
          const scope = /* @__PURE__ */ Object.create(null);
          return { scope, ref: compileSchema(schema, schema, opts, scope) };
        } catch (e) {
          if (!opts[optDynamic] && e.message === "Dynamic unevaluated tracing is not enabled")
            return compile(schema, { ...opts, [optDynamic]: true });
          if (!opts[optDynAnchors] && e.message === "Dynamic anchors are not enabled")
            return compile(schema, { ...opts, [optDynAnchors]: true });
          if (!opts[optRecAnchors] && e.message === "Recursive anchors are not enabled")
            return compile(schema, { ...opts, [optRecAnchors]: true });
          throw e;
        }
      };
      module.exports = { compile };
    }
  });

  // node_modules/@exodus/schemasafe/src/index.js
  var require_src = __commonJS({
    "node_modules/@exodus/schemasafe/src/index.js"(exports, module) {
      "use strict";
      var genfun = require_generate_function();
      var { buildSchemas } = require_pointer();
      var { compile } = require_compile();
      var functions = require_scope_functions();
      var validator2 = (schema, { jsonCheck = false, isJSON = false, schemas, ...opts } = {}) => {
        if (jsonCheck && isJSON)
          throw new Error("Can not specify both isJSON and jsonCheck options");
        const options = { ...opts, schemas: buildSchemas(schemas || []), isJSON: isJSON || jsonCheck };
        const { scope, ref } = compile(schema, options);
        if (opts.dryRun)
          return;
        const fun = genfun();
        if (!jsonCheck || opts.dryRun) {
          fun.write("%s", ref);
        } else {
          scope.deepEqual = functions.deepEqual;
          fun.write("function validateIsJSON(data) {");
          if (opts.includeErrors) {
            fun.write("if (!deepEqual(data, JSON.parse(JSON.stringify(data)))) {");
            fun.write('validateIsJSON.errors = [{instanceLocation:"#",error:"not JSON compatible"}]');
            fun.write("return false");
            fun.write("}");
            fun.write("const res = %s(data)", ref);
            fun.write("validateIsJSON.errors = actualValidate.errors");
            fun.write("return res");
          } else {
            fun.write("return deepEqual(data, JSON.parse(JSON.stringify(data))) && %s(data)", ref);
          }
          fun.write("}");
        }
        const validate2 = fun.makeFunction(scope);
        validate2.toModule = () => fun.makeModule(scope);
        validate2.toJSON = () => schema;
        return validate2;
      };
      var parser = function(schema, opts = {}) {
        if (functions.hasOwn(opts, "jsonCheck") || functions.hasOwn(opts, "isJSON"))
          throw new Error("jsonCheck and isJSON options are not applicable in parser mode");
        const validate2 = validator2(schema, { mode: "strong", ...opts, jsonCheck: false, isJSON: true });
        const parse = opts.includeErrors ? (src) => {
          if (typeof src !== "string")
            return { valid: false, error: "Input is not a string" };
          try {
            const value = JSON.parse(src);
            if (!validate2(value)) {
              const { keywordLocation, instanceLocation } = validate2.errors[0];
              const keyword = keywordLocation.slice(keywordLocation.lastIndexOf("/") + 1);
              const error = `JSON validation failed for ${keyword} at ${instanceLocation}`;
              return { valid: false, error, errors: validate2.errors };
            }
            return { valid: true, value };
          } catch ({ message }) {
            return { valid: false, error: message };
          }
        } : (src) => {
          if (typeof src !== "string")
            return { valid: false };
          try {
            const value = JSON.parse(src);
            if (!validate2(value))
              return { valid: false };
            return { valid: true, value };
          } catch (e) {
            return { valid: false };
          }
        };
        parse.toModule = () => [
          "(function(src) {",
          `const validate = ${validate2.toModule()}`,
          `const parse = ${parse}
`,
          "return parse(src)",
          "});"
        ].join("\n");
        parse.toJSON = () => schema;
        return parse;
      };
      module.exports = { validator: validator2, parser };
    }
  });

  // src/internet-identity/lib/tweetnacl/index.js
  var require_tweetnacl = __commonJS({
    "src/internet-identity/lib/tweetnacl/index.js"(exports, module) {
      (function(nacl) {
        "use strict";
        var gf = function(init) {
          var i, r = new Float64Array(16);
          if (init)
            for (i = 0; i < init.length; i++)
              r[i] = init[i];
          return r;
        };
        var randombytes = function() {
          throw new Error("no PRNG");
        };
        var _0 = new Uint8Array(16);
        var _9 = new Uint8Array(32);
        _9[0] = 9;
        var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([
          30883,
          4953,
          19914,
          30187,
          55467,
          16705,
          2637,
          112,
          59544,
          30585,
          16505,
          36039,
          65139,
          11119,
          27886,
          20995
        ]), D2 = gf([
          61785,
          9906,
          39828,
          60374,
          45398,
          33411,
          5274,
          224,
          53552,
          61171,
          33010,
          6542,
          64743,
          22239,
          55772,
          9222
        ]), X = gf([
          54554,
          36645,
          11616,
          51542,
          42930,
          38181,
          51040,
          26924,
          56412,
          64982,
          57905,
          49316,
          21502,
          52590,
          14035,
          8553
        ]), Y = gf([
          26200,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214,
          26214
        ]), I = gf([
          41136,
          18958,
          6951,
          50414,
          58488,
          44335,
          6150,
          12099,
          55207,
          15867,
          153,
          11085,
          57099,
          20417,
          9344,
          11139
        ]);
        function ts64(x, i, h, l) {
          x[i] = h >> 24 & 255;
          x[i + 1] = h >> 16 & 255;
          x[i + 2] = h >> 8 & 255;
          x[i + 3] = h & 255;
          x[i + 4] = l >> 24 & 255;
          x[i + 5] = l >> 16 & 255;
          x[i + 6] = l >> 8 & 255;
          x[i + 7] = l & 255;
        }
        function vn(x, xi, y, yi, n) {
          var i, d = 0;
          for (i = 0; i < n; i++)
            d |= x[xi + i] ^ y[yi + i];
          return (1 & d - 1 >>> 8) - 1;
        }
        function crypto_verify_16(x, xi, y, yi) {
          return vn(x, xi, y, yi, 16);
        }
        function crypto_verify_32(x, xi, y, yi) {
          return vn(x, xi, y, yi, 32);
        }
        function core_salsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          x0 = x0 + j0 | 0;
          x1 = x1 + j1 | 0;
          x2 = x2 + j2 | 0;
          x3 = x3 + j3 | 0;
          x4 = x4 + j4 | 0;
          x5 = x5 + j5 | 0;
          x6 = x6 + j6 | 0;
          x7 = x7 + j7 | 0;
          x8 = x8 + j8 | 0;
          x9 = x9 + j9 | 0;
          x10 = x10 + j10 | 0;
          x11 = x11 + j11 | 0;
          x12 = x12 + j12 | 0;
          x13 = x13 + j13 | 0;
          x14 = x14 + j14 | 0;
          x15 = x15 + j15 | 0;
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x1 >>> 0 & 255;
          o[5] = x1 >>> 8 & 255;
          o[6] = x1 >>> 16 & 255;
          o[7] = x1 >>> 24 & 255;
          o[8] = x2 >>> 0 & 255;
          o[9] = x2 >>> 8 & 255;
          o[10] = x2 >>> 16 & 255;
          o[11] = x2 >>> 24 & 255;
          o[12] = x3 >>> 0 & 255;
          o[13] = x3 >>> 8 & 255;
          o[14] = x3 >>> 16 & 255;
          o[15] = x3 >>> 24 & 255;
          o[16] = x4 >>> 0 & 255;
          o[17] = x4 >>> 8 & 255;
          o[18] = x4 >>> 16 & 255;
          o[19] = x4 >>> 24 & 255;
          o[20] = x5 >>> 0 & 255;
          o[21] = x5 >>> 8 & 255;
          o[22] = x5 >>> 16 & 255;
          o[23] = x5 >>> 24 & 255;
          o[24] = x6 >>> 0 & 255;
          o[25] = x6 >>> 8 & 255;
          o[26] = x6 >>> 16 & 255;
          o[27] = x6 >>> 24 & 255;
          o[28] = x7 >>> 0 & 255;
          o[29] = x7 >>> 8 & 255;
          o[30] = x7 >>> 16 & 255;
          o[31] = x7 >>> 24 & 255;
          o[32] = x8 >>> 0 & 255;
          o[33] = x8 >>> 8 & 255;
          o[34] = x8 >>> 16 & 255;
          o[35] = x8 >>> 24 & 255;
          o[36] = x9 >>> 0 & 255;
          o[37] = x9 >>> 8 & 255;
          o[38] = x9 >>> 16 & 255;
          o[39] = x9 >>> 24 & 255;
          o[40] = x10 >>> 0 & 255;
          o[41] = x10 >>> 8 & 255;
          o[42] = x10 >>> 16 & 255;
          o[43] = x10 >>> 24 & 255;
          o[44] = x11 >>> 0 & 255;
          o[45] = x11 >>> 8 & 255;
          o[46] = x11 >>> 16 & 255;
          o[47] = x11 >>> 24 & 255;
          o[48] = x12 >>> 0 & 255;
          o[49] = x12 >>> 8 & 255;
          o[50] = x12 >>> 16 & 255;
          o[51] = x12 >>> 24 & 255;
          o[52] = x13 >>> 0 & 255;
          o[53] = x13 >>> 8 & 255;
          o[54] = x13 >>> 16 & 255;
          o[55] = x13 >>> 24 & 255;
          o[56] = x14 >>> 0 & 255;
          o[57] = x14 >>> 8 & 255;
          o[58] = x14 >>> 16 & 255;
          o[59] = x14 >>> 24 & 255;
          o[60] = x15 >>> 0 & 255;
          o[61] = x15 >>> 8 & 255;
          o[62] = x15 >>> 16 & 255;
          o[63] = x15 >>> 24 & 255;
        }
        function core_hsalsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x5 >>> 0 & 255;
          o[5] = x5 >>> 8 & 255;
          o[6] = x5 >>> 16 & 255;
          o[7] = x5 >>> 24 & 255;
          o[8] = x10 >>> 0 & 255;
          o[9] = x10 >>> 8 & 255;
          o[10] = x10 >>> 16 & 255;
          o[11] = x10 >>> 24 & 255;
          o[12] = x15 >>> 0 & 255;
          o[13] = x15 >>> 8 & 255;
          o[14] = x15 >>> 16 & 255;
          o[15] = x15 >>> 24 & 255;
          o[16] = x6 >>> 0 & 255;
          o[17] = x6 >>> 8 & 255;
          o[18] = x6 >>> 16 & 255;
          o[19] = x6 >>> 24 & 255;
          o[20] = x7 >>> 0 & 255;
          o[21] = x7 >>> 8 & 255;
          o[22] = x7 >>> 16 & 255;
          o[23] = x7 >>> 24 & 255;
          o[24] = x8 >>> 0 & 255;
          o[25] = x8 >>> 8 & 255;
          o[26] = x8 >>> 16 & 255;
          o[27] = x8 >>> 24 & 255;
          o[28] = x9 >>> 0 & 255;
          o[29] = x9 >>> 8 & 255;
          o[30] = x9 >>> 16 & 255;
          o[31] = x9 >>> 24 & 255;
        }
        function crypto_core_salsa20(out, inp, k, c) {
          core_salsa20(out, inp, k, c);
        }
        function crypto_core_hsalsa20(out, inp, k, c) {
          core_hsalsa20(out, inp, k, c);
        }
        var sigma = new Uint8Array([
          101,
          120,
          112,
          97,
          110,
          100,
          32,
          51,
          50,
          45,
          98,
          121,
          116,
          101,
          32,
          107
        ]);
        function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++)
            z[i] = 0;
          for (i = 0; i < 8; i++)
            z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++)
              c[cpos + i] = m[mpos + i] ^ x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
            mpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++)
              c[cpos + i] = m[mpos + i] ^ x[i];
          }
          return 0;
        }
        function crypto_stream_salsa20(c, cpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++)
            z[i] = 0;
          for (i = 0; i < 8; i++)
            z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++)
              c[cpos + i] = x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++)
              c[cpos + i] = x[i];
          }
          return 0;
        }
        function crypto_stream(c, cpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++)
            sn[i] = n[i + 16];
          return crypto_stream_salsa20(c, cpos, d, sn, s);
        }
        function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++)
            sn[i] = n[i + 16];
          return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
        }
        var poly1305 = function(key) {
          this.buffer = new Uint8Array(16);
          this.r = new Uint16Array(10);
          this.h = new Uint16Array(10);
          this.pad = new Uint16Array(8);
          this.leftover = 0;
          this.fin = 0;
          var t0, t1, t2, t3, t4, t5, t6, t7;
          t0 = key[0] & 255 | (key[1] & 255) << 8;
          this.r[0] = t0 & 8191;
          t1 = key[2] & 255 | (key[3] & 255) << 8;
          this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
          t2 = key[4] & 255 | (key[5] & 255) << 8;
          this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
          t3 = key[6] & 255 | (key[7] & 255) << 8;
          this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
          t4 = key[8] & 255 | (key[9] & 255) << 8;
          this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
          this.r[5] = t4 >>> 1 & 8190;
          t5 = key[10] & 255 | (key[11] & 255) << 8;
          this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
          t6 = key[12] & 255 | (key[13] & 255) << 8;
          this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
          t7 = key[14] & 255 | (key[15] & 255) << 8;
          this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
          this.r[9] = t7 >>> 5 & 127;
          this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
          this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
          this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
          this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
          this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
          this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
          this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
          this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
        };
        poly1305.prototype.blocks = function(m, mpos, bytes) {
          var hibit = this.fin ? 0 : 1 << 11;
          var t0, t1, t2, t3, t4, t5, t6, t7, c;
          var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
          var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
          var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
          while (bytes >= 16) {
            t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
            h0 += t0 & 8191;
            t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
            h1 += (t0 >>> 13 | t1 << 3) & 8191;
            t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
            h2 += (t1 >>> 10 | t2 << 6) & 8191;
            t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
            h3 += (t2 >>> 7 | t3 << 9) & 8191;
            t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
            h4 += (t3 >>> 4 | t4 << 12) & 8191;
            h5 += t4 >>> 1 & 8191;
            t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
            h6 += (t4 >>> 14 | t5 << 2) & 8191;
            t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
            h7 += (t5 >>> 11 | t6 << 5) & 8191;
            t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
            h8 += (t6 >>> 8 | t7 << 8) & 8191;
            h9 += t7 >>> 5 | hibit;
            c = 0;
            d0 = c;
            d0 += h0 * r0;
            d0 += h1 * (5 * r9);
            d0 += h2 * (5 * r8);
            d0 += h3 * (5 * r7);
            d0 += h4 * (5 * r6);
            c = d0 >>> 13;
            d0 &= 8191;
            d0 += h5 * (5 * r5);
            d0 += h6 * (5 * r4);
            d0 += h7 * (5 * r3);
            d0 += h8 * (5 * r2);
            d0 += h9 * (5 * r1);
            c += d0 >>> 13;
            d0 &= 8191;
            d1 = c;
            d1 += h0 * r1;
            d1 += h1 * r0;
            d1 += h2 * (5 * r9);
            d1 += h3 * (5 * r8);
            d1 += h4 * (5 * r7);
            c = d1 >>> 13;
            d1 &= 8191;
            d1 += h5 * (5 * r6);
            d1 += h6 * (5 * r5);
            d1 += h7 * (5 * r4);
            d1 += h8 * (5 * r3);
            d1 += h9 * (5 * r2);
            c += d1 >>> 13;
            d1 &= 8191;
            d2 = c;
            d2 += h0 * r2;
            d2 += h1 * r1;
            d2 += h2 * r0;
            d2 += h3 * (5 * r9);
            d2 += h4 * (5 * r8);
            c = d2 >>> 13;
            d2 &= 8191;
            d2 += h5 * (5 * r7);
            d2 += h6 * (5 * r6);
            d2 += h7 * (5 * r5);
            d2 += h8 * (5 * r4);
            d2 += h9 * (5 * r3);
            c += d2 >>> 13;
            d2 &= 8191;
            d3 = c;
            d3 += h0 * r3;
            d3 += h1 * r2;
            d3 += h2 * r1;
            d3 += h3 * r0;
            d3 += h4 * (5 * r9);
            c = d3 >>> 13;
            d3 &= 8191;
            d3 += h5 * (5 * r8);
            d3 += h6 * (5 * r7);
            d3 += h7 * (5 * r6);
            d3 += h8 * (5 * r5);
            d3 += h9 * (5 * r4);
            c += d3 >>> 13;
            d3 &= 8191;
            d4 = c;
            d4 += h0 * r4;
            d4 += h1 * r3;
            d4 += h2 * r2;
            d4 += h3 * r1;
            d4 += h4 * r0;
            c = d4 >>> 13;
            d4 &= 8191;
            d4 += h5 * (5 * r9);
            d4 += h6 * (5 * r8);
            d4 += h7 * (5 * r7);
            d4 += h8 * (5 * r6);
            d4 += h9 * (5 * r5);
            c += d4 >>> 13;
            d4 &= 8191;
            d5 = c;
            d5 += h0 * r5;
            d5 += h1 * r4;
            d5 += h2 * r3;
            d5 += h3 * r2;
            d5 += h4 * r1;
            c = d5 >>> 13;
            d5 &= 8191;
            d5 += h5 * r0;
            d5 += h6 * (5 * r9);
            d5 += h7 * (5 * r8);
            d5 += h8 * (5 * r7);
            d5 += h9 * (5 * r6);
            c += d5 >>> 13;
            d5 &= 8191;
            d6 = c;
            d6 += h0 * r6;
            d6 += h1 * r5;
            d6 += h2 * r4;
            d6 += h3 * r3;
            d6 += h4 * r2;
            c = d6 >>> 13;
            d6 &= 8191;
            d6 += h5 * r1;
            d6 += h6 * r0;
            d6 += h7 * (5 * r9);
            d6 += h8 * (5 * r8);
            d6 += h9 * (5 * r7);
            c += d6 >>> 13;
            d6 &= 8191;
            d7 = c;
            d7 += h0 * r7;
            d7 += h1 * r6;
            d7 += h2 * r5;
            d7 += h3 * r4;
            d7 += h4 * r3;
            c = d7 >>> 13;
            d7 &= 8191;
            d7 += h5 * r2;
            d7 += h6 * r1;
            d7 += h7 * r0;
            d7 += h8 * (5 * r9);
            d7 += h9 * (5 * r8);
            c += d7 >>> 13;
            d7 &= 8191;
            d8 = c;
            d8 += h0 * r8;
            d8 += h1 * r7;
            d8 += h2 * r6;
            d8 += h3 * r5;
            d8 += h4 * r4;
            c = d8 >>> 13;
            d8 &= 8191;
            d8 += h5 * r3;
            d8 += h6 * r2;
            d8 += h7 * r1;
            d8 += h8 * r0;
            d8 += h9 * (5 * r9);
            c += d8 >>> 13;
            d8 &= 8191;
            d9 = c;
            d9 += h0 * r9;
            d9 += h1 * r8;
            d9 += h2 * r7;
            d9 += h3 * r6;
            d9 += h4 * r5;
            c = d9 >>> 13;
            d9 &= 8191;
            d9 += h5 * r4;
            d9 += h6 * r3;
            d9 += h7 * r2;
            d9 += h8 * r1;
            d9 += h9 * r0;
            c += d9 >>> 13;
            d9 &= 8191;
            c = (c << 2) + c | 0;
            c = c + d0 | 0;
            d0 = c & 8191;
            c = c >>> 13;
            d1 += c;
            h0 = d0;
            h1 = d1;
            h2 = d2;
            h3 = d3;
            h4 = d4;
            h5 = d5;
            h6 = d6;
            h7 = d7;
            h8 = d8;
            h9 = d9;
            mpos += 16;
            bytes -= 16;
          }
          this.h[0] = h0;
          this.h[1] = h1;
          this.h[2] = h2;
          this.h[3] = h3;
          this.h[4] = h4;
          this.h[5] = h5;
          this.h[6] = h6;
          this.h[7] = h7;
          this.h[8] = h8;
          this.h[9] = h9;
        };
        poly1305.prototype.finish = function(mac, macpos) {
          var g = new Uint16Array(10);
          var c, mask, f, i;
          if (this.leftover) {
            i = this.leftover;
            this.buffer[i++] = 1;
            for (; i < 16; i++)
              this.buffer[i] = 0;
            this.fin = 1;
            this.blocks(this.buffer, 0, 16);
          }
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          for (i = 2; i < 10; i++) {
            this.h[i] += c;
            c = this.h[i] >>> 13;
            this.h[i] &= 8191;
          }
          this.h[0] += c * 5;
          c = this.h[0] >>> 13;
          this.h[0] &= 8191;
          this.h[1] += c;
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          this.h[2] += c;
          g[0] = this.h[0] + 5;
          c = g[0] >>> 13;
          g[0] &= 8191;
          for (i = 1; i < 10; i++) {
            g[i] = this.h[i] + c;
            c = g[i] >>> 13;
            g[i] &= 8191;
          }
          g[9] -= 1 << 13;
          mask = (c ^ 1) - 1;
          for (i = 0; i < 10; i++)
            g[i] &= mask;
          mask = ~mask;
          for (i = 0; i < 10; i++)
            this.h[i] = this.h[i] & mask | g[i];
          this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
          this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
          this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
          this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
          this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
          this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
          this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
          this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
          f = this.h[0] + this.pad[0];
          this.h[0] = f & 65535;
          for (i = 1; i < 8; i++) {
            f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
            this.h[i] = f & 65535;
          }
          mac[macpos + 0] = this.h[0] >>> 0 & 255;
          mac[macpos + 1] = this.h[0] >>> 8 & 255;
          mac[macpos + 2] = this.h[1] >>> 0 & 255;
          mac[macpos + 3] = this.h[1] >>> 8 & 255;
          mac[macpos + 4] = this.h[2] >>> 0 & 255;
          mac[macpos + 5] = this.h[2] >>> 8 & 255;
          mac[macpos + 6] = this.h[3] >>> 0 & 255;
          mac[macpos + 7] = this.h[3] >>> 8 & 255;
          mac[macpos + 8] = this.h[4] >>> 0 & 255;
          mac[macpos + 9] = this.h[4] >>> 8 & 255;
          mac[macpos + 10] = this.h[5] >>> 0 & 255;
          mac[macpos + 11] = this.h[5] >>> 8 & 255;
          mac[macpos + 12] = this.h[6] >>> 0 & 255;
          mac[macpos + 13] = this.h[6] >>> 8 & 255;
          mac[macpos + 14] = this.h[7] >>> 0 & 255;
          mac[macpos + 15] = this.h[7] >>> 8 & 255;
        };
        poly1305.prototype.update = function(m, mpos, bytes) {
          var i, want;
          if (this.leftover) {
            want = 16 - this.leftover;
            if (want > bytes)
              want = bytes;
            for (i = 0; i < want; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            bytes -= want;
            mpos += want;
            this.leftover += want;
            if (this.leftover < 16)
              return;
            this.blocks(this.buffer, 0, 16);
            this.leftover = 0;
          }
          if (bytes >= 16) {
            want = bytes - bytes % 16;
            this.blocks(m, mpos, want);
            mpos += want;
            bytes -= want;
          }
          if (bytes) {
            for (i = 0; i < bytes; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            this.leftover += bytes;
          }
        };
        function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
          var s = new poly1305(k);
          s.update(m, mpos, n);
          s.finish(out, outpos);
          return 0;
        }
        function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
          var x = new Uint8Array(16);
          crypto_onetimeauth(x, 0, m, mpos, n, k);
          return crypto_verify_16(h, hpos, x, 0);
        }
        function crypto_secretbox(c, m, d, n, k) {
          var i;
          if (d < 32)
            return -1;
          crypto_stream_xor(c, 0, m, 0, d, n, k);
          crypto_onetimeauth(c, 16, c, 32, d - 32, c);
          for (i = 0; i < 16; i++)
            c[i] = 0;
          return 0;
        }
        function crypto_secretbox_open(m, c, d, n, k) {
          var i;
          var x = new Uint8Array(32);
          if (d < 32)
            return -1;
          crypto_stream(x, 0, 32, n, k);
          if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0)
            return -1;
          crypto_stream_xor(m, 0, c, 0, d, n, k);
          for (i = 0; i < 32; i++)
            m[i] = 0;
          return 0;
        }
        function set25519(r, a) {
          var i;
          for (i = 0; i < 16; i++)
            r[i] = a[i] | 0;
        }
        function car25519(o) {
          var i, v, c = 1;
          for (i = 0; i < 16; i++) {
            v = o[i] + c + 65535;
            c = Math.floor(v / 65536);
            o[i] = v - c * 65536;
          }
          o[0] += c - 1 + 37 * (c - 1);
        }
        function sel25519(p, q, b) {
          var t, c = ~(b - 1);
          for (var i = 0; i < 16; i++) {
            t = c & (p[i] ^ q[i]);
            p[i] ^= t;
            q[i] ^= t;
          }
        }
        function pack25519(o, n) {
          var i, j, b;
          var m = gf(), t = gf();
          for (i = 0; i < 16; i++)
            t[i] = n[i];
          car25519(t);
          car25519(t);
          car25519(t);
          for (j = 0; j < 2; j++) {
            m[0] = t[0] - 65517;
            for (i = 1; i < 15; i++) {
              m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
              m[i - 1] &= 65535;
            }
            m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
            b = m[15] >> 16 & 1;
            m[14] &= 65535;
            sel25519(t, m, 1 - b);
          }
          for (i = 0; i < 16; i++) {
            o[2 * i] = t[i] & 255;
            o[2 * i + 1] = t[i] >> 8;
          }
        }
        function neq25519(a, b) {
          var c = new Uint8Array(32), d = new Uint8Array(32);
          pack25519(c, a);
          pack25519(d, b);
          return crypto_verify_32(c, 0, d, 0);
        }
        function par25519(a) {
          var d = new Uint8Array(32);
          pack25519(d, a);
          return d[0] & 1;
        }
        function unpack25519(o, n) {
          var i;
          for (i = 0; i < 16; i++)
            o[i] = n[2 * i] + (n[2 * i + 1] << 8);
          o[15] &= 32767;
        }
        function A(o, a, b) {
          for (var i = 0; i < 16; i++)
            o[i] = a[i] + b[i];
        }
        function Z(o, a, b) {
          for (var i = 0; i < 16; i++)
            o[i] = a[i] - b[i];
        }
        function M(o, a, b) {
          var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
          v = a[0];
          t0 += v * b0;
          t1 += v * b1;
          t2 += v * b2;
          t3 += v * b3;
          t4 += v * b4;
          t5 += v * b5;
          t6 += v * b6;
          t7 += v * b7;
          t8 += v * b8;
          t9 += v * b9;
          t10 += v * b10;
          t11 += v * b11;
          t12 += v * b12;
          t13 += v * b13;
          t14 += v * b14;
          t15 += v * b15;
          v = a[1];
          t1 += v * b0;
          t2 += v * b1;
          t3 += v * b2;
          t4 += v * b3;
          t5 += v * b4;
          t6 += v * b5;
          t7 += v * b6;
          t8 += v * b7;
          t9 += v * b8;
          t10 += v * b9;
          t11 += v * b10;
          t12 += v * b11;
          t13 += v * b12;
          t14 += v * b13;
          t15 += v * b14;
          t16 += v * b15;
          v = a[2];
          t2 += v * b0;
          t3 += v * b1;
          t4 += v * b2;
          t5 += v * b3;
          t6 += v * b4;
          t7 += v * b5;
          t8 += v * b6;
          t9 += v * b7;
          t10 += v * b8;
          t11 += v * b9;
          t12 += v * b10;
          t13 += v * b11;
          t14 += v * b12;
          t15 += v * b13;
          t16 += v * b14;
          t17 += v * b15;
          v = a[3];
          t3 += v * b0;
          t4 += v * b1;
          t5 += v * b2;
          t6 += v * b3;
          t7 += v * b4;
          t8 += v * b5;
          t9 += v * b6;
          t10 += v * b7;
          t11 += v * b8;
          t12 += v * b9;
          t13 += v * b10;
          t14 += v * b11;
          t15 += v * b12;
          t16 += v * b13;
          t17 += v * b14;
          t18 += v * b15;
          v = a[4];
          t4 += v * b0;
          t5 += v * b1;
          t6 += v * b2;
          t7 += v * b3;
          t8 += v * b4;
          t9 += v * b5;
          t10 += v * b6;
          t11 += v * b7;
          t12 += v * b8;
          t13 += v * b9;
          t14 += v * b10;
          t15 += v * b11;
          t16 += v * b12;
          t17 += v * b13;
          t18 += v * b14;
          t19 += v * b15;
          v = a[5];
          t5 += v * b0;
          t6 += v * b1;
          t7 += v * b2;
          t8 += v * b3;
          t9 += v * b4;
          t10 += v * b5;
          t11 += v * b6;
          t12 += v * b7;
          t13 += v * b8;
          t14 += v * b9;
          t15 += v * b10;
          t16 += v * b11;
          t17 += v * b12;
          t18 += v * b13;
          t19 += v * b14;
          t20 += v * b15;
          v = a[6];
          t6 += v * b0;
          t7 += v * b1;
          t8 += v * b2;
          t9 += v * b3;
          t10 += v * b4;
          t11 += v * b5;
          t12 += v * b6;
          t13 += v * b7;
          t14 += v * b8;
          t15 += v * b9;
          t16 += v * b10;
          t17 += v * b11;
          t18 += v * b12;
          t19 += v * b13;
          t20 += v * b14;
          t21 += v * b15;
          v = a[7];
          t7 += v * b0;
          t8 += v * b1;
          t9 += v * b2;
          t10 += v * b3;
          t11 += v * b4;
          t12 += v * b5;
          t13 += v * b6;
          t14 += v * b7;
          t15 += v * b8;
          t16 += v * b9;
          t17 += v * b10;
          t18 += v * b11;
          t19 += v * b12;
          t20 += v * b13;
          t21 += v * b14;
          t22 += v * b15;
          v = a[8];
          t8 += v * b0;
          t9 += v * b1;
          t10 += v * b2;
          t11 += v * b3;
          t12 += v * b4;
          t13 += v * b5;
          t14 += v * b6;
          t15 += v * b7;
          t16 += v * b8;
          t17 += v * b9;
          t18 += v * b10;
          t19 += v * b11;
          t20 += v * b12;
          t21 += v * b13;
          t22 += v * b14;
          t23 += v * b15;
          v = a[9];
          t9 += v * b0;
          t10 += v * b1;
          t11 += v * b2;
          t12 += v * b3;
          t13 += v * b4;
          t14 += v * b5;
          t15 += v * b6;
          t16 += v * b7;
          t17 += v * b8;
          t18 += v * b9;
          t19 += v * b10;
          t20 += v * b11;
          t21 += v * b12;
          t22 += v * b13;
          t23 += v * b14;
          t24 += v * b15;
          v = a[10];
          t10 += v * b0;
          t11 += v * b1;
          t12 += v * b2;
          t13 += v * b3;
          t14 += v * b4;
          t15 += v * b5;
          t16 += v * b6;
          t17 += v * b7;
          t18 += v * b8;
          t19 += v * b9;
          t20 += v * b10;
          t21 += v * b11;
          t22 += v * b12;
          t23 += v * b13;
          t24 += v * b14;
          t25 += v * b15;
          v = a[11];
          t11 += v * b0;
          t12 += v * b1;
          t13 += v * b2;
          t14 += v * b3;
          t15 += v * b4;
          t16 += v * b5;
          t17 += v * b6;
          t18 += v * b7;
          t19 += v * b8;
          t20 += v * b9;
          t21 += v * b10;
          t22 += v * b11;
          t23 += v * b12;
          t24 += v * b13;
          t25 += v * b14;
          t26 += v * b15;
          v = a[12];
          t12 += v * b0;
          t13 += v * b1;
          t14 += v * b2;
          t15 += v * b3;
          t16 += v * b4;
          t17 += v * b5;
          t18 += v * b6;
          t19 += v * b7;
          t20 += v * b8;
          t21 += v * b9;
          t22 += v * b10;
          t23 += v * b11;
          t24 += v * b12;
          t25 += v * b13;
          t26 += v * b14;
          t27 += v * b15;
          v = a[13];
          t13 += v * b0;
          t14 += v * b1;
          t15 += v * b2;
          t16 += v * b3;
          t17 += v * b4;
          t18 += v * b5;
          t19 += v * b6;
          t20 += v * b7;
          t21 += v * b8;
          t22 += v * b9;
          t23 += v * b10;
          t24 += v * b11;
          t25 += v * b12;
          t26 += v * b13;
          t27 += v * b14;
          t28 += v * b15;
          v = a[14];
          t14 += v * b0;
          t15 += v * b1;
          t16 += v * b2;
          t17 += v * b3;
          t18 += v * b4;
          t19 += v * b5;
          t20 += v * b6;
          t21 += v * b7;
          t22 += v * b8;
          t23 += v * b9;
          t24 += v * b10;
          t25 += v * b11;
          t26 += v * b12;
          t27 += v * b13;
          t28 += v * b14;
          t29 += v * b15;
          v = a[15];
          t15 += v * b0;
          t16 += v * b1;
          t17 += v * b2;
          t18 += v * b3;
          t19 += v * b4;
          t20 += v * b5;
          t21 += v * b6;
          t22 += v * b7;
          t23 += v * b8;
          t24 += v * b9;
          t25 += v * b10;
          t26 += v * b11;
          t27 += v * b12;
          t28 += v * b13;
          t29 += v * b14;
          t30 += v * b15;
          t0 += 38 * t16;
          t1 += 38 * t17;
          t2 += 38 * t18;
          t3 += 38 * t19;
          t4 += 38 * t20;
          t5 += 38 * t21;
          t6 += 38 * t22;
          t7 += 38 * t23;
          t8 += 38 * t24;
          t9 += 38 * t25;
          t10 += 38 * t26;
          t11 += 38 * t27;
          t12 += 38 * t28;
          t13 += 38 * t29;
          t14 += 38 * t30;
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          o[0] = t0;
          o[1] = t1;
          o[2] = t2;
          o[3] = t3;
          o[4] = t4;
          o[5] = t5;
          o[6] = t6;
          o[7] = t7;
          o[8] = t8;
          o[9] = t9;
          o[10] = t10;
          o[11] = t11;
          o[12] = t12;
          o[13] = t13;
          o[14] = t14;
          o[15] = t15;
        }
        function S(o, a) {
          M(o, a, a);
        }
        function inv25519(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++)
            c[a] = i[a];
          for (a = 253; a >= 0; a--) {
            S(c, c);
            if (a !== 2 && a !== 4)
              M(c, c, i);
          }
          for (a = 0; a < 16; a++)
            o[a] = c[a];
        }
        function pow2523(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++)
            c[a] = i[a];
          for (a = 250; a >= 0; a--) {
            S(c, c);
            if (a !== 1)
              M(c, c, i);
          }
          for (a = 0; a < 16; a++)
            o[a] = c[a];
        }
        function crypto_scalarmult(q, n, p) {
          var z = new Uint8Array(32);
          var x = new Float64Array(80), r, i;
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
          for (i = 0; i < 31; i++)
            z[i] = n[i];
          z[31] = n[31] & 127 | 64;
          z[0] &= 248;
          unpack25519(x, p);
          for (i = 0; i < 16; i++) {
            b[i] = x[i];
            d[i] = a[i] = c[i] = 0;
          }
          a[0] = d[0] = 1;
          for (i = 254; i >= 0; --i) {
            r = z[i >>> 3] >>> (i & 7) & 1;
            sel25519(a, b, r);
            sel25519(c, d, r);
            A(e, a, c);
            Z(a, a, c);
            A(c, b, d);
            Z(b, b, d);
            S(d, e);
            S(f, a);
            M(a, c, a);
            M(c, b, e);
            A(e, a, c);
            Z(a, a, c);
            S(b, a);
            Z(c, d, f);
            M(a, c, _121665);
            A(a, a, d);
            M(c, c, a);
            M(a, d, f);
            M(d, b, x);
            S(b, e);
            sel25519(a, b, r);
            sel25519(c, d, r);
          }
          for (i = 0; i < 16; i++) {
            x[i + 16] = a[i];
            x[i + 32] = c[i];
            x[i + 48] = b[i];
            x[i + 64] = d[i];
          }
          var x32 = x.subarray(32);
          var x16 = x.subarray(16);
          inv25519(x32, x32);
          M(x16, x16, x32);
          pack25519(q, x16);
          return 0;
        }
        function crypto_scalarmult_base(q, n) {
          return crypto_scalarmult(q, n, _9);
        }
        function crypto_box_keypair(y, x) {
          randombytes(x, 32);
          return crypto_scalarmult_base(y, x);
        }
        function crypto_box_beforenm(k, y, x) {
          var s = new Uint8Array(32);
          crypto_scalarmult(s, x, y);
          return crypto_core_hsalsa20(k, _0, s, sigma);
        }
        var crypto_box_afternm = crypto_secretbox;
        var crypto_box_open_afternm = crypto_secretbox_open;
        function crypto_box(c, m, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_afternm(c, m, d, n, k);
        }
        function crypto_box_open(m, c, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_open_afternm(m, c, d, n, k);
        }
        var K = [
          1116352408,
          3609767458,
          1899447441,
          602891725,
          3049323471,
          3964484399,
          3921009573,
          2173295548,
          961987163,
          4081628472,
          1508970993,
          3053834265,
          2453635748,
          2937671579,
          2870763221,
          3664609560,
          3624381080,
          2734883394,
          310598401,
          1164996542,
          607225278,
          1323610764,
          1426881987,
          3590304994,
          1925078388,
          4068182383,
          2162078206,
          991336113,
          2614888103,
          633803317,
          3248222580,
          3479774868,
          3835390401,
          2666613458,
          4022224774,
          944711139,
          264347078,
          2341262773,
          604807628,
          2007800933,
          770255983,
          1495990901,
          1249150122,
          1856431235,
          1555081692,
          3175218132,
          1996064986,
          2198950837,
          2554220882,
          3999719339,
          2821834349,
          766784016,
          2952996808,
          2566594879,
          3210313671,
          3203337956,
          3336571891,
          1034457026,
          3584528711,
          2466948901,
          113926993,
          3758326383,
          338241895,
          168717936,
          666307205,
          1188179964,
          773529912,
          1546045734,
          1294757372,
          1522805485,
          1396182291,
          2643833823,
          1695183700,
          2343527390,
          1986661051,
          1014477480,
          2177026350,
          1206759142,
          2456956037,
          344077627,
          2730485921,
          1290863460,
          2820302411,
          3158454273,
          3259730800,
          3505952657,
          3345764771,
          106217008,
          3516065817,
          3606008344,
          3600352804,
          1432725776,
          4094571909,
          1467031594,
          275423344,
          851169720,
          430227734,
          3100823752,
          506948616,
          1363258195,
          659060556,
          3750685593,
          883997877,
          3785050280,
          958139571,
          3318307427,
          1322822218,
          3812723403,
          1537002063,
          2003034995,
          1747873779,
          3602036899,
          1955562222,
          1575990012,
          2024104815,
          1125592928,
          2227730452,
          2716904306,
          2361852424,
          442776044,
          2428436474,
          593698344,
          2756734187,
          3733110249,
          3204031479,
          2999351573,
          3329325298,
          3815920427,
          3391569614,
          3928383900,
          3515267271,
          566280711,
          3940187606,
          3454069534,
          4118630271,
          4000239992,
          116418474,
          1914138554,
          174292421,
          2731055270,
          289380356,
          3203993006,
          460393269,
          320620315,
          685471733,
          587496836,
          852142971,
          1086792851,
          1017036298,
          365543100,
          1126000580,
          2618297676,
          1288033470,
          3409855158,
          1501505948,
          4234509866,
          1607167915,
          987167468,
          1816402316,
          1246189591
        ];
        function crypto_hashblocks_hl(hh, hl, m, n) {
          var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
          var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
          var pos = 0;
          while (n >= 128) {
            for (i = 0; i < 16; i++) {
              j = 8 * i + pos;
              wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
              wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
            }
            for (i = 0; i < 80; i++) {
              bh0 = ah0;
              bh1 = ah1;
              bh2 = ah2;
              bh3 = ah3;
              bh4 = ah4;
              bh5 = ah5;
              bh6 = ah6;
              bh7 = ah7;
              bl0 = al0;
              bl1 = al1;
              bl2 = al2;
              bl3 = al3;
              bl4 = al4;
              bl5 = al5;
              bl6 = al6;
              bl7 = al7;
              h = ah7;
              l = al7;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
              l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah4 & ah5 ^ ~ah4 & ah6;
              l = al4 & al5 ^ ~al4 & al6;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = K[i * 2];
              l = K[i * 2 + 1];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = wh[i % 16];
              l = wl[i % 16];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              th = c & 65535 | d << 16;
              tl = a & 65535 | b << 16;
              h = th;
              l = tl;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
              l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
              l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh7 = c & 65535 | d << 16;
              bl7 = a & 65535 | b << 16;
              h = bh3;
              l = bl3;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = th;
              l = tl;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh3 = c & 65535 | d << 16;
              bl3 = a & 65535 | b << 16;
              ah1 = bh0;
              ah2 = bh1;
              ah3 = bh2;
              ah4 = bh3;
              ah5 = bh4;
              ah6 = bh5;
              ah7 = bh6;
              ah0 = bh7;
              al1 = bl0;
              al2 = bl1;
              al3 = bl2;
              al4 = bl3;
              al5 = bl4;
              al6 = bl5;
              al7 = bl6;
              al0 = bl7;
              if (i % 16 === 15) {
                for (j = 0; j < 16; j++) {
                  h = wh[j];
                  l = wl[j];
                  a = l & 65535;
                  b = l >>> 16;
                  c = h & 65535;
                  d = h >>> 16;
                  h = wh[(j + 9) % 16];
                  l = wl[(j + 9) % 16];
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 1) % 16];
                  tl = wl[(j + 1) % 16];
                  h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                  l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 14) % 16];
                  tl = wl[(j + 14) % 16];
                  h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                  l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;
                  wh[j] = c & 65535 | d << 16;
                  wl[j] = a & 65535 | b << 16;
                }
              }
            }
            h = ah0;
            l = al0;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[0];
            l = hl[0];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[0] = ah0 = c & 65535 | d << 16;
            hl[0] = al0 = a & 65535 | b << 16;
            h = ah1;
            l = al1;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[1];
            l = hl[1];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[1] = ah1 = c & 65535 | d << 16;
            hl[1] = al1 = a & 65535 | b << 16;
            h = ah2;
            l = al2;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[2];
            l = hl[2];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[2] = ah2 = c & 65535 | d << 16;
            hl[2] = al2 = a & 65535 | b << 16;
            h = ah3;
            l = al3;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[3];
            l = hl[3];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[3] = ah3 = c & 65535 | d << 16;
            hl[3] = al3 = a & 65535 | b << 16;
            h = ah4;
            l = al4;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[4];
            l = hl[4];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[4] = ah4 = c & 65535 | d << 16;
            hl[4] = al4 = a & 65535 | b << 16;
            h = ah5;
            l = al5;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[5];
            l = hl[5];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[5] = ah5 = c & 65535 | d << 16;
            hl[5] = al5 = a & 65535 | b << 16;
            h = ah6;
            l = al6;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[6];
            l = hl[6];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[6] = ah6 = c & 65535 | d << 16;
            hl[6] = al6 = a & 65535 | b << 16;
            h = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[7];
            l = hl[7];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[7] = ah7 = c & 65535 | d << 16;
            hl[7] = al7 = a & 65535 | b << 16;
            pos += 128;
            n -= 128;
          }
          return n;
        }
        function crypto_hash(out, m, n) {
          var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
          hh[0] = 1779033703;
          hh[1] = 3144134277;
          hh[2] = 1013904242;
          hh[3] = 2773480762;
          hh[4] = 1359893119;
          hh[5] = 2600822924;
          hh[6] = 528734635;
          hh[7] = 1541459225;
          hl[0] = 4089235720;
          hl[1] = 2227873595;
          hl[2] = 4271175723;
          hl[3] = 1595750129;
          hl[4] = 2917565137;
          hl[5] = 725511199;
          hl[6] = 4215389547;
          hl[7] = 327033209;
          crypto_hashblocks_hl(hh, hl, m, n);
          n %= 128;
          for (i = 0; i < n; i++)
            x[i] = m[b - n + i];
          x[n] = 128;
          n = 256 - 128 * (n < 112 ? 1 : 0);
          x[n - 9] = 0;
          ts64(x, n - 8, b / 536870912 | 0, b << 3);
          crypto_hashblocks_hl(hh, hl, x, n);
          for (i = 0; i < 8; i++)
            ts64(out, 8 * i, hh[i], hl[i]);
          return 0;
        }
        function add(p, q) {
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
          Z(a, p[1], p[0]);
          Z(t, q[1], q[0]);
          M(a, a, t);
          A(b, p[0], p[1]);
          A(t, q[0], q[1]);
          M(b, b, t);
          M(c, p[3], q[3]);
          M(c, c, D2);
          M(d, p[2], q[2]);
          A(d, d, d);
          Z(e, b, a);
          Z(f, d, c);
          A(g, d, c);
          A(h, b, a);
          M(p[0], e, f);
          M(p[1], h, g);
          M(p[2], g, f);
          M(p[3], e, h);
        }
        function cswap(p, q, b) {
          var i;
          for (i = 0; i < 4; i++) {
            sel25519(p[i], q[i], b);
          }
        }
        function pack(r, p) {
          var tx = gf(), ty = gf(), zi = gf();
          inv25519(zi, p[2]);
          M(tx, p[0], zi);
          M(ty, p[1], zi);
          pack25519(r, ty);
          r[31] ^= par25519(tx) << 7;
        }
        function scalarmult(p, q, s) {
          var b, i;
          set25519(p[0], gf0);
          set25519(p[1], gf1);
          set25519(p[2], gf1);
          set25519(p[3], gf0);
          for (i = 255; i >= 0; --i) {
            b = s[i / 8 | 0] >> (i & 7) & 1;
            cswap(p, q, b);
            add(q, p);
            add(p, p);
            cswap(p, q, b);
          }
        }
        function scalarbase(p, s) {
          var q = [gf(), gf(), gf(), gf()];
          set25519(q[0], X);
          set25519(q[1], Y);
          set25519(q[2], gf1);
          M(q[3], X, Y);
          scalarmult(p, q, s);
        }
        function crypto_sign_keypair(pk, sk, seeded) {
          var d = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()];
          var i;
          if (!seeded)
            randombytes(sk, 32);
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          scalarbase(p, d);
          pack(pk, p);
          for (i = 0; i < 32; i++)
            sk[i + 32] = pk[i];
          return 0;
        }
        var L = new Float64Array([
          237,
          211,
          245,
          92,
          26,
          99,
          18,
          88,
          214,
          156,
          247,
          162,
          222,
          249,
          222,
          20,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          16
        ]);
        function modL(r, x) {
          var carry, i, j, k;
          for (i = 63; i >= 32; --i) {
            carry = 0;
            for (j = i - 32, k = i - 12; j < k; ++j) {
              x[j] += carry - 16 * x[i] * L[j - (i - 32)];
              carry = Math.floor((x[j] + 128) / 256);
              x[j] -= carry * 256;
            }
            x[j] += carry;
            x[i] = 0;
          }
          carry = 0;
          for (j = 0; j < 32; j++) {
            x[j] += carry - (x[31] >> 4) * L[j];
            carry = x[j] >> 8;
            x[j] &= 255;
          }
          for (j = 0; j < 32; j++)
            x[j] -= carry * L[j];
          for (i = 0; i < 32; i++) {
            x[i + 1] += x[i] >> 8;
            r[i] = x[i] & 255;
          }
        }
        function reduce(r) {
          var x = new Float64Array(64), i;
          for (i = 0; i < 64; i++)
            x[i] = r[i];
          for (i = 0; i < 64; i++)
            r[i] = 0;
          modL(r, x);
        }
        function crypto_sign(sm, m, n, sk) {
          var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
          var i, j, x = new Float64Array(64);
          var p = [gf(), gf(), gf(), gf()];
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          var smlen = n + 64;
          for (i = 0; i < n; i++)
            sm[64 + i] = m[i];
          for (i = 0; i < 32; i++)
            sm[32 + i] = d[32 + i];
          crypto_hash(r, sm.subarray(32), n + 32);
          reduce(r);
          scalarbase(p, r);
          pack(sm, p);
          for (i = 32; i < 64; i++)
            sm[i] = sk[i];
          crypto_hash(h, sm, n + 64);
          reduce(h);
          for (i = 0; i < 64; i++)
            x[i] = 0;
          for (i = 0; i < 32; i++)
            x[i] = r[i];
          for (i = 0; i < 32; i++) {
            for (j = 0; j < 32; j++) {
              x[i + j] += h[i] * d[j];
            }
          }
          modL(sm.subarray(32), x);
          return smlen;
        }
        function unpackneg(r, p) {
          var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
          set25519(r[2], gf1);
          unpack25519(r[1], p);
          S(num, r[1]);
          M(den, num, D);
          Z(num, num, r[2]);
          A(den, r[2], den);
          S(den2, den);
          S(den4, den2);
          M(den6, den4, den2);
          M(t, den6, num);
          M(t, t, den);
          pow2523(t, t);
          M(t, t, num);
          M(t, t, den);
          M(t, t, den);
          M(r[0], t, den);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num))
            M(r[0], r[0], I);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num))
            return -1;
          if (par25519(r[0]) === p[31] >> 7)
            Z(r[0], gf0, r[0]);
          M(r[3], r[0], r[1]);
          return 0;
        }
        function crypto_sign_open(m, sm, n, pk) {
          var i;
          var t = new Uint8Array(32), h = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
          if (n < 64)
            return -1;
          if (unpackneg(q, pk))
            return -1;
          for (i = 0; i < n; i++)
            m[i] = sm[i];
          for (i = 0; i < 32; i++)
            m[i + 32] = pk[i];
          crypto_hash(h, m, n);
          reduce(h);
          scalarmult(p, q, h);
          scalarbase(q, sm.subarray(32));
          add(p, q);
          pack(t, p);
          n -= 64;
          if (crypto_verify_32(sm, 0, t, 0)) {
            for (i = 0; i < n; i++)
              m[i] = 0;
            return -1;
          }
          for (i = 0; i < n; i++)
            m[i] = sm[i + 64];
          return n;
        }
        var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
        nacl.lowlevel = {
          crypto_core_hsalsa20,
          crypto_stream_xor,
          crypto_stream,
          crypto_stream_salsa20_xor,
          crypto_stream_salsa20,
          crypto_onetimeauth,
          crypto_onetimeauth_verify,
          crypto_verify_16,
          crypto_verify_32,
          crypto_secretbox,
          crypto_secretbox_open,
          crypto_scalarmult,
          crypto_scalarmult_base,
          crypto_box_beforenm,
          crypto_box_afternm,
          crypto_box,
          crypto_box_open,
          crypto_box_keypair,
          crypto_hash,
          crypto_sign,
          crypto_sign_keypair,
          crypto_sign_open,
          crypto_secretbox_KEYBYTES,
          crypto_secretbox_NONCEBYTES,
          crypto_secretbox_ZEROBYTES,
          crypto_secretbox_BOXZEROBYTES,
          crypto_scalarmult_BYTES,
          crypto_scalarmult_SCALARBYTES,
          crypto_box_PUBLICKEYBYTES,
          crypto_box_SECRETKEYBYTES,
          crypto_box_BEFORENMBYTES,
          crypto_box_NONCEBYTES,
          crypto_box_ZEROBYTES,
          crypto_box_BOXZEROBYTES,
          crypto_sign_BYTES,
          crypto_sign_PUBLICKEYBYTES,
          crypto_sign_SECRETKEYBYTES,
          crypto_sign_SEEDBYTES,
          crypto_hash_BYTES,
          gf,
          D,
          L,
          pack25519,
          unpack25519,
          M,
          A,
          S,
          Z,
          pow2523,
          add,
          set25519,
          modL,
          scalarmult,
          scalarbase
        };
        function checkLengths(k, n) {
          if (k.length !== crypto_secretbox_KEYBYTES)
            throw new Error("bad key size");
          if (n.length !== crypto_secretbox_NONCEBYTES)
            throw new Error("bad nonce size");
        }
        function checkBoxLengths(pk, sk) {
          if (pk.length !== crypto_box_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          if (sk.length !== crypto_box_SECRETKEYBYTES)
            throw new Error("bad secret key size");
        }
        function checkArrayTypes() {
          for (var i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Uint8Array))
              throw new TypeError("unexpected type, use Uint8Array");
          }
        }
        function cleanup(arr) {
          for (var i = 0; i < arr.length; i++)
            arr[i] = 0;
        }
        nacl.randomBytes = function(n) {
          var b = new Uint8Array(n);
          randombytes(b, n);
          return b;
        };
        nacl.secretbox = function(msg, nonce, key) {
          checkArrayTypes(msg, nonce, key);
          checkLengths(key, nonce);
          var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
          var c = new Uint8Array(m.length);
          for (var i = 0; i < msg.length; i++)
            m[i + crypto_secretbox_ZEROBYTES] = msg[i];
          crypto_secretbox(c, m, m.length, nonce, key);
          return c.subarray(crypto_secretbox_BOXZEROBYTES);
        };
        nacl.secretbox.open = function(box, nonce, key) {
          checkArrayTypes(box, nonce, key);
          checkLengths(key, nonce);
          var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
          var m = new Uint8Array(c.length);
          for (var i = 0; i < box.length; i++)
            c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
          if (c.length < 32)
            return null;
          if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0)
            return null;
          return m.subarray(crypto_secretbox_ZEROBYTES);
        };
        nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
        nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
        nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
        nacl.scalarMult = function(n, p) {
          checkArrayTypes(n, p);
          if (n.length !== crypto_scalarmult_SCALARBYTES)
            throw new Error("bad n size");
          if (p.length !== crypto_scalarmult_BYTES)
            throw new Error("bad p size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult(q, n, p);
          return q;
        };
        nacl.scalarMult.base = function(n) {
          checkArrayTypes(n);
          if (n.length !== crypto_scalarmult_SCALARBYTES)
            throw new Error("bad n size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult_base(q, n);
          return q;
        };
        nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
        nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
        nacl.box = function(msg, nonce, publicKey, secretKey) {
          var k = nacl.box.before(publicKey, secretKey);
          return nacl.secretbox(msg, nonce, k);
        };
        nacl.box.before = function(publicKey, secretKey) {
          checkArrayTypes(publicKey, secretKey);
          checkBoxLengths(publicKey, secretKey);
          var k = new Uint8Array(crypto_box_BEFORENMBYTES);
          crypto_box_beforenm(k, publicKey, secretKey);
          return k;
        };
        nacl.box.after = nacl.secretbox;
        nacl.box.open = function(msg, nonce, publicKey, secretKey) {
          var k = nacl.box.before(publicKey, secretKey);
          return nacl.secretbox.open(msg, nonce, k);
        };
        nacl.box.open.after = nacl.secretbox.open;
        nacl.box.keyPair = function() {
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
          crypto_box_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.box.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_box_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          crypto_scalarmult_base(pk, secretKey);
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
        nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
        nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
        nacl.box.nonceLength = crypto_box_NONCEBYTES;
        nacl.box.overheadLength = nacl.secretbox.overheadLength;
        nacl.sign = function(msg, secretKey) {
          checkArrayTypes(msg, secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
          crypto_sign(signedMsg, msg, msg.length, secretKey);
          return signedMsg;
        };
        nacl.sign.open = function(signedMsg, publicKey) {
          checkArrayTypes(signedMsg, publicKey);
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var tmp = new Uint8Array(signedMsg.length);
          var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
          if (mlen < 0)
            return null;
          var m = new Uint8Array(mlen);
          for (var i = 0; i < m.length; i++)
            m[i] = tmp[i];
          return m;
        };
        nacl.sign.detached = function(msg, secretKey) {
          var signedMsg = nacl.sign(msg, secretKey);
          var sig = new Uint8Array(crypto_sign_BYTES);
          for (var i = 0; i < sig.length; i++)
            sig[i] = signedMsg[i];
          return sig;
        };
        nacl.sign.detached.verify = function(msg, sig, publicKey) {
          checkArrayTypes(msg, sig, publicKey);
          if (sig.length !== crypto_sign_BYTES)
            throw new Error("bad signature size");
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
          var m = new Uint8Array(crypto_sign_BYTES + msg.length);
          var i;
          for (i = 0; i < crypto_sign_BYTES; i++)
            sm[i] = sig[i];
          for (i = 0; i < msg.length; i++)
            sm[i + crypto_sign_BYTES] = msg[i];
          return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
        };
        nacl.sign.keyPair = function() {
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          crypto_sign_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.sign.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          for (var i = 0; i < pk.length; i++)
            pk[i] = secretKey[32 + i];
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl.sign.keyPair.fromSeed = function(seed) {
          checkArrayTypes(seed);
          if (seed.length !== crypto_sign_SEEDBYTES)
            throw new Error("bad seed size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          for (var i = 0; i < 32; i++)
            sk[i] = seed[i];
          crypto_sign_keypair(pk, sk, true);
          return { publicKey: pk, secretKey: sk };
        };
        nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
        nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
        nacl.sign.seedLength = crypto_sign_SEEDBYTES;
        nacl.sign.signatureLength = crypto_sign_BYTES;
        nacl.hash = function(msg) {
          checkArrayTypes(msg);
          var h = new Uint8Array(crypto_hash_BYTES);
          crypto_hash(h, msg, msg.length);
          return h;
        };
        nacl.hash.hashLength = crypto_hash_BYTES;
        nacl.verify = function(x, y) {
          checkArrayTypes(x, y);
          if (x.length === 0 || y.length === 0)
            return false;
          if (x.length !== y.length)
            return false;
          return vn(x, 0, y, 0, x.length) === 0 ? true : false;
        };
        nacl.setPRNG = function(fn) {
          randombytes = fn;
        };
        const _f = () => {
          var crypto = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
          if (crypto && crypto.getRandomValues) {
            var QUOTA = 65536;
            nacl.setPRNG(function(x, n) {
              var i, v = new Uint8Array(n);
              for (i = 0; i < n; i += QUOTA) {
                crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
              }
              for (i = 0; i < n; i++)
                x[i] = v[i];
              cleanup(v);
            });
          } else if (typeof __require !== "undefined") {
            if (crypto && crypto.randomBytes) {
              nacl.setPRNG(function(x, n) {
                var i, v = crypto.randomBytes(n);
                for (i = 0; i < n; i++)
                  x[i] = v[i];
                cleanup(v);
              });
            }
          }
        };
        _f();
      })(
        typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {}
      );
    }
  });

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1)
          validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // src/common/lib/buffer.js
  var require_buffer = __commonJS({
    "src/common/lib/buffer.js"(exports) {
      exports.Buffer = Buffer3;
      var K_MAX_LENGTH = 2147483647;
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      var base64 = require_base64_js();
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2)
          return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1)
                  bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1)
                  bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0)
              break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0)
              break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0)
              break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0)
              break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function isInstance(obj, type3) {
        return obj instanceof type3 || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type3.name;
      }
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0)
          return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError(
            "Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes"
          );
        }
        return length | 0;
      }
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError(
            'The value "' + length + '" is invalid for option "size"'
          );
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError(
            'The value "' + size + '" is invalid for option "size"'
          );
        }
      }
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val)
          val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError(
              'The value "' + val + '" is invalid for argument "value"'
            );
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0)
              encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining)
          length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding)
          encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed))
            return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(
          utf8ToBytes(string, buf.length - offset),
          buf,
          offset,
          length
        );
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(
          utf16leToBytes(string, buf.length - offset),
          buf,
          offset,
          length
        );
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length)
            break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0)
            break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
    }
  });

  // node_modules/ramda/es/internal/_isPlaceholder.js
  function _isPlaceholder(a) {
    return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
  }

  // node_modules/ramda/es/internal/_curry1.js
  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0 || _isPlaceholder(a)) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }

  // node_modules/ramda/es/internal/_curry2.js
  function _curry2(fn) {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;
        case 1:
          return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
            return fn(a, _b);
          });
        default:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
            return fn(_a, b);
          }) : _isPlaceholder(b) ? _curry1(function(_b) {
            return fn(a, _b);
          }) : fn(a, b);
      }
    };
  }

  // node_modules/ramda/es/internal/_isArray.js
  var isArray_default = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
  };

  // node_modules/ramda/es/internal/_has.js
  function _has(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // node_modules/ramda/es/internal/_isArguments.js
  var toString = Object.prototype.toString;
  var _isArguments = /* @__PURE__ */ function() {
    return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
      return toString.call(x) === "[object Arguments]";
    } : function _isArguments2(x) {
      return _has("callee", x);
    };
  }();
  var isArguments_default = _isArguments;

  // node_modules/ramda/es/keys.js
  var hasEnumBug = !/* @__PURE__ */ {
    toString: null
  }.propertyIsEnumerable("toString");
  var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
  var hasArgsEnumBug = /* @__PURE__ */ function() {
    "use strict";
    return arguments.propertyIsEnumerable("length");
  }();
  var contains = function contains2(list, item) {
    var idx = 0;
    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }
      idx += 1;
    }
    return false;
  };
  var keys = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys2(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) : /* @__PURE__ */ _curry1(function keys3(obj) {
    if (Object(obj) !== obj) {
      return [];
    }
    var prop, nIdx;
    var ks = [];
    var checkArgsLength = hasArgsEnumBug && isArguments_default(obj);
    for (prop in obj) {
      if (_has(prop, obj) && (!checkArgsLength || prop !== "length")) {
        ks[ks.length] = prop;
      }
    }
    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;
      while (nIdx >= 0) {
        prop = nonEnumerableProps[nIdx];
        if (_has(prop, obj) && !contains(ks, prop)) {
          ks[ks.length] = prop;
        }
        nIdx -= 1;
      }
    }
    return ks;
  });
  var keys_default = keys;

  // node_modules/ramda/es/internal/_isInteger.js
  var isInteger_default = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };

  // node_modules/ramda/es/isNil.js
  var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
    return x == null;
  });
  var isNil_default = isNil;

  // node_modules/ramda/es/type.js
  var type = /* @__PURE__ */ _curry1(function type2(val) {
    return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
  });
  var type_default = type;

  // node_modules/ramda/es/internal/_arrayFromIterator.js
  function _arrayFromIterator(iter) {
    var list = [];
    var next;
    while (!(next = iter.next()).done) {
      list.push(next.value);
    }
    return list;
  }

  // node_modules/ramda/es/internal/_includesWith.js
  function _includesWith(pred, x, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      if (pred(x, list[idx])) {
        return true;
      }
      idx += 1;
    }
    return false;
  }

  // node_modules/ramda/es/internal/_functionName.js
  function _functionName(f) {
    var match = String(f).match(/^function (\w*)/);
    return match == null ? "" : match[1];
  }

  // node_modules/ramda/es/internal/_objectIs.js
  function _objectIs(a, b) {
    if (a === b) {
      return a !== 0 || 1 / a === 1 / b;
    } else {
      return a !== a && b !== b;
    }
  }
  var objectIs_default = typeof Object.is === "function" ? Object.is : _objectIs;

  // node_modules/ramda/es/internal/_equals.js
  function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
    var a = _arrayFromIterator(aIterator);
    var b = _arrayFromIterator(bIterator);
    function eq(_a, _b) {
      return _equals(_a, _b, stackA.slice(), stackB.slice());
    }
    return !_includesWith(function(b2, aItem) {
      return !_includesWith(eq, aItem, b2);
    }, b, a);
  }
  function _equals(a, b, stackA, stackB) {
    if (objectIs_default(a, b)) {
      return true;
    }
    var typeA = type_default(a);
    if (typeA !== type_default(b)) {
      return false;
    }
    if (typeof a["fantasy-land/equals"] === "function" || typeof b["fantasy-land/equals"] === "function") {
      return typeof a["fantasy-land/equals"] === "function" && a["fantasy-land/equals"](b) && typeof b["fantasy-land/equals"] === "function" && b["fantasy-land/equals"](a);
    }
    if (typeof a.equals === "function" || typeof b.equals === "function") {
      return typeof a.equals === "function" && a.equals(b) && typeof b.equals === "function" && b.equals(a);
    }
    switch (typeA) {
      case "Arguments":
      case "Array":
      case "Object":
        if (typeof a.constructor === "function" && _functionName(a.constructor) === "Promise") {
          return a === b;
        }
        break;
      case "Boolean":
      case "Number":
      case "String":
        if (!(typeof a === typeof b && objectIs_default(a.valueOf(), b.valueOf()))) {
          return false;
        }
        break;
      case "Date":
        if (!objectIs_default(a.valueOf(), b.valueOf())) {
          return false;
        }
        break;
      case "Error":
        return a.name === b.name && a.message === b.message;
      case "RegExp":
        if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
          return false;
        }
        break;
    }
    var idx = stackA.length - 1;
    while (idx >= 0) {
      if (stackA[idx] === a) {
        return stackB[idx] === b;
      }
      idx -= 1;
    }
    switch (typeA) {
      case "Map":
        if (a.size !== b.size) {
          return false;
        }
        return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
      case "Set":
        if (a.size !== b.size) {
          return false;
        }
        return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
      case "Arguments":
      case "Array":
      case "Object":
      case "Boolean":
      case "Number":
      case "String":
      case "Date":
      case "Error":
      case "RegExp":
      case "Int8Array":
      case "Uint8Array":
      case "Uint8ClampedArray":
      case "Int16Array":
      case "Uint16Array":
      case "Int32Array":
      case "Uint32Array":
      case "Float32Array":
      case "Float64Array":
      case "ArrayBuffer":
        break;
      default:
        return false;
    }
    var keysA = keys_default(a);
    if (keysA.length !== keys_default(b).length) {
      return false;
    }
    var extendedStackA = stackA.concat([a]);
    var extendedStackB = stackB.concat([b]);
    idx = keysA.length - 1;
    while (idx >= 0) {
      var key = keysA[idx];
      if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
        return false;
      }
      idx -= 1;
    }
    return true;
  }

  // node_modules/ramda/es/equals.js
  var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
    return _equals(a, b, [], []);
  });
  var equals_default = equals;

  // node_modules/ramda/es/internal/_indexOf.js
  function _indexOf(list, a, idx) {
    var inf, item;
    if (typeof list.indexOf === "function") {
      switch (typeof a) {
        case "number":
          if (a === 0) {
            inf = 1 / a;
            while (idx < list.length) {
              item = list[idx];
              if (item === 0 && 1 / item === inf) {
                return idx;
              }
              idx += 1;
            }
            return -1;
          } else if (a !== a) {
            while (idx < list.length) {
              item = list[idx];
              if (typeof item === "number" && item !== item) {
                return idx;
              }
              idx += 1;
            }
            return -1;
          }
          return list.indexOf(a, idx);
        case "string":
        case "boolean":
        case "function":
        case "undefined":
          return list.indexOf(a, idx);
        case "object":
          if (a === null) {
            return list.indexOf(a, idx);
          }
      }
    }
    while (idx < list.length) {
      if (equals_default(list[idx], a)) {
        return idx;
      }
      idx += 1;
    }
    return -1;
  }

  // node_modules/ramda/es/internal/_includes.js
  function _includes(a, list) {
    return _indexOf(list, a, 0) >= 0;
  }

  // node_modules/ramda/es/internal/_toISOString.js
  var pad = function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  };
  var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d) {
    return d.toISOString();
  } : function _toISOString3(d) {
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "." + (d.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
  };

  // node_modules/ramda/es/includes.js
  var includes = /* @__PURE__ */ _curry2(_includes);
  var includes_default = includes;

  // node_modules/ramda/es/is.js
  var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
    return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
  });
  var is_default = is;

  // node_modules/ramda/es/internal/_of.js
  function _of(x) {
    return [x];
  }

  // node_modules/ramda/es/of.js
  var of = /* @__PURE__ */ _curry1(_of);
  var of_default = of;

  // node_modules/ramda/es/pickAll.js
  var pickAll = /* @__PURE__ */ _curry2(function pickAll2(names, obj) {
    var result = {};
    var idx = 0;
    var len = names.length;
    while (idx < len) {
      var name = names[idx];
      result[name] = obj[name];
      idx += 1;
    }
    return result;
  });
  var pickAll_default = pickAll;

  // node_modules/ramda/es/trim.js
  var hasProtoTrim = typeof String.prototype.trim === "function";

  // src/common/lib/utils.js
  var import_json_logic_js = __toESM(require_logic());
  var import_schemasafe = __toESM(require_src());
  var err = (msg = `The wrong query`, contractErr = false) => {
    if (contractErr) {
      const error = typeof ContractError === "undefined" ? Error : ContractError;
      throw new error(msg);
    } else {
      throw msg;
    }
  };
  var read = async (contract, param) => {
    return (await SmartWeave.contracts.viewContractState(contract, param)).result;
  };

  // src/internet-identity/actions/read/verifyInternetIdentity.js
  var import_tweetnacl = __toESM(require_tweetnacl());
  var decodeLen = (buf, offset) => {
    const lenBytes = decodeLenBytes(buf, offset);
    if (lenBytes === 1)
      return buf[offset];
    else if (lenBytes === 2)
      return buf[offset + 1];
    else if (lenBytes === 3)
      return (buf[offset + 1] << 8) + buf[offset + 2];
    else if (lenBytes === 4)
      return (buf[offset + 1] << 16) + (buf[offset + 2] << 8) + buf[offset + 3];
    throw new Error("Length too long (> 4 bytes)");
  };
  var bufEquals = (b1, b2) => {
    if (b1.byteLength !== b2.byteLength)
      return false;
    const u1 = new Uint8Array(b1);
    const u2 = new Uint8Array(b2);
    for (let i = 0; i < u1.length; i++) {
      if (u1[i] !== u2[i])
        return false;
    }
    return true;
  };
  var decodeLenBytes = (buf, offset) => {
    if (buf[offset] < 128)
      return 1;
    if (buf[offset] === 128)
      throw new Error("Invalid length 0");
    if (buf[offset] === 129)
      return 2;
    if (buf[offset] === 130)
      return 3;
    if (buf[offset] === 131)
      return 4;
    throw new Error("Length too long (> 4 bytes)");
  };
  var unwrapDER = (derEncoded, oid) => {
    let offset = 0;
    const expect = (n, msg) => {
      if (buf[offset++] !== n) {
        throw new Error("Expected: " + msg);
      }
    };
    const buf = new Uint8Array(derEncoded);
    expect(48, "sequence");
    offset += decodeLenBytes(buf, offset);
    if (!bufEquals(buf.slice(offset, offset + oid.byteLength), oid)) {
      throw new Error("Not the expected OID.");
    }
    offset += oid.byteLength;
    expect(3, "bit string");
    const payloadLen = decodeLen(buf, offset) - 1;
    offset += decodeLenBytes(buf, offset);
    expect(0, "0 padding");
    const result = buf.slice(offset);
    if (payloadLen !== result.length) {
      throw new Error(
        `DER payload mismatch: Expected length ${payloadLen} actual length ${result.length}`
      );
    }
    return result;
  };
  function fromHexString(hexString) {
    return new Uint8Array(
      (hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16))
    ).buffer;
  }
  var ED25519_OID = Uint8Array.from([
    ...[48, 5],
    ...[6, 3],
    ...[43, 101, 112]
  ]);
  var verifyInternetIdentity_default = async (state, action) => {
    const { data, signature, signer } = action.input;
    let isValid = false;
    try {
      if (import_tweetnacl.sign.detached.verify(
        new Uint8Array(Buffer.from(JSON.stringify(data))),
        new Uint8Array(fromHexString(signature)),
        new Uint8Array(unwrapDER(fromHexString(signer), ED25519_OID).buffer)
      )) {
        isValid = true;
      }
    } catch (e) {
      console.log(e);
    }
    return { result: { isValid } };
  };

  // src/common/lib/validate.js
  var import_buffer = __toESM(require_buffer());
  var validate = async (state, action, func) => {
    const {
      query,
      nonce,
      signature,
      caller,
      type: type3 = "secp256k1",
      pubKey
    } = action.input;
    if (!includes_default(type3)(
      state.auth.algorithms || [
        "secp256k1",
        "secp256k1-2",
        "ed25519",
        "rsa256",
        "poseidon"
      ]
    )) {
      err(`The wrong algorithm`);
    }
    let _caller = caller;
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "string" }
    ];
    const domain = {
      name: state.auth.name,
      version: state.auth.version,
      verifyingContract: isNil_default(SmartWeave.contract) ? "exm" : SmartWeave.contract.id
    };
    const message = {
      nonce,
      query: JSON.stringify({ func, query })
    };
    const _data = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" }
        ]
      },
      domain,
      primaryType: "Query",
      message
    };
    let signer = null;
    if (type3 === "ed25519") {
      const { isValid } = await read(state.contracts.dfinity, {
        function: "verify",
        data: _data,
        signature,
        signer: caller
      });
      if (isValid) {
        signer = caller;
      } else {
        err(`The wrong signature`);
      }
    } else if (type3 === "rsa256") {
      let encoded_data = JSON.stringify(_data);
      if (typeof TextEncoder !== "undefined") {
        const enc = new TextEncoder();
        encoded_data = enc.encode(encoded_data);
      }
      const _crypto = SmartWeave.arweave.crypto || SmartWeave.arweave.wallets.crypto;
      const isValid = await _crypto.verify(
        pubKey,
        encoded_data,
        import_buffer.Buffer.from(signature, "hex")
      );
      if (isValid) {
        signer = caller;
      } else {
        err(`The wrong signature`);
      }
    } else if (type3 == "secp256k1") {
      signer = (await read(state.contracts.ethereum, {
        function: "verify712",
        data: _data,
        signature
      })).signer;
    } else if (type3 == "secp256k1-2") {
      signer = (await read(state.contracts.ethereum, {
        function: "verify",
        data: _data,
        signature
      })).signer;
    } else if (type3 == "poseidon") {
      const { isValid } = await read(state.contracts.intmax, {
        function: "verify",
        data: _data,
        signature,
        pubKey
      });
      if (isValid) {
        signer = caller;
      } else {
        err(`The wrong signature`);
      }
    }
    if (includes_default(type3)(["secp256k1", "secp256k1-2", "poseidon"])) {
      if (/^0x/.test(signer))
        signer = signer.toLowerCase();
      if (/^0x/.test(_caller))
        _caller = _caller.toLowerCase();
    }
    let original_signer = signer;
    let _signer = signer;
    const link = state.auth.links[_signer];
    if (!isNil_default(link)) {
      let _address = is_default(Object, link) ? link.address : link;
      let _expiry = is_default(Object, link) ? link.expiry || 0 : 0;
      if (_expiry === 0 || SmartWeave.block.timestamp <= _expiry) {
        _signer = _address;
      }
    }
    if (_signer !== _caller)
      err(`signer is not caller`);
    if ((state.nonces[original_signer] || 0) + 1 !== nonce) {
      err(`The wrong nonce`);
    }
    if (isNil_default(state.nonces[original_signer]))
      state.nonces[original_signer] = 0;
    state.nonces[original_signer] += 1;
    return _signer;
  };

  // src/common/warp/actions/write/evolve.js
  var evolve = async (state, action, signer) => {
    signer ||= await validate(state, action, "evolve");
    let owner = state.owner || [];
    if (is_default(String)(owner))
      owner = of_default(owner);
    if (!includes_default(signer)(owner))
      err("Signer is not the owner.");
    if (action.input.value !== action.input.query.value) {
      err("Values don't match.");
    }
    if (state.canEvolve) {
      state.evolve = action.input.value;
    } else {
      err(`This contract cannot evolve.`);
    }
    return { state };
  };

  // src/common/actions/write/setCanEvolve.js
  var setCanEvolve = async (state, action, signer) => {
    signer ||= await validate(state, action, "setCanEvolve");
    let owner = state.owner || [];
    if (is_default(String)(owner))
      owner = of_default(owner);
    if (!includes_default(signer)(owner))
      err("Signer is not the owner.");
    if (!is_default(Boolean)(action.input.query.value)) {
      err("Value must be a boolean.");
    }
    state.canEvolve = action.input.query.value;
    return { state };
  };

  // src/common/actions/read/getEvolve.js
  var getEvolve = async (state, action) => {
    return {
      result: pickAll_default(["canEvolve", "evolve"])(state)
    };
  };

  // src/internet-identity/ii.js
  async function handle(state, action) {
    switch (action.input.function) {
      case "verify":
        return await verifyInternetIdentity_default(state, action);
      case "getEvolve":
        return await getEvolve(state, action);
      case "evolve":
        return await evolve(state, action);
      case "setCanEvolve":
        return await setCanEvolve(state, action);
      default:
        err(
          `No function supplied or function not recognised: "${action.input.function}"`
        );
    }
    return { state };
  }

