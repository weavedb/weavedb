
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod2) => function __require() {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
    isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
    mod2
  ));
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

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
      var safe = (string2) => {
        if (!/^[a-z][a-z0-9_]*$/i.test(string2))
          throw new Error("Does not look like a safe id");
        return new SafeString(string2);
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
        const getref = (sub2) => cache.ref.get(sub2);
        const genref = (sub2) => {
          const n = gensym("ref");
          cache.ref.set(sub2, n);
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
      var stringLength = (string2) => /[\uD800-\uDFFF]/.test(string2) ? [...string2].length : string2.length;
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
      var deBase64 = (string2) => {
        if (typeof Buffer !== "undefined")
          return Buffer.from(string2, "base64").toString("utf-8");
        const b = atob(string2);
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
      function untilde(string2) {
        if (!string2.includes("~"))
          return string2;
        return string2.replace(/~[01]/g, (match) => {
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
      function joinPath(baseFull, sub2) {
        if (typeof baseFull !== "string" || typeof sub2 !== "string")
          throw new Error("Unexpected path!");
        if (sub2.length === 0)
          return baseFull;
        const base = baseFull.replace(/#.*/, "");
        if (sub2.startsWith("#"))
          return `${base}${sub2}`;
        if (!base.includes("/") || protocolRegex.test(sub2))
          return sub2;
        if (protocolRegex.test(base))
          return `${new URL(sub2, base)}`;
        if (sub2.startsWith("/"))
          return sub2;
        return [...base.split("/").slice(0, -1), sub2].join("/");
      }
      function objpath2path(objpath) {
        const ids = objpath.map((obj) => obj && (obj.$id || obj.id) || "");
        return ids.filter((id) => id && typeof id === "string").reduce(joinPath, "");
      }
      var withSpecialChilds = ["properties", "patternProperties", "$defs", "definitions"];
      function resolveReference(root, additionalSchemas, ref, base = "") {
        const ptr = joinPath(base, ref);
        const schemas = new Map(additionalSchemas);
        const self = (base || "").split("#")[0];
        if (self)
          schemas.set(self, root);
        const results = [];
        const [main, hash = ""] = ptr.split("#");
        const local = decodeURI(hash).replace(/\/$/, "");
        const visit = (sub2, oldPath, specialChilds = false, dynamic = false) => {
          if (!sub2 || typeof sub2 !== "object")
            return;
          const id = sub2.$id || sub2.id;
          let path = oldPath;
          if (id && typeof id === "string") {
            path = joinPath(path, id);
            if (path === ptr || path === main && local === "") {
              results.push([sub2, root, oldPath]);
            } else if (path === main && local[0] === "/") {
              const objpath = [];
              const res = get(sub2, local, objpath);
              if (res !== void 0)
                results.push([res, root, joinPath(oldPath, objpath2path(objpath))]);
            }
          }
          const anchor = dynamic ? sub2.$dynamicAnchor : sub2.$anchor;
          if (anchor && typeof anchor === "string") {
            if (anchor.includes("#"))
              throw new Error("$anchor can't include '#'");
            if (anchor.startsWith("/"))
              throw new Error("$anchor can't start with '/'");
            path = joinPath(path, `#${anchor}`);
            if (path === ptr)
              results.push([sub2, root, oldPath]);
          }
          for (const k of Object.keys(sub2)) {
            if (!specialChilds && !Array.isArray(sub2) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            visit(sub2[k], path, !specialChilds && withSpecialChilds.includes(k));
          }
          if (!dynamic && sub2.$dynamicAnchor)
            visit(sub2, oldPath, specialChilds, true);
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
        const visit = (sub2, specialChilds = false) => {
          if (!sub2 || typeof sub2 !== "object")
            return;
          if (sub2 !== schema && (sub2.$id || sub2.id))
            return;
          const anchor = sub2.$dynamicAnchor;
          if (anchor && typeof anchor === "string") {
            if (anchor.includes("#"))
              throw new Error("$dynamicAnchor can't include '#'");
            if (!/^[a-zA-Z0-9_-]+$/.test(anchor))
              throw new Error(`Unsupported $dynamicAnchor: ${anchor}`);
            if (results.has(anchor))
              throw new Error(`duplicate $dynamicAnchor: ${anchor}`);
            results.set(anchor, sub2);
          }
          for (const k of Object.keys(sub2)) {
            if (!specialChilds && !Array.isArray(sub2) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            visit(sub2[k], !specialChilds && withSpecialChilds.includes(k));
          }
        };
        visit(schema);
        return results;
      }
      function hasKeywords(schema, keywords) {
        const visit = (sub2, specialChilds = false) => {
          if (!sub2 || typeof sub2 !== "object")
            return false;
          for (const k of Object.keys(sub2)) {
            if (keywords.includes(k))
              return true;
            if (!specialChilds && !Array.isArray(sub2) && !knownKeywords.includes(k))
              continue;
            if (!specialChilds && ["const", "enum", "examples", "comment"].includes(k))
              continue;
            if (visit(sub2[k], !specialChilds && withSpecialChilds.includes(k)))
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
                const visit = (sub2) => {
                  if (!sub2 || typeof sub2 !== "object")
                    return;
                  const id = cleanId(sub2.$id || sub2.id);
                  if (id && id.includes("://")) {
                    if (schemas.has(id))
                      throw new Error("Duplicate schema $id in 'schemas'");
                    schemas.set(id, sub2);
                  } else if (sub2 === schema) {
                    throw new Error("Schema with missing or invalid $id in 'schemas'");
                  }
                  for (const k of Object.keys(sub2))
                    visit(sub2[k]);
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
          } catch (e2) {
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
          const compileSub = (sub2, subR, path) => sub2 === schema ? safe("validate") : getref(sub2) || compileSchema(sub2, subR, opts, scope, path);
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
              const [sub2, subRoot, path] = resolved[0] || [];
              enforce(sub2 === subcheck, `Unexpected $dynamicAnchor resolution: ${key}`);
              const n = compileSub(sub2, subRoot, path);
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
            const sub2 = gensym("sub");
            fun.write("const %s = ", sub2);
            if (allErrors)
              fun.write("let errorCount = 0");
            const { stat: delta } = visit(suberr, nexthistory(), ...args);
            if (allErrors) {
              fun.write("return errorCount === 0");
            } else
              fun.write("return true");
            fun.write("})()");
            return { sub: sub2, delta };
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
              forObjectKeys(current, (sub2, key) => {
                fun.if(condition(key), () => {
                  if (ruleValue === false && willRemoveAdditional())
                    fun.write("delete %s[%s]", name, key);
                  else
                    rule(sub2, ruleValue, subPath(rulePath));
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
              const [frac, exp3] = `${value}.`.split(".")[1].split("e-");
              const e2 = frac.length + (exp3 ? Number(exp3) : 0);
              if (Number.isInteger(value * 2 ** e2))
                return format("%s %% %d !== 0", name, value);
              scope.isMultipleOf = functions.isMultipleOf;
              const args = [name, value, e2, Math.round(value * Math.pow(10, e2))];
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
                const { sub: sub2 } = subrule(suberr, prop, node.contains, subPath("contains"));
                fun.if(sub2, () => {
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
                const [sub2] = resolveReference(root, schemas, ischema.$ref, basePath())[0] || [];
                if (itemsSimple(sub2))
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
              forObjectKeys(current, (sub2, key) => {
                const nameSchema = typeof s === "object" && !s.$ref ? { type: "string", ...s } : s;
                const nameprop = Object.freeze({ name: key, errorParent: sub2, type: "string" });
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
                forObjectKeys(current, (sub2, key) => {
                  for (const p of Object.keys(patternProperties)) {
                    enforceRegex(p, node.propertyNames || {});
                    fun.if(patternTest(p, key), () => {
                      rule(sub2, patternProperties[p], subPath("patternProperties", p));
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
                const { sub: sub2, delta: deltaIf } = subrule(null, current, ifS, subPath("if"), dyn);
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
                fun.if(sub2, handleThen, handleElse);
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
                      const [sub2] = resolveReference(root, schemas, branch.$ref, basePath())[0] || [];
                      enforce(isPlainObject(sub2), "failed to resolve $ref:", branch.$ref);
                      const rprop = (sub2.properties || {})[pname] || {};
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
                const condition = safenotor(...entries.map(({ sub: sub2 }) => sub2));
                errorIf(condition, { path: ["anyOf"], suberr });
                for (const { delta: delta2, sub: sub2 } of entries)
                  fun.if(sub2, () => evaluateDeltaDynamic(delta2));
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
                  const { sub: sub2, delta: deltaVar } = subrule(suberr, current, sch, subPath("anyOf", key));
                  fun.if(safenot(sub2), oldBody);
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
              const [sub2, subRoot, path] = resolved[0] || [];
              if (!sub2 && sub2 !== false)
                fail("failed to resolve $ref:", $ref);
              if (sub2.type) {
                const type3 = Array.isArray(sub2.type) ? sub2.type : [sub2.type];
                evaluateDelta({ type: type3 });
                if (requireValidation) {
                  if (type3.includes("array"))
                    evaluateDelta({ items: Infinity });
                  if (type3.includes("object"))
                    evaluateDelta({ properties: [true] });
                }
              }
              return applyRef(compileSub(sub2, subRoot, path), { path: ["$ref"] });
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
              const [sub2, subRoot, path] = resolved[0];
              laxMode(sub2.$recursiveAnchor, "$recursiveRef without $recursiveAnchor");
              const n = compileSub(sub2, subRoot, path);
              const nrec = sub2.$recursiveAnchor ? format("(recursive || %s)", n) : n;
              return applyRef(nrec, { path: ["$recursiveRef"] });
            });
            handle2("$dynamicRef", ["string"], ($dynamicRef) => {
              if (!opts[optDynAnchors])
                throw new Error("Dynamic anchors are not enabled");
              enforce(/^[^#]*#[a-zA-Z0-9_-]+$/.test($dynamicRef), "Unsupported $dynamicRef format");
              const dynamicTail = $dynamicRef.replace(/^[^#]+/, "");
              const resolved = resolveReference(root, schemas, $dynamicRef, basePath());
              enforce(resolved[0], "$dynamicRef bookending resolution failed", $dynamicRef);
              const [sub2, subRoot, path] = resolved[0];
              const ok = sub2.$dynamicAnchor && `#${sub2.$dynamicAnchor}` === dynamicTail;
              laxMode(ok, "$dynamicRef without $dynamicAnchor in the same scope");
              const n = compileSub(sub2, subRoot, path);
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
              for (const sub2 of ["additionalProperties", "unevaluatedProperties"])
                if (node[sub2])
                  enforceValidation(`wild-card ${sub2}`, "requires propertyNames");
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
        } catch (e2) {
          if (!opts[optDynamic] && e2.message === "Dynamic unevaluated tracing is not enabled")
            return compile(schema, { ...opts, [optDynamic]: true });
          if (!opts[optDynAnchors] && e2.message === "Dynamic anchors are not enabled")
            return compile(schema, { ...opts, [optDynAnchors]: true });
          if (!opts[optRecAnchors] && e2.message === "Recursive anchors are not enabled")
            return compile(schema, { ...opts, [optRecAnchors]: true });
          throw e2;
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
          } catch (e2) {
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

  // src/intmax/lib/ffjavascript/scalar.js
  var scalar_exports = {};
  __export(scalar_exports, {
    abs: () => abs,
    add: () => add,
    band: () => band,
    bitLength: () => bitLength,
    bits: () => bits,
    bor: () => bor,
    bxor: () => bxor,
    div: () => div,
    e: () => e,
    eq: () => eq,
    exp: () => exp,
    fromArray: () => fromArray,
    fromRprBE: () => fromRprBE,
    fromRprLE: () => fromRprLE,
    fromString: () => fromString,
    geq: () => geq,
    gt: () => gt,
    isNegative: () => isNegative,
    isOdd: () => isOdd,
    isZero: () => isZero,
    land: () => land,
    leq: () => leq,
    lnot: () => lnot,
    lor: () => lor,
    lt: () => lt,
    mod: () => mod,
    mul: () => mul,
    naf: () => naf,
    neg: () => neg,
    neq: () => neq,
    one: () => one,
    pow: () => pow,
    shiftLeft: () => shiftLeft,
    shiftRight: () => shiftRight,
    shl: () => shl,
    shr: () => shr,
    square: () => square,
    sub: () => sub,
    toArray: () => toArray,
    toLEBuff: () => toLEBuff,
    toNumber: () => toNumber,
    toRprBE: () => toRprBE,
    toRprLE: () => toRprLE,
    toString: () => toString2,
    zero: () => zero
  });
  function fromString(s, radix) {
    if (!radix || radix == 10) {
      return BigInt(s);
    } else if (radix == 16) {
      if (s.slice(0, 2) == "0x") {
        return BigInt(s);
      } else {
        return BigInt("0x" + s);
      }
    }
  }
  function fromArray(a, radix) {
    let acc = BigInt(0);
    radix = BigInt(radix);
    for (let i = 0; i < a.length; i++) {
      acc = acc * radix + BigInt(a[i]);
    }
    return acc;
  }
  function bitLength(a) {
    const aS = a.toString(16);
    return (aS.length - 1) * 4 + hexLen[parseInt(aS[0], 16)];
  }
  function isNegative(a) {
    return BigInt(a) < BigInt(0);
  }
  function isZero(a) {
    return !a;
  }
  function shiftLeft(a, n) {
    return BigInt(a) << BigInt(n);
  }
  function shiftRight(a, n) {
    return BigInt(a) >> BigInt(n);
  }
  function isOdd(a) {
    return (BigInt(a) & BigInt(1)) == BigInt(1);
  }
  function naf(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
      if (E & BigInt(1)) {
        const z = 2 - Number(E % BigInt(4));
        res.push(z);
        E = E - BigInt(z);
      } else {
        res.push(0);
      }
      E = E >> BigInt(1);
    }
    return res;
  }
  function bits(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
      if (E & BigInt(1)) {
        res.push(1);
      } else {
        res.push(0);
      }
      E = E >> BigInt(1);
    }
    return res;
  }
  function toNumber(s) {
    if (s > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("Number too big");
    }
    return Number(s);
  }
  function toArray(s, radix) {
    const res = [];
    let rem = BigInt(s);
    radix = BigInt(radix);
    while (rem) {
      res.unshift(Number(rem % radix));
      rem = rem / radix;
    }
    return res;
  }
  function add(a, b) {
    return BigInt(a) + BigInt(b);
  }
  function sub(a, b) {
    return BigInt(a) - BigInt(b);
  }
  function neg(a) {
    return -BigInt(a);
  }
  function mul(a, b) {
    return BigInt(a) * BigInt(b);
  }
  function square(a) {
    return BigInt(a) * BigInt(a);
  }
  function pow(a, b) {
    return BigInt(a) ** BigInt(b);
  }
  function exp(a, b) {
    return BigInt(a) ** BigInt(b);
  }
  function abs(a) {
    return BigInt(a) >= 0 ? BigInt(a) : -BigInt(a);
  }
  function div(a, b) {
    return BigInt(a) / BigInt(b);
  }
  function mod(a, b) {
    return BigInt(a) % BigInt(b);
  }
  function eq(a, b) {
    return BigInt(a) == BigInt(b);
  }
  function neq(a, b) {
    return BigInt(a) != BigInt(b);
  }
  function lt(a, b) {
    return BigInt(a) < BigInt(b);
  }
  function gt(a, b) {
    return BigInt(a) > BigInt(b);
  }
  function leq(a, b) {
    return BigInt(a) <= BigInt(b);
  }
  function geq(a, b) {
    return BigInt(a) >= BigInt(b);
  }
  function band(a, b) {
    return BigInt(a) & BigInt(b);
  }
  function bor(a, b) {
    return BigInt(a) | BigInt(b);
  }
  function bxor(a, b) {
    return BigInt(a) ^ BigInt(b);
  }
  function land(a, b) {
    return BigInt(a) && BigInt(b);
  }
  function lor(a, b) {
    return BigInt(a) || BigInt(b);
  }
  function lnot(a) {
    return !BigInt(a);
  }
  function toRprLE(buff, o, e2, n8) {
    const s = "0000000" + e2.toString(16);
    const v = new Uint32Array(buff.buffer, o, n8 / 4);
    const l = ((s.length - 7) * 4 - 1 >> 5) + 1;
    for (let i = 0; i < l; i++)
      v[i] = parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16);
    for (let i = l; i < v.length; i++)
      v[i] = 0;
    for (let i = v.length * 4; i < n8; i++)
      buff[i] = toNumber(band(shiftRight(e2, i * 8), 255));
  }
  function toRprBE(buff, o, e2, n8) {
    const s = "0000000" + e2.toString(16);
    const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
    const l = ((s.length - 7) * 4 - 1 >> 5) + 1;
    for (let i = 0; i < l; i++)
      v.setUint32(
        n8 - i * 4 - 4,
        parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16),
        false
      );
    for (let i = 0; i < n8 / 4 - l; i++)
      v[i] = 0;
  }
  function fromRprLE(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new Uint32Array(buff.buffer, o, n8 / 4);
    const a = new Array(n8 / 4);
    v.forEach((ch, i) => a[a.length - i - 1] = ch.toString(16).padStart(8, "0"));
    return fromString(a.join(""), 16);
  }
  function fromRprBE(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
    const a = new Array(n8 / 4);
    for (let i = 0; i < n8 / 4; i++) {
      a[i] = v.getUint32(i * 4, false).toString(16).padStart(8, "0");
    }
    return fromString(a.join(""), 16);
  }
  function toString2(a, radix) {
    return a.toString(radix);
  }
  function toLEBuff(a) {
    const buff = new Uint8Array(Math.floor((bitLength(a) - 1) / 8) + 1);
    toRprLE(buff, 0, a, buff.byteLength);
    return buff;
  }
  var hexLen, e, shl, shr, zero, one;
  var init_scalar = __esm({
    "src/intmax/lib/ffjavascript/scalar.js"() {
      hexLen = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];
      e = fromString;
      shl = shiftLeft;
      shr = shiftRight;
      zero = e(0);
      one = e(1);
    }
  });

  // src/intmax/lib/ffjavascript/futils.js
  function exp2(F, base, e2) {
    if (isZero(e2))
      return F.one;
    const n = bits(e2);
    if (n.length == 0)
      return F.one;
    let res = base;
    for (let i = n.length - 2; i >= 0; i--) {
      res = F.square(res);
      if (n[i]) {
        res = F.mul(res, base);
      }
    }
    return res;
  }
  var init_futils = __esm({
    "src/intmax/lib/ffjavascript/futils.js"() {
      init_scalar();
    }
  });

  // src/intmax/lib/ffjavascript/fsqrt.js
  function buildSqrt(F) {
    if (F.m % 2 == 1) {
      if (eq(mod(F.p, 4), 1)) {
        if (eq(mod(F.p, 8), 1)) {
          if (eq(mod(F.p, 16), 1)) {
            alg5_tonelliShanks(F);
          } else if (eq(mod(F.p, 16), 9)) {
            alg4_kong(F);
          } else {
            throw new Error("Field withot sqrt");
          }
        } else if (eq(mod(F.p, 8), 5)) {
          alg3_atkin(F);
        } else {
          throw new Error("Field withot sqrt");
        }
      } else if (eq(mod(F.p, 4), 3)) {
        alg2_shanks(F);
      }
    } else {
      const pm2mod4 = mod(pow(F.p, F.m / 2), 4);
      if (pm2mod4 == 1) {
        alg10_adj(F);
      } else if (pm2mod4 == 3) {
        alg9_adj(F);
      } else {
        alg8_complex(F);
      }
    }
  }
  function alg5_tonelliShanks(F) {
    F.sqrt_q = pow(F.p, F.m);
    F.sqrt_s = 0;
    F.sqrt_t = sub(F.sqrt_q, 1);
    while (!isOdd(F.sqrt_t)) {
      F.sqrt_s = F.sqrt_s + 1;
      F.sqrt_t = div(F.sqrt_t, 2);
    }
    let c0 = F.one;
    while (F.eq(c0, F.one)) {
      const c = F.random();
      F.sqrt_z = F.pow(c, F.sqrt_t);
      c0 = F.pow(F.sqrt_z, 2 ** (F.sqrt_s - 1));
    }
    F.sqrt_tm1d2 = div(sub(F.sqrt_t, 1), 2);
    F.sqrt = function(a) {
      const F2 = this;
      if (F2.isZero(a))
        return F2.zero;
      let w = F2.pow(a, F2.sqrt_tm1d2);
      const a0 = F2.pow(F2.mul(F2.square(w), a), 2 ** (F2.sqrt_s - 1));
      if (F2.eq(a0, F2.negone))
        return null;
      let v = F2.sqrt_s;
      let x = F2.mul(a, w);
      let b = F2.mul(x, w);
      let z = F2.sqrt_z;
      while (!F2.eq(b, F2.one)) {
        let b2k = F2.square(b);
        let k = 1;
        while (!F2.eq(b2k, F2.one)) {
          b2k = F2.square(b2k);
          k++;
        }
        w = z;
        for (let i = 0; i < v - k - 1; i++) {
          w = F2.square(w);
        }
        z = F2.square(w);
        b = F2.mul(b, z);
        x = F2.mul(x, w);
        v = k;
      }
      return F2.geq(x, F2.zero) ? x : F2.neg(x);
    };
  }
  function alg4_kong(F) {
    F.sqrt = function() {
      throw new Error("Sqrt alg 4 not implemented");
    };
  }
  function alg3_atkin(F) {
    F.sqrt = function() {
      throw new Error("Sqrt alg 3 not implemented");
    };
  }
  function alg2_shanks(F) {
    F.sqrt_q = pow(F.p, F.m);
    F.sqrt_e1 = div(sub(F.sqrt_q, 3), 4);
    F.sqrt = function(a) {
      if (this.isZero(a))
        return this.zero;
      const a1 = this.pow(a, this.sqrt_e1);
      const a0 = this.mul(this.square(a1), a);
      if (this.eq(a0, this.negone))
        return null;
      const x = this.mul(a1, a);
      return F.geq(x, F.zero) ? x : F.neg(x);
    };
  }
  function alg10_adj(F) {
    F.sqrt = function() {
      throw new Error("Sqrt alg 10 not implemented");
    };
  }
  function alg9_adj(F) {
    F.sqrt_q = pow(F.p, F.m / 2);
    F.sqrt_e34 = div(sub(F.sqrt_q, 3), 4);
    F.sqrt_e12 = div(sub(F.sqrt_q, 1), 2);
    F.frobenius = function(n, x) {
      if (n % 2 == 1) {
        return F.conjugate(x);
      } else {
        return x;
      }
    };
    F.sqrt = function(a) {
      const F2 = this;
      const a1 = F2.pow(a, F2.sqrt_e34);
      const alfa = F2.mul(F2.square(a1), a);
      const a0 = F2.mul(F2.frobenius(1, alfa), alfa);
      if (F2.eq(a0, F2.negone))
        return null;
      const x0 = F2.mul(a1, a);
      let x;
      if (F2.eq(alfa, F2.negone)) {
        x = F2.mul(x0, [F2.F.zero, F2.F.one]);
      } else {
        const b = F2.pow(F2.add(F2.one, alfa), F2.sqrt_e12);
        x = F2.mul(b, x0);
      }
      return F2.geq(x, F2.zero) ? x : F2.neg(x);
    };
  }
  function alg8_complex(F) {
    F.sqrt = function() {
      throw new Error("Sqrt alg 8 not implemented");
    };
  }
  var init_fsqrt = __esm({
    "src/intmax/lib/ffjavascript/fsqrt.js"() {
      init_scalar();
    }
  });

  // src/intmax/lib/ffjavascript/chacha.js
  function quarterRound(st, a, b, c, d) {
    st[a] = st[a] + st[b] >>> 0;
    st[d] = (st[d] ^ st[a]) >>> 0;
    st[d] = (st[d] << 16 | st[d] >>> 16 & 65535) >>> 0;
    st[c] = st[c] + st[d] >>> 0;
    st[b] = (st[b] ^ st[c]) >>> 0;
    st[b] = (st[b] << 12 | st[b] >>> 20 & 4095) >>> 0;
    st[a] = st[a] + st[b] >>> 0;
    st[d] = (st[d] ^ st[a]) >>> 0;
    st[d] = (st[d] << 8 | st[d] >>> 24 & 255) >>> 0;
    st[c] = st[c] + st[d] >>> 0;
    st[b] = (st[b] ^ st[c]) >>> 0;
    st[b] = (st[b] << 7 | st[b] >>> 25 & 127) >>> 0;
  }
  function doubleRound(st) {
    quarterRound(st, 0, 4, 8, 12);
    quarterRound(st, 1, 5, 9, 13);
    quarterRound(st, 2, 6, 10, 14);
    quarterRound(st, 3, 7, 11, 15);
    quarterRound(st, 0, 5, 10, 15);
    quarterRound(st, 1, 6, 11, 12);
    quarterRound(st, 2, 7, 8, 13);
    quarterRound(st, 3, 4, 9, 14);
  }
  var ChaCha;
  var init_chacha = __esm({
    "src/intmax/lib/ffjavascript/chacha.js"() {
      init_scalar();
      ChaCha = class {
        constructor(seed) {
          seed = seed || [0, 0, 0, 0, 0, 0, 0, 0];
          this.state = [
            1634760805,
            857760878,
            2036477234,
            1797285236,
            seed[0],
            seed[1],
            seed[2],
            seed[3],
            seed[4],
            seed[5],
            seed[6],
            seed[7],
            0,
            0,
            0,
            0
          ];
          this.idx = 16;
          this.buff = new Array(16);
        }
        nextU32() {
          if (this.idx == 16)
            this.update();
          return this.buff[this.idx++];
        }
        nextU64() {
          return add(mul(this.nextU32(), 4294967296), this.nextU32());
        }
        nextBool() {
          return (this.nextU32() & 1) == 1;
        }
        update() {
          for (let i = 0; i < 16; i++)
            this.buff[i] = this.state[i];
          for (let i = 0; i < 10; i++)
            doubleRound(this.buff);
          for (let i = 0; i < 16; i++)
            this.buff[i] = this.buff[i] + this.state[i] >>> 0;
          this.idx = 0;
          this.state[12] = this.state[12] + 1 >>> 0;
          if (this.state[12] != 0)
            return;
          this.state[13] = this.state[13] + 1 >>> 0;
          if (this.state[13] != 0)
            return;
          this.state[14] = this.state[14] + 1 >>> 0;
          if (this.state[14] != 0)
            return;
          this.state[15] = this.state[15] + 1 >>> 0;
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/random.js
  function getRandomBytes(n) {
    let array = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      array[i] = Math.random() * 4294967296 >>> 0;
    }
    return array;
  }
  function getRandomSeed() {
    const arr = getRandomBytes(32);
    const arrV = new Uint32Array(arr.buffer);
    const seed = [];
    for (let i = 0; i < 8; i++) {
      seed.push(arrV[i]);
    }
    return seed;
  }
  function getThreadRng() {
    if (threadRng)
      return threadRng;
    threadRng = new ChaCha(getRandomSeed());
    return threadRng;
  }
  var threadRng;
  var init_random = __esm({
    "src/intmax/lib/ffjavascript/random.js"() {
      init_chacha();
      threadRng = null;
    }
  });

  // src/intmax/lib/ffjavascript/fft.js
  function log2(V) {
    return ((V & 4294901760) !== 0 ? (V &= 4294901760, 16) : 0) | ((V & 4278255360) !== 0 ? (V &= 4278255360, 8) : 0) | ((V & 4042322160) !== 0 ? (V &= 4042322160, 4) : 0) | ((V & 3435973836) !== 0 ? (V &= 3435973836, 2) : 0) | (V & 2863311530) !== 0;
  }
  function __fft(PF, pall, bits2, offset, step) {
    const n = 1 << bits2;
    if (n == 1) {
      return [pall[offset]];
    } else if (n == 2) {
      return [
        PF.G.add(pall[offset], pall[offset + step]),
        PF.G.sub(pall[offset], pall[offset + step])
      ];
    }
    const ndiv2 = n >> 1;
    const p1 = __fft(PF, pall, bits2 - 1, offset, step * 2);
    const p2 = __fft(PF, pall, bits2 - 1, offset + step, step * 2);
    const out = new Array(n);
    for (let i = 0; i < ndiv2; i++) {
      out[i] = PF.G.add(p1[i], PF.opMulGF(p2[i], PF.roots[bits2][i]));
      out[i + ndiv2] = PF.G.sub(p1[i], PF.opMulGF(p2[i], PF.roots[bits2][i]));
    }
    return out;
  }
  var FFT;
  var init_fft = __esm({
    "src/intmax/lib/ffjavascript/fft.js"() {
      FFT = class {
        constructor(G, F, opMulGF) {
          this.F = F;
          this.G = G;
          this.opMulGF = opMulGF;
          let rem = F.sqrt_t || F.t;
          let s = F.sqrt_s || F.s;
          let nqr = F.one;
          while (F.eq(F.pow(nqr, F.half), F.one))
            nqr = F.add(nqr, F.one);
          this.w = new Array(s + 1);
          this.wi = new Array(s + 1);
          this.w[s] = this.F.pow(nqr, rem);
          this.wi[s] = this.F.inv(this.w[s]);
          let n = s - 1;
          while (n >= 0) {
            this.w[n] = this.F.square(this.w[n + 1]);
            this.wi[n] = this.F.square(this.wi[n + 1]);
            n--;
          }
          this.roots = [];
          this._setRoots(Math.min(s, 15));
        }
        _setRoots(n) {
          for (let i = n; i >= 0 && !this.roots[i]; i--) {
            let r = this.F.one;
            const nroots = 1 << i;
            const rootsi = new Array(nroots);
            for (let j = 0; j < nroots; j++) {
              rootsi[j] = r;
              r = this.F.mul(r, this.w[i]);
            }
            this.roots[i] = rootsi;
          }
        }
        fft(p) {
          if (p.length <= 1)
            return p;
          const bits2 = log2(p.length - 1) + 1;
          this._setRoots(bits2);
          const m = 1 << bits2;
          if (p.length != m) {
            throw new Error("Size must be multiple of 2");
          }
          const res = __fft(this, p, bits2, 0, 1);
          return res;
        }
        ifft(p) {
          if (p.length <= 1)
            return p;
          const bits2 = log2(p.length - 1) + 1;
          this._setRoots(bits2);
          const m = 1 << bits2;
          if (p.length != m) {
            throw new Error("Size must be multiple of 2");
          }
          const res = __fft(this, p, bits2, 0, 1);
          const twoinvm = this.F.inv(this.F.mulScalar(this.F.one, m));
          const resn = new Array(m);
          for (let i = 0; i < m; i++) {
            resn[i] = this.opMulGF(res[(m - i) % m], twoinvm);
          }
          return resn;
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/f1field.js
  var ZqField;
  var init_f1field = __esm({
    "src/intmax/lib/ffjavascript/f1field.js"() {
      init_scalar();
      init_futils();
      init_fsqrt();
      init_random();
      init_fft();
      ZqField = class {
        constructor(p) {
          this.type = "F1";
          this.one = BigInt(1);
          this.zero = BigInt(0);
          this.p = BigInt(p);
          this.m = 1;
          this.negone = this.p - this.one;
          this.two = BigInt(2);
          this.half = this.p >> this.one;
          this.bitLength = bitLength(this.p);
          this.mask = (this.one << BigInt(this.bitLength)) - this.one;
          this.n64 = Math.floor((this.bitLength - 1) / 64) + 1;
          this.n32 = this.n64 * 2;
          this.n8 = this.n64 * 8;
          this.R = this.e(this.one << BigInt(this.n64 * 64));
          this.Ri = this.inv(this.R);
          const e2 = this.negone >> this.one;
          this.nqr = this.two;
          let r = this.pow(this.nqr, e2);
          while (!this.eq(r, this.negone)) {
            this.nqr = this.nqr + this.one;
            r = this.pow(this.nqr, e2);
          }
          this.s = 0;
          this.t = this.negone;
          while ((this.t & this.one) == this.zero) {
            this.s = this.s + 1;
            this.t = this.t >> this.one;
          }
          this.nqr_to_t = this.pow(this.nqr, this.t);
          buildSqrt(this);
          this.FFT = new FFT(this, this, this.mul.bind(this));
          this.fft = this.FFT.fft.bind(this.FFT);
          this.ifft = this.FFT.ifft.bind(this.FFT);
          this.w = this.FFT.w;
          this.wi = this.FFT.wi;
          this.shift = this.square(this.nqr);
          this.k = this.exp(this.nqr, 2 ** this.s);
        }
        e(a, b) {
          let res;
          if (!b) {
            res = BigInt(a);
          } else if (b == 16) {
            res = BigInt("0x" + a);
          }
          if (res < 0) {
            let nres = -res;
            if (nres >= this.p)
              nres = nres % this.p;
            return this.p - nres;
          } else {
            return res >= this.p ? res % this.p : res;
          }
        }
        add(a, b) {
          const res = a + b;
          return res >= this.p ? res - this.p : res;
        }
        sub(a, b) {
          return a >= b ? a - b : this.p - b + a;
        }
        neg(a) {
          return a ? this.p - a : a;
        }
        mul(a, b) {
          return a * b % this.p;
        }
        mulScalar(base, s) {
          return base * this.e(s) % this.p;
        }
        square(a) {
          return a * a % this.p;
        }
        eq(a, b) {
          return a == b;
        }
        neq(a, b) {
          return a != b;
        }
        lt(a, b) {
          const aa = a > this.half ? a - this.p : a;
          const bb = b > this.half ? b - this.p : b;
          return aa < bb;
        }
        gt(a, b) {
          const aa = a > this.half ? a - this.p : a;
          const bb = b > this.half ? b - this.p : b;
          return aa > bb;
        }
        leq(a, b) {
          const aa = a > this.half ? a - this.p : a;
          const bb = b > this.half ? b - this.p : b;
          return aa <= bb;
        }
        geq(a, b) {
          const aa = a > this.half ? a - this.p : a;
          const bb = b > this.half ? b - this.p : b;
          return aa >= bb;
        }
        div(a, b) {
          return this.mul(a, this.inv(b));
        }
        idiv(a, b) {
          if (!b)
            throw new Error("Division by zero");
          return a / b;
        }
        inv(a) {
          if (!a)
            throw new Error("Division by zero");
          let t = this.zero;
          let r = this.p;
          let newt = this.one;
          let newr = a % this.p;
          while (newr) {
            let q = r / newr;
            [t, newt] = [newt, t - q * newt];
            [r, newr] = [newr, r - q * newr];
          }
          if (t < this.zero)
            t += this.p;
          return t;
        }
        mod(a, b) {
          return a % b;
        }
        pow(b, e2) {
          return exp2(this, b, e2);
        }
        exp(b, e2) {
          return exp2(this, b, e2);
        }
        band(a, b) {
          const res = a & b & this.mask;
          return res >= this.p ? res - this.p : res;
        }
        bor(a, b) {
          const res = (a | b) & this.mask;
          return res >= this.p ? res - this.p : res;
        }
        bxor(a, b) {
          const res = (a ^ b) & this.mask;
          return res >= this.p ? res - this.p : res;
        }
        bnot(a) {
          const res = a ^ this.mask;
          return res >= this.p ? res - this.p : res;
        }
        shl(a, b) {
          if (Number(b) < this.bitLength) {
            const res = a << b & this.mask;
            return res >= this.p ? res - this.p : res;
          } else {
            const nb = this.p - b;
            if (Number(nb) < this.bitLength) {
              return a >> nb;
            } else {
              return this.zero;
            }
          }
        }
        shr(a, b) {
          if (Number(b) < this.bitLength) {
            return a >> b;
          } else {
            const nb = this.p - b;
            if (Number(nb) < this.bitLength) {
              const res = a << nb & this.mask;
              return res >= this.p ? res - this.p : res;
            } else {
              return 0;
            }
          }
        }
        land(a, b) {
          return a && b ? this.one : this.zero;
        }
        lor(a, b) {
          return a || b ? this.one : this.zero;
        }
        lnot(a) {
          return a ? this.zero : this.one;
        }
        sqrt_old(n) {
          if (n == this.zero)
            return this.zero;
          const res = this.pow(n, this.negone >> this.one);
          if (res != this.one)
            return null;
          let m = this.s;
          let c = this.nqr_to_t;
          let t = this.pow(n, this.t);
          let r = this.pow(n, this.add(this.t, this.one) >> this.one);
          while (t != this.one) {
            let sq = this.square(t);
            let i = 1;
            while (sq != this.one) {
              i++;
              sq = this.square(sq);
            }
            let b = c;
            for (let j = 0; j < m - i - 1; j++)
              b = this.square(b);
            m = i;
            c = this.square(b);
            t = this.mul(t, c);
            r = this.mul(r, b);
          }
          if (r > this.p >> this.one) {
            r = this.neg(r);
          }
          return r;
        }
        normalize(a, b) {
          a = BigInt(a, b);
          if (a < 0) {
            let na = -a;
            if (na >= this.p)
              na = na % this.p;
            return this.p - na;
          } else {
            return a >= this.p ? a % this.p : a;
          }
        }
        random() {
          const nBytes = this.bitLength * 2 / 8;
          let res = this.zero;
          for (let i = 0; i < nBytes; i++) {
            res = (res << BigInt(8)) + BigInt(getRandomBytes(1)[0]);
          }
          return res % this.p;
        }
        toString(a, base) {
          base = base || 10;
          let vs;
          if (a > this.half && base == 10) {
            const v = this.p - a;
            vs = "-" + v.toString(base);
          } else {
            vs = a.toString(base);
          }
          return vs;
        }
        isZero(a) {
          return a == this.zero;
        }
        fromRng(rng) {
          let v;
          do {
            v = this.zero;
            for (let i = 0; i < this.n64; i++) {
              v += rng.nextU64() << BigInt(64 * i);
            }
            v &= this.mask;
          } while (v >= this.p);
          v = v * this.Ri % this.p;
          return v;
        }
        fft(a) {
          return this.FFT.fft(a);
        }
        ifft(a) {
          return this.FFT.ifft(a);
        }
        toRprLE(buff, o, e2) {
          toRprLE(buff, o, e2, this.n64 * 8);
        }
        toRprBE(buff, o, e2) {
          toRprBE(buff, o, e2, this.n64 * 8);
        }
        toRprBEM(buff, o, e2) {
          return this.toRprBE(buff, o, this.mul(this.R, e2));
        }
        toRprLEM(buff, o, e2) {
          return this.toRprLE(buff, o, this.mul(this.R, e2));
        }
        fromRprLE(buff, o) {
          return fromRprLE(buff, o, this.n8);
        }
        fromRprBE(buff, o) {
          return fromRprBE(buff, o, this.n8);
        }
        fromRprLEM(buff, o) {
          return this.mul(this.fromRprLE(buff, o), this.Ri);
        }
        fromRprBEM(buff, o) {
          return this.mul(this.fromRprBE(buff, o), this.Ri);
        }
        toObject(a) {
          return a;
        }
      };
    }
  });

  // node_modules/wasmcurves/src/utils.js
  var require_utils = __commonJS({
    "node_modules/wasmcurves/src/utils.js"(exports) {
      exports.bigInt2BytesLE = function bigInt2BytesLE(_a, len) {
        const b = Array(len);
        let v = BigInt(_a);
        for (let i = 0; i < len; i++) {
          b[i] = Number(v & 0xFFn);
          v = v >> 8n;
        }
        return b;
      };
      exports.bigInt2U32LE = function bigInt2BytesLE(_a, len) {
        const b = Array(len);
        let v = BigInt(_a);
        for (let i = 0; i < len; i++) {
          b[i] = Number(v & 0xFFFFFFFFn);
          v = v >> 32n;
        }
        return b;
      };
      exports.isOcamNum = function(a) {
        if (!Array.isArray(a))
          return false;
        if (a.length != 3)
          return false;
        if (typeof a[0] !== "number")
          return false;
        if (typeof a[1] !== "number")
          return false;
        if (!Array.isArray(a[2]))
          return false;
        return true;
      };
    }
  });

  // node_modules/wasmcurves/src/build_int.js
  var require_build_int = __commonJS({
    "node_modules/wasmcurves/src/build_int.js"(exports, module) {
      module.exports = function buildInt(module2, n64, _prefix) {
        const prefix = _prefix || "int";
        if (module2.modules[prefix])
          return prefix;
        module2.modules[prefix] = {};
        const n32 = n64 * 2;
        const n8 = n64 * 8;
        function buildCopy() {
          const f = module2.addFunction(prefix + "_copy");
          f.addParam("px", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < n64; i++) {
            f.addCode(
              c.i64_store(
                c.getLocal("pr"),
                i * 8,
                c.i64_load(
                  c.getLocal("px"),
                  i * 8
                )
              )
            );
          }
        }
        function buildZero() {
          const f = module2.addFunction(prefix + "_zero");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < n64; i++) {
            f.addCode(
              c.i64_store(
                c.getLocal("pr"),
                i * 8,
                c.i64_const(0)
              )
            );
          }
        }
        function buildOne() {
          const f = module2.addFunction(prefix + "_one");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.i64_store(
              c.getLocal("pr"),
              0,
              c.i64_const(1)
            )
          );
          for (let i = 1; i < n64; i++) {
            f.addCode(
              c.i64_store(
                c.getLocal("pr"),
                i * 8,
                c.i64_const(0)
              )
            );
          }
        }
        function buildIsZero() {
          const f = module2.addFunction(prefix + "_isZero");
          f.addParam("px", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          function getCompCode(n) {
            if (n == 0) {
              return c.ret(c.i64_eqz(
                c.i64_load(c.getLocal("px"))
              ));
            }
            return c.if(
              c.i64_eqz(
                c.i64_load(c.getLocal("px"), n * 8)
              ),
              getCompCode(n - 1),
              c.ret(c.i32_const(0))
            );
          }
          f.addCode(getCompCode(n64 - 1));
          f.addCode(c.ret(c.i32_const(0)));
        }
        function buildEq() {
          const f = module2.addFunction(prefix + "_eq");
          f.addParam("px", "i32");
          f.addParam("py", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          function getCompCode(n) {
            if (n == 0) {
              return c.ret(c.i64_eq(
                c.i64_load(c.getLocal("px")),
                c.i64_load(c.getLocal("py"))
              ));
            }
            return c.if(
              c.i64_eq(
                c.i64_load(c.getLocal("px"), n * 8),
                c.i64_load(c.getLocal("py"), n * 8)
              ),
              getCompCode(n - 1),
              c.ret(c.i32_const(0))
            );
          }
          f.addCode(getCompCode(n64 - 1));
          f.addCode(c.ret(c.i32_const(0)));
        }
        function buildGte() {
          const f = module2.addFunction(prefix + "_gte");
          f.addParam("px", "i32");
          f.addParam("py", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          function getCompCode(n) {
            if (n == 0) {
              return c.ret(c.i64_ge_u(
                c.i64_load(c.getLocal("px")),
                c.i64_load(c.getLocal("py"))
              ));
            }
            return c.if(
              c.i64_lt_u(
                c.i64_load(c.getLocal("px"), n * 8),
                c.i64_load(c.getLocal("py"), n * 8)
              ),
              c.ret(c.i32_const(0)),
              c.if(
                c.i64_gt_u(
                  c.i64_load(c.getLocal("px"), n * 8),
                  c.i64_load(c.getLocal("py"), n * 8)
                ),
                c.ret(c.i32_const(1)),
                getCompCode(n - 1)
              )
            );
          }
          f.addCode(getCompCode(n64 - 1));
          f.addCode(c.ret(c.i32_const(0)));
        }
        function buildAdd() {
          const f = module2.addFunction(prefix + "_add");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          f.setReturnType("i32");
          f.addLocal("c", "i64");
          const c = f.getCodeBuilder();
          f.addCode(c.setLocal(
            "c",
            c.i64_add(
              c.i64_load32_u(c.getLocal("x")),
              c.i64_load32_u(c.getLocal("y"))
            )
          ));
          f.addCode(c.i64_store32(
            c.getLocal("r"),
            c.getLocal("c")
          ));
          for (let i = 1; i < n32; i++) {
            f.addCode(c.setLocal(
              "c",
              c.i64_add(
                c.i64_add(
                  c.i64_load32_u(c.getLocal("x"), 4 * i),
                  c.i64_load32_u(c.getLocal("y"), 4 * i)
                ),
                c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
              )
            ));
            f.addCode(c.i64_store32(
              c.getLocal("r"),
              i * 4,
              c.getLocal("c")
            ));
          }
          f.addCode(c.i32_wrap_i64(c.i64_shr_u(c.getLocal("c"), c.i64_const(32))));
        }
        function buildSub() {
          const f = module2.addFunction(prefix + "_sub");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          f.setReturnType("i32");
          f.addLocal("c", "i64");
          const c = f.getCodeBuilder();
          f.addCode(c.setLocal(
            "c",
            c.i64_sub(
              c.i64_load32_u(c.getLocal("x")),
              c.i64_load32_u(c.getLocal("y"))
            )
          ));
          f.addCode(c.i64_store32(
            c.getLocal("r"),
            c.i64_and(
              c.getLocal("c"),
              c.i64_const("0xFFFFFFFF")
            )
          ));
          for (let i = 1; i < n32; i++) {
            f.addCode(c.setLocal(
              "c",
              c.i64_add(
                c.i64_sub(
                  c.i64_load32_u(c.getLocal("x"), 4 * i),
                  c.i64_load32_u(c.getLocal("y"), 4 * i)
                ),
                c.i64_shr_s(c.getLocal("c"), c.i64_const(32))
              )
            ));
            f.addCode(c.i64_store32(
              c.getLocal("r"),
              i * 4,
              c.i64_and(c.getLocal("c"), c.i64_const("0xFFFFFFFF"))
            ));
          }
          f.addCode(c.i32_wrap_i64(c.i64_shr_s(c.getLocal("c"), c.i64_const(32))));
        }
        function buildMul() {
          const f = module2.addFunction(prefix + "_mul");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          f.addLocal("c0", "i64");
          f.addLocal("c1", "i64");
          for (let i = 0; i < n32; i++) {
            f.addLocal("x" + i, "i64");
            f.addLocal("y" + i, "i64");
          }
          const c = f.getCodeBuilder();
          const loadX = [];
          const loadY = [];
          function mulij(i, j) {
            let X, Y;
            if (!loadX[i]) {
              X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
              loadX[i] = true;
            } else {
              X = c.getLocal("x" + i);
            }
            if (!loadY[j]) {
              Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
              loadY[j] = true;
            } else {
              Y = c.getLocal("y" + j);
            }
            return c.i64_mul(X, Y);
          }
          let c0 = "c0";
          let c1 = "c1";
          for (let k = 0; k < n32 * 2 - 1; k++) {
            for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            f.addCode(
              c.i64_store32(
                c.getLocal("r"),
                k * 4,
                c.getLocal(c0)
              )
            );
            [c0, c1] = [c1, c0];
            f.addCode(
              c.setLocal(
                c1,
                c.i64_shr_u(
                  c.getLocal(c0),
                  c.i64_const(32)
                )
              )
            );
          }
          f.addCode(
            c.i64_store32(
              c.getLocal("r"),
              n32 * 4 * 2 - 4,
              c.getLocal(c0)
            )
          );
        }
        function buildSquare() {
          const f = module2.addFunction(prefix + "_square");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          f.addLocal("c0", "i64");
          f.addLocal("c1", "i64");
          f.addLocal("c0_old", "i64");
          f.addLocal("c1_old", "i64");
          for (let i = 0; i < n32; i++) {
            f.addLocal("x" + i, "i64");
          }
          const c = f.getCodeBuilder();
          const loadX = [];
          function mulij(i, j) {
            let X, Y;
            if (!loadX[i]) {
              X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
              loadX[i] = true;
            } else {
              X = c.getLocal("x" + i);
            }
            if (!loadX[j]) {
              Y = c.teeLocal("x" + j, c.i64_load32_u(c.getLocal("x"), j * 4));
              loadX[j] = true;
            } else {
              Y = c.getLocal("x" + j);
            }
            return c.i64_mul(X, Y);
          }
          let c0 = "c0";
          let c1 = "c1";
          let c0_old = "c0_old";
          let c1_old = "c1_old";
          for (let k = 0; k < n32 * 2 - 1; k++) {
            f.addCode(
              c.setLocal(c0, c.i64_const(0)),
              c.setLocal(c1, c.i64_const(0))
            );
            for (let i = Math.max(0, k - n32 + 1); i < k + 1 >> 1 && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            f.addCode(
              c.setLocal(
                c0,
                c.i64_shl(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  c.i64_const(1)
                )
              )
            );
            f.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.i64_shl(
                    c.getLocal(c1),
                    c.i64_const(1)
                  ),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
            if (k % 2 == 0) {
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(k >> 1, k >> 1)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k > 0) {
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    c.i64_and(
                      c.getLocal(c0_old),
                      c.i64_const(4294967295)
                    )
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.i64_add(
                      c.getLocal(c1),
                      c.i64_shr_u(
                        c.getLocal(c0),
                        c.i64_const(32)
                      )
                    ),
                    c.getLocal(c1_old)
                  )
                )
              );
            }
            f.addCode(
              c.i64_store32(
                c.getLocal("r"),
                k * 4,
                c.getLocal(c0)
              )
            );
            f.addCode(
              c.setLocal(
                c0_old,
                c.getLocal(c1)
              ),
              c.setLocal(
                c1_old,
                c.i64_shr_u(
                  c.getLocal(c0_old),
                  c.i64_const(32)
                )
              )
            );
          }
          f.addCode(
            c.i64_store32(
              c.getLocal("r"),
              n32 * 4 * 2 - 4,
              c.getLocal(c0_old)
            )
          );
        }
        function buildSquareOld() {
          const f = module2.addFunction(prefix + "_squareOld");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
        }
        function _buildMul1() {
          const f = module2.addFunction(prefix + "__mul1");
          f.addParam("px", "i32");
          f.addParam("y", "i64");
          f.addParam("pr", "i32");
          f.addLocal("c", "i64");
          const c = f.getCodeBuilder();
          f.addCode(c.setLocal(
            "c",
            c.i64_mul(
              c.i64_load32_u(c.getLocal("px"), 0, 0),
              c.getLocal("y")
            )
          ));
          f.addCode(c.i64_store32(
            c.getLocal("pr"),
            0,
            0,
            c.getLocal("c")
          ));
          for (let i = 1; i < n32; i++) {
            f.addCode(c.setLocal(
              "c",
              c.i64_add(
                c.i64_mul(
                  c.i64_load32_u(c.getLocal("px"), 4 * i, 0),
                  c.getLocal("y")
                ),
                c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
              )
            ));
            f.addCode(c.i64_store32(
              c.getLocal("pr"),
              i * 4,
              0,
              c.getLocal("c")
            ));
          }
        }
        function _buildAdd1() {
          const f = module2.addFunction(prefix + "__add1");
          f.addParam("x", "i32");
          f.addParam("y", "i64");
          f.addLocal("c", "i64");
          f.addLocal("px", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.setLocal("px", c.getLocal("x")));
          f.addCode(c.setLocal(
            "c",
            c.i64_add(
              c.i64_load32_u(c.getLocal("px"), 0, 0),
              c.getLocal("y")
            )
          ));
          f.addCode(c.i64_store32(
            c.getLocal("px"),
            0,
            0,
            c.getLocal("c")
          ));
          f.addCode(c.setLocal(
            "c",
            c.i64_shr_u(
              c.getLocal("c"),
              c.i64_const(32)
            )
          ));
          f.addCode(c.block(c.loop(
            c.br_if(
              1,
              c.i64_eqz(c.getLocal("c"))
            ),
            c.setLocal(
              "px",
              c.i32_add(
                c.getLocal("px"),
                c.i32_const(4)
              )
            ),
            c.setLocal(
              "c",
              c.i64_add(
                c.i64_load32_u(c.getLocal("px"), 0, 0),
                c.getLocal("c")
              )
            ),
            c.i64_store32(
              c.getLocal("px"),
              0,
              0,
              c.getLocal("c")
            ),
            c.setLocal(
              "c",
              c.i64_shr_u(
                c.getLocal("c"),
                c.i64_const(32)
              )
            ),
            c.br(0)
          )));
        }
        function buildDiv() {
          _buildMul1();
          _buildAdd1();
          const f = module2.addFunction(prefix + "_div");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("c", "i32");
          f.addParam("r", "i32");
          f.addLocal("rr", "i32");
          f.addLocal("cc", "i32");
          f.addLocal("eX", "i32");
          f.addLocal("eY", "i32");
          f.addLocal("sy", "i64");
          f.addLocal("sx", "i64");
          f.addLocal("ec", "i32");
          const c = f.getCodeBuilder();
          const Y = c.i32_const(module2.alloc(n8));
          const Caux = c.i32_const(module2.alloc(n8));
          const Raux = c.i32_const(module2.alloc(n8));
          const C = c.getLocal("cc");
          const R = c.getLocal("rr");
          const pr1 = module2.alloc(n8 * 2);
          const R1 = c.i32_const(pr1);
          const R2 = c.i32_const(pr1 + n8);
          f.addCode(c.if(
            c.getLocal("c"),
            c.setLocal("cc", c.getLocal("c")),
            c.setLocal("cc", Caux)
          ));
          f.addCode(c.if(
            c.getLocal("r"),
            c.setLocal("rr", c.getLocal("r")),
            c.setLocal("rr", Raux)
          ));
          f.addCode(c.call(prefix + "_copy", c.getLocal("x"), R));
          f.addCode(c.call(prefix + "_copy", c.getLocal("y"), Y));
          f.addCode(c.call(prefix + "_zero", C));
          f.addCode(c.call(prefix + "_zero", R1));
          f.addCode(c.setLocal("eX", c.i32_const(n8 - 1)));
          f.addCode(c.setLocal("eY", c.i32_const(n8 - 1)));
          f.addCode(c.block(c.loop(
            c.br_if(
              1,
              c.i32_or(
                c.i32_load8_u(
                  c.i32_add(Y, c.getLocal("eY")),
                  0,
                  0
                ),
                c.i32_eq(
                  c.getLocal("eY"),
                  c.i32_const(3)
                )
              )
            ),
            c.setLocal("eY", c.i32_sub(c.getLocal("eY"), c.i32_const(1))),
            c.br(0)
          )));
          f.addCode(
            c.setLocal(
              "sy",
              c.i64_add(
                c.i64_load32_u(
                  c.i32_sub(
                    c.i32_add(Y, c.getLocal("eY")),
                    c.i32_const(3)
                  ),
                  0,
                  0
                ),
                c.i64_const(1)
              )
            )
          );
          f.addCode(
            c.if(
              c.i64_eq(
                c.getLocal("sy"),
                c.i64_const(1)
              ),
              c.drop(c.i64_div_u(c.i64_const(0), c.i64_const(0)))
            )
          );
          f.addCode(c.block(c.loop(
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_or(
                  c.i32_load8_u(
                    c.i32_add(R, c.getLocal("eX")),
                    0,
                    0
                  ),
                  c.i32_eq(
                    c.getLocal("eX"),
                    c.i32_const(7)
                  )
                )
              ),
              c.setLocal("eX", c.i32_sub(c.getLocal("eX"), c.i32_const(1))),
              c.br(0)
            )),
            c.setLocal(
              "sx",
              c.i64_load(
                c.i32_sub(
                  c.i32_add(R, c.getLocal("eX")),
                  c.i32_const(7)
                ),
                0,
                0
              )
            ),
            c.setLocal(
              "sx",
              c.i64_div_u(
                c.getLocal("sx"),
                c.getLocal("sy")
              )
            ),
            c.setLocal(
              "ec",
              c.i32_sub(
                c.i32_sub(
                  c.getLocal("eX"),
                  c.getLocal("eY")
                ),
                c.i32_const(4)
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_and(
                  c.i64_eqz(
                    c.i64_and(
                      c.getLocal("sx"),
                      c.i64_const("0xFFFFFFFF00000000")
                    )
                  ),
                  c.i32_ge_s(
                    c.getLocal("ec"),
                    c.i32_const(0)
                  )
                )
              ),
              c.setLocal(
                "sx",
                c.i64_shr_u(
                  c.getLocal("sx"),
                  c.i64_const(8)
                )
              ),
              c.setLocal(
                "ec",
                c.i32_add(
                  c.getLocal("ec"),
                  c.i32_const(1)
                )
              ),
              c.br(0)
            )),
            c.if(
              c.i64_eqz(c.getLocal("sx")),
              [
                ...c.br_if(
                  2,
                  c.i32_eqz(c.call(prefix + "_gte", R, Y))
                ),
                ...c.setLocal("sx", c.i64_const(1)),
                ...c.setLocal("ec", c.i32_const(0))
              ]
            ),
            c.call(prefix + "__mul1", Y, c.getLocal("sx"), R2),
            c.drop(c.call(
              prefix + "_sub",
              R,
              c.i32_sub(R2, c.getLocal("ec")),
              R
            )),
            c.call(
              prefix + "__add1",
              c.i32_add(C, c.getLocal("ec")),
              c.getLocal("sx")
            ),
            c.br(0)
          )));
        }
        function buildInverseMod() {
          const f = module2.addFunction(prefix + "_inverseMod");
          f.addParam("px", "i32");
          f.addParam("pm", "i32");
          f.addParam("pr", "i32");
          f.addLocal("t", "i32");
          f.addLocal("newt", "i32");
          f.addLocal("r", "i32");
          f.addLocal("qq", "i32");
          f.addLocal("qr", "i32");
          f.addLocal("newr", "i32");
          f.addLocal("swp", "i32");
          f.addLocal("x", "i32");
          f.addLocal("signt", "i32");
          f.addLocal("signnewt", "i32");
          f.addLocal("signx", "i32");
          const c = f.getCodeBuilder();
          const aux1 = c.i32_const(module2.alloc(n8));
          const aux2 = c.i32_const(module2.alloc(n8));
          const aux3 = c.i32_const(module2.alloc(n8));
          const aux4 = c.i32_const(module2.alloc(n8));
          const aux5 = c.i32_const(module2.alloc(n8));
          const aux6 = c.i32_const(module2.alloc(n8));
          const mulBuff = c.i32_const(module2.alloc(n8 * 2));
          const aux7 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.setLocal("t", aux1),
            c.call(prefix + "_zero", aux1),
            c.setLocal("signt", c.i32_const(0))
          );
          f.addCode(
            c.setLocal("r", aux2),
            c.call(prefix + "_copy", c.getLocal("pm"), aux2)
          );
          f.addCode(
            c.setLocal("newt", aux3),
            c.call(prefix + "_one", aux3),
            c.setLocal("signnewt", c.i32_const(0))
          );
          f.addCode(
            c.setLocal("newr", aux4),
            c.call(prefix + "_copy", c.getLocal("px"), aux4)
          );
          f.addCode(c.setLocal("qq", aux5));
          f.addCode(c.setLocal("qr", aux6));
          f.addCode(c.setLocal("x", aux7));
          f.addCode(c.block(c.loop(
            c.br_if(
              1,
              c.call(prefix + "_isZero", c.getLocal("newr"))
            ),
            c.call(prefix + "_div", c.getLocal("r"), c.getLocal("newr"), c.getLocal("qq"), c.getLocal("qr")),
            c.call(prefix + "_mul", c.getLocal("qq"), c.getLocal("newt"), mulBuff),
            c.if(
              c.getLocal("signt"),
              c.if(
                c.getLocal("signnewt"),
                c.if(
                  c.call(prefix + "_gte", mulBuff, c.getLocal("t")),
                  [
                    ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                    ...c.setLocal("signx", c.i32_const(0))
                  ],
                  [
                    ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
                    ...c.setLocal("signx", c.i32_const(1))
                  ]
                ),
                [
                  ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(1))
                ]
              ),
              c.if(
                c.getLocal("signnewt"),
                [
                  ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(0))
                ],
                c.if(
                  c.call(prefix + "_gte", c.getLocal("t"), mulBuff),
                  [
                    ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
                    ...c.setLocal("signx", c.i32_const(0))
                  ],
                  [
                    ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                    ...c.setLocal("signx", c.i32_const(1))
                  ]
                )
              )
            ),
            c.setLocal("swp", c.getLocal("t")),
            c.setLocal("t", c.getLocal("newt")),
            c.setLocal("newt", c.getLocal("x")),
            c.setLocal("x", c.getLocal("swp")),
            c.setLocal("signt", c.getLocal("signnewt")),
            c.setLocal("signnewt", c.getLocal("signx")),
            c.setLocal("swp", c.getLocal("r")),
            c.setLocal("r", c.getLocal("newr")),
            c.setLocal("newr", c.getLocal("qr")),
            c.setLocal("qr", c.getLocal("swp")),
            c.br(0)
          )));
          f.addCode(c.if(
            c.getLocal("signt"),
            c.drop(c.call(prefix + "_sub", c.getLocal("pm"), c.getLocal("t"), c.getLocal("pr"))),
            c.call(prefix + "_copy", c.getLocal("t"), c.getLocal("pr"))
          ));
        }
        buildCopy();
        buildZero();
        buildIsZero();
        buildOne();
        buildEq();
        buildGte();
        buildAdd();
        buildSub();
        buildMul();
        buildSquare();
        buildSquareOld();
        buildDiv();
        buildInverseMod();
        module2.exportFunction(prefix + "_copy");
        module2.exportFunction(prefix + "_zero");
        module2.exportFunction(prefix + "_one");
        module2.exportFunction(prefix + "_isZero");
        module2.exportFunction(prefix + "_eq");
        module2.exportFunction(prefix + "_gte");
        module2.exportFunction(prefix + "_add");
        module2.exportFunction(prefix + "_sub");
        module2.exportFunction(prefix + "_mul");
        module2.exportFunction(prefix + "_square");
        module2.exportFunction(prefix + "_squareOld");
        module2.exportFunction(prefix + "_div");
        module2.exportFunction(prefix + "_inverseMod");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_timesscalar.js
  var require_build_timesscalar = __commonJS({
    "node_modules/wasmcurves/src/build_timesscalar.js"(exports, module) {
      module.exports = function buildTimesScalar(module2, fnName, elementLen, opAB, opAA, opCopy, opInit) {
        const f = module2.addFunction(fnName);
        f.addParam("base", "i32");
        f.addParam("scalar", "i32");
        f.addParam("scalarLength", "i32");
        f.addParam("r", "i32");
        f.addLocal("i", "i32");
        f.addLocal("b", "i32");
        const c = f.getCodeBuilder();
        const aux = c.i32_const(module2.alloc(elementLen));
        f.addCode(
          c.if(
            c.i32_eqz(c.getLocal("scalarLength")),
            [
              ...c.call(opInit, c.getLocal("r")),
              ...c.ret([])
            ]
          )
        );
        f.addCode(c.call(opCopy, c.getLocal("base"), aux));
        f.addCode(c.call(opInit, c.getLocal("r")));
        f.addCode(c.setLocal("i", c.getLocal("scalarLength")));
        f.addCode(c.block(c.loop(
          c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
          c.setLocal(
            "b",
            c.i32_load8_u(
              c.i32_add(
                c.getLocal("scalar"),
                c.getLocal("i")
              )
            )
          ),
          ...innerLoop(),
          c.br_if(1, c.i32_eqz(c.getLocal("i"))),
          c.br(0)
        )));
        function innerLoop() {
          const code = [];
          for (let i = 0; i < 8; i++) {
            code.push(
              ...c.call(opAA, c.getLocal("r"), c.getLocal("r")),
              ...c.if(
                c.i32_ge_u(c.getLocal("b"), c.i32_const(128 >> i)),
                [
                  ...c.setLocal(
                    "b",
                    c.i32_sub(
                      c.getLocal("b"),
                      c.i32_const(128 >> i)
                    )
                  ),
                  ...c.call(opAB, c.getLocal("r"), aux, c.getLocal("r"))
                ]
              )
            );
          }
          return code;
        }
      };
    }
  });

  // node_modules/wasmcurves/src/build_batchinverse.js
  var require_build_batchinverse = __commonJS({
    "node_modules/wasmcurves/src/build_batchinverse.js"(exports, module) {
      module.exports = buildBatchInverse;
      function buildBatchInverse(module2, prefix) {
        const n8 = module2.modules[prefix].n64 * 8;
        const f = module2.addFunction(prefix + "_batchInverse");
        f.addParam("pIn", "i32");
        f.addParam("inStep", "i32");
        f.addParam("n", "i32");
        f.addParam("pOut", "i32");
        f.addParam("outStep", "i32");
        f.addLocal("itAux", "i32");
        f.addLocal("itIn", "i32");
        f.addLocal("itOut", "i32");
        f.addLocal("i", "i32");
        const c = f.getCodeBuilder();
        const AUX = c.i32_const(module2.alloc(n8));
        f.addCode(
          c.setLocal("itAux", c.i32_load(c.i32_const(0))),
          c.i32_store(
            c.i32_const(0),
            c.i32_add(
              c.getLocal("itAux"),
              c.i32_mul(
                c.i32_add(
                  c.getLocal("n"),
                  c.i32_const(1)
                ),
                c.i32_const(n8)
              )
            )
          )
        );
        f.addCode(
          c.call(prefix + "_one", c.getLocal("itAux")),
          c.setLocal("itIn", c.getLocal("pIn")),
          c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
          c.setLocal("i", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
            c.if(
              c.call(prefix + "_isZero", c.getLocal("itIn")),
              c.call(
                prefix + "_copy",
                c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)),
                c.getLocal("itAux")
              ),
              c.call(
                prefix + "_mul",
                c.getLocal("itIn"),
                c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)),
                c.getLocal("itAux")
              )
            ),
            c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.getLocal("inStep"))),
            c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )),
          c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.getLocal("inStep"))),
          c.setLocal("itAux", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))),
          c.setLocal(
            "itOut",
            c.i32_add(
              c.getLocal("pOut"),
              c.i32_mul(
                c.i32_sub(c.getLocal("n"), c.i32_const(1)),
                c.getLocal("outStep")
              )
            )
          ),
          c.call(prefix + "_inverse", c.getLocal("itAux"), c.getLocal("itAux")),
          c.block(c.loop(
            c.br_if(1, c.i32_eqz(c.getLocal("i"))),
            c.if(
              c.call(prefix + "_isZero", c.getLocal("itIn")),
              [
                ...c.call(
                  prefix + "_copy",
                  c.getLocal("itAux"),
                  c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))
                ),
                ...c.call(
                  prefix + "_zero",
                  c.getLocal("itOut")
                )
              ],
              [
                ...c.call(prefix + "_copy", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)), AUX),
                ...c.call(
                  prefix + "_mul",
                  c.getLocal("itAux"),
                  c.getLocal("itIn"),
                  c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))
                ),
                ...c.call(
                  prefix + "_mul",
                  c.getLocal("itAux"),
                  AUX,
                  c.getLocal("itOut")
                )
              ]
            ),
            c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.getLocal("inStep"))),
            c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.getLocal("outStep"))),
            c.setLocal("itAux", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))),
            c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          ))
        );
        f.addCode(
          c.i32_store(
            c.i32_const(0),
            c.getLocal("itAux")
          )
        );
      }
    }
  });

  // node_modules/wasmcurves/src/build_batchconvertion.js
  var require_build_batchconvertion = __commonJS({
    "node_modules/wasmcurves/src/build_batchconvertion.js"(exports, module) {
      module.exports = buildBatchConvertion;
      function buildBatchConvertion(module2, fnName, internalFnName, sizeIn, sizeOut, reverse) {
        if (typeof reverse === "undefined") {
          if (sizeIn < sizeOut) {
            reverse = true;
          } else {
            reverse = false;
          }
        }
        const f = module2.addFunction(fnName);
        f.addParam("pIn", "i32");
        f.addParam("n", "i32");
        f.addParam("pOut", "i32");
        f.addLocal("i", "i32");
        f.addLocal("itIn", "i32");
        f.addLocal("itOut", "i32");
        const c = f.getCodeBuilder();
        if (reverse) {
          f.addCode(
            c.setLocal(
              "itIn",
              c.i32_add(
                c.getLocal("pIn"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.i32_const(1)
                  ),
                  c.i32_const(sizeIn)
                )
              )
            ),
            c.setLocal(
              "itOut",
              c.i32_add(
                c.getLocal("pOut"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.i32_const(1)
                  ),
                  c.i32_const(sizeOut)
                )
              )
            ),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
              c.call(internalFnName, c.getLocal("itIn"), c.getLocal("itOut")),
              c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.i32_const(sizeIn))),
              c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(sizeOut))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        } else {
          f.addCode(
            c.setLocal("itIn", c.getLocal("pIn")),
            c.setLocal("itOut", c.getLocal("pOut")),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
              c.call(internalFnName, c.getLocal("itIn"), c.getLocal("itOut")),
              c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(sizeIn))),
              c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(sizeOut))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
      }
    }
  });

  // node_modules/wasmcurves/src/build_batchop.js
  var require_build_batchop = __commonJS({
    "node_modules/wasmcurves/src/build_batchop.js"(exports, module) {
      module.exports = buildBatchConvertion;
      function buildBatchConvertion(module2, fnName, internalFnName, sizeIn, sizeOut, reverse) {
        if (typeof reverse === "undefined") {
          if (sizeIn < sizeOut) {
            reverse = true;
          } else {
            reverse = false;
          }
        }
        const f = module2.addFunction(fnName);
        f.addParam("pIn1", "i32");
        f.addParam("pIn2", "i32");
        f.addParam("n", "i32");
        f.addParam("pOut", "i32");
        f.addLocal("i", "i32");
        f.addLocal("itIn1", "i32");
        f.addLocal("itIn2", "i32");
        f.addLocal("itOut", "i32");
        const c = f.getCodeBuilder();
        if (reverse) {
          f.addCode(
            c.setLocal(
              "itIn1",
              c.i32_add(
                c.getLocal("pIn1"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.i32_const(1)
                  ),
                  c.i32_const(sizeIn)
                )
              )
            ),
            c.setLocal(
              "itIn2",
              c.i32_add(
                c.getLocal("pIn2"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.i32_const(1)
                  ),
                  c.i32_const(sizeIn)
                )
              )
            ),
            c.setLocal(
              "itOut",
              c.i32_add(
                c.getLocal("pOut"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.i32_const(1)
                  ),
                  c.i32_const(sizeOut)
                )
              )
            ),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
              c.call(internalFnName, c.getLocal("itIn1"), c.getLocal("itIn2"), c.getLocal("itOut")),
              c.setLocal("itIn1", c.i32_sub(c.getLocal("itIn1"), c.i32_const(sizeIn))),
              c.setLocal("itIn2", c.i32_sub(c.getLocal("itIn2"), c.i32_const(sizeIn))),
              c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(sizeOut))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        } else {
          f.addCode(
            c.setLocal("itIn1", c.getLocal("pIn1")),
            c.setLocal("itIn2", c.getLocal("pIn2")),
            c.setLocal("itOut", c.getLocal("pOut")),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
              c.call(internalFnName, c.getLocal("itIn1"), c.getLocal("itIn2"), c.getLocal("itOut")),
              c.setLocal("itIn1", c.i32_add(c.getLocal("itIn1"), c.i32_const(sizeIn))),
              c.setLocal("itIn2", c.i32_add(c.getLocal("itIn2"), c.i32_const(sizeIn))),
              c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(sizeOut))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
      }
    }
  });

  // node_modules/wasmcurves/src/bigint.js
  var require_bigint = __commonJS({
    "node_modules/wasmcurves/src/bigint.js"(exports, module) {
      function compare(a, b) {
        return a === b ? 0 : a > b ? 1 : -1;
      }
      function square2(n) {
        return n * n;
      }
      function isOdd2(n) {
        return n % 2n !== 0n;
      }
      function isEven(n) {
        return n % 2n === 0n;
      }
      function isNegative3(n) {
        return n < 0n;
      }
      function isPositive(n) {
        return n > 0n;
      }
      function bitLength3(n) {
        if (isNegative3(n)) {
          return n.toString(2).length - 1;
        } else {
          return n.toString(2).length;
        }
      }
      function abs2(n) {
        return n < 0n ? -n : n;
      }
      function isUnit(n) {
        return abs2(n) === 1n;
      }
      function modInv(a, n) {
        var t = 0n, newT = 1n, r = n, newR = abs2(a), q, lastT, lastR;
        while (newR !== 0n) {
          q = r / newR;
          lastT = t;
          lastR = r;
          t = newT;
          r = newR;
          newT = lastT - q * newT;
          newR = lastR - q * newR;
        }
        if (!isUnit(r))
          throw new Error(a.toString() + " and " + n.toString() + " are not co-prime");
        if (compare(t, 0n) === -1) {
          t = t + n;
        }
        if (isNegative3(a)) {
          return -t;
        }
        return t;
      }
      function modPow(n, exp3, mod2) {
        if (mod2 === 0n)
          throw new Error("Cannot take modPow with modulus 0");
        var r = 1n, base = n % mod2;
        if (isNegative3(exp3)) {
          exp3 = exp3 * -1n;
          base = modInv(base, mod2);
        }
        while (isPositive(exp3)) {
          if (base === 0n)
            return 0n;
          if (isOdd2(exp3))
            r = r * base % mod2;
          exp3 = exp3 / 2n;
          base = square2(base) % mod2;
        }
        return r;
      }
      function compareAbs(a, b) {
        a = a >= 0n ? a : -a;
        b = b >= 0n ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
      }
      function isDivisibleBy(a, n) {
        if (n === 0n)
          return false;
        if (isUnit(n))
          return true;
        if (compareAbs(n, 2n) === 0)
          return isEven(a);
        return a % n === 0n;
      }
      function isBasicPrime(v) {
        var n = abs2(v);
        if (isUnit(n))
          return false;
        if (n === 2n || n === 3n || n === 5n)
          return true;
        if (isEven(n) || isDivisibleBy(n, 3n) || isDivisibleBy(n, 5n))
          return false;
        if (n < 49n)
          return true;
      }
      function prev(n) {
        return n - 1n;
      }
      function millerRabinTest(n, a) {
        var nPrev = prev(n), b = nPrev, r = 0, d, i, x;
        while (isEven(b))
          b = b / 2n, r++;
        next:
          for (i = 0; i < a.length; i++) {
            if (n < a[i])
              continue;
            x = modPow(BigInt(a[i]), b, n);
            if (isUnit(x) || x === nPrev)
              continue;
            for (d = r - 1; d != 0; d--) {
              x = square2(x) % n;
              if (isUnit(x))
                return false;
              if (x === nPrev)
                continue next;
            }
            return false;
          }
        return true;
      }
      function isPrime(p) {
        var isPrime2 = isBasicPrime(p);
        if (isPrime2 !== void 0)
          return isPrime2;
        var n = abs2(p);
        var bits2 = bitLength3(n);
        if (bits2 <= 64)
          return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * Number(bits2);
        var t = Math.ceil(logN);
        for (var a = [], i = 0; i < t; i++) {
          a.push(BigInt(i + 2));
        }
        return millerRabinTest(n, a);
      }
      module.exports.bitLength = bitLength3;
      module.exports.isOdd = isOdd2;
      module.exports.isNegative = isNegative3;
      module.exports.abs = abs2;
      module.exports.isUnit = isUnit;
      module.exports.compare = compare;
      module.exports.modInv = modInv;
      module.exports.modPow = modPow;
      module.exports.isPrime = isPrime;
      module.exports.square = square2;
    }
  });

  // node_modules/wasmcurves/src/build_f1m.js
  var require_build_f1m = __commonJS({
    "node_modules/wasmcurves/src/build_f1m.js"(exports, module) {
      var buildInt = require_build_int();
      var utils = require_utils();
      var buildExp = require_build_timesscalar();
      var buildBatchInverse = require_build_batchinverse();
      var buildBatchConvertion = require_build_batchconvertion();
      var buildBatchOp = require_build_batchop();
      var { bitLength: bitLength3, modInv, modPow, isPrime, isOdd: isOdd2, square: square2 } = require_bigint();
      module.exports = function buildF1m(module2, _q, _prefix, _intPrefix) {
        const q = BigInt(_q);
        const n64 = Math.floor((bitLength3(q - 1n) - 1) / 64) + 1;
        const n32 = n64 * 2;
        const n8 = n64 * 8;
        const prefix = _prefix || "f1m";
        if (module2.modules[prefix])
          return prefix;
        const intPrefix = buildInt(module2, n64, _intPrefix);
        const pq = module2.alloc(n8, utils.bigInt2BytesLE(q, n8));
        const pR2 = module2.alloc(utils.bigInt2BytesLE(square2(1n << BigInt(n64 * 64)) % q, n8));
        const pOne = module2.alloc(utils.bigInt2BytesLE((1n << BigInt(n64 * 64)) % q, n8));
        const pZero = module2.alloc(utils.bigInt2BytesLE(0n, n8));
        const _minusOne = q - 1n;
        const _e = _minusOne >> 1n;
        const pe = module2.alloc(n8, utils.bigInt2BytesLE(_e, n8));
        const _ePlusOne = _e + 1n;
        const pePlusOne = module2.alloc(n8, utils.bigInt2BytesLE(_ePlusOne, n8));
        module2.modules[prefix] = {
          pq,
          pR2,
          n64,
          q,
          pOne,
          pZero,
          pePlusOne
        };
        function buildOne() {
          const f = module2.addFunction(prefix + "_one");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(intPrefix + "_copy", c.i32_const(pOne), c.getLocal("pr")));
        }
        function buildAdd() {
          const f = module2.addFunction(prefix + "_add");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.if(
              c.call(intPrefix + "_add", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
              c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
              c.if(
                c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
                c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
              )
            )
          );
        }
        function buildSub() {
          const f = module2.addFunction(prefix + "_sub");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.if(
              c.call(intPrefix + "_sub", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
              c.drop(c.call(intPrefix + "_add", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
            )
          );
        }
        function buildNeg() {
          const f = module2.addFunction(prefix + "_neg");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(prefix + "_sub", c.i32_const(pZero), c.getLocal("x"), c.getLocal("r"))
          );
        }
        function buildIsNegative() {
          const f = module2.addFunction(prefix + "_isNegative");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.call(prefix + "_fromMontgomery", c.getLocal("x"), AUX),
            c.call(intPrefix + "_gte", AUX, c.i32_const(pePlusOne))
          );
        }
        function buildSign() {
          const f = module2.addFunction(prefix + "_sign");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(intPrefix + "_isZero", c.getLocal("x")),
              c.ret(c.i32_const(0))
            ),
            c.call(prefix + "_fromMontgomery", c.getLocal("x"), AUX),
            c.if(
              c.call(intPrefix + "_gte", AUX, c.i32_const(pePlusOne)),
              c.ret(c.i32_const(-1))
            ),
            c.ret(c.i32_const(1))
          );
        }
        function buildMReduct() {
          const carries = module2.alloc(n32 * n32 * 8);
          const f = module2.addFunction(prefix + "_mReduct");
          f.addParam("t", "i32");
          f.addParam("r", "i32");
          f.addLocal("np32", "i64");
          f.addLocal("c", "i64");
          f.addLocal("m", "i64");
          const c = f.getCodeBuilder();
          const np32 = Number(0x100000000n - modInv(q, 0x100000000n));
          f.addCode(c.setLocal("np32", c.i64_const(np32)));
          for (let i = 0; i < n32; i++) {
            f.addCode(c.setLocal("c", c.i64_const(0)));
            f.addCode(
              c.setLocal(
                "m",
                c.i64_and(
                  c.i64_mul(
                    c.i64_load32_u(c.getLocal("t"), i * 4),
                    c.getLocal("np32")
                  ),
                  c.i64_const("0xFFFFFFFF")
                )
              )
            );
            for (let j = 0; j < n32; j++) {
              f.addCode(
                c.setLocal(
                  "c",
                  c.i64_add(
                    c.i64_add(
                      c.i64_load32_u(c.getLocal("t"), (i + j) * 4),
                      c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
                    ),
                    c.i64_mul(
                      c.i64_load32_u(c.i32_const(pq), j * 4),
                      c.getLocal("m")
                    )
                  )
                )
              );
              f.addCode(
                c.i64_store32(
                  c.getLocal("t"),
                  (i + j) * 4,
                  c.getLocal("c")
                )
              );
            }
            f.addCode(
              c.i64_store32(
                c.i32_const(carries),
                i * 4,
                c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
              )
            );
          }
          f.addCode(
            c.call(
              prefix + "_add",
              c.i32_const(carries),
              c.i32_add(
                c.getLocal("t"),
                c.i32_const(n32 * 4)
              ),
              c.getLocal("r")
            )
          );
        }
        function buildMul() {
          const f = module2.addFunction(prefix + "_mul");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          f.addLocal("c0", "i64");
          f.addLocal("c1", "i64");
          f.addLocal("np32", "i64");
          for (let i = 0; i < n32; i++) {
            f.addLocal("x" + i, "i64");
            f.addLocal("y" + i, "i64");
            f.addLocal("m" + i, "i64");
            f.addLocal("q" + i, "i64");
          }
          const c = f.getCodeBuilder();
          const np32 = Number(0x100000000n - modInv(q, 0x100000000n));
          f.addCode(c.setLocal("np32", c.i64_const(np32)));
          const loadX = [];
          const loadY = [];
          const loadQ = [];
          function mulij(i, j) {
            let X, Y;
            if (!loadX[i]) {
              X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
              loadX[i] = true;
            } else {
              X = c.getLocal("x" + i);
            }
            if (!loadY[j]) {
              Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
              loadY[j] = true;
            } else {
              Y = c.getLocal("y" + j);
            }
            return c.i64_mul(X, Y);
          }
          function mulqm(i, j) {
            let Q, M;
            if (!loadQ[i]) {
              Q = c.teeLocal("q" + i, c.i64_load32_u(c.i32_const(0), pq + i * 4));
              loadQ[i] = true;
            } else {
              Q = c.getLocal("q" + i);
            }
            M = c.getLocal("m" + j);
            return c.i64_mul(Q, M);
          }
          let c0 = "c0";
          let c1 = "c1";
          for (let k = 0; k < n32 * 2 - 1; k++) {
            for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            for (let i = Math.max(1, k - n32 + 1); i <= k && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulqm(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k < n32) {
              f.addCode(
                c.setLocal(
                  "m" + k,
                  c.i64_and(
                    c.i64_mul(
                      c.i64_and(
                        c.getLocal(c0),
                        c.i64_const(4294967295)
                      ),
                      c.getLocal("np32")
                    ),
                    c.i64_const("0xFFFFFFFF")
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulqm(0, k)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k >= n32) {
              f.addCode(
                c.i64_store32(
                  c.getLocal("r"),
                  (k - n32) * 4,
                  c.getLocal(c0)
                )
              );
            }
            [c0, c1] = [c1, c0];
            f.addCode(
              c.setLocal(
                c1,
                c.i64_shr_u(
                  c.getLocal(c0),
                  c.i64_const(32)
                )
              )
            );
          }
          f.addCode(
            c.i64_store32(
              c.getLocal("r"),
              n32 * 4 - 4,
              c.getLocal(c0)
            )
          );
          f.addCode(
            c.if(
              c.i32_wrap_i64(c.getLocal(c1)),
              c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
              c.if(
                c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
                c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
              )
            )
          );
        }
        function buildSquare() {
          const f = module2.addFunction(prefix + "_square");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          f.addLocal("c0", "i64");
          f.addLocal("c1", "i64");
          f.addLocal("c0_old", "i64");
          f.addLocal("c1_old", "i64");
          f.addLocal("np32", "i64");
          for (let i = 0; i < n32; i++) {
            f.addLocal("x" + i, "i64");
            f.addLocal("m" + i, "i64");
            f.addLocal("q" + i, "i64");
          }
          const c = f.getCodeBuilder();
          const np32 = Number(0x100000000n - modInv(q, 0x100000000n));
          f.addCode(c.setLocal("np32", c.i64_const(np32)));
          const loadX = [];
          const loadQ = [];
          function mulij(i, j) {
            let X, Y;
            if (!loadX[i]) {
              X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
              loadX[i] = true;
            } else {
              X = c.getLocal("x" + i);
            }
            if (!loadX[j]) {
              Y = c.teeLocal("x" + j, c.i64_load32_u(c.getLocal("x"), j * 4));
              loadX[j] = true;
            } else {
              Y = c.getLocal("x" + j);
            }
            return c.i64_mul(X, Y);
          }
          function mulqm(i, j) {
            let Q, M;
            if (!loadQ[i]) {
              Q = c.teeLocal("q" + i, c.i64_load32_u(c.i32_const(0), pq + i * 4));
              loadQ[i] = true;
            } else {
              Q = c.getLocal("q" + i);
            }
            M = c.getLocal("m" + j);
            return c.i64_mul(Q, M);
          }
          let c0 = "c0";
          let c1 = "c1";
          let c0_old = "c0_old";
          let c1_old = "c1_old";
          for (let k = 0; k < n32 * 2 - 1; k++) {
            f.addCode(
              c.setLocal(c0, c.i64_const(0)),
              c.setLocal(c1, c.i64_const(0))
            );
            for (let i = Math.max(0, k - n32 + 1); i < k + 1 >> 1 && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            f.addCode(
              c.setLocal(
                c0,
                c.i64_shl(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  c.i64_const(1)
                )
              )
            );
            f.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.i64_shl(
                    c.getLocal(c1),
                    c.i64_const(1)
                  ),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
            if (k % 2 == 0) {
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulij(k >> 1, k >> 1)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k > 0) {
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    c.i64_and(
                      c.getLocal(c0_old),
                      c.i64_const(4294967295)
                    )
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.i64_add(
                      c.getLocal(c1),
                      c.i64_shr_u(
                        c.getLocal(c0),
                        c.i64_const(32)
                      )
                    ),
                    c.getLocal(c1_old)
                  )
                )
              );
            }
            for (let i = Math.max(1, k - n32 + 1); i <= k && i < n32; i++) {
              const j = k - i;
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulqm(i, j)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k < n32) {
              f.addCode(
                c.setLocal(
                  "m" + k,
                  c.i64_and(
                    c.i64_mul(
                      c.i64_and(
                        c.getLocal(c0),
                        c.i64_const(4294967295)
                      ),
                      c.getLocal("np32")
                    ),
                    c.i64_const("0xFFFFFFFF")
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c0,
                  c.i64_add(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    mulqm(0, k)
                  )
                )
              );
              f.addCode(
                c.setLocal(
                  c1,
                  c.i64_add(
                    c.getLocal(c1),
                    c.i64_shr_u(
                      c.getLocal(c0),
                      c.i64_const(32)
                    )
                  )
                )
              );
            }
            if (k >= n32) {
              f.addCode(
                c.i64_store32(
                  c.getLocal("r"),
                  (k - n32) * 4,
                  c.getLocal(c0)
                )
              );
            }
            f.addCode(
              c.setLocal(
                c0_old,
                c.getLocal(c1)
              ),
              c.setLocal(
                c1_old,
                c.i64_shr_u(
                  c.getLocal(c0_old),
                  c.i64_const(32)
                )
              )
            );
          }
          f.addCode(
            c.i64_store32(
              c.getLocal("r"),
              n32 * 4 - 4,
              c.getLocal(c0_old)
            )
          );
          f.addCode(
            c.if(
              c.i32_wrap_i64(c.getLocal(c1_old)),
              c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
              c.if(
                c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
                c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
              )
            )
          );
        }
        function buildSquareOld() {
          const f = module2.addFunction(prefix + "_squareOld");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
        }
        function buildToMontgomery() {
          const f = module2.addFunction(prefix + "_toMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.i32_const(pR2), c.getLocal("r")));
        }
        function buildFromMontgomery() {
          const pAux2 = module2.alloc(n8 * 2);
          const f = module2.addFunction(prefix + "_fromMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(intPrefix + "_copy", c.getLocal("x"), c.i32_const(pAux2)));
          f.addCode(c.call(intPrefix + "_zero", c.i32_const(pAux2 + n8)));
          f.addCode(c.call(prefix + "_mReduct", c.i32_const(pAux2), c.getLocal("r")));
        }
        function buildInverse() {
          const f = module2.addFunction(prefix + "_inverse");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(prefix + "_fromMontgomery", c.getLocal("x"), c.getLocal("r")));
          f.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")));
          f.addCode(c.call(prefix + "_toMontgomery", c.getLocal("r"), c.getLocal("r")));
        }
        let _nqr = 2n;
        if (isPrime(q)) {
          while (modPow(_nqr, _e, q) !== _minusOne)
            _nqr = _nqr + 1n;
        }
        let s2 = 0;
        let _t = _minusOne;
        while (!isOdd2(_t) && _t !== 0n) {
          s2++;
          _t = _t >> 1n;
        }
        const pt = module2.alloc(n8, utils.bigInt2BytesLE(_t, n8));
        const _nqrToT = modPow(_nqr, _t, q);
        const pNqrToT = module2.alloc(utils.bigInt2BytesLE((_nqrToT << BigInt(n64 * 64)) % q, n8));
        const _tPlusOneOver2 = _t + 1n >> 1n;
        const ptPlusOneOver2 = module2.alloc(n8, utils.bigInt2BytesLE(_tPlusOneOver2, n8));
        function buildSqrt2() {
          const f = module2.addFunction(prefix + "_sqrt");
          f.addParam("n", "i32");
          f.addParam("r", "i32");
          f.addLocal("m", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          const c = f.getCodeBuilder();
          const ONE = c.i32_const(pOne);
          const C = c.i32_const(module2.alloc(n8));
          const T = c.i32_const(module2.alloc(n8));
          const R = c.i32_const(module2.alloc(n8));
          const SQ = c.i32_const(module2.alloc(n8));
          const B = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("n")),
              c.ret(
                c.call(prefix + "_zero", c.getLocal("r"))
              )
            ),
            c.setLocal("m", c.i32_const(s2)),
            c.call(prefix + "_copy", c.i32_const(pNqrToT), C),
            c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(pt), c.i32_const(n8), T),
            c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(ptPlusOneOver2), c.i32_const(n8), R),
            c.block(c.loop(
              c.br_if(1, c.call(prefix + "_eq", T, ONE)),
              c.call(prefix + "_square", T, SQ),
              c.setLocal("i", c.i32_const(1)),
              c.block(c.loop(
                c.br_if(1, c.call(prefix + "_eq", SQ, ONE)),
                c.call(prefix + "_square", SQ, SQ),
                c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
                c.br(0)
              )),
              c.call(prefix + "_copy", C, B),
              c.setLocal("j", c.i32_sub(c.i32_sub(c.getLocal("m"), c.getLocal("i")), c.i32_const(1))),
              c.block(c.loop(
                c.br_if(1, c.i32_eqz(c.getLocal("j"))),
                c.call(prefix + "_square", B, B),
                c.setLocal("j", c.i32_sub(c.getLocal("j"), c.i32_const(1))),
                c.br(0)
              )),
              c.setLocal("m", c.getLocal("i")),
              c.call(prefix + "_square", B, C),
              c.call(prefix + "_mul", T, C, T),
              c.call(prefix + "_mul", R, B, R),
              c.br(0)
            )),
            c.if(
              c.call(prefix + "_isNegative", R),
              c.call(prefix + "_neg", R, c.getLocal("r")),
              c.call(prefix + "_copy", R, c.getLocal("r"))
            )
          );
        }
        function buildIsSquare() {
          const f = module2.addFunction(prefix + "_isSquare");
          f.addParam("n", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const ONE = c.i32_const(pOne);
          const AUX = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("n")),
              c.ret(c.i32_const(1))
            ),
            c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(pe), c.i32_const(n8), AUX),
            c.call(prefix + "_eq", AUX, ONE)
          );
        }
        function buildLoad() {
          const f = module2.addFunction(prefix + "_load");
          f.addParam("scalar", "i32");
          f.addParam("scalarLen", "i32");
          f.addParam("r", "i32");
          f.addLocal("p", "i32");
          f.addLocal("l", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          const c = f.getCodeBuilder();
          const R = c.i32_const(module2.alloc(n8));
          const pAux = module2.alloc(n8);
          const AUX = c.i32_const(pAux);
          f.addCode(
            c.call(intPrefix + "_zero", c.getLocal("r")),
            c.setLocal("i", c.i32_const(n8)),
            c.setLocal("p", c.getLocal("scalar")),
            c.block(c.loop(
              c.br_if(1, c.i32_gt_u(c.getLocal("i"), c.getLocal("scalarLen"))),
              c.if(
                c.i32_eq(c.getLocal("i"), c.i32_const(n8)),
                c.call(prefix + "_one", R),
                c.call(prefix + "_mul", R, c.i32_const(pR2), R)
              ),
              c.call(prefix + "_mul", c.getLocal("p"), R, AUX),
              c.call(prefix + "_add", c.getLocal("r"), AUX, c.getLocal("r")),
              c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(n8))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(n8))),
              c.br(0)
            )),
            c.setLocal("l", c.i32_rem_u(c.getLocal("scalarLen"), c.i32_const(n8))),
            c.if(c.i32_eqz(c.getLocal("l")), c.ret([])),
            c.call(intPrefix + "_zero", AUX),
            c.setLocal("j", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("j"), c.getLocal("l"))),
              c.i32_store8(
                c.getLocal("j"),
                pAux,
                c.i32_load8_u(c.getLocal("p"))
              ),
              c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(1))),
              c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
              c.br(0)
            )),
            c.if(
              c.i32_eq(c.getLocal("i"), c.i32_const(n8)),
              c.call(prefix + "_one", R),
              c.call(prefix + "_mul", R, c.i32_const(pR2), R)
            ),
            c.call(prefix + "_mul", AUX, R, AUX),
            c.call(prefix + "_add", c.getLocal("r"), AUX, c.getLocal("r"))
          );
        }
        function buildTimesScalar() {
          const f = module2.addFunction(prefix + "_timesScalar");
          f.addParam("x", "i32");
          f.addParam("scalar", "i32");
          f.addParam("scalarLen", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.call(prefix + "_load", c.getLocal("scalar"), c.getLocal("scalarLen"), AUX),
            c.call(prefix + "_toMontgomery", AUX, AUX),
            c.call(prefix + "_mul", c.getLocal("x"), AUX, c.getLocal("r"))
          );
        }
        function buildIsOne() {
          const f = module2.addFunction(prefix + "_isOne");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.ret(c.call(intPrefix + "_eq", c.getLocal("x"), c.i32_const(pOne)))
          );
        }
        module2.exportFunction(intPrefix + "_copy", prefix + "_copy");
        module2.exportFunction(intPrefix + "_zero", prefix + "_zero");
        module2.exportFunction(intPrefix + "_isZero", prefix + "_isZero");
        module2.exportFunction(intPrefix + "_eq", prefix + "_eq");
        buildIsOne();
        buildAdd();
        buildSub();
        buildNeg();
        buildMReduct();
        buildMul();
        buildSquare();
        buildSquareOld();
        buildToMontgomery();
        buildFromMontgomery();
        buildIsNegative();
        buildSign();
        buildInverse();
        buildOne();
        buildLoad();
        buildTimesScalar();
        buildBatchInverse(module2, prefix);
        buildBatchConvertion(module2, prefix + "_batchToMontgomery", prefix + "_toMontgomery", n8, n8);
        buildBatchConvertion(module2, prefix + "_batchFromMontgomery", prefix + "_fromMontgomery", n8, n8);
        buildBatchConvertion(module2, prefix + "_batchNeg", prefix + "_neg", n8, n8);
        buildBatchOp(module2, prefix + "_batchAdd", prefix + "_add", n8, n8);
        buildBatchOp(module2, prefix + "_batchSub", prefix + "_sub", n8, n8);
        buildBatchOp(module2, prefix + "_batchMul", prefix + "_mul", n8, n8);
        module2.exportFunction(prefix + "_add");
        module2.exportFunction(prefix + "_sub");
        module2.exportFunction(prefix + "_neg");
        module2.exportFunction(prefix + "_isNegative");
        module2.exportFunction(prefix + "_isOne");
        module2.exportFunction(prefix + "_sign");
        module2.exportFunction(prefix + "_mReduct");
        module2.exportFunction(prefix + "_mul");
        module2.exportFunction(prefix + "_square");
        module2.exportFunction(prefix + "_squareOld");
        module2.exportFunction(prefix + "_fromMontgomery");
        module2.exportFunction(prefix + "_toMontgomery");
        module2.exportFunction(prefix + "_inverse");
        module2.exportFunction(prefix + "_one");
        module2.exportFunction(prefix + "_load");
        module2.exportFunction(prefix + "_timesScalar");
        buildExp(
          module2,
          prefix + "_exp",
          n8,
          prefix + "_mul",
          prefix + "_square",
          intPrefix + "_copy",
          prefix + "_one"
        );
        module2.exportFunction(prefix + "_exp");
        module2.exportFunction(prefix + "_batchInverse");
        if (isPrime(q)) {
          buildSqrt2();
          buildIsSquare();
          module2.exportFunction(prefix + "_sqrt");
          module2.exportFunction(prefix + "_isSquare");
        }
        module2.exportFunction(prefix + "_batchToMontgomery");
        module2.exportFunction(prefix + "_batchFromMontgomery");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_f1.js
  var require_build_f1 = __commonJS({
    "node_modules/wasmcurves/src/build_f1.js"(exports, module) {
      var buildF1m = require_build_f1m();
      var { bitLength: bitLength3 } = require_bigint();
      module.exports = function buildF1(module2, _q, _prefix, _f1mPrefix, _intPrefix) {
        const q = BigInt(_q);
        const n64 = Math.floor((bitLength3(q - 1n) - 1) / 64) + 1;
        const n8 = n64 * 8;
        const prefix = _prefix || "f1";
        if (module2.modules[prefix])
          return prefix;
        module2.modules[prefix] = {
          n64
        };
        const intPrefix = _intPrefix || "int";
        const f1mPrefix = buildF1m(module2, q, _f1mPrefix, intPrefix);
        const pR2 = module2.modules[f1mPrefix].pR2;
        const pq = module2.modules[f1mPrefix].pq;
        const pePlusOne = module2.modules[f1mPrefix].pePlusOne;
        function buildMul() {
          const pAux1 = module2.alloc(n8);
          const f = module2.addFunction(prefix + "_mul");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(f1mPrefix + "_mul", c.getLocal("x"), c.getLocal("y"), c.i32_const(pAux1)));
          f.addCode(c.call(f1mPrefix + "_mul", c.i32_const(pAux1), c.i32_const(pR2), c.getLocal("r")));
        }
        function buildSquare() {
          const f = module2.addFunction(prefix + "_square");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
        }
        function buildInverse() {
          const f = module2.addFunction(prefix + "_inverse");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("x"), c.i32_const(pq), c.getLocal("r")));
        }
        function buildIsNegative() {
          const f = module2.addFunction(prefix + "_isNegative");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(intPrefix + "_gte", c.getLocal("x"), c.i32_const(pePlusOne))
          );
        }
        buildMul();
        buildSquare();
        buildInverse();
        buildIsNegative();
        module2.exportFunction(f1mPrefix + "_add", prefix + "_add");
        module2.exportFunction(f1mPrefix + "_sub", prefix + "_sub");
        module2.exportFunction(f1mPrefix + "_neg", prefix + "_neg");
        module2.exportFunction(prefix + "_mul");
        module2.exportFunction(prefix + "_square");
        module2.exportFunction(prefix + "_inverse");
        module2.exportFunction(prefix + "_isNegative");
        module2.exportFunction(f1mPrefix + "_copy", prefix + "_copy");
        module2.exportFunction(f1mPrefix + "_zero", prefix + "_zero");
        module2.exportFunction(f1mPrefix + "_one", prefix + "_one");
        module2.exportFunction(f1mPrefix + "_isZero", prefix + "_isZero");
        module2.exportFunction(f1mPrefix + "_eq", prefix + "_eq");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_f2m.js
  var require_build_f2m = __commonJS({
    "node_modules/wasmcurves/src/build_f2m.js"(exports, module) {
      var buildExp = require_build_timesscalar();
      var buildBatchInverse = require_build_batchinverse();
      var utils = require_utils();
      module.exports = function buildF2m(module2, mulNonResidueFn, prefix, f1mPrefix) {
        if (module2.modules[prefix])
          return prefix;
        const f1n8 = module2.modules[f1mPrefix].n64 * 8;
        const q = module2.modules[f1mPrefix].q;
        module2.modules[prefix] = {
          n64: module2.modules[f1mPrefix].n64 * 2
        };
        function buildAdd() {
          const f = module2.addFunction(prefix + "_add");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_add", x0, y0, r0),
            c.call(f1mPrefix + "_add", x1, y1, r1)
          );
        }
        function buildTimesScalar() {
          const f = module2.addFunction(prefix + "_timesScalar");
          f.addParam("x", "i32");
          f.addParam("scalar", "i32");
          f.addParam("scalarLen", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_timesScalar", x0, c.getLocal("scalar"), c.getLocal("scalarLen"), r0),
            c.call(f1mPrefix + "_timesScalar", x1, c.getLocal("scalar"), c.getLocal("scalarLen"), r1)
          );
        }
        function buildSub() {
          const f = module2.addFunction(prefix + "_sub");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_sub", x0, y0, r0),
            c.call(f1mPrefix + "_sub", x1, y1, r1)
          );
        }
        function buildNeg() {
          const f = module2.addFunction(prefix + "_neg");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_neg", x0, r0),
            c.call(f1mPrefix + "_neg", x1, r1)
          );
        }
        function buildConjugate() {
          const f = module2.addFunction(prefix + "_conjugate");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_copy", x0, r0),
            c.call(f1mPrefix + "_neg", x1, r1)
          );
        }
        function buildIsNegative() {
          const f = module2.addFunction(prefix + "_isNegative");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.if(
              c.call(f1mPrefix + "_isZero", x1),
              c.ret(c.call(f1mPrefix + "_isNegative", x0))
            ),
            c.ret(c.call(f1mPrefix + "_isNegative", x1))
          );
        }
        function buildMul() {
          const f = module2.addFunction(prefix + "_mul");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const A = c.i32_const(module2.alloc(f1n8));
          const B = c.i32_const(module2.alloc(f1n8));
          const C = c.i32_const(module2.alloc(f1n8));
          const D = c.i32_const(module2.alloc(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_mul", x0, y0, A),
            c.call(f1mPrefix + "_mul", x1, y1, B),
            c.call(f1mPrefix + "_add", x0, x1, C),
            c.call(f1mPrefix + "_add", y0, y1, D),
            c.call(f1mPrefix + "_mul", C, D, C),
            c.call(mulNonResidueFn, B, r0),
            c.call(f1mPrefix + "_add", A, r0, r0),
            c.call(f1mPrefix + "_add", A, B, r1),
            c.call(f1mPrefix + "_sub", C, r1, r1)
          );
        }
        function buildMul1() {
          const f = module2.addFunction(prefix + "_mul1");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const y = c.getLocal("y");
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_mul", x0, y, r0),
            c.call(f1mPrefix + "_mul", x1, y, r1)
          );
        }
        function buildSquare() {
          const f = module2.addFunction(prefix + "_square");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const AB = c.i32_const(module2.alloc(f1n8));
          const APB = c.i32_const(module2.alloc(f1n8));
          const APNB = c.i32_const(module2.alloc(f1n8));
          const ABPNAB = c.i32_const(module2.alloc(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_mul", x0, x1, AB),
            c.call(f1mPrefix + "_add", x0, x1, APB),
            c.call(mulNonResidueFn, x1, APNB),
            c.call(f1mPrefix + "_add", x0, APNB, APNB),
            c.call(mulNonResidueFn, AB, ABPNAB),
            c.call(f1mPrefix + "_add", ABPNAB, AB, ABPNAB),
            c.call(f1mPrefix + "_mul", APB, APNB, r0),
            c.call(f1mPrefix + "_sub", r0, ABPNAB, r0),
            c.call(f1mPrefix + "_add", AB, AB, r1)
          );
        }
        function buildToMontgomery() {
          const f = module2.addFunction(prefix + "_toMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_toMontgomery", x0, r0),
            c.call(f1mPrefix + "_toMontgomery", x1, r1)
          );
        }
        function buildFromMontgomery() {
          const f = module2.addFunction(prefix + "_fromMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_fromMontgomery", x0, r0),
            c.call(f1mPrefix + "_fromMontgomery", x1, r1)
          );
        }
        function buildCopy() {
          const f = module2.addFunction(prefix + "_copy");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_copy", x0, r0),
            c.call(f1mPrefix + "_copy", x1, r1)
          );
        }
        function buildZero() {
          const f = module2.addFunction(prefix + "_zero");
          f.addParam("x", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_zero", x0),
            c.call(f1mPrefix + "_zero", x1)
          );
        }
        function buildOne() {
          const f = module2.addFunction(prefix + "_one");
          f.addParam("x", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_one", x0),
            c.call(f1mPrefix + "_zero", x1)
          );
        }
        function buildEq() {
          const f = module2.addFunction(prefix + "_eq");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          f.addCode(
            c.i32_and(
              c.call(f1mPrefix + "_eq", x0, y0),
              c.call(f1mPrefix + "_eq", x1, y1)
            )
          );
        }
        function buildIsZero() {
          const f = module2.addFunction(prefix + "_isZero");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.i32_and(
              c.call(f1mPrefix + "_isZero", x0),
              c.call(f1mPrefix + "_isZero", x1)
            )
          );
        }
        function buildInverse() {
          const f = module2.addFunction(prefix + "_inverse");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const t0 = c.i32_const(module2.alloc(f1n8));
          const t1 = c.i32_const(module2.alloc(f1n8));
          const t2 = c.i32_const(module2.alloc(f1n8));
          const t3 = c.i32_const(module2.alloc(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_square", x0, t0),
            c.call(f1mPrefix + "_square", x1, t1),
            c.call(mulNonResidueFn, t1, t2),
            c.call(f1mPrefix + "_sub", t0, t2, t2),
            c.call(f1mPrefix + "_inverse", t2, t3),
            c.call(f1mPrefix + "_mul", x0, t3, r0),
            c.call(f1mPrefix + "_mul", x1, t3, r1),
            c.call(f1mPrefix + "_neg", r1, r1)
          );
        }
        function buildSign() {
          const f = module2.addFunction(prefix + "_sign");
          f.addParam("x", "i32");
          f.addLocal("s", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.setLocal("s", c.call(f1mPrefix + "_sign", x1)),
            c.if(
              c.getLocal("s"),
              c.ret(c.getLocal("s"))
            ),
            c.ret(c.call(f1mPrefix + "_sign", x0))
          );
        }
        function buildIsOne() {
          const f = module2.addFunction(prefix + "_isOne");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          f.addCode(
            c.ret(c.i32_and(
              c.call(f1mPrefix + "_isOne", x0),
              c.call(f1mPrefix + "_isZero", x1)
            ))
          );
        }
        function buildSqrt2() {
          const f = module2.addFunction(prefix + "_sqrt");
          f.addParam("a", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const e34 = c.i32_const(module2.alloc(utils.bigInt2BytesLE((BigInt(q || 0) - 3n) / 4n, f1n8)));
          const e12 = c.i32_const(module2.alloc(utils.bigInt2BytesLE((BigInt(q || 0) - 1n) / 2n, f1n8)));
          const a = c.getLocal("a");
          const a1 = c.i32_const(module2.alloc(f1n8 * 2));
          const alpha = c.i32_const(module2.alloc(f1n8 * 2));
          const a0 = c.i32_const(module2.alloc(f1n8 * 2));
          const pn1 = module2.alloc(f1n8 * 2);
          const n1 = c.i32_const(pn1);
          const n1a = c.i32_const(pn1);
          const n1b = c.i32_const(pn1 + f1n8);
          const x0 = c.i32_const(module2.alloc(f1n8 * 2));
          const b = c.i32_const(module2.alloc(f1n8 * 2));
          f.addCode(
            c.call(prefix + "_one", n1),
            c.call(prefix + "_neg", n1, n1),
            c.call(prefix + "_exp", a, e34, c.i32_const(f1n8), a1),
            c.call(prefix + "_square", a1, alpha),
            c.call(prefix + "_mul", a, alpha, alpha),
            c.call(prefix + "_conjugate", alpha, a0),
            c.call(prefix + "_mul", a0, alpha, a0),
            c.if(c.call(prefix + "_eq", a0, n1), c.unreachable()),
            c.call(prefix + "_mul", a1, a, x0),
            c.if(
              c.call(prefix + "_eq", alpha, n1),
              [
                ...c.call(f1mPrefix + "_zero", n1a),
                ...c.call(f1mPrefix + "_one", n1b),
                ...c.call(prefix + "_mul", n1, x0, c.getLocal("pr"))
              ],
              [
                ...c.call(prefix + "_one", b),
                ...c.call(prefix + "_add", b, alpha, b),
                ...c.call(prefix + "_exp", b, e12, c.i32_const(f1n8), b),
                ...c.call(prefix + "_mul", b, x0, c.getLocal("pr"))
              ]
            )
          );
        }
        function buildIsSquare() {
          const f = module2.addFunction(prefix + "_isSquare");
          f.addParam("a", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const e34 = c.i32_const(module2.alloc(utils.bigInt2BytesLE((BigInt(q || 0) - 3n) / 4n, f1n8)));
          const a = c.getLocal("a");
          const a1 = c.i32_const(module2.alloc(f1n8 * 2));
          const alpha = c.i32_const(module2.alloc(f1n8 * 2));
          const a0 = c.i32_const(module2.alloc(f1n8 * 2));
          const pn1 = module2.alloc(f1n8 * 2);
          const n1 = c.i32_const(pn1);
          f.addCode(
            c.call(prefix + "_one", n1),
            c.call(prefix + "_neg", n1, n1),
            c.call(prefix + "_exp", a, e34, c.i32_const(f1n8), a1),
            c.call(prefix + "_square", a1, alpha),
            c.call(prefix + "_mul", a, alpha, alpha),
            c.call(prefix + "_conjugate", alpha, a0),
            c.call(prefix + "_mul", a0, alpha, a0),
            c.if(
              c.call(
                prefix + "_eq",
                a0,
                n1
              ),
              c.ret(c.i32_const(0))
            ),
            c.ret(c.i32_const(1))
          );
        }
        buildIsZero();
        buildIsOne();
        buildZero();
        buildOne();
        buildCopy();
        buildMul();
        buildMul1();
        buildSquare();
        buildAdd();
        buildSub();
        buildNeg();
        buildConjugate();
        buildToMontgomery();
        buildFromMontgomery();
        buildEq();
        buildInverse();
        buildTimesScalar();
        buildSign();
        buildIsNegative();
        module2.exportFunction(prefix + "_isZero");
        module2.exportFunction(prefix + "_isOne");
        module2.exportFunction(prefix + "_zero");
        module2.exportFunction(prefix + "_one");
        module2.exportFunction(prefix + "_copy");
        module2.exportFunction(prefix + "_mul");
        module2.exportFunction(prefix + "_mul1");
        module2.exportFunction(prefix + "_square");
        module2.exportFunction(prefix + "_add");
        module2.exportFunction(prefix + "_sub");
        module2.exportFunction(prefix + "_neg");
        module2.exportFunction(prefix + "_sign");
        module2.exportFunction(prefix + "_conjugate");
        module2.exportFunction(prefix + "_fromMontgomery");
        module2.exportFunction(prefix + "_toMontgomery");
        module2.exportFunction(prefix + "_eq");
        module2.exportFunction(prefix + "_inverse");
        buildBatchInverse(module2, prefix);
        buildExp(
          module2,
          prefix + "_exp",
          f1n8 * 2,
          prefix + "_mul",
          prefix + "_square",
          prefix + "_copy",
          prefix + "_one"
        );
        buildSqrt2();
        buildIsSquare();
        module2.exportFunction(prefix + "_exp");
        module2.exportFunction(prefix + "_timesScalar");
        module2.exportFunction(prefix + "_batchInverse");
        module2.exportFunction(prefix + "_sqrt");
        module2.exportFunction(prefix + "_isSquare");
        module2.exportFunction(prefix + "_isNegative");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_f3m.js
  var require_build_f3m = __commonJS({
    "node_modules/wasmcurves/src/build_f3m.js"(exports, module) {
      var buildExp = require_build_timesscalar();
      var buildBatchInverse = require_build_batchinverse();
      module.exports = function buildF3m(module2, mulNonResidueFn, prefix, f1mPrefix) {
        if (module2.modules[prefix])
          return prefix;
        const f1n8 = module2.modules[f1mPrefix].n64 * 8;
        module2.modules[prefix] = {
          n64: module2.modules[f1mPrefix].n64 * 3
        };
        function buildAdd() {
          const f = module2.addFunction(prefix + "_add");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_add", x0, y0, r0),
            c.call(f1mPrefix + "_add", x1, y1, r1),
            c.call(f1mPrefix + "_add", x2, y2, r2)
          );
        }
        function buildTimesScalar() {
          const f = module2.addFunction(prefix + "_timesScalar");
          f.addParam("x", "i32");
          f.addParam("scalar", "i32");
          f.addParam("scalarLen", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_timesScalar", x0, c.getLocal("scalar"), c.getLocal("scalarLen"), r0),
            c.call(f1mPrefix + "_timesScalar", x1, c.getLocal("scalar"), c.getLocal("scalarLen"), r1),
            c.call(f1mPrefix + "_timesScalar", x2, c.getLocal("scalar"), c.getLocal("scalarLen"), r2)
          );
        }
        function buildSub() {
          const f = module2.addFunction(prefix + "_sub");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_sub", x0, y0, r0),
            c.call(f1mPrefix + "_sub", x1, y1, r1),
            c.call(f1mPrefix + "_sub", x2, y2, r2)
          );
        }
        function buildNeg() {
          const f = module2.addFunction(prefix + "_neg");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_neg", x0, r0),
            c.call(f1mPrefix + "_neg", x1, r1),
            c.call(f1mPrefix + "_neg", x2, r2)
          );
        }
        function buildIsNegative() {
          const f = module2.addFunction(prefix + "_isNegative");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          f.addCode(
            c.if(
              c.call(f1mPrefix + "_isZero", x2),
              c.if(
                c.call(f1mPrefix + "_isZero", x1),
                c.ret(c.call(f1mPrefix + "_isNegative", x0)),
                c.ret(c.call(f1mPrefix + "_isNegative", x1))
              )
            ),
            c.ret(c.call(f1mPrefix + "_isNegative", x2))
          );
        }
        function buildMul() {
          const f = module2.addFunction(prefix + "_mul");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.addParam("r", "i32");
          const cd = f.getCodeBuilder();
          const a = cd.getLocal("x");
          const b = cd.i32_add(cd.getLocal("x"), cd.i32_const(f1n8));
          const c = cd.i32_add(cd.getLocal("x"), cd.i32_const(2 * f1n8));
          const A = cd.getLocal("y");
          const B = cd.i32_add(cd.getLocal("y"), cd.i32_const(f1n8));
          const C = cd.i32_add(cd.getLocal("y"), cd.i32_const(2 * f1n8));
          const r0 = cd.getLocal("r");
          const r1 = cd.i32_add(cd.getLocal("r"), cd.i32_const(f1n8));
          const r2 = cd.i32_add(cd.getLocal("r"), cd.i32_const(2 * f1n8));
          const aA = cd.i32_const(module2.alloc(f1n8));
          const bB = cd.i32_const(module2.alloc(f1n8));
          const cC = cd.i32_const(module2.alloc(f1n8));
          const a_b = cd.i32_const(module2.alloc(f1n8));
          const A_B = cd.i32_const(module2.alloc(f1n8));
          const a_c = cd.i32_const(module2.alloc(f1n8));
          const A_C = cd.i32_const(module2.alloc(f1n8));
          const b_c = cd.i32_const(module2.alloc(f1n8));
          const B_C = cd.i32_const(module2.alloc(f1n8));
          const aA_bB = cd.i32_const(module2.alloc(f1n8));
          const aA_cC = cd.i32_const(module2.alloc(f1n8));
          const bB_cC = cd.i32_const(module2.alloc(f1n8));
          const AUX = cd.i32_const(module2.alloc(f1n8));
          f.addCode(
            cd.call(f1mPrefix + "_mul", a, A, aA),
            cd.call(f1mPrefix + "_mul", b, B, bB),
            cd.call(f1mPrefix + "_mul", c, C, cC),
            cd.call(f1mPrefix + "_add", a, b, a_b),
            cd.call(f1mPrefix + "_add", A, B, A_B),
            cd.call(f1mPrefix + "_add", a, c, a_c),
            cd.call(f1mPrefix + "_add", A, C, A_C),
            cd.call(f1mPrefix + "_add", b, c, b_c),
            cd.call(f1mPrefix + "_add", B, C, B_C),
            cd.call(f1mPrefix + "_add", aA, bB, aA_bB),
            cd.call(f1mPrefix + "_add", aA, cC, aA_cC),
            cd.call(f1mPrefix + "_add", bB, cC, bB_cC),
            cd.call(f1mPrefix + "_mul", b_c, B_C, r0),
            cd.call(f1mPrefix + "_sub", r0, bB_cC, r0),
            cd.call(mulNonResidueFn, r0, r0),
            cd.call(f1mPrefix + "_add", aA, r0, r0),
            cd.call(f1mPrefix + "_mul", a_b, A_B, r1),
            cd.call(f1mPrefix + "_sub", r1, aA_bB, r1),
            cd.call(mulNonResidueFn, cC, AUX),
            cd.call(f1mPrefix + "_add", r1, AUX, r1),
            cd.call(f1mPrefix + "_mul", a_c, A_C, r2),
            cd.call(f1mPrefix + "_sub", r2, aA_cC, r2),
            cd.call(f1mPrefix + "_add", r2, bB, r2)
          );
        }
        function buildSquare() {
          const f = module2.addFunction(prefix + "_square");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const A = c.getLocal("x");
          const B = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const C = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          const s0 = c.i32_const(module2.alloc(f1n8));
          const ab = c.i32_const(module2.alloc(f1n8));
          const s1 = c.i32_const(module2.alloc(f1n8));
          const s2 = c.i32_const(module2.alloc(f1n8));
          const bc = c.i32_const(module2.alloc(f1n8));
          const s3 = c.i32_const(module2.alloc(f1n8));
          const s4 = c.i32_const(module2.alloc(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_square", A, s0),
            c.call(f1mPrefix + "_mul", A, B, ab),
            c.call(f1mPrefix + "_add", ab, ab, s1),
            c.call(f1mPrefix + "_sub", A, B, s2),
            c.call(f1mPrefix + "_add", s2, C, s2),
            c.call(f1mPrefix + "_square", s2, s2),
            c.call(f1mPrefix + "_mul", B, C, bc),
            c.call(f1mPrefix + "_add", bc, bc, s3),
            c.call(f1mPrefix + "_square", C, s4),
            c.call(mulNonResidueFn, s3, r0),
            c.call(f1mPrefix + "_add", s0, r0, r0),
            c.call(mulNonResidueFn, s4, r1),
            c.call(f1mPrefix + "_add", s1, r1, r1),
            c.call(f1mPrefix + "_add", s0, s4, r2),
            c.call(f1mPrefix + "_sub", s3, r2, r2),
            c.call(f1mPrefix + "_add", s2, r2, r2),
            c.call(f1mPrefix + "_add", s1, r2, r2)
          );
        }
        function buildToMontgomery() {
          const f = module2.addFunction(prefix + "_toMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_toMontgomery", x0, r0),
            c.call(f1mPrefix + "_toMontgomery", x1, r1),
            c.call(f1mPrefix + "_toMontgomery", x2, r2)
          );
        }
        function buildFromMontgomery() {
          const f = module2.addFunction(prefix + "_fromMontgomery");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_fromMontgomery", x0, r0),
            c.call(f1mPrefix + "_fromMontgomery", x1, r1),
            c.call(f1mPrefix + "_fromMontgomery", x2, r2)
          );
        }
        function buildCopy() {
          const f = module2.addFunction(prefix + "_copy");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_copy", x0, r0),
            c.call(f1mPrefix + "_copy", x1, r1),
            c.call(f1mPrefix + "_copy", x2, r2)
          );
        }
        function buildZero() {
          const f = module2.addFunction(prefix + "_zero");
          f.addParam("x", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_zero", x0),
            c.call(f1mPrefix + "_zero", x1),
            c.call(f1mPrefix + "_zero", x2)
          );
        }
        function buildOne() {
          const f = module2.addFunction(prefix + "_one");
          f.addParam("x", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          f.addCode(
            c.call(f1mPrefix + "_one", x0),
            c.call(f1mPrefix + "_zero", x1),
            c.call(f1mPrefix + "_zero", x2)
          );
        }
        function buildEq() {
          const f = module2.addFunction(prefix + "_eq");
          f.addParam("x", "i32");
          f.addParam("y", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const y0 = c.getLocal("y");
          const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
          const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
          f.addCode(
            c.i32_and(
              c.i32_and(
                c.call(f1mPrefix + "_eq", x0, y0),
                c.call(f1mPrefix + "_eq", x1, y1)
              ),
              c.call(f1mPrefix + "_eq", x2, y2)
            )
          );
        }
        function buildIsZero() {
          const f = module2.addFunction(prefix + "_isZero");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          f.addCode(
            c.i32_and(
              c.i32_and(
                c.call(f1mPrefix + "_isZero", x0),
                c.call(f1mPrefix + "_isZero", x1)
              ),
              c.call(f1mPrefix + "_isZero", x2)
            )
          );
        }
        function buildInverse() {
          const f = module2.addFunction(prefix + "_inverse");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          const r0 = c.getLocal("r");
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
          const t0 = c.i32_const(module2.alloc(f1n8));
          const t1 = c.i32_const(module2.alloc(f1n8));
          const t2 = c.i32_const(module2.alloc(f1n8));
          const t3 = c.i32_const(module2.alloc(f1n8));
          const t4 = c.i32_const(module2.alloc(f1n8));
          const t5 = c.i32_const(module2.alloc(f1n8));
          const c0 = c.i32_const(module2.alloc(f1n8));
          const c1 = c.i32_const(module2.alloc(f1n8));
          const c2 = c.i32_const(module2.alloc(f1n8));
          const t6 = c.i32_const(module2.alloc(f1n8));
          const AUX = c.i32_const(module2.alloc(f1n8));
          f.addCode(
            c.call(f1mPrefix + "_square", x0, t0),
            c.call(f1mPrefix + "_square", x1, t1),
            c.call(f1mPrefix + "_square", x2, t2),
            c.call(f1mPrefix + "_mul", x0, x1, t3),
            c.call(f1mPrefix + "_mul", x0, x2, t4),
            c.call(f1mPrefix + "_mul", x1, x2, t5),
            c.call(mulNonResidueFn, t5, c0),
            c.call(f1mPrefix + "_sub", t0, c0, c0),
            c.call(mulNonResidueFn, t2, c1),
            c.call(f1mPrefix + "_sub", c1, t3, c1),
            c.call(f1mPrefix + "_sub", t1, t4, c2),
            c.call(f1mPrefix + "_mul", x2, c1, t6),
            c.call(f1mPrefix + "_mul", x1, c2, AUX),
            c.call(f1mPrefix + "_add", t6, AUX, t6),
            c.call(mulNonResidueFn, t6, t6),
            c.call(f1mPrefix + "_mul", x0, c0, AUX),
            c.call(f1mPrefix + "_add", AUX, t6, t6),
            c.call(f1mPrefix + "_inverse", t6, t6),
            c.call(f1mPrefix + "_mul", t6, c0, r0),
            c.call(f1mPrefix + "_mul", t6, c1, r1),
            c.call(f1mPrefix + "_mul", t6, c2, r2)
          );
        }
        function buildSign() {
          const f = module2.addFunction(prefix + "_sign");
          f.addParam("x", "i32");
          f.addLocal("s", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
          f.addCode(
            c.setLocal("s", c.call(f1mPrefix + "_sign", x2)),
            c.if(
              c.getLocal("s"),
              c.ret(c.getLocal("s"))
            ),
            c.setLocal("s", c.call(f1mPrefix + "_sign", x1)),
            c.if(
              c.getLocal("s"),
              c.ret(c.getLocal("s"))
            ),
            c.ret(c.call(f1mPrefix + "_sign", x0))
          );
        }
        function buildIsOne() {
          const f = module2.addFunction(prefix + "_isOne");
          f.addParam("x", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8 * 2));
          f.addCode(
            c.ret(
              c.i32_and(
                c.i32_and(
                  c.call(f1mPrefix + "_isOne", x0),
                  c.call(f1mPrefix + "_isZero", x1)
                ),
                c.call(f1mPrefix + "_isZero", x2)
              )
            )
          );
        }
        buildIsZero();
        buildIsOne();
        buildZero();
        buildOne();
        buildCopy();
        buildMul();
        buildSquare();
        buildAdd();
        buildSub();
        buildNeg();
        buildSign();
        buildToMontgomery();
        buildFromMontgomery();
        buildEq();
        buildInverse();
        buildTimesScalar();
        buildIsNegative();
        module2.exportFunction(prefix + "_isZero");
        module2.exportFunction(prefix + "_isOne");
        module2.exportFunction(prefix + "_zero");
        module2.exportFunction(prefix + "_one");
        module2.exportFunction(prefix + "_copy");
        module2.exportFunction(prefix + "_mul");
        module2.exportFunction(prefix + "_square");
        module2.exportFunction(prefix + "_add");
        module2.exportFunction(prefix + "_sub");
        module2.exportFunction(prefix + "_neg");
        module2.exportFunction(prefix + "_sign");
        module2.exportFunction(prefix + "_fromMontgomery");
        module2.exportFunction(prefix + "_toMontgomery");
        module2.exportFunction(prefix + "_eq");
        module2.exportFunction(prefix + "_inverse");
        buildBatchInverse(module2, prefix);
        buildExp(
          module2,
          prefix + "_exp",
          f1n8 * 3,
          prefix + "_mul",
          prefix + "_square",
          prefix + "_copy",
          prefix + "_one"
        );
        module2.exportFunction(prefix + "_exp");
        module2.exportFunction(prefix + "_timesScalar");
        module2.exportFunction(prefix + "_batchInverse");
        module2.exportFunction(prefix + "_isNegative");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_timesscalarnaf.js
  var require_build_timesscalarnaf = __commonJS({
    "node_modules/wasmcurves/src/build_timesscalarnaf.js"(exports, module) {
      module.exports = function buildTimesScalarNAF(module2, fnName, elementLen, opAB, opAA, opAmB, opCopy, opInit) {
        const f = module2.addFunction(fnName);
        f.addParam("base", "i32");
        f.addParam("scalar", "i32");
        f.addParam("scalarLength", "i32");
        f.addParam("r", "i32");
        f.addLocal("old0", "i32");
        f.addLocal("nbits", "i32");
        f.addLocal("i", "i32");
        f.addLocal("last", "i32");
        f.addLocal("cur", "i32");
        f.addLocal("carry", "i32");
        f.addLocal("p", "i32");
        const c = f.getCodeBuilder();
        const aux = c.i32_const(module2.alloc(elementLen));
        function getBit(IDX) {
          return c.i32_and(
            c.i32_shr_u(
              c.i32_load(
                c.i32_add(
                  c.getLocal("scalar"),
                  c.i32_and(
                    c.i32_shr_u(
                      IDX,
                      c.i32_const(3)
                    ),
                    c.i32_const(4294967292)
                  )
                )
              ),
              c.i32_and(
                IDX,
                c.i32_const(31)
              )
            ),
            c.i32_const(1)
          );
        }
        function pushBit(b) {
          return [
            ...c.i32_store8(
              c.getLocal("p"),
              c.i32_const(b)
            ),
            ...c.setLocal(
              "p",
              c.i32_add(
                c.getLocal("p"),
                c.i32_const(1)
              )
            )
          ];
        }
        f.addCode(
          c.if(
            c.i32_eqz(c.getLocal("scalarLength")),
            [
              ...c.call(opInit, c.getLocal("r")),
              ...c.ret([])
            ]
          ),
          c.setLocal("nbits", c.i32_shl(c.getLocal("scalarLength"), c.i32_const(3))),
          c.setLocal("old0", c.i32_load(c.i32_const(0))),
          c.setLocal("p", c.getLocal("old0")),
          c.i32_store(
            c.i32_const(0),
            c.i32_and(
              c.i32_add(
                c.i32_add(
                  c.getLocal("old0"),
                  c.i32_const(32)
                ),
                c.getLocal("nbits")
              ),
              c.i32_const(4294967288)
            )
          ),
          c.setLocal("i", c.i32_const(1)),
          c.setLocal("last", getBit(c.i32_const(0))),
          c.setLocal("carry", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("nbits"))),
            c.setLocal("cur", getBit(c.getLocal("i"))),
            c.if(
              c.getLocal("last"),
              c.if(
                c.getLocal("cur"),
                c.if(
                  c.getLocal("carry"),
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(1)),
                    ...pushBit(1)
                  ],
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(1)),
                    ...pushBit(255)
                  ]
                ),
                c.if(
                  c.getLocal("carry"),
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(1)),
                    ...pushBit(255)
                  ],
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(0)),
                    ...pushBit(1)
                  ]
                )
              ),
              c.if(
                c.getLocal("cur"),
                c.if(
                  c.getLocal("carry"),
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(1)),
                    ...pushBit(0)
                  ],
                  [
                    ...c.setLocal("last", c.i32_const(1)),
                    ...c.setLocal("carry", c.i32_const(0)),
                    ...pushBit(0)
                  ]
                ),
                c.if(
                  c.getLocal("carry"),
                  [
                    ...c.setLocal("last", c.i32_const(1)),
                    ...c.setLocal("carry", c.i32_const(0)),
                    ...pushBit(0)
                  ],
                  [
                    ...c.setLocal("last", c.i32_const(0)),
                    ...c.setLocal("carry", c.i32_const(0)),
                    ...pushBit(0)
                  ]
                )
              )
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )),
          c.if(
            c.getLocal("last"),
            c.if(
              c.getLocal("carry"),
              [
                ...pushBit(255),
                ...pushBit(0),
                ...pushBit(1)
              ],
              [
                ...pushBit(1)
              ]
            ),
            c.if(
              c.getLocal("carry"),
              [
                ...pushBit(0),
                ...pushBit(1)
              ]
            )
          ),
          c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
          c.call(opCopy, c.getLocal("base"), aux),
          c.call(opInit, c.getLocal("r")),
          c.block(c.loop(
            c.call(opAA, c.getLocal("r"), c.getLocal("r")),
            c.setLocal(
              "cur",
              c.i32_load8_u(
                c.getLocal("p")
              )
            ),
            c.if(
              c.getLocal("cur"),
              c.if(
                c.i32_eq(c.getLocal("cur"), c.i32_const(1)),
                c.call(opAB, c.getLocal("r"), aux, c.getLocal("r")),
                c.call(opAmB, c.getLocal("r"), aux, c.getLocal("r"))
              )
            ),
            c.br_if(1, c.i32_eq(c.getLocal("old0"), c.getLocal("p"))),
            c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
            c.br(0)
          )),
          c.i32_store(c.i32_const(0), c.getLocal("old0"))
        );
      };
    }
  });

  // node_modules/wasmcurves/src/build_multiexp.js
  var require_build_multiexp = __commonJS({
    "node_modules/wasmcurves/src/build_multiexp.js"(exports, module) {
      module.exports = function buildMultiexp2(module2, prefix, fnName, opAdd, n8b) {
        const n64g = module2.modules[prefix].n64;
        const n8g = n64g * 8;
        function buildGetChunk() {
          const f = module2.addFunction(fnName + "_getChunk");
          f.addParam("pScalar", "i32");
          f.addParam("scalarSize", "i32");
          f.addParam("startBit", "i32");
          f.addParam("chunkSize", "i32");
          f.addLocal("bitsToEnd", "i32");
          f.addLocal("mask", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal(
              "bitsToEnd",
              c.i32_sub(
                c.i32_mul(
                  c.getLocal("scalarSize"),
                  c.i32_const(8)
                ),
                c.getLocal("startBit")
              )
            ),
            c.if(
              c.i32_gt_s(
                c.getLocal("chunkSize"),
                c.getLocal("bitsToEnd")
              ),
              c.setLocal(
                "mask",
                c.i32_sub(
                  c.i32_shl(
                    c.i32_const(1),
                    c.getLocal("bitsToEnd")
                  ),
                  c.i32_const(1)
                )
              ),
              c.setLocal(
                "mask",
                c.i32_sub(
                  c.i32_shl(
                    c.i32_const(1),
                    c.getLocal("chunkSize")
                  ),
                  c.i32_const(1)
                )
              )
            ),
            c.i32_and(
              c.i32_shr_u(
                c.i32_load(
                  c.i32_add(
                    c.getLocal("pScalar"),
                    c.i32_shr_u(
                      c.getLocal("startBit"),
                      c.i32_const(3)
                    )
                  ),
                  0,
                  0
                ),
                c.i32_and(
                  c.getLocal("startBit"),
                  c.i32_const(7)
                )
              ),
              c.getLocal("mask")
            )
          );
        }
        function buildMutiexpChunk() {
          const f = module2.addFunction(fnName + "_chunk");
          f.addParam("pBases", "i32");
          f.addParam("pScalars", "i32");
          f.addParam("scalarSize", "i32");
          f.addParam("n", "i32");
          f.addParam("startBit", "i32");
          f.addParam("chunkSize", "i32");
          f.addParam("pr", "i32");
          f.addLocal("nChunks", "i32");
          f.addLocal("itScalar", "i32");
          f.addLocal("endScalar", "i32");
          f.addLocal("itBase", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          f.addLocal("nTable", "i32");
          f.addLocal("pTable", "i32");
          f.addLocal("idx", "i32");
          f.addLocal("pIdxTable", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.if(
              c.i32_eqz(c.getLocal("n")),
              [
                ...c.call(prefix + "_zero", c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.setLocal(
              "nTable",
              c.i32_shl(
                c.i32_const(1),
                c.getLocal("chunkSize")
              )
            ),
            c.setLocal("pTable", c.i32_load(c.i32_const(0))),
            c.i32_store(
              c.i32_const(0),
              c.i32_add(
                c.getLocal("pTable"),
                c.i32_mul(
                  c.getLocal("nTable"),
                  c.i32_const(n8g)
                )
              )
            ),
            c.setLocal("j", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("j"),
                  c.getLocal("nTable")
                )
              ),
              c.call(
                prefix + "_zero",
                c.i32_add(
                  c.getLocal("pTable"),
                  c.i32_mul(
                    c.getLocal("j"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
              c.br(0)
            )),
            c.setLocal("itBase", c.getLocal("pBases")),
            c.setLocal("itScalar", c.getLocal("pScalars")),
            c.setLocal(
              "endScalar",
              c.i32_add(
                c.getLocal("pScalars"),
                c.i32_mul(
                  c.getLocal("n"),
                  c.getLocal("scalarSize")
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("itScalar"),
                  c.getLocal("endScalar")
                )
              ),
              c.setLocal(
                "idx",
                c.call(
                  fnName + "_getChunk",
                  c.getLocal("itScalar"),
                  c.getLocal("scalarSize"),
                  c.getLocal("startBit"),
                  c.getLocal("chunkSize")
                )
              ),
              c.if(
                c.getLocal("idx"),
                [
                  ...c.setLocal(
                    "pIdxTable",
                    c.i32_add(
                      c.getLocal("pTable"),
                      c.i32_mul(
                        c.i32_sub(
                          c.getLocal("idx"),
                          c.i32_const(1)
                        ),
                        c.i32_const(n8g)
                      )
                    )
                  ),
                  ...c.call(
                    opAdd,
                    c.getLocal("pIdxTable"),
                    c.getLocal("itBase"),
                    c.getLocal("pIdxTable")
                  )
                ]
              ),
              c.setLocal("itScalar", c.i32_add(c.getLocal("itScalar"), c.getLocal("scalarSize"))),
              c.setLocal("itBase", c.i32_add(c.getLocal("itBase"), c.i32_const(n8b))),
              c.br(0)
            )),
            c.call(fnName + "_reduceTable", c.getLocal("pTable"), c.getLocal("chunkSize")),
            c.call(
              prefix + "_copy",
              c.getLocal("pTable"),
              c.getLocal("pr")
            ),
            c.i32_store(
              c.i32_const(0),
              c.getLocal("pTable")
            )
          );
        }
        function buildMultiexp3() {
          const f = module2.addFunction(fnName);
          f.addParam("pBases", "i32");
          f.addParam("pScalars", "i32");
          f.addParam("scalarSize", "i32");
          f.addParam("n", "i32");
          f.addParam("pr", "i32");
          f.addLocal("chunkSize", "i32");
          f.addLocal("nChunks", "i32");
          f.addLocal("itScalar", "i32");
          f.addLocal("endScalar", "i32");
          f.addLocal("itBase", "i32");
          f.addLocal("itBit", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          f.addLocal("nTable", "i32");
          f.addLocal("pTable", "i32");
          f.addLocal("idx", "i32");
          f.addLocal("pIdxTable", "i32");
          const c = f.getCodeBuilder();
          const aux = c.i32_const(module2.alloc(n8g));
          const pTSizes2 = module2.alloc([
            17,
            17,
            17,
            17,
            17,
            17,
            17,
            17,
            17,
            17,
            16,
            16,
            15,
            14,
            13,
            13,
            12,
            11,
            10,
            9,
            8,
            7,
            7,
            6,
            5,
            4,
            3,
            2,
            1,
            1,
            1,
            1
          ]);
          f.addCode(
            c.call(prefix + "_zero", c.getLocal("pr")),
            c.if(
              c.i32_eqz(c.getLocal("n")),
              c.ret([])
            ),
            c.setLocal("chunkSize", c.i32_load8_u(c.i32_clz(c.getLocal("n")), pTSizes2)),
            c.setLocal(
              "nChunks",
              c.i32_add(
                c.i32_div_u(
                  c.i32_sub(
                    c.i32_shl(
                      c.getLocal("scalarSize"),
                      c.i32_const(3)
                    ),
                    c.i32_const(1)
                  ),
                  c.getLocal("chunkSize")
                ),
                c.i32_const(1)
              )
            ),
            c.setLocal(
              "itBit",
              c.i32_mul(
                c.i32_sub(
                  c.getLocal("nChunks"),
                  c.i32_const(1)
                ),
                c.getLocal("chunkSize")
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_lt_s(
                  c.getLocal("itBit"),
                  c.i32_const(0)
                )
              ),
              c.if(
                c.i32_eqz(c.call(prefix + "_isZero", c.getLocal("pr"))),
                [
                  ...c.setLocal("j", c.i32_const(0)),
                  ...c.block(c.loop(
                    c.br_if(
                      1,
                      c.i32_eq(
                        c.getLocal("j"),
                        c.getLocal("chunkSize")
                      )
                    ),
                    c.call(prefix + "_double", c.getLocal("pr"), c.getLocal("pr")),
                    c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                    c.br(0)
                  ))
                ]
              ),
              c.call(
                fnName + "_chunk",
                c.getLocal("pBases"),
                c.getLocal("pScalars"),
                c.getLocal("scalarSize"),
                c.getLocal("n"),
                c.getLocal("itBit"),
                c.getLocal("chunkSize"),
                aux
              ),
              c.call(
                prefix + "_add",
                c.getLocal("pr"),
                aux,
                c.getLocal("pr")
              ),
              c.setLocal("itBit", c.i32_sub(c.getLocal("itBit"), c.getLocal("chunkSize"))),
              c.br(0)
            ))
          );
        }
        function buildReduceTable() {
          const f = module2.addFunction(fnName + "_reduceTable");
          f.addParam("pTable", "i32");
          f.addParam("p", "i32");
          f.addLocal("half", "i32");
          f.addLocal("it1", "i32");
          f.addLocal("it2", "i32");
          f.addLocal("pAcc", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.if(
              c.i32_eq(c.getLocal("p"), c.i32_const(1)),
              c.ret([])
            ),
            c.setLocal(
              "half",
              c.i32_shl(
                c.i32_const(1),
                c.i32_sub(
                  c.getLocal("p"),
                  c.i32_const(1)
                )
              )
            ),
            c.setLocal("it1", c.getLocal("pTable")),
            c.setLocal(
              "it2",
              c.i32_add(
                c.getLocal("pTable"),
                c.i32_mul(
                  c.getLocal("half"),
                  c.i32_const(n8g)
                )
              )
            ),
            c.setLocal(
              "pAcc",
              c.i32_sub(
                c.getLocal("it2"),
                c.i32_const(n8g)
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("it1"),
                  c.getLocal("pAcc")
                )
              ),
              c.call(
                prefix + "_add",
                c.getLocal("it1"),
                c.getLocal("it2"),
                c.getLocal("it1")
              ),
              c.call(
                prefix + "_add",
                c.getLocal("pAcc"),
                c.getLocal("it2"),
                c.getLocal("pAcc")
              ),
              c.setLocal("it1", c.i32_add(c.getLocal("it1"), c.i32_const(n8g))),
              c.setLocal("it2", c.i32_add(c.getLocal("it2"), c.i32_const(n8g))),
              c.br(0)
            )),
            c.call(
              fnName + "_reduceTable",
              c.getLocal("pTable"),
              c.i32_sub(
                c.getLocal("p"),
                c.i32_const(1)
              )
            ),
            c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
            c.block(c.loop(
              c.br_if(1, c.i32_eqz(c.getLocal("p"))),
              c.call(prefix + "_double", c.getLocal("pAcc"), c.getLocal("pAcc")),
              c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
              c.br(0)
            )),
            c.call(prefix + "_add", c.getLocal("pTable"), c.getLocal("pAcc"), c.getLocal("pTable"))
          );
        }
        buildGetChunk();
        buildReduceTable();
        buildMutiexpChunk();
        buildMultiexp3();
        module2.exportFunction(fnName);
        module2.exportFunction(fnName + "_chunk");
      };
    }
  });

  // node_modules/wasmcurves/src/build_curve_jacobian_a0.js
  var require_build_curve_jacobian_a0 = __commonJS({
    "node_modules/wasmcurves/src/build_curve_jacobian_a0.js"(exports, module) {
      var buildTimesScalarNAF = require_build_timesscalarnaf();
      var buildBatchConvertion = require_build_batchconvertion();
      var buildMultiexp2 = require_build_multiexp();
      module.exports = function buildCurve(module2, prefix, prefixField, pB) {
        const n64 = module2.modules[prefixField].n64;
        const n8 = n64 * 8;
        if (module2.modules[prefix])
          return prefix;
        module2.modules[prefix] = {
          n64: n64 * 3
        };
        function buildIsZero() {
          const f = module2.addFunction(prefix + "_isZero");
          f.addParam("p1", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_isZero",
            c.i32_add(
              c.getLocal("p1"),
              c.i32_const(n8 * 2)
            )
          ));
        }
        function buildIsZeroAffine() {
          const f = module2.addFunction(prefix + "_isZeroAffine");
          f.addParam("p1", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.i32_and(
              c.call(
                prefixField + "_isZero",
                c.getLocal("p1")
              ),
              c.call(
                prefixField + "_isZero",
                c.i32_add(
                  c.getLocal("p1"),
                  c.i32_const(n8)
                )
              )
            )
          );
        }
        function buildCopy() {
          const f = module2.addFunction(prefix + "_copy");
          f.addParam("ps", "i32");
          f.addParam("pd", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < n64 * 3; i++) {
            f.addCode(
              c.i64_store(
                c.getLocal("pd"),
                i * 8,
                c.i64_load(
                  c.getLocal("ps"),
                  i * 8
                )
              )
            );
          }
        }
        function buildCopyAffine() {
          const f = module2.addFunction(prefix + "_copyAffine");
          f.addParam("ps", "i32");
          f.addParam("pd", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < n64 * 2; i++) {
            f.addCode(
              c.i64_store(
                c.getLocal("pd"),
                i * 8,
                c.i64_load(
                  c.getLocal("ps"),
                  i * 8
                )
              )
            );
          }
        }
        function buildZero() {
          const f = module2.addFunction(prefix + "_zero");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_zero",
            c.getLocal("pr")
          ));
          f.addCode(c.call(
            prefixField + "_one",
            c.i32_add(
              c.getLocal("pr"),
              c.i32_const(n8)
            )
          ));
          f.addCode(c.call(
            prefixField + "_zero",
            c.i32_add(
              c.getLocal("pr"),
              c.i32_const(n8 * 2)
            )
          ));
        }
        function buildZeroAffine() {
          const f = module2.addFunction(prefix + "_zeroAffine");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_zero",
            c.getLocal("pr")
          ));
          f.addCode(c.call(
            prefixField + "_zero",
            c.i32_add(
              c.getLocal("pr"),
              c.i32_const(n8)
            )
          ));
        }
        function buildEq() {
          const f = module2.addFunction(prefix + "_eq");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.setReturnType("i32");
          f.addLocal("z1", "i32");
          f.addLocal("z2", "i32");
          const c = f.getCodeBuilder();
          const x1 = c.getLocal("p1");
          const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
          const z1 = c.getLocal("z1");
          const x2 = c.getLocal("p2");
          const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
          f.addCode(c.setLocal("z2", c.i32_add(c.getLocal("p2"), c.i32_const(n8 * 2))));
          const z2 = c.getLocal("z2");
          const Z1Z1 = c.i32_const(module2.alloc(n8));
          const Z2Z2 = c.i32_const(module2.alloc(n8));
          const U1 = c.i32_const(module2.alloc(n8));
          const U2 = c.i32_const(module2.alloc(n8));
          const Z1_cubed = c.i32_const(module2.alloc(n8));
          const Z2_cubed = c.i32_const(module2.alloc(n8));
          const S1 = c.i32_const(module2.alloc(n8));
          const S2 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              c.ret(c.call(prefix + "_isZero", c.getLocal("p2")))
            ),
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p2")),
              c.ret(c.i32_const(0))
            ),
            c.if(
              c.call(prefixField + "_isOne", z1),
              c.ret(c.call(prefix + "_eqMixed", c.getLocal("p2"), c.getLocal("p1")))
            ),
            c.if(
              c.call(prefixField + "_isOne", z2),
              c.ret(c.call(prefix + "_eqMixed", c.getLocal("p1"), c.getLocal("p2")))
            ),
            c.call(prefixField + "_square", z1, Z1Z1),
            c.call(prefixField + "_square", z2, Z2Z2),
            c.call(prefixField + "_mul", x1, Z2Z2, U1),
            c.call(prefixField + "_mul", x2, Z1Z1, U2),
            c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
            c.call(prefixField + "_mul", z2, Z2Z2, Z2_cubed),
            c.call(prefixField + "_mul", y1, Z2_cubed, S1),
            c.call(prefixField + "_mul", y2, Z1_cubed, S2),
            c.if(
              c.call(prefixField + "_eq", U1, U2),
              c.if(
                c.call(prefixField + "_eq", S1, S2),
                c.ret(c.i32_const(1))
              )
            ),
            c.ret(c.i32_const(0))
          );
        }
        function buildEqMixed() {
          const f = module2.addFunction(prefix + "_eqMixed");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.setReturnType("i32");
          f.addLocal("z1", "i32");
          const c = f.getCodeBuilder();
          const x1 = c.getLocal("p1");
          const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
          const z1 = c.getLocal("z1");
          const x2 = c.getLocal("p2");
          const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
          const Z1Z1 = c.i32_const(module2.alloc(n8));
          const U2 = c.i32_const(module2.alloc(n8));
          const Z1_cubed = c.i32_const(module2.alloc(n8));
          const S2 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              c.ret(c.call(prefix + "_isZeroAffine", c.getLocal("p2")))
            ),
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
              c.ret(c.i32_const(0))
            ),
            c.if(
              c.call(prefixField + "_isOne", z1),
              c.ret(c.call(prefix + "_eqAffine", c.getLocal("p1"), c.getLocal("p2")))
            ),
            c.call(prefixField + "_square", z1, Z1Z1),
            c.call(prefixField + "_mul", x2, Z1Z1, U2),
            c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
            c.call(prefixField + "_mul", y2, Z1_cubed, S2),
            c.if(
              c.call(prefixField + "_eq", x1, U2),
              c.if(
                c.call(prefixField + "_eq", y1, S2),
                c.ret(c.i32_const(1))
              )
            ),
            c.ret(c.i32_const(0))
          );
        }
        function buildDouble() {
          const f = module2.addFunction(prefix + "_double");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const A = c.i32_const(module2.alloc(n8));
          const B = c.i32_const(module2.alloc(n8));
          const C = c.i32_const(module2.alloc(n8));
          const D = c.i32_const(module2.alloc(n8));
          const E = c.i32_const(module2.alloc(n8));
          const F = c.i32_const(module2.alloc(n8));
          const G = c.i32_const(module2.alloc(n8));
          const eightC = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              [
                ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefixField + "_isOne", z),
              [
                ...c.ret(c.call(prefix + "_doubleAffine", c.getLocal("p1"), c.getLocal("pr"))),
                ...c.ret([])
              ]
            ),
            c.call(prefixField + "_square", x, A),
            c.call(prefixField + "_square", y, B),
            c.call(prefixField + "_square", B, C),
            c.call(prefixField + "_add", x, B, D),
            c.call(prefixField + "_square", D, D),
            c.call(prefixField + "_sub", D, A, D),
            c.call(prefixField + "_sub", D, C, D),
            c.call(prefixField + "_add", D, D, D),
            c.call(prefixField + "_add", A, A, E),
            c.call(prefixField + "_add", E, A, E),
            c.call(prefixField + "_square", E, F),
            c.call(prefixField + "_mul", y, z, G),
            c.call(prefixField + "_add", D, D, x3),
            c.call(prefixField + "_sub", F, x3, x3),
            c.call(prefixField + "_add", C, C, eightC),
            c.call(prefixField + "_add", eightC, eightC, eightC),
            c.call(prefixField + "_add", eightC, eightC, eightC),
            c.call(prefixField + "_sub", D, x3, y3),
            c.call(prefixField + "_mul", y3, E, y3),
            c.call(prefixField + "_sub", y3, eightC, y3),
            c.call(prefixField + "_add", G, G, z3)
          );
        }
        function buildDoubleAffine() {
          const f = module2.addFunction(prefix + "_doubleAffine");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const XX = c.i32_const(module2.alloc(n8));
          const YY = c.i32_const(module2.alloc(n8));
          const YYYY = c.i32_const(module2.alloc(n8));
          const S = c.i32_const(module2.alloc(n8));
          const M = c.i32_const(module2.alloc(n8));
          const eightYYYY = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
              [
                ...c.call(prefix + "_toJacobian", c.getLocal("p1"), c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.call(prefixField + "_square", x, XX),
            c.call(prefixField + "_square", y, YY),
            c.call(prefixField + "_square", YY, YYYY),
            c.call(prefixField + "_add", x, YY, S),
            c.call(prefixField + "_square", S, S),
            c.call(prefixField + "_sub", S, XX, S),
            c.call(prefixField + "_sub", S, YYYY, S),
            c.call(prefixField + "_add", S, S, S),
            c.call(prefixField + "_add", XX, XX, M),
            c.call(prefixField + "_add", M, XX, M),
            c.call(prefixField + "_add", y, y, z3),
            c.call(prefixField + "_square", M, x3),
            c.call(prefixField + "_sub", x3, S, x3),
            c.call(prefixField + "_sub", x3, S, x3),
            c.call(prefixField + "_add", YYYY, YYYY, eightYYYY),
            c.call(prefixField + "_add", eightYYYY, eightYYYY, eightYYYY),
            c.call(prefixField + "_add", eightYYYY, eightYYYY, eightYYYY),
            c.call(prefixField + "_sub", S, x3, y3),
            c.call(prefixField + "_mul", y3, M, y3),
            c.call(prefixField + "_sub", y3, eightYYYY, y3)
          );
        }
        function buildEqAffine() {
          const f = module2.addFunction(prefix + "_eqAffine");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.setReturnType("i32");
          f.addLocal("z1", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.ret(c.i32_and(
              c.call(
                prefixField + "_eq",
                c.getLocal("p1"),
                c.getLocal("p2")
              ),
              c.call(
                prefixField + "_eq",
                c.i32_add(c.getLocal("p1"), c.i32_const(n8)),
                c.i32_add(c.getLocal("p2"), c.i32_const(n8))
              )
            ))
          );
        }
        function buildToMontgomery() {
          const f = module2.addFunction(prefix + "_toMontgomery");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_toMontgomery",
            c.getLocal("p1"),
            c.getLocal("pr")
          ));
          for (let i = 1; i < 3; i++) {
            f.addCode(c.call(
              prefixField + "_toMontgomery",
              c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
              c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
            ));
          }
        }
        function buildToMontgomeryAffine() {
          const f = module2.addFunction(prefix + "_toMontgomeryAffine");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_toMontgomery",
            c.getLocal("p1"),
            c.getLocal("pr")
          ));
          for (let i = 1; i < 2; i++) {
            f.addCode(c.call(
              prefixField + "_toMontgomery",
              c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
              c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
            ));
          }
        }
        function buildFromMontgomery() {
          const f = module2.addFunction(prefix + "_fromMontgomery");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_fromMontgomery",
            c.getLocal("p1"),
            c.getLocal("pr")
          ));
          for (let i = 1; i < 3; i++) {
            f.addCode(c.call(
              prefixField + "_fromMontgomery",
              c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
              c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
            ));
          }
        }
        function buildFromMontgomeryAffine() {
          const f = module2.addFunction(prefix + "_fromMontgomeryAffine");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(c.call(
            prefixField + "_fromMontgomery",
            c.getLocal("p1"),
            c.getLocal("pr")
          ));
          for (let i = 1; i < 2; i++) {
            f.addCode(c.call(
              prefixField + "_fromMontgomery",
              c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
              c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
            ));
          }
        }
        function buildAdd() {
          const f = module2.addFunction(prefix + "_add");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          f.addLocal("z1", "i32");
          f.addLocal("z2", "i32");
          const c = f.getCodeBuilder();
          const x1 = c.getLocal("p1");
          const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
          const z1 = c.getLocal("z1");
          const x2 = c.getLocal("p2");
          const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
          f.addCode(c.setLocal("z2", c.i32_add(c.getLocal("p2"), c.i32_const(n8 * 2))));
          const z2 = c.getLocal("z2");
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const Z1Z1 = c.i32_const(module2.alloc(n8));
          const Z2Z2 = c.i32_const(module2.alloc(n8));
          const U1 = c.i32_const(module2.alloc(n8));
          const U2 = c.i32_const(module2.alloc(n8));
          const Z1_cubed = c.i32_const(module2.alloc(n8));
          const Z2_cubed = c.i32_const(module2.alloc(n8));
          const S1 = c.i32_const(module2.alloc(n8));
          const S2 = c.i32_const(module2.alloc(n8));
          const H = c.i32_const(module2.alloc(n8));
          const S2_minus_S1 = c.i32_const(module2.alloc(n8));
          const I = c.i32_const(module2.alloc(n8));
          const J = c.i32_const(module2.alloc(n8));
          const r = c.i32_const(module2.alloc(n8));
          const r2 = c.i32_const(module2.alloc(n8));
          const V = c.i32_const(module2.alloc(n8));
          const V2 = c.i32_const(module2.alloc(n8));
          const S1_J2 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              [
                ...c.call(prefix + "_copy", c.getLocal("p2"), c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p2")),
              [
                ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefixField + "_isOne", z1),
              [
                ...c.call(prefix + "_addMixed", x2, x1, x3),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefixField + "_isOne", z2),
              [
                ...c.call(prefix + "_addMixed", x1, x2, x3),
                ...c.ret([])
              ]
            ),
            c.call(prefixField + "_square", z1, Z1Z1),
            c.call(prefixField + "_square", z2, Z2Z2),
            c.call(prefixField + "_mul", x1, Z2Z2, U1),
            c.call(prefixField + "_mul", x2, Z1Z1, U2),
            c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
            c.call(prefixField + "_mul", z2, Z2Z2, Z2_cubed),
            c.call(prefixField + "_mul", y1, Z2_cubed, S1),
            c.call(prefixField + "_mul", y2, Z1_cubed, S2),
            c.if(
              c.call(prefixField + "_eq", U1, U2),
              c.if(
                c.call(prefixField + "_eq", S1, S2),
                [
                  ...c.call(prefix + "_double", c.getLocal("p1"), c.getLocal("pr")),
                  ...c.ret([])
                ]
              )
            ),
            c.call(prefixField + "_sub", U2, U1, H),
            c.call(prefixField + "_sub", S2, S1, S2_minus_S1),
            c.call(prefixField + "_add", H, H, I),
            c.call(prefixField + "_square", I, I),
            c.call(prefixField + "_mul", H, I, J),
            c.call(prefixField + "_add", S2_minus_S1, S2_minus_S1, r),
            c.call(prefixField + "_mul", U1, I, V),
            c.call(prefixField + "_square", r, r2),
            c.call(prefixField + "_add", V, V, V2),
            c.call(prefixField + "_sub", r2, J, x3),
            c.call(prefixField + "_sub", x3, V2, x3),
            c.call(prefixField + "_mul", S1, J, S1_J2),
            c.call(prefixField + "_add", S1_J2, S1_J2, S1_J2),
            c.call(prefixField + "_sub", V, x3, y3),
            c.call(prefixField + "_mul", y3, r, y3),
            c.call(prefixField + "_sub", y3, S1_J2, y3),
            c.call(prefixField + "_add", z1, z2, z3),
            c.call(prefixField + "_square", z3, z3),
            c.call(prefixField + "_sub", z3, Z1Z1, z3),
            c.call(prefixField + "_sub", z3, Z2Z2, z3),
            c.call(prefixField + "_mul", z3, H, z3)
          );
        }
        function buildAddMixed() {
          const f = module2.addFunction(prefix + "_addMixed");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          f.addLocal("z1", "i32");
          const c = f.getCodeBuilder();
          const x1 = c.getLocal("p1");
          const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
          const z1 = c.getLocal("z1");
          const x2 = c.getLocal("p2");
          const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const Z1Z1 = c.i32_const(module2.alloc(n8));
          const U2 = c.i32_const(module2.alloc(n8));
          const Z1_cubed = c.i32_const(module2.alloc(n8));
          const S2 = c.i32_const(module2.alloc(n8));
          const H = c.i32_const(module2.alloc(n8));
          const HH = c.i32_const(module2.alloc(n8));
          const S2_minus_y1 = c.i32_const(module2.alloc(n8));
          const I = c.i32_const(module2.alloc(n8));
          const J = c.i32_const(module2.alloc(n8));
          const r = c.i32_const(module2.alloc(n8));
          const r2 = c.i32_const(module2.alloc(n8));
          const V = c.i32_const(module2.alloc(n8));
          const V2 = c.i32_const(module2.alloc(n8));
          const y1_J2 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              [
                ...c.call(prefix + "_copyAffine", c.getLocal("p2"), c.getLocal("pr")),
                ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
              [
                ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefixField + "_isOne", z1),
              [
                ...c.call(prefix + "_addAffine", x1, x2, x3),
                ...c.ret([])
              ]
            ),
            c.call(prefixField + "_square", z1, Z1Z1),
            c.call(prefixField + "_mul", x2, Z1Z1, U2),
            c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
            c.call(prefixField + "_mul", y2, Z1_cubed, S2),
            c.if(
              c.call(prefixField + "_eq", x1, U2),
              c.if(
                c.call(prefixField + "_eq", y1, S2),
                [
                  ...c.call(prefix + "_doubleAffine", c.getLocal("p2"), c.getLocal("pr")),
                  ...c.ret([])
                ]
              )
            ),
            c.call(prefixField + "_sub", U2, x1, H),
            c.call(prefixField + "_sub", S2, y1, S2_minus_y1),
            c.call(prefixField + "_square", H, HH),
            c.call(prefixField + "_add", HH, HH, I),
            c.call(prefixField + "_add", I, I, I),
            c.call(prefixField + "_mul", H, I, J),
            c.call(prefixField + "_add", S2_minus_y1, S2_minus_y1, r),
            c.call(prefixField + "_mul", x1, I, V),
            c.call(prefixField + "_square", r, r2),
            c.call(prefixField + "_add", V, V, V2),
            c.call(prefixField + "_sub", r2, J, x3),
            c.call(prefixField + "_sub", x3, V2, x3),
            c.call(prefixField + "_mul", y1, J, y1_J2),
            c.call(prefixField + "_add", y1_J2, y1_J2, y1_J2),
            c.call(prefixField + "_sub", V, x3, y3),
            c.call(prefixField + "_mul", y3, r, y3),
            c.call(prefixField + "_sub", y3, y1_J2, y3),
            c.call(prefixField + "_add", z1, H, z3),
            c.call(prefixField + "_square", z3, z3),
            c.call(prefixField + "_sub", z3, Z1Z1, z3),
            c.call(prefixField + "_sub", z3, HH, z3)
          );
        }
        function buildAddAffine() {
          const f = module2.addFunction(prefix + "_addAffine");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          f.addLocal("z1", "i32");
          const c = f.getCodeBuilder();
          const x1 = c.getLocal("p1");
          const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
          const x2 = c.getLocal("p2");
          const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const H = c.i32_const(module2.alloc(n8));
          const HH = c.i32_const(module2.alloc(n8));
          const y2_minus_y1 = c.i32_const(module2.alloc(n8));
          const I = c.i32_const(module2.alloc(n8));
          const J = c.i32_const(module2.alloc(n8));
          const r = c.i32_const(module2.alloc(n8));
          const r2 = c.i32_const(module2.alloc(n8));
          const V = c.i32_const(module2.alloc(n8));
          const V2 = c.i32_const(module2.alloc(n8));
          const y1_J2 = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
              [
                ...c.call(prefix + "_copyAffine", c.getLocal("p2"), c.getLocal("pr")),
                ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
              [
                ...c.call(prefix + "_copyAffine", c.getLocal("p1"), c.getLocal("pr")),
                ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
                ...c.ret([])
              ]
            ),
            c.if(
              c.call(prefixField + "_eq", x1, x2),
              c.if(
                c.call(prefixField + "_eq", y1, y2),
                [
                  ...c.call(prefix + "_doubleAffine", c.getLocal("p2"), c.getLocal("pr")),
                  ...c.ret([])
                ]
              )
            ),
            c.call(prefixField + "_sub", x2, x1, H),
            c.call(prefixField + "_sub", y2, y1, y2_minus_y1),
            c.call(prefixField + "_square", H, HH),
            c.call(prefixField + "_add", HH, HH, I),
            c.call(prefixField + "_add", I, I, I),
            c.call(prefixField + "_mul", H, I, J),
            c.call(prefixField + "_add", y2_minus_y1, y2_minus_y1, r),
            c.call(prefixField + "_mul", x1, I, V),
            c.call(prefixField + "_square", r, r2),
            c.call(prefixField + "_add", V, V, V2),
            c.call(prefixField + "_sub", r2, J, x3),
            c.call(prefixField + "_sub", x3, V2, x3),
            c.call(prefixField + "_mul", y1, J, y1_J2),
            c.call(prefixField + "_add", y1_J2, y1_J2, y1_J2),
            c.call(prefixField + "_sub", V, x3, y3),
            c.call(prefixField + "_mul", y3, r, y3),
            c.call(prefixField + "_sub", y3, y1_J2, y3),
            c.call(prefixField + "_add", H, H, z3)
          );
        }
        function buildNeg() {
          const f = module2.addFunction(prefix + "_neg");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          f.addCode(
            c.call(prefixField + "_copy", x, x3),
            c.call(prefixField + "_neg", y, y3),
            c.call(prefixField + "_copy", z, z3)
          );
        }
        function buildNegAffine() {
          const f = module2.addFunction(prefix + "_negAffine");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          f.addCode(
            c.call(prefixField + "_copy", x, x3),
            c.call(prefixField + "_neg", y, y3)
          );
        }
        function buildSub() {
          const f = module2.addFunction(prefix + "_sub");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8 * 3));
          f.addCode(
            c.call(prefix + "_neg", c.getLocal("p2"), AUX),
            c.call(prefix + "_add", c.getLocal("p1"), AUX, c.getLocal("pr"))
          );
        }
        function buildSubMixed() {
          const f = module2.addFunction(prefix + "_subMixed");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8 * 3));
          f.addCode(
            c.call(prefix + "_negAffine", c.getLocal("p2"), AUX),
            c.call(prefix + "_addMixed", c.getLocal("p1"), AUX, c.getLocal("pr"))
          );
        }
        function buildSubAffine() {
          const f = module2.addFunction(prefix + "_subAffine");
          f.addParam("p1", "i32");
          f.addParam("p2", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8 * 3));
          f.addCode(
            c.call(prefix + "_negAffine", c.getLocal("p2"), AUX),
            c.call(prefix + "_addAffine", c.getLocal("p1"), AUX, c.getLocal("pr"))
          );
        }
        function buildNormalize() {
          const f = module2.addFunction(prefix + "_normalize");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          const Z_inv = c.i32_const(module2.alloc(n8));
          const Z2_inv = c.i32_const(module2.alloc(n8));
          const Z3_inv = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              c.call(prefix + "_zero", c.getLocal("pr")),
              [
                ...c.call(prefixField + "_inverse", z, Z_inv),
                ...c.call(prefixField + "_square", Z_inv, Z2_inv),
                ...c.call(prefixField + "_mul", Z_inv, Z2_inv, Z3_inv),
                ...c.call(prefixField + "_mul", x, Z2_inv, x3),
                ...c.call(prefixField + "_mul", y, Z3_inv, y3),
                ...c.call(prefixField + "_one", z3)
              ]
            )
          );
        }
        function buildToAffine() {
          const f = module2.addFunction(prefix + "_toAffine");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const Z_inv = c.i32_const(module2.alloc(n8));
          const Z2_inv = c.i32_const(module2.alloc(n8));
          const Z3_inv = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("p1")),
              [
                ...c.call(prefixField + "_zero", x3),
                ...c.call(prefixField + "_zero", y3)
              ],
              [
                ...c.call(prefixField + "_inverse", z, Z_inv),
                ...c.call(prefixField + "_square", Z_inv, Z2_inv),
                ...c.call(prefixField + "_mul", Z_inv, Z2_inv, Z3_inv),
                ...c.call(prefixField + "_mul", x, Z2_inv, x3),
                ...c.call(prefixField + "_mul", y, Z3_inv, y3)
              ]
            )
          );
        }
        function buildToJacobian() {
          const f = module2.addFunction(prefix + "_toJacobian");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
          f.addCode(
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
              c.call(prefix + "_zero", c.getLocal("pr")),
              [
                ...c.call(prefixField + "_one", z3),
                ...c.call(prefixField + "_copy", y, y3),
                ...c.call(prefixField + "_copy", x, x3)
              ]
            )
          );
        }
        function buildBatchToAffine() {
          const f = module2.addFunction(prefix + "_batchToAffine");
          f.addParam("pIn", "i32");
          f.addParam("n", "i32");
          f.addParam("pOut", "i32");
          f.addLocal("pAux", "i32");
          f.addLocal("itIn", "i32");
          f.addLocal("itAux", "i32");
          f.addLocal("itOut", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const tmp = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.setLocal("pAux", c.i32_load(c.i32_const(0))),
            c.i32_store(
              c.i32_const(0),
              c.i32_add(
                c.getLocal("pAux"),
                c.i32_mul(c.getLocal("n"), c.i32_const(n8))
              )
            ),
            c.call(
              prefixField + "_batchInverse",
              c.i32_add(c.getLocal("pIn"), c.i32_const(n8 * 2)),
              c.i32_const(n8 * 3),
              c.getLocal("n"),
              c.getLocal("pAux"),
              c.i32_const(n8)
            ),
            c.setLocal("itIn", c.getLocal("pIn")),
            c.setLocal("itAux", c.getLocal("pAux")),
            c.setLocal("itOut", c.getLocal("pOut")),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
              c.if(
                c.call(prefixField + "_isZero", c.getLocal("itAux")),
                [
                  ...c.call(prefixField + "_zero", c.getLocal("itOut")),
                  ...c.call(prefixField + "_zero", c.i32_add(c.getLocal("itOut"), c.i32_const(n8)))
                ],
                [
                  ...c.call(
                    prefixField + "_mul",
                    c.getLocal("itAux"),
                    c.i32_add(c.getLocal("itIn"), c.i32_const(n8)),
                    tmp
                  ),
                  ...c.call(
                    prefixField + "_square",
                    c.getLocal("itAux"),
                    c.getLocal("itAux")
                  ),
                  ...c.call(
                    prefixField + "_mul",
                    c.getLocal("itAux"),
                    c.getLocal("itIn"),
                    c.getLocal("itOut")
                  ),
                  ...c.call(
                    prefixField + "_mul",
                    c.getLocal("itAux"),
                    tmp,
                    c.i32_add(c.getLocal("itOut"), c.i32_const(n8))
                  )
                ]
              ),
              c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(n8 * 3))),
              c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(n8 * 2))),
              c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            )),
            c.i32_store(
              c.i32_const(0),
              c.getLocal("pAux")
            )
          );
        }
        function buildReverseBytes() {
          const f = module2.addFunction(prefix + "__reverseBytes");
          f.addParam("pIn", "i32");
          f.addParam("n", "i32");
          f.addParam("pOut", "i32");
          f.addLocal("itOut", "i32");
          f.addLocal("itIn", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal(
              "itOut",
              c.i32_sub(
                c.i32_add(
                  c.getLocal("pOut"),
                  c.getLocal("n")
                ),
                c.i32_const(1)
              )
            ),
            c.setLocal(
              "itIn",
              c.getLocal("pIn")
            ),
            c.block(c.loop(
              c.br_if(1, c.i32_lt_s(c.getLocal("itOut"), c.getLocal("pOut"))),
              c.i32_store8(
                c.getLocal("itOut"),
                c.i32_load8_u(c.getLocal("itIn"))
              ),
              c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(1))),
              c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildLEMtoC() {
          const f = module2.addFunction(prefix + "_LEMtoC");
          f.addParam("pIn", "i32");
          f.addParam("pOut", "i32");
          const c = f.getCodeBuilder();
          const tmp = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.if(
              c.call(prefix + "_isZero", c.getLocal("pIn")),
              [
                ...c.call(prefixField + "_zero", c.getLocal("pOut")),
                ...c.i32_store8(
                  c.getLocal("pOut"),
                  c.i32_const(64)
                ),
                ...c.ret([])
              ]
            ),
            c.call(prefixField + "_fromMontgomery", c.getLocal("pIn"), tmp),
            c.call(prefix + "__reverseBytes", tmp, c.i32_const(n8), c.getLocal("pOut")),
            c.if(
              c.i32_eq(
                c.call(prefixField + "_sign", c.i32_add(c.getLocal("pIn"), c.i32_const(n8))),
                c.i32_const(-1)
              ),
              c.i32_store8(
                c.getLocal("pOut"),
                c.i32_or(
                  c.i32_load8_u(c.getLocal("pOut")),
                  c.i32_const(128)
                )
              )
            )
          );
        }
        function buildLEMtoU() {
          const f = module2.addFunction(prefix + "_LEMtoU");
          f.addParam("pIn", "i32");
          f.addParam("pOut", "i32");
          const c = f.getCodeBuilder();
          const pTmp = module2.alloc(n8 * 2);
          const tmp = c.i32_const(pTmp);
          const tmpX = c.i32_const(pTmp);
          const tmpY = c.i32_const(pTmp + n8);
          f.addCode(
            c.if(
              c.call(prefix + "_isZeroAffine", c.getLocal("pIn")),
              [
                ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
                ...c.i32_store8(
                  c.getLocal("pOut"),
                  c.i32_const(64)
                ),
                ...c.ret([])
              ]
            ),
            c.call(prefix + "_fromMontgomeryAffine", c.getLocal("pIn"), tmp),
            c.call(prefix + "__reverseBytes", tmpX, c.i32_const(n8), c.getLocal("pOut")),
            c.call(prefix + "__reverseBytes", tmpY, c.i32_const(n8), c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
          );
        }
        function buildUtoLEM() {
          const f = module2.addFunction(prefix + "_UtoLEM");
          f.addParam("pIn", "i32");
          f.addParam("pOut", "i32");
          const c = f.getCodeBuilder();
          const pTmp = module2.alloc(n8 * 2);
          const tmp = c.i32_const(pTmp);
          const tmpX = c.i32_const(pTmp);
          const tmpY = c.i32_const(pTmp + n8);
          f.addCode(
            c.if(
              c.i32_and(c.i32_load8_u(c.getLocal("pIn")), c.i32_const(64)),
              [
                ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
                ...c.ret([])
              ]
            ),
            c.call(prefix + "__reverseBytes", c.getLocal("pIn"), c.i32_const(n8), tmpX),
            c.call(prefix + "__reverseBytes", c.i32_add(c.getLocal("pIn"), c.i32_const(n8)), c.i32_const(n8), tmpY),
            c.call(prefix + "_toMontgomeryAffine", tmp, c.getLocal("pOut"))
          );
        }
        function buildCtoLEM() {
          const f = module2.addFunction(prefix + "_CtoLEM");
          f.addParam("pIn", "i32");
          f.addParam("pOut", "i32");
          f.addLocal("firstByte", "i32");
          f.addLocal("greatest", "i32");
          const c = f.getCodeBuilder();
          const pTmp = module2.alloc(n8 * 2);
          const tmpX = c.i32_const(pTmp);
          const tmpY = c.i32_const(pTmp + n8);
          f.addCode(
            c.setLocal("firstByte", c.i32_load8_u(c.getLocal("pIn"))),
            c.if(
              c.i32_and(
                c.getLocal("firstByte"),
                c.i32_const(64)
              ),
              [
                ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
                ...c.ret([])
              ]
            ),
            c.setLocal(
              "greatest",
              c.i32_and(
                c.getLocal("firstByte"),
                c.i32_const(128)
              )
            ),
            c.call(prefixField + "_copy", c.getLocal("pIn"), tmpY),
            c.i32_store8(tmpY, c.i32_and(c.getLocal("firstByte"), c.i32_const(63))),
            c.call(prefix + "__reverseBytes", tmpY, c.i32_const(n8), tmpX),
            c.call(prefixField + "_toMontgomery", tmpX, c.getLocal("pOut")),
            c.call(prefixField + "_square", c.getLocal("pOut"), tmpY),
            c.call(prefixField + "_mul", c.getLocal("pOut"), tmpY, tmpY),
            c.call(prefixField + "_add", tmpY, c.i32_const(pB), tmpY),
            c.call(prefixField + "_sqrt", tmpY, tmpY),
            c.call(prefixField + "_neg", tmpY, tmpX),
            c.if(
              c.i32_eq(
                c.call(prefixField + "_sign", tmpY),
                c.i32_const(-1)
              ),
              c.if(
                c.getLocal("greatest"),
                c.call(prefixField + "_copy", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8))),
                c.call(prefixField + "_neg", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
              ),
              c.if(
                c.getLocal("greatest"),
                c.call(prefixField + "_neg", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8))),
                c.call(prefixField + "_copy", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
              )
            )
          );
        }
        function buildInCurveAffine() {
          const f = module2.addFunction(prefix + "_inCurveAffine");
          f.addParam("pIn", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("pIn");
          const y = c.i32_add(c.getLocal("pIn"), c.i32_const(n8));
          const y2 = c.i32_const(module2.alloc(n8));
          const x3b = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.call(prefixField + "_square", y, y2),
            c.call(prefixField + "_square", x, x3b),
            c.call(prefixField + "_mul", x, x3b, x3b),
            c.call(prefixField + "_add", x3b, c.i32_const(pB), x3b),
            c.ret(
              c.call(prefixField + "_eq", y2, x3b)
            )
          );
        }
        function buildInCurve() {
          const f = module2.addFunction(prefix + "_inCurve");
          f.addParam("pIn", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const aux = c.i32_const(module2.alloc(n8 * 2));
          f.addCode(
            c.call(prefix + "_toAffine", c.getLocal("pIn"), aux),
            c.ret(
              c.call(prefix + "_inCurveAffine", aux)
            )
          );
        }
        buildIsZeroAffine();
        buildIsZero();
        buildZeroAffine();
        buildZero();
        buildCopyAffine();
        buildCopy();
        buildToJacobian();
        buildEqAffine();
        buildEqMixed();
        buildEq();
        buildDoubleAffine();
        buildDouble();
        buildAddAffine();
        buildAddMixed();
        buildAdd();
        buildNegAffine();
        buildNeg();
        buildSubAffine();
        buildSubMixed();
        buildSub();
        buildFromMontgomeryAffine();
        buildFromMontgomery();
        buildToMontgomeryAffine();
        buildToMontgomery();
        buildToAffine();
        buildInCurveAffine();
        buildInCurve();
        buildBatchToAffine();
        buildNormalize();
        buildReverseBytes();
        buildLEMtoU();
        buildLEMtoC();
        buildUtoLEM();
        buildCtoLEM();
        buildBatchConvertion(module2, prefix + "_batchLEMtoU", prefix + "_LEMtoU", n8 * 2, n8 * 2);
        buildBatchConvertion(module2, prefix + "_batchLEMtoC", prefix + "_LEMtoC", n8 * 2, n8);
        buildBatchConvertion(module2, prefix + "_batchUtoLEM", prefix + "_UtoLEM", n8 * 2, n8 * 2);
        buildBatchConvertion(module2, prefix + "_batchCtoLEM", prefix + "_CtoLEM", n8, n8 * 2, true);
        buildBatchConvertion(module2, prefix + "_batchToJacobian", prefix + "_toJacobian", n8 * 2, n8 * 3, true);
        buildMultiexp2(module2, prefix, prefix + "_multiexp", prefix + "_add", n8 * 3);
        buildMultiexp2(module2, prefix, prefix + "_multiexpAffine", prefix + "_addMixed", n8 * 2);
        buildTimesScalarNAF(
          module2,
          prefix + "_timesScalar",
          n8 * 3,
          prefix + "_add",
          prefix + "_double",
          prefix + "_sub",
          prefix + "_copy",
          prefix + "_zero"
        );
        buildTimesScalarNAF(
          module2,
          prefix + "_timesScalarAffine",
          n8 * 2,
          prefix + "_addMixed",
          prefix + "_double",
          prefix + "_subMixed",
          prefix + "_copyAffine",
          prefix + "_zero"
        );
        module2.exportFunction(prefix + "_isZero");
        module2.exportFunction(prefix + "_isZeroAffine");
        module2.exportFunction(prefix + "_eq");
        module2.exportFunction(prefix + "_eqMixed");
        module2.exportFunction(prefix + "_eqAffine");
        module2.exportFunction(prefix + "_copy");
        module2.exportFunction(prefix + "_copyAffine");
        module2.exportFunction(prefix + "_zero");
        module2.exportFunction(prefix + "_zeroAffine");
        module2.exportFunction(prefix + "_double");
        module2.exportFunction(prefix + "_doubleAffine");
        module2.exportFunction(prefix + "_add");
        module2.exportFunction(prefix + "_addMixed");
        module2.exportFunction(prefix + "_addAffine");
        module2.exportFunction(prefix + "_neg");
        module2.exportFunction(prefix + "_negAffine");
        module2.exportFunction(prefix + "_sub");
        module2.exportFunction(prefix + "_subMixed");
        module2.exportFunction(prefix + "_subAffine");
        module2.exportFunction(prefix + "_fromMontgomery");
        module2.exportFunction(prefix + "_fromMontgomeryAffine");
        module2.exportFunction(prefix + "_toMontgomery");
        module2.exportFunction(prefix + "_toMontgomeryAffine");
        module2.exportFunction(prefix + "_timesScalar");
        module2.exportFunction(prefix + "_timesScalarAffine");
        module2.exportFunction(prefix + "_normalize");
        module2.exportFunction(prefix + "_LEMtoU");
        module2.exportFunction(prefix + "_LEMtoC");
        module2.exportFunction(prefix + "_UtoLEM");
        module2.exportFunction(prefix + "_CtoLEM");
        module2.exportFunction(prefix + "_batchLEMtoU");
        module2.exportFunction(prefix + "_batchLEMtoC");
        module2.exportFunction(prefix + "_batchUtoLEM");
        module2.exportFunction(prefix + "_batchCtoLEM");
        module2.exportFunction(prefix + "_toAffine");
        module2.exportFunction(prefix + "_toJacobian");
        module2.exportFunction(prefix + "_batchToAffine");
        module2.exportFunction(prefix + "_batchToJacobian");
        module2.exportFunction(prefix + "_inCurve");
        module2.exportFunction(prefix + "_inCurveAffine");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_fft.js
  var require_build_fft = __commonJS({
    "node_modules/wasmcurves/src/build_fft.js"(exports, module) {
      var { isOdd: isOdd2, modInv, modPow } = require_bigint();
      var utils = require_utils();
      module.exports = function buildFFT2(module2, prefix, gPrefix, fPrefix, opGtimesF) {
        const n64f = module2.modules[fPrefix].n64;
        const n8f = n64f * 8;
        const n64g = module2.modules[gPrefix].n64;
        const n8g = n64g * 8;
        const q = module2.modules[fPrefix].q;
        let rem = q - 1n;
        let maxBits = 0;
        while (!isOdd2(rem)) {
          maxBits++;
          rem = rem >> 1n;
        }
        let nr = 2n;
        while (modPow(nr, q >> 1n, q) === 1n)
          nr = nr + 1n;
        const w = new Array(maxBits + 1);
        w[maxBits] = modPow(nr, rem, q);
        let n = maxBits - 1;
        while (n >= 0) {
          w[n] = modPow(w[n + 1], 2n, q);
          n--;
        }
        const bytes = [];
        const R = (1n << BigInt(n8f * 8)) % q;
        for (let i = 0; i < w.length; i++) {
          const m = w[i] * R % q;
          bytes.push(...utils.bigInt2BytesLE(m, n8f));
        }
        const ROOTs = module2.alloc(bytes);
        const i2 = new Array(maxBits + 1);
        i2[0] = 1n;
        for (let i = 1; i <= maxBits; i++) {
          i2[i] = i2[i - 1] * 2n;
        }
        const bytesi2 = [];
        for (let i = 0; i <= maxBits; i++) {
          const m = modInv(i2[i], q) * R % q;
          bytesi2.push(...utils.bigInt2BytesLE(m, n8f));
        }
        const INV2 = module2.alloc(bytesi2);
        const shift = modPow(nr, 2n, q);
        const bytesShiftToSmallM = [];
        const bytesSConst = [];
        for (let i = 0; i <= maxBits; i++) {
          const shiftToSmallM = modPow(shift, 2n ** BigInt(i), q);
          const sConst = modInv(q + 1n - shiftToSmallM, q);
          bytesShiftToSmallM.push(...utils.bigInt2BytesLE(shiftToSmallM * R % q, n8f));
          bytesSConst.push(...utils.bigInt2BytesLE(sConst * R % q, n8f));
        }
        const SHIFT_TO_M = module2.alloc(bytesShiftToSmallM);
        const SCONST = module2.alloc(bytesSConst);
        function rev(x) {
          let r = 0;
          for (let i = 0; i < 8; i++) {
            if (x & 1 << i) {
              r = r | 128 >> i;
            }
          }
          return r;
        }
        const rtable = Array(256);
        for (let i = 0; i < 256; i++) {
          rtable[i] = rev(i);
        }
        const REVTABLE = module2.alloc(rtable);
        function buildLog2() {
          const f = module2.addFunction(prefix + "__log2");
          f.addParam("n", "i32");
          f.setReturnType("i32");
          f.addLocal("bits", "i32");
          f.addLocal("aux", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal(
              "aux",
              c.i32_shr_u(
                c.getLocal("n"),
                c.i32_const(1)
              )
            )
          );
          f.addCode(c.setLocal("bits", c.i32_const(0)));
          f.addCode(c.block(c.loop(
            c.br_if(
              1,
              c.i32_eqz(c.getLocal("aux"))
            ),
            c.setLocal(
              "aux",
              c.i32_shr_u(
                c.getLocal("aux"),
                c.i32_const(1)
              )
            ),
            c.setLocal(
              "bits",
              c.i32_add(
                c.getLocal("bits"),
                c.i32_const(1)
              )
            ),
            c.br(0)
          )));
          f.addCode(c.if(
            c.i32_ne(
              c.getLocal("n"),
              c.i32_shl(
                c.i32_const(1),
                c.getLocal("bits")
              )
            ),
            c.unreachable()
          ));
          f.addCode(c.if(
            c.i32_gt_u(
              c.getLocal("bits"),
              c.i32_const(maxBits)
            ),
            c.unreachable()
          ));
          f.addCode(c.getLocal("bits"));
        }
        function buildFFT3() {
          const f = module2.addFunction(prefix + "_fft");
          f.addParam("px", "i32");
          f.addParam("n", "i32");
          f.addLocal("bits", "i32");
          const c = f.getCodeBuilder();
          const One = c.i32_const(module2.alloc(n8f));
          f.addCode(
            c.setLocal(
              "bits",
              c.call(
                prefix + "__log2",
                c.getLocal("n")
              )
            ),
            c.call(fPrefix + "_one", One),
            c.call(
              prefix + "_rawfft",
              c.getLocal("px"),
              c.getLocal("bits"),
              c.i32_const(0),
              One
            )
          );
        }
        function buildIFFT() {
          const f = module2.addFunction(prefix + "_ifft");
          f.addParam("px", "i32");
          f.addParam("n", "i32");
          f.addLocal("bits", "i32");
          f.addLocal("pInv2", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal(
              "bits",
              c.call(
                prefix + "__log2",
                c.getLocal("n")
              )
            ),
            c.setLocal(
              "pInv2",
              c.i32_add(
                c.i32_const(INV2),
                c.i32_mul(
                  c.getLocal("bits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.call(
              prefix + "_rawfft",
              c.getLocal("px"),
              c.getLocal("bits"),
              c.i32_const(1),
              c.getLocal("pInv2")
            )
          );
        }
        function buildRawFFT() {
          const f = module2.addFunction(prefix + "_rawfft");
          f.addParam("px", "i32");
          f.addParam("bits", "i32");
          f.addParam("reverse", "i32");
          f.addParam("mulFactor", "i32");
          f.addLocal("s", "i32");
          f.addLocal("k", "i32");
          f.addLocal("j", "i32");
          f.addLocal("m", "i32");
          f.addLocal("mdiv2", "i32");
          f.addLocal("n", "i32");
          f.addLocal("pwm", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const T = c.i32_const(module2.alloc(n8g));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.call(prefix + "__reversePermutation", c.getLocal("px"), c.getLocal("bits")),
            c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
            c.setLocal("s", c.i32_const(1)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_gt_u(
                  c.getLocal("s"),
                  c.getLocal("bits")
                )
              ),
              c.setLocal("m", c.i32_shl(c.i32_const(1), c.getLocal("s"))),
              c.setLocal(
                "pwm",
                c.i32_add(
                  c.i32_const(ROOTs),
                  c.i32_mul(
                    c.getLocal("s"),
                    c.i32_const(n8f)
                  )
                )
              ),
              c.setLocal("k", c.i32_const(0)),
              c.block(c.loop(
                c.br_if(
                  1,
                  c.i32_ge_u(
                    c.getLocal("k"),
                    c.getLocal("n")
                  )
                ),
                c.call(fPrefix + "_one", W),
                c.setLocal("mdiv2", c.i32_shr_u(c.getLocal("m"), c.i32_const(1))),
                c.setLocal("j", c.i32_const(0)),
                c.block(c.loop(
                  c.br_if(
                    1,
                    c.i32_ge_u(
                      c.getLocal("j"),
                      c.getLocal("mdiv2")
                    )
                  ),
                  c.setLocal(
                    "idx1",
                    c.i32_add(
                      c.getLocal("px"),
                      c.i32_mul(
                        c.i32_add(
                          c.getLocal("k"),
                          c.getLocal("j")
                        ),
                        c.i32_const(n8g)
                      )
                    )
                  ),
                  c.setLocal(
                    "idx2",
                    c.i32_add(
                      c.getLocal("idx1"),
                      c.i32_mul(
                        c.getLocal("mdiv2"),
                        c.i32_const(n8g)
                      )
                    )
                  ),
                  c.call(
                    opGtimesF,
                    c.getLocal("idx2"),
                    W,
                    T
                  ),
                  c.call(
                    gPrefix + "_copy",
                    c.getLocal("idx1"),
                    U
                  ),
                  c.call(
                    gPrefix + "_add",
                    U,
                    T,
                    c.getLocal("idx1")
                  ),
                  c.call(
                    gPrefix + "_sub",
                    U,
                    T,
                    c.getLocal("idx2")
                  ),
                  c.call(
                    fPrefix + "_mul",
                    W,
                    c.getLocal("pwm"),
                    W
                  ),
                  c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                  c.br(0)
                )),
                c.setLocal("k", c.i32_add(c.getLocal("k"), c.getLocal("m"))),
                c.br(0)
              )),
              c.setLocal("s", c.i32_add(c.getLocal("s"), c.i32_const(1))),
              c.br(0)
            )),
            c.call(
              prefix + "__fftFinal",
              c.getLocal("px"),
              c.getLocal("bits"),
              c.getLocal("reverse"),
              c.getLocal("mulFactor")
            )
          );
        }
        function buildFinalInverse() {
          const f = module2.addFunction(prefix + "__fftFinal");
          f.addParam("px", "i32");
          f.addParam("bits", "i32");
          f.addParam("reverse", "i32");
          f.addParam("mulFactor", "i32");
          f.addLocal("n", "i32");
          f.addLocal("ndiv2", "i32");
          f.addLocal("pInv2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("mask", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          const c = f.getCodeBuilder();
          const T = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.if(
              c.i32_and(
                c.i32_eqz(c.getLocal("reverse")),
                c.call(fPrefix + "_isOne", c.getLocal("mulFactor"))
              ),
              c.ret([])
            ),
            c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
            c.setLocal("mask", c.i32_sub(c.getLocal("n"), c.i32_const(1))),
            c.setLocal("i", c.i32_const(1)),
            c.setLocal(
              "ndiv2",
              c.i32_shr_u(
                c.getLocal("n"),
                c.i32_const(1)
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_ge_u(
                  c.getLocal("i"),
                  c.getLocal("ndiv2")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("px"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("px"),
                  c.i32_mul(
                    c.i32_sub(
                      c.getLocal("n"),
                      c.getLocal("i")
                    ),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.if(
                c.getLocal("reverse"),
                c.if(
                  c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
                  [
                    ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
                    ...c.call(gPrefix + "_copy", c.getLocal("idx2"), c.getLocal("idx1")),
                    ...c.call(gPrefix + "_copy", T, c.getLocal("idx2"))
                  ],
                  [
                    ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
                    ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx1")),
                    ...c.call(opGtimesF, T, c.getLocal("mulFactor"), c.getLocal("idx2"))
                  ]
                ),
                c.if(
                  c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
                  [],
                  [
                    ...c.call(opGtimesF, c.getLocal("idx1"), c.getLocal("mulFactor"), c.getLocal("idx1")),
                    ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx2"))
                  ]
                )
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            )),
            c.if(
              c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
              [],
              [
                ...c.call(opGtimesF, c.getLocal("px"), c.getLocal("mulFactor"), c.getLocal("px")),
                ...c.setLocal(
                  "idx2",
                  c.i32_add(
                    c.getLocal("px"),
                    c.i32_mul(
                      c.getLocal("ndiv2"),
                      c.i32_const(n8g)
                    )
                  )
                ),
                ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx2"))
              ]
            )
          );
        }
        function buildReversePermutation() {
          const f = module2.addFunction(prefix + "__reversePermutation");
          f.addParam("px", "i32");
          f.addParam("bits", "i32");
          f.addLocal("n", "i32");
          f.addLocal("i", "i32");
          f.addLocal("ri", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          const c = f.getCodeBuilder();
          const T = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("n")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("px"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal("ri", c.call(prefix + "__rev", c.getLocal("i"), c.getLocal("bits"))),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("px"),
                  c.i32_mul(
                    c.getLocal("ri"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.if(
                c.i32_lt_u(
                  c.getLocal("i"),
                  c.getLocal("ri")
                ),
                [
                  ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
                  ...c.call(gPrefix + "_copy", c.getLocal("idx2"), c.getLocal("idx1")),
                  ...c.call(gPrefix + "_copy", T, c.getLocal("idx2"))
                ]
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildRev() {
          const f = module2.addFunction(prefix + "__rev");
          f.addParam("x", "i32");
          f.addParam("bits", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.i32_rotl(
              c.i32_add(
                c.i32_add(
                  c.i32_shl(
                    c.i32_load8_u(
                      c.i32_and(
                        c.getLocal("x"),
                        c.i32_const(255)
                      ),
                      REVTABLE,
                      0
                    ),
                    c.i32_const(24)
                  ),
                  c.i32_shl(
                    c.i32_load8_u(
                      c.i32_and(
                        c.i32_shr_u(
                          c.getLocal("x"),
                          c.i32_const(8)
                        ),
                        c.i32_const(255)
                      ),
                      REVTABLE,
                      0
                    ),
                    c.i32_const(16)
                  )
                ),
                c.i32_add(
                  c.i32_shl(
                    c.i32_load8_u(
                      c.i32_and(
                        c.i32_shr_u(
                          c.getLocal("x"),
                          c.i32_const(16)
                        ),
                        c.i32_const(255)
                      ),
                      REVTABLE,
                      0
                    ),
                    c.i32_const(8)
                  ),
                  c.i32_load8_u(
                    c.i32_and(
                      c.i32_shr_u(
                        c.getLocal("x"),
                        c.i32_const(24)
                      ),
                      c.i32_const(255)
                    ),
                    REVTABLE,
                    0
                  )
                )
              ),
              c.getLocal("bits")
            )
          );
        }
        function buildFFTJoin() {
          const f = module2.addFunction(prefix + "_fftJoin");
          f.addParam("pBuff1", "i32");
          f.addParam("pBuff2", "i32");
          f.addParam("n", "i32");
          f.addParam("first", "i32");
          f.addParam("inc", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const T = c.i32_const(module2.alloc(n8g));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.call(fPrefix + "_copy", c.getLocal("first"), W),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("n")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("pBuff1"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("pBuff2"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                W,
                T
              ),
              c.call(
                gPrefix + "_copy",
                c.getLocal("idx1"),
                U
              ),
              c.call(
                gPrefix + "_add",
                U,
                T,
                c.getLocal("idx1")
              ),
              c.call(
                gPrefix + "_sub",
                U,
                T,
                c.getLocal("idx2")
              ),
              c.call(
                fPrefix + "_mul",
                W,
                c.getLocal("inc"),
                W
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildFFTJoinExt() {
          const f = module2.addFunction(prefix + "_fftJoinExt");
          f.addParam("pBuff1", "i32");
          f.addParam("pBuff2", "i32");
          f.addParam("n", "i32");
          f.addParam("first", "i32");
          f.addParam("inc", "i32");
          f.addParam("totalBits", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("pShiftToM", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal(
              "pShiftToM",
              c.i32_add(
                c.i32_const(SHIFT_TO_M),
                c.i32_mul(
                  c.getLocal("totalBits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.call(fPrefix + "_copy", c.getLocal("first"), W),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("n")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("pBuff1"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("pBuff2"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.call(
                gPrefix + "_add",
                c.getLocal("idx1"),
                c.getLocal("idx2"),
                U
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                c.getLocal("pShiftToM"),
                c.getLocal("idx2")
              ),
              c.call(
                gPrefix + "_add",
                c.getLocal("idx1"),
                c.getLocal("idx2"),
                c.getLocal("idx2")
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                W,
                c.getLocal("idx2")
              ),
              c.call(
                gPrefix + "_copy",
                U,
                c.getLocal("idx1")
              ),
              c.call(
                fPrefix + "_mul",
                W,
                c.getLocal("inc"),
                W
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildFFTJoinExtInv() {
          const f = module2.addFunction(prefix + "_fftJoinExtInv");
          f.addParam("pBuff1", "i32");
          f.addParam("pBuff2", "i32");
          f.addParam("n", "i32");
          f.addParam("first", "i32");
          f.addParam("inc", "i32");
          f.addParam("totalBits", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("pShiftToM", "i32");
          f.addLocal("pSConst", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal(
              "pShiftToM",
              c.i32_add(
                c.i32_const(SHIFT_TO_M),
                c.i32_mul(
                  c.getLocal("totalBits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.setLocal(
              "pSConst",
              c.i32_add(
                c.i32_const(SCONST),
                c.i32_mul(
                  c.getLocal("totalBits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.call(fPrefix + "_copy", c.getLocal("first"), W),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("n")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("pBuff1"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("pBuff2"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                W,
                U
              ),
              c.call(
                gPrefix + "_sub",
                c.getLocal("idx1"),
                U,
                c.getLocal("idx2")
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                c.getLocal("pSConst"),
                c.getLocal("idx2")
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx1"),
                c.getLocal("pShiftToM"),
                c.getLocal("idx1")
              ),
              c.call(
                gPrefix + "_sub",
                U,
                c.getLocal("idx1"),
                c.getLocal("idx1")
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx1"),
                c.getLocal("pSConst"),
                c.getLocal("idx1")
              ),
              c.call(
                fPrefix + "_mul",
                W,
                c.getLocal("inc"),
                W
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildPrepareLagrangeEvaluation() {
          const f = module2.addFunction(prefix + "_prepareLagrangeEvaluation");
          f.addParam("pBuff1", "i32");
          f.addParam("pBuff2", "i32");
          f.addParam("n", "i32");
          f.addParam("first", "i32");
          f.addParam("inc", "i32");
          f.addParam("totalBits", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("pShiftToM", "i32");
          f.addLocal("pSConst", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal(
              "pShiftToM",
              c.i32_add(
                c.i32_const(SHIFT_TO_M),
                c.i32_mul(
                  c.getLocal("totalBits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.setLocal(
              "pSConst",
              c.i32_add(
                c.i32_const(SCONST),
                c.i32_mul(
                  c.getLocal("totalBits"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.call(fPrefix + "_copy", c.getLocal("first"), W),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("n")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("pBuff1"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("pBuff2"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx1"),
                c.getLocal("pShiftToM"),
                U
              ),
              c.call(
                gPrefix + "_sub",
                c.getLocal("idx2"),
                U,
                U
              ),
              c.call(
                gPrefix + "_sub",
                c.getLocal("idx1"),
                c.getLocal("idx2"),
                c.getLocal("idx2")
              ),
              c.call(
                opGtimesF,
                U,
                c.getLocal("pSConst"),
                c.getLocal("idx1")
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                W,
                c.getLocal("idx2")
              ),
              c.call(
                fPrefix + "_mul",
                W,
                c.getLocal("inc"),
                W
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildFFTMix() {
          const f = module2.addFunction(prefix + "_fftMix");
          f.addParam("pBuff", "i32");
          f.addParam("n", "i32");
          f.addParam("exp", "i32");
          f.addLocal("nGroups", "i32");
          f.addLocal("nPerGroup", "i32");
          f.addLocal("nPerGroupDiv2", "i32");
          f.addLocal("pairOffset", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          f.addLocal("pwm", "i32");
          const c = f.getCodeBuilder();
          const W = c.i32_const(module2.alloc(n8f));
          const T = c.i32_const(module2.alloc(n8g));
          const U = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal("nPerGroup", c.i32_shl(c.i32_const(1), c.getLocal("exp"))),
            c.setLocal("nPerGroupDiv2", c.i32_shr_u(c.getLocal("nPerGroup"), c.i32_const(1))),
            c.setLocal("nGroups", c.i32_shr_u(c.getLocal("n"), c.getLocal("exp"))),
            c.setLocal("pairOffset", c.i32_mul(c.getLocal("nPerGroupDiv2"), c.i32_const(n8g))),
            c.setLocal(
              "pwm",
              c.i32_add(
                c.i32_const(ROOTs),
                c.i32_mul(
                  c.getLocal("exp"),
                  c.i32_const(n8f)
                )
              )
            ),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("nGroups")
                )
              ),
              c.call(fPrefix + "_one", W),
              c.setLocal("j", c.i32_const(0)),
              c.block(c.loop(
                c.br_if(
                  1,
                  c.i32_eq(
                    c.getLocal("j"),
                    c.getLocal("nPerGroupDiv2")
                  )
                ),
                c.setLocal(
                  "idx1",
                  c.i32_add(
                    c.getLocal("pBuff"),
                    c.i32_mul(
                      c.i32_add(
                        c.i32_mul(
                          c.getLocal("i"),
                          c.getLocal("nPerGroup")
                        ),
                        c.getLocal("j")
                      ),
                      c.i32_const(n8g)
                    )
                  )
                ),
                c.setLocal(
                  "idx2",
                  c.i32_add(
                    c.getLocal("idx1"),
                    c.getLocal("pairOffset")
                  )
                ),
                c.call(
                  opGtimesF,
                  c.getLocal("idx2"),
                  W,
                  T
                ),
                c.call(
                  gPrefix + "_copy",
                  c.getLocal("idx1"),
                  U
                ),
                c.call(
                  gPrefix + "_add",
                  U,
                  T,
                  c.getLocal("idx1")
                ),
                c.call(
                  gPrefix + "_sub",
                  U,
                  T,
                  c.getLocal("idx2")
                ),
                c.call(
                  fPrefix + "_mul",
                  W,
                  c.getLocal("pwm"),
                  W
                ),
                c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                c.br(0)
              )),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildFFTFinal() {
          const f = module2.addFunction(prefix + "_fftFinal");
          f.addParam("pBuff", "i32");
          f.addParam("n", "i32");
          f.addParam("factor", "i32");
          f.addLocal("idx1", "i32");
          f.addLocal("idx2", "i32");
          f.addLocal("i", "i32");
          f.addLocal("ndiv2", "i32");
          const c = f.getCodeBuilder();
          const T = c.i32_const(module2.alloc(n8g));
          f.addCode(
            c.setLocal("ndiv2", c.i32_shr_u(c.getLocal("n"), c.i32_const(1))),
            c.if(
              c.i32_and(
                c.getLocal("n"),
                c.i32_const(1)
              ),
              c.call(
                opGtimesF,
                c.i32_add(
                  c.getLocal("pBuff"),
                  c.i32_mul(
                    c.getLocal("ndiv2"),
                    c.i32_const(n8g)
                  )
                ),
                c.getLocal("factor"),
                c.i32_add(
                  c.getLocal("pBuff"),
                  c.i32_mul(
                    c.getLocal("ndiv2"),
                    c.i32_const(n8g)
                  )
                )
              )
            ),
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_ge_u(
                  c.getLocal("i"),
                  c.getLocal("ndiv2")
                )
              ),
              c.setLocal(
                "idx1",
                c.i32_add(
                  c.getLocal("pBuff"),
                  c.i32_mul(
                    c.getLocal("i"),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.setLocal(
                "idx2",
                c.i32_add(
                  c.getLocal("pBuff"),
                  c.i32_mul(
                    c.i32_sub(
                      c.i32_sub(
                        c.getLocal("n"),
                        c.i32_const(1)
                      ),
                      c.getLocal("i")
                    ),
                    c.i32_const(n8g)
                  )
                )
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx2"),
                c.getLocal("factor"),
                T
              ),
              c.call(
                opGtimesF,
                c.getLocal("idx1"),
                c.getLocal("factor"),
                c.getLocal("idx2")
              ),
              c.call(
                gPrefix + "_copy",
                T,
                c.getLocal("idx1")
              ),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        buildRev();
        buildReversePermutation();
        buildFinalInverse();
        buildRawFFT();
        buildLog2();
        buildFFT3();
        buildIFFT();
        buildFFTJoin();
        buildFFTJoinExt();
        buildFFTJoinExtInv();
        buildFFTMix();
        buildFFTFinal();
        buildPrepareLagrangeEvaluation();
        module2.exportFunction(prefix + "_fft");
        module2.exportFunction(prefix + "_ifft");
        module2.exportFunction(prefix + "_rawfft");
        module2.exportFunction(prefix + "_fftJoin");
        module2.exportFunction(prefix + "_fftJoinExt");
        module2.exportFunction(prefix + "_fftJoinExtInv");
        module2.exportFunction(prefix + "_fftMix");
        module2.exportFunction(prefix + "_fftFinal");
        module2.exportFunction(prefix + "_prepareLagrangeEvaluation");
      };
    }
  });

  // node_modules/wasmcurves/src/build_pol.js
  var require_build_pol = __commonJS({
    "node_modules/wasmcurves/src/build_pol.js"(exports, module) {
      module.exports = function buildPol(module2, prefix, prefixField) {
        const n64 = module2.modules[prefixField].n64;
        const n8 = n64 * 8;
        function buildZero() {
          const f = module2.addFunction(prefix + "_zero");
          f.addParam("px", "i32");
          f.addParam("n", "i32");
          f.addLocal("lastp", "i32");
          f.addLocal("p", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal("p", c.getLocal("px")),
            c.setLocal(
              "lastp",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.getLocal("n"),
                  c.i32_const(n8)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("p"),
                  c.getLocal("lastp")
                )
              ),
              c.call(prefixField + "_zero", c.getLocal("p")),
              c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(n8))),
              c.br(0)
            ))
          );
        }
        function buildConstructLC() {
          const f = module2.addFunction(prefix + "_constructLC");
          f.addParam("ppolynomials", "i32");
          f.addParam("psignals", "i32");
          f.addParam("nSignals", "i32");
          f.addParam("pres", "i32");
          f.addLocal("i", "i32");
          f.addLocal("j", "i32");
          f.addLocal("pp", "i32");
          f.addLocal("ps", "i32");
          f.addLocal("pd", "i32");
          f.addLocal("ncoefs", "i32");
          const c = f.getCodeBuilder();
          const aux = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.setLocal("i", c.i32_const(0)),
            c.setLocal("pp", c.getLocal("ppolynomials")),
            c.setLocal("ps", c.getLocal("psignals")),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("i"),
                  c.getLocal("nSignals")
                )
              ),
              c.setLocal("ncoefs", c.i32_load(c.getLocal("pp"))),
              c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
              c.setLocal("j", c.i32_const(0)),
              c.block(c.loop(
                c.br_if(
                  1,
                  c.i32_eq(
                    c.getLocal("j"),
                    c.getLocal("ncoefs")
                  )
                ),
                c.setLocal(
                  "pd",
                  c.i32_add(
                    c.getLocal("pres"),
                    c.i32_mul(
                      c.i32_load(c.getLocal("pp")),
                      c.i32_const(n8)
                    )
                  )
                ),
                c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
                c.call(
                  prefixField + "_mul",
                  c.getLocal("ps"),
                  c.getLocal("pp"),
                  aux
                ),
                c.call(
                  prefixField + "_add",
                  aux,
                  c.getLocal("pd"),
                  c.getLocal("pd")
                ),
                c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(n8))),
                c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                c.br(0)
              )),
              c.setLocal("ps", c.i32_add(c.getLocal("ps"), c.i32_const(n8))),
              c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        buildZero();
        buildConstructLC();
        module2.exportFunction(prefix + "_zero");
        module2.exportFunction(prefix + "_constructLC");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_qap.js
  var require_build_qap = __commonJS({
    "node_modules/wasmcurves/src/build_qap.js"(exports, module) {
      module.exports = function buildQAP(module2, prefix, prefixField) {
        const n64 = module2.modules[prefixField].n64;
        const n8 = n64 * 8;
        function buildBuildABC() {
          const f = module2.addFunction(prefix + "_buildABC");
          f.addParam("pCoefs", "i32");
          f.addParam("nCoefs", "i32");
          f.addParam("pWitness", "i32");
          f.addParam("pA", "i32");
          f.addParam("pB", "i32");
          f.addParam("pC", "i32");
          f.addParam("offsetOut", "i32");
          f.addParam("nOut", "i32");
          f.addParam("offsetWitness", "i32");
          f.addParam("nWitness", "i32");
          f.addLocal("it", "i32");
          f.addLocal("ita", "i32");
          f.addLocal("itb", "i32");
          f.addLocal("last", "i32");
          f.addLocal("m", "i32");
          f.addLocal("c", "i32");
          f.addLocal("s", "i32");
          f.addLocal("pOut", "i32");
          const c = f.getCodeBuilder();
          const aux = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.setLocal("ita", c.getLocal("pA")),
            c.setLocal("itb", c.getLocal("pB")),
            c.setLocal(
              "last",
              c.i32_add(
                c.getLocal("pA"),
                c.i32_mul(
                  c.getLocal("nOut"),
                  c.i32_const(n8)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("ita"),
                  c.getLocal("last")
                )
              ),
              c.call(prefixField + "_zero", c.getLocal("ita")),
              c.call(prefixField + "_zero", c.getLocal("itb")),
              c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
              c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
              c.br(0)
            )),
            c.setLocal("it", c.getLocal("pCoefs")),
            c.setLocal(
              "last",
              c.i32_add(
                c.getLocal("pCoefs"),
                c.i32_mul(
                  c.getLocal("nCoefs"),
                  c.i32_const(n8 + 12)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("it"),
                  c.getLocal("last")
                )
              ),
              c.setLocal(
                "s",
                c.i32_load(c.getLocal("it"), 8)
              ),
              c.if(
                c.i32_or(
                  c.i32_lt_u(
                    c.getLocal("s"),
                    c.getLocal("offsetWitness")
                  ),
                  c.i32_ge_u(
                    c.getLocal("s"),
                    c.i32_add(
                      c.getLocal("offsetWitness"),
                      c.getLocal("nWitness")
                    )
                  )
                ),
                [
                  ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
                  ...c.br(1)
                ]
              ),
              c.setLocal(
                "m",
                c.i32_load(c.getLocal("it"))
              ),
              c.if(
                c.i32_eq(c.getLocal("m"), c.i32_const(0)),
                c.setLocal("pOut", c.getLocal("pA")),
                c.if(
                  c.i32_eq(c.getLocal("m"), c.i32_const(1)),
                  c.setLocal("pOut", c.getLocal("pB")),
                  [
                    ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
                    ...c.br(1)
                  ]
                )
              ),
              c.setLocal(
                "c",
                c.i32_load(c.getLocal("it"), 4)
              ),
              c.if(
                c.i32_or(
                  c.i32_lt_u(
                    c.getLocal("c"),
                    c.getLocal("offsetOut")
                  ),
                  c.i32_ge_u(
                    c.getLocal("c"),
                    c.i32_add(
                      c.getLocal("offsetOut"),
                      c.getLocal("nOut")
                    )
                  )
                ),
                [
                  ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
                  ...c.br(1)
                ]
              ),
              c.setLocal(
                "pOut",
                c.i32_add(
                  c.getLocal("pOut"),
                  c.i32_mul(
                    c.i32_sub(
                      c.getLocal("c"),
                      c.getLocal("offsetOut")
                    ),
                    c.i32_const(n8)
                  )
                )
              ),
              c.call(
                prefixField + "_mul",
                c.i32_add(
                  c.getLocal("pWitness"),
                  c.i32_mul(
                    c.i32_sub(c.getLocal("s"), c.getLocal("offsetWitness")),
                    c.i32_const(n8)
                  )
                ),
                c.i32_add(c.getLocal("it"), c.i32_const(12)),
                aux
              ),
              c.call(
                prefixField + "_add",
                c.getLocal("pOut"),
                aux,
                c.getLocal("pOut")
              ),
              c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
              c.br(0)
            )),
            c.setLocal("ita", c.getLocal("pA")),
            c.setLocal("itb", c.getLocal("pB")),
            c.setLocal("it", c.getLocal("pC")),
            c.setLocal(
              "last",
              c.i32_add(
                c.getLocal("pA"),
                c.i32_mul(
                  c.getLocal("nOut"),
                  c.i32_const(n8)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("ita"),
                  c.getLocal("last")
                )
              ),
              c.call(
                prefixField + "_mul",
                c.getLocal("ita"),
                c.getLocal("itb"),
                c.getLocal("it")
              ),
              c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
              c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
              c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8))),
              c.br(0)
            ))
          );
        }
        function buildJoinABC() {
          const f = module2.addFunction(prefix + "_joinABC");
          f.addParam("pA", "i32");
          f.addParam("pB", "i32");
          f.addParam("pC", "i32");
          f.addParam("n", "i32");
          f.addParam("pP", "i32");
          f.addLocal("ita", "i32");
          f.addLocal("itb", "i32");
          f.addLocal("itc", "i32");
          f.addLocal("itp", "i32");
          f.addLocal("last", "i32");
          const c = f.getCodeBuilder();
          const aux = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.setLocal("ita", c.getLocal("pA")),
            c.setLocal("itb", c.getLocal("pB")),
            c.setLocal("itc", c.getLocal("pC")),
            c.setLocal("itp", c.getLocal("pP")),
            c.setLocal(
              "last",
              c.i32_add(
                c.getLocal("pA"),
                c.i32_mul(
                  c.getLocal("n"),
                  c.i32_const(n8)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("ita"),
                  c.getLocal("last")
                )
              ),
              c.call(
                prefixField + "_mul",
                c.getLocal("ita"),
                c.getLocal("itb"),
                aux
              ),
              c.call(
                prefixField + "_sub",
                aux,
                c.getLocal("itc"),
                c.getLocal("itp")
              ),
              c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
              c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
              c.setLocal("itc", c.i32_add(c.getLocal("itc"), c.i32_const(n8))),
              c.setLocal("itp", c.i32_add(c.getLocal("itp"), c.i32_const(n8))),
              c.br(0)
            ))
          );
        }
        function buildBatchAdd() {
          const f = module2.addFunction(prefix + "_batchAdd");
          f.addParam("pa", "i32");
          f.addParam("pb", "i32");
          f.addParam("n", "i32");
          f.addParam("pr", "i32");
          f.addLocal("ita", "i32");
          f.addLocal("itb", "i32");
          f.addLocal("itr", "i32");
          f.addLocal("last", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.setLocal("ita", c.getLocal("pa")),
            c.setLocal("itb", c.getLocal("pb")),
            c.setLocal("itr", c.getLocal("pr")),
            c.setLocal(
              "last",
              c.i32_add(
                c.getLocal("pa"),
                c.i32_mul(
                  c.getLocal("n"),
                  c.i32_const(n8)
                )
              )
            ),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("ita"),
                  c.getLocal("last")
                )
              ),
              c.call(
                prefixField + "_add",
                c.getLocal("ita"),
                c.getLocal("itb"),
                c.getLocal("itr")
              ),
              c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
              c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
              c.setLocal("itr", c.i32_add(c.getLocal("itr"), c.i32_const(n8))),
              c.br(0)
            ))
          );
        }
        buildBuildABC();
        buildJoinABC();
        buildBatchAdd();
        module2.exportFunction(prefix + "_buildABC");
        module2.exportFunction(prefix + "_joinABC");
        module2.exportFunction(prefix + "_batchAdd");
        return prefix;
      };
    }
  });

  // node_modules/wasmcurves/src/build_applykey.js
  var require_build_applykey = __commonJS({
    "node_modules/wasmcurves/src/build_applykey.js"(exports, module) {
      module.exports = function buildApplyKey(module2, fnName, gPrefix, frPrefix, sizeGIn, sizeGOut, sizeF, opGtimesF) {
        const f = module2.addFunction(fnName);
        f.addParam("pIn", "i32");
        f.addParam("n", "i32");
        f.addParam("pFirst", "i32");
        f.addParam("pInc", "i32");
        f.addParam("pOut", "i32");
        f.addLocal("pOldFree", "i32");
        f.addLocal("i", "i32");
        f.addLocal("pFrom", "i32");
        f.addLocal("pTo", "i32");
        const c = f.getCodeBuilder();
        const t = c.i32_const(module2.alloc(sizeF));
        f.addCode(
          c.setLocal("pFrom", c.getLocal("pIn")),
          c.setLocal("pTo", c.getLocal("pOut"))
        );
        f.addCode(
          c.call(
            frPrefix + "_copy",
            c.getLocal("pFirst"),
            t
          )
        );
        f.addCode(
          c.setLocal("i", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
            c.call(
              opGtimesF,
              c.getLocal("pFrom"),
              t,
              c.getLocal("pTo")
            ),
            c.setLocal("pFrom", c.i32_add(c.getLocal("pFrom"), c.i32_const(sizeGIn))),
            c.setLocal("pTo", c.i32_add(c.getLocal("pTo"), c.i32_const(sizeGOut))),
            c.call(
              frPrefix + "_mul",
              t,
              c.getLocal("pInc"),
              t
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          ))
        );
        module2.exportFunction(fnName);
      };
    }
  });

  // node_modules/wasmcurves/src/bn128/build_bn128.js
  var require_build_bn128 = __commonJS({
    "node_modules/wasmcurves/src/bn128/build_bn128.js"(exports, module) {
      var utils = require_utils();
      var buildF1m = require_build_f1m();
      var buildF1 = require_build_f1();
      var buildF2m = require_build_f2m();
      var buildF3m = require_build_f3m();
      var buildCurve = require_build_curve_jacobian_a0();
      var buildFFT2 = require_build_fft();
      var buildPol = require_build_pol();
      var buildQAP = require_build_qap();
      var buildApplyKey = require_build_applykey();
      var { bitLength: bitLength3, modInv, isOdd: isOdd2, isNegative: isNegative3 } = require_bigint();
      module.exports = function buildBN128(module2, _prefix) {
        const prefix = _prefix || "bn128";
        if (module2.modules[prefix])
          return prefix;
        const q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
        const r = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
        const n64 = Math.floor((bitLength3(q - 1n) - 1) / 64) + 1;
        const n8 = n64 * 8;
        const frsize = n8;
        const f1size = n8;
        const f2size = f1size * 2;
        const ftsize = f1size * 12;
        const pr = module2.alloc(utils.bigInt2BytesLE(r, frsize));
        const f1mPrefix = buildF1m(module2, q, "f1m");
        buildF1(module2, r, "fr", "frm");
        const pG1b = module2.alloc(utils.bigInt2BytesLE(toMontgomery(3n), f1size));
        const g1mPrefix = buildCurve(module2, "g1m", "f1m", pG1b);
        buildFFT2(module2, "frm", "frm", "frm", "frm_mul");
        buildPol(module2, "pol", "frm");
        buildQAP(module2, "qap", "frm");
        const f2mPrefix = buildF2m(module2, "f1m_neg", "f2m", "f1m");
        const pG2b = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(19485874751759354771024239261021720505790618469301721065564631296452457478373n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(266929791119991161246907387137283842545076965332900288569378510910307636690n), f1size)
        ]);
        const g2mPrefix = buildCurve(module2, "g2m", "f2m", pG2b);
        function buildGTimesFr(fnName, opMul) {
          const f = module2.addFunction(fnName);
          f.addParam("pG", "i32");
          f.addParam("pFr", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8));
          f.addCode(
            c.call("frm_fromMontgomery", c.getLocal("pFr"), AUX),
            c.call(
              opMul,
              c.getLocal("pG"),
              AUX,
              c.i32_const(n8),
              c.getLocal("pr")
            )
          );
          module2.exportFunction(fnName);
        }
        buildGTimesFr("g1m_timesFr", "g1m_timesScalar");
        buildFFT2(module2, "g1m", "g1m", "frm", "g1m_timesFr");
        buildGTimesFr("g2m_timesFr", "g2m_timesScalar");
        buildFFT2(module2, "g2m", "g2m", "frm", "g2m_timesFr");
        buildGTimesFr("g1m_timesFrAffine", "g1m_timesScalarAffine");
        buildGTimesFr("g2m_timesFrAffine", "g2m_timesScalarAffine");
        buildApplyKey(module2, "frm_batchApplyKey", "fmr", "frm", n8, n8, n8, "frm_mul");
        buildApplyKey(module2, "g1m_batchApplyKey", "g1m", "frm", n8 * 3, n8 * 3, n8, "g1m_timesFr");
        buildApplyKey(module2, "g1m_batchApplyKeyMixed", "g1m", "frm", n8 * 2, n8 * 3, n8, "g1m_timesFrAffine");
        buildApplyKey(module2, "g2m_batchApplyKey", "g2m", "frm", n8 * 2 * 3, n8 * 3 * 2, n8, "g2m_timesFr");
        buildApplyKey(module2, "g2m_batchApplyKeyMixed", "g2m", "frm", n8 * 2 * 2, n8 * 3 * 2, n8, "g2m_timesFrAffine");
        function toMontgomery(a) {
          return BigInt(a) * (1n << BigInt(f1size * 8)) % q;
        }
        const G1gen = [
          1n,
          2n,
          1n
        ];
        const pG1gen = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[2]), f1size)
          ]
        );
        const G1zero = [
          0n,
          1n,
          0n
        ];
        const pG1zero = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[2]), f1size)
          ]
        );
        const G2gen = [
          [
            10857046999023057135944570762232829481370756359578518086990519993285655852781n,
            11559732032986387107991004021392285783925812861821192530917403151452391805634n
          ],
          [
            8495653923123431417604973247489272438418190587263600148770280649306958101930n,
            4082367875863433681332203403145435568316851327593401208105741076214120093531n
          ],
          [
            1n,
            0n
          ]
        ];
        const pG2gen = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[0][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[0][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[1][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[1][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[2][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[2][1]), f1size)
          ]
        );
        const G2zero = [
          [
            0n,
            0n
          ],
          [
            1n,
            0n
          ],
          [
            0n,
            0n
          ]
        ];
        const pG2zero = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[0][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[0][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[1][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[1][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[2][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[2][1]), f1size)
          ]
        );
        const pOneT = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(1), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0), f1size)
        ]);
        const pNonResidueF6 = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(9), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(1), f1size)
        ]);
        const pTwoInv = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(modInv(2n, q)), f1size),
          ...utils.bigInt2BytesLE(0n, f1size)
        ]);
        const pAltBn128Twist = pNonResidueF6;
        const pTwistCoefB = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(19485874751759354771024239261021720505790618469301721065564631296452457478373n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(266929791119991161246907387137283842545076965332900288569378510910307636690n), f1size)
        ]);
        function build_mulNR6() {
          const f = module2.addFunction(prefix + "_mulNR6");
          f.addParam("x", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(
              f2mPrefix + "_mul",
              c.i32_const(pNonResidueF6),
              c.getLocal("x"),
              c.getLocal("pr")
            )
          );
        }
        build_mulNR6();
        const f6mPrefix = buildF3m(module2, prefix + "_mulNR6", "f6m", "f2m");
        function build_mulNR12() {
          const f = module2.addFunction(prefix + "_mulNR12");
          f.addParam("x", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(
              f2mPrefix + "_mul",
              c.i32_const(pNonResidueF6),
              c.i32_add(c.getLocal("x"), c.i32_const(n8 * 4)),
              c.getLocal("pr")
            ),
            c.call(
              f2mPrefix + "_copy",
              c.getLocal("x"),
              c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))
            ),
            c.call(
              f2mPrefix + "_copy",
              c.i32_add(c.getLocal("x"), c.i32_const(n8 * 2)),
              c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 4))
            )
          );
        }
        build_mulNR12();
        const ftmPrefix = buildF2m(module2, prefix + "_mulNR12", "ftm", f6mPrefix);
        const ateLoopCount = 29793968203157093288n;
        const ateLoopBitBytes = bits2(ateLoopCount);
        const pAteLoopBitBytes = module2.alloc(ateLoopBitBytes);
        const isLoopNegative = false;
        const ateCoefSize = 3 * f2size;
        const ateNDblCoefs = ateLoopBitBytes.length - 1;
        const ateNAddCoefs = ateLoopBitBytes.reduce((acc, b) => acc + (b != 0 ? 1 : 0), 0);
        const ateNCoefs = ateNAddCoefs + ateNDblCoefs + 1;
        const prePSize = 3 * 2 * n8;
        const preQSize = 3 * n8 * 2 + ateNCoefs * ateCoefSize;
        const finalExpIsNegative = false;
        module2.modules[prefix] = {
          n64,
          pG1gen,
          pG1zero,
          pG1b,
          pG2gen,
          pG2zero,
          pG2b,
          pq: module2.modules["f1m"].pq,
          pr,
          pOneT,
          prePSize,
          preQSize,
          r: r.toString(),
          q: q.toString()
        };
        const finalExpZ = 4965661367192848881n;
        function naf2(n) {
          let E = n;
          const res = [];
          while (E > 0n) {
            if (isOdd2(E)) {
              const z = 2 - Number(E % 4n);
              res.push(z);
              E = E - BigInt(z);
            } else {
              res.push(0);
            }
            E = E >> 1n;
          }
          return res;
        }
        function bits2(n) {
          let E = n;
          const res = [];
          while (E > 0n) {
            if (isOdd2(E)) {
              res.push(1);
            } else {
              res.push(0);
            }
            E = E >> 1n;
          }
          return res;
        }
        function buildPrepareG1() {
          const f = module2.addFunction(prefix + "_prepareG1");
          f.addParam("pP", "i32");
          f.addParam("ppreP", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(g1mPrefix + "_normalize", c.getLocal("pP"), c.getLocal("ppreP"))
          );
        }
        function buildPrepAddStep() {
          const f = module2.addFunction(prefix + "_prepAddStep");
          f.addParam("pQ", "i32");
          f.addParam("pR", "i32");
          f.addParam("pCoef", "i32");
          const c = f.getCodeBuilder();
          const X2 = c.getLocal("pQ");
          const Y2 = c.i32_add(c.getLocal("pQ"), c.i32_const(f2size));
          const X1 = c.getLocal("pR");
          const Y1 = c.i32_add(c.getLocal("pR"), c.i32_const(f2size));
          const Z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * f2size));
          const ELL_0 = c.getLocal("pCoef");
          const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
          const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
          const D = ELL_VW;
          const E = c.i32_const(module2.alloc(f2size));
          const F = c.i32_const(module2.alloc(f2size));
          const G = c.i32_const(module2.alloc(f2size));
          const H = c.i32_const(module2.alloc(f2size));
          const I = c.i32_const(module2.alloc(f2size));
          const J = c.i32_const(module2.alloc(f2size));
          const AUX = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_mul", X2, Z1, D),
            c.call(f2mPrefix + "_sub", X1, D, D),
            c.call(f2mPrefix + "_mul", Y2, Z1, E),
            c.call(f2mPrefix + "_sub", Y1, E, E),
            c.call(f2mPrefix + "_square", D, F),
            c.call(f2mPrefix + "_square", E, G),
            c.call(f2mPrefix + "_mul", D, F, H),
            c.call(f2mPrefix + "_mul", X1, F, I),
            c.call(f2mPrefix + "_add", I, I, AUX),
            c.call(f2mPrefix + "_mul", Z1, G, J),
            c.call(f2mPrefix + "_add", H, J, J),
            c.call(f2mPrefix + "_sub", J, AUX, J),
            c.call(f2mPrefix + "_mul", D, J, X1),
            c.call(f2mPrefix + "_mul", H, Y1, Y1),
            c.call(f2mPrefix + "_sub", I, J, AUX),
            c.call(f2mPrefix + "_mul", E, AUX, AUX),
            c.call(f2mPrefix + "_sub", AUX, Y1, Y1),
            c.call(f2mPrefix + "_mul", Z1, H, Z1),
            c.call(f2mPrefix + "_mul", D, Y2, AUX),
            c.call(f2mPrefix + "_mul", E, X2, ELL_0),
            c.call(f2mPrefix + "_sub", ELL_0, AUX, ELL_0),
            c.call(f2mPrefix + "_mul", ELL_0, c.i32_const(pAltBn128Twist), ELL_0),
            c.call(f2mPrefix + "_neg", E, ELL_VV)
          );
        }
        function buildPrepDoubleStep() {
          const f = module2.addFunction(prefix + "_prepDblStep");
          f.addParam("pR", "i32");
          f.addParam("pCoef", "i32");
          const c = f.getCodeBuilder();
          const X1 = c.getLocal("pR");
          const Y1 = c.i32_add(c.getLocal("pR"), c.i32_const(f2size));
          const Z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * f2size));
          const ELL_0 = c.getLocal("pCoef");
          const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
          const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
          const A = c.i32_const(module2.alloc(f2size));
          const B = c.i32_const(module2.alloc(f2size));
          const C = c.i32_const(module2.alloc(f2size));
          const D = c.i32_const(module2.alloc(f2size));
          const E = c.i32_const(module2.alloc(f2size));
          const F = c.i32_const(module2.alloc(f2size));
          const G = c.i32_const(module2.alloc(f2size));
          const H = c.i32_const(module2.alloc(f2size));
          const I = c.i32_const(module2.alloc(f2size));
          const J = c.i32_const(module2.alloc(f2size));
          const E2 = c.i32_const(module2.alloc(f2size));
          const AUX = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_mul", Y1, c.i32_const(pTwoInv), A),
            c.call(f2mPrefix + "_mul", X1, A, A),
            c.call(f2mPrefix + "_square", Y1, B),
            c.call(f2mPrefix + "_square", Z1, C),
            c.call(f2mPrefix + "_add", C, C, D),
            c.call(f2mPrefix + "_add", D, C, D),
            c.call(f2mPrefix + "_mul", c.i32_const(pTwistCoefB), D, E),
            c.call(f2mPrefix + "_add", E, E, F),
            c.call(f2mPrefix + "_add", E, F, F),
            c.call(f2mPrefix + "_add", B, F, G),
            c.call(f2mPrefix + "_mul", G, c.i32_const(pTwoInv), G),
            c.call(f2mPrefix + "_add", B, C, AUX),
            c.call(f2mPrefix + "_add", Y1, Z1, H),
            c.call(f2mPrefix + "_square", H, H),
            c.call(f2mPrefix + "_sub", H, AUX, H),
            c.call(f2mPrefix + "_sub", E, B, I),
            c.call(f2mPrefix + "_square", X1, J),
            c.call(f2mPrefix + "_square", E, E2),
            c.call(f2mPrefix + "_sub", B, F, AUX),
            c.call(f2mPrefix + "_mul", A, AUX, X1),
            c.call(f2mPrefix + "_add", E2, E2, AUX),
            c.call(f2mPrefix + "_add", E2, AUX, AUX),
            c.call(f2mPrefix + "_square", G, Y1),
            c.call(f2mPrefix + "_sub", Y1, AUX, Y1),
            c.call(f2mPrefix + "_mul", B, H, Z1),
            c.call(f2mPrefix + "_mul", c.i32_const(pAltBn128Twist), I, ELL_0),
            c.call(f2mPrefix + "_neg", H, ELL_VW),
            c.call(f2mPrefix + "_add", J, J, ELL_VV),
            c.call(f2mPrefix + "_add", J, ELL_VV, ELL_VV)
          );
        }
        function buildMulByQ() {
          const f = module2.addFunction(prefix + "_mulByQ");
          f.addParam("p1", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("p1");
          const y = c.i32_add(c.getLocal("p1"), c.i32_const(f2size));
          const z = c.i32_add(c.getLocal("p1"), c.i32_const(f2size * 2));
          const x3 = c.getLocal("pr");
          const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(f2size));
          const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(f2size * 2));
          const MulByQX = c.i32_const(module2.alloc([
            ...utils.bigInt2BytesLE(toMontgomery("21575463638280843010398324269430826099269044274347216827212613867836435027261"), f1size),
            ...utils.bigInt2BytesLE(toMontgomery("10307601595873709700152284273816112264069230130616436755625194854815875713954"), f1size)
          ]));
          const MulByQY = c.i32_const(module2.alloc([
            ...utils.bigInt2BytesLE(toMontgomery("2821565182194536844548159561693502659359617185244120367078079554186484126554"), f1size),
            ...utils.bigInt2BytesLE(toMontgomery("3505843767911556378687030309984248845540243509899259641013678093033130930403"), f1size)
          ]));
          f.addCode(
            c.call(f2mPrefix + "_conjugate", x, x3),
            c.call(f2mPrefix + "_mul", MulByQX, x3, x3),
            c.call(f2mPrefix + "_conjugate", y, y3),
            c.call(f2mPrefix + "_mul", MulByQY, y3, y3),
            c.call(f2mPrefix + "_conjugate", z, z3)
          );
        }
        function buildPrepareG2() {
          buildMulByQ();
          const f = module2.addFunction(prefix + "_prepareG2");
          f.addParam("pQ", "i32");
          f.addParam("ppreQ", "i32");
          f.addLocal("pCoef", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const QX = c.getLocal("pQ");
          const pR = module2.alloc(f2size * 3);
          const R = c.i32_const(pR);
          const RX = c.i32_const(pR);
          const RY = c.i32_const(pR + f2size);
          const RZ = c.i32_const(pR + 2 * f2size);
          const cQX = c.i32_add(c.getLocal("ppreQ"), c.i32_const(0));
          const cQY = c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size));
          const pQ1 = module2.alloc(f2size * 3);
          const Q1 = c.i32_const(pQ1);
          const pQ2 = module2.alloc(f2size * 3);
          const Q2 = c.i32_const(pQ2);
          const Q2Y = c.i32_const(pQ2 + f2size);
          f.addCode(
            c.call(g2mPrefix + "_normalize", QX, cQX),
            c.call(f2mPrefix + "_copy", cQX, RX),
            c.call(f2mPrefix + "_copy", cQY, RY),
            c.call(f2mPrefix + "_one", RZ)
          );
          f.addCode(
            c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
            c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
            c.block(c.loop(
              c.call(prefix + "_prepDblStep", R, c.getLocal("pCoef")),
              c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
              c.if(
                c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
                [
                  ...c.call(prefix + "_prepAddStep", cQX, R, c.getLocal("pCoef")),
                  ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
                ]
              ),
              c.br_if(1, c.i32_eqz(c.getLocal("i"))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
          f.addCode(
            c.call(prefix + "_mulByQ", cQX, Q1),
            c.call(prefix + "_mulByQ", Q1, Q2)
          );
          if (isLoopNegative) {
            f.addCode(
              c.call(f2mPrefix + "_neg", RY, RY)
            );
          }
          f.addCode(
            c.call(f2mPrefix + "_neg", Q2Y, Q2Y),
            c.call(prefix + "_prepAddStep", Q1, R, c.getLocal("pCoef")),
            c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
            c.call(prefix + "_prepAddStep", Q2, R, c.getLocal("pCoef")),
            c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          );
        }
        function buildMulBy024Old() {
          const f = module2.addFunction(prefix + "__mulBy024Old");
          f.addParam("pEll0", "i32");
          f.addParam("pEllVW", "i32");
          f.addParam("pEllVV", "i32");
          f.addParam("pR", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("pEll0");
          const x2 = c.getLocal("pEllVV");
          const x4 = c.getLocal("pEllVW");
          const z0 = c.getLocal("pR");
          const pAUX12 = module2.alloc(ftsize);
          const AUX12 = c.i32_const(pAUX12);
          const AUX12_0 = c.i32_const(pAUX12);
          const AUX12_2 = c.i32_const(pAUX12 + f2size);
          const AUX12_4 = c.i32_const(pAUX12 + f2size * 2);
          const AUX12_6 = c.i32_const(pAUX12 + f2size * 3);
          const AUX12_8 = c.i32_const(pAUX12 + f2size * 4);
          const AUX12_10 = c.i32_const(pAUX12 + f2size * 5);
          f.addCode(
            c.call(f2mPrefix + "_copy", x0, AUX12_0),
            c.call(f2mPrefix + "_zero", AUX12_2),
            c.call(f2mPrefix + "_copy", x2, AUX12_4),
            c.call(f2mPrefix + "_zero", AUX12_6),
            c.call(f2mPrefix + "_copy", x4, AUX12_8),
            c.call(f2mPrefix + "_zero", AUX12_10),
            c.call(ftmPrefix + "_mul", AUX12, z0, z0)
          );
        }
        function buildMulBy024() {
          const f = module2.addFunction(prefix + "__mulBy024");
          f.addParam("pEll0", "i32");
          f.addParam("pEllVW", "i32");
          f.addParam("pEllVV", "i32");
          f.addParam("pR", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("pEll0");
          const x2 = c.getLocal("pEllVV");
          const x4 = c.getLocal("pEllVW");
          const z0 = c.getLocal("pR");
          const z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * n8));
          const z2 = c.i32_add(c.getLocal("pR"), c.i32_const(4 * n8));
          const z3 = c.i32_add(c.getLocal("pR"), c.i32_const(6 * n8));
          const z4 = c.i32_add(c.getLocal("pR"), c.i32_const(8 * n8));
          const z5 = c.i32_add(c.getLocal("pR"), c.i32_const(10 * n8));
          const t0 = c.i32_const(module2.alloc(f2size));
          const t1 = c.i32_const(module2.alloc(f2size));
          const t2 = c.i32_const(module2.alloc(f2size));
          const s0 = c.i32_const(module2.alloc(f2size));
          const T3 = c.i32_const(module2.alloc(f2size));
          const T4 = c.i32_const(module2.alloc(f2size));
          const D0 = c.i32_const(module2.alloc(f2size));
          const D2 = c.i32_const(module2.alloc(f2size));
          const D4 = c.i32_const(module2.alloc(f2size));
          const S1 = c.i32_const(module2.alloc(f2size));
          const AUX = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_mul", z0, x0, D0),
            c.call(f2mPrefix + "_mul", z2, x2, D2),
            c.call(f2mPrefix + "_mul", z4, x4, D4),
            c.call(f2mPrefix + "_add", z0, z4, t2),
            c.call(f2mPrefix + "_add", z0, z2, t1),
            c.call(f2mPrefix + "_add", z1, z3, s0),
            c.call(f2mPrefix + "_add", s0, z5, s0),
            c.call(f2mPrefix + "_mul", z1, x2, S1),
            c.call(f2mPrefix + "_add", S1, D4, T3),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
            c.call(f2mPrefix + "_add", T4, D0, z0),
            c.call(f2mPrefix + "_mul", z5, x4, T3),
            c.call(f2mPrefix + "_add", S1, T3, S1),
            c.call(f2mPrefix + "_add", T3, D2, T3),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
            c.call(f2mPrefix + "_mul", z1, x0, T3),
            c.call(f2mPrefix + "_add", S1, T3, S1),
            c.call(f2mPrefix + "_add", T4, T3, z1),
            c.call(f2mPrefix + "_add", x0, x2, t0),
            c.call(f2mPrefix + "_mul", t1, t0, T3),
            c.call(f2mPrefix + "_add", D0, D2, AUX),
            c.call(f2mPrefix + "_sub", T3, AUX, T3),
            c.call(f2mPrefix + "_mul", z3, x4, T4),
            c.call(f2mPrefix + "_add", S1, T4, S1),
            c.call(f2mPrefix + "_add", z2, z4, t0),
            c.call(f2mPrefix + "_add", T3, T4, z2),
            c.call(f2mPrefix + "_add", x2, x4, t1),
            c.call(f2mPrefix + "_mul", t1, t0, T3),
            c.call(f2mPrefix + "_add", D2, D4, AUX),
            c.call(f2mPrefix + "_sub", T3, AUX, T3),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
            c.call(f2mPrefix + "_mul", z3, x0, T3),
            c.call(f2mPrefix + "_add", S1, T3, S1),
            c.call(f2mPrefix + "_add", T4, T3, z3),
            c.call(f2mPrefix + "_mul", z5, x2, T3),
            c.call(f2mPrefix + "_add", S1, T3, S1),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
            c.call(f2mPrefix + "_add", x0, x4, t0),
            c.call(f2mPrefix + "_mul", t2, t0, T3),
            c.call(f2mPrefix + "_add", D0, D4, AUX),
            c.call(f2mPrefix + "_sub", T3, AUX, T3),
            c.call(f2mPrefix + "_add", T4, T3, z4),
            c.call(f2mPrefix + "_add", x0, x2, t0),
            c.call(f2mPrefix + "_add", t0, x4, t0),
            c.call(f2mPrefix + "_mul", s0, t0, T3),
            c.call(f2mPrefix + "_sub", T3, S1, z5)
          );
        }
        function buildMillerLoop() {
          const f = module2.addFunction(prefix + "_millerLoop");
          f.addParam("ppreP", "i32");
          f.addParam("ppreQ", "i32");
          f.addParam("r", "i32");
          f.addLocal("pCoef", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const preP_PX = c.getLocal("ppreP");
          const preP_PY = c.i32_add(c.getLocal("ppreP"), c.i32_const(f1size));
          const ELL_0 = c.getLocal("pCoef");
          const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
          const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
          const pVW = module2.alloc(f2size);
          const VW = c.i32_const(pVW);
          const pVV = module2.alloc(f2size);
          const VV = c.i32_const(pVV);
          const F = c.getLocal("r");
          f.addCode(
            c.call(ftmPrefix + "_one", F),
            c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
            c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
            c.block(c.loop(
              c.call(ftmPrefix + "_square", F, F),
              c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
              c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
              c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
              c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
              c.if(
                c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
                [
                  ...c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
                  ...c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
                  ...c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
                  ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
                ]
              ),
              c.br_if(1, c.i32_eqz(c.getLocal("i"))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
          if (isLoopNegative) {
            f.addCode(
              c.call(ftmPrefix + "_inverse", F, F)
            );
          }
          f.addCode(
            c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
            c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
            c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
            c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
            c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
            c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
            c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
            c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          );
        }
        function buildFrobeniusMap(n) {
          const F12 = [
            [
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n]
            ],
            [
              [1n, 0n],
              [8376118865763821496583973867626364092589906065868298776909617916018768340080n, 16469823323077808223889137241176536799009286646108169935659301613961712198316n],
              [21888242871839275220042445260109153167277707414472061641714758635765020556617n, 0n],
              [11697423496358154304825782922584725312912383441159505038794027105778954184319n, 303847389135065887422783454877609941456349188919719272345083954437860409601n],
              [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
              [3321304630594332808241809054958361220322477375291206261884409189760185844239n, 5722266937896532885780051958958348231143373700109372999374820235121374419868n],
              [21888242871839275222246405745257275088696311157297823662689037894645226208582n, 0n],
              [13512124006075453725662431877630910996106405091429524885779419978626457868503n, 5418419548761466998357268504080738289687024511189653727029736280683514010267n],
              [2203960485148121921418603742825762020974279258880205651966n, 0n],
              [10190819375481120917420622822672549775783927716138318623895010788866272024264n, 21584395482704209334823622290379665147239961968378104390343953940207365798982n],
              [2203960485148121921418603742825762020974279258880205651967n, 0n],
              [18566938241244942414004596690298913868373833782006617400804628704885040364344n, 16165975933942742336466353786298926857552937457188450663314217659523851788715n]
            ]
          ];
          const F6 = [
            [
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n]
            ],
            [
              [1n, 0n],
              [21575463638280843010398324269430826099269044274347216827212613867836435027261n, 10307601595873709700152284273816112264069230130616436755625194854815875713954n],
              [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
              [3772000881919853776433695186713858239009073593817195771773381919316419345261n, 2236595495967245188281701248203181795121068902605861227855261137820944008926n],
              [2203960485148121921418603742825762020974279258880205651966n, 0n],
              [18429021223477853657660792034369865839114504446431234726392080002137598044644n, 9344045779998320333812420223237981029506012124075525679208581902008406485703n]
            ],
            [
              [1n, 0n],
              [2581911344467009335267311115468803099551665605076196740867805258568234346338n, 19937756971775647987995932169929341994314640652964949448313374472400716661030n],
              [2203960485148121921418603742825762020974279258880205651966n, 0n],
              [5324479202449903542726783395506214481928257762400643279780343368557297135718n, 16208900380737693084919495127334387981393726419856888799917914180988844123039n],
              [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
              [13981852324922362344252311234282257507216387789820983642040889267519694726527n, 7629828391165209371577384193250820201684255241773809077146787135900891633097n]
            ]
          ];
          const f = module2.addFunction(prefix + "__frobeniusMap" + n);
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < 6; i++) {
            const X = i == 0 ? c.getLocal("x") : c.i32_add(c.getLocal("x"), c.i32_const(i * f2size));
            const Xc0 = X;
            const Xc1 = c.i32_add(c.getLocal("x"), c.i32_const(i * f2size + f1size));
            const R = i == 0 ? c.getLocal("r") : c.i32_add(c.getLocal("r"), c.i32_const(i * f2size));
            const Rc0 = R;
            const Rc1 = c.i32_add(c.getLocal("r"), c.i32_const(i * f2size + f1size));
            const coef = mul2(F12[Math.floor(i / 3)][n % 12], F6[i % 3][n % 6]);
            const pCoef = module2.alloc([
              ...utils.bigInt2BytesLE(toMontgomery(coef[0]), 32),
              ...utils.bigInt2BytesLE(toMontgomery(coef[1]), 32)
            ]);
            if (n % 2 == 1) {
              f.addCode(
                c.call(f1mPrefix + "_copy", Xc0, Rc0),
                c.call(f1mPrefix + "_neg", Xc1, Rc1),
                c.call(f2mPrefix + "_mul", R, c.i32_const(pCoef), R)
              );
            } else {
              f.addCode(c.call(f2mPrefix + "_mul", X, c.i32_const(pCoef), R));
            }
          }
          function mul2(a, b) {
            const ac0 = BigInt(a[0]);
            const ac1 = BigInt(a[1]);
            const bc0 = BigInt(b[0]);
            const bc1 = BigInt(b[1]);
            const res = [
              (ac0 * bc0 - ac1 * bc1) % q,
              (ac0 * bc1 + ac1 * bc0) % q
            ];
            if (isNegative3(res[0]))
              res[0] = res[0] + q;
            return res;
          }
        }
        function buildFinalExponentiationFirstChunk() {
          const f = module2.addFunction(prefix + "__finalExponentiationFirstChunk");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const elt = c.getLocal("x");
          const eltC0 = elt;
          const eltC1 = c.i32_add(elt, c.i32_const(n8 * 6));
          const r2 = c.getLocal("r");
          const pA = module2.alloc(ftsize);
          const A = c.i32_const(pA);
          const Ac0 = A;
          const Ac1 = c.i32_const(pA + n8 * 6);
          const B = c.i32_const(module2.alloc(ftsize));
          const C = c.i32_const(module2.alloc(ftsize));
          const D = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(f6mPrefix + "_copy", eltC0, Ac0),
            c.call(f6mPrefix + "_neg", eltC1, Ac1),
            c.call(ftmPrefix + "_inverse", elt, B),
            c.call(ftmPrefix + "_mul", A, B, C),
            c.call(prefix + "__frobeniusMap2", C, D),
            c.call(ftmPrefix + "_mul", C, D, r2)
          );
        }
        function buildCyclotomicSquare() {
          const f = module2.addFunction(prefix + "__cyclotomicSquare");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x4 = c.i32_add(c.getLocal("x"), c.i32_const(f2size));
          const x3 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f2size));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(3 * f2size));
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(4 * f2size));
          const x5 = c.i32_add(c.getLocal("x"), c.i32_const(5 * f2size));
          const r0 = c.getLocal("r");
          const r4 = c.i32_add(c.getLocal("r"), c.i32_const(f2size));
          const r3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f2size));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(3 * f2size));
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(4 * f2size));
          const r5 = c.i32_add(c.getLocal("r"), c.i32_const(5 * f2size));
          const t0 = c.i32_const(module2.alloc(f2size));
          const t1 = c.i32_const(module2.alloc(f2size));
          const t2 = c.i32_const(module2.alloc(f2size));
          const t3 = c.i32_const(module2.alloc(f2size));
          const t4 = c.i32_const(module2.alloc(f2size));
          const t5 = c.i32_const(module2.alloc(f2size));
          const tmp = c.i32_const(module2.alloc(f2size));
          const AUX = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_mul", x0, x1, tmp),
            c.call(f2mPrefix + "_mul", x1, c.i32_const(pNonResidueF6), t0),
            c.call(f2mPrefix + "_add", x0, t0, t0),
            c.call(f2mPrefix + "_add", x0, x1, AUX),
            c.call(f2mPrefix + "_mul", AUX, t0, t0),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t0, AUX, t0),
            c.call(f2mPrefix + "_add", tmp, tmp, t1),
            c.call(f2mPrefix + "_mul", x2, x3, tmp),
            c.call(f2mPrefix + "_mul", x3, c.i32_const(pNonResidueF6), t2),
            c.call(f2mPrefix + "_add", x2, t2, t2),
            c.call(f2mPrefix + "_add", x2, x3, AUX),
            c.call(f2mPrefix + "_mul", AUX, t2, t2),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t2, AUX, t2),
            c.call(f2mPrefix + "_add", tmp, tmp, t3),
            c.call(f2mPrefix + "_mul", x4, x5, tmp),
            c.call(f2mPrefix + "_mul", x5, c.i32_const(pNonResidueF6), t4),
            c.call(f2mPrefix + "_add", x4, t4, t4),
            c.call(f2mPrefix + "_add", x4, x5, AUX),
            c.call(f2mPrefix + "_mul", AUX, t4, t4),
            c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t4, AUX, t4),
            c.call(f2mPrefix + "_add", tmp, tmp, t5),
            c.call(f2mPrefix + "_sub", t0, x0, r0),
            c.call(f2mPrefix + "_add", r0, r0, r0),
            c.call(f2mPrefix + "_add", t0, r0, r0),
            c.call(f2mPrefix + "_add", t1, x1, r1),
            c.call(f2mPrefix + "_add", r1, r1, r1),
            c.call(f2mPrefix + "_add", t1, r1, r1),
            c.call(f2mPrefix + "_mul", t5, c.i32_const(pAltBn128Twist), AUX),
            c.call(f2mPrefix + "_add", AUX, x2, r2),
            c.call(f2mPrefix + "_add", r2, r2, r2),
            c.call(f2mPrefix + "_add", AUX, r2, r2),
            c.call(f2mPrefix + "_sub", t4, x3, r3),
            c.call(f2mPrefix + "_add", r3, r3, r3),
            c.call(f2mPrefix + "_add", t4, r3, r3),
            c.call(f2mPrefix + "_sub", t2, x4, r4),
            c.call(f2mPrefix + "_add", r4, r4, r4),
            c.call(f2mPrefix + "_add", t2, r4, r4),
            c.call(f2mPrefix + "_add", t3, x5, r5),
            c.call(f2mPrefix + "_add", r5, r5, r5),
            c.call(f2mPrefix + "_add", t3, r5, r5)
          );
        }
        function buildCyclotomicExp(exponent, fnName) {
          const exponentNafBytes = naf2(exponent).map((b) => b == -1 ? 255 : b);
          const pExponentNafBytes = module2.alloc(exponentNafBytes);
          const f = module2.addFunction(prefix + "__cyclotomicExp_" + fnName);
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          f.addLocal("bit", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("x");
          const res = c.getLocal("r");
          const inverse = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(ftmPrefix + "_conjugate", x, inverse),
            c.call(ftmPrefix + "_one", res),
            c.if(
              c.teeLocal("bit", c.i32_load8_s(c.i32_const(exponentNafBytes.length - 1), pExponentNafBytes)),
              c.if(
                c.i32_eq(
                  c.getLocal("bit"),
                  c.i32_const(1)
                ),
                c.call(ftmPrefix + "_mul", res, x, res),
                c.call(ftmPrefix + "_mul", res, inverse, res)
              )
            ),
            c.setLocal("i", c.i32_const(exponentNafBytes.length - 2)),
            c.block(c.loop(
              c.call(prefix + "__cyclotomicSquare", res, res),
              c.if(
                c.teeLocal("bit", c.i32_load8_s(c.getLocal("i"), pExponentNafBytes)),
                c.if(
                  c.i32_eq(
                    c.getLocal("bit"),
                    c.i32_const(1)
                  ),
                  c.call(ftmPrefix + "_mul", res, x, res),
                  c.call(ftmPrefix + "_mul", res, inverse, res)
                )
              ),
              c.br_if(1, c.i32_eqz(c.getLocal("i"))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildFinalExponentiationLastChunk() {
          buildCyclotomicSquare();
          buildCyclotomicExp(finalExpZ, "w0");
          const f = module2.addFunction(prefix + "__finalExponentiationLastChunk");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const elt = c.getLocal("x");
          const result = c.getLocal("r");
          const A = c.i32_const(module2.alloc(ftsize));
          const B = c.i32_const(module2.alloc(ftsize));
          const C = c.i32_const(module2.alloc(ftsize));
          const D = c.i32_const(module2.alloc(ftsize));
          const E = c.i32_const(module2.alloc(ftsize));
          const F = c.i32_const(module2.alloc(ftsize));
          const G = c.i32_const(module2.alloc(ftsize));
          const H = c.i32_const(module2.alloc(ftsize));
          const I = c.i32_const(module2.alloc(ftsize));
          const J = c.i32_const(module2.alloc(ftsize));
          const K = c.i32_const(module2.alloc(ftsize));
          const L = c.i32_const(module2.alloc(ftsize));
          const M = c.i32_const(module2.alloc(ftsize));
          const N = c.i32_const(module2.alloc(ftsize));
          const O = c.i32_const(module2.alloc(ftsize));
          const P = c.i32_const(module2.alloc(ftsize));
          const Q = c.i32_const(module2.alloc(ftsize));
          const R = c.i32_const(module2.alloc(ftsize));
          const S = c.i32_const(module2.alloc(ftsize));
          const T = c.i32_const(module2.alloc(ftsize));
          const U = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(prefix + "__cyclotomicExp_w0", elt, A),
            finalExpIsNegative ? [] : c.call(ftmPrefix + "_conjugate", A, A),
            c.call(prefix + "__cyclotomicSquare", A, B),
            c.call(prefix + "__cyclotomicSquare", B, C),
            c.call(ftmPrefix + "_mul", C, B, D),
            c.call(prefix + "__cyclotomicExp_w0", D, E),
            finalExpIsNegative ? [] : c.call(ftmPrefix + "_conjugate", E, E),
            c.call(prefix + "__cyclotomicSquare", E, F),
            c.call(prefix + "__cyclotomicExp_w0", F, G),
            finalExpIsNegative ? [] : c.call(ftmPrefix + "_conjugate", G, G),
            c.call(ftmPrefix + "_conjugate", D, H),
            c.call(ftmPrefix + "_conjugate", G, I),
            c.call(ftmPrefix + "_mul", I, E, J),
            c.call(ftmPrefix + "_mul", J, H, K),
            c.call(ftmPrefix + "_mul", K, B, L),
            c.call(ftmPrefix + "_mul", K, E, M),
            c.call(ftmPrefix + "_mul", M, elt, N),
            c.call(prefix + "__frobeniusMap1", L, O),
            c.call(ftmPrefix + "_mul", O, N, P),
            c.call(prefix + "__frobeniusMap2", K, Q),
            c.call(ftmPrefix + "_mul", Q, P, R),
            c.call(ftmPrefix + "_conjugate", elt, S),
            c.call(ftmPrefix + "_mul", S, L, T),
            c.call(prefix + "__frobeniusMap3", T, U),
            c.call(ftmPrefix + "_mul", U, R, result)
          );
        }
        function buildFinalExponentiation() {
          buildFinalExponentiationFirstChunk();
          buildFinalExponentiationLastChunk();
          const f = module2.addFunction(prefix + "_finalExponentiation");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const elt = c.getLocal("x");
          const result = c.getLocal("r");
          const eltToFirstChunk = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(prefix + "__finalExponentiationFirstChunk", elt, eltToFirstChunk),
            c.call(prefix + "__finalExponentiationLastChunk", eltToFirstChunk, result)
          );
        }
        function buildFinalExponentiationOld() {
          const f = module2.addFunction(prefix + "_finalExponentiationOld");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const exponent = 552484233613224096312617126783173147097382103762957654188882734314196910839907541213974502761540629817009608548654680343627701153829446747810907373256841551006201639677726139946029199968412598804882391702273019083653272047566316584365559776493027495458238373902875937659943504873220554161550525926302303331747463515644711876653177129578303191095900909191624817826566688241804408081892785725967931714097716709526092261278071952560171111444072049229123565057483750161460024353346284167282452756217662335528813519139808291170539072125381230815729071544861602750936964829313608137325426383735122175229541155376346436093930287402089517426973178917569713384748081827255472576937471496195752727188261435633271238710131736096299798168852925540549342330775279877006784354801422249722573783561685179618816480037695005515426162362431072245638324744480n;
          const pExponent = module2.alloc(utils.bigInt2BytesLE(exponent, 352));
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(ftmPrefix + "_exp", c.getLocal("x"), c.i32_const(pExponent), c.i32_const(352), c.getLocal("r"))
          );
        }
        const pPreP = module2.alloc(prePSize);
        const pPreQ = module2.alloc(preQSize);
        function buildPairingEquation(nPairings) {
          const f = module2.addFunction(prefix + "_pairingEq" + nPairings);
          for (let i = 0; i < nPairings; i++) {
            f.addParam("p_" + i, "i32");
            f.addParam("q_" + i, "i32");
          }
          f.addParam("c", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const resT = c.i32_const(module2.alloc(ftsize));
          const auxT = c.i32_const(module2.alloc(ftsize));
          f.addCode(c.call(ftmPrefix + "_one", resT));
          for (let i = 0; i < nPairings; i++) {
            f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p_" + i), c.i32_const(pPreP)));
            f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q_" + i), c.i32_const(pPreQ)));
            f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), auxT));
            f.addCode(c.call(ftmPrefix + "_mul", resT, auxT, resT));
          }
          f.addCode(c.call(prefix + "_finalExponentiation", resT, resT));
          f.addCode(c.call(ftmPrefix + "_eq", resT, c.getLocal("c")));
        }
        function buildPairing2() {
          const f = module2.addFunction(prefix + "_pairing");
          f.addParam("p", "i32");
          f.addParam("q", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const resT = c.i32_const(module2.alloc(ftsize));
          f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p"), c.i32_const(pPreP)));
          f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q"), c.i32_const(pPreQ)));
          f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), resT));
          f.addCode(c.call(prefix + "_finalExponentiation", resT, c.getLocal("r")));
        }
        buildPrepAddStep();
        buildPrepDoubleStep();
        buildPrepareG1();
        buildPrepareG2();
        buildMulBy024();
        buildMulBy024Old();
        buildMillerLoop();
        for (let i = 0; i < 10; i++) {
          buildFrobeniusMap(i);
          module2.exportFunction(prefix + "__frobeniusMap" + i);
        }
        buildFinalExponentiationOld();
        buildFinalExponentiation();
        for (let i = 1; i <= 5; i++) {
          buildPairingEquation(i);
          module2.exportFunction(prefix + "_pairingEq" + i);
        }
        buildPairing2();
        module2.exportFunction(prefix + "_pairing");
        module2.exportFunction(prefix + "_prepareG1");
        module2.exportFunction(prefix + "_prepareG2");
        module2.exportFunction(prefix + "_millerLoop");
        module2.exportFunction(prefix + "_finalExponentiation");
        module2.exportFunction(prefix + "_finalExponentiationOld");
        module2.exportFunction(prefix + "__mulBy024");
        module2.exportFunction(prefix + "__mulBy024Old");
        module2.exportFunction(prefix + "__cyclotomicSquare");
        module2.exportFunction(prefix + "__cyclotomicExp_w0");
      };
    }
  });

  // node_modules/wasmcurves/src/bls12381/build_bls12381.js
  var require_build_bls12381 = __commonJS({
    "node_modules/wasmcurves/src/bls12381/build_bls12381.js"(exports, module) {
      var utils = require_utils();
      var buildF1m = require_build_f1m();
      var buildF1 = require_build_f1();
      var buildF2m = require_build_f2m();
      var buildF3m = require_build_f3m();
      var buildCurve = require_build_curve_jacobian_a0();
      var buildFFT2 = require_build_fft();
      var buildPol = require_build_pol();
      var buildQAP = require_build_qap();
      var buildApplyKey = require_build_applykey();
      var { bitLength: bitLength3, isOdd: isOdd2, isNegative: isNegative3 } = require_bigint();
      module.exports = function buildBLS12381(module2, _prefix) {
        const prefix = _prefix || "bls12381";
        if (module2.modules[prefix])
          return prefix;
        const q = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
        const r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n;
        const n64q = Math.floor((bitLength3(q - 1n) - 1) / 64) + 1;
        const n8q = n64q * 8;
        const f1size = n8q;
        const f2size = f1size * 2;
        const ftsize = f1size * 12;
        const n64r = Math.floor((bitLength3(r - 1n) - 1) / 64) + 1;
        const n8r = n64r * 8;
        const frsize = n8r;
        const pr = module2.alloc(utils.bigInt2BytesLE(r, frsize));
        const f1mPrefix = buildF1m(module2, q, "f1m", "intq");
        buildF1(module2, r, "fr", "frm", "intr");
        const pG1b = module2.alloc(utils.bigInt2BytesLE(toMontgomery(4n), f1size));
        const g1mPrefix = buildCurve(module2, "g1m", "f1m", pG1b);
        buildFFT2(module2, "frm", "frm", "frm", "frm_mul");
        buildPol(module2, "pol", "frm");
        buildQAP(module2, "qap", "frm");
        const f2mPrefix = buildF2m(module2, "f1m_neg", "f2m", "f1m");
        const pG2b = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(4n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(4n), f1size)
        ]);
        const g2mPrefix = buildCurve(module2, "g2m", "f2m", pG2b);
        function buildGTimesFr(fnName, opMul) {
          const f = module2.addFunction(fnName);
          f.addParam("pG", "i32");
          f.addParam("pFr", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const AUX = c.i32_const(module2.alloc(n8r));
          f.addCode(
            c.call("frm_fromMontgomery", c.getLocal("pFr"), AUX),
            c.call(
              opMul,
              c.getLocal("pG"),
              AUX,
              c.i32_const(n8r),
              c.getLocal("pr")
            )
          );
          module2.exportFunction(fnName);
        }
        buildGTimesFr("g1m_timesFr", "g1m_timesScalar");
        buildFFT2(module2, "g1m", "g1m", "frm", "g1m_timesFr");
        buildGTimesFr("g2m_timesFr", "g2m_timesScalar");
        buildFFT2(module2, "g2m", "g2m", "frm", "g2m_timesFr");
        buildGTimesFr("g1m_timesFrAffine", "g1m_timesScalarAffine");
        buildGTimesFr("g2m_timesFrAffine", "g2m_timesScalarAffine");
        buildApplyKey(module2, "frm_batchApplyKey", "fmr", "frm", n8r, n8r, n8r, "frm_mul");
        buildApplyKey(module2, "g1m_batchApplyKey", "g1m", "frm", n8q * 3, n8q * 3, n8r, "g1m_timesFr");
        buildApplyKey(module2, "g1m_batchApplyKeyMixed", "g1m", "frm", n8q * 2, n8q * 3, n8r, "g1m_timesFrAffine");
        buildApplyKey(module2, "g2m_batchApplyKey", "g2m", "frm", n8q * 2 * 3, n8q * 3 * 2, n8r, "g2m_timesFr");
        buildApplyKey(module2, "g2m_batchApplyKeyMixed", "g2m", "frm", n8q * 2 * 2, n8q * 3 * 2, n8r, "g2m_timesFrAffine");
        function toMontgomery(a) {
          return BigInt(a) * (1n << BigInt(f1size * 8)) % q;
        }
        const G1gen = [
          3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n,
          1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n,
          1n
        ];
        const pG1gen = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1gen[2]), f1size)
          ]
        );
        const G1zero = [
          0n,
          1n,
          0n
        ];
        const pG1zero = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G1zero[2]), f1size)
          ]
        );
        const G2gen = [
          [
            352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160n,
            3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758n
          ],
          [
            1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905n,
            927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582n
          ],
          [
            1n,
            0n
          ]
        ];
        const pG2gen = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[0][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[0][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[1][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[1][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[2][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2gen[2][1]), f1size)
          ]
        );
        const G2zero = [
          [
            0n,
            0n
          ],
          [
            1n,
            0n
          ],
          [
            0n,
            0n
          ]
        ];
        const pG2zero = module2.alloc(
          [
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[0][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[0][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[1][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[1][1]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[2][0]), f1size),
            ...utils.bigInt2BytesLE(toMontgomery(G2zero[2][1]), f1size)
          ]
        );
        const pOneT = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(1n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(0n), f1size)
        ]);
        const pBls12381Twist = module2.alloc([
          ...utils.bigInt2BytesLE(toMontgomery(1n), f1size),
          ...utils.bigInt2BytesLE(toMontgomery(1n), f1size)
        ]);
        function build_mulNR2() {
          const f = module2.addFunction(f2mPrefix + "_mulNR");
          f.addParam("x", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const x0c = c.i32_const(module2.alloc(f1size));
          const x0 = c.getLocal("x");
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1size));
          const r0 = c.getLocal("pr");
          const r1 = c.i32_add(c.getLocal("pr"), c.i32_const(f1size));
          f.addCode(
            c.call(f1mPrefix + "_copy", x0, x0c),
            c.call(f1mPrefix + "_sub", x0, x1, r0),
            c.call(f1mPrefix + "_add", x0c, x1, r1)
          );
        }
        build_mulNR2();
        const f6mPrefix = buildF3m(module2, f2mPrefix + "_mulNR", "f6m", "f2m");
        function build_mulNR6() {
          const f = module2.addFunction(f6mPrefix + "_mulNR");
          f.addParam("x", "i32");
          f.addParam("pr", "i32");
          const c = f.getCodeBuilder();
          const c0copy = c.i32_const(module2.alloc(f1size * 2));
          f.addCode(
            c.call(
              f2mPrefix + "_copy",
              c.getLocal("x"),
              c0copy
            ),
            c.call(
              f2mPrefix + "_mulNR",
              c.i32_add(c.getLocal("x"), c.i32_const(n8q * 4)),
              c.getLocal("pr")
            ),
            c.call(
              f2mPrefix + "_copy",
              c.i32_add(c.getLocal("x"), c.i32_const(n8q * 2)),
              c.i32_add(c.getLocal("pr"), c.i32_const(n8q * 4))
            ),
            c.call(
              f2mPrefix + "_copy",
              c0copy,
              c.i32_add(c.getLocal("pr"), c.i32_const(n8q * 2))
            )
          );
        }
        build_mulNR6();
        const ftmPrefix = buildF2m(module2, f6mPrefix + "_mulNR", "ftm", f6mPrefix);
        const ateLoopCount = 0xd201000000010000n;
        const ateLoopBitBytes = bits2(ateLoopCount);
        const pAteLoopBitBytes = module2.alloc(ateLoopBitBytes);
        const isLoopNegative = true;
        const ateCoefSize = 3 * f2size;
        const ateNDblCoefs = ateLoopBitBytes.length - 1;
        const ateNAddCoefs = ateLoopBitBytes.reduce((acc, b) => acc + (b != 0 ? 1 : 0), 0);
        const ateNCoefs = ateNAddCoefs + ateNDblCoefs + 1;
        const prePSize = 3 * 2 * n8q;
        const preQSize = 3 * n8q * 2 + ateNCoefs * ateCoefSize;
        const finalExpIsNegative = true;
        const finalExpZ = 15132376222941642752n;
        module2.modules[prefix] = {
          n64q,
          n64r,
          n8q,
          n8r,
          pG1gen,
          pG1zero,
          pG1b,
          pG2gen,
          pG2zero,
          pG2b,
          pq: module2.modules["f1m"].pq,
          pr,
          pOneT,
          r,
          q,
          prePSize,
          preQSize
        };
        function naf2(n) {
          let E = n;
          const res = [];
          while (E > 0n) {
            if (isOdd2(E)) {
              const z = 2 - Number(E % 4n);
              res.push(z);
              E = E - BigInt(z);
            } else {
              res.push(0);
            }
            E = E >> 1n;
          }
          return res;
        }
        function bits2(n) {
          let E = n;
          const res = [];
          while (E > 0n) {
            if (isOdd2(E)) {
              res.push(1);
            } else {
              res.push(0);
            }
            E = E >> 1n;
          }
          return res;
        }
        function buildPrepareG1() {
          const f = module2.addFunction(prefix + "_prepareG1");
          f.addParam("pP", "i32");
          f.addParam("ppreP", "i32");
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(g1mPrefix + "_normalize", c.getLocal("pP"), c.getLocal("ppreP"))
          );
        }
        function buildPrepDoubleStep() {
          const f = module2.addFunction(prefix + "_prepDblStep");
          f.addParam("R", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const Rx = c.getLocal("R");
          const Ry = c.i32_add(c.getLocal("R"), c.i32_const(2 * n8q));
          const Rz = c.i32_add(c.getLocal("R"), c.i32_const(4 * n8q));
          const t0 = c.getLocal("r");
          const t3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * n8q));
          const t6 = c.i32_add(c.getLocal("r"), c.i32_const(4 * n8q));
          const zsquared = c.i32_const(module2.alloc(f2size));
          const t1 = c.i32_const(module2.alloc(f2size));
          const t2 = c.i32_const(module2.alloc(f2size));
          const t4 = c.i32_const(module2.alloc(f2size));
          const t5 = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_square", Rx, t0),
            c.call(f2mPrefix + "_square", Ry, t1),
            c.call(f2mPrefix + "_square", t1, t2),
            c.call(f2mPrefix + "_add", t1, Rx, t3),
            c.call(f2mPrefix + "_square", t3, t3),
            c.call(f2mPrefix + "_sub", t3, t0, t3),
            c.call(f2mPrefix + "_sub", t3, t2, t3),
            c.call(f2mPrefix + "_add", t3, t3, t3),
            c.call(f2mPrefix + "_add", t0, t0, t4),
            c.call(f2mPrefix + "_add", t4, t0, t4),
            c.call(f2mPrefix + "_add", Rx, t4, t6),
            c.call(f2mPrefix + "_square", t4, t5),
            c.call(f2mPrefix + "_square", Rz, zsquared),
            c.call(f2mPrefix + "_sub", t5, t3, Rx),
            c.call(f2mPrefix + "_sub", Rx, t3, Rx),
            c.call(f2mPrefix + "_add", Rz, Ry, Rz),
            c.call(f2mPrefix + "_square", Rz, Rz),
            c.call(f2mPrefix + "_sub", Rz, t1, Rz),
            c.call(f2mPrefix + "_sub", Rz, zsquared, Rz),
            c.call(f2mPrefix + "_sub", t3, Rx, Ry),
            c.call(f2mPrefix + "_mul", Ry, t4, Ry),
            c.call(f2mPrefix + "_add", t2, t2, t2),
            c.call(f2mPrefix + "_add", t2, t2, t2),
            c.call(f2mPrefix + "_add", t2, t2, t2),
            c.call(f2mPrefix + "_sub", Ry, t2, Ry),
            c.call(f2mPrefix + "_mul", t4, zsquared, t3),
            c.call(f2mPrefix + "_add", t3, t3, t3),
            c.call(f2mPrefix + "_neg", t3, t3),
            c.call(f2mPrefix + "_square", t6, t6),
            c.call(f2mPrefix + "_sub", t6, t0, t6),
            c.call(f2mPrefix + "_sub", t6, t5, t6),
            c.call(f2mPrefix + "_add", t1, t1, t1),
            c.call(f2mPrefix + "_add", t1, t1, t1),
            c.call(f2mPrefix + "_sub", t6, t1, t6),
            c.call(f2mPrefix + "_mul", Rz, zsquared, t0),
            c.call(f2mPrefix + "_add", t0, t0, t0)
          );
        }
        function buildPrepAddStep() {
          const f = module2.addFunction(prefix + "_prepAddStep");
          f.addParam("R", "i32");
          f.addParam("Q", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const Rx = c.getLocal("R");
          const Ry = c.i32_add(c.getLocal("R"), c.i32_const(2 * n8q));
          const Rz = c.i32_add(c.getLocal("R"), c.i32_const(4 * n8q));
          const Qx = c.getLocal("Q");
          const Qy = c.i32_add(c.getLocal("Q"), c.i32_const(2 * n8q));
          const t10 = c.getLocal("r");
          const t1 = c.i32_add(c.getLocal("r"), c.i32_const(2 * n8q));
          const t9 = c.i32_add(c.getLocal("r"), c.i32_const(4 * n8q));
          const zsquared = c.i32_const(module2.alloc(f2size));
          const ysquared = c.i32_const(module2.alloc(f2size));
          const ztsquared = c.i32_const(module2.alloc(f2size));
          const t0 = c.i32_const(module2.alloc(f2size));
          const t2 = c.i32_const(module2.alloc(f2size));
          const t3 = c.i32_const(module2.alloc(f2size));
          const t4 = c.i32_const(module2.alloc(f2size));
          const t5 = c.i32_const(module2.alloc(f2size));
          const t6 = c.i32_const(module2.alloc(f2size));
          const t7 = c.i32_const(module2.alloc(f2size));
          const t8 = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_square", Rz, zsquared),
            c.call(f2mPrefix + "_square", Qy, ysquared),
            c.call(f2mPrefix + "_mul", zsquared, Qx, t0),
            c.call(f2mPrefix + "_add", Qy, Rz, t1),
            c.call(f2mPrefix + "_square", t1, t1),
            c.call(f2mPrefix + "_sub", t1, ysquared, t1),
            c.call(f2mPrefix + "_sub", t1, zsquared, t1),
            c.call(f2mPrefix + "_mul", t1, zsquared, t1),
            c.call(f2mPrefix + "_sub", t0, Rx, t2),
            c.call(f2mPrefix + "_square", t2, t3),
            c.call(f2mPrefix + "_add", t3, t3, t4),
            c.call(f2mPrefix + "_add", t4, t4, t4),
            c.call(f2mPrefix + "_mul", t4, t2, t5),
            c.call(f2mPrefix + "_sub", t1, Ry, t6),
            c.call(f2mPrefix + "_sub", t6, Ry, t6),
            c.call(f2mPrefix + "_mul", t6, Qx, t9),
            c.call(f2mPrefix + "_mul", t4, Rx, t7),
            c.call(f2mPrefix + "_square", t6, Rx),
            c.call(f2mPrefix + "_sub", Rx, t5, Rx),
            c.call(f2mPrefix + "_sub", Rx, t7, Rx),
            c.call(f2mPrefix + "_sub", Rx, t7, Rx),
            c.call(f2mPrefix + "_add", Rz, t2, Rz),
            c.call(f2mPrefix + "_square", Rz, Rz),
            c.call(f2mPrefix + "_sub", Rz, zsquared, Rz),
            c.call(f2mPrefix + "_sub", Rz, t3, Rz),
            c.call(f2mPrefix + "_add", Qy, Rz, t10),
            c.call(f2mPrefix + "_sub", t7, Rx, t8),
            c.call(f2mPrefix + "_mul", t8, t6, t8),
            c.call(f2mPrefix + "_mul", Ry, t5, t0),
            c.call(f2mPrefix + "_add", t0, t0, t0),
            c.call(f2mPrefix + "_sub", t8, t0, Ry),
            c.call(f2mPrefix + "_square", t10, t10),
            c.call(f2mPrefix + "_sub", t10, ysquared, t10),
            c.call(f2mPrefix + "_square", Rz, ztsquared),
            c.call(f2mPrefix + "_sub", t10, ztsquared, t10),
            c.call(f2mPrefix + "_add", t9, t9, t9),
            c.call(f2mPrefix + "_sub", t9, t10, t9),
            c.call(f2mPrefix + "_add", Rz, Rz, t10),
            c.call(f2mPrefix + "_neg", t6, t6),
            c.call(f2mPrefix + "_add", t6, t6, t1)
          );
        }
        function buildPrepareG2() {
          const f = module2.addFunction(prefix + "_prepareG2");
          f.addParam("pQ", "i32");
          f.addParam("ppreQ", "i32");
          f.addLocal("pCoef", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const Q = c.getLocal("pQ");
          const pR = module2.alloc(f2size * 3);
          const R = c.i32_const(pR);
          const base = c.getLocal("ppreQ");
          f.addCode(
            c.call(g2mPrefix + "_normalize", Q, base),
            c.if(
              c.call(g2mPrefix + "_isZero", base),
              c.ret([])
            ),
            c.call(g2mPrefix + "_copy", base, R),
            c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3)))
          );
          f.addCode(
            c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
            c.block(c.loop(
              c.call(prefix + "_prepDblStep", R, c.getLocal("pCoef")),
              c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
              c.if(
                c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
                [
                  ...c.call(prefix + "_prepAddStep", R, base, c.getLocal("pCoef")),
                  ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
                ]
              ),
              c.br_if(1, c.i32_eqz(c.getLocal("i"))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
        }
        function buildF6Mul1() {
          const f = module2.addFunction(f6mPrefix + "_mul1");
          f.addParam("pA", "i32");
          f.addParam("pC1", "i32");
          f.addParam("pR", "i32");
          const c = f.getCodeBuilder();
          const A_c0 = c.getLocal("pA");
          const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 2));
          const A_c2 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 4));
          const c1 = c.getLocal("pC1");
          const t1 = c.getLocal("pR");
          const t2 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 2));
          const b_b = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 4));
          const Ac0_Ac1 = c.i32_const(module2.alloc(f1size * 2));
          const Ac1_Ac2 = c.i32_const(module2.alloc(f1size * 2));
          f.addCode(
            c.call(f2mPrefix + "_add", A_c0, A_c1, Ac0_Ac1),
            c.call(f2mPrefix + "_add", A_c1, A_c2, Ac1_Ac2),
            c.call(f2mPrefix + "_mul", A_c1, c1, b_b),
            c.call(f2mPrefix + "_mul", Ac1_Ac2, c1, t1),
            c.call(f2mPrefix + "_sub", t1, b_b, t1),
            c.call(f2mPrefix + "_mulNR", t1, t1),
            c.call(f2mPrefix + "_mul", Ac0_Ac1, c1, t2),
            c.call(f2mPrefix + "_sub", t2, b_b, t2)
          );
        }
        buildF6Mul1();
        function buildF6Mul01() {
          const f = module2.addFunction(f6mPrefix + "_mul01");
          f.addParam("pA", "i32");
          f.addParam("pC0", "i32");
          f.addParam("pC1", "i32");
          f.addParam("pR", "i32");
          const c = f.getCodeBuilder();
          const A_c0 = c.getLocal("pA");
          const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 2));
          const A_c2 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 4));
          const c0 = c.getLocal("pC0");
          const c1 = c.getLocal("pC1");
          const t1 = c.getLocal("pR");
          const t2 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 2));
          const t3 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 4));
          const a_a = c.i32_const(module2.alloc(f1size * 2));
          const b_b = c.i32_const(module2.alloc(f1size * 2));
          const Ac0_Ac1 = c.i32_const(module2.alloc(f1size * 2));
          const Ac0_Ac2 = c.i32_const(module2.alloc(f1size * 2));
          f.addCode(
            c.call(f2mPrefix + "_mul", A_c0, c0, a_a),
            c.call(f2mPrefix + "_mul", A_c1, c1, b_b),
            c.call(f2mPrefix + "_add", A_c0, A_c1, Ac0_Ac1),
            c.call(f2mPrefix + "_add", A_c0, A_c2, Ac0_Ac2),
            c.call(f2mPrefix + "_add", A_c1, A_c2, t1),
            c.call(f2mPrefix + "_mul", t1, c1, t1),
            c.call(f2mPrefix + "_sub", t1, b_b, t1),
            c.call(f2mPrefix + "_mulNR", t1, t1),
            c.call(f2mPrefix + "_add", t1, a_a, t1),
            c.call(f2mPrefix + "_add", c0, c1, t2),
            c.call(f2mPrefix + "_mul", t2, Ac0_Ac1, t2),
            c.call(f2mPrefix + "_sub", t2, a_a, t2),
            c.call(f2mPrefix + "_sub", t2, b_b, t2),
            c.call(f2mPrefix + "_mul", Ac0_Ac2, c0, t3),
            c.call(f2mPrefix + "_sub", t3, a_a, t3),
            c.call(f2mPrefix + "_add", t3, b_b, t3)
          );
        }
        buildF6Mul01();
        function buildF12Mul014() {
          const f = module2.addFunction(ftmPrefix + "_mul014");
          f.addParam("pA", "i32");
          f.addParam("pC0", "i32");
          f.addParam("pC1", "i32");
          f.addParam("pC4", "i32");
          f.addParam("pR", "i32");
          const c = f.getCodeBuilder();
          const A_c0 = c.getLocal("pA");
          const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 6));
          const c0 = c.getLocal("pC0");
          const c1 = c.getLocal("pC1");
          const c4 = c.getLocal("pC4");
          const aa = c.i32_const(module2.alloc(f1size * 6));
          const bb = c.i32_const(module2.alloc(f1size * 6));
          const o = c.i32_const(module2.alloc(f1size * 2));
          const R_c0 = c.getLocal("pR");
          const R_c1 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 6));
          f.addCode(
            c.call(f6mPrefix + "_mul01", A_c0, c0, c1, aa),
            c.call(f6mPrefix + "_mul1", A_c1, c4, bb),
            c.call(f2mPrefix + "_add", c1, c4, o),
            c.call(f6mPrefix + "_add", A_c1, A_c0, R_c1),
            c.call(f6mPrefix + "_mul01", R_c1, c0, o, R_c1),
            c.call(f6mPrefix + "_sub", R_c1, aa, R_c1),
            c.call(f6mPrefix + "_sub", R_c1, bb, R_c1),
            c.call(f6mPrefix + "_copy", bb, R_c0),
            c.call(f6mPrefix + "_mulNR", R_c0, R_c0),
            c.call(f6mPrefix + "_add", R_c0, aa, R_c0)
          );
        }
        buildF12Mul014();
        function buildELL() {
          const f = module2.addFunction(prefix + "_ell");
          f.addParam("pP", "i32");
          f.addParam("pCoefs", "i32");
          f.addParam("pF", "i32");
          const c = f.getCodeBuilder();
          const Px = c.getLocal("pP");
          const Py = c.i32_add(c.getLocal("pP"), c.i32_const(n8q));
          const F = c.getLocal("pF");
          const coef0_0 = c.getLocal("pCoefs");
          const coef0_1 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size));
          const coef1_0 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 2));
          const coef1_1 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 3));
          const coef2 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 4));
          const pc0 = module2.alloc(f1size * 2);
          const c0 = c.i32_const(pc0);
          const c0_c0 = c.i32_const(pc0);
          const c0_c1 = c.i32_const(pc0 + f1size);
          const pc1 = module2.alloc(f1size * 2);
          const c1 = c.i32_const(pc1);
          const c1_c0 = c.i32_const(pc1);
          const c1_c1 = c.i32_const(pc1 + f1size);
          f.addCode(
            c.call(f1mPrefix + "_mul", coef0_0, Py, c0_c0),
            c.call(f1mPrefix + "_mul", coef0_1, Py, c0_c1),
            c.call(f1mPrefix + "_mul", coef1_0, Px, c1_c0),
            c.call(f1mPrefix + "_mul", coef1_1, Px, c1_c1),
            c.call(ftmPrefix + "_mul014", F, coef2, c1, c0, F)
          );
        }
        buildELL();
        function buildMillerLoop() {
          const f = module2.addFunction(prefix + "_millerLoop");
          f.addParam("ppreP", "i32");
          f.addParam("ppreQ", "i32");
          f.addParam("r", "i32");
          f.addLocal("pCoef", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const preP = c.getLocal("ppreP");
          const coefs = c.getLocal("pCoef");
          const F = c.getLocal("r");
          f.addCode(
            c.call(ftmPrefix + "_one", F),
            c.if(
              c.call(g1mPrefix + "_isZero", preP),
              c.ret([])
            ),
            c.if(
              c.call(g1mPrefix + "_isZero", c.getLocal("ppreQ")),
              c.ret([])
            ),
            c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
            c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
            c.block(c.loop(
              c.call(prefix + "_ell", preP, coefs, F),
              c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
              c.if(
                c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
                [
                  ...c.call(prefix + "_ell", preP, coefs, F),
                  ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
                ]
              ),
              c.call(ftmPrefix + "_square", F, F),
              c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(1))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            )),
            c.call(prefix + "_ell", preP, coefs, F)
          );
          if (isLoopNegative) {
            f.addCode(
              c.call(ftmPrefix + "_conjugate", F, F)
            );
          }
        }
        function buildFrobeniusMap(n) {
          const F12 = [
            [
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n]
            ],
            [
              [1n, 0n],
              [3850754370037169011952147076051364057158807420970682438676050522613628423219637725072182697113062777891589506424760n, 151655185184498381465642749684540099398075398968325446656007613510403227271200139370504932015952886146304766135027n],
              [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620351n, 0n],
              [2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n, 1028732146235106349975324479215795277384839936929757896155643118032610843298655225875571310552543014690878354869257n],
              [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
              [3125332594171059424908108096204648978570118281977575435832422631601824034463382777937621250592425535493320683825557n, 877076961050607968509681729531255177986764537961432449499635504522207616027455086505066378536590128544573588734230n],
              [4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n, 0n],
              [151655185184498381465642749684540099398075398968325446656007613510403227271200139370504932015952886146304766135027n, 3850754370037169011952147076051364057158807420970682438676050522613628423219637725072182697113062777891589506424760n],
              [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
              [1028732146235106349975324479215795277384839936929757896155643118032610843298655225875571310552543014690878354869257n, 2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n],
              [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939437n, 0n],
              [877076961050607968509681729531255177986764537961432449499635504522207616027455086505066378536590128544573588734230n, 3125332594171059424908108096204648978570118281977575435832422631601824034463382777937621250592425535493320683825557n]
            ]
          ];
          const F6 = [
            [
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n],
              [1n, 0n]
            ],
            [
              [1n, 0n],
              [0n, 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n],
              [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
              [0n, 1n],
              [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
              [0n, 793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n]
            ],
            [
              [1n, 0n],
              [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939437n, 0n],
              [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
              [4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n, 0n],
              [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
              [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620351n, 0n]
            ]
          ];
          const f = module2.addFunction(ftmPrefix + "_frobeniusMap" + n);
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          for (let i = 0; i < 6; i++) {
            const X = i == 0 ? c.getLocal("x") : c.i32_add(c.getLocal("x"), c.i32_const(i * f2size));
            const Xc0 = X;
            const Xc1 = c.i32_add(c.getLocal("x"), c.i32_const(i * f2size + f1size));
            const R = i == 0 ? c.getLocal("r") : c.i32_add(c.getLocal("r"), c.i32_const(i * f2size));
            const Rc0 = R;
            const Rc1 = c.i32_add(c.getLocal("r"), c.i32_const(i * f2size + f1size));
            const coef = mul2(F12[Math.floor(i / 3)][n % 12], F6[i % 3][n % 6]);
            const pCoef = module2.alloc([
              ...utils.bigInt2BytesLE(toMontgomery(coef[0]), n8q),
              ...utils.bigInt2BytesLE(toMontgomery(coef[1]), n8q)
            ]);
            if (n % 2 == 1) {
              f.addCode(
                c.call(f1mPrefix + "_copy", Xc0, Rc0),
                c.call(f1mPrefix + "_neg", Xc1, Rc1),
                c.call(f2mPrefix + "_mul", R, c.i32_const(pCoef), R)
              );
            } else {
              f.addCode(c.call(f2mPrefix + "_mul", X, c.i32_const(pCoef), R));
            }
          }
          function mul2(a, b) {
            const ac0 = a[0];
            const ac1 = a[1];
            const bc0 = b[0];
            const bc1 = b[1];
            const res = [
              (ac0 * bc0 - ac1 * bc1) % q,
              (ac0 * bc1 + ac1 * bc0) % q
            ];
            if (isNegative3(res[0]))
              res[0] = res[0] + q;
            return res;
          }
        }
        function buildCyclotomicSquare() {
          const f = module2.addFunction(prefix + "__cyclotomicSquare");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const x0 = c.getLocal("x");
          const x4 = c.i32_add(c.getLocal("x"), c.i32_const(f2size));
          const x3 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f2size));
          const x2 = c.i32_add(c.getLocal("x"), c.i32_const(3 * f2size));
          const x1 = c.i32_add(c.getLocal("x"), c.i32_const(4 * f2size));
          const x5 = c.i32_add(c.getLocal("x"), c.i32_const(5 * f2size));
          const r0 = c.getLocal("r");
          const r4 = c.i32_add(c.getLocal("r"), c.i32_const(f2size));
          const r3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f2size));
          const r2 = c.i32_add(c.getLocal("r"), c.i32_const(3 * f2size));
          const r1 = c.i32_add(c.getLocal("r"), c.i32_const(4 * f2size));
          const r5 = c.i32_add(c.getLocal("r"), c.i32_const(5 * f2size));
          const t0 = c.i32_const(module2.alloc(f2size));
          const t1 = c.i32_const(module2.alloc(f2size));
          const t2 = c.i32_const(module2.alloc(f2size));
          const t3 = c.i32_const(module2.alloc(f2size));
          const t4 = c.i32_const(module2.alloc(f2size));
          const t5 = c.i32_const(module2.alloc(f2size));
          const tmp = c.i32_const(module2.alloc(f2size));
          const AUX = c.i32_const(module2.alloc(f2size));
          f.addCode(
            c.call(f2mPrefix + "_mul", x0, x1, tmp),
            c.call(f2mPrefix + "_mulNR", x1, t0),
            c.call(f2mPrefix + "_add", x0, t0, t0),
            c.call(f2mPrefix + "_add", x0, x1, AUX),
            c.call(f2mPrefix + "_mul", AUX, t0, t0),
            c.call(f2mPrefix + "_mulNR", tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t0, AUX, t0),
            c.call(f2mPrefix + "_add", tmp, tmp, t1),
            c.call(f2mPrefix + "_mul", x2, x3, tmp),
            c.call(f2mPrefix + "_mulNR", x3, t2),
            c.call(f2mPrefix + "_add", x2, t2, t2),
            c.call(f2mPrefix + "_add", x2, x3, AUX),
            c.call(f2mPrefix + "_mul", AUX, t2, t2),
            c.call(f2mPrefix + "_mulNR", tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t2, AUX, t2),
            c.call(f2mPrefix + "_add", tmp, tmp, t3),
            c.call(f2mPrefix + "_mul", x4, x5, tmp),
            c.call(f2mPrefix + "_mulNR", x5, t4),
            c.call(f2mPrefix + "_add", x4, t4, t4),
            c.call(f2mPrefix + "_add", x4, x5, AUX),
            c.call(f2mPrefix + "_mul", AUX, t4, t4),
            c.call(f2mPrefix + "_mulNR", tmp, AUX),
            c.call(f2mPrefix + "_add", tmp, AUX, AUX),
            c.call(f2mPrefix + "_sub", t4, AUX, t4),
            c.call(f2mPrefix + "_add", tmp, tmp, t5),
            c.call(f2mPrefix + "_sub", t0, x0, r0),
            c.call(f2mPrefix + "_add", r0, r0, r0),
            c.call(f2mPrefix + "_add", t0, r0, r0),
            c.call(f2mPrefix + "_add", t1, x1, r1),
            c.call(f2mPrefix + "_add", r1, r1, r1),
            c.call(f2mPrefix + "_add", t1, r1, r1),
            c.call(f2mPrefix + "_mul", t5, c.i32_const(pBls12381Twist), AUX),
            c.call(f2mPrefix + "_add", AUX, x2, r2),
            c.call(f2mPrefix + "_add", r2, r2, r2),
            c.call(f2mPrefix + "_add", AUX, r2, r2),
            c.call(f2mPrefix + "_sub", t4, x3, r3),
            c.call(f2mPrefix + "_add", r3, r3, r3),
            c.call(f2mPrefix + "_add", t4, r3, r3),
            c.call(f2mPrefix + "_sub", t2, x4, r4),
            c.call(f2mPrefix + "_add", r4, r4, r4),
            c.call(f2mPrefix + "_add", t2, r4, r4),
            c.call(f2mPrefix + "_add", t3, x5, r5),
            c.call(f2mPrefix + "_add", r5, r5, r5),
            c.call(f2mPrefix + "_add", t3, r5, r5)
          );
        }
        function buildCyclotomicExp(exponent, isExpNegative, fnName) {
          const exponentNafBytes = naf2(exponent).map((b) => b == -1 ? 255 : b);
          const pExponentNafBytes = module2.alloc(exponentNafBytes);
          const f = module2.addFunction(prefix + "__cyclotomicExp_" + fnName);
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          f.addLocal("bit", "i32");
          f.addLocal("i", "i32");
          const c = f.getCodeBuilder();
          const x = c.getLocal("x");
          const res = c.getLocal("r");
          const inverse = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(ftmPrefix + "_conjugate", x, inverse),
            c.call(ftmPrefix + "_one", res),
            c.if(
              c.teeLocal("bit", c.i32_load8_s(c.i32_const(exponentNafBytes.length - 1), pExponentNafBytes)),
              c.if(
                c.i32_eq(
                  c.getLocal("bit"),
                  c.i32_const(1)
                ),
                c.call(ftmPrefix + "_mul", res, x, res),
                c.call(ftmPrefix + "_mul", res, inverse, res)
              )
            ),
            c.setLocal("i", c.i32_const(exponentNafBytes.length - 2)),
            c.block(c.loop(
              c.call(prefix + "__cyclotomicSquare", res, res),
              c.if(
                c.teeLocal("bit", c.i32_load8_s(c.getLocal("i"), pExponentNafBytes)),
                c.if(
                  c.i32_eq(
                    c.getLocal("bit"),
                    c.i32_const(1)
                  ),
                  c.call(ftmPrefix + "_mul", res, x, res),
                  c.call(ftmPrefix + "_mul", res, inverse, res)
                )
              ),
              c.br_if(1, c.i32_eqz(c.getLocal("i"))),
              c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
              c.br(0)
            ))
          );
          if (isExpNegative) {
            f.addCode(
              c.call(ftmPrefix + "_conjugate", res, res)
            );
          }
        }
        function buildFinalExponentiation() {
          buildCyclotomicSquare();
          buildCyclotomicExp(finalExpZ, finalExpIsNegative, "w0");
          const f = module2.addFunction(prefix + "_finalExponentiation");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const elt = c.getLocal("x");
          const res = c.getLocal("r");
          const t0 = c.i32_const(module2.alloc(ftsize));
          const t1 = c.i32_const(module2.alloc(ftsize));
          const t2 = c.i32_const(module2.alloc(ftsize));
          const t3 = c.i32_const(module2.alloc(ftsize));
          const t4 = c.i32_const(module2.alloc(ftsize));
          const t5 = c.i32_const(module2.alloc(ftsize));
          const t6 = c.i32_const(module2.alloc(ftsize));
          f.addCode(
            c.call(ftmPrefix + "_frobeniusMap6", elt, t0),
            c.call(ftmPrefix + "_inverse", elt, t1),
            c.call(ftmPrefix + "_mul", t0, t1, t2),
            c.call(ftmPrefix + "_copy", t2, t1),
            c.call(ftmPrefix + "_frobeniusMap2", t2, t2),
            c.call(ftmPrefix + "_mul", t2, t1, t2),
            c.call(prefix + "__cyclotomicSquare", t2, t1),
            c.call(ftmPrefix + "_conjugate", t1, t1),
            c.call(prefix + "__cyclotomicExp_w0", t2, t3),
            c.call(prefix + "__cyclotomicSquare", t3, t4),
            c.call(ftmPrefix + "_mul", t1, t3, t5),
            c.call(prefix + "__cyclotomicExp_w0", t5, t1),
            c.call(prefix + "__cyclotomicExp_w0", t1, t0),
            c.call(prefix + "__cyclotomicExp_w0", t0, t6),
            c.call(ftmPrefix + "_mul", t6, t4, t6),
            c.call(prefix + "__cyclotomicExp_w0", t6, t4),
            c.call(ftmPrefix + "_conjugate", t5, t5),
            c.call(ftmPrefix + "_mul", t4, t5, t4),
            c.call(ftmPrefix + "_mul", t4, t2, t4),
            c.call(ftmPrefix + "_conjugate", t2, t5),
            c.call(ftmPrefix + "_mul", t1, t2, t1),
            c.call(ftmPrefix + "_frobeniusMap3", t1, t1),
            c.call(ftmPrefix + "_mul", t6, t5, t6),
            c.call(ftmPrefix + "_frobeniusMap1", t6, t6),
            c.call(ftmPrefix + "_mul", t3, t0, t3),
            c.call(ftmPrefix + "_frobeniusMap2", t3, t3),
            c.call(ftmPrefix + "_mul", t3, t1, t3),
            c.call(ftmPrefix + "_mul", t3, t6, t3),
            c.call(ftmPrefix + "_mul", t3, t4, res)
          );
        }
        function buildFinalExponentiationOld() {
          const f = module2.addFunction(prefix + "_finalExponentiationOld");
          f.addParam("x", "i32");
          f.addParam("r", "i32");
          const exponent = 322277361516934140462891564586510139908379969514828494218366688025288661041104682794998680497580008899973249814104447692778988208376779573819485263026159588510513834876303014016798809919343532899164848730280942609956670917565618115867287399623286813270357901731510188149934363360381614501334086825442271920079363289954510565375378443704372994881406797882676971082200626541916413184642520269678897559532260949334760604962086348898118982248842634379637598665468817769075878555493752214492790122785850202957575200176084204422751485957336465472324810982833638490904279282696134323072515220044451592646885410572234451732790590013479358343841220074174848221722017083597872017638514103174122784843925578370430843522959600095676285723737049438346544753168912974976791528535276317256904336520179281145394686565050419250614107803233314658825463117900250701199181529205942363159325765991819433914303908860460720581408201373164047773794825411011922305820065611121544561808414055302212057471395719432072209245600258134364584636810093520285711072578721435517884103526483832733289802426157301542744476740008494780363354305116978805620671467071400711358839553375340724899735460480144599782014906586543813292157922220645089192130209334926661588737007768565838519456601560804957985667880395221049249803753582637708560n;
          const pExponent = module2.alloc(utils.bigInt2BytesLE(exponent, 544));
          const c = f.getCodeBuilder();
          f.addCode(
            c.call(ftmPrefix + "_exp", c.getLocal("x"), c.i32_const(pExponent), c.i32_const(544), c.getLocal("r"))
          );
        }
        const pPreP = module2.alloc(prePSize);
        const pPreQ = module2.alloc(preQSize);
        function buildPairingEquation(nPairings) {
          const f = module2.addFunction(prefix + "_pairingEq" + nPairings);
          for (let i = 0; i < nPairings; i++) {
            f.addParam("p_" + i, "i32");
            f.addParam("q_" + i, "i32");
          }
          f.addParam("c", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const resT = c.i32_const(module2.alloc(ftsize));
          const auxT = c.i32_const(module2.alloc(ftsize));
          f.addCode(c.call(ftmPrefix + "_one", resT));
          for (let i = 0; i < nPairings; i++) {
            f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p_" + i), c.i32_const(pPreP)));
            f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q_" + i), c.i32_const(pPreQ)));
            f.addCode(
              c.if(
                c.i32_eqz(c.call(g1mPrefix + "_inGroupAffine", c.i32_const(pPreP))),
                c.ret(c.i32_const(0))
              ),
              c.if(
                c.i32_eqz(c.call(g2mPrefix + "_inGroupAffine", c.i32_const(pPreQ))),
                c.ret(c.i32_const(0))
              )
            );
            f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), auxT));
            f.addCode(c.call(ftmPrefix + "_mul", resT, auxT, resT));
          }
          f.addCode(c.call(prefix + "_finalExponentiation", resT, resT));
          f.addCode(c.call(ftmPrefix + "_eq", resT, c.getLocal("c")));
        }
        function buildPairing2() {
          const f = module2.addFunction(prefix + "_pairing");
          f.addParam("p", "i32");
          f.addParam("q", "i32");
          f.addParam("r", "i32");
          const c = f.getCodeBuilder();
          const resT = c.i32_const(module2.alloc(ftsize));
          f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p"), c.i32_const(pPreP)));
          f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q"), c.i32_const(pPreQ)));
          f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), resT));
          f.addCode(c.call(prefix + "_finalExponentiation", resT, c.getLocal("r")));
        }
        function buildInGroupG2() {
          const f = module2.addFunction(g2mPrefix + "_inGroupAffine");
          f.addParam("p", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const WINV = [
            2001204777610833696708894912867952078278441409969503942666029068062015825245418932221343814564507832018947136279894n,
            2001204777610833696708894912867952078278441409969503942666029068062015825245418932221343814564507832018947136279893n
          ];
          const FROB2X = 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n;
          const FROB3Y = [
            2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n,
            2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n
          ];
          const wInv = c.i32_const(module2.alloc([
            ...utils.bigInt2BytesLE(toMontgomery(WINV[0]), n8q),
            ...utils.bigInt2BytesLE(toMontgomery(WINV[1]), n8q)
          ]));
          const frob2X = c.i32_const(module2.alloc(utils.bigInt2BytesLE(toMontgomery(FROB2X), n8q)));
          const frob3Y = c.i32_const(module2.alloc([
            ...utils.bigInt2BytesLE(toMontgomery(FROB3Y[0]), n8q),
            ...utils.bigInt2BytesLE(toMontgomery(FROB3Y[1]), n8q)
          ]));
          const z = c.i32_const(module2.alloc(utils.bigInt2BytesLE(finalExpZ, 8)));
          const px = c.getLocal("p");
          const py = c.i32_add(c.getLocal("p"), c.i32_const(f2size));
          const aux = c.i32_const(module2.alloc(f1size));
          const x_winv = c.i32_const(module2.alloc(f2size));
          const y_winv = c.i32_const(module2.alloc(f2size));
          const pf2 = module2.alloc(f2size * 2);
          const f2 = c.i32_const(pf2);
          const f2x = c.i32_const(pf2);
          const f2x_c1 = c.i32_const(pf2);
          const f2x_c2 = c.i32_const(pf2 + f1size);
          const f2y = c.i32_const(pf2 + f2size);
          const f2y_c1 = c.i32_const(pf2 + f2size);
          const f2y_c2 = c.i32_const(pf2 + f2size + f1size);
          const pf3 = module2.alloc(f2size * 3);
          const f3 = c.i32_const(pf3);
          const f3x = c.i32_const(pf3);
          const f3x_c1 = c.i32_const(pf3);
          const f3x_c2 = c.i32_const(pf3 + f1size);
          const f3y = c.i32_const(pf3 + f2size);
          const f3y_c1 = c.i32_const(pf3 + f2size);
          const f3y_c2 = c.i32_const(pf3 + f2size + f1size);
          const f3z = c.i32_const(pf3 + f2size * 2);
          f.addCode(
            c.if(
              c.call(g2mPrefix + "_isZeroAffine", c.getLocal("p")),
              c.ret(c.i32_const(1))
            ),
            c.if(
              c.i32_eqz(c.call(g2mPrefix + "_inCurveAffine", c.getLocal("p"))),
              c.ret(c.i32_const(0))
            ),
            c.call(f2mPrefix + "_mul", px, wInv, x_winv),
            c.call(f2mPrefix + "_mul", py, wInv, y_winv),
            c.call(f2mPrefix + "_mul1", x_winv, frob2X, f2x),
            c.call(f2mPrefix + "_neg", y_winv, f2y),
            c.call(f2mPrefix + "_neg", x_winv, f3x),
            c.call(f2mPrefix + "_mul", y_winv, frob3Y, f3y),
            c.call(f1mPrefix + "_sub", f2x_c1, f2x_c2, aux),
            c.call(f1mPrefix + "_add", f2x_c1, f2x_c2, f2x_c2),
            c.call(f1mPrefix + "_copy", aux, f2x_c1),
            c.call(f1mPrefix + "_sub", f2y_c1, f2y_c2, aux),
            c.call(f1mPrefix + "_add", f2y_c1, f2y_c2, f2y_c2),
            c.call(f1mPrefix + "_copy", aux, f2y_c1),
            c.call(f1mPrefix + "_add", f3x_c1, f3x_c2, aux),
            c.call(f1mPrefix + "_sub", f3x_c1, f3x_c2, f3x_c2),
            c.call(f1mPrefix + "_copy", aux, f3x_c1),
            c.call(f1mPrefix + "_sub", f3y_c2, f3y_c1, aux),
            c.call(f1mPrefix + "_add", f3y_c1, f3y_c2, f3y_c2),
            c.call(f1mPrefix + "_copy", aux, f3y_c1),
            c.call(f2mPrefix + "_one", f3z),
            c.call(g2mPrefix + "_timesScalar", f3, z, c.i32_const(8), f3),
            c.call(g2mPrefix + "_addMixed", f3, f2, f3),
            c.ret(
              c.call(g2mPrefix + "_eqMixed", f3, c.getLocal("p"))
            )
          );
          const fInGroup = module2.addFunction(g2mPrefix + "_inGroup");
          fInGroup.addParam("pIn", "i32");
          fInGroup.setReturnType("i32");
          const c2 = fInGroup.getCodeBuilder();
          const aux2 = c2.i32_const(module2.alloc(f2size * 2));
          fInGroup.addCode(
            c2.call(g2mPrefix + "_toAffine", c2.getLocal("pIn"), aux2),
            c2.ret(
              c2.call(g2mPrefix + "_inGroupAffine", aux2)
            )
          );
        }
        function buildInGroupG1() {
          const f = module2.addFunction(g1mPrefix + "_inGroupAffine");
          f.addParam("p", "i32");
          f.setReturnType("i32");
          const c = f.getCodeBuilder();
          const BETA = 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n;
          const BETA2 = 793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n;
          const Z2M1D3 = (finalExpZ * finalExpZ - 1n) / 3n;
          const beta = c.i32_const(module2.alloc(utils.bigInt2BytesLE(toMontgomery(BETA), n8q)));
          const beta2 = c.i32_const(module2.alloc(utils.bigInt2BytesLE(toMontgomery(BETA2), n8q)));
          const z2m1d3 = c.i32_const(module2.alloc(utils.bigInt2BytesLE(Z2M1D3, 16)));
          const px = c.getLocal("p");
          const py = c.i32_add(c.getLocal("p"), c.i32_const(f1size));
          const psp = module2.alloc(f1size * 3);
          const sp = c.i32_const(psp);
          const spx = c.i32_const(psp);
          const spy = c.i32_const(psp + f1size);
          const ps2p = module2.alloc(f1size * 2);
          const s2p = c.i32_const(ps2p);
          const s2px = c.i32_const(ps2p);
          const s2py = c.i32_const(ps2p + f1size);
          f.addCode(
            c.if(
              c.call(g1mPrefix + "_isZeroAffine", c.getLocal("p")),
              c.ret(c.i32_const(1))
            ),
            c.if(
              c.i32_eqz(c.call(g1mPrefix + "_inCurveAffine", c.getLocal("p"))),
              c.ret(c.i32_const(0))
            ),
            c.call(f1mPrefix + "_mul", px, beta, spx),
            c.call(f1mPrefix + "_copy", py, spy),
            c.call(f1mPrefix + "_mul", px, beta2, s2px),
            c.call(f1mPrefix + "_copy", py, s2py),
            c.call(g1mPrefix + "_doubleAffine", sp, sp),
            c.call(g1mPrefix + "_subMixed", sp, c.getLocal("p"), sp),
            c.call(g1mPrefix + "_subMixed", sp, s2p, sp),
            c.call(g1mPrefix + "_timesScalar", sp, z2m1d3, c.i32_const(16), sp),
            c.ret(
              c.call(g1mPrefix + "_eqMixed", sp, s2p)
            )
          );
          const fInGroup = module2.addFunction(g1mPrefix + "_inGroup");
          fInGroup.addParam("pIn", "i32");
          fInGroup.setReturnType("i32");
          const c2 = fInGroup.getCodeBuilder();
          const aux2 = c2.i32_const(module2.alloc(f1size * 2));
          fInGroup.addCode(
            c2.call(g1mPrefix + "_toAffine", c2.getLocal("pIn"), aux2),
            c2.ret(
              c2.call(g1mPrefix + "_inGroupAffine", aux2)
            )
          );
        }
        for (let i = 0; i < 10; i++) {
          buildFrobeniusMap(i);
          module2.exportFunction(ftmPrefix + "_frobeniusMap" + i);
        }
        buildInGroupG1();
        buildInGroupG2();
        buildPrepAddStep();
        buildPrepDoubleStep();
        buildPrepareG1();
        buildPrepareG2();
        buildMillerLoop();
        buildFinalExponentiationOld();
        buildFinalExponentiation();
        for (let i = 1; i <= 5; i++) {
          buildPairingEquation(i);
          module2.exportFunction(prefix + "_pairingEq" + i);
        }
        buildPairing2();
        module2.exportFunction(prefix + "_pairing");
        module2.exportFunction(prefix + "_prepareG1");
        module2.exportFunction(prefix + "_prepareG2");
        module2.exportFunction(prefix + "_millerLoop");
        module2.exportFunction(prefix + "_finalExponentiation");
        module2.exportFunction(prefix + "_finalExponentiationOld");
        module2.exportFunction(prefix + "__cyclotomicSquare");
        module2.exportFunction(prefix + "__cyclotomicExp_w0");
        module2.exportFunction(f6mPrefix + "_mul1");
        module2.exportFunction(f6mPrefix + "_mul01");
        module2.exportFunction(ftmPrefix + "_mul014");
        module2.exportFunction(g1mPrefix + "_inGroupAffine");
        module2.exportFunction(g1mPrefix + "_inGroup");
        module2.exportFunction(g2mPrefix + "_inGroupAffine");
        module2.exportFunction(g2mPrefix + "_inGroup");
      };
    }
  });

  // node_modules/wasmcurves/index.js
  var require_wasmcurves = __commonJS({
    "node_modules/wasmcurves/index.js"(exports, module) {
      module.exports.buildBn128 = require_build_bn128();
      module.exports.buildBls12381 = require_build_bls12381();
      module.exports.buildF1m = require_build_f1m();
    }
  });

  // src/intmax/lib/ffjavascript/utils.js
  function leInt2Buff(n, len) {
    let r = n;
    if (typeof len === "undefined") {
      len = Math.floor((bitLength(n) - 1) / 8) + 1;
      if (len == 0)
        len = 1;
    }
    const buff = new Uint8Array(len);
    const buffV = new DataView(buff.buffer);
    let o = 0;
    while (o < len) {
      if (o + 4 <= len) {
        buffV.setUint32(o, Number(r & BigInt(4294967295)), true);
        o += 4;
        r = r >> BigInt(32);
      } else if (o + 2 <= len) {
        buffV.setUint16(Number(o, r & BigInt(65535)), true);
        o += 2;
        r = r >> BigInt(16);
      } else {
        buffV.setUint8(Number(o, r & BigInt(255)), true);
        o += 1;
        r = r >> BigInt(8);
      }
    }
    if (r) {
      throw new Error("Number does not fit in this length");
    }
    return buff;
  }
  function _revSlow(idx, bits2) {
    let res = 0;
    let a = idx;
    for (let i = 0; i < bits2; i++) {
      res <<= 1;
      res = res | a & 1;
      a >>= 1;
    }
    return res;
  }
  function bitReverse(idx, bits2) {
    return (_revTable[idx >>> 24] | _revTable[idx >>> 16 & 255] << 8 | _revTable[idx >>> 8 & 255] << 16 | _revTable[idx & 255] << 24) >>> 32 - bits2;
  }
  function log22(V) {
    return ((V & 4294901760) !== 0 ? (V &= 4294901760, 16) : 0) | ((V & 4278255360) !== 0 ? (V &= 4278255360, 8) : 0) | ((V & 4042322160) !== 0 ? (V &= 4042322160, 4) : 0) | ((V & 3435973836) !== 0 ? (V &= 3435973836, 2) : 0) | (V & 2863311530) !== 0;
  }
  function buffReverseBits(buff, eSize) {
    const n = buff.byteLength / eSize;
    const bits2 = log22(n);
    if (n != 1 << bits2) {
      throw new Error("Invalid number of pointers");
    }
    for (let i = 0; i < n; i++) {
      const r = bitReverse(i, bits2);
      if (i > r) {
        const tmp = buff.slice(i * eSize, (i + 1) * eSize);
        buff.set(buff.slice(r * eSize, (r + 1) * eSize), i * eSize);
        buff.set(tmp, r * eSize);
      }
    }
  }
  function array2buffer(arr, sG) {
    const buff = new Uint8Array(sG * arr.length);
    for (let i = 0; i < arr.length; i++) {
      buff.set(arr[i], i * sG);
    }
    return buff;
  }
  function buffer2array(buff, sG) {
    const n = buff.byteLength / sG;
    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = buff.slice(i * sG, i * sG + sG);
    }
    return arr;
  }
  var _revTable;
  var init_utils = __esm({
    "src/intmax/lib/ffjavascript/utils.js"() {
      init_scalar();
      _revTable = [];
      for (let i = 0; i < 256; i++) {
        _revTable[i] = _revSlow(i, 8);
      }
    }
  });

  // src/intmax/lib/ffjavascript/bigbuffer.js
  var PAGE_SIZE, BigBuffer;
  var init_bigbuffer = __esm({
    "src/intmax/lib/ffjavascript/bigbuffer.js"() {
      PAGE_SIZE = 1 << 30;
      BigBuffer = class {
        constructor(size) {
          this.buffers = [];
          this.byteLength = size;
          for (let i = 0; i < size; i += PAGE_SIZE) {
            const n = Math.min(size - i, PAGE_SIZE);
            this.buffers.push(new Uint8Array(n));
          }
        }
        slice(fr, to) {
          if (to === void 0)
            to = this.byteLength;
          if (fr === void 0)
            fr = 0;
          const len = to - fr;
          const firstPage = Math.floor(fr / PAGE_SIZE);
          const lastPage = Math.floor((fr + len - 1) / PAGE_SIZE);
          if (firstPage == lastPage || len == 0)
            return this.buffers[firstPage].slice(
              fr % PAGE_SIZE,
              fr % PAGE_SIZE + len
            );
          let buff;
          let p = firstPage;
          let o = fr % PAGE_SIZE;
          let r = len;
          while (r > 0) {
            const l = o + r > PAGE_SIZE ? PAGE_SIZE - o : r;
            const srcView = new Uint8Array(
              this.buffers[p].buffer,
              this.buffers[p].byteOffset + o,
              l
            );
            if (l == len)
              return srcView.slice();
            if (!buff) {
              if (len <= PAGE_SIZE) {
                buff = new Uint8Array(len);
              } else {
                buff = new BigBuffer(len);
              }
            }
            buff.set(srcView, len - r);
            r = r - l;
            p++;
            o = 0;
          }
          return buff;
        }
        set(buff, offset) {
          if (offset === void 0)
            offset = 0;
          const len = buff.byteLength;
          if (len == 0)
            return;
          const firstPage = Math.floor(offset / PAGE_SIZE);
          const lastPage = Math.floor((offset + len - 1) / PAGE_SIZE);
          if (firstPage == lastPage) {
            if (buff instanceof BigBuffer && buff.buffers.length == 1) {
              return this.buffers[firstPage].set(buff.buffers[0], offset % PAGE_SIZE);
            } else {
              return this.buffers[firstPage].set(buff, offset % PAGE_SIZE);
            }
          }
          let p = firstPage;
          let o = offset % PAGE_SIZE;
          let r = len;
          while (r > 0) {
            const l = o + r > PAGE_SIZE ? PAGE_SIZE - o : r;
            const srcView = buff.slice(len - r, len - r + l);
            const dstView = new Uint8Array(
              this.buffers[p].buffer,
              this.buffers[p].byteOffset + o,
              l
            );
            dstView.set(srcView);
            r = r - l;
            p++;
            o = 0;
          }
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/engine_batchconvert.js
  function buildBatchConvert(tm, fnName, sIn, sOut) {
    return async function batchConvert(buffIn) {
      const nPoints = Math.floor(buffIn.byteLength / sIn);
      if (nPoints * sIn !== buffIn.byteLength) {
        throw new Error("Invalid buffer size");
      }
      const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
      const opPromises = [];
      for (let i = 0; i < tm.concurrency; i++) {
        let n;
        if (i < tm.concurrency - 1) {
          n = pointsPerChunk;
        } else {
          n = nPoints - i * pointsPerChunk;
        }
        if (n == 0)
          continue;
        const buffChunk = buffIn.slice(
          i * pointsPerChunk * sIn,
          i * pointsPerChunk * sIn + n * sIn
        );
        const task = [
          { cmd: "ALLOCSET", var: 0, buff: buffChunk },
          { cmd: "ALLOC", var: 1, len: sOut * n },
          {
            cmd: "CALL",
            fnName,
            params: [{ var: 0 }, { val: n }, { var: 1 }]
          },
          { cmd: "GET", out: 0, var: 1, len: sOut * n }
        ];
        opPromises.push(tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      let fullBuffOut;
      if (buffIn instanceof BigBuffer) {
        fullBuffOut = new BigBuffer(nPoints * sOut);
      } else {
        fullBuffOut = new Uint8Array(nPoints * sOut);
      }
      let p = 0;
      for (let i = 0; i < result.length; i++) {
        fullBuffOut.set(result[i][0], p);
        p += result[i][0].byteLength;
      }
      return fullBuffOut;
    };
  }
  var init_engine_batchconvert = __esm({
    "src/intmax/lib/ffjavascript/engine_batchconvert.js"() {
      init_bigbuffer();
    }
  });

  // src/intmax/lib/ffjavascript/wasm_field1.js
  var WasmField1;
  var init_wasm_field1 = __esm({
    "src/intmax/lib/ffjavascript/wasm_field1.js"() {
      init_scalar();
      init_utils();
      init_random();
      init_engine_batchconvert();
      init_bigbuffer();
      WasmField1 = class {
        constructor(tm, prefix, n8, p) {
          this.tm = tm;
          this.prefix = prefix;
          this.p = p;
          this.n8 = n8;
          this.type = "F1";
          this.m = 1;
          this.half = shiftRight(p, one);
          this.bitLength = bitLength(p);
          this.mask = sub(
            shiftLeft(one, this.bitLength),
            one
          );
          this.pOp1 = tm.alloc(n8);
          this.pOp2 = tm.alloc(n8);
          this.pOp3 = tm.alloc(n8);
          this.tm.instance.exports[prefix + "_zero"](this.pOp1);
          this.zero = this.tm.getBuff(this.pOp1, this.n8);
          this.tm.instance.exports[prefix + "_one"](this.pOp1);
          this.one = this.tm.getBuff(this.pOp1, this.n8);
          this.negone = this.neg(this.one);
          this.two = this.add(this.one, this.one);
          this.n64 = Math.floor(n8 / 8);
          this.n32 = Math.floor(n8 / 4);
          if (this.n64 * 8 != this.n8) {
            throw new Error("n8 must be a multiple of 8");
          }
          this.half = shiftRight(this.p, one);
          this.nqr = this.two;
          let r = this.exp(this.nqr, this.half);
          while (!this.eq(r, this.negone)) {
            this.nqr = this.add(this.nqr, this.one);
            r = this.exp(this.nqr, this.half);
          }
          this.shift = this.mul(this.nqr, this.nqr);
          this.shiftInv = this.inv(this.shift);
          this.s = 0;
          let t = sub(this.p, one);
          while (!isOdd(t)) {
            this.s = this.s + 1;
            t = shiftRight(t, one);
          }
          this.w = [];
          this.w[this.s] = this.exp(this.nqr, t);
          for (let i = this.s - 1; i >= 0; i--) {
            this.w[i] = this.square(this.w[i + 1]);
          }
          if (!this.eq(this.w[0], this.one)) {
            throw new Error("Error calculating roots of unity");
          }
          this.batchToMontgomery = buildBatchConvert(
            tm,
            prefix + "_batchToMontgomery",
            this.n8,
            this.n8
          );
          this.batchFromMontgomery = buildBatchConvert(
            tm,
            prefix + "_batchFromMontgomery",
            this.n8,
            this.n8
          );
        }
        op2(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op2Bool(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2
          );
        }
        op1(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op1Bool(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp3
          );
        }
        add(a, b) {
          return this.op2("_add", a, b);
        }
        eq(a, b) {
          return this.op2Bool("_eq", a, b);
        }
        isZero(a) {
          return this.op1Bool("_isZero", a);
        }
        sub(a, b) {
          return this.op2("_sub", a, b);
        }
        neg(a) {
          return this.op1("_neg", a);
        }
        inv(a) {
          return this.op1("_inverse", a);
        }
        toMontgomery(a) {
          return this.op1("_toMontgomery", a);
        }
        fromMontgomery(a) {
          return this.op1("_fromMontgomery", a);
        }
        mul(a, b) {
          return this.op2("_mul", a, b);
        }
        div(a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
          this.tm.instance.exports[this.prefix + "_mul"](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        square(a) {
          return this.op1("_square", a);
        }
        isSquare(a) {
          return this.op1Bool("_isSquare", a);
        }
        sqrt(a) {
          return this.op1("_sqrt", a);
        }
        exp(a, b) {
          if (!(b instanceof Uint8Array)) {
            b = toLEBuff(e(b));
          }
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_exp"](
            this.pOp1,
            this.pOp2,
            b.byteLength,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        isNegative(a) {
          return this.op1Bool("_isNegative", a);
        }
        e(a, b) {
          if (a instanceof Uint8Array)
            return a;
          let ra = e(a, b);
          if (isNegative(ra)) {
            ra = neg(ra);
            if (gt(ra, this.p)) {
              ra = mod(ra, this.p);
            }
            ra = sub(this.p, ra);
          } else {
            if (gt(ra, this.p)) {
              ra = mod(ra, this.p);
            }
          }
          const buff = leInt2Buff(ra, this.n8);
          return this.toMontgomery(buff);
        }
        toString(a, radix) {
          const an = this.fromMontgomery(a);
          const s = fromRprLE(an, 0);
          return toString2(s, radix);
        }
        fromRng(rng) {
          let v;
          const buff = new Uint8Array(this.n8);
          do {
            v = zero;
            for (let i = 0; i < this.n64; i++) {
              v = add(v, shiftLeft(rng.nextU64(), 64 * i));
            }
            v = band(v, this.mask);
          } while (geq(v, this.p));
          toRprLE(buff, 0, v, this.n8);
          return buff;
        }
        random() {
          return this.fromRng(getThreadRng());
        }
        toObject(a) {
          const an = this.fromMontgomery(a);
          return fromRprLE(an, 0);
        }
        fromObject(a) {
          const buff = new Uint8Array(this.n8);
          toRprLE(buff, 0, a, this.n8);
          return this.toMontgomery(buff);
        }
        toRprLE(buff, offset, a) {
          buff.set(this.fromMontgomery(a), offset);
        }
        toRprBE(buff, offset, a) {
          const buff2 = this.fromMontgomery(a);
          for (let i = 0; i < this.n8 / 2; i++) {
            const aux = buff2[i];
            buff2[i] = buff2[this.n8 - 1 - i];
            buff2[this.n8 - 1 - i] = aux;
          }
          buff.set(buff2, offset);
        }
        fromRprLE(buff, offset) {
          offset = offset || 0;
          const res = buff.slice(offset, offset + this.n8);
          return this.toMontgomery(res);
        }
        async batchInverse(buffIn) {
          let returnArray = false;
          const sIn = this.n8;
          const sOut = this.n8;
          if (Array.isArray(buffIn)) {
            buffIn = array2buffer(buffIn, sIn);
            returnArray = true;
          } else {
            buffIn = buffIn.slice(0, buffIn.byteLength);
          }
          const nPoints = Math.floor(buffIn.byteLength / sIn);
          if (nPoints * sIn !== buffIn.byteLength) {
            throw new Error("Invalid buffer size");
          }
          const pointsPerChunk = Math.floor(nPoints / this.tm.concurrency);
          const opPromises = [];
          for (let i = 0; i < this.tm.concurrency; i++) {
            let n;
            if (i < this.tm.concurrency - 1) {
              n = pointsPerChunk;
            } else {
              n = nPoints - i * pointsPerChunk;
            }
            if (n == 0)
              continue;
            const buffChunk = buffIn.slice(
              i * pointsPerChunk * sIn,
              i * pointsPerChunk * sIn + n * sIn
            );
            const task = [
              { cmd: "ALLOCSET", var: 0, buff: buffChunk },
              { cmd: "ALLOC", var: 1, len: sOut * n },
              {
                cmd: "CALL",
                fnName: this.prefix + "_batchInverse",
                params: [
                  { var: 0 },
                  { val: sIn },
                  { val: n },
                  { var: 1 },
                  { val: sOut }
                ]
              },
              { cmd: "GET", out: 0, var: 1, len: sOut * n }
            ];
            opPromises.push(this.tm.queueAction(task));
          }
          const result = await Promise.all(opPromises);
          let fullBuffOut;
          if (buffIn instanceof BigBuffer) {
            fullBuffOut = new BigBuffer(nPoints * sOut);
          } else {
            fullBuffOut = new Uint8Array(nPoints * sOut);
          }
          let p = 0;
          for (let i = 0; i < result.length; i++) {
            fullBuffOut.set(result[i][0], p);
            p += result[i][0].byteLength;
          }
          if (returnArray) {
            return buffer2array(fullBuffOut, sOut);
          } else {
            return fullBuffOut;
          }
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/wasm_field2.js
  var WasmField2;
  var init_wasm_field2 = __esm({
    "src/intmax/lib/ffjavascript/wasm_field2.js"() {
      init_random();
      init_scalar();
      WasmField2 = class {
        constructor(tm, prefix, F) {
          this.tm = tm;
          this.prefix = prefix;
          this.F = F;
          this.type = "F2";
          this.m = F.m * 2;
          this.n8 = this.F.n8 * 2;
          this.n32 = this.F.n32 * 2;
          this.n64 = this.F.n64 * 2;
          this.pOp1 = tm.alloc(F.n8 * 2);
          this.pOp2 = tm.alloc(F.n8 * 2);
          this.pOp3 = tm.alloc(F.n8 * 2);
          this.tm.instance.exports[prefix + "_zero"](this.pOp1);
          this.zero = tm.getBuff(this.pOp1, this.n8);
          this.tm.instance.exports[prefix + "_one"](this.pOp1);
          this.one = tm.getBuff(this.pOp1, this.n8);
          this.negone = this.neg(this.one);
          this.two = this.add(this.one, this.one);
        }
        op2(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op2Bool(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2
          );
        }
        op1(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op1Bool(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp3
          );
        }
        add(a, b) {
          return this.op2("_add", a, b);
        }
        eq(a, b) {
          return this.op2Bool("_eq", a, b);
        }
        isZero(a) {
          return this.op1Bool("_isZero", a);
        }
        sub(a, b) {
          return this.op2("_sub", a, b);
        }
        neg(a) {
          return this.op1("_neg", a);
        }
        inv(a) {
          return this.op1("_inverse", a);
        }
        isNegative(a) {
          return this.op1Bool("_isNegative", a);
        }
        toMontgomery(a) {
          return this.op1("_toMontgomery", a);
        }
        fromMontgomery(a) {
          return this.op1("_fromMontgomery", a);
        }
        mul(a, b) {
          return this.op2("_mul", a, b);
        }
        mul1(a, b) {
          return this.op2("_mul1", a, b);
        }
        div(a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
          this.tm.instance.exports[this.prefix + "_mul"](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        square(a) {
          return this.op1("_square", a);
        }
        isSquare(a) {
          return this.op1Bool("_isSquare", a);
        }
        sqrt(a) {
          return this.op1("_sqrt", a);
        }
        exp(a, b) {
          if (!(b instanceof Uint8Array)) {
            b = toLEBuff(e(b));
          }
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_exp"](
            this.pOp1,
            this.pOp2,
            b.byteLength,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        e(a, b) {
          if (a instanceof Uint8Array)
            return a;
          if (Array.isArray(a) && a.length == 2) {
            const c1 = this.F.e(a[0], b);
            const c2 = this.F.e(a[1], b);
            const res = new Uint8Array(this.F.n8 * 2);
            res.set(c1);
            res.set(c2, this.F.n8 * 2);
            return res;
          } else {
            throw new Error("invalid F2");
          }
        }
        toString(a, radix) {
          const s1 = this.F.toString(a.slice(0, this.F.n8), radix);
          const s2 = this.F.toString(a.slice(this.F.n8), radix);
          return `[${s1}, ${s2}]`;
        }
        fromRng(rng) {
          const c1 = this.F.fromRng(rng);
          const c2 = this.F.fromRng(rng);
          const res = new Uint8Array(this.F.n8 * 2);
          res.set(c1);
          res.set(c2, this.F.n8);
          return res;
        }
        random() {
          return this.fromRng(getThreadRng());
        }
        toObject(a) {
          const c1 = this.F.toObject(a.slice(0, this.F.n8));
          const c2 = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
          return [c1, c2];
        }
        fromObject(a) {
          const buff = new Uint8Array(this.F.n8 * 2);
          const b1 = this.F.fromObject(a[0]);
          const b2 = this.F.fromObject(a[1]);
          buff.set(b1);
          buff.set(b2, this.F.n8);
          return buff;
        }
        c1(a) {
          return a.slice(0, this.F.n8);
        }
        c2(a) {
          return a.slice(this.F.n8);
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/wasm_field3.js
  var WasmField3;
  var init_wasm_field3 = __esm({
    "src/intmax/lib/ffjavascript/wasm_field3.js"() {
      init_random();
      init_scalar();
      WasmField3 = class {
        constructor(tm, prefix, F) {
          this.tm = tm;
          this.prefix = prefix;
          this.F = F;
          this.type = "F3";
          this.m = F.m * 3;
          this.n8 = this.F.n8 * 3;
          this.n32 = this.F.n32 * 3;
          this.n64 = this.F.n64 * 3;
          this.pOp1 = tm.alloc(F.n8 * 3);
          this.pOp2 = tm.alloc(F.n8 * 3);
          this.pOp3 = tm.alloc(F.n8 * 3);
          this.tm.instance.exports[prefix + "_zero"](this.pOp1);
          this.zero = tm.getBuff(this.pOp1, this.n8);
          this.tm.instance.exports[prefix + "_one"](this.pOp1);
          this.one = tm.getBuff(this.pOp1, this.n8);
          this.negone = this.neg(this.one);
          this.two = this.add(this.one, this.one);
        }
        op2(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op2Bool(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2
          );
        }
        op1(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        op1Bool(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp3
          );
        }
        eq(a, b) {
          return this.op2Bool("_eq", a, b);
        }
        isZero(a) {
          return this.op1Bool("_isZero", a);
        }
        add(a, b) {
          return this.op2("_add", a, b);
        }
        sub(a, b) {
          return this.op2("_sub", a, b);
        }
        neg(a) {
          return this.op1("_neg", a);
        }
        inv(a) {
          return this.op1("_inverse", a);
        }
        isNegative(a) {
          return this.op1Bool("_isNegative", a);
        }
        toMontgomery(a) {
          return this.op1("_toMontgomery", a);
        }
        fromMontgomery(a) {
          return this.op1("_fromMontgomery", a);
        }
        mul(a, b) {
          return this.op2("_mul", a, b);
        }
        div(a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
          this.tm.instance.exports[this.prefix + "_mul"](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.n8);
        }
        square(a) {
          return this.op1("_square", a);
        }
        isSquare(a) {
          return this.op1Bool("_isSquare", a);
        }
        sqrt(a) {
          return this.op1("_sqrt", a);
        }
        exp(a, b) {
          if (!(b instanceof Uint8Array)) {
            b = toLEBuff(e(b));
          }
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + "_exp"](
            this.pOp1,
            this.pOp2,
            b.byteLength,
            this.pOp3
          );
          return this.getBuff(this.pOp3, this.n8);
        }
        e(a, b) {
          if (a instanceof Uint8Array)
            return a;
          if (Array.isArray(a) && a.length == 3) {
            const c1 = this.F.e(a[0], b);
            const c2 = this.F.e(a[1], b);
            const c3 = this.F.e(a[2], b);
            const res = new Uint8Array(this.F.n8 * 3);
            res.set(c1);
            res.set(c2, this.F.n8);
            res.set(c3, this.F.n8 * 2);
            return res;
          } else {
            throw new Error("invalid F3");
          }
        }
        toString(a, radix) {
          const s1 = this.F.toString(a.slice(0, this.F.n8), radix);
          const s2 = this.F.toString(a.slice(this.F.n8, this.F.n8 * 2), radix);
          const s3 = this.F.toString(a.slice(this.F.n8 * 2), radix);
          return `[${s1}, ${s2}, ${s3}]`;
        }
        fromRng(rng) {
          const c1 = this.F.fromRng(rng);
          const c2 = this.F.fromRng(rng);
          const c3 = this.F.fromRng(rng);
          const res = new Uint8Array(this.F.n8 * 3);
          res.set(c1);
          res.set(c2, this.F.n8);
          res.set(c3, this.F.n8 * 2);
          return res;
        }
        random() {
          return this.fromRng(getThreadRng());
        }
        toObject(a) {
          const c1 = this.F.toObject(a.slice(0, this.F.n8));
          const c2 = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
          const c3 = this.F.toObject(a.slice(this.F.n8 * 2, this.F.n8 * 3));
          return [c1, c2, c3];
        }
        fromObject(a) {
          const buff = new Uint8Array(this.F.n8 * 3);
          const b1 = this.F.fromObject(a[0]);
          const b2 = this.F.fromObject(a[1]);
          const b3 = this.F.fromObject(a[2]);
          buff.set(b1);
          buff.set(b2, this.F.n8);
          buff.set(b3, this.F.n8 * 2);
          return buff;
        }
        c1(a) {
          return a.slice(0, this.F.n8);
        }
        c2(a) {
          return a.slice(this.F.n8, this.F.n8 * 2);
        }
        c3(a) {
          return a.slice(this.F.n8 * 2);
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/wasm_curve.js
  var WasmCurve;
  var init_wasm_curve = __esm({
    "src/intmax/lib/ffjavascript/wasm_curve.js"() {
      init_scalar();
      init_engine_batchconvert();
      WasmCurve = class {
        constructor(tm, prefix, F, pGen, pGb, cofactor) {
          this.tm = tm;
          this.prefix = prefix;
          this.F = F;
          this.pOp1 = tm.alloc(F.n8 * 3);
          this.pOp2 = tm.alloc(F.n8 * 3);
          this.pOp3 = tm.alloc(F.n8 * 3);
          this.tm.instance.exports[prefix + "_zero"](this.pOp1);
          this.zero = this.tm.getBuff(this.pOp1, F.n8 * 3);
          this.tm.instance.exports[prefix + "_zeroAffine"](this.pOp1);
          this.zeroAffine = this.tm.getBuff(this.pOp1, F.n8 * 2);
          this.one = this.tm.getBuff(pGen, F.n8 * 3);
          this.g = this.one;
          this.oneAffine = this.tm.getBuff(pGen, F.n8 * 2);
          this.gAffine = this.oneAffine;
          this.b = this.tm.getBuff(pGb, F.n8);
          if (cofactor) {
            this.cofactor = toLEBuff(cofactor);
          }
          this.negone = this.neg(this.one);
          this.two = this.add(this.one, this.one);
          this.batchLEMtoC = buildBatchConvert(
            tm,
            prefix + "_batchLEMtoC",
            F.n8 * 2,
            F.n8
          );
          this.batchLEMtoU = buildBatchConvert(
            tm,
            prefix + "_batchLEMtoU",
            F.n8 * 2,
            F.n8 * 2
          );
          this.batchCtoLEM = buildBatchConvert(
            tm,
            prefix + "_batchCtoLEM",
            F.n8,
            F.n8 * 2
          );
          this.batchUtoLEM = buildBatchConvert(
            tm,
            prefix + "_batchUtoLEM",
            F.n8 * 2,
            F.n8 * 2
          );
          this.batchToJacobian = buildBatchConvert(
            tm,
            prefix + "_batchToJacobian",
            F.n8 * 2,
            F.n8 * 3
          );
          this.batchToAffine = buildBatchConvert(
            tm,
            prefix + "_batchToAffine",
            F.n8 * 3,
            F.n8 * 2
          );
        }
        op2(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
        }
        op2bool(opName, a, b) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, b);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp2,
            this.pOp3
          );
        }
        op1(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
        }
        op1Affine(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.F.n8 * 2);
        }
        op1Bool(opName, a) {
          this.tm.setBuff(this.pOp1, a);
          return !!this.tm.instance.exports[this.prefix + opName](
            this.pOp1,
            this.pOp3
          );
        }
        add(a, b) {
          if (a.byteLength == this.F.n8 * 3) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2("_add", a, b);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2("_addMixed", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else if (a.byteLength == this.F.n8 * 2) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2("_addMixed", b, a);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2("_addAffine", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else {
            throw new Error("invalid point size");
          }
        }
        sub(a, b) {
          if (a.byteLength == this.F.n8 * 3) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2("_sub", a, b);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2("_subMixed", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else if (a.byteLength == this.F.n8 * 2) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2("_subMixed", b, a);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2("_subAffine", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else {
            throw new Error("invalid point size");
          }
        }
        neg(a) {
          if (a.byteLength == this.F.n8 * 3) {
            return this.op1("_neg", a);
          } else if (a.byteLength == this.F.n8 * 2) {
            return this.op1Affine("_negAffine", a);
          } else {
            throw new Error("invalid point size");
          }
        }
        double(a) {
          if (a.byteLength == this.F.n8 * 3) {
            return this.op1("_double", a);
          } else if (a.byteLength == this.F.n8 * 2) {
            return this.op1("_doubleAffine", a);
          } else {
            throw new Error("invalid point size");
          }
        }
        isZero(a) {
          if (a.byteLength == this.F.n8 * 3) {
            return this.op1Bool("_isZero", a);
          } else if (a.byteLength == this.F.n8 * 2) {
            return this.op1Bool("_isZeroAffine", a);
          } else {
            throw new Error("invalid point size");
          }
        }
        timesScalar(a, s) {
          if (!(s instanceof Uint8Array)) {
            s = toLEBuff(e(s));
          }
          let fnName;
          if (a.byteLength == this.F.n8 * 3) {
            fnName = this.prefix + "_timesScalar";
          } else if (a.byteLength == this.F.n8 * 2) {
            fnName = this.prefix + "_timesScalarAffine";
          } else {
            throw new Error("invalid point size");
          }
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, s);
          this.tm.instance.exports[fnName](
            this.pOp1,
            this.pOp2,
            s.byteLength,
            this.pOp3
          );
          return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
        }
        timesFr(a, s) {
          let fnName;
          if (a.byteLength == this.F.n8 * 3) {
            fnName = this.prefix + "_timesFr";
          } else if (a.byteLength == this.F.n8 * 2) {
            fnName = this.prefix + "_timesFrAffine";
          } else {
            throw new Error("invalid point size");
          }
          this.tm.setBuff(this.pOp1, a);
          this.tm.setBuff(this.pOp2, s);
          this.tm.instance.exports[fnName](this.pOp1, this.pOp2, this.pOp3);
          return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
        }
        eq(a, b) {
          if (a.byteLength == this.F.n8 * 3) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2bool("_eq", a, b);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2bool("_eqMixed", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else if (a.byteLength == this.F.n8 * 2) {
            if (b.byteLength == this.F.n8 * 3) {
              return this.op2bool("_eqMixed", b, a);
            } else if (b.byteLength == this.F.n8 * 2) {
              return this.op2bool("_eqAffine", a, b);
            } else {
              throw new Error("invalid point size");
            }
          } else {
            throw new Error("invalid point size");
          }
        }
        toAffine(a) {
          if (a.byteLength == this.F.n8 * 3) {
            return this.op1Affine("_toAffine", a);
          } else if (a.byteLength == this.F.n8 * 2) {
            return a;
          } else {
            throw new Error("invalid point size");
          }
        }
        toJacobian(a) {
          if (a.byteLength == this.F.n8 * 3) {
            return a;
          } else if (a.byteLength == this.F.n8 * 2) {
            return this.op1("_toJacobian", a);
          } else {
            throw new Error("invalid point size");
          }
        }
        toRprUncompressed(arr, offset, a) {
          this.tm.setBuff(this.pOp1, a);
          if (a.byteLength == this.F.n8 * 3) {
            this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
          } else if (a.byteLength != this.F.n8 * 2) {
            throw new Error("invalid point size");
          }
          this.tm.instance.exports[this.prefix + "_LEMtoU"](this.pOp1, this.pOp1);
          const res = this.tm.getBuff(this.pOp1, this.F.n8 * 2);
          arr.set(res, offset);
        }
        fromRprUncompressed(arr, offset) {
          const buff = arr.slice(offset, offset + this.F.n8 * 2);
          this.tm.setBuff(this.pOp1, buff);
          this.tm.instance.exports[this.prefix + "_UtoLEM"](this.pOp1, this.pOp1);
          return this.tm.getBuff(this.pOp1, this.F.n8 * 2);
        }
        toRprCompressed(arr, offset, a) {
          this.tm.setBuff(this.pOp1, a);
          if (a.byteLength == this.F.n8 * 3) {
            this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
          } else if (a.byteLength != this.F.n8 * 2) {
            throw new Error("invalid point size");
          }
          this.tm.instance.exports[this.prefix + "_LEMtoC"](this.pOp1, this.pOp1);
          const res = this.tm.getBuff(this.pOp1, this.F.n8);
          arr.set(res, offset);
        }
        fromRprCompressed(arr, offset) {
          const buff = arr.slice(offset, offset + this.F.n8);
          this.tm.setBuff(this.pOp1, buff);
          this.tm.instance.exports[this.prefix + "_CtoLEM"](this.pOp1, this.pOp2);
          return this.tm.getBuff(this.pOp2, this.F.n8 * 2);
        }
        toUncompressed(a) {
          const buff = new Uint8Array(this.F.n8 * 2);
          this.toRprUncompressed(buff, 0, a);
          return buff;
        }
        toRprLEM(arr, offset, a) {
          if (a.byteLength == this.F.n8 * 2) {
            arr.set(a, offset);
            return;
          } else if (a.byteLength == this.F.n8 * 3) {
            this.tm.setBuff(this.pOp1, a);
            this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
            const res = this.tm.getBuff(this.pOp1, this.F.n8 * 2);
            arr.set(res, offset);
          } else {
            throw new Error("invalid point size");
          }
        }
        fromRprLEM(arr, offset) {
          offset = offset || 0;
          return arr.slice(offset, offset + this.F.n8 * 2);
        }
        toString(a, radix) {
          if (a.byteLength == this.F.n8 * 3) {
            const x = this.F.toString(a.slice(0, this.F.n8), radix);
            const y = this.F.toString(a.slice(this.F.n8, this.F.n8 * 2), radix);
            const z = this.F.toString(a.slice(this.F.n8 * 2), radix);
            return `[ ${x}, ${y}, ${z} ]`;
          } else if (a.byteLength == this.F.n8 * 2) {
            const x = this.F.toString(a.slice(0, this.F.n8), radix);
            const y = this.F.toString(a.slice(this.F.n8), radix);
            return `[ ${x}, ${y} ]`;
          } else {
            throw new Error("invalid point size");
          }
        }
        isValid(a) {
          if (this.isZero(a))
            return true;
          const F = this.F;
          const aa = this.toAffine(a);
          const x = aa.slice(0, this.F.n8);
          const y = aa.slice(this.F.n8, this.F.n8 * 2);
          const x3b = F.add(F.mul(F.square(x), x), this.b);
          const y2 = F.square(y);
          return F.eq(x3b, y2);
        }
        fromRng(rng) {
          const F = this.F;
          let P = [];
          let greatest;
          let x3b;
          do {
            P[0] = F.fromRng(rng);
            greatest = rng.nextBool();
            x3b = F.add(F.mul(F.square(P[0]), P[0]), this.b);
          } while (!F.isSquare(x3b));
          P[1] = F.sqrt(x3b);
          const s = F.isNegative(P[1]);
          if (greatest ^ s)
            P[1] = F.neg(P[1]);
          let Pbuff = new Uint8Array(this.F.n8 * 2);
          Pbuff.set(P[0]);
          Pbuff.set(P[1], this.F.n8);
          if (this.cofactor) {
            Pbuff = this.timesScalar(Pbuff, this.cofactor);
          }
          return Pbuff;
        }
        toObject(a) {
          if (this.isZero(a)) {
            return [
              this.F.toObject(this.F.zero),
              this.F.toObject(this.F.one),
              this.F.toObject(this.F.zero)
            ];
          }
          const x = this.F.toObject(a.slice(0, this.F.n8));
          const y = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
          let z;
          if (a.byteLength == this.F.n8 * 3) {
            z = this.F.toObject(a.slice(this.F.n8 * 2, this.F.n8 * 3));
          } else {
            z = this.F.toObject(this.F.one);
          }
          return [x, y, z];
        }
        fromObject(a) {
          const x = this.F.fromObject(a[0]);
          const y = this.F.fromObject(a[1]);
          let z;
          if (a.length == 3) {
            z = this.F.fromObject(a[2]);
          } else {
            z = this.F.one;
          }
          if (this.F.isZero(z, this.F.one)) {
            return this.zeroAffine;
          } else if (this.F.eq(z, this.F.one)) {
            const buff = new Uint8Array(this.F.n8 * 2);
            buff.set(x);
            buff.set(y, this.F.n8);
            return buff;
          } else {
            const buff = new Uint8Array(this.F.n8 * 3);
            buff.set(x);
            buff.set(y, this.F.n8);
            buff.set(z, this.F.n8 * 2);
            return buff;
          }
        }
        e(a) {
          if (a instanceof Uint8Array)
            return a;
          return this.fromObject(a);
        }
        x(a) {
          const tmp = this.toAffine(a);
          return tmp.slice(0, this.F.n8);
        }
        y(a) {
          const tmp = this.toAffine(a);
          return tmp.slice(this.F.n8);
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/threadman_thread.js
  function thread(self) {
    const MAXMEM = 32767;
    let instance;
    let memory;
    if (self) {
      self.onmessage = function(e2) {
        let data;
        if (e2.data) {
          data = e2.data;
        } else {
          data = e2;
        }
        if (data[0].cmd == "INIT") {
          init(data[0]).then(function() {
            self.postMessage(data.result);
          });
        } else if (data[0].cmd == "TERMINATE") {
          self.close();
        } else {
          const res = runTask(data);
          self.postMessage(res);
        }
      };
    }
    async function init(data) {
      const code = new Uint8Array(data.code);
      const wasmModule = await WebAssembly.compile(code);
      memory = new WebAssembly.Memory({ initial: data.init, maximum: MAXMEM });
      instance = await WebAssembly.instantiate(wasmModule, {
        env: {
          memory
        }
      });
    }
    function alloc(length) {
      const u322 = new Uint32Array(memory.buffer, 0, 1);
      while (u322[0] & 3)
        u322[0]++;
      const res = u322[0];
      u322[0] += length;
      if (u322[0] + length > memory.buffer.byteLength) {
        const currentPages = memory.buffer.byteLength / 65536;
        let requiredPages = Math.floor((u322[0] + length) / 65536) + 1;
        if (requiredPages > MAXMEM)
          requiredPages = MAXMEM;
        memory.grow(requiredPages - currentPages);
      }
      return res;
    }
    function allocBuffer(buffer) {
      const p = alloc(buffer.byteLength);
      setBuffer(p, buffer);
      return p;
    }
    function getBuffer(pointer, length) {
      const u8 = new Uint8Array(memory.buffer);
      return new Uint8Array(u8.buffer, u8.byteOffset + pointer, length);
    }
    function setBuffer(pointer, buffer) {
      const u8 = new Uint8Array(memory.buffer);
      u8.set(new Uint8Array(buffer), pointer);
    }
    function runTask(task) {
      if (task[0].cmd == "INIT") {
        return init(task[0]);
      }
      const ctx = {
        vars: [],
        out: []
      };
      const u32a = new Uint32Array(memory.buffer, 0, 1);
      const oldAlloc = u32a[0];
      for (let i = 0; i < task.length; i++) {
        switch (task[i].cmd) {
          case "ALLOCSET":
            ctx.vars[task[i].var] = allocBuffer(task[i].buff);
            break;
          case "ALLOC":
            ctx.vars[task[i].var] = alloc(task[i].len);
            break;
          case "SET":
            setBuffer(ctx.vars[task[i].var], task[i].buff);
            break;
          case "CALL": {
            const params = [];
            for (let j = 0; j < task[i].params.length; j++) {
              const p = task[i].params[j];
              if (typeof p.var !== "undefined") {
                params.push(ctx.vars[p.var] + (p.offset || 0));
              } else if (typeof p.val != "undefined") {
                params.push(p.val);
              }
            }
            instance.exports[task[i].fnName](...params);
            break;
          }
          case "GET":
            ctx.out[task[i].out] = getBuffer(
              ctx.vars[task[i].var],
              task[i].len
            ).slice();
            break;
          default:
            throw new Error("Invalid cmd");
        }
      }
      const u32b = new Uint32Array(memory.buffer, 0, 1);
      u32b[0] = oldAlloc;
      return ctx.out;
    }
    return runTask;
  }
  var init_threadman_thread = __esm({
    "src/intmax/lib/ffjavascript/threadman_thread.js"() {
    }
  });

  // src/intmax/lib/ffjavascript/threadman.js
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function stringToBase64(str) {
    if (typeof process === "object" && process.browser) {
      return globalThis.btoa(str);
    } else {
      return Buffer.from(str).toString("base64");
    }
  }
  async function buildThreadManager(wasm) {
    const singleThread = true;
    const tm = new ThreadManager();
    tm.memory = new WebAssembly.Memory({ initial: MEM_SIZE });
    tm.u8 = new Uint8Array(tm.memory.buffer);
    tm.u32 = new Uint32Array(tm.memory.buffer);
    const wasmModule = await WebAssembly.compile(wasm.code);
    tm.instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: tm.memory
      }
    });
    tm.singleThread = singleThread;
    tm.initalPFree = tm.u32[0];
    tm.pq = wasm.pq;
    tm.pr = wasm.pr;
    tm.pG1gen = wasm.pG1gen;
    tm.pG1zero = wasm.pG1zero;
    tm.pG2gen = wasm.pG2gen;
    tm.pG2zero = wasm.pG2zero;
    tm.pOneT = wasm.pOneT;
    if (singleThread) {
      tm.code = wasm.code;
      tm.taskManager = thread();
      await tm.taskManager([
        {
          cmd: "INIT",
          init: MEM_SIZE,
          code: tm.code.slice()
        }
      ]);
      tm.concurrency = 1;
    } else {
    }
    return tm;
    function getOnMsg(i) {
      return function(e2) {
        let data;
        if (e2 && e2.data) {
          data = e2.data;
        } else {
          data = e2;
        }
        tm.working[i] = false;
        tm.pendingDeferreds[i].resolve(data);
        tm.processWorks();
      };
    }
  }
  var MEM_SIZE, Deferred, threadSource, workerSource, ThreadManager;
  var init_threadman = __esm({
    "src/intmax/lib/ffjavascript/threadman.js"() {
      init_threadman_thread();
      MEM_SIZE = 25;
      Deferred = class {
        constructor() {
          this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
          });
        }
      };
      threadSource = stringToBase64("(" + thread.toString() + ")(self)");
      workerSource = "data:application/javascript;base64," + threadSource;
      ThreadManager = class {
        constructor() {
          this.actionQueue = [];
          this.oldPFree = 0;
        }
        startSyncOp() {
          if (this.oldPFree != 0)
            throw new Error("Sync operation in progress");
          this.oldPFree = this.u32[0];
        }
        endSyncOp() {
          if (this.oldPFree == 0)
            throw new Error("No sync operation in progress");
          this.u32[0] = this.oldPFree;
          this.oldPFree = 0;
        }
        postAction(workerId, e2, transfers, _deferred) {
          if (this.working[workerId]) {
            throw new Error("Posting a job t a working worker");
          }
          this.working[workerId] = true;
          this.pendingDeferreds[workerId] = _deferred ? _deferred : new Deferred();
          this.workers[workerId].postMessage(e2, transfers);
          return this.pendingDeferreds[workerId].promise;
        }
        processWorks() {
          for (let i = 0; i < this.workers.length && this.actionQueue.length > 0; i++) {
            if (this.working[i] == false) {
              const work = this.actionQueue.shift();
              this.postAction(i, work.data, work.transfers, work.deferred);
            }
          }
        }
        queueAction(actionData, transfers) {
          const d = new Deferred();
          if (this.singleThread) {
            const res = this.taskManager(actionData);
            d.resolve(res);
          } else {
            this.actionQueue.push({
              data: actionData,
              transfers,
              deferred: d
            });
            this.processWorks();
          }
          return d.promise;
        }
        resetMemory() {
          this.u32[0] = this.initalPFree;
        }
        allocBuff(buff) {
          const pointer = this.alloc(buff.byteLength);
          this.setBuff(pointer, buff);
          return pointer;
        }
        getBuff(pointer, length) {
          return this.u8.slice(pointer, pointer + length);
        }
        setBuff(pointer, buffer) {
          this.u8.set(new Uint8Array(buffer), pointer);
        }
        alloc(length) {
          while (this.u32[0] & 3)
            this.u32[0]++;
          const res = this.u32[0];
          this.u32[0] += length;
          return res;
        }
        async terminate() {
          for (let i = 0; i < this.workers.length; i++) {
            this.workers[i].postMessage([{ cmd: "TERMINATE" }]);
          }
          await sleep(200);
        }
      };
    }
  });

  // src/intmax/lib/ffjavascript/engine_applykey.js
  function buildBatchApplyKey(curve, groupName) {
    const G = curve[groupName];
    const Fr = curve.Fr;
    const tm = curve.tm;
    curve[groupName].batchApplyKey = async function(buff, first, inc, inType, outType) {
      inType = inType || "affine";
      outType = outType || "affine";
      let fnName, fnAffine;
      let sGin, sGmid, sGout;
      if (groupName == "G1") {
        if (inType == "jacobian") {
          sGin = G.F.n8 * 3;
          fnName = "g1m_batchApplyKey";
        } else {
          sGin = G.F.n8 * 2;
          fnName = "g1m_batchApplyKeyMixed";
        }
        sGmid = G.F.n8 * 3;
        if (outType == "jacobian") {
          sGout = G.F.n8 * 3;
        } else {
          fnAffine = "g1m_batchToAffine";
          sGout = G.F.n8 * 2;
        }
      } else if (groupName == "G2") {
        if (inType == "jacobian") {
          sGin = G.F.n8 * 3;
          fnName = "g2m_batchApplyKey";
        } else {
          sGin = G.F.n8 * 2;
          fnName = "g2m_batchApplyKeyMixed";
        }
        sGmid = G.F.n8 * 3;
        if (outType == "jacobian") {
          sGout = G.F.n8 * 3;
        } else {
          fnAffine = "g2m_batchToAffine";
          sGout = G.F.n8 * 2;
        }
      } else if (groupName == "Fr") {
        fnName = "frm_batchApplyKey";
        sGin = G.n8;
        sGmid = G.n8;
        sGout = G.n8;
      } else {
        throw new Error("Invalid group: " + groupName);
      }
      const nPoints = Math.floor(buff.byteLength / sGin);
      const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
      const opPromises = [];
      inc = Fr.e(inc);
      let t = Fr.e(first);
      for (let i = 0; i < tm.concurrency; i++) {
        let n;
        if (i < tm.concurrency - 1) {
          n = pointsPerChunk;
        } else {
          n = nPoints - i * pointsPerChunk;
        }
        if (n == 0)
          continue;
        const task = [];
        task.push({
          cmd: "ALLOCSET",
          var: 0,
          buff: buff.slice(
            i * pointsPerChunk * sGin,
            i * pointsPerChunk * sGin + n * sGin
          )
        });
        task.push({ cmd: "ALLOCSET", var: 1, buff: t });
        task.push({ cmd: "ALLOCSET", var: 2, buff: inc });
        task.push({ cmd: "ALLOC", var: 3, len: n * Math.max(sGmid, sGout) });
        task.push({
          cmd: "CALL",
          fnName,
          params: [{ var: 0 }, { val: n }, { var: 1 }, { var: 2 }, { var: 3 }]
        });
        if (fnAffine) {
          task.push({
            cmd: "CALL",
            fnName: fnAffine,
            params: [{ var: 3 }, { val: n }, { var: 3 }]
          });
        }
        task.push({ cmd: "GET", out: 0, var: 3, len: n * sGout });
        opPromises.push(tm.queueAction(task));
        t = Fr.mul(t, Fr.exp(inc, n));
      }
      const result = await Promise.all(opPromises);
      let outBuff;
      if (buff instanceof BigBuffer) {
        outBuff = new BigBuffer(nPoints * sGout);
      } else {
        outBuff = new Uint8Array(nPoints * sGout);
      }
      let p = 0;
      for (let i = 0; i < result.length; i++) {
        outBuff.set(result[i][0], p);
        p += result[i][0].byteLength;
      }
      return outBuff;
    };
  }
  var init_engine_applykey = __esm({
    "src/intmax/lib/ffjavascript/engine_applykey.js"() {
      init_bigbuffer();
    }
  });

  // src/intmax/lib/ffjavascript/engine_pairing.js
  function buildPairing(curve) {
    const tm = curve.tm;
    curve.pairing = function pairing(a, b) {
      tm.startSyncOp();
      const pA = tm.allocBuff(curve.G1.toJacobian(a));
      const pB = tm.allocBuff(curve.G2.toJacobian(b));
      const pRes = tm.alloc(curve.Gt.n8);
      tm.instance.exports[curve.name + "_pairing"](pA, pB, pRes);
      const res = tm.getBuff(pRes, curve.Gt.n8);
      tm.endSyncOp();
      return res;
    };
    curve.pairingEq = async function pairingEq() {
      let buffCt;
      let nEqs;
      if (arguments.length % 2 == 1) {
        buffCt = arguments[arguments.length - 1];
        nEqs = (arguments.length - 1) / 2;
      } else {
        buffCt = curve.Gt.one;
        nEqs = arguments.length / 2;
      }
      const opPromises = [];
      for (let i = 0; i < nEqs; i++) {
        const task = [];
        const g1Buff = curve.G1.toJacobian(arguments[i * 2]);
        task.push({ cmd: "ALLOCSET", var: 0, buff: g1Buff });
        task.push({ cmd: "ALLOC", var: 1, len: curve.prePSize });
        const g2Buff = curve.G2.toJacobian(arguments[i * 2 + 1]);
        task.push({ cmd: "ALLOCSET", var: 2, buff: g2Buff });
        task.push({ cmd: "ALLOC", var: 3, len: curve.preQSize });
        task.push({ cmd: "ALLOC", var: 4, len: curve.Gt.n8 });
        task.push({
          cmd: "CALL",
          fnName: curve.name + "_prepareG1",
          params: [{ var: 0 }, { var: 1 }]
        });
        task.push({
          cmd: "CALL",
          fnName: curve.name + "_prepareG2",
          params: [{ var: 2 }, { var: 3 }]
        });
        task.push({
          cmd: "CALL",
          fnName: curve.name + "_millerLoop",
          params: [{ var: 1 }, { var: 3 }, { var: 4 }]
        });
        task.push({ cmd: "GET", out: 0, var: 4, len: curve.Gt.n8 });
        opPromises.push(tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      tm.startSyncOp();
      const pRes = tm.alloc(curve.Gt.n8);
      tm.instance.exports.ftm_one(pRes);
      for (let i = 0; i < result.length; i++) {
        const pMR = tm.allocBuff(result[i][0]);
        tm.instance.exports.ftm_mul(pRes, pMR, pRes);
      }
      tm.instance.exports[curve.name + "_finalExponentiation"](pRes, pRes);
      const pCt = tm.allocBuff(buffCt);
      const r = !!tm.instance.exports.ftm_eq(pRes, pCt);
      tm.endSyncOp();
      return r;
    };
    curve.prepareG1 = function(p) {
      this.tm.startSyncOp();
      const pP = this.tm.allocBuff(p);
      const pPrepP = this.tm.alloc(this.prePSize);
      this.tm.instance.exports[this.name + "_prepareG1"](pP, pPrepP);
      const res = this.tm.getBuff(pPrepP, this.prePSize);
      this.tm.endSyncOp();
      return res;
    };
    curve.prepareG2 = function(q) {
      this.tm.startSyncOp();
      const pQ = this.tm.allocBuff(q);
      const pPrepQ = this.tm.alloc(this.preQSize);
      this.tm.instance.exports[this.name + "_prepareG2"](pQ, pPrepQ);
      const res = this.tm.getBuff(pPrepQ, this.preQSize);
      this.tm.endSyncOp();
      return res;
    };
    curve.millerLoop = function(preP, preQ) {
      this.tm.startSyncOp();
      const pPreP = this.tm.allocBuff(preP);
      const pPreQ = this.tm.allocBuff(preQ);
      const pRes = this.tm.alloc(this.Gt.n8);
      this.tm.instance.exports[this.name + "_millerLoop"](pPreP, pPreQ, pRes);
      const res = this.tm.getBuff(pRes, this.Gt.n8);
      this.tm.endSyncOp();
      return res;
    };
    curve.finalExponentiation = function(a) {
      this.tm.startSyncOp();
      const pA = this.tm.allocBuff(a);
      const pRes = this.tm.alloc(this.Gt.n8);
      this.tm.instance.exports[this.name + "_finalExponentiation"](pA, pRes);
      const res = this.tm.getBuff(pRes, this.Gt.n8);
      this.tm.endSyncOp();
      return res;
    };
  }
  var init_engine_pairing = __esm({
    "src/intmax/lib/ffjavascript/engine_pairing.js"() {
    }
  });

  // src/intmax/lib/ffjavascript/engine_multiexp.js
  function buildMultiexp(curve, groupName) {
    const G = curve[groupName];
    const tm = G.tm;
    async function _multiExpChunk(buffBases, buffScalars, inType, logger, logText) {
      if (!(buffBases instanceof Uint8Array)) {
        if (logger)
          logger.error(`${logText} _multiExpChunk buffBases is not Uint8Array`);
        throw new Error(`${logText} _multiExpChunk buffBases is not Uint8Array`);
      }
      if (!(buffScalars instanceof Uint8Array)) {
        if (logger)
          logger.error(`${logText} _multiExpChunk buffScalars is not Uint8Array`);
        throw new Error(`${logText} _multiExpChunk buffScalars is not Uint8Array`);
      }
      inType = inType || "affine";
      let sGIn;
      let fnName;
      if (groupName == "G1") {
        if (inType == "affine") {
          fnName = "g1m_multiexpAffine_chunk";
          sGIn = G.F.n8 * 2;
        } else {
          fnName = "g1m_multiexp_chunk";
          sGIn = G.F.n8 * 3;
        }
      } else if (groupName == "G2") {
        if (inType == "affine") {
          fnName = "g2m_multiexpAffine_chunk";
          sGIn = G.F.n8 * 2;
        } else {
          fnName = "g2m_multiexp_chunk";
          sGIn = G.F.n8 * 3;
        }
      } else {
        throw new Error("Invalid group");
      }
      const nPoints = Math.floor(buffBases.byteLength / sGIn);
      if (nPoints == 0)
        return G.zero;
      const sScalar = Math.floor(buffScalars.byteLength / nPoints);
      if (sScalar * nPoints != buffScalars.byteLength) {
        throw new Error("Scalar size does not match");
      }
      const bitChunkSize = pTSizes[log22(nPoints)];
      const nChunks = Math.floor((sScalar * 8 - 1) / bitChunkSize) + 1;
      const opPromises = [];
      for (let i = 0; i < nChunks; i++) {
        const task = [
          { cmd: "ALLOCSET", var: 0, buff: buffBases },
          { cmd: "ALLOCSET", var: 1, buff: buffScalars },
          { cmd: "ALLOC", var: 2, len: G.F.n8 * 3 },
          {
            cmd: "CALL",
            fnName,
            params: [
              { var: 0 },
              { var: 1 },
              { val: sScalar },
              { val: nPoints },
              { val: i * bitChunkSize },
              { val: Math.min(sScalar * 8 - i * bitChunkSize, bitChunkSize) },
              { var: 2 }
            ]
          },
          { cmd: "GET", out: 0, var: 2, len: G.F.n8 * 3 }
        ];
        opPromises.push(G.tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      let res = G.zero;
      for (let i = result.length - 1; i >= 0; i--) {
        if (!G.isZero(res)) {
          for (let j = 0; j < bitChunkSize; j++)
            res = G.double(res);
        }
        res = G.add(res, result[i][0]);
      }
      return res;
    }
    async function _multiExp(buffBases, buffScalars, inType, logger, logText) {
      const MAX_CHUNK_SIZE = 1 << 22;
      const MIN_CHUNK_SIZE = 1 << 10;
      let sGIn;
      if (groupName == "G1") {
        if (inType == "affine") {
          sGIn = G.F.n8 * 2;
        } else {
          sGIn = G.F.n8 * 3;
        }
      } else if (groupName == "G2") {
        if (inType == "affine") {
          sGIn = G.F.n8 * 2;
        } else {
          sGIn = G.F.n8 * 3;
        }
      } else {
        throw new Error("Invalid group");
      }
      const nPoints = Math.floor(buffBases.byteLength / sGIn);
      const sScalar = Math.floor(buffScalars.byteLength / nPoints);
      if (sScalar * nPoints != buffScalars.byteLength) {
        throw new Error("Scalar size does not match");
      }
      const bitChunkSize = pTSizes[log22(nPoints)];
      const nChunks = Math.floor((sScalar * 8 - 1) / bitChunkSize) + 1;
      let chunkSize;
      chunkSize = Math.floor(nPoints / (tm.concurrency / nChunks));
      if (chunkSize > MAX_CHUNK_SIZE)
        chunkSize = MAX_CHUNK_SIZE;
      if (chunkSize < MIN_CHUNK_SIZE)
        chunkSize = MIN_CHUNK_SIZE;
      const opPromises = [];
      for (let i = 0; i < nPoints; i += chunkSize) {
        if (logger)
          logger.debug(`Multiexp start: ${logText}: ${i}/${nPoints}`);
        const n = Math.min(nPoints - i, chunkSize);
        const buffBasesChunk = buffBases.slice(i * sGIn, (i + n) * sGIn);
        const buffScalarsChunk = buffScalars.slice(i * sScalar, (i + n) * sScalar);
        opPromises.push(
          _multiExpChunk(
            buffBasesChunk,
            buffScalarsChunk,
            inType,
            logger,
            logText
          ).then((r) => {
            if (logger)
              logger.debug(`Multiexp end: ${logText}: ${i}/${nPoints}`);
            return r;
          })
        );
      }
      const result = await Promise.all(opPromises);
      let res = G.zero;
      for (let i = result.length - 1; i >= 0; i--) {
        res = G.add(res, result[i]);
      }
      return res;
    }
    G.multiExp = async function multiExpAffine(buffBases, buffScalars, logger, logText) {
      return await _multiExp(buffBases, buffScalars, "jacobian", logger, logText);
    };
    G.multiExpAffine = async function multiExpAffine(buffBases, buffScalars, logger, logText) {
      return await _multiExp(buffBases, buffScalars, "affine", logger, logText);
    };
  }
  var pTSizes;
  var init_engine_multiexp = __esm({
    "src/intmax/lib/ffjavascript/engine_multiexp.js"() {
      init_utils();
      pTSizes = [
        1,
        1,
        1,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        13,
        14,
        15,
        16,
        16,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17,
        17
      ];
    }
  });

  // src/intmax/lib/ffjavascript/engine_fft.js
  function buildFFT(curve, groupName) {
    const G = curve[groupName];
    const Fr = curve.Fr;
    const tm = G.tm;
    async function _fft(buff, inverse, inType, outType, logger, loggerTxt) {
      inType = inType || "affine";
      outType = outType || "affine";
      const MAX_BITS_THREAD = 14;
      let sIn, sMid, sOut, fnIn2Mid, fnMid2Out, fnFFTMix, fnFFTJoin, fnFFTFinal;
      if (groupName == "G1") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
          fnIn2Mid = "g1m_batchToJacobian";
        } else {
          sIn = G.F.n8 * 3;
        }
        sMid = G.F.n8 * 3;
        if (inverse) {
          fnFFTFinal = "g1m_fftFinal";
        }
        fnFFTJoin = "g1m_fftJoin";
        fnFFTMix = "g1m_fftMix";
        if (outType == "affine") {
          sOut = G.F.n8 * 2;
          fnMid2Out = "g1m_batchToAffine";
        } else {
          sOut = G.F.n8 * 3;
        }
      } else if (groupName == "G2") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
          fnIn2Mid = "g2m_batchToJacobian";
        } else {
          sIn = G.F.n8 * 3;
        }
        sMid = G.F.n8 * 3;
        if (inverse) {
          fnFFTFinal = "g2m_fftFinal";
        }
        fnFFTJoin = "g2m_fftJoin";
        fnFFTMix = "g2m_fftMix";
        if (outType == "affine") {
          sOut = G.F.n8 * 2;
          fnMid2Out = "g2m_batchToAffine";
        } else {
          sOut = G.F.n8 * 3;
        }
      } else if (groupName == "Fr") {
        sIn = G.n8;
        sMid = G.n8;
        sOut = G.n8;
        if (inverse) {
          fnFFTFinal = "frm_fftFinal";
        }
        fnFFTMix = "frm_fftMix";
        fnFFTJoin = "frm_fftJoin";
      }
      let returnArray = false;
      if (Array.isArray(buff)) {
        buff = array2buffer(buff, sIn);
        returnArray = true;
      } else {
        buff = buff.slice(0, buff.byteLength);
      }
      const nPoints = buff.byteLength / sIn;
      const bits2 = log22(nPoints);
      if (1 << bits2 != nPoints) {
        throw new Error("fft must be multiple of 2");
      }
      if (bits2 == Fr.s + 1) {
        let buffOut2;
        if (inverse) {
          buffOut2 = await _fftExtInv(buff, inType, outType, logger, loggerTxt);
        } else {
          buffOut2 = await _fftExt(buff, inType, outType, logger, loggerTxt);
        }
        if (returnArray) {
          return buffer2array(buffOut2, sOut);
        } else {
          return buffOut2;
        }
      }
      let inv;
      if (inverse) {
        inv = Fr.inv(Fr.e(nPoints));
      }
      let buffOut;
      buffReverseBits(buff, sIn);
      let chunks;
      let pointsInChunk = Math.min(1 << MAX_BITS_THREAD, nPoints);
      let nChunks = nPoints / pointsInChunk;
      while (nChunks < tm.concurrency && pointsInChunk >= 16) {
        nChunks *= 2;
        pointsInChunk /= 2;
      }
      const l2Chunk = log22(pointsInChunk);
      const promises = [];
      for (let i = 0; i < nChunks; i++) {
        if (logger)
          logger.debug(`${loggerTxt}: fft ${bits2} mix start: ${i}/${nChunks}`);
        const task = [];
        task.push({ cmd: "ALLOC", var: 0, len: sMid * pointsInChunk });
        const buffChunk = buff.slice(
          pointsInChunk * i * sIn,
          pointsInChunk * (i + 1) * sIn
        );
        task.push({ cmd: "SET", var: 0, buff: buffChunk });
        if (fnIn2Mid) {
          task.push({
            cmd: "CALL",
            fnName: fnIn2Mid,
            params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }]
          });
        }
        for (let j = 1; j <= l2Chunk; j++) {
          task.push({
            cmd: "CALL",
            fnName: fnFFTMix,
            params: [{ var: 0 }, { val: pointsInChunk }, { val: j }]
          });
        }
        if (l2Chunk == bits2) {
          if (fnFFTFinal) {
            task.push({ cmd: "ALLOCSET", var: 1, buff: inv });
            task.push({
              cmd: "CALL",
              fnName: fnFFTFinal,
              params: [{ var: 0 }, { val: pointsInChunk }, { var: 1 }]
            });
          }
          if (fnMid2Out) {
            task.push({
              cmd: "CALL",
              fnName: fnMid2Out,
              params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }]
            });
          }
          task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sOut });
        } else {
          task.push({ cmd: "GET", out: 0, var: 0, len: sMid * pointsInChunk });
        }
        promises.push(
          tm.queueAction(task).then((r) => {
            if (logger)
              logger.debug(`${loggerTxt}: fft ${bits2} mix end: ${i}/${nChunks}`);
            return r;
          })
        );
      }
      chunks = await Promise.all(promises);
      for (let i = 0; i < nChunks; i++)
        chunks[i] = chunks[i][0];
      for (let i = l2Chunk + 1; i <= bits2; i++) {
        if (logger)
          logger.debug(`${loggerTxt}: fft  ${bits2}  join: ${i}/${bits2}`);
        const nGroups = 1 << bits2 - i;
        const nChunksPerGroup = nChunks / nGroups;
        const opPromises = [];
        for (let j = 0; j < nGroups; j++) {
          for (let k = 0; k < nChunksPerGroup / 2; k++) {
            const first = Fr.exp(Fr.w[i], k * pointsInChunk);
            const inc = Fr.w[i];
            const o1 = j * nChunksPerGroup + k;
            const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
            const task = [];
            task.push({ cmd: "ALLOCSET", var: 0, buff: chunks[o1] });
            task.push({ cmd: "ALLOCSET", var: 1, buff: chunks[o2] });
            task.push({ cmd: "ALLOCSET", var: 2, buff: first });
            task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
            task.push({
              cmd: "CALL",
              fnName: fnFFTJoin,
              params: [
                { var: 0 },
                { var: 1 },
                { val: pointsInChunk },
                { var: 2 },
                { var: 3 }
              ]
            });
            if (i == bits2) {
              if (fnFFTFinal) {
                task.push({ cmd: "ALLOCSET", var: 4, buff: inv });
                task.push({
                  cmd: "CALL",
                  fnName: fnFFTFinal,
                  params: [{ var: 0 }, { val: pointsInChunk }, { var: 4 }]
                });
                task.push({
                  cmd: "CALL",
                  fnName: fnFFTFinal,
                  params: [{ var: 1 }, { val: pointsInChunk }, { var: 4 }]
                });
              }
              if (fnMid2Out) {
                task.push({
                  cmd: "CALL",
                  fnName: fnMid2Out,
                  params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }]
                });
                task.push({
                  cmd: "CALL",
                  fnName: fnMid2Out,
                  params: [{ var: 1 }, { val: pointsInChunk }, { var: 1 }]
                });
              }
              task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sOut });
              task.push({ cmd: "GET", out: 1, var: 1, len: pointsInChunk * sOut });
            } else {
              task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sMid });
              task.push({ cmd: "GET", out: 1, var: 1, len: pointsInChunk * sMid });
            }
            opPromises.push(
              tm.queueAction(task).then((r) => {
                if (logger)
                  logger.debug(
                    `${loggerTxt}: fft ${bits2} join  ${i}/${bits2}  ${j + 1}/${nGroups} ${k}/${nChunksPerGroup / 2}`
                  );
                return r;
              })
            );
          }
        }
        const res = await Promise.all(opPromises);
        for (let j = 0; j < nGroups; j++) {
          for (let k = 0; k < nChunksPerGroup / 2; k++) {
            const o1 = j * nChunksPerGroup + k;
            const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
            const resChunk = res.shift();
            chunks[o1] = resChunk[0];
            chunks[o2] = resChunk[1];
          }
        }
      }
      if (buff instanceof BigBuffer) {
        buffOut = new BigBuffer(nPoints * sOut);
      } else {
        buffOut = new Uint8Array(nPoints * sOut);
      }
      if (inverse) {
        buffOut.set(chunks[0].slice((pointsInChunk - 1) * sOut));
        let p = sOut;
        for (let i = nChunks - 1; i > 0; i--) {
          buffOut.set(chunks[i], p);
          p += pointsInChunk * sOut;
          delete chunks[i];
        }
        buffOut.set(chunks[0].slice(0, (pointsInChunk - 1) * sOut), p);
        delete chunks[0];
      } else {
        for (let i = 0; i < nChunks; i++) {
          buffOut.set(chunks[i], pointsInChunk * sOut * i);
          delete chunks[i];
        }
      }
      if (returnArray) {
        return buffer2array(buffOut, sOut);
      } else {
        return buffOut;
      }
    }
    async function _fftExt(buff, inType, outType, logger, loggerTxt) {
      let b1, b2;
      b1 = buff.slice(0, buff.byteLength / 2);
      b2 = buff.slice(buff.byteLength / 2, buff.byteLength);
      const promises = [];
      [b1, b2] = await _fftJoinExt(
        b1,
        b2,
        "fftJoinExt",
        Fr.one,
        Fr.shift,
        inType,
        "jacobian",
        logger,
        loggerTxt
      );
      promises.push(_fft(b1, false, "jacobian", outType, logger, loggerTxt));
      promises.push(_fft(b2, false, "jacobian", outType, logger, loggerTxt));
      const res1 = await Promise.all(promises);
      let buffOut;
      if (res1[0].byteLength > 1 << 28) {
        buffOut = new BigBuffer(res1[0].byteLength * 2);
      } else {
        buffOut = new Uint8Array(res1[0].byteLength * 2);
      }
      buffOut.set(res1[0]);
      buffOut.set(res1[1], res1[0].byteLength);
      return buffOut;
    }
    async function _fftExtInv(buff, inType, outType, logger, loggerTxt) {
      let b1, b2;
      b1 = buff.slice(0, buff.byteLength / 2);
      b2 = buff.slice(buff.byteLength / 2, buff.byteLength);
      const promises = [];
      promises.push(_fft(b1, true, inType, "jacobian", logger, loggerTxt));
      promises.push(_fft(b2, true, inType, "jacobian", logger, loggerTxt));
      [b1, b2] = await Promise.all(promises);
      const res1 = await _fftJoinExt(
        b1,
        b2,
        "fftJoinExtInv",
        Fr.one,
        Fr.shiftInv,
        "jacobian",
        outType,
        logger,
        loggerTxt
      );
      let buffOut;
      if (res1[0].byteLength > 1 << 28) {
        buffOut = new BigBuffer(res1[0].byteLength * 2);
      } else {
        buffOut = new Uint8Array(res1[0].byteLength * 2);
      }
      buffOut.set(res1[0]);
      buffOut.set(res1[1], res1[0].byteLength);
      return buffOut;
    }
    async function _fftJoinExt(buff1, buff2, fn, first, inc, inType, outType, logger, loggerTxt) {
      const MAX_CHUNK_SIZE = 1 << 16;
      const MIN_CHUNK_SIZE = 1 << 4;
      let fnName;
      let fnIn2Mid, fnMid2Out;
      let sOut, sIn, sMid;
      if (groupName == "G1") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
          fnIn2Mid = "g1m_batchToJacobian";
        } else {
          sIn = G.F.n8 * 3;
        }
        sMid = G.F.n8 * 3;
        fnName = "g1m_" + fn;
        if (outType == "affine") {
          fnMid2Out = "g1m_batchToAffine";
          sOut = G.F.n8 * 2;
        } else {
          sOut = G.F.n8 * 3;
        }
      } else if (groupName == "G2") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
          fnIn2Mid = "g2m_batchToJacobian";
        } else {
          sIn = G.F.n8 * 3;
        }
        fnName = "g2m_" + fn;
        sMid = G.F.n8 * 3;
        if (outType == "affine") {
          fnMid2Out = "g2m_batchToAffine";
          sOut = G.F.n8 * 2;
        } else {
          sOut = G.F.n8 * 3;
        }
      } else if (groupName == "Fr") {
        sIn = Fr.n8;
        sOut = Fr.n8;
        sMid = Fr.n8;
        fnName = "frm_" + fn;
      } else {
        throw new Error("Invalid group");
      }
      if (buff1.byteLength != buff2.byteLength) {
        throw new Error("Invalid buffer size");
      }
      const nPoints = Math.floor(buff1.byteLength / sIn);
      if (nPoints != 1 << log22(nPoints)) {
        throw new Error("Invalid number of points");
      }
      let chunkSize = Math.floor(nPoints / tm.concurrency);
      if (chunkSize < MIN_CHUNK_SIZE)
        chunkSize = MIN_CHUNK_SIZE;
      if (chunkSize > MAX_CHUNK_SIZE)
        chunkSize = MAX_CHUNK_SIZE;
      const opPromises = [];
      for (let i = 0; i < nPoints; i += chunkSize) {
        if (logger)
          logger.debug(`${loggerTxt}: fftJoinExt Start: ${i}/${nPoints}`);
        const n = Math.min(nPoints - i, chunkSize);
        const firstChunk = Fr.mul(first, Fr.exp(inc, i));
        const task = [];
        const b1 = buff1.slice(i * sIn, (i + n) * sIn);
        const b2 = buff2.slice(i * sIn, (i + n) * sIn);
        task.push({ cmd: "ALLOC", var: 0, len: sMid * n });
        task.push({ cmd: "SET", var: 0, buff: b1 });
        task.push({ cmd: "ALLOC", var: 1, len: sMid * n });
        task.push({ cmd: "SET", var: 1, buff: b2 });
        task.push({ cmd: "ALLOCSET", var: 2, buff: firstChunk });
        task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
        if (fnIn2Mid) {
          task.push({
            cmd: "CALL",
            fnName: fnIn2Mid,
            params: [{ var: 0 }, { val: n }, { var: 0 }]
          });
          task.push({
            cmd: "CALL",
            fnName: fnIn2Mid,
            params: [{ var: 1 }, { val: n }, { var: 1 }]
          });
        }
        task.push({
          cmd: "CALL",
          fnName,
          params: [
            { var: 0 },
            { var: 1 },
            { val: n },
            { var: 2 },
            { var: 3 },
            { val: Fr.s }
          ]
        });
        if (fnMid2Out) {
          task.push({
            cmd: "CALL",
            fnName: fnMid2Out,
            params: [{ var: 0 }, { val: n }, { var: 0 }]
          });
          task.push({
            cmd: "CALL",
            fnName: fnMid2Out,
            params: [{ var: 1 }, { val: n }, { var: 1 }]
          });
        }
        task.push({ cmd: "GET", out: 0, var: 0, len: n * sOut });
        task.push({ cmd: "GET", out: 1, var: 1, len: n * sOut });
        opPromises.push(
          tm.queueAction(task).then((r) => {
            if (logger)
              logger.debug(`${loggerTxt}: fftJoinExt End: ${i}/${nPoints}`);
            return r;
          })
        );
      }
      const result = await Promise.all(opPromises);
      let fullBuffOut1;
      let fullBuffOut2;
      if (nPoints * sOut > 1 << 28) {
        fullBuffOut1 = new BigBuffer(nPoints * sOut);
        fullBuffOut2 = new BigBuffer(nPoints * sOut);
      } else {
        fullBuffOut1 = new Uint8Array(nPoints * sOut);
        fullBuffOut2 = new Uint8Array(nPoints * sOut);
      }
      let p = 0;
      for (let i = 0; i < result.length; i++) {
        fullBuffOut1.set(result[i][0], p);
        fullBuffOut2.set(result[i][1], p);
        p += result[i][0].byteLength;
      }
      return [fullBuffOut1, fullBuffOut2];
    }
    G.fft = async function(buff, inType, outType, logger, loggerTxt) {
      return await _fft(buff, false, inType, outType, logger, loggerTxt);
    };
    G.ifft = async function(buff, inType, outType, logger, loggerTxt) {
      return await _fft(buff, true, inType, outType, logger, loggerTxt);
    };
    G.lagrangeEvaluations = async function(buff, inType, outType, logger, loggerTxt) {
      inType = inType || "affine";
      outType = outType || "affine";
      let sIn;
      if (groupName == "G1") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
        } else {
          sIn = G.F.n8 * 3;
        }
      } else if (groupName == "G2") {
        if (inType == "affine") {
          sIn = G.F.n8 * 2;
        } else {
          sIn = G.F.n8 * 3;
        }
      } else if (groupName == "Fr") {
        sIn = Fr.n8;
      } else {
        throw new Error("Invalid group");
      }
      const nPoints = buff.byteLength / sIn;
      const bits2 = log22(nPoints);
      if (2 ** bits2 * sIn != buff.byteLength) {
        if (logger)
          logger.error("lagrangeEvaluations iinvalid input size");
        throw new Error("lagrangeEvaluations invalid Input size");
      }
      if (bits2 <= Fr.s) {
        return await G.ifft(buff, inType, outType, logger, loggerTxt);
      }
      if (bits2 > Fr.s + 1) {
        if (logger)
          logger.error("lagrangeEvaluations input too big");
        throw new Error("lagrangeEvaluations input too big");
      }
      let t0 = buff.slice(0, buff.byteLength / 2);
      let t1 = buff.slice(buff.byteLength / 2, buff.byteLength);
      const shiftToSmallM = Fr.exp(Fr.shift, nPoints / 2);
      const sConst = Fr.inv(Fr.sub(Fr.one, shiftToSmallM));
      [t0, t1] = await _fftJoinExt(
        t0,
        t1,
        "prepareLagrangeEvaluation",
        sConst,
        Fr.shiftInv,
        inType,
        "jacobian",
        logger,
        loggerTxt + " prep"
      );
      const promises = [];
      promises.push(
        _fft(t0, true, "jacobian", outType, logger, loggerTxt + " t0")
      );
      promises.push(
        _fft(t1, true, "jacobian", outType, logger, loggerTxt + " t1")
      );
      [t0, t1] = await Promise.all(promises);
      let buffOut;
      if (t0.byteLength > 1 << 28) {
        buffOut = new BigBuffer(t0.byteLength * 2);
      } else {
        buffOut = new Uint8Array(t0.byteLength * 2);
      }
      buffOut.set(t0);
      buffOut.set(t1, t0.byteLength);
      return buffOut;
    };
    G.fftMix = async function fftMix(buff) {
      const sG = G.F.n8 * 3;
      let fnName, fnFFTJoin;
      if (groupName == "G1") {
        fnName = "g1m_fftMix";
        fnFFTJoin = "g1m_fftJoin";
      } else if (groupName == "G2") {
        fnName = "g2m_fftMix";
        fnFFTJoin = "g2m_fftJoin";
      } else if (groupName == "Fr") {
        fnName = "frm_fftMix";
        fnFFTJoin = "frm_fftJoin";
      } else {
        throw new Error("Invalid group");
      }
      const nPoints = Math.floor(buff.byteLength / sG);
      const power = log22(nPoints);
      let nChunks = 1 << log22(tm.concurrency);
      if (nPoints <= nChunks * 2)
        nChunks = 1;
      const pointsPerChunk = nPoints / nChunks;
      const powerChunk = log22(pointsPerChunk);
      const opPromises = [];
      for (let i = 0; i < nChunks; i++) {
        const task = [];
        const b = buff.slice(
          i * pointsPerChunk * sG,
          (i + 1) * pointsPerChunk * sG
        );
        task.push({ cmd: "ALLOCSET", var: 0, buff: b });
        for (let j = 1; j <= powerChunk; j++) {
          task.push({
            cmd: "CALL",
            fnName,
            params: [{ var: 0 }, { val: pointsPerChunk }, { val: j }]
          });
        }
        task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
        opPromises.push(tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      const chunks = [];
      for (let i = 0; i < result.length; i++)
        chunks[i] = result[i][0];
      for (let i = powerChunk + 1; i <= power; i++) {
        const nGroups = 1 << power - i;
        const nChunksPerGroup = nChunks / nGroups;
        const opPromises2 = [];
        for (let j = 0; j < nGroups; j++) {
          for (let k = 0; k < nChunksPerGroup / 2; k++) {
            const first = Fr.exp(Fr.w[i], k * pointsPerChunk);
            const inc = Fr.w[i];
            const o1 = j * nChunksPerGroup + k;
            const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
            const task = [];
            task.push({ cmd: "ALLOCSET", var: 0, buff: chunks[o1] });
            task.push({ cmd: "ALLOCSET", var: 1, buff: chunks[o2] });
            task.push({ cmd: "ALLOCSET", var: 2, buff: first });
            task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
            task.push({
              cmd: "CALL",
              fnName: fnFFTJoin,
              params: [
                { var: 0 },
                { var: 1 },
                { val: pointsPerChunk },
                { var: 2 },
                { var: 3 }
              ]
            });
            task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
            task.push({ cmd: "GET", out: 1, var: 1, len: pointsPerChunk * sG });
            opPromises2.push(tm.queueAction(task));
          }
        }
        const res = await Promise.all(opPromises2);
        for (let j = 0; j < nGroups; j++) {
          for (let k = 0; k < nChunksPerGroup / 2; k++) {
            const o1 = j * nChunksPerGroup + k;
            const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
            const resChunk = res.shift();
            chunks[o1] = resChunk[0];
            chunks[o2] = resChunk[1];
          }
        }
      }
      let fullBuffOut;
      if (buff instanceof BigBuffer) {
        fullBuffOut = new BigBuffer(nPoints * sG);
      } else {
        fullBuffOut = new Uint8Array(nPoints * sG);
      }
      let p = 0;
      for (let i = 0; i < nChunks; i++) {
        fullBuffOut.set(chunks[i], p);
        p += chunks[i].byteLength;
      }
      return fullBuffOut;
    };
    G.fftJoin = async function fftJoin(buff1, buff2, first, inc) {
      const sG = G.F.n8 * 3;
      let fnName;
      if (groupName == "G1") {
        fnName = "g1m_fftJoin";
      } else if (groupName == "G2") {
        fnName = "g2m_fftJoin";
      } else if (groupName == "Fr") {
        fnName = "frm_fftJoin";
      } else {
        throw new Error("Invalid group");
      }
      if (buff1.byteLength != buff2.byteLength) {
        throw new Error("Invalid buffer size");
      }
      const nPoints = Math.floor(buff1.byteLength / sG);
      if (nPoints != 1 << log22(nPoints)) {
        throw new Error("Invalid number of points");
      }
      let nChunks = 1 << log22(tm.concurrency);
      if (nPoints <= nChunks * 2)
        nChunks = 1;
      const pointsPerChunk = nPoints / nChunks;
      const opPromises = [];
      for (let i = 0; i < nChunks; i++) {
        const task = [];
        const firstChunk = Fr.mul(first, Fr.exp(inc, i * pointsPerChunk));
        const b1 = buff1.slice(
          i * pointsPerChunk * sG,
          (i + 1) * pointsPerChunk * sG
        );
        const b2 = buff2.slice(
          i * pointsPerChunk * sG,
          (i + 1) * pointsPerChunk * sG
        );
        task.push({ cmd: "ALLOCSET", var: 0, buff: b1 });
        task.push({ cmd: "ALLOCSET", var: 1, buff: b2 });
        task.push({ cmd: "ALLOCSET", var: 2, buff: firstChunk });
        task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
        task.push({
          cmd: "CALL",
          fnName,
          params: [
            { var: 0 },
            { var: 1 },
            { val: pointsPerChunk },
            { var: 2 },
            { var: 3 }
          ]
        });
        task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
        task.push({ cmd: "GET", out: 1, var: 1, len: pointsPerChunk * sG });
        opPromises.push(tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      let fullBuffOut1;
      let fullBuffOut2;
      if (buff1 instanceof BigBuffer) {
        fullBuffOut1 = new BigBuffer(nPoints * sG);
        fullBuffOut2 = new BigBuffer(nPoints * sG);
      } else {
        fullBuffOut1 = new Uint8Array(nPoints * sG);
        fullBuffOut2 = new Uint8Array(nPoints * sG);
      }
      let p = 0;
      for (let i = 0; i < result.length; i++) {
        fullBuffOut1.set(result[i][0], p);
        fullBuffOut2.set(result[i][1], p);
        p += result[i][0].byteLength;
      }
      return [fullBuffOut1, fullBuffOut2];
    };
    G.fftFinal = async function fftFinal(buff, factor) {
      const sG = G.F.n8 * 3;
      const sGout = G.F.n8 * 2;
      let fnName, fnToAffine;
      if (groupName == "G1") {
        fnName = "g1m_fftFinal";
        fnToAffine = "g1m_batchToAffine";
      } else if (groupName == "G2") {
        fnName = "g2m_fftFinal";
        fnToAffine = "g2m_batchToAffine";
      } else {
        throw new Error("Invalid group");
      }
      const nPoints = Math.floor(buff.byteLength / sG);
      if (nPoints != 1 << log22(nPoints)) {
        throw new Error("Invalid number of points");
      }
      const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
      const opPromises = [];
      for (let i = 0; i < tm.concurrency; i++) {
        let n;
        if (i < tm.concurrency - 1) {
          n = pointsPerChunk;
        } else {
          n = nPoints - i * pointsPerChunk;
        }
        if (n == 0)
          continue;
        const task = [];
        const b = buff.slice(
          i * pointsPerChunk * sG,
          (i * pointsPerChunk + n) * sG
        );
        task.push({ cmd: "ALLOCSET", var: 0, buff: b });
        task.push({ cmd: "ALLOCSET", var: 1, buff: factor });
        task.push({
          cmd: "CALL",
          fnName,
          params: [{ var: 0 }, { val: n }, { var: 1 }]
        });
        task.push({
          cmd: "CALL",
          fnName: fnToAffine,
          params: [{ var: 0 }, { val: n }, { var: 0 }]
        });
        task.push({ cmd: "GET", out: 0, var: 0, len: n * sGout });
        opPromises.push(tm.queueAction(task));
      }
      const result = await Promise.all(opPromises);
      let fullBuffOut;
      if (buff instanceof BigBuffer) {
        fullBuffOut = new BigBuffer(nPoints * sGout);
      } else {
        fullBuffOut = new Uint8Array(nPoints * sGout);
      }
      let p = 0;
      for (let i = result.length - 1; i >= 0; i--) {
        fullBuffOut.set(result[i][0], p);
        p += result[i][0].byteLength;
      }
      return fullBuffOut;
    };
  }
  var init_engine_fft = __esm({
    "src/intmax/lib/ffjavascript/engine_fft.js"() {
      init_utils();
      init_bigbuffer();
    }
  });

  // src/intmax/lib/ffjavascript/engine.js
  async function buildEngine(params) {
    const tm = await buildThreadManager(params.wasm, params.singleThread);
    const curve = {};
    curve.q = e(params.wasm.q.toString());
    curve.r = e(params.wasm.r.toString());
    curve.name = params.name;
    curve.tm = tm;
    curve.prePSize = params.wasm.prePSize;
    curve.preQSize = params.wasm.preQSize;
    curve.Fr = new WasmField1(tm, "frm", params.n8r, params.r);
    curve.F1 = new WasmField1(tm, "f1m", params.n8q, params.q);
    curve.F2 = new WasmField2(tm, "f2m", curve.F1);
    curve.G1 = new WasmCurve(
      tm,
      "g1m",
      curve.F1,
      params.wasm.pG1gen,
      params.wasm.pG1b,
      params.cofactorG1
    );
    curve.G2 = new WasmCurve(
      tm,
      "g2m",
      curve.F2,
      params.wasm.pG2gen,
      params.wasm.pG2b,
      params.cofactorG2
    );
    curve.F6 = new WasmField3(tm, "f6m", curve.F2);
    curve.F12 = new WasmField2(tm, "ftm", curve.F6);
    curve.Gt = curve.F12;
    buildBatchApplyKey(curve, "G1");
    buildBatchApplyKey(curve, "G2");
    buildBatchApplyKey(curve, "Fr");
    buildMultiexp(curve, "G1");
    buildMultiexp(curve, "G2");
    buildFFT(curve, "G1");
    buildFFT(curve, "G2");
    buildFFT(curve, "Fr");
    buildPairing(curve);
    curve.array2buffer = function(arr, sG) {
      const buff = new Uint8Array(sG * arr.length);
      for (let i = 0; i < arr.length; i++) {
        buff.set(arr[i], i * sG);
      }
      return buff;
    };
    curve.buffer2array = function(buff, sG) {
      const n = buff.byteLength / sG;
      const arr = new Array(n);
      for (let i = 0; i < n; i++) {
        arr[i] = buff.slice(i * sG, i * sG + sG);
      }
      return arr;
    };
    return curve;
  }
  var init_engine = __esm({
    "src/intmax/lib/ffjavascript/engine.js"() {
      init_wasm_field1();
      init_wasm_field2();
      init_wasm_field3();
      init_wasm_curve();
      init_threadman();
      init_scalar();
      init_engine_applykey();
      init_engine_pairing();
      init_engine_multiexp();
      init_engine_fft();
    }
  });

  // node_modules/wasmbuilder/src/utils.js
  function toNumber2(n) {
    return BigInt(n);
  }
  function isNegative2(n) {
    return n < 0n;
  }
  function isZero2(n) {
    return n === 0n;
  }
  function bitLength2(n) {
    if (isNegative2(n)) {
      return n.toString(2).length - 1;
    } else {
      return n.toString(2).length;
    }
  }
  function u32(n) {
    const b = [];
    const v = toNumber2(n);
    b.push(Number(v & 0xFFn));
    b.push(Number(v >> 8n & 0xFFn));
    b.push(Number(v >> 16n & 0xFFn));
    b.push(Number(v >> 24n & 0xFFn));
    return b;
  }
  function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 128)
        utf8.push(charcode);
      else if (charcode < 2048) {
        utf8.push(
          192 | charcode >> 6,
          128 | charcode & 63
        );
      } else if (charcode < 55296 || charcode >= 57344) {
        utf8.push(
          224 | charcode >> 12,
          128 | charcode >> 6 & 63,
          128 | charcode & 63
        );
      } else {
        i++;
        charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i) & 1023);
        utf8.push(
          240 | charcode >> 18,
          128 | charcode >> 12 & 63,
          128 | charcode >> 6 & 63,
          128 | charcode & 63
        );
      }
    }
    return utf8;
  }
  function string(str) {
    const bytes = toUTF8Array(str);
    return [...varuint32(bytes.length), ...bytes];
  }
  function varuint(n) {
    const code = [];
    let v = toNumber2(n);
    if (isNegative2(v))
      throw new Error("Number cannot be negative");
    while (!isZero2(v)) {
      code.push(Number(v & 0x7Fn));
      v = v >> 7n;
    }
    if (code.length == 0)
      code.push(0);
    for (let i = 0; i < code.length - 1; i++) {
      code[i] = code[i] | 128;
    }
    return code;
  }
  function varint(_n) {
    let n, sign;
    const bits2 = bitLength2(_n);
    if (_n < 0) {
      sign = true;
      n = (1n << BigInt(bits2)) + _n;
    } else {
      sign = false;
      n = toNumber2(_n);
    }
    const paddingBits = 7 - bits2 % 7;
    const padding = (1n << BigInt(paddingBits)) - 1n << BigInt(bits2);
    const paddingMask = (1 << 7 - paddingBits) - 1 | 128;
    const code = varuint(n + padding);
    if (!sign) {
      code[code.length - 1] = code[code.length - 1] & paddingMask;
    }
    return code;
  }
  function varint32(n) {
    let v = toNumber2(n);
    if (v > 0xFFFFFFFFn)
      throw new Error("Number too big");
    if (v > 0x7FFFFFFFn)
      v = v - 0x100000000n;
    if (v < -2147483648n)
      throw new Error("Number too small");
    return varint(v);
  }
  function varint64(n) {
    let v = toNumber2(n);
    if (v > 0xFFFFFFFFFFFFFFFFn)
      throw new Error("Number too big");
    if (v > 0x7FFFFFFFFFFFFFFFn)
      v = v - 0x10000000000000000n;
    if (v < -9223372036854775808n)
      throw new Error("Number too small");
    return varint(v);
  }
  function varuint32(n) {
    let v = toNumber2(n);
    if (v > 0xFFFFFFFFn)
      throw new Error("Number too big");
    return varuint(v);
  }
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ("0" + (byte & 255).toString(16)).slice(-2);
    }).join("");
  }
  var init_utils2 = __esm({
    "node_modules/wasmbuilder/src/utils.js"() {
    }
  });

  // node_modules/wasmbuilder/src/codebuilder.js
  var CodeBuilder;
  var init_codebuilder = __esm({
    "node_modules/wasmbuilder/src/codebuilder.js"() {
      init_utils2();
      CodeBuilder = class {
        constructor(func) {
          this.func = func;
          this.functionName = func.functionName;
          this.module = func.module;
        }
        setLocal(localName, valCode) {
          const idx = this.func.localIdxByName[localName];
          if (idx === void 0)
            throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
          return [...valCode, 33, ...varuint32(idx)];
        }
        teeLocal(localName, valCode) {
          const idx = this.func.localIdxByName[localName];
          if (idx === void 0)
            throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
          return [...valCode, 34, ...varuint32(idx)];
        }
        getLocal(localName) {
          const idx = this.func.localIdxByName[localName];
          if (idx === void 0)
            throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
          return [32, ...varuint32(idx)];
        }
        i64_load8_s(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 0 : _align;
          return [...idxCode, 48, align, ...varuint32(offset)];
        }
        i64_load8_u(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 0 : _align;
          return [...idxCode, 49, align, ...varuint32(offset)];
        }
        i64_load16_s(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 1 : _align;
          return [...idxCode, 50, align, ...varuint32(offset)];
        }
        i64_load16_u(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 1 : _align;
          return [...idxCode, 51, align, ...varuint32(offset)];
        }
        i64_load32_s(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 2 : _align;
          return [...idxCode, 52, align, ...varuint32(offset)];
        }
        i64_load32_u(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 2 : _align;
          return [...idxCode, 53, align, ...varuint32(offset)];
        }
        i64_load(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 3 : _align;
          return [...idxCode, 41, align, ...varuint32(offset)];
        }
        i64_store(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 3;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 3;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 55, align, ...varuint32(offset)];
        }
        i64_store32(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 2;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 2;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 62, align, ...varuint32(offset)];
        }
        i64_store16(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 1;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 1;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 61, align, ...varuint32(offset)];
        }
        i64_store8(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 0;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 0;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 60, align, ...varuint32(offset)];
        }
        i32_load8_s(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 0 : _align;
          return [...idxCode, 44, align, ...varuint32(offset)];
        }
        i32_load8_u(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 0 : _align;
          return [...idxCode, 45, align, ...varuint32(offset)];
        }
        i32_load16_s(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 1 : _align;
          return [...idxCode, 46, align, ...varuint32(offset)];
        }
        i32_load16_u(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 1 : _align;
          return [...idxCode, 47, align, ...varuint32(offset)];
        }
        i32_load(idxCode, _offset, _align) {
          const offset = _offset || 0;
          const align = _align === void 0 ? 2 : _align;
          return [...idxCode, 40, align, ...varuint32(offset)];
        }
        i32_store(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 2;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 2;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 54, align, ...varuint32(offset)];
        }
        i32_store16(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 1;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 1;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 59, align, ...varuint32(offset)];
        }
        i32_store8(idxCode, _offset, _align, _codeVal) {
          let offset, align, codeVal;
          if (Array.isArray(_offset)) {
            offset = 0;
            align = 0;
            codeVal = _offset;
          } else if (Array.isArray(_align)) {
            offset = _offset;
            align = 0;
            codeVal = _align;
          } else if (Array.isArray(_codeVal)) {
            offset = _offset;
            align = _align;
            codeVal = _codeVal;
          }
          return [...idxCode, ...codeVal, 58, align, ...varuint32(offset)];
        }
        call(fnName, ...args) {
          const idx = this.module.functionIdxByName[fnName];
          if (idx === void 0)
            throw new Error(`Function not defined: Function: ${fnName}`);
          return [...[].concat(...args), 16, ...varuint32(idx)];
        }
        call_indirect(fnIdx, ...args) {
          return [...[].concat(...args), ...fnIdx, 17, 0, 0];
        }
        if(condCode, thenCode, elseCode) {
          if (elseCode) {
            return [...condCode, 4, 64, ...thenCode, 5, ...elseCode, 11];
          } else {
            return [...condCode, 4, 64, ...thenCode, 11];
          }
        }
        block(bCode) {
          return [2, 64, ...bCode, 11];
        }
        loop(...args) {
          return [3, 64, ...[].concat(...[...args]), 11];
        }
        br_if(relPath, condCode) {
          return [...condCode, 13, ...varuint32(relPath)];
        }
        br(relPath) {
          return [12, ...varuint32(relPath)];
        }
        ret(rCode) {
          return [...rCode, 15];
        }
        drop(dCode) {
          return [...dCode, 26];
        }
        i64_const(num) {
          return [66, ...varint64(num)];
        }
        i32_const(num) {
          return [65, ...varint32(num)];
        }
        i64_eqz(opcode) {
          return [...opcode, 80];
        }
        i64_eq(op1code, op2code) {
          return [...op1code, ...op2code, 81];
        }
        i64_ne(op1code, op2code) {
          return [...op1code, ...op2code, 82];
        }
        i64_lt_s(op1code, op2code) {
          return [...op1code, ...op2code, 83];
        }
        i64_lt_u(op1code, op2code) {
          return [...op1code, ...op2code, 84];
        }
        i64_gt_s(op1code, op2code) {
          return [...op1code, ...op2code, 85];
        }
        i64_gt_u(op1code, op2code) {
          return [...op1code, ...op2code, 86];
        }
        i64_le_s(op1code, op2code) {
          return [...op1code, ...op2code, 87];
        }
        i64_le_u(op1code, op2code) {
          return [...op1code, ...op2code, 88];
        }
        i64_ge_s(op1code, op2code) {
          return [...op1code, ...op2code, 89];
        }
        i64_ge_u(op1code, op2code) {
          return [...op1code, ...op2code, 90];
        }
        i64_add(op1code, op2code) {
          return [...op1code, ...op2code, 124];
        }
        i64_sub(op1code, op2code) {
          return [...op1code, ...op2code, 125];
        }
        i64_mul(op1code, op2code) {
          return [...op1code, ...op2code, 126];
        }
        i64_div_s(op1code, op2code) {
          return [...op1code, ...op2code, 127];
        }
        i64_div_u(op1code, op2code) {
          return [...op1code, ...op2code, 128];
        }
        i64_rem_s(op1code, op2code) {
          return [...op1code, ...op2code, 129];
        }
        i64_rem_u(op1code, op2code) {
          return [...op1code, ...op2code, 130];
        }
        i64_and(op1code, op2code) {
          return [...op1code, ...op2code, 131];
        }
        i64_or(op1code, op2code) {
          return [...op1code, ...op2code, 132];
        }
        i64_xor(op1code, op2code) {
          return [...op1code, ...op2code, 133];
        }
        i64_shl(op1code, op2code) {
          return [...op1code, ...op2code, 134];
        }
        i64_shr_s(op1code, op2code) {
          return [...op1code, ...op2code, 135];
        }
        i64_shr_u(op1code, op2code) {
          return [...op1code, ...op2code, 136];
        }
        i64_extend_i32_s(op1code) {
          return [...op1code, 172];
        }
        i64_extend_i32_u(op1code) {
          return [...op1code, 173];
        }
        i64_clz(op1code) {
          return [...op1code, 121];
        }
        i64_ctz(op1code) {
          return [...op1code, 122];
        }
        i32_eqz(op1code) {
          return [...op1code, 69];
        }
        i32_eq(op1code, op2code) {
          return [...op1code, ...op2code, 70];
        }
        i32_ne(op1code, op2code) {
          return [...op1code, ...op2code, 71];
        }
        i32_lt_s(op1code, op2code) {
          return [...op1code, ...op2code, 72];
        }
        i32_lt_u(op1code, op2code) {
          return [...op1code, ...op2code, 73];
        }
        i32_gt_s(op1code, op2code) {
          return [...op1code, ...op2code, 74];
        }
        i32_gt_u(op1code, op2code) {
          return [...op1code, ...op2code, 75];
        }
        i32_le_s(op1code, op2code) {
          return [...op1code, ...op2code, 76];
        }
        i32_le_u(op1code, op2code) {
          return [...op1code, ...op2code, 77];
        }
        i32_ge_s(op1code, op2code) {
          return [...op1code, ...op2code, 78];
        }
        i32_ge_u(op1code, op2code) {
          return [...op1code, ...op2code, 79];
        }
        i32_add(op1code, op2code) {
          return [...op1code, ...op2code, 106];
        }
        i32_sub(op1code, op2code) {
          return [...op1code, ...op2code, 107];
        }
        i32_mul(op1code, op2code) {
          return [...op1code, ...op2code, 108];
        }
        i32_div_s(op1code, op2code) {
          return [...op1code, ...op2code, 109];
        }
        i32_div_u(op1code, op2code) {
          return [...op1code, ...op2code, 110];
        }
        i32_rem_s(op1code, op2code) {
          return [...op1code, ...op2code, 111];
        }
        i32_rem_u(op1code, op2code) {
          return [...op1code, ...op2code, 112];
        }
        i32_and(op1code, op2code) {
          return [...op1code, ...op2code, 113];
        }
        i32_or(op1code, op2code) {
          return [...op1code, ...op2code, 114];
        }
        i32_xor(op1code, op2code) {
          return [...op1code, ...op2code, 115];
        }
        i32_shl(op1code, op2code) {
          return [...op1code, ...op2code, 116];
        }
        i32_shr_s(op1code, op2code) {
          return [...op1code, ...op2code, 117];
        }
        i32_shr_u(op1code, op2code) {
          return [...op1code, ...op2code, 118];
        }
        i32_rotl(op1code, op2code) {
          return [...op1code, ...op2code, 119];
        }
        i32_rotr(op1code, op2code) {
          return [...op1code, ...op2code, 120];
        }
        i32_wrap_i64(op1code) {
          return [...op1code, 167];
        }
        i32_clz(op1code) {
          return [...op1code, 103];
        }
        i32_ctz(op1code) {
          return [...op1code, 104];
        }
        unreachable() {
          return [0];
        }
        current_memory() {
          return [63, 0];
        }
        comment() {
          return [];
        }
      };
    }
  });

  // node_modules/wasmbuilder/src/functionbuilder.js
  var typeCodes, FunctionBuilder;
  var init_functionbuilder = __esm({
    "node_modules/wasmbuilder/src/functionbuilder.js"() {
      init_codebuilder();
      init_utils2();
      typeCodes = {
        "i32": 127,
        "i64": 126,
        "f32": 125,
        "f64": 124,
        "anyfunc": 112,
        "func": 96,
        "emptyblock": 64
      };
      FunctionBuilder = class {
        constructor(module, fnName, fnType, moduleName, fieldName) {
          if (fnType == "import") {
            this.fnType = "import";
            this.moduleName = moduleName;
            this.fieldName = fieldName;
          } else if (fnType == "internal") {
            this.fnType = "internal";
          } else {
            throw new Error("Invalid function fnType: " + fnType);
          }
          this.module = module;
          this.fnName = fnName;
          this.params = [];
          this.locals = [];
          this.localIdxByName = {};
          this.code = [];
          this.returnType = null;
          this.nextLocal = 0;
        }
        addParam(paramName, paramType) {
          if (this.localIdxByName[paramName])
            throw new Error(`param already exists. Function: ${this.fnName}, Param: ${paramName} `);
          const idx = this.nextLocal++;
          this.localIdxByName[paramName] = idx;
          this.params.push({
            type: paramType
          });
        }
        addLocal(localName, localType, _length) {
          const length = _length || 1;
          if (this.localIdxByName[localName])
            throw new Error(`local already exists. Function: ${this.fnName}, Param: ${localName} `);
          const idx = this.nextLocal++;
          this.localIdxByName[localName] = idx;
          this.locals.push({
            type: localType,
            length
          });
        }
        setReturnType(returnType) {
          if (this.returnType)
            throw new Error(`returnType already defined. Function: ${this.fnName}`);
          this.returnType = returnType;
        }
        getSignature() {
          const params = [...varuint32(this.params.length), ...this.params.map((p) => typeCodes[p.type])];
          const returns = this.returnType ? [1, typeCodes[this.returnType]] : [0];
          return [96, ...params, ...returns];
        }
        getBody() {
          const locals = this.locals.map((l) => [
            ...varuint32(l.length),
            typeCodes[l.type]
          ]);
          const body = [
            ...varuint32(this.locals.length),
            ...[].concat(...locals),
            ...this.code,
            11
          ];
          return [
            ...varuint32(body.length),
            ...body
          ];
        }
        addCode(...code) {
          this.code.push(...[].concat(...[...code]));
        }
        getCodeBuilder() {
          return new CodeBuilder(this);
        }
      };
    }
  });

  // node_modules/wasmbuilder/src/modulebuilder.js
  var ModuleBuilder;
  var init_modulebuilder = __esm({
    "node_modules/wasmbuilder/src/modulebuilder.js"() {
      init_functionbuilder();
      init_utils2();
      ModuleBuilder = class {
        constructor() {
          this.functions = [];
          this.functionIdxByName = {};
          this.nImportFunctions = 0;
          this.nInternalFunctions = 0;
          this.memory = {
            pagesSize: 1,
            moduleName: "env",
            fieldName: "memory"
          };
          this.free = 8;
          this.datas = [];
          this.modules = {};
          this.exports = [];
          this.functionsTable = [];
        }
        build() {
          this._setSignatures();
          return new Uint8Array([
            ...u32(1836278016),
            ...u32(1),
            ...this._buildType(),
            ...this._buildImport(),
            ...this._buildFunctionDeclarations(),
            ...this._buildFunctionsTable(),
            ...this._buildExports(),
            ...this._buildElements(),
            ...this._buildCode(),
            ...this._buildData()
          ]);
        }
        addFunction(fnName) {
          if (typeof this.functionIdxByName[fnName] !== "undefined")
            throw new Error(`Function already defined: ${fnName}`);
          const idx = this.functions.length;
          this.functionIdxByName[fnName] = idx;
          this.functions.push(new FunctionBuilder(this, fnName, "internal"));
          this.nInternalFunctions++;
          return this.functions[idx];
        }
        addIimportFunction(fnName, moduleName, _fieldName) {
          if (typeof this.functionIdxByName[fnName] !== "undefined")
            throw new Error(`Function already defined: ${fnName}`);
          if (this.functions.length > 0 && this.functions[this.functions.length - 1].type == "internal")
            throw new Error(`Import functions must be declared before internal: ${fnName}`);
          let fieldName = _fieldName || fnName;
          const idx = this.functions.length;
          this.functionIdxByName[fnName] = idx;
          this.functions.push(new FunctionBuilder(this, fnName, "import", moduleName, fieldName));
          this.nImportFunctions++;
          return this.functions[idx];
        }
        setMemory(pagesSize, moduleName, fieldName) {
          this.memory = {
            pagesSize,
            moduleName: moduleName || "env",
            fieldName: fieldName || "memory"
          };
        }
        exportFunction(fnName, _exportName) {
          const exportName = _exportName || fnName;
          if (typeof this.functionIdxByName[fnName] === "undefined")
            throw new Error(`Function not defined: ${fnName}`);
          const idx = this.functionIdxByName[fnName];
          if (exportName != fnName) {
            this.functionIdxByName[exportName] = idx;
          }
          this.exports.push({
            exportName,
            idx
          });
        }
        addFunctionToTable(fnName) {
          const idx = this.functionIdxByName[fnName];
          this.functionsTable.push(idx);
        }
        addData(offset, bytes) {
          this.datas.push({
            offset,
            bytes
          });
        }
        alloc(a, b) {
          let size;
          let bytes;
          if ((Array.isArray(a) || ArrayBuffer.isView(a)) && typeof b === "undefined") {
            size = a.length;
            bytes = a;
          } else {
            size = a;
            bytes = b;
          }
          size = (size - 1 >> 3) + 1 << 3;
          const p = this.free;
          this.free += size;
          if (bytes) {
            this.addData(p, bytes);
          }
          return p;
        }
        allocString(s) {
          const encoder = new globalThis.TextEncoder();
          const uint8array = encoder.encode(s);
          return this.alloc([...uint8array, 0]);
        }
        _setSignatures() {
          this.signatures = [];
          const signatureIdxByName = {};
          if (this.functionsTable.length > 0) {
            const signature = this.functions[this.functionsTable[0]].getSignature();
            const signatureName = "s_" + toHexString(signature);
            signatureIdxByName[signatureName] = 0;
            this.signatures.push(signature);
          }
          for (let i = 0; i < this.functions.length; i++) {
            const signature = this.functions[i].getSignature();
            const signatureName = "s_" + toHexString(signature);
            if (typeof signatureIdxByName[signatureName] === "undefined") {
              signatureIdxByName[signatureName] = this.signatures.length;
              this.signatures.push(signature);
            }
            this.functions[i].signatureIdx = signatureIdxByName[signatureName];
          }
        }
        _buildSection(sectionType, section) {
          return [sectionType, ...varuint32(section.length), ...section];
        }
        _buildType() {
          return this._buildSection(
            1,
            [
              ...varuint32(this.signatures.length),
              ...[].concat(...this.signatures)
            ]
          );
        }
        _buildImport() {
          const entries = [];
          entries.push([
            ...string(this.memory.moduleName),
            ...string(this.memory.fieldName),
            2,
            0,
            ...varuint32(this.memory.pagesSize)
          ]);
          for (let i = 0; i < this.nImportFunctions; i++) {
            entries.push([
              ...string(this.functions[i].moduleName),
              ...string(this.functions[i].fieldName),
              0,
              ...varuint32(this.functions[i].signatureIdx)
            ]);
          }
          return this._buildSection(
            2,
            varuint32(entries.length).concat(...entries)
          );
        }
        _buildFunctionDeclarations() {
          const entries = [];
          for (let i = this.nImportFunctions; i < this.nImportFunctions + this.nInternalFunctions; i++) {
            entries.push(...varuint32(this.functions[i].signatureIdx));
          }
          return this._buildSection(
            3,
            [
              ...varuint32(entries.length),
              ...[...entries]
            ]
          );
        }
        _buildFunctionsTable() {
          if (this.functionsTable.length == 0)
            return [];
          return this._buildSection(
            4,
            [
              ...varuint32(1),
              112,
              0,
              ...varuint32(this.functionsTable.length)
            ]
          );
        }
        _buildElements() {
          if (this.functionsTable.length == 0)
            return [];
          const entries = [];
          for (let i = 0; i < this.functionsTable.length; i++) {
            entries.push(...varuint32(this.functionsTable[i]));
          }
          return this._buildSection(
            9,
            [
              ...varuint32(1),
              ...varuint32(0),
              65,
              ...varint32(0),
              11,
              ...varuint32(this.functionsTable.length),
              ...[...entries]
            ]
          );
        }
        _buildExports() {
          const entries = [];
          for (let i = 0; i < this.exports.length; i++) {
            entries.push([
              ...string(this.exports[i].exportName),
              0,
              ...varuint32(this.exports[i].idx)
            ]);
          }
          return this._buildSection(
            7,
            varuint32(entries.length).concat(...entries)
          );
        }
        _buildCode() {
          const entries = [];
          for (let i = this.nImportFunctions; i < this.nImportFunctions + this.nInternalFunctions; i++) {
            entries.push(this.functions[i].getBody());
          }
          return this._buildSection(
            10,
            varuint32(entries.length).concat(...entries)
          );
        }
        _buildData() {
          const entries = [];
          entries.push([
            0,
            65,
            0,
            11,
            4,
            ...u32(this.free)
          ]);
          for (let i = 0; i < this.datas.length; i++) {
            entries.push([
              0,
              65,
              ...varint32(this.datas[i].offset),
              11,
              ...varuint32(this.datas[i].bytes.length),
              ...this.datas[i].bytes
            ]);
          }
          return this._buildSection(
            11,
            varuint32(entries.length).concat(...entries)
          );
        }
      };
    }
  });

  // node_modules/wasmbuilder/src/codebuilder_wat.js
  var init_codebuilder_wat = __esm({
    "node_modules/wasmbuilder/src/codebuilder_wat.js"() {
      init_utils2();
    }
  });

  // node_modules/wasmbuilder/src/functionbuilder_wat.js
  var init_functionbuilder_wat = __esm({
    "node_modules/wasmbuilder/src/functionbuilder_wat.js"() {
      init_codebuilder_wat();
      init_utils2();
    }
  });

  // node_modules/wasmbuilder/src/modulebuilder_wat.js
  var init_modulebuilder_wat = __esm({
    "node_modules/wasmbuilder/src/modulebuilder_wat.js"() {
      init_functionbuilder_wat();
      init_utils2();
    }
  });

  // node_modules/wasmbuilder/src/protoboard.js
  var init_protoboard = __esm({
    "node_modules/wasmbuilder/src/protoboard.js"() {
      init_modulebuilder();
    }
  });

  // node_modules/wasmbuilder/main.js
  var init_main = __esm({
    "node_modules/wasmbuilder/main.js"() {
      init_modulebuilder();
      init_modulebuilder_wat();
      init_protoboard();
    }
  });

  // src/intmax/lib/ffjavascript/bn128.js
  async function buildBn128(singleThread, plugins, poseidonConstants) {
    const moduleBuilder = new ModuleBuilder();
    moduleBuilder.setMemory(25);
    (0, import_wasmcurves.buildBn128)(moduleBuilder);
    if (plugins)
      plugins(moduleBuilder, poseidonConstants);
    const bn128wasm = {};
    bn128wasm.code = moduleBuilder.build();
    bn128wasm.pq = moduleBuilder.modules.f1m.pq;
    bn128wasm.pr = moduleBuilder.modules.frm.pq;
    bn128wasm.pG1gen = moduleBuilder.modules.bn128.pG1gen;
    bn128wasm.pG1zero = moduleBuilder.modules.bn128.pG1zero;
    bn128wasm.pG1b = moduleBuilder.modules.bn128.pG1b;
    bn128wasm.pG2gen = moduleBuilder.modules.bn128.pG2gen;
    bn128wasm.pG2zero = moduleBuilder.modules.bn128.pG2zero;
    bn128wasm.pG2b = moduleBuilder.modules.bn128.pG2b;
    bn128wasm.pOneT = moduleBuilder.modules.bn128.pOneT;
    bn128wasm.prePSize = moduleBuilder.modules.bn128.prePSize;
    bn128wasm.preQSize = moduleBuilder.modules.bn128.preQSize;
    bn128wasm.n8q = 32;
    bn128wasm.n8r = 32;
    bn128wasm.q = moduleBuilder.modules.bn128.q;
    bn128wasm.r = moduleBuilder.modules.bn128.r;
    if (!singleThread && globalThis.curve_bn128)
      return globalThis.curve_bn128;
    const params = {
      name: "bn128",
      wasm: bn128wasm,
      q: e(
        "21888242871839275222246405745257275088696311157297823662689037894645226208583"
      ),
      r: e(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617"
      ),
      n8q: 32,
      n8r: 32,
      cofactorG2: e(
        "30644e72e131a029b85045b68181585e06ceecda572a2489345f2299c0f9fa8d",
        16
      ),
      singleThread: singleThread ? true : false
    };
    const curve = await buildEngine(params);
    curve.terminate = async function() {
      if (!params.singleThread) {
        globalThis.curve_bn128 = null;
        await this.tm.terminate();
      }
    };
    if (!singleThread) {
      globalThis.curve_bn128 = curve;
    }
    return curve;
  }
  var import_wasmcurves;
  var init_bn128 = __esm({
    "src/intmax/lib/ffjavascript/bn128.js"() {
      import_wasmcurves = __toESM(require_wasmcurves());
      init_engine();
      init_scalar();
      init_main();
      globalThis.curve_bn128 = null;
    }
  });

  // src/intmax/lib/ffjavascript/bls12381.js
  async function buildBls12381(singleThread, plugins, poseidonConstants) {
    const moduleBuilder = new ModuleBuilder();
    moduleBuilder.setMemory(25);
    (0, import_wasmcurves2.buildBls12381)(moduleBuilder);
    if (plugins)
      plugins(moduleBuilder, poseidonConstants);
    const bls12381wasm = {};
    bls12381wasm.code = moduleBuilder.build();
    bls12381wasm.pq = moduleBuilder.modules.f1m.pq;
    bls12381wasm.pr = moduleBuilder.modules.frm.pq;
    bls12381wasm.pG1gen = moduleBuilder.modules.bls12381.pG1gen;
    bls12381wasm.pG1zero = moduleBuilder.modules.bls12381.pG1zero;
    bls12381wasm.pG1b = moduleBuilder.modules.bls12381.pG1b;
    bls12381wasm.pG2gen = moduleBuilder.modules.bls12381.pG2gen;
    bls12381wasm.pG2zero = moduleBuilder.modules.bls12381.pG2zero;
    bls12381wasm.pG2b = moduleBuilder.modules.bls12381.pG2b;
    bls12381wasm.pOneT = moduleBuilder.modules.bls12381.pOneT;
    bls12381wasm.prePSize = moduleBuilder.modules.bls12381.prePSize;
    bls12381wasm.preQSize = moduleBuilder.modules.bls12381.preQSize;
    bls12381wasm.n8q = 48;
    bls12381wasm.n8r = 32;
    bls12381wasm.q = moduleBuilder.modules.bls12381.q;
    bls12381wasm.r = moduleBuilder.modules.bls12381.r;
    if (!singleThread && globalThis.curve_bls12381)
      return globalThis.curve_bls12381;
    const params = {
      name: "bls12381",
      wasm: bls12381wasm,
      q: e(
        "1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab",
        16
      ),
      r: e(
        "73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
        16
      ),
      n8q: 48,
      n8r: 32,
      cofactorG1: e("0x396c8c005555e1568c00aaab0000aaab", 16),
      cofactorG2: e(
        "0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5",
        16
      ),
      singleThread: singleThread ? true : false
    };
    const curve = await buildEngine(params);
    curve.terminate = async function() {
      if (!params.singleThread) {
        globalThis.curve_bls12381 = null;
        await this.tm.terminate();
      }
    };
    if (!singleThread) {
      globalThis.curve_bls12381 = curve;
    }
    return curve;
  }
  var import_wasmcurves2;
  var init_bls12381 = __esm({
    "src/intmax/lib/ffjavascript/bls12381.js"() {
      import_wasmcurves2 = __toESM(require_wasmcurves());
      init_engine();
      init_scalar();
      init_main();
      globalThis.curve_bls12381 = null;
    }
  });

  // src/intmax/lib/ffjavascript/curves.js
  async function getCurveFromName(name, singleThread, plugins, poseidonConstants) {
    let curve;
    const normName = normalizeName(name);
    if (["BN128", "BN254", "ALTBN128"].indexOf(normName) >= 0) {
      curve = await buildBn128(singleThread, plugins, poseidonConstants);
    } else if (["BLS12381"].indexOf(normName) >= 0) {
      curve = await buildBls12381(singleThread, plugins, poseidonConstants);
    } else {
      throw new Error(`Curve not supported: ${name}`);
    }
    return curve;
    function normalizeName(n) {
      return n.toUpperCase().match(/[A-Za-z0-9]+/g).join("");
    }
  }
  var bls12381r, bn128r, bls12381q, bn128q;
  var init_curves = __esm({
    "src/intmax/lib/ffjavascript/curves.js"() {
      init_scalar();
      init_bn128();
      init_bls12381();
      bls12381r = e(
        "73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001",
        16
      );
      bn128r = e(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617"
      );
      bls12381q = e(
        "1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab",
        16
      );
      bn128q = e(
        "21888242871839275222246405745257275088696311157297823662689037894645226208583"
      );
    }
  });

  // src/intmax/lib/ffjavascript/index.js
  var ffjavascript_exports = {};
  __export(ffjavascript_exports, {
    F1Field: () => ZqField,
    Scalar: () => Scalar,
    getCurveFromName: () => getCurveFromName
  });
  var Scalar;
  var init_ffjavascript = __esm({
    "src/intmax/lib/ffjavascript/index.js"() {
      init_scalar();
      init_f1field();
      init_curves();
      Scalar = scalar_exports;
    }
  });

  // src/intmax/lib/circomlibjs/babyjub.js
  async function buildBabyJub() {
    const bn128 = await getCurveFromName("bn128", true);
    return new BabyJub(bn128.Fr);
  }
  var BabyJub;
  var init_babyjub = __esm({
    "src/intmax/lib/circomlibjs/babyjub.js"() {
      init_ffjavascript();
      BabyJub = class {
        constructor(F) {
          this.F = F;
          this.p = Scalar.fromString(
            "21888242871839275222246405745257275088548364400416034343698204186575808495617"
          );
          this.pm1d2 = Scalar.div(Scalar.sub(this.p, Scalar.e(1)), Scalar.e(2));
          this.Generator = [
            F.e(
              "995203441582195749578291179787384436505546430278305826713579947235728471134"
            ),
            F.e(
              "5472060717959818805561601436314318772137091100104008585924551046643952123905"
            )
          ];
          this.Base8 = [
            F.e(
              "5299619240641551281634865583518297030282874472190772894086521144482721001553"
            ),
            F.e(
              "16950150798460657717958625567821834550301663161624707787222815936182638968203"
            )
          ];
          this.order = Scalar.fromString(
            "21888242871839275222246405745257275088614511777268538073601725287587578984328"
          );
          this.subOrder = Scalar.shiftRight(this.order, 3);
          this.A = F.e("168700");
          this.D = F.e("168696");
        }
        addPoint(a, b) {
          const F = this.F;
          const res = [];
          const beta = F.mul(a[0], b[1]);
          const gamma = F.mul(a[1], b[0]);
          const delta = F.mul(F.sub(a[1], F.mul(this.A, a[0])), F.add(b[0], b[1]));
          const tau = F.mul(beta, gamma);
          const dtau = F.mul(this.D, tau);
          res[0] = F.div(F.add(beta, gamma), F.add(F.one, dtau));
          res[1] = F.div(
            F.add(delta, F.sub(F.mul(this.A, beta), gamma)),
            F.sub(F.one, dtau)
          );
          return res;
        }
        mulPointEscalar(base, e2) {
          const F = this.F;
          let res = [F.e("0"), F.e("1")];
          let rem = e2;
          let exp3 = base;
          while (!Scalar.isZero(rem)) {
            if (Scalar.isOdd(rem)) {
              res = this.addPoint(res, exp3);
            }
            exp3 = this.addPoint(exp3, exp3);
            rem = Scalar.shiftRight(rem, 1);
          }
          return res;
        }
        inSubgroup(P) {
          const F = this.F;
          if (!this.inCurve(P))
            return false;
          const res = this.mulPointEscalar(P, this.subOrder);
          return F.isZero(res[0]) && F.eq(res[1], F.one);
        }
        inCurve(P) {
          const F = this.F;
          const x2 = F.square(P[0]);
          const y2 = F.square(P[1]);
          if (!F.eq(
            F.add(F.mul(this.A, x2), y2),
            F.add(F.one, F.mul(F.mul(x2, y2), this.D))
          ))
            return false;
          return true;
        }
        packPoint(P) {
          const F = this.F;
          const buff = new Uint8Array(32);
          F.toRprLE(buff, 0, P[1]);
          const n = F.toObject(P[0]);
          if (Scalar.gt(n, this.pm1d2)) {
            buff[31] = buff[31] | 128;
          }
          return buff;
        }
        unpackPoint(buff) {
          const F = this.F;
          let sign = false;
          const P = new Array(2);
          if (buff[31] & 128) {
            sign = true;
            buff[31] = buff[31] & 127;
          }
          P[1] = F.fromRprLE(buff, 0);
          if (Scalar.gt(F.toObject(P[1]), this.p))
            return null;
          const y2 = F.square(P[1]);
          const x2 = F.div(F.sub(F.one, y2), F.sub(this.A, F.mul(this.D, y2)));
          const x2h = F.exp(x2, F.half);
          if (!F.eq(F.one, x2h))
            return null;
          let x = F.sqrt(x2);
          if (x == null)
            return null;
          if (sign)
            x = F.neg(x);
          P[0] = x;
          return P;
        }
      };
    }
  });

  // src/intmax/lib/circomlibjs/poseidon_wasm.js
  async function buildPoseidon(poseidonConstants) {
    const bn128 = await getCurveFromName(
      "bn128",
      true,
      buildPoseidonWasm,
      poseidonConstants
    );
    const F = bn128.Fr;
    const pState = bn128.tm.alloc(32);
    const pIn = bn128.tm.alloc(32 * 16);
    const pOut = bn128.tm.alloc(32 * 17);
    const poseidon = (arr, state, nOut) => {
      let buff;
      let n;
      if (Array.isArray(arr)) {
        n = arr.length;
        buff = new Uint8Array(n * 32);
        for (let i = 0; i < n; i++)
          buff.set(F.e(arr[i]), i * 32);
      } else {
        buff = arr;
        n = buff.byteLength / 32;
        if (n * 32 != buff.byteLength)
          throw new Error("Invalid iput buff size");
      }
      bn128.tm.setBuff(pIn, buff);
      if (n < 1 || n > 16)
        throw new Error("Invalid poseidon size");
      if (typeof state == "undefined") {
        state = F.zero;
      } else {
        state = F.e(state);
      }
      bn128.tm.setBuff(pState, state);
      nOut = nOut || 1;
      bn128.tm.instance.exports.poseidon(pState, pIn, n, pOut, nOut);
      if (nOut == 1) {
        return bn128.tm.getBuff(pOut, 32);
      } else {
        const out = [];
        for (let i = 0; i < nOut; i++) {
          out.push(bn128.tm.getBuff(pOut + i * 32, 32));
        }
        return out;
      }
    };
    poseidon.F = F;
    return poseidon;
  }
  function buildPoseidonWasm(module, poseidonConstants) {
    const F = new ZqField(
      Scalar.e(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617"
      )
    );
    const pointers = {
      C: [],
      S: [],
      M: [],
      P: []
    };
    const N_ROUNDS_P = [
      56,
      57,
      56,
      60,
      60,
      63,
      64,
      63,
      60,
      66,
      60,
      65,
      70,
      60,
      64,
      68
    ];
    const NSizes = poseidonConstants.C.length;
    const buffIdx = new Uint8Array(NSizes * 5 * 4);
    const buffIdx32 = new Uint32Array(buffIdx.buffer);
    for (let i = 0; i < NSizes; i++) {
      buffIdx32[i * 5] = N_ROUNDS_P[i];
      const buffC = new Uint8Array(32 * poseidonConstants.C[i].length);
      for (let j = 0; j < poseidonConstants.C[i].length; j++) {
        F.toRprLEM(buffC, j * 32, F.e(poseidonConstants.C[i][j]));
      }
      buffIdx32[i * 5 + 1] = module.alloc(buffC);
      const buffS = new Uint8Array(32 * poseidonConstants.S[i].length);
      for (let j = 0; j < poseidonConstants.S[i].length; j++) {
        F.toRprLEM(buffS, j * 32, F.e(poseidonConstants.S[i][j]));
      }
      buffIdx32[i * 5 + 2] = module.alloc(buffS);
      const N = poseidonConstants.M[i].length;
      const buffM = new Uint8Array(32 * N * N);
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          F.toRprLEM(buffM, (j * N + k) * 32, F.e(poseidonConstants.M[i][k][j]));
        }
      }
      buffIdx32[i * 5 + 3] = module.alloc(buffM);
      const buffP = new Uint8Array(32 * N * N);
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          F.toRprLEM(buffP, (j * N + k) * 32, F.e(poseidonConstants.P[i][k][j]));
        }
      }
      buffIdx32[i * 5 + 4] = module.alloc(buffP);
    }
    const pConstants = module.alloc(buffIdx);
    const pState = module.alloc(32 * ((NSizes + 1) * 32));
    function buildAddConstant() {
      const f = module.addFunction("poseidon_addConstant");
      f.addParam("t", "i32");
      f.addParam("pC", "i32");
      f.setReturnType("i32");
      f.addLocal("i", "i32");
      f.addLocal("pState", "i32");
      const c = f.getCodeBuilder();
      f.addCode(
        c.setLocal("pState", c.i32_const(pState)),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call(
              "frm_add",
              c.getLocal("pC"),
              c.getLocal("pState"),
              c.getLocal("pState")
            ),
            c.setLocal("pC", c.i32_add(c.getLocal("pC"), c.i32_const(32))),
            c.setLocal(
              "pState",
              c.i32_add(c.getLocal("pState"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.ret(c.getLocal("pC"))
      );
    }
    function buildPower5() {
      const f = module.addFunction("poseidon_power5");
      f.addParam("p", "i32");
      const c = f.getCodeBuilder();
      const AUX = c.i32_const(module.alloc(32));
      f.addCode(
        c.call("frm_square", c.getLocal("p"), AUX),
        c.call("frm_square", AUX, AUX),
        c.call("frm_mul", c.getLocal("p"), AUX, c.getLocal("p"))
      );
    }
    function buildPower5all() {
      const f = module.addFunction("poseidon_power5all");
      f.addParam("t", "i32");
      f.addLocal("i", "i32");
      f.addLocal("pState", "i32");
      const c = f.getCodeBuilder();
      f.addCode(
        c.setLocal("pState", c.i32_const(pState)),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call("poseidon_power5", c.getLocal("pState")),
            c.setLocal(
              "pState",
              c.i32_add(c.getLocal("pState"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        )
      );
    }
    function buildApplyMatrix() {
      const f = module.addFunction("poseidon_applyMatrix");
      f.addParam("t", "i32");
      f.addParam("pM", "i32");
      f.addLocal("i", "i32");
      f.addLocal("j", "i32");
      f.addLocal("pState", "i32");
      f.addLocal("pStateAux", "i32");
      const c = f.getCodeBuilder();
      const pStateAux = module.alloc(32 * ((NSizes + 1) * 32));
      const pAux = module.alloc(32);
      f.addCode(
        c.setLocal("pStateAux", c.i32_const(pStateAux)),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call("frm_zero", c.getLocal("pStateAux")),
            c.setLocal("pState", c.i32_const(pState)),
            c.setLocal("j", c.i32_const(0)),
            c.block(
              c.loop(
                c.br_if(1, c.i32_eq(c.getLocal("j"), c.getLocal("t"))),
                c.call(
                  "frm_mul",
                  c.getLocal("pState"),
                  c.getLocal("pM"),
                  c.i32_const(pAux)
                ),
                c.call(
                  "frm_add",
                  c.i32_const(pAux),
                  c.getLocal("pStateAux"),
                  c.getLocal("pStateAux")
                ),
                c.setLocal("pM", c.i32_add(c.getLocal("pM"), c.i32_const(32))),
                c.setLocal(
                  "pState",
                  c.i32_add(c.getLocal("pState"), c.i32_const(32))
                ),
                c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                c.br(0)
              )
            ),
            c.setLocal(
              "pStateAux",
              c.i32_add(c.getLocal("pStateAux"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.setLocal("pStateAux", c.i32_const(pStateAux)),
        c.setLocal("pState", c.i32_const(pState)),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call("frm_copy", c.getLocal("pStateAux"), c.getLocal("pState")),
            c.setLocal(
              "pState",
              c.i32_add(c.getLocal("pState"), c.i32_const(32))
            ),
            c.setLocal(
              "pStateAux",
              c.i32_add(c.getLocal("pStateAux"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        )
      );
    }
    function buildApplySMatrix() {
      const f = module.addFunction("poseidon_applySMatrix");
      f.addParam("t", "i32");
      f.addParam("pS", "i32");
      f.setReturnType("i32");
      f.addLocal("i", "i32");
      f.addLocal("pState", "i32");
      const c = f.getCodeBuilder();
      const pS0 = module.alloc(32);
      const pAux = module.alloc(32);
      f.addCode(
        c.call("frm_zero", c.i32_const(pS0)),
        c.setLocal("pState", c.i32_const(pState)),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call(
              "frm_mul",
              c.getLocal("pState"),
              c.getLocal("pS"),
              c.i32_const(pAux)
            ),
            c.call(
              "frm_add",
              c.i32_const(pS0),
              c.i32_const(pAux),
              c.i32_const(pS0)
            ),
            c.setLocal("pS", c.i32_add(c.getLocal("pS"), c.i32_const(32))),
            c.setLocal(
              "pState",
              c.i32_add(c.getLocal("pState"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.setLocal("pState", c.i32_const(pState + 32)),
        c.setLocal("i", c.i32_const(1)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("t"))),
            c.call(
              "frm_mul",
              c.i32_const(pState),
              c.getLocal("pS"),
              c.i32_const(pAux)
            ),
            c.call(
              "frm_add",
              c.getLocal("pState"),
              c.i32_const(pAux),
              c.getLocal("pState")
            ),
            c.setLocal("pS", c.i32_add(c.getLocal("pS"), c.i32_const(32))),
            c.setLocal(
              "pState",
              c.i32_add(c.getLocal("pState"), c.i32_const(32))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.call("frm_copy", c.i32_const(pS0), c.i32_const(pState)),
        c.ret(c.getLocal("pS"))
      );
    }
    function buildPoseidon2() {
      const f = module.addFunction("poseidon");
      f.addParam("pInitState", "i32");
      f.addParam("pIn", "i32");
      f.addParam("n", "i32");
      f.addParam("pOut", "i32");
      f.addParam("nOut", "i32");
      f.addLocal("pC", "i32");
      f.addLocal("pS", "i32");
      f.addLocal("pM", "i32");
      f.addLocal("pP", "i32");
      f.addLocal("t", "i32");
      f.addLocal("i", "i32");
      f.addLocal("nRoundsP", "i32");
      f.addLocal("pAux", "i32");
      const c = f.getCodeBuilder();
      f.addCode(
        c.setLocal("t", c.i32_add(c.getLocal("n"), c.i32_const(1))),
        c.setLocal(
          "pAux",
          c.i32_add(
            c.i32_const(pConstants),
            c.i32_mul(c.i32_sub(c.getLocal("n"), c.i32_const(1)), c.i32_const(20))
          )
        ),
        c.setLocal("nRoundsP", c.i32_load(c.getLocal("pAux"))),
        c.setLocal(
          "pC",
          c.i32_load(c.i32_add(c.getLocal("pAux"), c.i32_const(4)))
        ),
        c.setLocal(
          "pS",
          c.i32_load(c.i32_add(c.getLocal("pAux"), c.i32_const(8)))
        ),
        c.setLocal(
          "pM",
          c.i32_load(c.i32_add(c.getLocal("pAux"), c.i32_const(12)))
        ),
        c.setLocal(
          "pP",
          c.i32_load(c.i32_add(c.getLocal("pAux"), c.i32_const(16)))
        ),
        c.call("frm_zero", c.i32_const(pState)),
        c.call("frm_copy", c.getLocal("pInitState"), c.i32_const(pState)),
        c.setLocal("i", c.i32_const(1)),
        c.block(
          c.loop(
            c.call(
              "frm_copy",
              c.i32_add(
                c.getLocal("pIn"),
                c.i32_mul(
                  c.i32_sub(c.getLocal("i"), c.i32_const(1)),
                  c.i32_const(32)
                )
              ),
              c.i32_add(
                c.i32_const(pState),
                c.i32_mul(c.getLocal("i"), c.i32_const(32))
              )
            ),
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.setLocal(
          "pC",
          c.call("poseidon_addConstant", c.getLocal("t"), c.getLocal("pC"))
        ),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(3))),
            c.call("poseidon_power5all", c.getLocal("t")),
            c.setLocal(
              "pC",
              c.call("poseidon_addConstant", c.getLocal("t"), c.getLocal("pC"))
            ),
            c.call("poseidon_applyMatrix", c.getLocal("t"), c.getLocal("pM")),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.call("poseidon_power5all", c.getLocal("t")),
        c.setLocal(
          "pC",
          c.call("poseidon_addConstant", c.getLocal("t"), c.getLocal("pC"))
        ),
        c.call("poseidon_applyMatrix", c.getLocal("t"), c.getLocal("pP")),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("nRoundsP"))),
            c.call("poseidon_power5", c.i32_const(pState)),
            c.call(
              "frm_add",
              c.i32_const(pState),
              c.getLocal("pC"),
              c.i32_const(pState)
            ),
            c.setLocal("pC", c.i32_add(c.getLocal("pC"), c.i32_const(32))),
            c.setLocal(
              "pS",
              c.call("poseidon_applySMatrix", c.getLocal("t"), c.getLocal("pS"))
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(3))),
            c.call("poseidon_power5all", c.getLocal("t")),
            c.setLocal(
              "pC",
              c.call("poseidon_addConstant", c.getLocal("t"), c.getLocal("pC"))
            ),
            c.call("poseidon_applyMatrix", c.getLocal("t"), c.getLocal("pM")),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        ),
        c.call("poseidon_power5all", c.getLocal("t")),
        c.call("poseidon_applyMatrix", c.getLocal("t"), c.getLocal("pM")),
        c.setLocal("i", c.i32_const(0)),
        c.block(
          c.loop(
            c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("nOut"))),
            c.call(
              "frm_copy",
              c.i32_add(
                c.i32_const(pState),
                c.i32_mul(c.getLocal("i"), c.i32_const(32))
              ),
              c.i32_add(
                c.getLocal("pOut"),
                c.i32_mul(c.getLocal("i"), c.i32_const(32))
              )
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )
        )
      );
    }
    buildAddConstant();
    buildPower5();
    buildPower5all();
    buildApplyMatrix();
    buildApplySMatrix();
    buildPoseidon2();
    module.exportFunction("poseidon");
  }
  var init_poseidon_wasm = __esm({
    "src/intmax/lib/circomlibjs/poseidon_wasm.js"() {
      init_ffjavascript();
    }
  });

  // src/intmax/lib/circomlibjs/eddsa.js
  async function buildEddsa(poseidonConstants) {
    const babyJub = await buildBabyJub("bn128");
    const poseidon = await buildPoseidon(poseidonConstants);
    return new Eddsa(babyJub, null, null, poseidon, null);
  }
  var Eddsa;
  var init_eddsa = __esm({
    "src/intmax/lib/circomlibjs/eddsa.js"() {
      init_ffjavascript();
      init_babyjub();
      init_poseidon_wasm();
      Eddsa = class {
        constructor(babyJub, pedersenHash, mimc7, poseidon, mimcSponge) {
          this.babyJub = babyJub;
          this.pedersenHash = pedersenHash;
          this.mimc7 = mimc7;
          this.poseidon = poseidon;
          this.mimcSponge = mimcSponge;
          this.F = babyJub.F;
        }
        verifyPoseidon(msg, sig, A) {
          if (typeof sig != "object")
            return false;
          if (!Array.isArray(sig.R8))
            return false;
          if (sig.R8.length != 2)
            return false;
          if (!this.babyJub.inCurve(sig.R8))
            return false;
          if (!Array.isArray(A))
            return false;
          if (A.length != 2)
            return false;
          if (!this.babyJub.inCurve(A))
            return false;
          if (sig.S >= this.babyJub.subOrder)
            return false;
          const hm = this.poseidon([sig.R8[0], sig.R8[1], A[0], A[1], msg]);
          const hms = Scalar.e(this.babyJub.F.toObject(hm));
          const Pleft = this.babyJub.mulPointEscalar(this.babyJub.Base8, sig.S);
          let Pright = this.babyJub.mulPointEscalar(A, Scalar.mul(hms, 8));
          Pright = this.babyJub.addPoint(sig.R8, Pright);
          if (!this.babyJub.F.eq(Pleft[0], Pright[0]))
            return false;
          if (!this.babyJub.F.eq(Pleft[1], Pright[1]))
            return false;
          return true;
        }
        unpackSignature(sigBuff) {
          return {
            R8: this.babyJub.unpackPoint(sigBuff.slice(0, 32)),
            S: Scalar.fromRprLE(sigBuff, 32, 32)
          };
        }
      };
    }
  });

  // src/intmax/lib/circomlibjs/index.js
  var circomlibjs_exports = {};
  __export(circomlibjs_exports, {
    buildEddsa: () => buildEddsa
  });
  var init_circomlibjs = __esm({
    "src/intmax/lib/circomlibjs/index.js"() {
      init_eddsa();
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          }
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          }
        };
      }
    }
  });

  // src/intmax/lib/sha.js/hash.js
  var require_hash = __commonJS({
    "src/intmax/lib/sha.js/hash.js"(exports, module) {
      function Hash(blockSize, finalSize) {
        this._block = Buffer.alloc(blockSize);
        this._finalSize = finalSize;
        this._blockSize = blockSize;
        this._len = 0;
      }
      Hash.prototype.update = function(data, enc) {
        if (typeof data === "string") {
          enc = enc || "utf8";
          data = Buffer.from(data, enc);
        }
        var block = this._block;
        var blockSize = this._blockSize;
        var length = data.length;
        var accum = this._len;
        for (var offset = 0; offset < length; ) {
          var assigned = accum % blockSize;
          var remainder = Math.min(length - offset, blockSize - assigned);
          for (var i = 0; i < remainder; i++) {
            block[assigned + i] = data[offset + i];
          }
          accum += remainder;
          offset += remainder;
          if (accum % blockSize === 0) {
            this._update(block);
          }
        }
        this._len += length;
        return this;
      };
      Hash.prototype.digest = function(enc) {
        var rem = this._len % this._blockSize;
        this._block[rem] = 128;
        this._block.fill(0, rem + 1);
        if (rem >= this._finalSize) {
          this._update(this._block);
          this._block.fill(0);
        }
        var bits2 = this._len * 8;
        if (bits2 <= 4294967295) {
          this._block.writeUInt32BE(bits2, this._blockSize - 4);
        } else {
          var lowBits = (bits2 & 4294967295) >>> 0;
          var highBits = (bits2 - lowBits) / 4294967296;
          this._block.writeUInt32BE(highBits, this._blockSize - 8);
          this._block.writeUInt32BE(lowBits, this._blockSize - 4);
        }
        this._update(this._block);
        var hash = this._hash();
        return enc ? hash.toString(enc) : hash;
      };
      Hash.prototype._update = function() {
        throw new Error("_update must be implemented by subclass");
      };
      module.exports = Hash;
    }
  });

  // src/intmax/lib/sha.js/sha256.js
  var require_sha256 = __commonJS({
    "src/intmax/lib/sha.js/sha256.js"(exports, module) {
      var inherits = require_inherits_browser();
      var Hash = require_hash();
      var K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      var W = new Array(64);
      function Sha256() {
        this.init();
        this._w = W;
        Hash.call(this, 64, 56);
      }
      inherits(Sha256, Hash);
      Sha256.prototype.init = function() {
        this._a = 1779033703;
        this._b = 3144134277;
        this._c = 1013904242;
        this._d = 2773480762;
        this._e = 1359893119;
        this._f = 2600822924;
        this._g = 528734635;
        this._h = 1541459225;
        return this;
      };
      function ch(x, y, z) {
        return z ^ x & (y ^ z);
      }
      function maj(x, y, z) {
        return x & y | z & (x | y);
      }
      function sigma0(x) {
        return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10);
      }
      function sigma1(x) {
        return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7);
      }
      function gamma0(x) {
        return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
      }
      function gamma1(x) {
        return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ x >>> 10;
      }
      Sha256.prototype._update = function(M) {
        var W2 = this._w;
        var a = this._a | 0;
        var b = this._b | 0;
        var c = this._c | 0;
        var d = this._d | 0;
        var e2 = this._e | 0;
        var f = this._f | 0;
        var g = this._g | 0;
        var h = this._h | 0;
        for (var i = 0; i < 16; ++i)
          W2[i] = M.readInt32BE(i * 4);
        for (; i < 64; ++i)
          W2[i] = gamma1(W2[i - 2]) + W2[i - 7] + gamma0(W2[i - 15]) + W2[i - 16] | 0;
        for (var j = 0; j < 64; ++j) {
          var T1 = h + sigma1(e2) + ch(e2, f, g) + K[j] + W2[j] | 0;
          var T2 = sigma0(a) + maj(a, b, c) | 0;
          h = g;
          g = f;
          f = e2;
          e2 = d + T1 | 0;
          d = c;
          c = b;
          b = a;
          a = T1 + T2 | 0;
        }
        this._a = a + this._a | 0;
        this._b = b + this._b | 0;
        this._c = c + this._c | 0;
        this._d = d + this._d | 0;
        this._e = e2 + this._e | 0;
        this._f = f + this._f | 0;
        this._g = g + this._g | 0;
        this._h = h + this._h | 0;
      };
      Sha256.prototype._hash = function() {
        var H = Buffer.allocUnsafe(32);
        H.writeInt32BE(this._a, 0);
        H.writeInt32BE(this._b, 4);
        H.writeInt32BE(this._c, 8);
        H.writeInt32BE(this._d, 12);
        H.writeInt32BE(this._e, 16);
        H.writeInt32BE(this._f, 20);
        H.writeInt32BE(this._g, 24);
        H.writeInt32BE(this._h, 28);
        return H;
      };
      module.exports = Sha256;
    }
  });

  // node_modules/ramda/src/F.js
  var require_F = __commonJS({
    "node_modules/ramda/src/F.js"(exports, module) {
      var F = function() {
        return false;
      };
      module.exports = F;
    }
  });

  // node_modules/ramda/src/T.js
  var require_T = __commonJS({
    "node_modules/ramda/src/T.js"(exports, module) {
      var T = function() {
        return true;
      };
      module.exports = T;
    }
  });

  // node_modules/ramda/src/__.js
  var require__ = __commonJS({
    "node_modules/ramda/src/__.js"(exports, module) {
      module.exports = {
        "@@functional/placeholder": true
      };
    }
  });

  // node_modules/ramda/src/internal/_isPlaceholder.js
  var require_isPlaceholder = __commonJS({
    "node_modules/ramda/src/internal/_isPlaceholder.js"(exports, module) {
      function _isPlaceholder2(a) {
        return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
      }
      module.exports = _isPlaceholder2;
    }
  });

  // node_modules/ramda/src/internal/_curry1.js
  var require_curry1 = __commonJS({
    "node_modules/ramda/src/internal/_curry1.js"(exports, module) {
      var _isPlaceholder2 = require_isPlaceholder();
      function _curry12(fn) {
        return function f1(a) {
          if (arguments.length === 0 || _isPlaceholder2(a)) {
            return f1;
          } else {
            return fn.apply(this, arguments);
          }
        };
      }
      module.exports = _curry12;
    }
  });

  // node_modules/ramda/src/internal/_curry2.js
  var require_curry2 = __commonJS({
    "node_modules/ramda/src/internal/_curry2.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isPlaceholder2 = require_isPlaceholder();
      function _curry22(fn) {
        return function f2(a, b) {
          switch (arguments.length) {
            case 0:
              return f2;
            case 1:
              return _isPlaceholder2(a) ? f2 : _curry12(function(_b) {
                return fn(a, _b);
              });
            default:
              return _isPlaceholder2(a) && _isPlaceholder2(b) ? f2 : _isPlaceholder2(a) ? _curry12(function(_a) {
                return fn(_a, b);
              }) : _isPlaceholder2(b) ? _curry12(function(_b) {
                return fn(a, _b);
              }) : fn(a, b);
          }
        };
      }
      module.exports = _curry22;
    }
  });

  // node_modules/ramda/src/add.js
  var require_add = __commonJS({
    "node_modules/ramda/src/add.js"(exports, module) {
      var _curry22 = require_curry2();
      var add2 = /* @__PURE__ */ _curry22(function add3(a, b) {
        return Number(a) + Number(b);
      });
      module.exports = add2;
    }
  });

  // node_modules/ramda/src/internal/_concat.js
  var require_concat = __commonJS({
    "node_modules/ramda/src/internal/_concat.js"(exports, module) {
      function _concat2(set1, set2) {
        set1 = set1 || [];
        set2 = set2 || [];
        var idx;
        var len1 = set1.length;
        var len2 = set2.length;
        var result = [];
        idx = 0;
        while (idx < len1) {
          result[result.length] = set1[idx];
          idx += 1;
        }
        idx = 0;
        while (idx < len2) {
          result[result.length] = set2[idx];
          idx += 1;
        }
        return result;
      }
      module.exports = _concat2;
    }
  });

  // node_modules/ramda/src/internal/_arity.js
  var require_arity = __commonJS({
    "node_modules/ramda/src/internal/_arity.js"(exports, module) {
      function _arity2(n, fn) {
        switch (n) {
          case 0:
            return function() {
              return fn.apply(this, arguments);
            };
          case 1:
            return function(a0) {
              return fn.apply(this, arguments);
            };
          case 2:
            return function(a0, a1) {
              return fn.apply(this, arguments);
            };
          case 3:
            return function(a0, a1, a2) {
              return fn.apply(this, arguments);
            };
          case 4:
            return function(a0, a1, a2, a3) {
              return fn.apply(this, arguments);
            };
          case 5:
            return function(a0, a1, a2, a3, a4) {
              return fn.apply(this, arguments);
            };
          case 6:
            return function(a0, a1, a2, a3, a4, a5) {
              return fn.apply(this, arguments);
            };
          case 7:
            return function(a0, a1, a2, a3, a4, a5, a6) {
              return fn.apply(this, arguments);
            };
          case 8:
            return function(a0, a1, a2, a3, a4, a5, a6, a7) {
              return fn.apply(this, arguments);
            };
          case 9:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
              return fn.apply(this, arguments);
            };
          case 10:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
              return fn.apply(this, arguments);
            };
          default:
            throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
        }
      }
      module.exports = _arity2;
    }
  });

  // node_modules/ramda/src/internal/_curryN.js
  var require_curryN = __commonJS({
    "node_modules/ramda/src/internal/_curryN.js"(exports, module) {
      var _arity2 = require_arity();
      var _isPlaceholder2 = require_isPlaceholder();
      function _curryN2(length, received, fn) {
        return function() {
          var combined = [];
          var argsIdx = 0;
          var left = length;
          var combinedIdx = 0;
          while (combinedIdx < received.length || argsIdx < arguments.length) {
            var result;
            if (combinedIdx < received.length && (!_isPlaceholder2(received[combinedIdx]) || argsIdx >= arguments.length)) {
              result = received[combinedIdx];
            } else {
              result = arguments[argsIdx];
              argsIdx += 1;
            }
            combined[combinedIdx] = result;
            if (!_isPlaceholder2(result)) {
              left -= 1;
            }
            combinedIdx += 1;
          }
          return left <= 0 ? fn.apply(this, combined) : _arity2(left, _curryN2(length, combined, fn));
        };
      }
      module.exports = _curryN2;
    }
  });

  // node_modules/ramda/src/curryN.js
  var require_curryN2 = __commonJS({
    "node_modules/ramda/src/curryN.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry12 = require_curry1();
      var _curry22 = require_curry2();
      var _curryN2 = require_curryN();
      var curryN = /* @__PURE__ */ _curry22(function curryN2(length, fn) {
        if (length === 1) {
          return _curry12(fn);
        }
        return _arity2(length, _curryN2(length, [], fn));
      });
      module.exports = curryN;
    }
  });

  // node_modules/ramda/src/addIndex.js
  var require_addIndex = __commonJS({
    "node_modules/ramda/src/addIndex.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var addIndex = /* @__PURE__ */ _curry12(function addIndex2(fn) {
        return curryN(fn.length, function() {
          var idx = 0;
          var origFn = arguments[0];
          var list = arguments[arguments.length - 1];
          var args = Array.prototype.slice.call(arguments, 0);
          args[0] = function() {
            var result = origFn.apply(this, _concat2(arguments, [idx, list]));
            idx += 1;
            return result;
          };
          return fn.apply(this, args);
        });
      });
      module.exports = addIndex;
    }
  });

  // node_modules/ramda/src/internal/_curry3.js
  var require_curry3 = __commonJS({
    "node_modules/ramda/src/internal/_curry3.js"(exports, module) {
      var _curry12 = require_curry1();
      var _curry22 = require_curry2();
      var _isPlaceholder2 = require_isPlaceholder();
      function _curry32(fn) {
        return function f3(a, b, c) {
          switch (arguments.length) {
            case 0:
              return f3;
            case 1:
              return _isPlaceholder2(a) ? f3 : _curry22(function(_b, _c) {
                return fn(a, _b, _c);
              });
            case 2:
              return _isPlaceholder2(a) && _isPlaceholder2(b) ? f3 : _isPlaceholder2(a) ? _curry22(function(_a, _c) {
                return fn(_a, b, _c);
              }) : _isPlaceholder2(b) ? _curry22(function(_b, _c) {
                return fn(a, _b, _c);
              }) : _curry12(function(_c) {
                return fn(a, b, _c);
              });
            default:
              return _isPlaceholder2(a) && _isPlaceholder2(b) && _isPlaceholder2(c) ? f3 : _isPlaceholder2(a) && _isPlaceholder2(b) ? _curry22(function(_a, _b) {
                return fn(_a, _b, c);
              }) : _isPlaceholder2(a) && _isPlaceholder2(c) ? _curry22(function(_a, _c) {
                return fn(_a, b, _c);
              }) : _isPlaceholder2(b) && _isPlaceholder2(c) ? _curry22(function(_b, _c) {
                return fn(a, _b, _c);
              }) : _isPlaceholder2(a) ? _curry12(function(_a) {
                return fn(_a, b, c);
              }) : _isPlaceholder2(b) ? _curry12(function(_b) {
                return fn(a, _b, c);
              }) : _isPlaceholder2(c) ? _curry12(function(_c) {
                return fn(a, b, _c);
              }) : fn(a, b, c);
          }
        };
      }
      module.exports = _curry32;
    }
  });

  // node_modules/ramda/src/adjust.js
  var require_adjust = __commonJS({
    "node_modules/ramda/src/adjust.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry32 = require_curry3();
      var adjust = /* @__PURE__ */ _curry32(function adjust2(idx, fn, list) {
        var len = list.length;
        if (idx >= len || idx < -len) {
          return list;
        }
        var _idx = (len + idx) % len;
        var _list = _concat2(list);
        _list[_idx] = fn(list[_idx]);
        return _list;
      });
      module.exports = adjust;
    }
  });

  // node_modules/ramda/src/internal/_isArray.js
  var require_isArray = __commonJS({
    "node_modules/ramda/src/internal/_isArray.js"(exports, module) {
      module.exports = Array.isArray || function _isArray2(val) {
        return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
      };
    }
  });

  // node_modules/ramda/src/internal/_isTransformer.js
  var require_isTransformer = __commonJS({
    "node_modules/ramda/src/internal/_isTransformer.js"(exports, module) {
      function _isTransformer2(obj) {
        return obj != null && typeof obj["@@transducer/step"] === "function";
      }
      module.exports = _isTransformer2;
    }
  });

  // node_modules/ramda/src/internal/_dispatchable.js
  var require_dispatchable = __commonJS({
    "node_modules/ramda/src/internal/_dispatchable.js"(exports, module) {
      var _isArray2 = require_isArray();
      var _isTransformer2 = require_isTransformer();
      function _dispatchable2(methodNames, transducerCreator, fn) {
        return function() {
          if (arguments.length === 0) {
            return fn();
          }
          var obj = arguments[arguments.length - 1];
          if (!_isArray2(obj)) {
            var idx = 0;
            while (idx < methodNames.length) {
              if (typeof obj[methodNames[idx]] === "function") {
                return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
              }
              idx += 1;
            }
            if (_isTransformer2(obj)) {
              var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
              return transducer(obj);
            }
          }
          return fn.apply(this, arguments);
        };
      }
      module.exports = _dispatchable2;
    }
  });

  // node_modules/ramda/src/internal/_reduced.js
  var require_reduced = __commonJS({
    "node_modules/ramda/src/internal/_reduced.js"(exports, module) {
      function _reduced2(x) {
        return x && x["@@transducer/reduced"] ? x : {
          "@@transducer/value": x,
          "@@transducer/reduced": true
        };
      }
      module.exports = _reduced2;
    }
  });

  // node_modules/ramda/src/internal/_xfBase.js
  var require_xfBase = __commonJS({
    "node_modules/ramda/src/internal/_xfBase.js"(exports, module) {
      module.exports = {
        init: function() {
          return this.xf["@@transducer/init"]();
        },
        result: function(result) {
          return this.xf["@@transducer/result"](result);
        }
      };
    }
  });

  // node_modules/ramda/src/internal/_xall.js
  var require_xall = __commonJS({
    "node_modules/ramda/src/internal/_xall.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XAll = /* @__PURE__ */ function() {
        function XAll2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.all = true;
        }
        XAll2.prototype["@@transducer/init"] = _xfBase.init;
        XAll2.prototype["@@transducer/result"] = function(result) {
          if (this.all) {
            result = this.xf["@@transducer/step"](result, true);
          }
          return this.xf["@@transducer/result"](result);
        };
        XAll2.prototype["@@transducer/step"] = function(result, input) {
          if (!this.f(input)) {
            this.all = false;
            result = _reduced2(this.xf["@@transducer/step"](result, false));
          }
          return result;
        };
        return XAll2;
      }();
      var _xall = /* @__PURE__ */ _curry22(function _xall2(f, xf) {
        return new XAll(f, xf);
      });
      module.exports = _xall;
    }
  });

  // node_modules/ramda/src/all.js
  var require_all = __commonJS({
    "node_modules/ramda/src/all.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xall = require_xall();
      var all = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["all"], _xall, function all2(fn, list) {
          var idx = 0;
          while (idx < list.length) {
            if (!fn(list[idx])) {
              return false;
            }
            idx += 1;
          }
          return true;
        })
      );
      module.exports = all;
    }
  });

  // node_modules/ramda/src/max.js
  var require_max = __commonJS({
    "node_modules/ramda/src/max.js"(exports, module) {
      var _curry22 = require_curry2();
      var max = /* @__PURE__ */ _curry22(function max2(a, b) {
        return b > a ? b : a;
      });
      module.exports = max;
    }
  });

  // node_modules/ramda/src/internal/_map.js
  var require_map = __commonJS({
    "node_modules/ramda/src/internal/_map.js"(exports, module) {
      function _map2(fn, functor) {
        var idx = 0;
        var len = functor.length;
        var result = Array(len);
        while (idx < len) {
          result[idx] = fn(functor[idx]);
          idx += 1;
        }
        return result;
      }
      module.exports = _map2;
    }
  });

  // node_modules/ramda/src/internal/_isString.js
  var require_isString = __commonJS({
    "node_modules/ramda/src/internal/_isString.js"(exports, module) {
      function _isString2(x) {
        return Object.prototype.toString.call(x) === "[object String]";
      }
      module.exports = _isString2;
    }
  });

  // node_modules/ramda/src/internal/_isArrayLike.js
  var require_isArrayLike = __commonJS({
    "node_modules/ramda/src/internal/_isArrayLike.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isArray2 = require_isArray();
      var _isString2 = require_isString();
      var _isArrayLike = /* @__PURE__ */ _curry12(function isArrayLike(x) {
        if (_isArray2(x)) {
          return true;
        }
        if (!x) {
          return false;
        }
        if (typeof x !== "object") {
          return false;
        }
        if (_isString2(x)) {
          return false;
        }
        if (x.length === 0) {
          return true;
        }
        if (x.length > 0) {
          return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
        }
        return false;
      });
      module.exports = _isArrayLike;
    }
  });

  // node_modules/ramda/src/internal/_xwrap.js
  var require_xwrap = __commonJS({
    "node_modules/ramda/src/internal/_xwrap.js"(exports, module) {
      var XWrap = /* @__PURE__ */ function() {
        function XWrap2(fn) {
          this.f = fn;
        }
        XWrap2.prototype["@@transducer/init"] = function() {
          throw new Error("init not implemented on XWrap");
        };
        XWrap2.prototype["@@transducer/result"] = function(acc) {
          return acc;
        };
        XWrap2.prototype["@@transducer/step"] = function(acc, x) {
          return this.f(acc, x);
        };
        return XWrap2;
      }();
      function _xwrap2(fn) {
        return new XWrap(fn);
      }
      module.exports = _xwrap2;
    }
  });

  // node_modules/ramda/src/bind.js
  var require_bind = __commonJS({
    "node_modules/ramda/src/bind.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry22 = require_curry2();
      var bind = /* @__PURE__ */ _curry22(function bind2(fn, thisObj) {
        return _arity2(fn.length, function() {
          return fn.apply(thisObj, arguments);
        });
      });
      module.exports = bind;
    }
  });

  // node_modules/ramda/src/internal/_reduce.js
  var require_reduce = __commonJS({
    "node_modules/ramda/src/internal/_reduce.js"(exports, module) {
      var _isArrayLike = require_isArrayLike();
      var _xwrap2 = require_xwrap();
      var bind = require_bind();
      function _arrayReduce(xf, acc, list) {
        var idx = 0;
        var len = list.length;
        while (idx < len) {
          acc = xf["@@transducer/step"](acc, list[idx]);
          if (acc && acc["@@transducer/reduced"]) {
            acc = acc["@@transducer/value"];
            break;
          }
          idx += 1;
        }
        return xf["@@transducer/result"](acc);
      }
      function _iterableReduce(xf, acc, iter) {
        var step = iter.next();
        while (!step.done) {
          acc = xf["@@transducer/step"](acc, step.value);
          if (acc && acc["@@transducer/reduced"]) {
            acc = acc["@@transducer/value"];
            break;
          }
          step = iter.next();
        }
        return xf["@@transducer/result"](acc);
      }
      function _methodReduce(xf, acc, obj, methodName) {
        return xf["@@transducer/result"](obj[methodName](bind(xf["@@transducer/step"], xf), acc));
      }
      var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
      function _reduce2(fn, acc, list) {
        if (typeof fn === "function") {
          fn = _xwrap2(fn);
        }
        if (_isArrayLike(list)) {
          return _arrayReduce(fn, acc, list);
        }
        if (typeof list["fantasy-land/reduce"] === "function") {
          return _methodReduce(fn, acc, list, "fantasy-land/reduce");
        }
        if (list[symIterator] != null) {
          return _iterableReduce(fn, acc, list[symIterator]());
        }
        if (typeof list.next === "function") {
          return _iterableReduce(fn, acc, list);
        }
        if (typeof list.reduce === "function") {
          return _methodReduce(fn, acc, list, "reduce");
        }
        throw new TypeError("reduce: list must be array or iterable");
      }
      module.exports = _reduce2;
    }
  });

  // node_modules/ramda/src/internal/_xmap.js
  var require_xmap = __commonJS({
    "node_modules/ramda/src/internal/_xmap.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XMap = /* @__PURE__ */ function() {
        function XMap2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XMap2.prototype["@@transducer/init"] = _xfBase.init;
        XMap2.prototype["@@transducer/result"] = _xfBase.result;
        XMap2.prototype["@@transducer/step"] = function(result, input) {
          return this.xf["@@transducer/step"](result, this.f(input));
        };
        return XMap2;
      }();
      var _xmap = /* @__PURE__ */ _curry22(function _xmap2(f, xf) {
        return new XMap(f, xf);
      });
      module.exports = _xmap;
    }
  });

  // node_modules/ramda/src/internal/_has.js
  var require_has = __commonJS({
    "node_modules/ramda/src/internal/_has.js"(exports, module) {
      function _has2(prop, obj) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      module.exports = _has2;
    }
  });

  // node_modules/ramda/src/internal/_isArguments.js
  var require_isArguments = __commonJS({
    "node_modules/ramda/src/internal/_isArguments.js"(exports, module) {
      var _has2 = require_has();
      var toString3 = Object.prototype.toString;
      var _isArguments2 = /* @__PURE__ */ function() {
        return toString3.call(arguments) === "[object Arguments]" ? function _isArguments3(x) {
          return toString3.call(x) === "[object Arguments]";
        } : function _isArguments3(x) {
          return _has2("callee", x);
        };
      }();
      module.exports = _isArguments2;
    }
  });

  // node_modules/ramda/src/keys.js
  var require_keys = __commonJS({
    "node_modules/ramda/src/keys.js"(exports, module) {
      var _curry12 = require_curry1();
      var _has2 = require_has();
      var _isArguments2 = require_isArguments();
      var hasEnumBug2 = !/* @__PURE__ */ {
        toString: null
      }.propertyIsEnumerable("toString");
      var nonEnumerableProps2 = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
      var hasArgsEnumBug2 = /* @__PURE__ */ function() {
        "use strict";
        return arguments.propertyIsEnumerable("length");
      }();
      var contains3 = function contains4(list, item) {
        var idx = 0;
        while (idx < list.length) {
          if (list[idx] === item) {
            return true;
          }
          idx += 1;
        }
        return false;
      };
      var keys4 = typeof Object.keys === "function" && !hasArgsEnumBug2 ? /* @__PURE__ */ _curry12(function keys5(obj) {
        return Object(obj) !== obj ? [] : Object.keys(obj);
      }) : /* @__PURE__ */ _curry12(function keys5(obj) {
        if (Object(obj) !== obj) {
          return [];
        }
        var prop, nIdx;
        var ks = [];
        var checkArgsLength = hasArgsEnumBug2 && _isArguments2(obj);
        for (prop in obj) {
          if (_has2(prop, obj) && (!checkArgsLength || prop !== "length")) {
            ks[ks.length] = prop;
          }
        }
        if (hasEnumBug2) {
          nIdx = nonEnumerableProps2.length - 1;
          while (nIdx >= 0) {
            prop = nonEnumerableProps2[nIdx];
            if (_has2(prop, obj) && !contains3(ks, prop)) {
              ks[ks.length] = prop;
            }
            nIdx -= 1;
          }
        }
        return ks;
      });
      module.exports = keys4;
    }
  });

  // node_modules/ramda/src/map.js
  var require_map2 = __commonJS({
    "node_modules/ramda/src/map.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _map2 = require_map();
      var _reduce2 = require_reduce();
      var _xmap = require_xmap();
      var curryN = require_curryN2();
      var keys4 = require_keys();
      var map = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["fantasy-land/map", "map"], _xmap, function map2(fn, functor) {
          switch (Object.prototype.toString.call(functor)) {
            case "[object Function]":
              return curryN(functor.length, function() {
                return fn.call(this, functor.apply(this, arguments));
              });
            case "[object Object]":
              return _reduce2(function(acc, key) {
                acc[key] = fn(functor[key]);
                return acc;
              }, {}, keys4(functor));
            default:
              return _map2(fn, functor);
          }
        })
      );
      module.exports = map;
    }
  });

  // node_modules/ramda/src/internal/_isInteger.js
  var require_isInteger = __commonJS({
    "node_modules/ramda/src/internal/_isInteger.js"(exports, module) {
      module.exports = Number.isInteger || function _isInteger2(n) {
        return n << 0 === n;
      };
    }
  });

  // node_modules/ramda/src/nth.js
  var require_nth = __commonJS({
    "node_modules/ramda/src/nth.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isString2 = require_isString();
      var nth = /* @__PURE__ */ _curry22(function nth2(offset, list) {
        var idx = offset < 0 ? list.length + offset : offset;
        return _isString2(list) ? list.charAt(idx) : list[idx];
      });
      module.exports = nth;
    }
  });

  // node_modules/ramda/src/prop.js
  var require_prop = __commonJS({
    "node_modules/ramda/src/prop.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isInteger2 = require_isInteger();
      var nth = require_nth();
      var prop = /* @__PURE__ */ _curry22(function prop2(p, obj) {
        if (obj == null) {
          return;
        }
        return _isInteger2(p) ? nth(p, obj) : obj[p];
      });
      module.exports = prop;
    }
  });

  // node_modules/ramda/src/pluck.js
  var require_pluck = __commonJS({
    "node_modules/ramda/src/pluck.js"(exports, module) {
      var _curry22 = require_curry2();
      var map = require_map2();
      var prop = require_prop();
      var pluck = /* @__PURE__ */ _curry22(function pluck2(p, list) {
        return map(prop(p), list);
      });
      module.exports = pluck;
    }
  });

  // node_modules/ramda/src/reduce.js
  var require_reduce2 = __commonJS({
    "node_modules/ramda/src/reduce.js"(exports, module) {
      var _curry32 = require_curry3();
      var _reduce2 = require_reduce();
      var reduce = /* @__PURE__ */ _curry32(_reduce2);
      module.exports = reduce;
    }
  });

  // node_modules/ramda/src/allPass.js
  var require_allPass = __commonJS({
    "node_modules/ramda/src/allPass.js"(exports, module) {
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var allPass = /* @__PURE__ */ _curry12(function allPass2(preds) {
        return curryN(reduce(max, 0, pluck("length", preds)), function() {
          var idx = 0;
          var len = preds.length;
          while (idx < len) {
            if (!preds[idx].apply(this, arguments)) {
              return false;
            }
            idx += 1;
          }
          return true;
        });
      });
      module.exports = allPass;
    }
  });

  // node_modules/ramda/src/always.js
  var require_always = __commonJS({
    "node_modules/ramda/src/always.js"(exports, module) {
      var _curry12 = require_curry1();
      var always = /* @__PURE__ */ _curry12(function always2(val) {
        return function() {
          return val;
        };
      });
      module.exports = always;
    }
  });

  // node_modules/ramda/src/and.js
  var require_and = __commonJS({
    "node_modules/ramda/src/and.js"(exports, module) {
      var _curry22 = require_curry2();
      var and = /* @__PURE__ */ _curry22(function and2(a, b) {
        return a && b;
      });
      module.exports = and;
    }
  });

  // node_modules/ramda/src/internal/_xany.js
  var require_xany = __commonJS({
    "node_modules/ramda/src/internal/_xany.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XAny = /* @__PURE__ */ function() {
        function XAny2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.any = false;
        }
        XAny2.prototype["@@transducer/init"] = _xfBase.init;
        XAny2.prototype["@@transducer/result"] = function(result) {
          if (!this.any) {
            result = this.xf["@@transducer/step"](result, false);
          }
          return this.xf["@@transducer/result"](result);
        };
        XAny2.prototype["@@transducer/step"] = function(result, input) {
          if (this.f(input)) {
            this.any = true;
            result = _reduced2(this.xf["@@transducer/step"](result, true));
          }
          return result;
        };
        return XAny2;
      }();
      var _xany = /* @__PURE__ */ _curry22(function _xany2(f, xf) {
        return new XAny(f, xf);
      });
      module.exports = _xany;
    }
  });

  // node_modules/ramda/src/any.js
  var require_any = __commonJS({
    "node_modules/ramda/src/any.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xany = require_xany();
      var any = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["any"], _xany, function any2(fn, list) {
          var idx = 0;
          while (idx < list.length) {
            if (fn(list[idx])) {
              return true;
            }
            idx += 1;
          }
          return false;
        })
      );
      module.exports = any;
    }
  });

  // node_modules/ramda/src/anyPass.js
  var require_anyPass = __commonJS({
    "node_modules/ramda/src/anyPass.js"(exports, module) {
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var anyPass = /* @__PURE__ */ _curry12(function anyPass2(preds) {
        return curryN(reduce(max, 0, pluck("length", preds)), function() {
          var idx = 0;
          var len = preds.length;
          while (idx < len) {
            if (preds[idx].apply(this, arguments)) {
              return true;
            }
            idx += 1;
          }
          return false;
        });
      });
      module.exports = anyPass;
    }
  });

  // node_modules/ramda/src/ap.js
  var require_ap = __commonJS({
    "node_modules/ramda/src/ap.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var _reduce2 = require_reduce();
      var map = require_map2();
      var ap = /* @__PURE__ */ _curry22(function ap2(applyF, applyX) {
        return typeof applyX["fantasy-land/ap"] === "function" ? applyX["fantasy-land/ap"](applyF) : typeof applyF.ap === "function" ? applyF.ap(applyX) : typeof applyF === "function" ? function(x) {
          return applyF(x)(applyX(x));
        } : _reduce2(function(acc, f) {
          return _concat2(acc, map(f, applyX));
        }, [], applyF);
      });
      module.exports = ap;
    }
  });

  // node_modules/ramda/src/internal/_aperture.js
  var require_aperture = __commonJS({
    "node_modules/ramda/src/internal/_aperture.js"(exports, module) {
      function _aperture2(n, list) {
        var idx = 0;
        var limit = list.length - (n - 1);
        var acc = new Array(limit >= 0 ? limit : 0);
        while (idx < limit) {
          acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
          idx += 1;
        }
        return acc;
      }
      module.exports = _aperture2;
    }
  });

  // node_modules/ramda/src/internal/_xaperture.js
  var require_xaperture = __commonJS({
    "node_modules/ramda/src/internal/_xaperture.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XAperture = /* @__PURE__ */ function() {
        function XAperture2(n, xf) {
          this.xf = xf;
          this.pos = 0;
          this.full = false;
          this.acc = new Array(n);
        }
        XAperture2.prototype["@@transducer/init"] = _xfBase.init;
        XAperture2.prototype["@@transducer/result"] = function(result) {
          this.acc = null;
          return this.xf["@@transducer/result"](result);
        };
        XAperture2.prototype["@@transducer/step"] = function(result, input) {
          this.store(input);
          return this.full ? this.xf["@@transducer/step"](result, this.getCopy()) : result;
        };
        XAperture2.prototype.store = function(input) {
          this.acc[this.pos] = input;
          this.pos += 1;
          if (this.pos === this.acc.length) {
            this.pos = 0;
            this.full = true;
          }
        };
        XAperture2.prototype.getCopy = function() {
          return _concat2(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
        };
        return XAperture2;
      }();
      var _xaperture = /* @__PURE__ */ _curry22(function _xaperture2(n, xf) {
        return new XAperture(n, xf);
      });
      module.exports = _xaperture;
    }
  });

  // node_modules/ramda/src/aperture.js
  var require_aperture2 = __commonJS({
    "node_modules/ramda/src/aperture.js"(exports, module) {
      var _aperture2 = require_aperture();
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xaperture = require_xaperture();
      var aperture = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xaperture, _aperture2)
      );
      module.exports = aperture;
    }
  });

  // node_modules/ramda/src/append.js
  var require_append = __commonJS({
    "node_modules/ramda/src/append.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var append = /* @__PURE__ */ _curry22(function append2(el, list) {
        return _concat2(list, [el]);
      });
      module.exports = append;
    }
  });

  // node_modules/ramda/src/apply.js
  var require_apply = __commonJS({
    "node_modules/ramda/src/apply.js"(exports, module) {
      var _curry22 = require_curry2();
      var apply = /* @__PURE__ */ _curry22(function apply2(fn, args) {
        return fn.apply(this, args);
      });
      module.exports = apply;
    }
  });

  // node_modules/ramda/src/values.js
  var require_values = __commonJS({
    "node_modules/ramda/src/values.js"(exports, module) {
      var _curry12 = require_curry1();
      var keys4 = require_keys();
      var values = /* @__PURE__ */ _curry12(function values2(obj) {
        var props = keys4(obj);
        var len = props.length;
        var vals = [];
        var idx = 0;
        while (idx < len) {
          vals[idx] = obj[props[idx]];
          idx += 1;
        }
        return vals;
      });
      module.exports = values;
    }
  });

  // node_modules/ramda/src/applySpec.js
  var require_applySpec = __commonJS({
    "node_modules/ramda/src/applySpec.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isArray2 = require_isArray();
      var apply = require_apply();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var keys4 = require_keys();
      var values = require_values();
      function mapValues(fn, obj) {
        return _isArray2(obj) ? obj.map(fn) : keys4(obj).reduce(function(acc, key) {
          acc[key] = fn(obj[key]);
          return acc;
        }, {});
      }
      var applySpec = /* @__PURE__ */ _curry12(function applySpec2(spec) {
        spec = mapValues(function(v) {
          return typeof v == "function" ? v : applySpec2(v);
        }, spec);
        return curryN(reduce(max, 0, pluck("length", values(spec))), function() {
          var args = arguments;
          return mapValues(function(f) {
            return apply(f, args);
          }, spec);
        });
      });
      module.exports = applySpec;
    }
  });

  // node_modules/ramda/src/applyTo.js
  var require_applyTo = __commonJS({
    "node_modules/ramda/src/applyTo.js"(exports, module) {
      var _curry22 = require_curry2();
      var applyTo = /* @__PURE__ */ _curry22(function applyTo2(x, f) {
        return f(x);
      });
      module.exports = applyTo;
    }
  });

  // node_modules/ramda/src/ascend.js
  var require_ascend = __commonJS({
    "node_modules/ramda/src/ascend.js"(exports, module) {
      var _curry32 = require_curry3();
      var ascend = /* @__PURE__ */ _curry32(function ascend2(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
      });
      module.exports = ascend;
    }
  });

  // node_modules/ramda/src/internal/_assoc.js
  var require_assoc = __commonJS({
    "node_modules/ramda/src/internal/_assoc.js"(exports, module) {
      var _isArray2 = require_isArray();
      var _isInteger2 = require_isInteger();
      function _assoc2(prop, val, obj) {
        if (_isInteger2(prop) && _isArray2(obj)) {
          var arr = [].concat(obj);
          arr[prop] = val;
          return arr;
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        result[prop] = val;
        return result;
      }
      module.exports = _assoc2;
    }
  });

  // node_modules/ramda/src/isNil.js
  var require_isNil = __commonJS({
    "node_modules/ramda/src/isNil.js"(exports, module) {
      var _curry12 = require_curry1();
      var isNil3 = /* @__PURE__ */ _curry12(function isNil4(x) {
        return x == null;
      });
      module.exports = isNil3;
    }
  });

  // node_modules/ramda/src/assocPath.js
  var require_assocPath = __commonJS({
    "node_modules/ramda/src/assocPath.js"(exports, module) {
      var _curry32 = require_curry3();
      var _has2 = require_has();
      var _isInteger2 = require_isInteger();
      var _assoc2 = require_assoc();
      var isNil3 = require_isNil();
      var assocPath = /* @__PURE__ */ _curry32(function assocPath2(path, val, obj) {
        if (path.length === 0) {
          return val;
        }
        var idx = path[0];
        if (path.length > 1) {
          var nextObj = !isNil3(obj) && _has2(idx, obj) ? obj[idx] : _isInteger2(path[1]) ? [] : {};
          val = assocPath2(Array.prototype.slice.call(path, 1), val, nextObj);
        }
        return _assoc2(idx, val, obj);
      });
      module.exports = assocPath;
    }
  });

  // node_modules/ramda/src/assoc.js
  var require_assoc2 = __commonJS({
    "node_modules/ramda/src/assoc.js"(exports, module) {
      var _curry32 = require_curry3();
      var assocPath = require_assocPath();
      var assoc = /* @__PURE__ */ _curry32(function assoc2(prop, val, obj) {
        return assocPath([prop], val, obj);
      });
      module.exports = assoc;
    }
  });

  // node_modules/ramda/src/nAry.js
  var require_nAry = __commonJS({
    "node_modules/ramda/src/nAry.js"(exports, module) {
      var _curry22 = require_curry2();
      var nAry = /* @__PURE__ */ _curry22(function nAry2(n, fn) {
        switch (n) {
          case 0:
            return function() {
              return fn.call(this);
            };
          case 1:
            return function(a0) {
              return fn.call(this, a0);
            };
          case 2:
            return function(a0, a1) {
              return fn.call(this, a0, a1);
            };
          case 3:
            return function(a0, a1, a2) {
              return fn.call(this, a0, a1, a2);
            };
          case 4:
            return function(a0, a1, a2, a3) {
              return fn.call(this, a0, a1, a2, a3);
            };
          case 5:
            return function(a0, a1, a2, a3, a4) {
              return fn.call(this, a0, a1, a2, a3, a4);
            };
          case 6:
            return function(a0, a1, a2, a3, a4, a5) {
              return fn.call(this, a0, a1, a2, a3, a4, a5);
            };
          case 7:
            return function(a0, a1, a2, a3, a4, a5, a6) {
              return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
            };
          case 8:
            return function(a0, a1, a2, a3, a4, a5, a6, a7) {
              return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
            };
          case 9:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
              return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
            };
          case 10:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
              return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            };
          default:
            throw new Error("First argument to nAry must be a non-negative integer no greater than ten");
        }
      });
      module.exports = nAry;
    }
  });

  // node_modules/ramda/src/binary.js
  var require_binary = __commonJS({
    "node_modules/ramda/src/binary.js"(exports, module) {
      var _curry12 = require_curry1();
      var nAry = require_nAry();
      var binary = /* @__PURE__ */ _curry12(function binary2(fn) {
        return nAry(2, fn);
      });
      module.exports = binary;
    }
  });

  // node_modules/ramda/src/internal/_isFunction.js
  var require_isFunction = __commonJS({
    "node_modules/ramda/src/internal/_isFunction.js"(exports, module) {
      function _isFunction2(x) {
        var type3 = Object.prototype.toString.call(x);
        return type3 === "[object Function]" || type3 === "[object AsyncFunction]" || type3 === "[object GeneratorFunction]" || type3 === "[object AsyncGeneratorFunction]";
      }
      module.exports = _isFunction2;
    }
  });

  // node_modules/ramda/src/liftN.js
  var require_liftN = __commonJS({
    "node_modules/ramda/src/liftN.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduce2 = require_reduce();
      var ap = require_ap();
      var curryN = require_curryN2();
      var map = require_map2();
      var liftN = /* @__PURE__ */ _curry22(function liftN2(arity, fn) {
        var lifted = curryN(arity, fn);
        return curryN(arity, function() {
          return _reduce2(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
        });
      });
      module.exports = liftN;
    }
  });

  // node_modules/ramda/src/lift.js
  var require_lift = __commonJS({
    "node_modules/ramda/src/lift.js"(exports, module) {
      var _curry12 = require_curry1();
      var liftN = require_liftN();
      var lift = /* @__PURE__ */ _curry12(function lift2(fn) {
        return liftN(fn.length, fn);
      });
      module.exports = lift;
    }
  });

  // node_modules/ramda/src/both.js
  var require_both = __commonJS({
    "node_modules/ramda/src/both.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isFunction2 = require_isFunction();
      var and = require_and();
      var lift = require_lift();
      var both = /* @__PURE__ */ _curry22(function both2(f, g) {
        return _isFunction2(f) ? function _both() {
          return f.apply(this, arguments) && g.apply(this, arguments);
        } : lift(and)(f, g);
      });
      module.exports = both;
    }
  });

  // node_modules/ramda/src/call.js
  var require_call = __commonJS({
    "node_modules/ramda/src/call.js"(exports, module) {
      var _curry12 = require_curry1();
      var call = /* @__PURE__ */ _curry12(function call2(fn) {
        return fn.apply(this, Array.prototype.slice.call(arguments, 1));
      });
      module.exports = call;
    }
  });

  // node_modules/ramda/src/internal/_makeFlat.js
  var require_makeFlat = __commonJS({
    "node_modules/ramda/src/internal/_makeFlat.js"(exports, module) {
      var _isArrayLike = require_isArrayLike();
      function _makeFlat2(recursive) {
        return function flatt(list) {
          var value, jlen, j;
          var result = [];
          var idx = 0;
          var ilen = list.length;
          while (idx < ilen) {
            if (_isArrayLike(list[idx])) {
              value = recursive ? flatt(list[idx]) : list[idx];
              j = 0;
              jlen = value.length;
              while (j < jlen) {
                result[result.length] = value[j];
                j += 1;
              }
            } else {
              result[result.length] = list[idx];
            }
            idx += 1;
          }
          return result;
        };
      }
      module.exports = _makeFlat2;
    }
  });

  // node_modules/ramda/src/internal/_forceReduced.js
  var require_forceReduced = __commonJS({
    "node_modules/ramda/src/internal/_forceReduced.js"(exports, module) {
      function _forceReduced2(x) {
        return {
          "@@transducer/value": x,
          "@@transducer/reduced": true
        };
      }
      module.exports = _forceReduced2;
    }
  });

  // node_modules/ramda/src/internal/_flatCat.js
  var require_flatCat = __commonJS({
    "node_modules/ramda/src/internal/_flatCat.js"(exports, module) {
      var _forceReduced2 = require_forceReduced();
      var _isArrayLike = require_isArrayLike();
      var _reduce2 = require_reduce();
      var _xfBase = require_xfBase();
      var preservingReduced = function(xf) {
        return {
          "@@transducer/init": _xfBase.init,
          "@@transducer/result": function(result) {
            return xf["@@transducer/result"](result);
          },
          "@@transducer/step": function(result, input) {
            var ret = xf["@@transducer/step"](result, input);
            return ret["@@transducer/reduced"] ? _forceReduced2(ret) : ret;
          }
        };
      };
      var _flatCat = function _xcat(xf) {
        var rxf = preservingReduced(xf);
        return {
          "@@transducer/init": _xfBase.init,
          "@@transducer/result": function(result) {
            return rxf["@@transducer/result"](result);
          },
          "@@transducer/step": function(result, input) {
            return !_isArrayLike(input) ? _reduce2(rxf, result, [input]) : _reduce2(rxf, result, input);
          }
        };
      };
      module.exports = _flatCat;
    }
  });

  // node_modules/ramda/src/internal/_xchain.js
  var require_xchain = __commonJS({
    "node_modules/ramda/src/internal/_xchain.js"(exports, module) {
      var _curry22 = require_curry2();
      var _flatCat = require_flatCat();
      var map = require_map2();
      var _xchain = /* @__PURE__ */ _curry22(function _xchain2(f, xf) {
        return map(f, _flatCat(xf));
      });
      module.exports = _xchain;
    }
  });

  // node_modules/ramda/src/chain.js
  var require_chain = __commonJS({
    "node_modules/ramda/src/chain.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _makeFlat2 = require_makeFlat();
      var _xchain = require_xchain();
      var map = require_map2();
      var chain = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["fantasy-land/chain", "chain"], _xchain, function chain2(fn, monad) {
          if (typeof monad === "function") {
            return function(x) {
              return fn(monad(x))(x);
            };
          }
          return _makeFlat2(false)(map(fn, monad));
        })
      );
      module.exports = chain;
    }
  });

  // node_modules/ramda/src/clamp.js
  var require_clamp = __commonJS({
    "node_modules/ramda/src/clamp.js"(exports, module) {
      var _curry32 = require_curry3();
      var clamp = /* @__PURE__ */ _curry32(function clamp2(min, max, value) {
        if (min > max) {
          throw new Error("min must not be greater than max in clamp(min, max, value)");
        }
        return value < min ? min : value > max ? max : value;
      });
      module.exports = clamp;
    }
  });

  // node_modules/ramda/src/internal/_cloneRegExp.js
  var require_cloneRegExp = __commonJS({
    "node_modules/ramda/src/internal/_cloneRegExp.js"(exports, module) {
      function _cloneRegExp2(pattern) {
        return new RegExp(pattern.source, (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : ""));
      }
      module.exports = _cloneRegExp2;
    }
  });

  // node_modules/ramda/src/type.js
  var require_type = __commonJS({
    "node_modules/ramda/src/type.js"(exports, module) {
      var _curry12 = require_curry1();
      var type3 = /* @__PURE__ */ _curry12(function type4(val) {
        return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
      });
      module.exports = type3;
    }
  });

  // node_modules/ramda/src/internal/_clone.js
  var require_clone = __commonJS({
    "node_modules/ramda/src/internal/_clone.js"(exports, module) {
      var _cloneRegExp2 = require_cloneRegExp();
      var type3 = require_type();
      function _clone2(value, refFrom, refTo, deep) {
        var copy = function copy2(copiedValue) {
          var len = refFrom.length;
          var idx = 0;
          while (idx < len) {
            if (value === refFrom[idx]) {
              return refTo[idx];
            }
            idx += 1;
          }
          refFrom[idx] = value;
          refTo[idx] = copiedValue;
          for (var key in value) {
            if (value.hasOwnProperty(key)) {
              copiedValue[key] = deep ? _clone2(value[key], refFrom, refTo, true) : value[key];
            }
          }
          return copiedValue;
        };
        switch (type3(value)) {
          case "Object":
            return copy(Object.create(Object.getPrototypeOf(value)));
          case "Array":
            return copy([]);
          case "Date":
            return new Date(value.valueOf());
          case "RegExp":
            return _cloneRegExp2(value);
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array":
            return value.slice();
          default:
            return value;
        }
      }
      module.exports = _clone2;
    }
  });

  // node_modules/ramda/src/clone.js
  var require_clone2 = __commonJS({
    "node_modules/ramda/src/clone.js"(exports, module) {
      var _clone2 = require_clone();
      var _curry12 = require_curry1();
      var clone = /* @__PURE__ */ _curry12(function clone2(value) {
        return value != null && typeof value.clone === "function" ? value.clone() : _clone2(value, [], [], true);
      });
      module.exports = clone;
    }
  });

  // node_modules/ramda/src/collectBy.js
  var require_collectBy = __commonJS({
    "node_modules/ramda/src/collectBy.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduce2 = require_reduce();
      var collectBy = /* @__PURE__ */ _curry22(function collectBy2(fn, list) {
        var group = _reduce2(function(o, x) {
          var tag2 = fn(x);
          if (o[tag2] === void 0) {
            o[tag2] = [];
          }
          o[tag2].push(x);
          return o;
        }, {}, list);
        var newList = [];
        for (var tag in group) {
          newList.push(group[tag]);
        }
        return newList;
      });
      module.exports = collectBy;
    }
  });

  // node_modules/ramda/src/comparator.js
  var require_comparator = __commonJS({
    "node_modules/ramda/src/comparator.js"(exports, module) {
      var _curry12 = require_curry1();
      var comparator = /* @__PURE__ */ _curry12(function comparator2(pred) {
        return function(a, b) {
          return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
        };
      });
      module.exports = comparator;
    }
  });

  // node_modules/ramda/src/not.js
  var require_not = __commonJS({
    "node_modules/ramda/src/not.js"(exports, module) {
      var _curry12 = require_curry1();
      var not = /* @__PURE__ */ _curry12(function not2(a) {
        return !a;
      });
      module.exports = not;
    }
  });

  // node_modules/ramda/src/complement.js
  var require_complement = __commonJS({
    "node_modules/ramda/src/complement.js"(exports, module) {
      var lift = require_lift();
      var not = require_not();
      var complement = /* @__PURE__ */ lift(not);
      module.exports = complement;
    }
  });

  // node_modules/ramda/src/internal/_pipe.js
  var require_pipe = __commonJS({
    "node_modules/ramda/src/internal/_pipe.js"(exports, module) {
      function _pipe2(f, g) {
        return function() {
          return g.call(this, f.apply(this, arguments));
        };
      }
      module.exports = _pipe2;
    }
  });

  // node_modules/ramda/src/internal/_checkForMethod.js
  var require_checkForMethod = __commonJS({
    "node_modules/ramda/src/internal/_checkForMethod.js"(exports, module) {
      var _isArray2 = require_isArray();
      function _checkForMethod2(methodname, fn) {
        return function() {
          var length = arguments.length;
          if (length === 0) {
            return fn();
          }
          var obj = arguments[length - 1];
          return _isArray2(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
        };
      }
      module.exports = _checkForMethod2;
    }
  });

  // node_modules/ramda/src/slice.js
  var require_slice = __commonJS({
    "node_modules/ramda/src/slice.js"(exports, module) {
      var _checkForMethod2 = require_checkForMethod();
      var _curry32 = require_curry3();
      var slice = /* @__PURE__ */ _curry32(
        /* @__PURE__ */ _checkForMethod2("slice", function slice2(fromIndex, toIndex, list) {
          return Array.prototype.slice.call(list, fromIndex, toIndex);
        })
      );
      module.exports = slice;
    }
  });

  // node_modules/ramda/src/tail.js
  var require_tail = __commonJS({
    "node_modules/ramda/src/tail.js"(exports, module) {
      var _checkForMethod2 = require_checkForMethod();
      var _curry12 = require_curry1();
      var slice = require_slice();
      var tail = /* @__PURE__ */ _curry12(
        /* @__PURE__ */ _checkForMethod2(
          "tail",
          /* @__PURE__ */ slice(1, Infinity)
        )
      );
      module.exports = tail;
    }
  });

  // node_modules/ramda/src/pipe.js
  var require_pipe2 = __commonJS({
    "node_modules/ramda/src/pipe.js"(exports, module) {
      var _arity2 = require_arity();
      var _pipe2 = require_pipe();
      var reduce = require_reduce2();
      var tail = require_tail();
      function pipe2() {
        if (arguments.length === 0) {
          throw new Error("pipe requires at least one argument");
        }
        return _arity2(arguments[0].length, reduce(_pipe2, arguments[0], tail(arguments)));
      }
      module.exports = pipe2;
    }
  });

  // node_modules/ramda/src/reverse.js
  var require_reverse = __commonJS({
    "node_modules/ramda/src/reverse.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isString2 = require_isString();
      var reverse = /* @__PURE__ */ _curry12(function reverse2(list) {
        return _isString2(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
      });
      module.exports = reverse;
    }
  });

  // node_modules/ramda/src/compose.js
  var require_compose = __commonJS({
    "node_modules/ramda/src/compose.js"(exports, module) {
      var pipe2 = require_pipe2();
      var reverse = require_reverse();
      function compose2() {
        if (arguments.length === 0) {
          throw new Error("compose requires at least one argument");
        }
        return pipe2.apply(this, reverse(arguments));
      }
      module.exports = compose2;
    }
  });

  // node_modules/ramda/src/head.js
  var require_head = __commonJS({
    "node_modules/ramda/src/head.js"(exports, module) {
      var nth = require_nth();
      var head = /* @__PURE__ */ nth(0);
      module.exports = head;
    }
  });

  // node_modules/ramda/src/internal/_identity.js
  var require_identity = __commonJS({
    "node_modules/ramda/src/internal/_identity.js"(exports, module) {
      function _identity2(x) {
        return x;
      }
      module.exports = _identity2;
    }
  });

  // node_modules/ramda/src/identity.js
  var require_identity2 = __commonJS({
    "node_modules/ramda/src/identity.js"(exports, module) {
      var _curry12 = require_curry1();
      var _identity2 = require_identity();
      var identity = /* @__PURE__ */ _curry12(_identity2);
      module.exports = identity;
    }
  });

  // node_modules/ramda/src/pipeWith.js
  var require_pipeWith = __commonJS({
    "node_modules/ramda/src/pipeWith.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry22 = require_curry2();
      var head = require_head();
      var _reduce2 = require_reduce();
      var tail = require_tail();
      var identity = require_identity2();
      var pipeWith = /* @__PURE__ */ _curry22(function pipeWith2(xf, list) {
        if (list.length <= 0) {
          return identity;
        }
        var headList = head(list);
        var tailList = tail(list);
        return _arity2(headList.length, function() {
          return _reduce2(function(result, f) {
            return xf.call(this, f, result);
          }, headList.apply(this, arguments), tailList);
        });
      });
      module.exports = pipeWith;
    }
  });

  // node_modules/ramda/src/composeWith.js
  var require_composeWith = __commonJS({
    "node_modules/ramda/src/composeWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var pipeWith = require_pipeWith();
      var reverse = require_reverse();
      var composeWith = /* @__PURE__ */ _curry22(function composeWith2(xf, list) {
        return pipeWith.apply(this, [xf, reverse(list)]);
      });
      module.exports = composeWith;
    }
  });

  // node_modules/ramda/src/internal/_arrayFromIterator.js
  var require_arrayFromIterator = __commonJS({
    "node_modules/ramda/src/internal/_arrayFromIterator.js"(exports, module) {
      function _arrayFromIterator2(iter) {
        var list = [];
        var next;
        while (!(next = iter.next()).done) {
          list.push(next.value);
        }
        return list;
      }
      module.exports = _arrayFromIterator2;
    }
  });

  // node_modules/ramda/src/internal/_includesWith.js
  var require_includesWith = __commonJS({
    "node_modules/ramda/src/internal/_includesWith.js"(exports, module) {
      function _includesWith2(pred, x, list) {
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
      module.exports = _includesWith2;
    }
  });

  // node_modules/ramda/src/internal/_functionName.js
  var require_functionName = __commonJS({
    "node_modules/ramda/src/internal/_functionName.js"(exports, module) {
      function _functionName2(f) {
        var match = String(f).match(/^function (\w*)/);
        return match == null ? "" : match[1];
      }
      module.exports = _functionName2;
    }
  });

  // node_modules/ramda/src/internal/_objectIs.js
  var require_objectIs = __commonJS({
    "node_modules/ramda/src/internal/_objectIs.js"(exports, module) {
      function _objectIs2(a, b) {
        if (a === b) {
          return a !== 0 || 1 / a === 1 / b;
        } else {
          return a !== a && b !== b;
        }
      }
      module.exports = typeof Object.is === "function" ? Object.is : _objectIs2;
    }
  });

  // node_modules/ramda/src/internal/_equals.js
  var require_equals = __commonJS({
    "node_modules/ramda/src/internal/_equals.js"(exports, module) {
      var _arrayFromIterator2 = require_arrayFromIterator();
      var _includesWith2 = require_includesWith();
      var _functionName2 = require_functionName();
      var _has2 = require_has();
      var _objectIs2 = require_objectIs();
      var keys4 = require_keys();
      var type3 = require_type();
      function _uniqContentEquals2(aIterator, bIterator, stackA, stackB) {
        var a = _arrayFromIterator2(aIterator);
        var b = _arrayFromIterator2(bIterator);
        function eq2(_a, _b) {
          return _equals2(_a, _b, stackA.slice(), stackB.slice());
        }
        return !_includesWith2(function(b2, aItem) {
          return !_includesWith2(eq2, aItem, b2);
        }, b, a);
      }
      function _equals2(a, b, stackA, stackB) {
        if (_objectIs2(a, b)) {
          return true;
        }
        var typeA = type3(a);
        if (typeA !== type3(b)) {
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
            if (typeof a.constructor === "function" && _functionName2(a.constructor) === "Promise") {
              return a === b;
            }
            break;
          case "Boolean":
          case "Number":
          case "String":
            if (!(typeof a === typeof b && _objectIs2(a.valueOf(), b.valueOf()))) {
              return false;
            }
            break;
          case "Date":
            if (!_objectIs2(a.valueOf(), b.valueOf())) {
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
            return _uniqContentEquals2(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
          case "Set":
            if (a.size !== b.size) {
              return false;
            }
            return _uniqContentEquals2(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
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
        var keysA = keys4(a);
        if (keysA.length !== keys4(b).length) {
          return false;
        }
        var extendedStackA = stackA.concat([a]);
        var extendedStackB = stackB.concat([b]);
        idx = keysA.length - 1;
        while (idx >= 0) {
          var key = keysA[idx];
          if (!(_has2(key, b) && _equals2(b[key], a[key], extendedStackA, extendedStackB))) {
            return false;
          }
          idx -= 1;
        }
        return true;
      }
      module.exports = _equals2;
    }
  });

  // node_modules/ramda/src/equals.js
  var require_equals2 = __commonJS({
    "node_modules/ramda/src/equals.js"(exports, module) {
      var _curry22 = require_curry2();
      var _equals2 = require_equals();
      var equals3 = /* @__PURE__ */ _curry22(function equals4(a, b) {
        return _equals2(a, b, [], []);
      });
      module.exports = equals3;
    }
  });

  // node_modules/ramda/src/internal/_indexOf.js
  var require_indexOf = __commonJS({
    "node_modules/ramda/src/internal/_indexOf.js"(exports, module) {
      var equals3 = require_equals2();
      function _indexOf2(list, a, idx) {
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
          if (equals3(list[idx], a)) {
            return idx;
          }
          idx += 1;
        }
        return -1;
      }
      module.exports = _indexOf2;
    }
  });

  // node_modules/ramda/src/internal/_includes.js
  var require_includes = __commonJS({
    "node_modules/ramda/src/internal/_includes.js"(exports, module) {
      var _indexOf2 = require_indexOf();
      function _includes2(a, list) {
        return _indexOf2(list, a, 0) >= 0;
      }
      module.exports = _includes2;
    }
  });

  // node_modules/ramda/src/internal/_quote.js
  var require_quote = __commonJS({
    "node_modules/ramda/src/internal/_quote.js"(exports, module) {
      function _quote2(s) {
        var escaped = s.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\f/g, "\\f").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\0/g, "\\0");
        return '"' + escaped.replace(/"/g, '\\"') + '"';
      }
      module.exports = _quote2;
    }
  });

  // node_modules/ramda/src/internal/_toISOString.js
  var require_toISOString = __commonJS({
    "node_modules/ramda/src/internal/_toISOString.js"(exports, module) {
      var pad3 = function pad4(n) {
        return (n < 10 ? "0" : "") + n;
      };
      var _toISOString4 = typeof Date.prototype.toISOString === "function" ? function _toISOString5(d) {
        return d.toISOString();
      } : function _toISOString5(d) {
        return d.getUTCFullYear() + "-" + pad3(d.getUTCMonth() + 1) + "-" + pad3(d.getUTCDate()) + "T" + pad3(d.getUTCHours()) + ":" + pad3(d.getUTCMinutes()) + ":" + pad3(d.getUTCSeconds()) + "." + (d.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
      };
      module.exports = _toISOString4;
    }
  });

  // node_modules/ramda/src/internal/_complement.js
  var require_complement2 = __commonJS({
    "node_modules/ramda/src/internal/_complement.js"(exports, module) {
      function _complement2(f) {
        return function() {
          return !f.apply(this, arguments);
        };
      }
      module.exports = _complement2;
    }
  });

  // node_modules/ramda/src/internal/_filter.js
  var require_filter = __commonJS({
    "node_modules/ramda/src/internal/_filter.js"(exports, module) {
      function _filter2(fn, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        while (idx < len) {
          if (fn(list[idx])) {
            result[result.length] = list[idx];
          }
          idx += 1;
        }
        return result;
      }
      module.exports = _filter2;
    }
  });

  // node_modules/ramda/src/internal/_isObject.js
  var require_isObject = __commonJS({
    "node_modules/ramda/src/internal/_isObject.js"(exports, module) {
      function _isObject2(x) {
        return Object.prototype.toString.call(x) === "[object Object]";
      }
      module.exports = _isObject2;
    }
  });

  // node_modules/ramda/src/internal/_xfilter.js
  var require_xfilter = __commonJS({
    "node_modules/ramda/src/internal/_xfilter.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XFilter = /* @__PURE__ */ function() {
        function XFilter2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XFilter2.prototype["@@transducer/init"] = _xfBase.init;
        XFilter2.prototype["@@transducer/result"] = _xfBase.result;
        XFilter2.prototype["@@transducer/step"] = function(result, input) {
          return this.f(input) ? this.xf["@@transducer/step"](result, input) : result;
        };
        return XFilter2;
      }();
      var _xfilter = /* @__PURE__ */ _curry22(function _xfilter2(f, xf) {
        return new XFilter(f, xf);
      });
      module.exports = _xfilter;
    }
  });

  // node_modules/ramda/src/filter.js
  var require_filter2 = __commonJS({
    "node_modules/ramda/src/filter.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _filter2 = require_filter();
      var _isObject2 = require_isObject();
      var _reduce2 = require_reduce();
      var _xfilter = require_xfilter();
      var keys4 = require_keys();
      var filter = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["fantasy-land/filter", "filter"], _xfilter, function(pred, filterable) {
          return _isObject2(filterable) ? _reduce2(function(acc, key) {
            if (pred(filterable[key])) {
              acc[key] = filterable[key];
            }
            return acc;
          }, {}, keys4(filterable)) : _filter2(pred, filterable);
        })
      );
      module.exports = filter;
    }
  });

  // node_modules/ramda/src/reject.js
  var require_reject = __commonJS({
    "node_modules/ramda/src/reject.js"(exports, module) {
      var _complement2 = require_complement2();
      var _curry22 = require_curry2();
      var filter = require_filter2();
      var reject = /* @__PURE__ */ _curry22(function reject2(pred, filterable) {
        return filter(_complement2(pred), filterable);
      });
      module.exports = reject;
    }
  });

  // node_modules/ramda/src/internal/_toString.js
  var require_toString = __commonJS({
    "node_modules/ramda/src/internal/_toString.js"(exports, module) {
      var _includes2 = require_includes();
      var _map2 = require_map();
      var _quote2 = require_quote();
      var _toISOString4 = require_toISOString();
      var keys4 = require_keys();
      var reject = require_reject();
      function _toString2(x, seen) {
        var recur = function recur2(y) {
          var xs = seen.concat([x]);
          return _includes2(y, xs) ? "<Circular>" : _toString2(y, xs);
        };
        var mapPairs = function(obj, keys5) {
          return _map2(function(k) {
            return _quote2(k) + ": " + recur(obj[k]);
          }, keys5.slice().sort());
        };
        switch (Object.prototype.toString.call(x)) {
          case "[object Arguments]":
            return "(function() { return arguments; }(" + _map2(recur, x).join(", ") + "))";
          case "[object Array]":
            return "[" + _map2(recur, x).concat(mapPairs(x, reject(function(k) {
              return /^\d+$/.test(k);
            }, keys4(x)))).join(", ") + "]";
          case "[object Boolean]":
            return typeof x === "object" ? "new Boolean(" + recur(x.valueOf()) + ")" : x.toString();
          case "[object Date]":
            return "new Date(" + (isNaN(x.valueOf()) ? recur(NaN) : _quote2(_toISOString4(x))) + ")";
          case "[object Null]":
            return "null";
          case "[object Number]":
            return typeof x === "object" ? "new Number(" + recur(x.valueOf()) + ")" : 1 / x === -Infinity ? "-0" : x.toString(10);
          case "[object String]":
            return typeof x === "object" ? "new String(" + recur(x.valueOf()) + ")" : _quote2(x);
          case "[object Undefined]":
            return "undefined";
          default:
            if (typeof x.toString === "function") {
              var repr = x.toString();
              if (repr !== "[object Object]") {
                return repr;
              }
            }
            return "{" + mapPairs(x, keys4(x)).join(", ") + "}";
        }
      }
      module.exports = _toString2;
    }
  });

  // node_modules/ramda/src/toString.js
  var require_toString2 = __commonJS({
    "node_modules/ramda/src/toString.js"(exports, module) {
      var _curry12 = require_curry1();
      var _toString2 = require_toString();
      var toString3 = /* @__PURE__ */ _curry12(function toString4(val) {
        return _toString2(val, []);
      });
      module.exports = toString3;
    }
  });

  // node_modules/ramda/src/concat.js
  var require_concat2 = __commonJS({
    "node_modules/ramda/src/concat.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isArray2 = require_isArray();
      var _isFunction2 = require_isFunction();
      var _isString2 = require_isString();
      var toString3 = require_toString2();
      var concat = /* @__PURE__ */ _curry22(function concat2(a, b) {
        if (_isArray2(a)) {
          if (_isArray2(b)) {
            return a.concat(b);
          }
          throw new TypeError(toString3(b) + " is not an array");
        }
        if (_isString2(a)) {
          if (_isString2(b)) {
            return a + b;
          }
          throw new TypeError(toString3(b) + " is not a string");
        }
        if (a != null && _isFunction2(a["fantasy-land/concat"])) {
          return a["fantasy-land/concat"](b);
        }
        if (a != null && _isFunction2(a.concat)) {
          return a.concat(b);
        }
        throw new TypeError(toString3(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
      });
      module.exports = concat;
    }
  });

  // node_modules/ramda/src/cond.js
  var require_cond = __commonJS({
    "node_modules/ramda/src/cond.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry12 = require_curry1();
      var map = require_map2();
      var max = require_max();
      var reduce = require_reduce2();
      var cond = /* @__PURE__ */ _curry12(function cond2(pairs) {
        var arity = reduce(max, 0, map(function(pair) {
          return pair[0].length;
        }, pairs));
        return _arity2(arity, function() {
          var idx = 0;
          while (idx < pairs.length) {
            if (pairs[idx][0].apply(this, arguments)) {
              return pairs[idx][1].apply(this, arguments);
            }
            idx += 1;
          }
        });
      });
      module.exports = cond;
    }
  });

  // node_modules/ramda/src/curry.js
  var require_curry = __commonJS({
    "node_modules/ramda/src/curry.js"(exports, module) {
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var curry = /* @__PURE__ */ _curry12(function curry2(fn) {
        return curryN(fn.length, fn);
      });
      module.exports = curry;
    }
  });

  // node_modules/ramda/src/constructN.js
  var require_constructN = __commonJS({
    "node_modules/ramda/src/constructN.js"(exports, module) {
      var _curry22 = require_curry2();
      var curry = require_curry();
      var nAry = require_nAry();
      var constructN = /* @__PURE__ */ _curry22(function constructN2(n, Fn) {
        if (n > 10) {
          throw new Error("Constructor with greater than ten arguments");
        }
        if (n === 0) {
          return function() {
            return new Fn();
          };
        }
        return curry(nAry(n, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
          switch (arguments.length) {
            case 1:
              return new Fn($0);
            case 2:
              return new Fn($0, $1);
            case 3:
              return new Fn($0, $1, $2);
            case 4:
              return new Fn($0, $1, $2, $3);
            case 5:
              return new Fn($0, $1, $2, $3, $4);
            case 6:
              return new Fn($0, $1, $2, $3, $4, $5);
            case 7:
              return new Fn($0, $1, $2, $3, $4, $5, $6);
            case 8:
              return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
            case 9:
              return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
            case 10:
              return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
          }
        }));
      });
      module.exports = constructN;
    }
  });

  // node_modules/ramda/src/construct.js
  var require_construct = __commonJS({
    "node_modules/ramda/src/construct.js"(exports, module) {
      var _curry12 = require_curry1();
      var constructN = require_constructN();
      var construct = /* @__PURE__ */ _curry12(function construct2(Fn) {
        return constructN(Fn.length, Fn);
      });
      module.exports = construct;
    }
  });

  // node_modules/ramda/src/converge.js
  var require_converge = __commonJS({
    "node_modules/ramda/src/converge.js"(exports, module) {
      var _curry22 = require_curry2();
      var _map2 = require_map();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var converge = /* @__PURE__ */ _curry22(function converge2(after, fns) {
        return curryN(reduce(max, 0, pluck("length", fns)), function() {
          var args = arguments;
          var context = this;
          return after.apply(context, _map2(function(fn) {
            return fn.apply(context, args);
          }, fns));
        });
      });
      module.exports = converge;
    }
  });

  // node_modules/ramda/src/count.js
  var require_count = __commonJS({
    "node_modules/ramda/src/count.js"(exports, module) {
      var _reduce2 = require_reduce();
      var curry = require_curry();
      var count = /* @__PURE__ */ curry(function(pred, list) {
        return _reduce2(function(a, e2) {
          return pred(e2) ? a + 1 : a;
        }, 0, list);
      });
      module.exports = count;
    }
  });

  // node_modules/ramda/src/internal/_xreduceBy.js
  var require_xreduceBy = __commonJS({
    "node_modules/ramda/src/internal/_xreduceBy.js"(exports, module) {
      var _curryN2 = require_curryN();
      var _has2 = require_has();
      var _xfBase = require_xfBase();
      var XReduceBy = /* @__PURE__ */ function() {
        function XReduceBy2(valueFn, valueAcc, keyFn, xf) {
          this.valueFn = valueFn;
          this.valueAcc = valueAcc;
          this.keyFn = keyFn;
          this.xf = xf;
          this.inputs = {};
        }
        XReduceBy2.prototype["@@transducer/init"] = _xfBase.init;
        XReduceBy2.prototype["@@transducer/result"] = function(result) {
          var key;
          for (key in this.inputs) {
            if (_has2(key, this.inputs)) {
              result = this.xf["@@transducer/step"](result, this.inputs[key]);
              if (result["@@transducer/reduced"]) {
                result = result["@@transducer/value"];
                break;
              }
            }
          }
          this.inputs = null;
          return this.xf["@@transducer/result"](result);
        };
        XReduceBy2.prototype["@@transducer/step"] = function(result, input) {
          var key = this.keyFn(input);
          this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
          this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
          return result;
        };
        return XReduceBy2;
      }();
      var _xreduceBy = /* @__PURE__ */ _curryN2(4, [], function _xreduceBy2(valueFn, valueAcc, keyFn, xf) {
        return new XReduceBy(valueFn, valueAcc, keyFn, xf);
      });
      module.exports = _xreduceBy;
    }
  });

  // node_modules/ramda/src/reduceBy.js
  var require_reduceBy = __commonJS({
    "node_modules/ramda/src/reduceBy.js"(exports, module) {
      var _clone2 = require_clone();
      var _curryN2 = require_curryN();
      var _dispatchable2 = require_dispatchable();
      var _has2 = require_has();
      var _reduce2 = require_reduce();
      var _reduced2 = require_reduced();
      var _xreduceBy = require_xreduceBy();
      var reduceBy = /* @__PURE__ */ _curryN2(
        4,
        [],
        /* @__PURE__ */ _dispatchable2([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
          return _reduce2(function(acc, elt) {
            var key = keyFn(elt);
            var value = valueFn(_has2(key, acc) ? acc[key] : _clone2(valueAcc, [], [], false), elt);
            if (value && value["@@transducer/reduced"]) {
              return _reduced2(acc);
            }
            acc[key] = value;
            return acc;
          }, {}, list);
        })
      );
      module.exports = reduceBy;
    }
  });

  // node_modules/ramda/src/countBy.js
  var require_countBy = __commonJS({
    "node_modules/ramda/src/countBy.js"(exports, module) {
      var reduceBy = require_reduceBy();
      var countBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
        return acc + 1;
      }, 0);
      module.exports = countBy;
    }
  });

  // node_modules/ramda/src/dec.js
  var require_dec = __commonJS({
    "node_modules/ramda/src/dec.js"(exports, module) {
      var add2 = require_add();
      var dec = /* @__PURE__ */ add2(-1);
      module.exports = dec;
    }
  });

  // node_modules/ramda/src/defaultTo.js
  var require_defaultTo = __commonJS({
    "node_modules/ramda/src/defaultTo.js"(exports, module) {
      var _curry22 = require_curry2();
      var defaultTo = /* @__PURE__ */ _curry22(function defaultTo2(d, v) {
        return v == null || v !== v ? d : v;
      });
      module.exports = defaultTo;
    }
  });

  // node_modules/ramda/src/descend.js
  var require_descend = __commonJS({
    "node_modules/ramda/src/descend.js"(exports, module) {
      var _curry32 = require_curry3();
      var descend = /* @__PURE__ */ _curry32(function descend2(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa > bb ? -1 : aa < bb ? 1 : 0;
      });
      module.exports = descend;
    }
  });

  // node_modules/ramda/src/internal/_Set.js
  var require_Set = __commonJS({
    "node_modules/ramda/src/internal/_Set.js"(exports, module) {
      var _includes2 = require_includes();
      var _Set = /* @__PURE__ */ function() {
        function _Set2() {
          this._nativeSet = typeof Set === "function" ? /* @__PURE__ */ new Set() : null;
          this._items = {};
        }
        _Set2.prototype.add = function(item) {
          return !hasOrAdd(item, true, this);
        };
        _Set2.prototype.has = function(item) {
          return hasOrAdd(item, false, this);
        };
        return _Set2;
      }();
      function hasOrAdd(item, shouldAdd, set) {
        var type3 = typeof item;
        var prevSize, newSize;
        switch (type3) {
          case "string":
          case "number":
            if (item === 0 && 1 / item === -Infinity) {
              if (set._items["-0"]) {
                return true;
              } else {
                if (shouldAdd) {
                  set._items["-0"] = true;
                }
                return false;
              }
            }
            if (set._nativeSet !== null) {
              if (shouldAdd) {
                prevSize = set._nativeSet.size;
                set._nativeSet.add(item);
                newSize = set._nativeSet.size;
                return newSize === prevSize;
              } else {
                return set._nativeSet.has(item);
              }
            } else {
              if (!(type3 in set._items)) {
                if (shouldAdd) {
                  set._items[type3] = {};
                  set._items[type3][item] = true;
                }
                return false;
              } else if (item in set._items[type3]) {
                return true;
              } else {
                if (shouldAdd) {
                  set._items[type3][item] = true;
                }
                return false;
              }
            }
          case "boolean":
            if (type3 in set._items) {
              var bIdx = item ? 1 : 0;
              if (set._items[type3][bIdx]) {
                return true;
              } else {
                if (shouldAdd) {
                  set._items[type3][bIdx] = true;
                }
                return false;
              }
            } else {
              if (shouldAdd) {
                set._items[type3] = item ? [false, true] : [true, false];
              }
              return false;
            }
          case "function":
            if (set._nativeSet !== null) {
              if (shouldAdd) {
                prevSize = set._nativeSet.size;
                set._nativeSet.add(item);
                newSize = set._nativeSet.size;
                return newSize === prevSize;
              } else {
                return set._nativeSet.has(item);
              }
            } else {
              if (!(type3 in set._items)) {
                if (shouldAdd) {
                  set._items[type3] = [item];
                }
                return false;
              }
              if (!_includes2(item, set._items[type3])) {
                if (shouldAdd) {
                  set._items[type3].push(item);
                }
                return false;
              }
              return true;
            }
          case "undefined":
            if (set._items[type3]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type3] = true;
              }
              return false;
            }
          case "object":
            if (item === null) {
              if (!set._items["null"]) {
                if (shouldAdd) {
                  set._items["null"] = true;
                }
                return false;
              }
              return true;
            }
          default:
            type3 = Object.prototype.toString.call(item);
            if (!(type3 in set._items)) {
              if (shouldAdd) {
                set._items[type3] = [item];
              }
              return false;
            }
            if (!_includes2(item, set._items[type3])) {
              if (shouldAdd) {
                set._items[type3].push(item);
              }
              return false;
            }
            return true;
        }
      }
      module.exports = _Set;
    }
  });

  // node_modules/ramda/src/difference.js
  var require_difference = __commonJS({
    "node_modules/ramda/src/difference.js"(exports, module) {
      var _curry22 = require_curry2();
      var _Set = require_Set();
      var difference = /* @__PURE__ */ _curry22(function difference2(first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        var secondLen = second.length;
        var toFilterOut = new _Set();
        for (var i = 0; i < secondLen; i += 1) {
          toFilterOut.add(second[i]);
        }
        while (idx < firstLen) {
          if (toFilterOut.add(first[idx])) {
            out[out.length] = first[idx];
          }
          idx += 1;
        }
        return out;
      });
      module.exports = difference;
    }
  });

  // node_modules/ramda/src/differenceWith.js
  var require_differenceWith = __commonJS({
    "node_modules/ramda/src/differenceWith.js"(exports, module) {
      var _includesWith2 = require_includesWith();
      var _curry32 = require_curry3();
      var differenceWith = /* @__PURE__ */ _curry32(function differenceWith2(pred, first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        while (idx < firstLen) {
          if (!_includesWith2(pred, first[idx], second) && !_includesWith2(pred, first[idx], out)) {
            out.push(first[idx]);
          }
          idx += 1;
        }
        return out;
      });
      module.exports = differenceWith;
    }
  });

  // node_modules/ramda/src/remove.js
  var require_remove = __commonJS({
    "node_modules/ramda/src/remove.js"(exports, module) {
      var _curry32 = require_curry3();
      var remove = /* @__PURE__ */ _curry32(function remove2(start, count, list) {
        var result = Array.prototype.slice.call(list, 0);
        result.splice(start, count);
        return result;
      });
      module.exports = remove;
    }
  });

  // node_modules/ramda/src/internal/_dissoc.js
  var require_dissoc = __commonJS({
    "node_modules/ramda/src/internal/_dissoc.js"(exports, module) {
      var _isInteger2 = require_isInteger();
      var _isArray2 = require_isArray();
      var remove = require_remove();
      function _dissoc2(prop, obj) {
        if (obj == null) {
          return obj;
        }
        if (_isInteger2(prop) && _isArray2(obj)) {
          return remove(prop, 1, obj);
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        delete result[prop];
        return result;
      }
      module.exports = _dissoc2;
    }
  });

  // node_modules/ramda/src/dissocPath.js
  var require_dissocPath = __commonJS({
    "node_modules/ramda/src/dissocPath.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dissoc2 = require_dissoc();
      var _isInteger2 = require_isInteger();
      var _isArray2 = require_isArray();
      var assoc = require_assoc2();
      function _shallowCloneObject(prop, obj) {
        if (_isInteger2(prop) && _isArray2(obj)) {
          return [].concat(obj);
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        return result;
      }
      var dissocPath = /* @__PURE__ */ _curry22(function dissocPath2(path, obj) {
        if (obj == null) {
          return obj;
        }
        switch (path.length) {
          case 0:
            return obj;
          case 1:
            return _dissoc2(path[0], obj);
          default:
            var head = path[0];
            var tail = Array.prototype.slice.call(path, 1);
            if (obj[head] == null) {
              return _shallowCloneObject(head, obj);
            } else {
              return assoc(head, dissocPath2(tail, obj[head]), obj);
            }
        }
      });
      module.exports = dissocPath;
    }
  });

  // node_modules/ramda/src/dissoc.js
  var require_dissoc2 = __commonJS({
    "node_modules/ramda/src/dissoc.js"(exports, module) {
      var _curry22 = require_curry2();
      var dissocPath = require_dissocPath();
      var dissoc = /* @__PURE__ */ _curry22(function dissoc2(prop, obj) {
        return dissocPath([prop], obj);
      });
      module.exports = dissoc;
    }
  });

  // node_modules/ramda/src/divide.js
  var require_divide = __commonJS({
    "node_modules/ramda/src/divide.js"(exports, module) {
      var _curry22 = require_curry2();
      var divide = /* @__PURE__ */ _curry22(function divide2(a, b) {
        return a / b;
      });
      module.exports = divide;
    }
  });

  // node_modules/ramda/src/internal/_xdrop.js
  var require_xdrop = __commonJS({
    "node_modules/ramda/src/internal/_xdrop.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XDrop = /* @__PURE__ */ function() {
        function XDrop2(n, xf) {
          this.xf = xf;
          this.n = n;
        }
        XDrop2.prototype["@@transducer/init"] = _xfBase.init;
        XDrop2.prototype["@@transducer/result"] = _xfBase.result;
        XDrop2.prototype["@@transducer/step"] = function(result, input) {
          if (this.n > 0) {
            this.n -= 1;
            return result;
          }
          return this.xf["@@transducer/step"](result, input);
        };
        return XDrop2;
      }();
      var _xdrop = /* @__PURE__ */ _curry22(function _xdrop2(n, xf) {
        return new XDrop(n, xf);
      });
      module.exports = _xdrop;
    }
  });

  // node_modules/ramda/src/drop.js
  var require_drop = __commonJS({
    "node_modules/ramda/src/drop.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xdrop = require_xdrop();
      var slice = require_slice();
      var drop = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["drop"], _xdrop, function drop2(n, xs) {
          return slice(Math.max(0, n), Infinity, xs);
        })
      );
      module.exports = drop;
    }
  });

  // node_modules/ramda/src/internal/_xtake.js
  var require_xtake = __commonJS({
    "node_modules/ramda/src/internal/_xtake.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XTake = /* @__PURE__ */ function() {
        function XTake2(n, xf) {
          this.xf = xf;
          this.n = n;
          this.i = 0;
        }
        XTake2.prototype["@@transducer/init"] = _xfBase.init;
        XTake2.prototype["@@transducer/result"] = _xfBase.result;
        XTake2.prototype["@@transducer/step"] = function(result, input) {
          this.i += 1;
          var ret = this.n === 0 ? result : this.xf["@@transducer/step"](result, input);
          return this.n >= 0 && this.i >= this.n ? _reduced2(ret) : ret;
        };
        return XTake2;
      }();
      var _xtake = /* @__PURE__ */ _curry22(function _xtake2(n, xf) {
        return new XTake(n, xf);
      });
      module.exports = _xtake;
    }
  });

  // node_modules/ramda/src/take.js
  var require_take = __commonJS({
    "node_modules/ramda/src/take.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xtake = require_xtake();
      var slice = require_slice();
      var take = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["take"], _xtake, function take2(n, xs) {
          return slice(0, n < 0 ? Infinity : n, xs);
        })
      );
      module.exports = take;
    }
  });

  // node_modules/ramda/src/internal/_dropLast.js
  var require_dropLast = __commonJS({
    "node_modules/ramda/src/internal/_dropLast.js"(exports, module) {
      var take = require_take();
      function dropLast2(n, xs) {
        return take(n < xs.length ? xs.length - n : 0, xs);
      }
      module.exports = dropLast2;
    }
  });

  // node_modules/ramda/src/internal/_xdropLast.js
  var require_xdropLast = __commonJS({
    "node_modules/ramda/src/internal/_xdropLast.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XDropLast = /* @__PURE__ */ function() {
        function XDropLast2(n, xf) {
          this.xf = xf;
          this.pos = 0;
          this.full = false;
          this.acc = new Array(n);
        }
        XDropLast2.prototype["@@transducer/init"] = _xfBase.init;
        XDropLast2.prototype["@@transducer/result"] = function(result) {
          this.acc = null;
          return this.xf["@@transducer/result"](result);
        };
        XDropLast2.prototype["@@transducer/step"] = function(result, input) {
          if (this.full) {
            result = this.xf["@@transducer/step"](result, this.acc[this.pos]);
          }
          this.store(input);
          return result;
        };
        XDropLast2.prototype.store = function(input) {
          this.acc[this.pos] = input;
          this.pos += 1;
          if (this.pos === this.acc.length) {
            this.pos = 0;
            this.full = true;
          }
        };
        return XDropLast2;
      }();
      var _xdropLast = /* @__PURE__ */ _curry22(function _xdropLast2(n, xf) {
        return new XDropLast(n, xf);
      });
      module.exports = _xdropLast;
    }
  });

  // node_modules/ramda/src/dropLast.js
  var require_dropLast2 = __commonJS({
    "node_modules/ramda/src/dropLast.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _dropLast = require_dropLast();
      var _xdropLast = require_xdropLast();
      var dropLast2 = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xdropLast, _dropLast)
      );
      module.exports = dropLast2;
    }
  });

  // node_modules/ramda/src/internal/_dropLastWhile.js
  var require_dropLastWhile = __commonJS({
    "node_modules/ramda/src/internal/_dropLastWhile.js"(exports, module) {
      var slice = require_slice();
      function dropLastWhile2(pred, xs) {
        var idx = xs.length - 1;
        while (idx >= 0 && pred(xs[idx])) {
          idx -= 1;
        }
        return slice(0, idx + 1, xs);
      }
      module.exports = dropLastWhile2;
    }
  });

  // node_modules/ramda/src/internal/_xdropLastWhile.js
  var require_xdropLastWhile = __commonJS({
    "node_modules/ramda/src/internal/_xdropLastWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduce2 = require_reduce();
      var _xfBase = require_xfBase();
      var XDropLastWhile = /* @__PURE__ */ function() {
        function XDropLastWhile2(fn, xf) {
          this.f = fn;
          this.retained = [];
          this.xf = xf;
        }
        XDropLastWhile2.prototype["@@transducer/init"] = _xfBase.init;
        XDropLastWhile2.prototype["@@transducer/result"] = function(result) {
          this.retained = null;
          return this.xf["@@transducer/result"](result);
        };
        XDropLastWhile2.prototype["@@transducer/step"] = function(result, input) {
          return this.f(input) ? this.retain(result, input) : this.flush(result, input);
        };
        XDropLastWhile2.prototype.flush = function(result, input) {
          result = _reduce2(this.xf["@@transducer/step"], result, this.retained);
          this.retained = [];
          return this.xf["@@transducer/step"](result, input);
        };
        XDropLastWhile2.prototype.retain = function(result, input) {
          this.retained.push(input);
          return result;
        };
        return XDropLastWhile2;
      }();
      var _xdropLastWhile = /* @__PURE__ */ _curry22(function _xdropLastWhile2(fn, xf) {
        return new XDropLastWhile(fn, xf);
      });
      module.exports = _xdropLastWhile;
    }
  });

  // node_modules/ramda/src/dropLastWhile.js
  var require_dropLastWhile2 = __commonJS({
    "node_modules/ramda/src/dropLastWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _dropLastWhile = require_dropLastWhile();
      var _xdropLastWhile = require_xdropLastWhile();
      var dropLastWhile2 = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xdropLastWhile, _dropLastWhile)
      );
      module.exports = dropLastWhile2;
    }
  });

  // node_modules/ramda/src/internal/_xdropRepeatsWith.js
  var require_xdropRepeatsWith = __commonJS({
    "node_modules/ramda/src/internal/_xdropRepeatsWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XDropRepeatsWith = /* @__PURE__ */ function() {
        function XDropRepeatsWith2(pred, xf) {
          this.xf = xf;
          this.pred = pred;
          this.lastValue = void 0;
          this.seenFirstValue = false;
        }
        XDropRepeatsWith2.prototype["@@transducer/init"] = _xfBase.init;
        XDropRepeatsWith2.prototype["@@transducer/result"] = _xfBase.result;
        XDropRepeatsWith2.prototype["@@transducer/step"] = function(result, input) {
          var sameAsLast = false;
          if (!this.seenFirstValue) {
            this.seenFirstValue = true;
          } else if (this.pred(this.lastValue, input)) {
            sameAsLast = true;
          }
          this.lastValue = input;
          return sameAsLast ? result : this.xf["@@transducer/step"](result, input);
        };
        return XDropRepeatsWith2;
      }();
      var _xdropRepeatsWith = /* @__PURE__ */ _curry22(function _xdropRepeatsWith2(pred, xf) {
        return new XDropRepeatsWith(pred, xf);
      });
      module.exports = _xdropRepeatsWith;
    }
  });

  // node_modules/ramda/src/last.js
  var require_last = __commonJS({
    "node_modules/ramda/src/last.js"(exports, module) {
      var nth = require_nth();
      var last = /* @__PURE__ */ nth(-1);
      module.exports = last;
    }
  });

  // node_modules/ramda/src/dropRepeatsWith.js
  var require_dropRepeatsWith = __commonJS({
    "node_modules/ramda/src/dropRepeatsWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xdropRepeatsWith = require_xdropRepeatsWith();
      var last = require_last();
      var dropRepeatsWith = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xdropRepeatsWith, function dropRepeatsWith2(pred, list) {
          var result = [];
          var idx = 1;
          var len = list.length;
          if (len !== 0) {
            result[0] = list[0];
            while (idx < len) {
              if (!pred(last(result), list[idx])) {
                result[result.length] = list[idx];
              }
              idx += 1;
            }
          }
          return result;
        })
      );
      module.exports = dropRepeatsWith;
    }
  });

  // node_modules/ramda/src/dropRepeats.js
  var require_dropRepeats = __commonJS({
    "node_modules/ramda/src/dropRepeats.js"(exports, module) {
      var _curry12 = require_curry1();
      var _dispatchable2 = require_dispatchable();
      var _xdropRepeatsWith = require_xdropRepeatsWith();
      var dropRepeatsWith = require_dropRepeatsWith();
      var equals3 = require_equals2();
      var dropRepeats = /* @__PURE__ */ _curry12(
        /* @__PURE__ */ _dispatchable2(
          [],
          /* @__PURE__ */ _xdropRepeatsWith(equals3),
          /* @__PURE__ */ dropRepeatsWith(equals3)
        )
      );
      module.exports = dropRepeats;
    }
  });

  // node_modules/ramda/src/internal/_xdropWhile.js
  var require_xdropWhile = __commonJS({
    "node_modules/ramda/src/internal/_xdropWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XDropWhile = /* @__PURE__ */ function() {
        function XDropWhile2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XDropWhile2.prototype["@@transducer/init"] = _xfBase.init;
        XDropWhile2.prototype["@@transducer/result"] = _xfBase.result;
        XDropWhile2.prototype["@@transducer/step"] = function(result, input) {
          if (this.f) {
            if (this.f(input)) {
              return result;
            }
            this.f = null;
          }
          return this.xf["@@transducer/step"](result, input);
        };
        return XDropWhile2;
      }();
      var _xdropWhile = /* @__PURE__ */ _curry22(function _xdropWhile2(f, xf) {
        return new XDropWhile(f, xf);
      });
      module.exports = _xdropWhile;
    }
  });

  // node_modules/ramda/src/dropWhile.js
  var require_dropWhile = __commonJS({
    "node_modules/ramda/src/dropWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xdropWhile = require_xdropWhile();
      var slice = require_slice();
      var dropWhile = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["dropWhile"], _xdropWhile, function dropWhile2(pred, xs) {
          var idx = 0;
          var len = xs.length;
          while (idx < len && pred(xs[idx])) {
            idx += 1;
          }
          return slice(idx, Infinity, xs);
        })
      );
      module.exports = dropWhile;
    }
  });

  // node_modules/ramda/src/or.js
  var require_or = __commonJS({
    "node_modules/ramda/src/or.js"(exports, module) {
      var _curry22 = require_curry2();
      var or = /* @__PURE__ */ _curry22(function or2(a, b) {
        return a || b;
      });
      module.exports = or;
    }
  });

  // node_modules/ramda/src/either.js
  var require_either = __commonJS({
    "node_modules/ramda/src/either.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isFunction2 = require_isFunction();
      var lift = require_lift();
      var or = require_or();
      var either = /* @__PURE__ */ _curry22(function either2(f, g) {
        return _isFunction2(f) ? function _either() {
          return f.apply(this, arguments) || g.apply(this, arguments);
        } : lift(or)(f, g);
      });
      module.exports = either;
    }
  });

  // node_modules/ramda/src/internal/_isTypedArray.js
  var require_isTypedArray = __commonJS({
    "node_modules/ramda/src/internal/_isTypedArray.js"(exports, module) {
      function _isTypedArray2(val) {
        var type3 = Object.prototype.toString.call(val);
        return type3 === "[object Uint8ClampedArray]" || type3 === "[object Int8Array]" || type3 === "[object Uint8Array]" || type3 === "[object Int16Array]" || type3 === "[object Uint16Array]" || type3 === "[object Int32Array]" || type3 === "[object Uint32Array]" || type3 === "[object Float32Array]" || type3 === "[object Float64Array]" || type3 === "[object BigInt64Array]" || type3 === "[object BigUint64Array]";
      }
      module.exports = _isTypedArray2;
    }
  });

  // node_modules/ramda/src/empty.js
  var require_empty = __commonJS({
    "node_modules/ramda/src/empty.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isArguments2 = require_isArguments();
      var _isArray2 = require_isArray();
      var _isObject2 = require_isObject();
      var _isString2 = require_isString();
      var _isTypedArray2 = require_isTypedArray();
      var empty = /* @__PURE__ */ _curry12(function empty2(x) {
        return x != null && typeof x["fantasy-land/empty"] === "function" ? x["fantasy-land/empty"]() : x != null && x.constructor != null && typeof x.constructor["fantasy-land/empty"] === "function" ? x.constructor["fantasy-land/empty"]() : x != null && typeof x.empty === "function" ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === "function" ? x.constructor.empty() : _isArray2(x) ? [] : _isString2(x) ? "" : _isObject2(x) ? {} : _isArguments2(x) ? function() {
          return arguments;
        }() : _isTypedArray2(x) ? x.constructor.from("") : void 0;
      });
      module.exports = empty;
    }
  });

  // node_modules/ramda/src/takeLast.js
  var require_takeLast = __commonJS({
    "node_modules/ramda/src/takeLast.js"(exports, module) {
      var _curry22 = require_curry2();
      var drop = require_drop();
      var takeLast = /* @__PURE__ */ _curry22(function takeLast2(n, xs) {
        return drop(n >= 0 ? xs.length - n : 0, xs);
      });
      module.exports = takeLast;
    }
  });

  // node_modules/ramda/src/endsWith.js
  var require_endsWith = __commonJS({
    "node_modules/ramda/src/endsWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var equals3 = require_equals2();
      var takeLast = require_takeLast();
      var endsWith = /* @__PURE__ */ _curry22(function(suffix, list) {
        return equals3(takeLast(suffix.length, list), suffix);
      });
      module.exports = endsWith;
    }
  });

  // node_modules/ramda/src/eqBy.js
  var require_eqBy = __commonJS({
    "node_modules/ramda/src/eqBy.js"(exports, module) {
      var _curry32 = require_curry3();
      var equals3 = require_equals2();
      var eqBy = /* @__PURE__ */ _curry32(function eqBy2(f, x, y) {
        return equals3(f(x), f(y));
      });
      module.exports = eqBy;
    }
  });

  // node_modules/ramda/src/eqProps.js
  var require_eqProps = __commonJS({
    "node_modules/ramda/src/eqProps.js"(exports, module) {
      var _curry32 = require_curry3();
      var equals3 = require_equals2();
      var eqProps = /* @__PURE__ */ _curry32(function eqProps2(prop, obj1, obj2) {
        return equals3(obj1[prop], obj2[prop]);
      });
      module.exports = eqProps;
    }
  });

  // node_modules/ramda/src/evolve.js
  var require_evolve = __commonJS({
    "node_modules/ramda/src/evolve.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isArray2 = require_isArray();
      var _isObject2 = require_isObject();
      var evolve2 = /* @__PURE__ */ _curry22(function evolve3(transformations, object) {
        if (!_isObject2(object) && !_isArray2(object)) {
          return object;
        }
        var result = object instanceof Array ? [] : {};
        var transformation, key, type3;
        for (key in object) {
          transformation = transformations[key];
          type3 = typeof transformation;
          result[key] = type3 === "function" ? transformation(object[key]) : transformation && type3 === "object" ? evolve3(transformation, object[key]) : object[key];
        }
        return result;
      });
      module.exports = evolve2;
    }
  });

  // node_modules/ramda/src/internal/_xfind.js
  var require_xfind = __commonJS({
    "node_modules/ramda/src/internal/_xfind.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XFind = /* @__PURE__ */ function() {
        function XFind2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.found = false;
        }
        XFind2.prototype["@@transducer/init"] = _xfBase.init;
        XFind2.prototype["@@transducer/result"] = function(result) {
          if (!this.found) {
            result = this.xf["@@transducer/step"](result, void 0);
          }
          return this.xf["@@transducer/result"](result);
        };
        XFind2.prototype["@@transducer/step"] = function(result, input) {
          if (this.f(input)) {
            this.found = true;
            result = _reduced2(this.xf["@@transducer/step"](result, input));
          }
          return result;
        };
        return XFind2;
      }();
      var _xfind = /* @__PURE__ */ _curry22(function _xfind2(f, xf) {
        return new XFind(f, xf);
      });
      module.exports = _xfind;
    }
  });

  // node_modules/ramda/src/find.js
  var require_find = __commonJS({
    "node_modules/ramda/src/find.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xfind = require_xfind();
      var find = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["find"], _xfind, function find2(fn, list) {
          var idx = 0;
          var len = list.length;
          while (idx < len) {
            if (fn(list[idx])) {
              return list[idx];
            }
            idx += 1;
          }
        })
      );
      module.exports = find;
    }
  });

  // node_modules/ramda/src/internal/_xfindIndex.js
  var require_xfindIndex = __commonJS({
    "node_modules/ramda/src/internal/_xfindIndex.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XFindIndex = /* @__PURE__ */ function() {
        function XFindIndex2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.idx = -1;
          this.found = false;
        }
        XFindIndex2.prototype["@@transducer/init"] = _xfBase.init;
        XFindIndex2.prototype["@@transducer/result"] = function(result) {
          if (!this.found) {
            result = this.xf["@@transducer/step"](result, -1);
          }
          return this.xf["@@transducer/result"](result);
        };
        XFindIndex2.prototype["@@transducer/step"] = function(result, input) {
          this.idx += 1;
          if (this.f(input)) {
            this.found = true;
            result = _reduced2(this.xf["@@transducer/step"](result, this.idx));
          }
          return result;
        };
        return XFindIndex2;
      }();
      var _xfindIndex = /* @__PURE__ */ _curry22(function _xfindIndex2(f, xf) {
        return new XFindIndex(f, xf);
      });
      module.exports = _xfindIndex;
    }
  });

  // node_modules/ramda/src/findIndex.js
  var require_findIndex = __commonJS({
    "node_modules/ramda/src/findIndex.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xfindIndex = require_xfindIndex();
      var findIndex = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xfindIndex, function findIndex2(fn, list) {
          var idx = 0;
          var len = list.length;
          while (idx < len) {
            if (fn(list[idx])) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        })
      );
      module.exports = findIndex;
    }
  });

  // node_modules/ramda/src/internal/_xfindLast.js
  var require_xfindLast = __commonJS({
    "node_modules/ramda/src/internal/_xfindLast.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XFindLast = /* @__PURE__ */ function() {
        function XFindLast2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XFindLast2.prototype["@@transducer/init"] = _xfBase.init;
        XFindLast2.prototype["@@transducer/result"] = function(result) {
          return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.last));
        };
        XFindLast2.prototype["@@transducer/step"] = function(result, input) {
          if (this.f(input)) {
            this.last = input;
          }
          return result;
        };
        return XFindLast2;
      }();
      var _xfindLast = /* @__PURE__ */ _curry22(function _xfindLast2(f, xf) {
        return new XFindLast(f, xf);
      });
      module.exports = _xfindLast;
    }
  });

  // node_modules/ramda/src/findLast.js
  var require_findLast = __commonJS({
    "node_modules/ramda/src/findLast.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xfindLast = require_xfindLast();
      var findLast = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xfindLast, function findLast2(fn, list) {
          var idx = list.length - 1;
          while (idx >= 0) {
            if (fn(list[idx])) {
              return list[idx];
            }
            idx -= 1;
          }
        })
      );
      module.exports = findLast;
    }
  });

  // node_modules/ramda/src/internal/_xfindLastIndex.js
  var require_xfindLastIndex = __commonJS({
    "node_modules/ramda/src/internal/_xfindLastIndex.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XFindLastIndex = /* @__PURE__ */ function() {
        function XFindLastIndex2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.idx = -1;
          this.lastIdx = -1;
        }
        XFindLastIndex2.prototype["@@transducer/init"] = _xfBase.init;
        XFindLastIndex2.prototype["@@transducer/result"] = function(result) {
          return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.lastIdx));
        };
        XFindLastIndex2.prototype["@@transducer/step"] = function(result, input) {
          this.idx += 1;
          if (this.f(input)) {
            this.lastIdx = this.idx;
          }
          return result;
        };
        return XFindLastIndex2;
      }();
      var _xfindLastIndex = /* @__PURE__ */ _curry22(function _xfindLastIndex2(f, xf) {
        return new XFindLastIndex(f, xf);
      });
      module.exports = _xfindLastIndex;
    }
  });

  // node_modules/ramda/src/findLastIndex.js
  var require_findLastIndex = __commonJS({
    "node_modules/ramda/src/findLastIndex.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xfindLastIndex = require_xfindLastIndex();
      var findLastIndex = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xfindLastIndex, function findLastIndex2(fn, list) {
          var idx = list.length - 1;
          while (idx >= 0) {
            if (fn(list[idx])) {
              return idx;
            }
            idx -= 1;
          }
          return -1;
        })
      );
      module.exports = findLastIndex;
    }
  });

  // node_modules/ramda/src/flatten.js
  var require_flatten = __commonJS({
    "node_modules/ramda/src/flatten.js"(exports, module) {
      var _curry12 = require_curry1();
      var _makeFlat2 = require_makeFlat();
      var flatten = /* @__PURE__ */ _curry12(
        /* @__PURE__ */ _makeFlat2(true)
      );
      module.exports = flatten;
    }
  });

  // node_modules/ramda/src/flip.js
  var require_flip = __commonJS({
    "node_modules/ramda/src/flip.js"(exports, module) {
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var flip = /* @__PURE__ */ _curry12(function flip2(fn) {
        return curryN(fn.length, function(a, b) {
          var args = Array.prototype.slice.call(arguments, 0);
          args[0] = b;
          args[1] = a;
          return fn.apply(this, args);
        });
      });
      module.exports = flip;
    }
  });

  // node_modules/ramda/src/forEach.js
  var require_forEach = __commonJS({
    "node_modules/ramda/src/forEach.js"(exports, module) {
      var _checkForMethod2 = require_checkForMethod();
      var _curry22 = require_curry2();
      var forEach = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _checkForMethod2("forEach", function forEach2(fn, list) {
          var len = list.length;
          var idx = 0;
          while (idx < len) {
            fn(list[idx]);
            idx += 1;
          }
          return list;
        })
      );
      module.exports = forEach;
    }
  });

  // node_modules/ramda/src/forEachObjIndexed.js
  var require_forEachObjIndexed = __commonJS({
    "node_modules/ramda/src/forEachObjIndexed.js"(exports, module) {
      var _curry22 = require_curry2();
      var keys4 = require_keys();
      var forEachObjIndexed = /* @__PURE__ */ _curry22(function forEachObjIndexed2(fn, obj) {
        var keyList = keys4(obj);
        var idx = 0;
        while (idx < keyList.length) {
          var key = keyList[idx];
          fn(obj[key], key, obj);
          idx += 1;
        }
        return obj;
      });
      module.exports = forEachObjIndexed;
    }
  });

  // node_modules/ramda/src/fromPairs.js
  var require_fromPairs = __commonJS({
    "node_modules/ramda/src/fromPairs.js"(exports, module) {
      var _curry12 = require_curry1();
      var fromPairs = /* @__PURE__ */ _curry12(function fromPairs2(pairs) {
        var result = {};
        var idx = 0;
        while (idx < pairs.length) {
          result[pairs[idx][0]] = pairs[idx][1];
          idx += 1;
        }
        return result;
      });
      module.exports = fromPairs;
    }
  });

  // node_modules/ramda/src/groupBy.js
  var require_groupBy = __commonJS({
    "node_modules/ramda/src/groupBy.js"(exports, module) {
      var _checkForMethod2 = require_checkForMethod();
      var _curry22 = require_curry2();
      var reduceBy = require_reduceBy();
      var groupBy = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _checkForMethod2(
          "groupBy",
          /* @__PURE__ */ reduceBy(function(acc, item) {
            acc.push(item);
            return acc;
          }, [])
        )
      );
      module.exports = groupBy;
    }
  });

  // node_modules/ramda/src/groupWith.js
  var require_groupWith = __commonJS({
    "node_modules/ramda/src/groupWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var groupWith = /* @__PURE__ */ _curry22(function(fn, list) {
        var res = [];
        var idx = 0;
        var len = list.length;
        while (idx < len) {
          var nextidx = idx + 1;
          while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
            nextidx += 1;
          }
          res.push(list.slice(idx, nextidx));
          idx = nextidx;
        }
        return res;
      });
      module.exports = groupWith;
    }
  });

  // node_modules/ramda/src/gt.js
  var require_gt = __commonJS({
    "node_modules/ramda/src/gt.js"(exports, module) {
      var _curry22 = require_curry2();
      var gt2 = /* @__PURE__ */ _curry22(function gt3(a, b) {
        return a > b;
      });
      module.exports = gt2;
    }
  });

  // node_modules/ramda/src/gte.js
  var require_gte = __commonJS({
    "node_modules/ramda/src/gte.js"(exports, module) {
      var _curry22 = require_curry2();
      var gte = /* @__PURE__ */ _curry22(function gte2(a, b) {
        return a >= b;
      });
      module.exports = gte;
    }
  });

  // node_modules/ramda/src/hasPath.js
  var require_hasPath = __commonJS({
    "node_modules/ramda/src/hasPath.js"(exports, module) {
      var _curry22 = require_curry2();
      var _has2 = require_has();
      var isNil3 = require_isNil();
      var hasPath = /* @__PURE__ */ _curry22(function hasPath2(_path, obj) {
        if (_path.length === 0 || isNil3(obj)) {
          return false;
        }
        var val = obj;
        var idx = 0;
        while (idx < _path.length) {
          if (!isNil3(val) && _has2(_path[idx], val)) {
            val = val[_path[idx]];
            idx += 1;
          } else {
            return false;
          }
        }
        return true;
      });
      module.exports = hasPath;
    }
  });

  // node_modules/ramda/src/has.js
  var require_has2 = __commonJS({
    "node_modules/ramda/src/has.js"(exports, module) {
      var _curry22 = require_curry2();
      var hasPath = require_hasPath();
      var has = /* @__PURE__ */ _curry22(function has2(prop, obj) {
        return hasPath([prop], obj);
      });
      module.exports = has;
    }
  });

  // node_modules/ramda/src/hasIn.js
  var require_hasIn = __commonJS({
    "node_modules/ramda/src/hasIn.js"(exports, module) {
      var _curry22 = require_curry2();
      var isNil3 = require_isNil();
      var hasIn = /* @__PURE__ */ _curry22(function hasIn2(prop, obj) {
        if (isNil3(obj)) {
          return false;
        }
        return prop in obj;
      });
      module.exports = hasIn;
    }
  });

  // node_modules/ramda/src/identical.js
  var require_identical = __commonJS({
    "node_modules/ramda/src/identical.js"(exports, module) {
      var _objectIs2 = require_objectIs();
      var _curry22 = require_curry2();
      var identical = /* @__PURE__ */ _curry22(_objectIs2);
      module.exports = identical;
    }
  });

  // node_modules/ramda/src/ifElse.js
  var require_ifElse = __commonJS({
    "node_modules/ramda/src/ifElse.js"(exports, module) {
      var _curry32 = require_curry3();
      var curryN = require_curryN2();
      var ifElse = /* @__PURE__ */ _curry32(function ifElse2(condition, onTrue, onFalse) {
        return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
          return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
        });
      });
      module.exports = ifElse;
    }
  });

  // node_modules/ramda/src/inc.js
  var require_inc = __commonJS({
    "node_modules/ramda/src/inc.js"(exports, module) {
      var add2 = require_add();
      var inc = /* @__PURE__ */ add2(1);
      module.exports = inc;
    }
  });

  // node_modules/ramda/src/includes.js
  var require_includes2 = __commonJS({
    "node_modules/ramda/src/includes.js"(exports, module) {
      var _includes2 = require_includes();
      var _curry22 = require_curry2();
      var includes2 = /* @__PURE__ */ _curry22(_includes2);
      module.exports = includes2;
    }
  });

  // node_modules/ramda/src/indexBy.js
  var require_indexBy = __commonJS({
    "node_modules/ramda/src/indexBy.js"(exports, module) {
      var reduceBy = require_reduceBy();
      var indexBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
        return elem;
      }, null);
      module.exports = indexBy;
    }
  });

  // node_modules/ramda/src/indexOf.js
  var require_indexOf2 = __commonJS({
    "node_modules/ramda/src/indexOf.js"(exports, module) {
      var _curry22 = require_curry2();
      var _indexOf2 = require_indexOf();
      var _isArray2 = require_isArray();
      var indexOf = /* @__PURE__ */ _curry22(function indexOf2(target, xs) {
        return typeof xs.indexOf === "function" && !_isArray2(xs) ? xs.indexOf(target) : _indexOf2(xs, target, 0);
      });
      module.exports = indexOf;
    }
  });

  // node_modules/ramda/src/init.js
  var require_init = __commonJS({
    "node_modules/ramda/src/init.js"(exports, module) {
      var slice = require_slice();
      var init = /* @__PURE__ */ slice(0, -1);
      module.exports = init;
    }
  });

  // node_modules/ramda/src/innerJoin.js
  var require_innerJoin = __commonJS({
    "node_modules/ramda/src/innerJoin.js"(exports, module) {
      var _includesWith2 = require_includesWith();
      var _curry32 = require_curry3();
      var _filter2 = require_filter();
      var innerJoin = /* @__PURE__ */ _curry32(function innerJoin2(pred, xs, ys) {
        return _filter2(function(x) {
          return _includesWith2(pred, x, ys);
        }, xs);
      });
      module.exports = innerJoin;
    }
  });

  // node_modules/ramda/src/insert.js
  var require_insert = __commonJS({
    "node_modules/ramda/src/insert.js"(exports, module) {
      var _curry32 = require_curry3();
      var insert = /* @__PURE__ */ _curry32(function insert2(idx, elt, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        var result = Array.prototype.slice.call(list, 0);
        result.splice(idx, 0, elt);
        return result;
      });
      module.exports = insert;
    }
  });

  // node_modules/ramda/src/insertAll.js
  var require_insertAll = __commonJS({
    "node_modules/ramda/src/insertAll.js"(exports, module) {
      var _curry32 = require_curry3();
      var insertAll = /* @__PURE__ */ _curry32(function insertAll2(idx, elts, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
      });
      module.exports = insertAll;
    }
  });

  // node_modules/ramda/src/internal/_xuniqBy.js
  var require_xuniqBy = __commonJS({
    "node_modules/ramda/src/internal/_xuniqBy.js"(exports, module) {
      var _curry22 = require_curry2();
      var _Set = require_Set();
      var _xfBase = require_xfBase();
      var XUniqBy = /* @__PURE__ */ function() {
        function XUniqBy2(f, xf) {
          this.xf = xf;
          this.f = f;
          this.set = new _Set();
        }
        XUniqBy2.prototype["@@transducer/init"] = _xfBase.init;
        XUniqBy2.prototype["@@transducer/result"] = _xfBase.result;
        XUniqBy2.prototype["@@transducer/step"] = function(result, input) {
          return this.set.add(this.f(input)) ? this.xf["@@transducer/step"](result, input) : result;
        };
        return XUniqBy2;
      }();
      var _xuniqBy = /* @__PURE__ */ _curry22(function _xuniqBy2(f, xf) {
        return new XUniqBy(f, xf);
      });
      module.exports = _xuniqBy;
    }
  });

  // node_modules/ramda/src/uniqBy.js
  var require_uniqBy = __commonJS({
    "node_modules/ramda/src/uniqBy.js"(exports, module) {
      var _Set = require_Set();
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xuniqBy = require_xuniqBy();
      var uniqBy = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xuniqBy, function(fn, list) {
          var set = new _Set();
          var result = [];
          var idx = 0;
          var appliedItem, item;
          while (idx < list.length) {
            item = list[idx];
            appliedItem = fn(item);
            if (set.add(appliedItem)) {
              result.push(item);
            }
            idx += 1;
          }
          return result;
        })
      );
      module.exports = uniqBy;
    }
  });

  // node_modules/ramda/src/uniq.js
  var require_uniq = __commonJS({
    "node_modules/ramda/src/uniq.js"(exports, module) {
      var identity = require_identity2();
      var uniqBy = require_uniqBy();
      var uniq = /* @__PURE__ */ uniqBy(identity);
      module.exports = uniq;
    }
  });

  // node_modules/ramda/src/intersection.js
  var require_intersection = __commonJS({
    "node_modules/ramda/src/intersection.js"(exports, module) {
      var _includes2 = require_includes();
      var _curry22 = require_curry2();
      var _filter2 = require_filter();
      var flip = require_flip();
      var uniq = require_uniq();
      var intersection = /* @__PURE__ */ _curry22(function intersection2(list1, list2) {
        var lookupList, filteredList;
        if (list1.length > list2.length) {
          lookupList = list1;
          filteredList = list2;
        } else {
          lookupList = list2;
          filteredList = list1;
        }
        return uniq(_filter2(flip(_includes2)(lookupList), filteredList));
      });
      module.exports = intersection;
    }
  });

  // node_modules/ramda/src/intersperse.js
  var require_intersperse = __commonJS({
    "node_modules/ramda/src/intersperse.js"(exports, module) {
      var _checkForMethod2 = require_checkForMethod();
      var _curry22 = require_curry2();
      var intersperse = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _checkForMethod2("intersperse", function intersperse2(separator, list) {
          var out = [];
          var idx = 0;
          var length = list.length;
          while (idx < length) {
            if (idx === length - 1) {
              out.push(list[idx]);
            } else {
              out.push(list[idx], separator);
            }
            idx += 1;
          }
          return out;
        })
      );
      module.exports = intersperse;
    }
  });

  // node_modules/ramda/src/internal/_objectAssign.js
  var require_objectAssign = __commonJS({
    "node_modules/ramda/src/internal/_objectAssign.js"(exports, module) {
      var _has2 = require_has();
      function _objectAssign(target) {
        if (target == null) {
          throw new TypeError("Cannot convert undefined or null to object");
        }
        var output = Object(target);
        var idx = 1;
        var length = arguments.length;
        while (idx < length) {
          var source = arguments[idx];
          if (source != null) {
            for (var nextKey in source) {
              if (_has2(nextKey, source)) {
                output[nextKey] = source[nextKey];
              }
            }
          }
          idx += 1;
        }
        return output;
      }
      module.exports = typeof Object.assign === "function" ? Object.assign : _objectAssign;
    }
  });

  // node_modules/ramda/src/objOf.js
  var require_objOf = __commonJS({
    "node_modules/ramda/src/objOf.js"(exports, module) {
      var _curry22 = require_curry2();
      var objOf = /* @__PURE__ */ _curry22(function objOf2(key, val) {
        var obj = {};
        obj[key] = val;
        return obj;
      });
      module.exports = objOf;
    }
  });

  // node_modules/ramda/src/internal/_stepCat.js
  var require_stepCat = __commonJS({
    "node_modules/ramda/src/internal/_stepCat.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _identity2 = require_identity();
      var _isArrayLike = require_isArrayLike();
      var _isTransformer2 = require_isTransformer();
      var objOf = require_objOf();
      var _stepCatArray = {
        "@@transducer/init": Array,
        "@@transducer/step": function(xs, x) {
          xs.push(x);
          return xs;
        },
        "@@transducer/result": _identity2
      };
      var _stepCatString = {
        "@@transducer/init": String,
        "@@transducer/step": function(a, b) {
          return a + b;
        },
        "@@transducer/result": _identity2
      };
      var _stepCatObject = {
        "@@transducer/init": Object,
        "@@transducer/step": function(result, input) {
          return _objectAssign(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
        },
        "@@transducer/result": _identity2
      };
      function _stepCat2(obj) {
        if (_isTransformer2(obj)) {
          return obj;
        }
        if (_isArrayLike(obj)) {
          return _stepCatArray;
        }
        if (typeof obj === "string") {
          return _stepCatString;
        }
        if (typeof obj === "object") {
          return _stepCatObject;
        }
        throw new Error("Cannot create transformer for " + obj);
      }
      module.exports = _stepCat2;
    }
  });

  // node_modules/ramda/src/into.js
  var require_into = __commonJS({
    "node_modules/ramda/src/into.js"(exports, module) {
      var _clone2 = require_clone();
      var _curry32 = require_curry3();
      var _isTransformer2 = require_isTransformer();
      var _reduce2 = require_reduce();
      var _stepCat2 = require_stepCat();
      var into = /* @__PURE__ */ _curry32(function into2(acc, xf, list) {
        return _isTransformer2(acc) ? _reduce2(xf(acc), acc["@@transducer/init"](), list) : _reduce2(xf(_stepCat2(acc)), _clone2(acc, [], [], false), list);
      });
      module.exports = into;
    }
  });

  // node_modules/ramda/src/invert.js
  var require_invert = __commonJS({
    "node_modules/ramda/src/invert.js"(exports, module) {
      var _curry12 = require_curry1();
      var _has2 = require_has();
      var keys4 = require_keys();
      var invert = /* @__PURE__ */ _curry12(function invert2(obj) {
        var props = keys4(obj);
        var len = props.length;
        var idx = 0;
        var out = {};
        while (idx < len) {
          var key = props[idx];
          var val = obj[key];
          var list = _has2(val, out) ? out[val] : out[val] = [];
          list[list.length] = key;
          idx += 1;
        }
        return out;
      });
      module.exports = invert;
    }
  });

  // node_modules/ramda/src/invertObj.js
  var require_invertObj = __commonJS({
    "node_modules/ramda/src/invertObj.js"(exports, module) {
      var _curry12 = require_curry1();
      var keys4 = require_keys();
      var invertObj = /* @__PURE__ */ _curry12(function invertObj2(obj) {
        var props = keys4(obj);
        var len = props.length;
        var idx = 0;
        var out = {};
        while (idx < len) {
          var key = props[idx];
          out[obj[key]] = key;
          idx += 1;
        }
        return out;
      });
      module.exports = invertObj;
    }
  });

  // node_modules/ramda/src/invoker.js
  var require_invoker = __commonJS({
    "node_modules/ramda/src/invoker.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isFunction2 = require_isFunction();
      var curryN = require_curryN2();
      var toString3 = require_toString2();
      var invoker = /* @__PURE__ */ _curry22(function invoker2(arity, method) {
        return curryN(arity + 1, function() {
          var target = arguments[arity];
          if (target != null && _isFunction2(target[method])) {
            return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
          }
          throw new TypeError(toString3(target) + ' does not have a method named "' + method + '"');
        });
      });
      module.exports = invoker;
    }
  });

  // node_modules/ramda/src/is.js
  var require_is = __commonJS({
    "node_modules/ramda/src/is.js"(exports, module) {
      var _curry22 = require_curry2();
      var is3 = /* @__PURE__ */ _curry22(function is4(Ctor, val) {
        return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
      });
      module.exports = is3;
    }
  });

  // node_modules/ramda/src/isEmpty.js
  var require_isEmpty = __commonJS({
    "node_modules/ramda/src/isEmpty.js"(exports, module) {
      var _curry12 = require_curry1();
      var empty = require_empty();
      var equals3 = require_equals2();
      var isEmpty = /* @__PURE__ */ _curry12(function isEmpty2(x) {
        return x != null && equals3(x, empty(x));
      });
      module.exports = isEmpty;
    }
  });

  // node_modules/ramda/src/join.js
  var require_join = __commonJS({
    "node_modules/ramda/src/join.js"(exports, module) {
      var invoker = require_invoker();
      var join = /* @__PURE__ */ invoker(1, "join");
      module.exports = join;
    }
  });

  // node_modules/ramda/src/juxt.js
  var require_juxt = __commonJS({
    "node_modules/ramda/src/juxt.js"(exports, module) {
      var _curry12 = require_curry1();
      var converge = require_converge();
      var juxt = /* @__PURE__ */ _curry12(function juxt2(fns) {
        return converge(function() {
          return Array.prototype.slice.call(arguments, 0);
        }, fns);
      });
      module.exports = juxt;
    }
  });

  // node_modules/ramda/src/keysIn.js
  var require_keysIn = __commonJS({
    "node_modules/ramda/src/keysIn.js"(exports, module) {
      var _curry12 = require_curry1();
      var keysIn = /* @__PURE__ */ _curry12(function keysIn2(obj) {
        var prop;
        var ks = [];
        for (prop in obj) {
          ks[ks.length] = prop;
        }
        return ks;
      });
      module.exports = keysIn;
    }
  });

  // node_modules/ramda/src/lastIndexOf.js
  var require_lastIndexOf = __commonJS({
    "node_modules/ramda/src/lastIndexOf.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isArray2 = require_isArray();
      var equals3 = require_equals2();
      var lastIndexOf = /* @__PURE__ */ _curry22(function lastIndexOf2(target, xs) {
        if (typeof xs.lastIndexOf === "function" && !_isArray2(xs)) {
          return xs.lastIndexOf(target);
        } else {
          var idx = xs.length - 1;
          while (idx >= 0) {
            if (equals3(xs[idx], target)) {
              return idx;
            }
            idx -= 1;
          }
          return -1;
        }
      });
      module.exports = lastIndexOf;
    }
  });

  // node_modules/ramda/src/internal/_isNumber.js
  var require_isNumber = __commonJS({
    "node_modules/ramda/src/internal/_isNumber.js"(exports, module) {
      function _isNumber2(x) {
        return Object.prototype.toString.call(x) === "[object Number]";
      }
      module.exports = _isNumber2;
    }
  });

  // node_modules/ramda/src/length.js
  var require_length = __commonJS({
    "node_modules/ramda/src/length.js"(exports, module) {
      var _curry12 = require_curry1();
      var _isNumber2 = require_isNumber();
      var length = /* @__PURE__ */ _curry12(function length2(list) {
        return list != null && _isNumber2(list.length) ? list.length : NaN;
      });
      module.exports = length;
    }
  });

  // node_modules/ramda/src/lens.js
  var require_lens = __commonJS({
    "node_modules/ramda/src/lens.js"(exports, module) {
      var _curry22 = require_curry2();
      var map = require_map2();
      var lens = /* @__PURE__ */ _curry22(function lens2(getter, setter) {
        return function(toFunctorFn) {
          return function(target) {
            return map(function(focus) {
              return setter(focus, target);
            }, toFunctorFn(getter(target)));
          };
        };
      });
      module.exports = lens;
    }
  });

  // node_modules/ramda/src/update.js
  var require_update = __commonJS({
    "node_modules/ramda/src/update.js"(exports, module) {
      var _curry32 = require_curry3();
      var adjust = require_adjust();
      var always = require_always();
      var update = /* @__PURE__ */ _curry32(function update2(idx, x, list) {
        return adjust(idx, always(x), list);
      });
      module.exports = update;
    }
  });

  // node_modules/ramda/src/lensIndex.js
  var require_lensIndex = __commonJS({
    "node_modules/ramda/src/lensIndex.js"(exports, module) {
      var _curry12 = require_curry1();
      var lens = require_lens();
      var nth = require_nth();
      var update = require_update();
      var lensIndex = /* @__PURE__ */ _curry12(function lensIndex2(n) {
        return lens(nth(n), update(n));
      });
      module.exports = lensIndex;
    }
  });

  // node_modules/ramda/src/paths.js
  var require_paths = __commonJS({
    "node_modules/ramda/src/paths.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isInteger2 = require_isInteger();
      var nth = require_nth();
      var paths = /* @__PURE__ */ _curry22(function paths2(pathsArray, obj) {
        return pathsArray.map(function(paths3) {
          var val = obj;
          var idx = 0;
          var p;
          while (idx < paths3.length) {
            if (val == null) {
              return;
            }
            p = paths3[idx];
            val = _isInteger2(p) ? nth(p, val) : val[p];
            idx += 1;
          }
          return val;
        });
      });
      module.exports = paths;
    }
  });

  // node_modules/ramda/src/path.js
  var require_path = __commonJS({
    "node_modules/ramda/src/path.js"(exports, module) {
      var _curry22 = require_curry2();
      var paths = require_paths();
      var path = /* @__PURE__ */ _curry22(function path2(pathAr, obj) {
        return paths([pathAr], obj)[0];
      });
      module.exports = path;
    }
  });

  // node_modules/ramda/src/lensPath.js
  var require_lensPath = __commonJS({
    "node_modules/ramda/src/lensPath.js"(exports, module) {
      var _curry12 = require_curry1();
      var assocPath = require_assocPath();
      var lens = require_lens();
      var path = require_path();
      var lensPath = /* @__PURE__ */ _curry12(function lensPath2(p) {
        return lens(path(p), assocPath(p));
      });
      module.exports = lensPath;
    }
  });

  // node_modules/ramda/src/lensProp.js
  var require_lensProp = __commonJS({
    "node_modules/ramda/src/lensProp.js"(exports, module) {
      var _curry12 = require_curry1();
      var assoc = require_assoc2();
      var lens = require_lens();
      var prop = require_prop();
      var lensProp = /* @__PURE__ */ _curry12(function lensProp2(k) {
        return lens(prop(k), assoc(k));
      });
      module.exports = lensProp;
    }
  });

  // node_modules/ramda/src/lt.js
  var require_lt = __commonJS({
    "node_modules/ramda/src/lt.js"(exports, module) {
      var _curry22 = require_curry2();
      var lt2 = /* @__PURE__ */ _curry22(function lt3(a, b) {
        return a < b;
      });
      module.exports = lt2;
    }
  });

  // node_modules/ramda/src/lte.js
  var require_lte = __commonJS({
    "node_modules/ramda/src/lte.js"(exports, module) {
      var _curry22 = require_curry2();
      var lte = /* @__PURE__ */ _curry22(function lte2(a, b) {
        return a <= b;
      });
      module.exports = lte;
    }
  });

  // node_modules/ramda/src/mapAccum.js
  var require_mapAccum = __commonJS({
    "node_modules/ramda/src/mapAccum.js"(exports, module) {
      var _curry32 = require_curry3();
      var mapAccum = /* @__PURE__ */ _curry32(function mapAccum2(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        var tuple = [acc];
        while (idx < len) {
          tuple = fn(tuple[0], list[idx]);
          result[idx] = tuple[1];
          idx += 1;
        }
        return [tuple[0], result];
      });
      module.exports = mapAccum;
    }
  });

  // node_modules/ramda/src/mapAccumRight.js
  var require_mapAccumRight = __commonJS({
    "node_modules/ramda/src/mapAccumRight.js"(exports, module) {
      var _curry32 = require_curry3();
      var mapAccumRight = /* @__PURE__ */ _curry32(function mapAccumRight2(fn, acc, list) {
        var idx = list.length - 1;
        var result = [];
        var tuple = [acc];
        while (idx >= 0) {
          tuple = fn(tuple[0], list[idx]);
          result[idx] = tuple[1];
          idx -= 1;
        }
        return [tuple[0], result];
      });
      module.exports = mapAccumRight;
    }
  });

  // node_modules/ramda/src/mapObjIndexed.js
  var require_mapObjIndexed = __commonJS({
    "node_modules/ramda/src/mapObjIndexed.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduce2 = require_reduce();
      var keys4 = require_keys();
      var mapObjIndexed = /* @__PURE__ */ _curry22(function mapObjIndexed2(fn, obj) {
        return _reduce2(function(acc, key) {
          acc[key] = fn(obj[key], key, obj);
          return acc;
        }, {}, keys4(obj));
      });
      module.exports = mapObjIndexed;
    }
  });

  // node_modules/ramda/src/match.js
  var require_match = __commonJS({
    "node_modules/ramda/src/match.js"(exports, module) {
      var _curry22 = require_curry2();
      var match = /* @__PURE__ */ _curry22(function match2(rx, str) {
        return str.match(rx) || [];
      });
      module.exports = match;
    }
  });

  // node_modules/ramda/src/mathMod.js
  var require_mathMod = __commonJS({
    "node_modules/ramda/src/mathMod.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isInteger2 = require_isInteger();
      var mathMod = /* @__PURE__ */ _curry22(function mathMod2(m, p) {
        if (!_isInteger2(m)) {
          return NaN;
        }
        if (!_isInteger2(p) || p < 1) {
          return NaN;
        }
        return (m % p + p) % p;
      });
      module.exports = mathMod;
    }
  });

  // node_modules/ramda/src/maxBy.js
  var require_maxBy = __commonJS({
    "node_modules/ramda/src/maxBy.js"(exports, module) {
      var _curry32 = require_curry3();
      var maxBy = /* @__PURE__ */ _curry32(function maxBy2(f, a, b) {
        return f(b) > f(a) ? b : a;
      });
      module.exports = maxBy;
    }
  });

  // node_modules/ramda/src/sum.js
  var require_sum = __commonJS({
    "node_modules/ramda/src/sum.js"(exports, module) {
      var add2 = require_add();
      var reduce = require_reduce2();
      var sum = /* @__PURE__ */ reduce(add2, 0);
      module.exports = sum;
    }
  });

  // node_modules/ramda/src/mean.js
  var require_mean = __commonJS({
    "node_modules/ramda/src/mean.js"(exports, module) {
      var _curry12 = require_curry1();
      var sum = require_sum();
      var mean = /* @__PURE__ */ _curry12(function mean2(list) {
        return sum(list) / list.length;
      });
      module.exports = mean;
    }
  });

  // node_modules/ramda/src/median.js
  var require_median = __commonJS({
    "node_modules/ramda/src/median.js"(exports, module) {
      var _curry12 = require_curry1();
      var mean = require_mean();
      var median = /* @__PURE__ */ _curry12(function median2(list) {
        var len = list.length;
        if (len === 0) {
          return NaN;
        }
        var width = 2 - len % 2;
        var idx = (len - width) / 2;
        return mean(Array.prototype.slice.call(list, 0).sort(function(a, b) {
          return a < b ? -1 : a > b ? 1 : 0;
        }).slice(idx, idx + width));
      });
      module.exports = median;
    }
  });

  // node_modules/ramda/src/memoizeWith.js
  var require_memoizeWith = __commonJS({
    "node_modules/ramda/src/memoizeWith.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry22 = require_curry2();
      var _has2 = require_has();
      var memoizeWith = /* @__PURE__ */ _curry22(function memoizeWith2(mFn, fn) {
        var cache = {};
        return _arity2(fn.length, function() {
          var key = mFn.apply(this, arguments);
          if (!_has2(key, cache)) {
            cache[key] = fn.apply(this, arguments);
          }
          return cache[key];
        });
      });
      module.exports = memoizeWith;
    }
  });

  // node_modules/ramda/src/mergeAll.js
  var require_mergeAll = __commonJS({
    "node_modules/ramda/src/mergeAll.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry12 = require_curry1();
      var mergeAll = /* @__PURE__ */ _curry12(function mergeAll2(list) {
        return _objectAssign.apply(null, [{}].concat(list));
      });
      module.exports = mergeAll;
    }
  });

  // node_modules/ramda/src/mergeWithKey.js
  var require_mergeWithKey = __commonJS({
    "node_modules/ramda/src/mergeWithKey.js"(exports, module) {
      var _curry32 = require_curry3();
      var _has2 = require_has();
      var mergeWithKey = /* @__PURE__ */ _curry32(function mergeWithKey2(fn, l, r) {
        var result = {};
        var k;
        for (k in l) {
          if (_has2(k, l)) {
            result[k] = _has2(k, r) ? fn(k, l[k], r[k]) : l[k];
          }
        }
        for (k in r) {
          if (_has2(k, r) && !_has2(k, result)) {
            result[k] = r[k];
          }
        }
        return result;
      });
      module.exports = mergeWithKey;
    }
  });

  // node_modules/ramda/src/mergeDeepWithKey.js
  var require_mergeDeepWithKey = __commonJS({
    "node_modules/ramda/src/mergeDeepWithKey.js"(exports, module) {
      var _curry32 = require_curry3();
      var _isObject2 = require_isObject();
      var mergeWithKey = require_mergeWithKey();
      var mergeDeepWithKey = /* @__PURE__ */ _curry32(function mergeDeepWithKey2(fn, lObj, rObj) {
        return mergeWithKey(function(k, lVal, rVal) {
          if (_isObject2(lVal) && _isObject2(rVal)) {
            return mergeDeepWithKey2(fn, lVal, rVal);
          } else {
            return fn(k, lVal, rVal);
          }
        }, lObj, rObj);
      });
      module.exports = mergeDeepWithKey;
    }
  });

  // node_modules/ramda/src/mergeDeepLeft.js
  var require_mergeDeepLeft = __commonJS({
    "node_modules/ramda/src/mergeDeepLeft.js"(exports, module) {
      var _curry22 = require_curry2();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepLeft = /* @__PURE__ */ _curry22(function mergeDeepLeft2(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return lVal;
        }, lObj, rObj);
      });
      module.exports = mergeDeepLeft;
    }
  });

  // node_modules/ramda/src/mergeDeepRight.js
  var require_mergeDeepRight = __commonJS({
    "node_modules/ramda/src/mergeDeepRight.js"(exports, module) {
      var _curry22 = require_curry2();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepRight = /* @__PURE__ */ _curry22(function mergeDeepRight2(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return rVal;
        }, lObj, rObj);
      });
      module.exports = mergeDeepRight;
    }
  });

  // node_modules/ramda/src/mergeDeepWith.js
  var require_mergeDeepWith = __commonJS({
    "node_modules/ramda/src/mergeDeepWith.js"(exports, module) {
      var _curry32 = require_curry3();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepWith = /* @__PURE__ */ _curry32(function mergeDeepWith2(fn, lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return fn(lVal, rVal);
        }, lObj, rObj);
      });
      module.exports = mergeDeepWith;
    }
  });

  // node_modules/ramda/src/mergeLeft.js
  var require_mergeLeft = __commonJS({
    "node_modules/ramda/src/mergeLeft.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry22 = require_curry2();
      var mergeLeft2 = /* @__PURE__ */ _curry22(function mergeLeft3(l, r) {
        return _objectAssign({}, r, l);
      });
      module.exports = mergeLeft2;
    }
  });

  // node_modules/ramda/src/mergeRight.js
  var require_mergeRight = __commonJS({
    "node_modules/ramda/src/mergeRight.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry22 = require_curry2();
      var mergeRight = /* @__PURE__ */ _curry22(function mergeRight2(l, r) {
        return _objectAssign({}, l, r);
      });
      module.exports = mergeRight;
    }
  });

  // node_modules/ramda/src/mergeWith.js
  var require_mergeWith = __commonJS({
    "node_modules/ramda/src/mergeWith.js"(exports, module) {
      var _curry32 = require_curry3();
      var mergeWithKey = require_mergeWithKey();
      var mergeWith = /* @__PURE__ */ _curry32(function mergeWith2(fn, l, r) {
        return mergeWithKey(function(_2, _l, _r) {
          return fn(_l, _r);
        }, l, r);
      });
      module.exports = mergeWith;
    }
  });

  // node_modules/ramda/src/min.js
  var require_min = __commonJS({
    "node_modules/ramda/src/min.js"(exports, module) {
      var _curry22 = require_curry2();
      var min = /* @__PURE__ */ _curry22(function min2(a, b) {
        return b < a ? b : a;
      });
      module.exports = min;
    }
  });

  // node_modules/ramda/src/minBy.js
  var require_minBy = __commonJS({
    "node_modules/ramda/src/minBy.js"(exports, module) {
      var _curry32 = require_curry3();
      var minBy = /* @__PURE__ */ _curry32(function minBy2(f, a, b) {
        return f(b) < f(a) ? b : a;
      });
      module.exports = minBy;
    }
  });

  // node_modules/ramda/src/internal/_modify.js
  var require_modify = __commonJS({
    "node_modules/ramda/src/internal/_modify.js"(exports, module) {
      var _isArray2 = require_isArray();
      var _isInteger2 = require_isInteger();
      function _modify2(prop, fn, obj) {
        if (_isInteger2(prop) && _isArray2(obj)) {
          var arr = [].concat(obj);
          arr[prop] = fn(arr[prop]);
          return arr;
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        result[prop] = fn(result[prop]);
        return result;
      }
      module.exports = _modify2;
    }
  });

  // node_modules/ramda/src/modifyPath.js
  var require_modifyPath = __commonJS({
    "node_modules/ramda/src/modifyPath.js"(exports, module) {
      var _curry32 = require_curry3();
      var _isArray2 = require_isArray();
      var _isObject2 = require_isObject();
      var _has2 = require_has();
      var _assoc2 = require_assoc();
      var _modify2 = require_modify();
      var modifyPath = /* @__PURE__ */ _curry32(function modifyPath2(path, fn, object) {
        if (!_isObject2(object) && !_isArray2(object) || path.length === 0) {
          return object;
        }
        var idx = path[0];
        if (!_has2(idx, object)) {
          return object;
        }
        if (path.length === 1) {
          return _modify2(idx, fn, object);
        }
        var val = modifyPath2(Array.prototype.slice.call(path, 1), fn, object[idx]);
        if (val === object[idx]) {
          return object;
        }
        return _assoc2(idx, val, object);
      });
      module.exports = modifyPath;
    }
  });

  // node_modules/ramda/src/modify.js
  var require_modify2 = __commonJS({
    "node_modules/ramda/src/modify.js"(exports, module) {
      var _curry32 = require_curry3();
      var modifyPath = require_modifyPath();
      var modify = /* @__PURE__ */ _curry32(function modify2(prop, fn, object) {
        return modifyPath([prop], fn, object);
      });
      module.exports = modify;
    }
  });

  // node_modules/ramda/src/modulo.js
  var require_modulo = __commonJS({
    "node_modules/ramda/src/modulo.js"(exports, module) {
      var _curry22 = require_curry2();
      var modulo = /* @__PURE__ */ _curry22(function modulo2(a, b) {
        return a % b;
      });
      module.exports = modulo;
    }
  });

  // node_modules/ramda/src/move.js
  var require_move = __commonJS({
    "node_modules/ramda/src/move.js"(exports, module) {
      var _curry32 = require_curry3();
      var move = /* @__PURE__ */ _curry32(function(from, to, list) {
        var length = list.length;
        var result = list.slice();
        var positiveFrom = from < 0 ? length + from : from;
        var positiveTo = to < 0 ? length + to : to;
        var item = result.splice(positiveFrom, 1);
        return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
      });
      module.exports = move;
    }
  });

  // node_modules/ramda/src/multiply.js
  var require_multiply = __commonJS({
    "node_modules/ramda/src/multiply.js"(exports, module) {
      var _curry22 = require_curry2();
      var multiply = /* @__PURE__ */ _curry22(function multiply2(a, b) {
        return a * b;
      });
      module.exports = multiply;
    }
  });

  // node_modules/ramda/src/partialObject.js
  var require_partialObject = __commonJS({
    "node_modules/ramda/src/partialObject.js"(exports, module) {
      var mergeDeepRight = require_mergeDeepRight();
      var _curry22 = require_curry2();
      module.exports = /* @__PURE__ */ _curry22((f, o) => (props) => f.call(exports, mergeDeepRight(o, props)));
    }
  });

  // node_modules/ramda/src/negate.js
  var require_negate = __commonJS({
    "node_modules/ramda/src/negate.js"(exports, module) {
      var _curry12 = require_curry1();
      var negate = /* @__PURE__ */ _curry12(function negate2(n) {
        return -n;
      });
      module.exports = negate;
    }
  });

  // node_modules/ramda/src/none.js
  var require_none = __commonJS({
    "node_modules/ramda/src/none.js"(exports, module) {
      var _complement2 = require_complement2();
      var _curry22 = require_curry2();
      var all = require_all();
      var none = /* @__PURE__ */ _curry22(function none2(fn, input) {
        return all(_complement2(fn), input);
      });
      module.exports = none;
    }
  });

  // node_modules/ramda/src/nthArg.js
  var require_nthArg = __commonJS({
    "node_modules/ramda/src/nthArg.js"(exports, module) {
      var _curry12 = require_curry1();
      var curryN = require_curryN2();
      var nth = require_nth();
      var nthArg = /* @__PURE__ */ _curry12(function nthArg2(n) {
        var arity = n < 0 ? 1 : n + 1;
        return curryN(arity, function() {
          return nth(n, arguments);
        });
      });
      module.exports = nthArg;
    }
  });

  // node_modules/ramda/src/o.js
  var require_o = __commonJS({
    "node_modules/ramda/src/o.js"(exports, module) {
      var _curry32 = require_curry3();
      var o = /* @__PURE__ */ _curry32(function o2(f, g, x) {
        return f(g(x));
      });
      module.exports = o;
    }
  });

  // node_modules/ramda/src/internal/_of.js
  var require_of = __commonJS({
    "node_modules/ramda/src/internal/_of.js"(exports, module) {
      function _of2(x) {
        return [x];
      }
      module.exports = _of2;
    }
  });

  // node_modules/ramda/src/of.js
  var require_of2 = __commonJS({
    "node_modules/ramda/src/of.js"(exports, module) {
      var _curry12 = require_curry1();
      var _of2 = require_of();
      var of2 = /* @__PURE__ */ _curry12(_of2);
      module.exports = of2;
    }
  });

  // node_modules/ramda/src/omit.js
  var require_omit = __commonJS({
    "node_modules/ramda/src/omit.js"(exports, module) {
      var _curry22 = require_curry2();
      var omit = /* @__PURE__ */ _curry22(function omit2(names, obj) {
        var result = {};
        var index = {};
        var idx = 0;
        var len = names.length;
        while (idx < len) {
          index[names[idx]] = 1;
          idx += 1;
        }
        for (var prop in obj) {
          if (!index.hasOwnProperty(prop)) {
            result[prop] = obj[prop];
          }
        }
        return result;
      });
      module.exports = omit;
    }
  });

  // node_modules/ramda/src/on.js
  var require_on = __commonJS({
    "node_modules/ramda/src/on.js"(exports, module) {
      var curryN = require_curryN();
      var on = /* @__PURE__ */ curryN(4, [], function on2(f, g, a, b) {
        return f(g(a), g(b));
      });
      module.exports = on;
    }
  });

  // node_modules/ramda/src/once.js
  var require_once = __commonJS({
    "node_modules/ramda/src/once.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry12 = require_curry1();
      var once = /* @__PURE__ */ _curry12(function once2(fn) {
        var called = false;
        var result;
        return _arity2(fn.length, function() {
          if (called) {
            return result;
          }
          called = true;
          result = fn.apply(this, arguments);
          return result;
        });
      });
      module.exports = once;
    }
  });

  // node_modules/ramda/src/internal/_assertPromise.js
  var require_assertPromise = __commonJS({
    "node_modules/ramda/src/internal/_assertPromise.js"(exports, module) {
      var _isFunction2 = require_isFunction();
      var _toString2 = require_toString();
      function _assertPromise2(name, p) {
        if (p == null || !_isFunction2(p.then)) {
          throw new TypeError("`" + name + "` expected a Promise, received " + _toString2(p, []));
        }
      }
      module.exports = _assertPromise2;
    }
  });

  // node_modules/ramda/src/otherwise.js
  var require_otherwise = __commonJS({
    "node_modules/ramda/src/otherwise.js"(exports, module) {
      var _curry22 = require_curry2();
      var _assertPromise2 = require_assertPromise();
      var otherwise = /* @__PURE__ */ _curry22(function otherwise2(f, p) {
        _assertPromise2("otherwise", p);
        return p.then(null, f);
      });
      module.exports = otherwise;
    }
  });

  // node_modules/ramda/src/over.js
  var require_over = __commonJS({
    "node_modules/ramda/src/over.js"(exports, module) {
      var _curry32 = require_curry3();
      var Identity = function(x) {
        return {
          value: x,
          map: function(f) {
            return Identity(f(x));
          }
        };
      };
      var over = /* @__PURE__ */ _curry32(function over2(lens, f, x) {
        return lens(function(y) {
          return Identity(f(y));
        })(x).value;
      });
      module.exports = over;
    }
  });

  // node_modules/ramda/src/pair.js
  var require_pair = __commonJS({
    "node_modules/ramda/src/pair.js"(exports, module) {
      var _curry22 = require_curry2();
      var pair = /* @__PURE__ */ _curry22(function pair2(fst, snd) {
        return [fst, snd];
      });
      module.exports = pair;
    }
  });

  // node_modules/ramda/src/internal/_createPartialApplicator.js
  var require_createPartialApplicator = __commonJS({
    "node_modules/ramda/src/internal/_createPartialApplicator.js"(exports, module) {
      var _arity2 = require_arity();
      var _curry22 = require_curry2();
      function _createPartialApplicator2(concat) {
        return _curry22(function(fn, args) {
          return _arity2(Math.max(0, fn.length - args.length), function() {
            return fn.apply(this, concat(args, arguments));
          });
        });
      }
      module.exports = _createPartialApplicator2;
    }
  });

  // node_modules/ramda/src/partial.js
  var require_partial = __commonJS({
    "node_modules/ramda/src/partial.js"(exports, module) {
      var _concat2 = require_concat();
      var _createPartialApplicator2 = require_createPartialApplicator();
      var partial = /* @__PURE__ */ _createPartialApplicator2(_concat2);
      module.exports = partial;
    }
  });

  // node_modules/ramda/src/partialRight.js
  var require_partialRight = __commonJS({
    "node_modules/ramda/src/partialRight.js"(exports, module) {
      var _concat2 = require_concat();
      var _createPartialApplicator2 = require_createPartialApplicator();
      var flip = require_flip();
      var partialRight = /* @__PURE__ */ _createPartialApplicator2(
        /* @__PURE__ */ flip(_concat2)
      );
      module.exports = partialRight;
    }
  });

  // node_modules/ramda/src/partition.js
  var require_partition = __commonJS({
    "node_modules/ramda/src/partition.js"(exports, module) {
      var filter = require_filter2();
      var juxt = require_juxt();
      var reject = require_reject();
      var partition = /* @__PURE__ */ juxt([filter, reject]);
      module.exports = partition;
    }
  });

  // node_modules/ramda/src/pathEq.js
  var require_pathEq = __commonJS({
    "node_modules/ramda/src/pathEq.js"(exports, module) {
      var _curry32 = require_curry3();
      var equals3 = require_equals2();
      var path = require_path();
      var pathEq = /* @__PURE__ */ _curry32(function pathEq2(_path, val, obj) {
        return equals3(path(_path, obj), val);
      });
      module.exports = pathEq;
    }
  });

  // node_modules/ramda/src/pathOr.js
  var require_pathOr = __commonJS({
    "node_modules/ramda/src/pathOr.js"(exports, module) {
      var _curry32 = require_curry3();
      var defaultTo = require_defaultTo();
      var path = require_path();
      var pathOr = /* @__PURE__ */ _curry32(function pathOr2(d, p, obj) {
        return defaultTo(d, path(p, obj));
      });
      module.exports = pathOr;
    }
  });

  // node_modules/ramda/src/pathSatisfies.js
  var require_pathSatisfies = __commonJS({
    "node_modules/ramda/src/pathSatisfies.js"(exports, module) {
      var _curry32 = require_curry3();
      var path = require_path();
      var pathSatisfies = /* @__PURE__ */ _curry32(function pathSatisfies2(pred, propPath, obj) {
        return pred(path(propPath, obj));
      });
      module.exports = pathSatisfies;
    }
  });

  // node_modules/ramda/src/pick.js
  var require_pick = __commonJS({
    "node_modules/ramda/src/pick.js"(exports, module) {
      var _curry22 = require_curry2();
      var pick = /* @__PURE__ */ _curry22(function pick2(names, obj) {
        var result = {};
        var idx = 0;
        while (idx < names.length) {
          if (names[idx] in obj) {
            result[names[idx]] = obj[names[idx]];
          }
          idx += 1;
        }
        return result;
      });
      module.exports = pick;
    }
  });

  // node_modules/ramda/src/pickAll.js
  var require_pickAll = __commonJS({
    "node_modules/ramda/src/pickAll.js"(exports, module) {
      var _curry22 = require_curry2();
      var pickAll3 = /* @__PURE__ */ _curry22(function pickAll4(names, obj) {
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
      module.exports = pickAll3;
    }
  });

  // node_modules/ramda/src/pickBy.js
  var require_pickBy = __commonJS({
    "node_modules/ramda/src/pickBy.js"(exports, module) {
      var _curry22 = require_curry2();
      var pickBy = /* @__PURE__ */ _curry22(function pickBy2(test, obj) {
        var result = {};
        for (var prop in obj) {
          if (test(obj[prop], prop, obj)) {
            result[prop] = obj[prop];
          }
        }
        return result;
      });
      module.exports = pickBy;
    }
  });

  // node_modules/ramda/src/prepend.js
  var require_prepend = __commonJS({
    "node_modules/ramda/src/prepend.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var prepend = /* @__PURE__ */ _curry22(function prepend2(el, list) {
        return _concat2([el], list);
      });
      module.exports = prepend;
    }
  });

  // node_modules/ramda/src/product.js
  var require_product = __commonJS({
    "node_modules/ramda/src/product.js"(exports, module) {
      var multiply = require_multiply();
      var reduce = require_reduce2();
      var product = /* @__PURE__ */ reduce(multiply, 1);
      module.exports = product;
    }
  });

  // node_modules/ramda/src/useWith.js
  var require_useWith = __commonJS({
    "node_modules/ramda/src/useWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var curryN = require_curryN2();
      var useWith = /* @__PURE__ */ _curry22(function useWith2(fn, transformers) {
        return curryN(transformers.length, function() {
          var args = [];
          var idx = 0;
          while (idx < transformers.length) {
            args.push(transformers[idx].call(this, arguments[idx]));
            idx += 1;
          }
          return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
        });
      });
      module.exports = useWith;
    }
  });

  // node_modules/ramda/src/project.js
  var require_project = __commonJS({
    "node_modules/ramda/src/project.js"(exports, module) {
      var _map2 = require_map();
      var identity = require_identity2();
      var pickAll3 = require_pickAll();
      var useWith = require_useWith();
      var project = /* @__PURE__ */ useWith(_map2, [pickAll3, identity]);
      module.exports = project;
    }
  });

  // node_modules/ramda/src/internal/_promap.js
  var require_promap = __commonJS({
    "node_modules/ramda/src/internal/_promap.js"(exports, module) {
      function _promap2(f, g, profunctor) {
        return function(x) {
          return g(profunctor(f(x)));
        };
      }
      module.exports = _promap2;
    }
  });

  // node_modules/ramda/src/internal/_xpromap.js
  var require_xpromap = __commonJS({
    "node_modules/ramda/src/internal/_xpromap.js"(exports, module) {
      var _curry32 = require_curry3();
      var _xfBase = require_xfBase();
      var _promap2 = require_promap();
      var XPromap = /* @__PURE__ */ function() {
        function XPromap2(f, g, xf) {
          this.xf = xf;
          this.f = f;
          this.g = g;
        }
        XPromap2.prototype["@@transducer/init"] = _xfBase.init;
        XPromap2.prototype["@@transducer/result"] = _xfBase.result;
        XPromap2.prototype["@@transducer/step"] = function(result, input) {
          return this.xf["@@transducer/step"](result, _promap2(this.f, this.g, input));
        };
        return XPromap2;
      }();
      var _xpromap = /* @__PURE__ */ _curry32(function _xpromap2(f, g, xf) {
        return new XPromap(f, g, xf);
      });
      module.exports = _xpromap;
    }
  });

  // node_modules/ramda/src/promap.js
  var require_promap2 = __commonJS({
    "node_modules/ramda/src/promap.js"(exports, module) {
      var _curry32 = require_curry3();
      var _dispatchable2 = require_dispatchable();
      var _promap2 = require_promap();
      var _xpromap = require_xpromap();
      var promap = /* @__PURE__ */ _curry32(
        /* @__PURE__ */ _dispatchable2(["fantasy-land/promap", "promap"], _xpromap, _promap2)
      );
      module.exports = promap;
    }
  });

  // node_modules/ramda/src/propEq.js
  var require_propEq = __commonJS({
    "node_modules/ramda/src/propEq.js"(exports, module) {
      var _curry32 = require_curry3();
      var prop = require_prop();
      var equals3 = require_equals2();
      var propEq = /* @__PURE__ */ _curry32(function propEq2(name, val, obj) {
        return equals3(val, prop(name, obj));
      });
      module.exports = propEq;
    }
  });

  // node_modules/ramda/src/propIs.js
  var require_propIs = __commonJS({
    "node_modules/ramda/src/propIs.js"(exports, module) {
      var _curry32 = require_curry3();
      var prop = require_prop();
      var is3 = require_is();
      var propIs = /* @__PURE__ */ _curry32(function propIs2(type3, name, obj) {
        return is3(type3, prop(name, obj));
      });
      module.exports = propIs;
    }
  });

  // node_modules/ramda/src/propOr.js
  var require_propOr = __commonJS({
    "node_modules/ramda/src/propOr.js"(exports, module) {
      var _curry32 = require_curry3();
      var defaultTo = require_defaultTo();
      var prop = require_prop();
      var propOr = /* @__PURE__ */ _curry32(function propOr2(val, p, obj) {
        return defaultTo(val, prop(p, obj));
      });
      module.exports = propOr;
    }
  });

  // node_modules/ramda/src/propSatisfies.js
  var require_propSatisfies = __commonJS({
    "node_modules/ramda/src/propSatisfies.js"(exports, module) {
      var _curry32 = require_curry3();
      var prop = require_prop();
      var propSatisfies = /* @__PURE__ */ _curry32(function propSatisfies2(pred, name, obj) {
        return pred(prop(name, obj));
      });
      module.exports = propSatisfies;
    }
  });

  // node_modules/ramda/src/props.js
  var require_props = __commonJS({
    "node_modules/ramda/src/props.js"(exports, module) {
      var _curry22 = require_curry2();
      var path = require_path();
      var props = /* @__PURE__ */ _curry22(function props2(ps, obj) {
        return ps.map(function(p) {
          return path([p], obj);
        });
      });
      module.exports = props;
    }
  });

  // node_modules/ramda/src/range.js
  var require_range = __commonJS({
    "node_modules/ramda/src/range.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isNumber2 = require_isNumber();
      var range = /* @__PURE__ */ _curry22(function range2(from, to) {
        if (!(_isNumber2(from) && _isNumber2(to))) {
          throw new TypeError("Both arguments to range must be numbers");
        }
        var result = [];
        var n = from;
        while (n < to) {
          result.push(n);
          n += 1;
        }
        return result;
      });
      module.exports = range;
    }
  });

  // node_modules/ramda/src/reduceRight.js
  var require_reduceRight = __commonJS({
    "node_modules/ramda/src/reduceRight.js"(exports, module) {
      var _curry32 = require_curry3();
      var reduceRight = /* @__PURE__ */ _curry32(function reduceRight2(fn, acc, list) {
        var idx = list.length - 1;
        while (idx >= 0) {
          acc = fn(list[idx], acc);
          if (acc && acc["@@transducer/reduced"]) {
            acc = acc["@@transducer/value"];
            break;
          }
          idx -= 1;
        }
        return acc;
      });
      module.exports = reduceRight;
    }
  });

  // node_modules/ramda/src/reduceWhile.js
  var require_reduceWhile = __commonJS({
    "node_modules/ramda/src/reduceWhile.js"(exports, module) {
      var _curryN2 = require_curryN();
      var _reduce2 = require_reduce();
      var _reduced2 = require_reduced();
      var reduceWhile = /* @__PURE__ */ _curryN2(4, [], function _reduceWhile(pred, fn, a, list) {
        return _reduce2(function(acc, x) {
          return pred(acc, x) ? fn(acc, x) : _reduced2(acc);
        }, a, list);
      });
      module.exports = reduceWhile;
    }
  });

  // node_modules/ramda/src/reduced.js
  var require_reduced2 = __commonJS({
    "node_modules/ramda/src/reduced.js"(exports, module) {
      var _curry12 = require_curry1();
      var _reduced2 = require_reduced();
      var reduced = /* @__PURE__ */ _curry12(_reduced2);
      module.exports = reduced;
    }
  });

  // node_modules/ramda/src/times.js
  var require_times = __commonJS({
    "node_modules/ramda/src/times.js"(exports, module) {
      var _curry22 = require_curry2();
      var times = /* @__PURE__ */ _curry22(function times2(fn, n) {
        var len = Number(n);
        var idx = 0;
        var list;
        if (len < 0 || isNaN(len)) {
          throw new RangeError("n must be a non-negative number");
        }
        list = new Array(len);
        while (idx < len) {
          list[idx] = fn(idx);
          idx += 1;
        }
        return list;
      });
      module.exports = times;
    }
  });

  // node_modules/ramda/src/repeat.js
  var require_repeat = __commonJS({
    "node_modules/ramda/src/repeat.js"(exports, module) {
      var _curry22 = require_curry2();
      var always = require_always();
      var times = require_times();
      var repeat = /* @__PURE__ */ _curry22(function repeat2(value, n) {
        return times(always(value), n);
      });
      module.exports = repeat;
    }
  });

  // node_modules/ramda/src/replace.js
  var require_replace = __commonJS({
    "node_modules/ramda/src/replace.js"(exports, module) {
      var _curry32 = require_curry3();
      var replace = /* @__PURE__ */ _curry32(function replace2(regex, replacement, str) {
        return str.replace(regex, replacement);
      });
      module.exports = replace;
    }
  });

  // node_modules/ramda/src/scan.js
  var require_scan = __commonJS({
    "node_modules/ramda/src/scan.js"(exports, module) {
      var _curry32 = require_curry3();
      var scan = /* @__PURE__ */ _curry32(function scan2(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [acc];
        while (idx < len) {
          acc = fn(acc, list[idx]);
          result[idx + 1] = acc;
          idx += 1;
        }
        return result;
      });
      module.exports = scan;
    }
  });

  // node_modules/ramda/src/sequence.js
  var require_sequence = __commonJS({
    "node_modules/ramda/src/sequence.js"(exports, module) {
      var _curry22 = require_curry2();
      var ap = require_ap();
      var map = require_map2();
      var prepend = require_prepend();
      var reduceRight = require_reduceRight();
      var sequence = /* @__PURE__ */ _curry22(function sequence2(of2, traversable) {
        return typeof traversable.sequence === "function" ? traversable.sequence(of2) : reduceRight(function(x, acc) {
          return ap(map(prepend, x), acc);
        }, of2([]), traversable);
      });
      module.exports = sequence;
    }
  });

  // node_modules/ramda/src/set.js
  var require_set = __commonJS({
    "node_modules/ramda/src/set.js"(exports, module) {
      var _curry32 = require_curry3();
      var always = require_always();
      var over = require_over();
      var set = /* @__PURE__ */ _curry32(function set2(lens, v, x) {
        return over(lens, always(v), x);
      });
      module.exports = set;
    }
  });

  // node_modules/ramda/src/sort.js
  var require_sort = __commonJS({
    "node_modules/ramda/src/sort.js"(exports, module) {
      var _curry22 = require_curry2();
      var sort = /* @__PURE__ */ _curry22(function sort2(comparator, list) {
        return Array.prototype.slice.call(list, 0).sort(comparator);
      });
      module.exports = sort;
    }
  });

  // node_modules/ramda/src/sortBy.js
  var require_sortBy = __commonJS({
    "node_modules/ramda/src/sortBy.js"(exports, module) {
      var _curry22 = require_curry2();
      var sortBy = /* @__PURE__ */ _curry22(function sortBy2(fn, list) {
        return Array.prototype.slice.call(list, 0).sort(function(a, b) {
          var aa = fn(a);
          var bb = fn(b);
          return aa < bb ? -1 : aa > bb ? 1 : 0;
        });
      });
      module.exports = sortBy;
    }
  });

  // node_modules/ramda/src/sortWith.js
  var require_sortWith = __commonJS({
    "node_modules/ramda/src/sortWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var sortWith = /* @__PURE__ */ _curry22(function sortWith2(fns, list) {
        return Array.prototype.slice.call(list, 0).sort(function(a, b) {
          var result = 0;
          var i = 0;
          while (result === 0 && i < fns.length) {
            result = fns[i](a, b);
            i += 1;
          }
          return result;
        });
      });
      module.exports = sortWith;
    }
  });

  // node_modules/ramda/src/split.js
  var require_split = __commonJS({
    "node_modules/ramda/src/split.js"(exports, module) {
      var invoker = require_invoker();
      var split = /* @__PURE__ */ invoker(1, "split");
      module.exports = split;
    }
  });

  // node_modules/ramda/src/splitAt.js
  var require_splitAt = __commonJS({
    "node_modules/ramda/src/splitAt.js"(exports, module) {
      var _curry22 = require_curry2();
      var length = require_length();
      var slice = require_slice();
      var splitAt = /* @__PURE__ */ _curry22(function splitAt2(index, array) {
        return [slice(0, index, array), slice(index, length(array), array)];
      });
      module.exports = splitAt;
    }
  });

  // node_modules/ramda/src/splitEvery.js
  var require_splitEvery = __commonJS({
    "node_modules/ramda/src/splitEvery.js"(exports, module) {
      var _curry22 = require_curry2();
      var slice = require_slice();
      var splitEvery = /* @__PURE__ */ _curry22(function splitEvery2(n, list) {
        if (n <= 0) {
          throw new Error("First argument to splitEvery must be a positive integer");
        }
        var result = [];
        var idx = 0;
        while (idx < list.length) {
          result.push(slice(idx, idx += n, list));
        }
        return result;
      });
      module.exports = splitEvery;
    }
  });

  // node_modules/ramda/src/splitWhen.js
  var require_splitWhen = __commonJS({
    "node_modules/ramda/src/splitWhen.js"(exports, module) {
      var _curry22 = require_curry2();
      var splitWhen = /* @__PURE__ */ _curry22(function splitWhen2(pred, list) {
        var idx = 0;
        var len = list.length;
        var prefix = [];
        while (idx < len && !pred(list[idx])) {
          prefix.push(list[idx]);
          idx += 1;
        }
        return [prefix, Array.prototype.slice.call(list, idx)];
      });
      module.exports = splitWhen;
    }
  });

  // node_modules/ramda/src/splitWhenever.js
  var require_splitWhenever = __commonJS({
    "node_modules/ramda/src/splitWhenever.js"(exports, module) {
      var _curryN2 = require_curryN();
      var splitWhenever = /* @__PURE__ */ _curryN2(2, [], function splitWhenever2(pred, list) {
        var acc = [];
        var curr = [];
        for (var i = 0; i < list.length; i = i + 1) {
          if (!pred(list[i])) {
            curr.push(list[i]);
          }
          if ((i < list.length - 1 && pred(list[i + 1]) || i === list.length - 1) && curr.length > 0) {
            acc.push(curr);
            curr = [];
          }
        }
        return acc;
      });
      module.exports = splitWhenever;
    }
  });

  // node_modules/ramda/src/startsWith.js
  var require_startsWith = __commonJS({
    "node_modules/ramda/src/startsWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var equals3 = require_equals2();
      var take = require_take();
      var startsWith = /* @__PURE__ */ _curry22(function(prefix, list) {
        return equals3(take(prefix.length, list), prefix);
      });
      module.exports = startsWith;
    }
  });

  // node_modules/ramda/src/subtract.js
  var require_subtract = __commonJS({
    "node_modules/ramda/src/subtract.js"(exports, module) {
      var _curry22 = require_curry2();
      var subtract = /* @__PURE__ */ _curry22(function subtract2(a, b) {
        return Number(a) - Number(b);
      });
      module.exports = subtract;
    }
  });

  // node_modules/ramda/src/symmetricDifference.js
  var require_symmetricDifference = __commonJS({
    "node_modules/ramda/src/symmetricDifference.js"(exports, module) {
      var _curry22 = require_curry2();
      var concat = require_concat2();
      var difference = require_difference();
      var symmetricDifference = /* @__PURE__ */ _curry22(function symmetricDifference2(list1, list2) {
        return concat(difference(list1, list2), difference(list2, list1));
      });
      module.exports = symmetricDifference;
    }
  });

  // node_modules/ramda/src/symmetricDifferenceWith.js
  var require_symmetricDifferenceWith = __commonJS({
    "node_modules/ramda/src/symmetricDifferenceWith.js"(exports, module) {
      var _curry32 = require_curry3();
      var concat = require_concat2();
      var differenceWith = require_differenceWith();
      var symmetricDifferenceWith = /* @__PURE__ */ _curry32(function symmetricDifferenceWith2(pred, list1, list2) {
        return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
      });
      module.exports = symmetricDifferenceWith;
    }
  });

  // node_modules/ramda/src/takeLastWhile.js
  var require_takeLastWhile = __commonJS({
    "node_modules/ramda/src/takeLastWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var slice = require_slice();
      var takeLastWhile = /* @__PURE__ */ _curry22(function takeLastWhile2(fn, xs) {
        var idx = xs.length - 1;
        while (idx >= 0 && fn(xs[idx])) {
          idx -= 1;
        }
        return slice(idx + 1, Infinity, xs);
      });
      module.exports = takeLastWhile;
    }
  });

  // node_modules/ramda/src/internal/_xtakeWhile.js
  var require_xtakeWhile = __commonJS({
    "node_modules/ramda/src/internal/_xtakeWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _reduced2 = require_reduced();
      var _xfBase = require_xfBase();
      var XTakeWhile = /* @__PURE__ */ function() {
        function XTakeWhile2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XTakeWhile2.prototype["@@transducer/init"] = _xfBase.init;
        XTakeWhile2.prototype["@@transducer/result"] = _xfBase.result;
        XTakeWhile2.prototype["@@transducer/step"] = function(result, input) {
          return this.f(input) ? this.xf["@@transducer/step"](result, input) : _reduced2(result);
        };
        return XTakeWhile2;
      }();
      var _xtakeWhile = /* @__PURE__ */ _curry22(function _xtakeWhile2(f, xf) {
        return new XTakeWhile(f, xf);
      });
      module.exports = _xtakeWhile;
    }
  });

  // node_modules/ramda/src/takeWhile.js
  var require_takeWhile = __commonJS({
    "node_modules/ramda/src/takeWhile.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xtakeWhile = require_xtakeWhile();
      var slice = require_slice();
      var takeWhile = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2(["takeWhile"], _xtakeWhile, function takeWhile2(fn, xs) {
          var idx = 0;
          var len = xs.length;
          while (idx < len && fn(xs[idx])) {
            idx += 1;
          }
          return slice(0, idx, xs);
        })
      );
      module.exports = takeWhile;
    }
  });

  // node_modules/ramda/src/internal/_xtap.js
  var require_xtap = __commonJS({
    "node_modules/ramda/src/internal/_xtap.js"(exports, module) {
      var _curry22 = require_curry2();
      var _xfBase = require_xfBase();
      var XTap = /* @__PURE__ */ function() {
        function XTap2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XTap2.prototype["@@transducer/init"] = _xfBase.init;
        XTap2.prototype["@@transducer/result"] = _xfBase.result;
        XTap2.prototype["@@transducer/step"] = function(result, input) {
          this.f(input);
          return this.xf["@@transducer/step"](result, input);
        };
        return XTap2;
      }();
      var _xtap = /* @__PURE__ */ _curry22(function _xtap2(f, xf) {
        return new XTap(f, xf);
      });
      module.exports = _xtap;
    }
  });

  // node_modules/ramda/src/tap.js
  var require_tap = __commonJS({
    "node_modules/ramda/src/tap.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _xtap = require_xtap();
      var tap = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xtap, function tap2(fn, x) {
          fn(x);
          return x;
        })
      );
      module.exports = tap;
    }
  });

  // node_modules/ramda/src/internal/_isRegExp.js
  var require_isRegExp = __commonJS({
    "node_modules/ramda/src/internal/_isRegExp.js"(exports, module) {
      function _isRegExp2(x) {
        return Object.prototype.toString.call(x) === "[object RegExp]";
      }
      module.exports = _isRegExp2;
    }
  });

  // node_modules/ramda/src/test.js
  var require_test = __commonJS({
    "node_modules/ramda/src/test.js"(exports, module) {
      var _cloneRegExp2 = require_cloneRegExp();
      var _curry22 = require_curry2();
      var _isRegExp2 = require_isRegExp();
      var toString3 = require_toString2();
      var test = /* @__PURE__ */ _curry22(function test2(pattern, str) {
        if (!_isRegExp2(pattern)) {
          throw new TypeError("\u2018test\u2019 requires a value of type RegExp as its first argument; received " + toString3(pattern));
        }
        return _cloneRegExp2(pattern).test(str);
      });
      module.exports = test;
    }
  });

  // node_modules/ramda/src/andThen.js
  var require_andThen = __commonJS({
    "node_modules/ramda/src/andThen.js"(exports, module) {
      var _curry22 = require_curry2();
      var _assertPromise2 = require_assertPromise();
      var andThen = /* @__PURE__ */ _curry22(function andThen2(f, p) {
        _assertPromise2("andThen", p);
        return p.then(f);
      });
      module.exports = andThen;
    }
  });

  // node_modules/ramda/src/toLower.js
  var require_toLower = __commonJS({
    "node_modules/ramda/src/toLower.js"(exports, module) {
      var invoker = require_invoker();
      var toLower = /* @__PURE__ */ invoker(0, "toLowerCase");
      module.exports = toLower;
    }
  });

  // node_modules/ramda/src/toPairs.js
  var require_toPairs = __commonJS({
    "node_modules/ramda/src/toPairs.js"(exports, module) {
      var _curry12 = require_curry1();
      var _has2 = require_has();
      var toPairs = /* @__PURE__ */ _curry12(function toPairs2(obj) {
        var pairs = [];
        for (var prop in obj) {
          if (_has2(prop, obj)) {
            pairs[pairs.length] = [prop, obj[prop]];
          }
        }
        return pairs;
      });
      module.exports = toPairs;
    }
  });

  // node_modules/ramda/src/toPairsIn.js
  var require_toPairsIn = __commonJS({
    "node_modules/ramda/src/toPairsIn.js"(exports, module) {
      var _curry12 = require_curry1();
      var toPairsIn = /* @__PURE__ */ _curry12(function toPairsIn2(obj) {
        var pairs = [];
        for (var prop in obj) {
          pairs[pairs.length] = [prop, obj[prop]];
        }
        return pairs;
      });
      module.exports = toPairsIn;
    }
  });

  // node_modules/ramda/src/toUpper.js
  var require_toUpper = __commonJS({
    "node_modules/ramda/src/toUpper.js"(exports, module) {
      var invoker = require_invoker();
      var toUpper = /* @__PURE__ */ invoker(0, "toUpperCase");
      module.exports = toUpper;
    }
  });

  // node_modules/ramda/src/transduce.js
  var require_transduce = __commonJS({
    "node_modules/ramda/src/transduce.js"(exports, module) {
      var _reduce2 = require_reduce();
      var _xwrap2 = require_xwrap();
      var curryN = require_curryN2();
      var transduce = /* @__PURE__ */ curryN(4, function transduce2(xf, fn, acc, list) {
        return _reduce2(xf(typeof fn === "function" ? _xwrap2(fn) : fn), acc, list);
      });
      module.exports = transduce;
    }
  });

  // node_modules/ramda/src/transpose.js
  var require_transpose = __commonJS({
    "node_modules/ramda/src/transpose.js"(exports, module) {
      var _curry12 = require_curry1();
      var transpose = /* @__PURE__ */ _curry12(function transpose2(outerlist) {
        var i = 0;
        var result = [];
        while (i < outerlist.length) {
          var innerlist = outerlist[i];
          var j = 0;
          while (j < innerlist.length) {
            if (typeof result[j] === "undefined") {
              result[j] = [];
            }
            result[j].push(innerlist[j]);
            j += 1;
          }
          i += 1;
        }
        return result;
      });
      module.exports = transpose;
    }
  });

  // node_modules/ramda/src/traverse.js
  var require_traverse = __commonJS({
    "node_modules/ramda/src/traverse.js"(exports, module) {
      var _curry32 = require_curry3();
      var map = require_map2();
      var sequence = require_sequence();
      var traverse = /* @__PURE__ */ _curry32(function traverse2(of2, f, traversable) {
        return typeof traversable["fantasy-land/traverse"] === "function" ? traversable["fantasy-land/traverse"](f, of2) : typeof traversable.traverse === "function" ? traversable.traverse(f, of2) : sequence(of2, map(f, traversable));
      });
      module.exports = traverse;
    }
  });

  // node_modules/ramda/src/trim.js
  var require_trim = __commonJS({
    "node_modules/ramda/src/trim.js"(exports, module) {
      var _curry12 = require_curry1();
      var ws = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
      var zeroWidth = "\u200B";
      var hasProtoTrim2 = typeof String.prototype.trim === "function";
      var trim = !hasProtoTrim2 || /* @__PURE__ */ ws.trim() || !/* @__PURE__ */ zeroWidth.trim() ? /* @__PURE__ */ _curry12(function trim2(str) {
        var beginRx = new RegExp("^[" + ws + "][" + ws + "]*");
        var endRx = new RegExp("[" + ws + "][" + ws + "]*$");
        return str.replace(beginRx, "").replace(endRx, "");
      }) : /* @__PURE__ */ _curry12(function trim2(str) {
        return str.trim();
      });
      module.exports = trim;
    }
  });

  // node_modules/ramda/src/tryCatch.js
  var require_tryCatch = __commonJS({
    "node_modules/ramda/src/tryCatch.js"(exports, module) {
      var _arity2 = require_arity();
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var tryCatch = /* @__PURE__ */ _curry22(function _tryCatch(tryer, catcher) {
        return _arity2(tryer.length, function() {
          try {
            return tryer.apply(this, arguments);
          } catch (e2) {
            return catcher.apply(this, _concat2([e2], arguments));
          }
        });
      });
      module.exports = tryCatch;
    }
  });

  // node_modules/ramda/src/unapply.js
  var require_unapply = __commonJS({
    "node_modules/ramda/src/unapply.js"(exports, module) {
      var _curry12 = require_curry1();
      var unapply = /* @__PURE__ */ _curry12(function unapply2(fn) {
        return function() {
          return fn(Array.prototype.slice.call(arguments, 0));
        };
      });
      module.exports = unapply;
    }
  });

  // node_modules/ramda/src/unary.js
  var require_unary = __commonJS({
    "node_modules/ramda/src/unary.js"(exports, module) {
      var _curry12 = require_curry1();
      var nAry = require_nAry();
      var unary = /* @__PURE__ */ _curry12(function unary2(fn) {
        return nAry(1, fn);
      });
      module.exports = unary;
    }
  });

  // node_modules/ramda/src/uncurryN.js
  var require_uncurryN = __commonJS({
    "node_modules/ramda/src/uncurryN.js"(exports, module) {
      var _curry22 = require_curry2();
      var curryN = require_curryN2();
      var uncurryN = /* @__PURE__ */ _curry22(function uncurryN2(depth, fn) {
        return curryN(depth, function() {
          var currentDepth = 1;
          var value = fn;
          var idx = 0;
          var endIdx;
          while (currentDepth <= depth && typeof value === "function") {
            endIdx = currentDepth === depth ? arguments.length : idx + value.length;
            value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
            currentDepth += 1;
            idx = endIdx;
          }
          return value;
        });
      });
      module.exports = uncurryN;
    }
  });

  // node_modules/ramda/src/unfold.js
  var require_unfold = __commonJS({
    "node_modules/ramda/src/unfold.js"(exports, module) {
      var _curry22 = require_curry2();
      var unfold = /* @__PURE__ */ _curry22(function unfold2(fn, seed) {
        var pair = fn(seed);
        var result = [];
        while (pair && pair.length) {
          result[result.length] = pair[0];
          pair = fn(pair[1]);
        }
        return result;
      });
      module.exports = unfold;
    }
  });

  // node_modules/ramda/src/union.js
  var require_union = __commonJS({
    "node_modules/ramda/src/union.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry22 = require_curry2();
      var compose2 = require_compose();
      var uniq = require_uniq();
      var union = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ compose2(uniq, _concat2)
      );
      module.exports = union;
    }
  });

  // node_modules/ramda/src/internal/_xuniqWith.js
  var require_xuniqWith = __commonJS({
    "node_modules/ramda/src/internal/_xuniqWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var _includesWith2 = require_includesWith();
      var _xfBase = require_xfBase();
      var XUniqWith = /* @__PURE__ */ function() {
        function XUniqWith2(pred, xf) {
          this.xf = xf;
          this.pred = pred;
          this.items = [];
        }
        XUniqWith2.prototype["@@transducer/init"] = _xfBase.init;
        XUniqWith2.prototype["@@transducer/result"] = _xfBase.result;
        XUniqWith2.prototype["@@transducer/step"] = function(result, input) {
          if (_includesWith2(this.pred, input, this.items)) {
            return result;
          } else {
            this.items.push(input);
            return this.xf["@@transducer/step"](result, input);
          }
        };
        return XUniqWith2;
      }();
      var _xuniqWith = /* @__PURE__ */ _curry22(function _xuniqWith2(pred, xf) {
        return new XUniqWith(pred, xf);
      });
      module.exports = _xuniqWith;
    }
  });

  // node_modules/ramda/src/uniqWith.js
  var require_uniqWith = __commonJS({
    "node_modules/ramda/src/uniqWith.js"(exports, module) {
      var _curry22 = require_curry2();
      var _dispatchable2 = require_dispatchable();
      var _includesWith2 = require_includesWith();
      var _xuniqWith = require_xuniqWith();
      var uniqWith = /* @__PURE__ */ _curry22(
        /* @__PURE__ */ _dispatchable2([], _xuniqWith, function(pred, list) {
          var idx = 0;
          var len = list.length;
          var result = [];
          var item;
          while (idx < len) {
            item = list[idx];
            if (!_includesWith2(pred, item, result)) {
              result[result.length] = item;
            }
            idx += 1;
          }
          return result;
        })
      );
      module.exports = uniqWith;
    }
  });

  // node_modules/ramda/src/unionWith.js
  var require_unionWith = __commonJS({
    "node_modules/ramda/src/unionWith.js"(exports, module) {
      var _concat2 = require_concat();
      var _curry32 = require_curry3();
      var uniqWith = require_uniqWith();
      var unionWith = /* @__PURE__ */ _curry32(function unionWith2(pred, list1, list2) {
        return uniqWith(pred, _concat2(list1, list2));
      });
      module.exports = unionWith;
    }
  });

  // node_modules/ramda/src/unless.js
  var require_unless = __commonJS({
    "node_modules/ramda/src/unless.js"(exports, module) {
      var _curry32 = require_curry3();
      var unless = /* @__PURE__ */ _curry32(function unless2(pred, whenFalseFn, x) {
        return pred(x) ? x : whenFalseFn(x);
      });
      module.exports = unless;
    }
  });

  // node_modules/ramda/src/unnest.js
  var require_unnest = __commonJS({
    "node_modules/ramda/src/unnest.js"(exports, module) {
      var _identity2 = require_identity();
      var chain = require_chain();
      var unnest = /* @__PURE__ */ chain(_identity2);
      module.exports = unnest;
    }
  });

  // node_modules/ramda/src/until.js
  var require_until = __commonJS({
    "node_modules/ramda/src/until.js"(exports, module) {
      var _curry32 = require_curry3();
      var until = /* @__PURE__ */ _curry32(function until2(pred, fn, init) {
        var val = init;
        while (!pred(val)) {
          val = fn(val);
        }
        return val;
      });
      module.exports = until;
    }
  });

  // node_modules/ramda/src/unwind.js
  var require_unwind = __commonJS({
    "node_modules/ramda/src/unwind.js"(exports, module) {
      var _curry22 = require_curry2();
      var _isArray2 = require_isArray();
      var _map2 = require_map();
      var _assoc2 = require_assoc();
      var unwind = /* @__PURE__ */ _curry22(function(key, object) {
        if (!(key in object && _isArray2(object[key]))) {
          return [object];
        }
        return _map2(function(item) {
          return _assoc2(key, item, object);
        }, object[key]);
      });
      module.exports = unwind;
    }
  });

  // node_modules/ramda/src/valuesIn.js
  var require_valuesIn = __commonJS({
    "node_modules/ramda/src/valuesIn.js"(exports, module) {
      var _curry12 = require_curry1();
      var valuesIn = /* @__PURE__ */ _curry12(function valuesIn2(obj) {
        var prop;
        var vs = [];
        for (prop in obj) {
          vs[vs.length] = obj[prop];
        }
        return vs;
      });
      module.exports = valuesIn;
    }
  });

  // node_modules/ramda/src/view.js
  var require_view = __commonJS({
    "node_modules/ramda/src/view.js"(exports, module) {
      var _curry22 = require_curry2();
      var Const = function(x) {
        return {
          value: x,
          "fantasy-land/map": function() {
            return this;
          }
        };
      };
      var view = /* @__PURE__ */ _curry22(function view2(lens, x) {
        return lens(Const)(x).value;
      });
      module.exports = view;
    }
  });

  // node_modules/ramda/src/when.js
  var require_when = __commonJS({
    "node_modules/ramda/src/when.js"(exports, module) {
      var _curry32 = require_curry3();
      var when = /* @__PURE__ */ _curry32(function when2(pred, whenTrueFn, x) {
        return pred(x) ? whenTrueFn(x) : x;
      });
      module.exports = when;
    }
  });

  // node_modules/ramda/src/where.js
  var require_where = __commonJS({
    "node_modules/ramda/src/where.js"(exports, module) {
      var _curry22 = require_curry2();
      var _has2 = require_has();
      var where = /* @__PURE__ */ _curry22(function where2(spec, testObj) {
        for (var prop in spec) {
          if (_has2(prop, spec) && !spec[prop](testObj[prop])) {
            return false;
          }
        }
        return true;
      });
      module.exports = where;
    }
  });

  // node_modules/ramda/src/whereAny.js
  var require_whereAny = __commonJS({
    "node_modules/ramda/src/whereAny.js"(exports, module) {
      var _curry22 = require_curry2();
      var _has2 = require_has();
      var whereAny = /* @__PURE__ */ _curry22(function whereAny2(spec, testObj) {
        for (var prop in spec) {
          if (_has2(prop, spec) && spec[prop](testObj[prop])) {
            return true;
          }
        }
        return false;
      });
      module.exports = whereAny;
    }
  });

  // node_modules/ramda/src/whereEq.js
  var require_whereEq = __commonJS({
    "node_modules/ramda/src/whereEq.js"(exports, module) {
      var _curry22 = require_curry2();
      var equals3 = require_equals2();
      var map = require_map2();
      var where = require_where();
      var whereEq = /* @__PURE__ */ _curry22(function whereEq2(spec, testObj) {
        return where(map(equals3, spec), testObj);
      });
      module.exports = whereEq;
    }
  });

  // node_modules/ramda/src/without.js
  var require_without = __commonJS({
    "node_modules/ramda/src/without.js"(exports, module) {
      var _includes2 = require_includes();
      var _curry22 = require_curry2();
      var flip = require_flip();
      var reject = require_reject();
      var without = /* @__PURE__ */ _curry22(function(xs, list) {
        return reject(flip(_includes2)(xs), list);
      });
      module.exports = without;
    }
  });

  // node_modules/ramda/src/xor.js
  var require_xor = __commonJS({
    "node_modules/ramda/src/xor.js"(exports, module) {
      var _curry22 = require_curry2();
      var xor = /* @__PURE__ */ _curry22(function xor2(a, b) {
        return Boolean(!a ^ !b);
      });
      module.exports = xor;
    }
  });

  // node_modules/ramda/src/xprod.js
  var require_xprod = __commonJS({
    "node_modules/ramda/src/xprod.js"(exports, module) {
      var _curry22 = require_curry2();
      var xprod = /* @__PURE__ */ _curry22(function xprod2(a, b) {
        var idx = 0;
        var ilen = a.length;
        var j;
        var jlen = b.length;
        var result = [];
        while (idx < ilen) {
          j = 0;
          while (j < jlen) {
            result[result.length] = [a[idx], b[j]];
            j += 1;
          }
          idx += 1;
        }
        return result;
      });
      module.exports = xprod;
    }
  });

  // node_modules/ramda/src/zip.js
  var require_zip = __commonJS({
    "node_modules/ramda/src/zip.js"(exports, module) {
      var _curry22 = require_curry2();
      var zip = /* @__PURE__ */ _curry22(function zip2(a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while (idx < len) {
          rv[idx] = [a[idx], b[idx]];
          idx += 1;
        }
        return rv;
      });
      module.exports = zip;
    }
  });

  // node_modules/ramda/src/zipObj.js
  var require_zipObj = __commonJS({
    "node_modules/ramda/src/zipObj.js"(exports, module) {
      var _curry22 = require_curry2();
      var zipObj = /* @__PURE__ */ _curry22(function zipObj2(keys4, values) {
        var idx = 0;
        var len = Math.min(keys4.length, values.length);
        var out = {};
        while (idx < len) {
          out[keys4[idx]] = values[idx];
          idx += 1;
        }
        return out;
      });
      module.exports = zipObj;
    }
  });

  // node_modules/ramda/src/zipWith.js
  var require_zipWith = __commonJS({
    "node_modules/ramda/src/zipWith.js"(exports, module) {
      var _curry32 = require_curry3();
      var zipWith = /* @__PURE__ */ _curry32(function zipWith2(fn, a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while (idx < len) {
          rv[idx] = fn(a[idx], b[idx]);
          idx += 1;
        }
        return rv;
      });
      module.exports = zipWith;
    }
  });

  // node_modules/ramda/src/thunkify.js
  var require_thunkify = __commonJS({
    "node_modules/ramda/src/thunkify.js"(exports, module) {
      var curryN = require_curryN2();
      var _curry12 = require_curry1();
      var thunkify = /* @__PURE__ */ _curry12(function thunkify2(fn) {
        return curryN(fn.length, function createThunk() {
          var fnArgs = arguments;
          return function invokeThunk() {
            return fn.apply(this, fnArgs);
          };
        });
      });
      module.exports = thunkify;
    }
  });

  // node_modules/ramda/src/index.js
  var require_src2 = __commonJS({
    "node_modules/ramda/src/index.js"(exports, module) {
      module.exports = {};
      module.exports.F = require_F();
      module.exports.T = require_T();
      module.exports.__ = require__();
      module.exports.add = require_add();
      module.exports.addIndex = require_addIndex();
      module.exports.adjust = require_adjust();
      module.exports.all = require_all();
      module.exports.allPass = require_allPass();
      module.exports.always = require_always();
      module.exports.and = require_and();
      module.exports.any = require_any();
      module.exports.anyPass = require_anyPass();
      module.exports.ap = require_ap();
      module.exports.aperture = require_aperture2();
      module.exports.append = require_append();
      module.exports.apply = require_apply();
      module.exports.applySpec = require_applySpec();
      module.exports.applyTo = require_applyTo();
      module.exports.ascend = require_ascend();
      module.exports.assoc = require_assoc2();
      module.exports.assocPath = require_assocPath();
      module.exports.binary = require_binary();
      module.exports.bind = require_bind();
      module.exports.both = require_both();
      module.exports.call = require_call();
      module.exports.chain = require_chain();
      module.exports.clamp = require_clamp();
      module.exports.clone = require_clone2();
      module.exports.collectBy = require_collectBy();
      module.exports.comparator = require_comparator();
      module.exports.complement = require_complement();
      module.exports.compose = require_compose();
      module.exports.composeWith = require_composeWith();
      module.exports.concat = require_concat2();
      module.exports.cond = require_cond();
      module.exports.construct = require_construct();
      module.exports.constructN = require_constructN();
      module.exports.converge = require_converge();
      module.exports.count = require_count();
      module.exports.countBy = require_countBy();
      module.exports.curry = require_curry();
      module.exports.curryN = require_curryN2();
      module.exports.dec = require_dec();
      module.exports.defaultTo = require_defaultTo();
      module.exports.descend = require_descend();
      module.exports.difference = require_difference();
      module.exports.differenceWith = require_differenceWith();
      module.exports.dissoc = require_dissoc2();
      module.exports.dissocPath = require_dissocPath();
      module.exports.divide = require_divide();
      module.exports.drop = require_drop();
      module.exports.dropLast = require_dropLast2();
      module.exports.dropLastWhile = require_dropLastWhile2();
      module.exports.dropRepeats = require_dropRepeats();
      module.exports.dropRepeatsWith = require_dropRepeatsWith();
      module.exports.dropWhile = require_dropWhile();
      module.exports.either = require_either();
      module.exports.empty = require_empty();
      module.exports.endsWith = require_endsWith();
      module.exports.eqBy = require_eqBy();
      module.exports.eqProps = require_eqProps();
      module.exports.equals = require_equals2();
      module.exports.evolve = require_evolve();
      module.exports.filter = require_filter2();
      module.exports.find = require_find();
      module.exports.findIndex = require_findIndex();
      module.exports.findLast = require_findLast();
      module.exports.findLastIndex = require_findLastIndex();
      module.exports.flatten = require_flatten();
      module.exports.flip = require_flip();
      module.exports.forEach = require_forEach();
      module.exports.forEachObjIndexed = require_forEachObjIndexed();
      module.exports.fromPairs = require_fromPairs();
      module.exports.groupBy = require_groupBy();
      module.exports.groupWith = require_groupWith();
      module.exports.gt = require_gt();
      module.exports.gte = require_gte();
      module.exports.has = require_has2();
      module.exports.hasIn = require_hasIn();
      module.exports.hasPath = require_hasPath();
      module.exports.head = require_head();
      module.exports.identical = require_identical();
      module.exports.identity = require_identity2();
      module.exports.ifElse = require_ifElse();
      module.exports.inc = require_inc();
      module.exports.includes = require_includes2();
      module.exports.indexBy = require_indexBy();
      module.exports.indexOf = require_indexOf2();
      module.exports.init = require_init();
      module.exports.innerJoin = require_innerJoin();
      module.exports.insert = require_insert();
      module.exports.insertAll = require_insertAll();
      module.exports.intersection = require_intersection();
      module.exports.intersperse = require_intersperse();
      module.exports.into = require_into();
      module.exports.invert = require_invert();
      module.exports.invertObj = require_invertObj();
      module.exports.invoker = require_invoker();
      module.exports.is = require_is();
      module.exports.isEmpty = require_isEmpty();
      module.exports.isNil = require_isNil();
      module.exports.join = require_join();
      module.exports.juxt = require_juxt();
      module.exports.keys = require_keys();
      module.exports.keysIn = require_keysIn();
      module.exports.last = require_last();
      module.exports.lastIndexOf = require_lastIndexOf();
      module.exports.length = require_length();
      module.exports.lens = require_lens();
      module.exports.lensIndex = require_lensIndex();
      module.exports.lensPath = require_lensPath();
      module.exports.lensProp = require_lensProp();
      module.exports.lift = require_lift();
      module.exports.liftN = require_liftN();
      module.exports.lt = require_lt();
      module.exports.lte = require_lte();
      module.exports.map = require_map2();
      module.exports.mapAccum = require_mapAccum();
      module.exports.mapAccumRight = require_mapAccumRight();
      module.exports.mapObjIndexed = require_mapObjIndexed();
      module.exports.match = require_match();
      module.exports.mathMod = require_mathMod();
      module.exports.max = require_max();
      module.exports.maxBy = require_maxBy();
      module.exports.mean = require_mean();
      module.exports.median = require_median();
      module.exports.memoizeWith = require_memoizeWith();
      module.exports.mergeAll = require_mergeAll();
      module.exports.mergeDeepLeft = require_mergeDeepLeft();
      module.exports.mergeDeepRight = require_mergeDeepRight();
      module.exports.mergeDeepWith = require_mergeDeepWith();
      module.exports.mergeDeepWithKey = require_mergeDeepWithKey();
      module.exports.mergeLeft = require_mergeLeft();
      module.exports.mergeRight = require_mergeRight();
      module.exports.mergeWith = require_mergeWith();
      module.exports.mergeWithKey = require_mergeWithKey();
      module.exports.min = require_min();
      module.exports.minBy = require_minBy();
      module.exports.modify = require_modify2();
      module.exports.modifyPath = require_modifyPath();
      module.exports.modulo = require_modulo();
      module.exports.move = require_move();
      module.exports.multiply = require_multiply();
      module.exports.nAry = require_nAry();
      module.exports.partialObject = require_partialObject();
      module.exports.negate = require_negate();
      module.exports.none = require_none();
      module.exports.not = require_not();
      module.exports.nth = require_nth();
      module.exports.nthArg = require_nthArg();
      module.exports.o = require_o();
      module.exports.objOf = require_objOf();
      module.exports.of = require_of2();
      module.exports.omit = require_omit();
      module.exports.on = require_on();
      module.exports.once = require_once();
      module.exports.or = require_or();
      module.exports.otherwise = require_otherwise();
      module.exports.over = require_over();
      module.exports.pair = require_pair();
      module.exports.partial = require_partial();
      module.exports.partialRight = require_partialRight();
      module.exports.partition = require_partition();
      module.exports.path = require_path();
      module.exports.paths = require_paths();
      module.exports.pathEq = require_pathEq();
      module.exports.pathOr = require_pathOr();
      module.exports.pathSatisfies = require_pathSatisfies();
      module.exports.pick = require_pick();
      module.exports.pickAll = require_pickAll();
      module.exports.pickBy = require_pickBy();
      module.exports.pipe = require_pipe2();
      module.exports.pipeWith = require_pipeWith();
      module.exports.pluck = require_pluck();
      module.exports.prepend = require_prepend();
      module.exports.product = require_product();
      module.exports.project = require_project();
      module.exports.promap = require_promap2();
      module.exports.prop = require_prop();
      module.exports.propEq = require_propEq();
      module.exports.propIs = require_propIs();
      module.exports.propOr = require_propOr();
      module.exports.propSatisfies = require_propSatisfies();
      module.exports.props = require_props();
      module.exports.range = require_range();
      module.exports.reduce = require_reduce2();
      module.exports.reduceBy = require_reduceBy();
      module.exports.reduceRight = require_reduceRight();
      module.exports.reduceWhile = require_reduceWhile();
      module.exports.reduced = require_reduced2();
      module.exports.reject = require_reject();
      module.exports.remove = require_remove();
      module.exports.repeat = require_repeat();
      module.exports.replace = require_replace();
      module.exports.reverse = require_reverse();
      module.exports.scan = require_scan();
      module.exports.sequence = require_sequence();
      module.exports.set = require_set();
      module.exports.slice = require_slice();
      module.exports.sort = require_sort();
      module.exports.sortBy = require_sortBy();
      module.exports.sortWith = require_sortWith();
      module.exports.split = require_split();
      module.exports.splitAt = require_splitAt();
      module.exports.splitEvery = require_splitEvery();
      module.exports.splitWhen = require_splitWhen();
      module.exports.splitWhenever = require_splitWhenever();
      module.exports.startsWith = require_startsWith();
      module.exports.subtract = require_subtract();
      module.exports.sum = require_sum();
      module.exports.symmetricDifference = require_symmetricDifference();
      module.exports.symmetricDifferenceWith = require_symmetricDifferenceWith();
      module.exports.tail = require_tail();
      module.exports.take = require_take();
      module.exports.takeLast = require_takeLast();
      module.exports.takeLastWhile = require_takeLastWhile();
      module.exports.takeWhile = require_takeWhile();
      module.exports.tap = require_tap();
      module.exports.test = require_test();
      module.exports.andThen = require_andThen();
      module.exports.times = require_times();
      module.exports.toLower = require_toLower();
      module.exports.toPairs = require_toPairs();
      module.exports.toPairsIn = require_toPairsIn();
      module.exports.toString = require_toString2();
      module.exports.toUpper = require_toUpper();
      module.exports.transduce = require_transduce();
      module.exports.transpose = require_transpose();
      module.exports.traverse = require_traverse();
      module.exports.trim = require_trim();
      module.exports.tryCatch = require_tryCatch();
      module.exports.type = require_type();
      module.exports.unapply = require_unapply();
      module.exports.unary = require_unary();
      module.exports.uncurryN = require_uncurryN();
      module.exports.unfold = require_unfold();
      module.exports.union = require_union();
      module.exports.unionWith = require_unionWith();
      module.exports.uniq = require_uniq();
      module.exports.uniqBy = require_uniqBy();
      module.exports.uniqWith = require_uniqWith();
      module.exports.unless = require_unless();
      module.exports.unnest = require_unnest();
      module.exports.until = require_until();
      module.exports.unwind = require_unwind();
      module.exports.update = require_update();
      module.exports.useWith = require_useWith();
      module.exports.values = require_values();
      module.exports.valuesIn = require_valuesIn();
      module.exports.view = require_view();
      module.exports.when = require_when();
      module.exports.where = require_where();
      module.exports.whereAny = require_whereAny();
      module.exports.whereEq = require_whereEq();
      module.exports.without = require_without();
      module.exports.xor = require_xor();
      module.exports.xprod = require_xprod();
      module.exports.zip = require_zip();
      module.exports.zipObj = require_zipObj();
      module.exports.zipWith = require_zipWith();
      module.exports.thunkify = require_thunkify();
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
      function utf8ToBytes(string2, units) {
        units = units || Infinity;
        let codePoint;
        const length = string2.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string2.charCodeAt(i);
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
      function byteLength(string2, encoding) {
        if (Buffer3.isBuffer(string2)) {
          return string2.length;
        }
        if (ArrayBuffer.isView(string2) || isInstance(string2, ArrayBuffer)) {
          return string2.byteLength;
        }
        if (typeof string2 !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string2
          );
        }
        const len = string2.length;
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
              return utf8ToBytes(string2).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string2).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string2).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      function fromString2(string2, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string2, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string2, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString2(value, encodingOrOffset);
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
      Buffer3.prototype.write = function write(string2, offset, length, encoding) {
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
        if (string2.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding)
          encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string2, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string2, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string2, offset, length);
            case "base64":
              return base64Write(this, string2, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string2, offset, length);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      function hexWrite(buf, string2, offset, length) {
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
        const strLen = string2.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string2.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed))
            return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string2, offset, length) {
        return blitBuffer(
          utf8ToBytes(string2, buf.length - offset),
          buf,
          offset,
          length
        );
      }
      function asciiWrite(buf, string2, offset, length) {
        return blitBuffer(asciiToBytes(string2), buf, offset, length);
      }
      function base64Write(buf, string2, offset, length) {
        return blitBuffer(base64ToBytes(string2), buf, offset, length);
      }
      function ucs2Write(buf, string2, offset, length) {
        return blitBuffer(
          utf16leToBytes(string2, buf.length - offset),
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
    function eq2(_a, _b) {
      return _equals(_a, _b, stackA.slice(), stackB.slice());
    }
    return !_includesWith(function(b2, aItem) {
      return !_includesWith(eq2, aItem, b2);
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

  // src/intmax/actions/read/verifyPoseidon.js
  var { buildEddsa: buildEddsa2 } = (init_circomlibjs(), __toCommonJS(circomlibjs_exports));
  var Scalar2 = (init_ffjavascript(), __toCommonJS(ffjavascript_exports)).Scalar;
  var sha256 = new (require_sha256())();
  var { mergeLeft } = require_src2();
  var toArrayBuffer = (buf) => {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  };
  var verifyPoseidon_default = async (state, action) => {
    const poseidonConstants1 = (await SmartWeave.contracts.viewContractState(
      state.contracts.poseidonConstants1,
      {
        function: "get"
      }
    )).result;
    const poseidonConstants2 = (await SmartWeave.contracts.viewContractState(
      state.contracts.poseidonConstants2,
      {
        function: "get"
      }
    )).result;
    const poseidonConstants = mergeLeft(poseidonConstants1, poseidonConstants2);
    const { data, signature, pubKey } = action.input;
    const eddsa = await buildEddsa2(poseidonConstants);
    let msg = JSON.stringify(data);
    const msgHashed = Buffer.from(toArrayBuffer(sha256.update(msg).digest()));
    const msg2 = eddsa.babyJub.F.e(Scalar2.fromRprLE(msgHashed, 0));
    const packedSig = Uint8Array.from(
      Buffer.from(signature.replace(/^0x/, ""), "hex")
    );
    const sig = eddsa.unpackSignature(packedSig);
    const packedPublicKey = Uint8Array.from(
      Buffer.from(pubKey.replace(/^0x/, ""), "hex")
    );
    const publicKey = eddsa.babyJub.unpackPoint(packedPublicKey);
    const isValid = eddsa.verifyPoseidon(msg2, sig, publicKey);
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

  // src/intmax/intmax.js
  async function handle(state, action) {
    switch (action.input.function) {
      case "verify":
        return await verifyPoseidon_default(state, action);
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

