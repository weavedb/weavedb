
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

  // (disabled):node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "(disabled):node_modules/buffer/index.js"() {
    }
  });

  // node_modules/bn.js/lib/bn.js
  var require_bn = __commonJS({
    "node_modules/bn.js/lib/bn.js"(exports, module) {
      (function(module2, exports2) {
        "use strict";
        function assert(val, msg) {
          if (!val)
            throw new Error(msg || "Assertion failed");
        }
        function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
        function BN(number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }
          this.negative = 0;
          this.words = null;
          this.length = 0;
          this.red = null;
          if (number !== null) {
            if (base === "le" || base === "be") {
              endian = base;
              base = 10;
            }
            this._init(number || 0, base || 10, endian || "be");
          }
        }
        if (typeof module2 === "object") {
          module2.exports = BN;
        } else {
          exports2.BN = BN;
        }
        BN.BN = BN;
        BN.wordSize = 26;
        var Buffer3;
        try {
          if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
            Buffer3 = window.Buffer;
          } else {
            Buffer3 = require_buffer().Buffer;
          }
        } catch (e) {
        }
        BN.isBN = function isBN(num) {
          if (num instanceof BN) {
            return true;
          }
          return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };
        BN.max = function max(left, right) {
          if (left.cmp(right) > 0)
            return left;
          return right;
        };
        BN.min = function min(left, right) {
          if (left.cmp(right) < 0)
            return left;
          return right;
        };
        BN.prototype._init = function init(number, base, endian) {
          if (typeof number === "number") {
            return this._initNumber(number, base, endian);
          }
          if (typeof number === "object") {
            return this._initArray(number, base, endian);
          }
          if (base === "hex") {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);
          number = number.toString().replace(/\s+/g, "");
          var start = 0;
          if (number[0] === "-") {
            start++;
            this.negative = 1;
          }
          if (start < number.length) {
            if (base === 16) {
              this._parseHex(number, start, endian);
            } else {
              this._parseBase(number, base, start);
              if (endian === "le") {
                this._initArray(this.toArray(), base, endian);
              }
            }
          }
        };
        BN.prototype._initNumber = function _initNumber(number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 67108864) {
            this.words = [number & 67108863];
            this.length = 1;
          } else if (number < 4503599627370496) {
            this.words = [
              number & 67108863,
              number / 67108864 & 67108863
            ];
            this.length = 2;
          } else {
            assert(number < 9007199254740992);
            this.words = [
              number & 67108863,
              number / 67108864 & 67108863,
              1
            ];
            this.length = 3;
          }
          if (endian !== "le")
            return;
          this._initArray(this.toArray(), base, endian);
        };
        BN.prototype._initArray = function _initArray(number, base, endian) {
          assert(typeof number.length === "number");
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }
          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var j, w;
          var off = 0;
          if (endian === "be") {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
              this.words[j] |= w << off & 67108863;
              this.words[j + 1] = w >>> 26 - off & 67108863;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === "le") {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
              this.words[j] |= w << off & 67108863;
              this.words[j + 1] = w >>> 26 - off & 67108863;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this._strip();
        };
        function parseHex4Bits(string, index) {
          var c = string.charCodeAt(index);
          if (c >= 48 && c <= 57) {
            return c - 48;
          } else if (c >= 65 && c <= 70) {
            return c - 55;
          } else if (c >= 97 && c <= 102) {
            return c - 87;
          } else {
            assert(false, "Invalid character in " + string);
          }
        }
        function parseHexByte(string, lowerBound, index) {
          var r = parseHex4Bits(string, index);
          if (index - 1 >= lowerBound) {
            r |= parseHex4Bits(string, index - 1) << 4;
          }
          return r;
        }
        BN.prototype._parseHex = function _parseHex(number, start, endian) {
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var off = 0;
          var j = 0;
          var w;
          if (endian === "be") {
            for (i = number.length - 1; i >= start; i -= 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 67108863;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          } else {
            var parseLength = number.length - start;
            for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 67108863;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          }
          this._strip();
        };
        function parseBase(str, start, end, mul) {
          var r = 0;
          var b = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;
            r *= mul;
            if (c >= 49) {
              b = c - 49 + 10;
            } else if (c >= 17) {
              b = c - 17 + 10;
            } else {
              b = c;
            }
            assert(c >= 0 && b < mul, "Invalid character");
            r += b;
          }
          return r;
        }
        BN.prototype._parseBase = function _parseBase(number, base, start) {
          this.words = [0];
          this.length = 1;
          for (var limbLen = 0, limbPow = 1; limbPow <= 67108863; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = limbPow / base | 0;
          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;
          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);
            this.imuln(limbPow);
            if (this.words[0] + word < 67108864) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);
            for (i = 0; i < mod; i++) {
              pow *= base;
            }
            this.imuln(pow);
            if (this.words[0] + word < 67108864) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          this._strip();
        };
        BN.prototype.copy = function copy(dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };
        function move(dest, src) {
          dest.words = src.words;
          dest.length = src.length;
          dest.negative = src.negative;
          dest.red = src.red;
        }
        BN.prototype._move = function _move(dest) {
          move(dest, this);
        };
        BN.prototype.clone = function clone() {
          var r = new BN(null);
          this.copy(r);
          return r;
        };
        BN.prototype._expand = function _expand(size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };
        BN.prototype._strip = function strip() {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };
        BN.prototype._normSign = function _normSign() {
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };
        if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
          try {
            BN.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspect;
          } catch (e) {
            BN.prototype.inspect = inspect;
          }
        } else {
          BN.prototype.inspect = inspect;
        }
        function inspect() {
          return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
        }
        var zeros = [
          "",
          "0",
          "00",
          "000",
          "0000",
          "00000",
          "000000",
          "0000000",
          "00000000",
          "000000000",
          "0000000000",
          "00000000000",
          "000000000000",
          "0000000000000",
          "00000000000000",
          "000000000000000",
          "0000000000000000",
          "00000000000000000",
          "000000000000000000",
          "0000000000000000000",
          "00000000000000000000",
          "000000000000000000000",
          "0000000000000000000000",
          "00000000000000000000000",
          "000000000000000000000000",
          "0000000000000000000000000"
        ];
        var groupSizes = [
          0,
          0,
          25,
          16,
          12,
          11,
          10,
          9,
          8,
          8,
          7,
          7,
          7,
          7,
          6,
          6,
          6,
          6,
          6,
          6,
          6,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5
        ];
        var groupBases = [
          0,
          0,
          33554432,
          43046721,
          16777216,
          48828125,
          60466176,
          40353607,
          16777216,
          43046721,
          1e7,
          19487171,
          35831808,
          62748517,
          7529536,
          11390625,
          16777216,
          24137569,
          34012224,
          47045881,
          64e6,
          4084101,
          5153632,
          6436343,
          7962624,
          9765625,
          11881376,
          14348907,
          17210368,
          20511149,
          243e5,
          28629151,
          33554432,
          39135393,
          45435424,
          52521875,
          60466176
        ];
        BN.prototype.toString = function toString2(base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;
          var out;
          if (base === 16 || base === "hex") {
            out = "";
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = ((w << off | carry) & 16777215).toString(16);
              carry = w >>> 24 - off & 16777215;
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = "0" + out;
            }
            if (this.negative !== 0) {
              out = "-" + out;
            }
            return out;
          }
          if (base === (base | 0) && base >= 2 && base <= 36) {
            var groupSize = groupSizes[base];
            var groupBase = groupBases[base];
            out = "";
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modrn(groupBase).toString(base);
              c = c.idivn(groupBase);
              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = "0" + out;
            }
            while (out.length % padding !== 0) {
              out = "0" + out;
            }
            if (this.negative !== 0) {
              out = "-" + out;
            }
            return out;
          }
          assert(false, "Base should be between 2 and 36");
        };
        BN.prototype.toNumber = function toNumber() {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 67108864;
          } else if (this.length === 3 && this.words[2] === 1) {
            ret += 4503599627370496 + this.words[1] * 67108864;
          } else if (this.length > 2) {
            assert(false, "Number can only safely store up to 53 bits");
          }
          return this.negative !== 0 ? -ret : ret;
        };
        BN.prototype.toJSON = function toJSON() {
          return this.toString(16, 2);
        };
        if (Buffer3) {
          BN.prototype.toBuffer = function toBuffer(endian, length) {
            return this.toArrayLike(Buffer3, endian, length);
          };
        }
        BN.prototype.toArray = function toArray(endian, length) {
          return this.toArrayLike(Array, endian, length);
        };
        var allocate = function allocate2(ArrayType, size) {
          if (ArrayType.allocUnsafe) {
            return ArrayType.allocUnsafe(size);
          }
          return new ArrayType(size);
        };
        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
          this._strip();
          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, "byte array longer than desired length");
          assert(reqLength > 0, "Requested array length <= 0");
          var res = allocate(ArrayType, reqLength);
          var postfix = endian === "le" ? "LE" : "BE";
          this["_toArrayLike" + postfix](res, byteLength);
          return res;
        };
        BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength) {
          var position = 0;
          var carry = 0;
          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = this.words[i] << shift | carry;
            res[position++] = word & 255;
            if (position < res.length) {
              res[position++] = word >> 8 & 255;
            }
            if (position < res.length) {
              res[position++] = word >> 16 & 255;
            }
            if (shift === 6) {
              if (position < res.length) {
                res[position++] = word >> 24 & 255;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }
          if (position < res.length) {
            res[position++] = carry;
            while (position < res.length) {
              res[position++] = 0;
            }
          }
        };
        BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength) {
          var position = res.length - 1;
          var carry = 0;
          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = this.words[i] << shift | carry;
            res[position--] = word & 255;
            if (position >= 0) {
              res[position--] = word >> 8 & 255;
            }
            if (position >= 0) {
              res[position--] = word >> 16 & 255;
            }
            if (shift === 6) {
              if (position >= 0) {
                res[position--] = word >> 24 & 255;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }
          if (position >= 0) {
            res[position--] = carry;
            while (position >= 0) {
              res[position--] = 0;
            }
          }
        };
        if (Math.clz32) {
          BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 4096) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 64) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 2) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }
        BN.prototype._zeroBits = function _zeroBits(w) {
          if (w === 0)
            return 26;
          var t = w;
          var r = 0;
          if ((t & 8191) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 127) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 15) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 1) === 0) {
            r++;
          }
          return r;
        };
        BN.prototype.bitLength = function bitLength() {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };
        function toBitArray(num) {
          var w = new Array(num.bitLength());
          for (var bit = 0; bit < w.length; bit++) {
            var off = bit / 26 | 0;
            var wbit = bit % 26;
            w[bit] = num.words[off] >>> wbit & 1;
          }
          return w;
        }
        BN.prototype.zeroBits = function zeroBits() {
          if (this.isZero())
            return 0;
          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26)
              break;
          }
          return r;
        };
        BN.prototype.byteLength = function byteLength() {
          return Math.ceil(this.bitLength() / 8);
        };
        BN.prototype.toTwos = function toTwos(width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };
        BN.prototype.fromTwos = function fromTwos(width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };
        BN.prototype.isNeg = function isNeg() {
          return this.negative !== 0;
        };
        BN.prototype.neg = function neg() {
          return this.clone().ineg();
        };
        BN.prototype.ineg = function ineg() {
          if (!this.isZero()) {
            this.negative ^= 1;
          }
          return this;
        };
        BN.prototype.iuor = function iuor(num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }
          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }
          return this._strip();
        };
        BN.prototype.ior = function ior(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };
        BN.prototype.or = function or(num) {
          if (this.length > num.length)
            return this.clone().ior(num);
          return num.clone().ior(this);
        };
        BN.prototype.uor = function uor(num) {
          if (this.length > num.length)
            return this.clone().iuor(num);
          return num.clone().iuor(this);
        };
        BN.prototype.iuand = function iuand(num) {
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }
          this.length = b.length;
          return this._strip();
        };
        BN.prototype.iand = function iand(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };
        BN.prototype.and = function and(num) {
          if (this.length > num.length)
            return this.clone().iand(num);
          return num.clone().iand(this);
        };
        BN.prototype.uand = function uand(num) {
          if (this.length > num.length)
            return this.clone().iuand(num);
          return num.clone().iuand(this);
        };
        BN.prototype.iuxor = function iuxor(num) {
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }
          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = a.length;
          return this._strip();
        };
        BN.prototype.ixor = function ixor(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };
        BN.prototype.xor = function xor(num) {
          if (this.length > num.length)
            return this.clone().ixor(num);
          return num.clone().ixor(this);
        };
        BN.prototype.uxor = function uxor(num) {
          if (this.length > num.length)
            return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };
        BN.prototype.inotn = function inotn(width) {
          assert(typeof width === "number" && width >= 0);
          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;
          this._expand(bytesNeeded);
          if (bitsLeft > 0) {
            bytesNeeded--;
          }
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 67108863;
          }
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft;
          }
          return this._strip();
        };
        BN.prototype.notn = function notn(width) {
          return this.clone().inotn(width);
        };
        BN.prototype.setn = function setn(bit, val) {
          assert(typeof bit === "number" && bit >= 0);
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          this._expand(off + 1);
          if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }
          return this._strip();
        };
        BN.prototype.iadd = function iadd(num) {
          var r;
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 67108863;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 67108863;
            carry = r >>> 26;
          }
          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          return this;
        };
        BN.prototype.add = function add(num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }
          if (this.length > num.length)
            return this.clone().iadd(num);
          return num.clone().iadd(this);
        };
        BN.prototype.isub = function isub(num) {
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }
          var cmp = this.cmp(num);
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 67108863;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 67108863;
          }
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = Math.max(this.length, i);
          if (a !== this) {
            this.negative = 1;
          }
          return this._strip();
        };
        BN.prototype.sub = function sub(num) {
          return this.clone().isub(num);
        };
        function smallMulTo(self2, num, out) {
          out.negative = num.negative ^ self2.negative;
          var len = self2.length + num.length | 0;
          out.length = len;
          len = len - 1 | 0;
          var a = self2.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;
          var lo = r & 67108863;
          var carry = r / 67108864 | 0;
          out.words[0] = lo;
          for (var k = 1; k < len; k++) {
            var ncarry = carry >>> 26;
            var rword = carry & 67108863;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self2.length + 1); j <= maxJ; j++) {
              var i = k - j | 0;
              a = self2.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += r / 67108864 | 0;
              rword = r & 67108863;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }
          return out._strip();
        }
        var comb10MulTo = function comb10MulTo2(self2, num, out) {
          var a = self2.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 8191;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 8191;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 8191;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 8191;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 8191;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 8191;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 8191;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 8191;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 8191;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 8191;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 8191;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 8191;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 8191;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 8191;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 8191;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 8191;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 8191;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 8191;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 8191;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 8191;
          var bh9 = b9 >>> 13;
          out.negative = self2.negative ^ num.negative;
          out.length = 19;
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = mid + Math.imul(ah0, bl0) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
          w0 &= 67108863;
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = mid + Math.imul(ah1, bl0) | 0;
          hi = Math.imul(ah1, bh0);
          lo = lo + Math.imul(al0, bl1) | 0;
          mid = mid + Math.imul(al0, bh1) | 0;
          mid = mid + Math.imul(ah0, bl1) | 0;
          hi = hi + Math.imul(ah0, bh1) | 0;
          var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
          w1 &= 67108863;
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = mid + Math.imul(ah2, bl0) | 0;
          hi = Math.imul(ah2, bh0);
          lo = lo + Math.imul(al1, bl1) | 0;
          mid = mid + Math.imul(al1, bh1) | 0;
          mid = mid + Math.imul(ah1, bl1) | 0;
          hi = hi + Math.imul(ah1, bh1) | 0;
          lo = lo + Math.imul(al0, bl2) | 0;
          mid = mid + Math.imul(al0, bh2) | 0;
          mid = mid + Math.imul(ah0, bl2) | 0;
          hi = hi + Math.imul(ah0, bh2) | 0;
          var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
          w2 &= 67108863;
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = mid + Math.imul(ah3, bl0) | 0;
          hi = Math.imul(ah3, bh0);
          lo = lo + Math.imul(al2, bl1) | 0;
          mid = mid + Math.imul(al2, bh1) | 0;
          mid = mid + Math.imul(ah2, bl1) | 0;
          hi = hi + Math.imul(ah2, bh1) | 0;
          lo = lo + Math.imul(al1, bl2) | 0;
          mid = mid + Math.imul(al1, bh2) | 0;
          mid = mid + Math.imul(ah1, bl2) | 0;
          hi = hi + Math.imul(ah1, bh2) | 0;
          lo = lo + Math.imul(al0, bl3) | 0;
          mid = mid + Math.imul(al0, bh3) | 0;
          mid = mid + Math.imul(ah0, bl3) | 0;
          hi = hi + Math.imul(ah0, bh3) | 0;
          var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
          w3 &= 67108863;
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = mid + Math.imul(ah4, bl0) | 0;
          hi = Math.imul(ah4, bh0);
          lo = lo + Math.imul(al3, bl1) | 0;
          mid = mid + Math.imul(al3, bh1) | 0;
          mid = mid + Math.imul(ah3, bl1) | 0;
          hi = hi + Math.imul(ah3, bh1) | 0;
          lo = lo + Math.imul(al2, bl2) | 0;
          mid = mid + Math.imul(al2, bh2) | 0;
          mid = mid + Math.imul(ah2, bl2) | 0;
          hi = hi + Math.imul(ah2, bh2) | 0;
          lo = lo + Math.imul(al1, bl3) | 0;
          mid = mid + Math.imul(al1, bh3) | 0;
          mid = mid + Math.imul(ah1, bl3) | 0;
          hi = hi + Math.imul(ah1, bh3) | 0;
          lo = lo + Math.imul(al0, bl4) | 0;
          mid = mid + Math.imul(al0, bh4) | 0;
          mid = mid + Math.imul(ah0, bl4) | 0;
          hi = hi + Math.imul(ah0, bh4) | 0;
          var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
          w4 &= 67108863;
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = mid + Math.imul(ah5, bl0) | 0;
          hi = Math.imul(ah5, bh0);
          lo = lo + Math.imul(al4, bl1) | 0;
          mid = mid + Math.imul(al4, bh1) | 0;
          mid = mid + Math.imul(ah4, bl1) | 0;
          hi = hi + Math.imul(ah4, bh1) | 0;
          lo = lo + Math.imul(al3, bl2) | 0;
          mid = mid + Math.imul(al3, bh2) | 0;
          mid = mid + Math.imul(ah3, bl2) | 0;
          hi = hi + Math.imul(ah3, bh2) | 0;
          lo = lo + Math.imul(al2, bl3) | 0;
          mid = mid + Math.imul(al2, bh3) | 0;
          mid = mid + Math.imul(ah2, bl3) | 0;
          hi = hi + Math.imul(ah2, bh3) | 0;
          lo = lo + Math.imul(al1, bl4) | 0;
          mid = mid + Math.imul(al1, bh4) | 0;
          mid = mid + Math.imul(ah1, bl4) | 0;
          hi = hi + Math.imul(ah1, bh4) | 0;
          lo = lo + Math.imul(al0, bl5) | 0;
          mid = mid + Math.imul(al0, bh5) | 0;
          mid = mid + Math.imul(ah0, bl5) | 0;
          hi = hi + Math.imul(ah0, bh5) | 0;
          var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
          w5 &= 67108863;
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = mid + Math.imul(ah6, bl0) | 0;
          hi = Math.imul(ah6, bh0);
          lo = lo + Math.imul(al5, bl1) | 0;
          mid = mid + Math.imul(al5, bh1) | 0;
          mid = mid + Math.imul(ah5, bl1) | 0;
          hi = hi + Math.imul(ah5, bh1) | 0;
          lo = lo + Math.imul(al4, bl2) | 0;
          mid = mid + Math.imul(al4, bh2) | 0;
          mid = mid + Math.imul(ah4, bl2) | 0;
          hi = hi + Math.imul(ah4, bh2) | 0;
          lo = lo + Math.imul(al3, bl3) | 0;
          mid = mid + Math.imul(al3, bh3) | 0;
          mid = mid + Math.imul(ah3, bl3) | 0;
          hi = hi + Math.imul(ah3, bh3) | 0;
          lo = lo + Math.imul(al2, bl4) | 0;
          mid = mid + Math.imul(al2, bh4) | 0;
          mid = mid + Math.imul(ah2, bl4) | 0;
          hi = hi + Math.imul(ah2, bh4) | 0;
          lo = lo + Math.imul(al1, bl5) | 0;
          mid = mid + Math.imul(al1, bh5) | 0;
          mid = mid + Math.imul(ah1, bl5) | 0;
          hi = hi + Math.imul(ah1, bh5) | 0;
          lo = lo + Math.imul(al0, bl6) | 0;
          mid = mid + Math.imul(al0, bh6) | 0;
          mid = mid + Math.imul(ah0, bl6) | 0;
          hi = hi + Math.imul(ah0, bh6) | 0;
          var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
          w6 &= 67108863;
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = mid + Math.imul(ah7, bl0) | 0;
          hi = Math.imul(ah7, bh0);
          lo = lo + Math.imul(al6, bl1) | 0;
          mid = mid + Math.imul(al6, bh1) | 0;
          mid = mid + Math.imul(ah6, bl1) | 0;
          hi = hi + Math.imul(ah6, bh1) | 0;
          lo = lo + Math.imul(al5, bl2) | 0;
          mid = mid + Math.imul(al5, bh2) | 0;
          mid = mid + Math.imul(ah5, bl2) | 0;
          hi = hi + Math.imul(ah5, bh2) | 0;
          lo = lo + Math.imul(al4, bl3) | 0;
          mid = mid + Math.imul(al4, bh3) | 0;
          mid = mid + Math.imul(ah4, bl3) | 0;
          hi = hi + Math.imul(ah4, bh3) | 0;
          lo = lo + Math.imul(al3, bl4) | 0;
          mid = mid + Math.imul(al3, bh4) | 0;
          mid = mid + Math.imul(ah3, bl4) | 0;
          hi = hi + Math.imul(ah3, bh4) | 0;
          lo = lo + Math.imul(al2, bl5) | 0;
          mid = mid + Math.imul(al2, bh5) | 0;
          mid = mid + Math.imul(ah2, bl5) | 0;
          hi = hi + Math.imul(ah2, bh5) | 0;
          lo = lo + Math.imul(al1, bl6) | 0;
          mid = mid + Math.imul(al1, bh6) | 0;
          mid = mid + Math.imul(ah1, bl6) | 0;
          hi = hi + Math.imul(ah1, bh6) | 0;
          lo = lo + Math.imul(al0, bl7) | 0;
          mid = mid + Math.imul(al0, bh7) | 0;
          mid = mid + Math.imul(ah0, bl7) | 0;
          hi = hi + Math.imul(ah0, bh7) | 0;
          var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
          w7 &= 67108863;
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = mid + Math.imul(ah8, bl0) | 0;
          hi = Math.imul(ah8, bh0);
          lo = lo + Math.imul(al7, bl1) | 0;
          mid = mid + Math.imul(al7, bh1) | 0;
          mid = mid + Math.imul(ah7, bl1) | 0;
          hi = hi + Math.imul(ah7, bh1) | 0;
          lo = lo + Math.imul(al6, bl2) | 0;
          mid = mid + Math.imul(al6, bh2) | 0;
          mid = mid + Math.imul(ah6, bl2) | 0;
          hi = hi + Math.imul(ah6, bh2) | 0;
          lo = lo + Math.imul(al5, bl3) | 0;
          mid = mid + Math.imul(al5, bh3) | 0;
          mid = mid + Math.imul(ah5, bl3) | 0;
          hi = hi + Math.imul(ah5, bh3) | 0;
          lo = lo + Math.imul(al4, bl4) | 0;
          mid = mid + Math.imul(al4, bh4) | 0;
          mid = mid + Math.imul(ah4, bl4) | 0;
          hi = hi + Math.imul(ah4, bh4) | 0;
          lo = lo + Math.imul(al3, bl5) | 0;
          mid = mid + Math.imul(al3, bh5) | 0;
          mid = mid + Math.imul(ah3, bl5) | 0;
          hi = hi + Math.imul(ah3, bh5) | 0;
          lo = lo + Math.imul(al2, bl6) | 0;
          mid = mid + Math.imul(al2, bh6) | 0;
          mid = mid + Math.imul(ah2, bl6) | 0;
          hi = hi + Math.imul(ah2, bh6) | 0;
          lo = lo + Math.imul(al1, bl7) | 0;
          mid = mid + Math.imul(al1, bh7) | 0;
          mid = mid + Math.imul(ah1, bl7) | 0;
          hi = hi + Math.imul(ah1, bh7) | 0;
          lo = lo + Math.imul(al0, bl8) | 0;
          mid = mid + Math.imul(al0, bh8) | 0;
          mid = mid + Math.imul(ah0, bl8) | 0;
          hi = hi + Math.imul(ah0, bh8) | 0;
          var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
          w8 &= 67108863;
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = mid + Math.imul(ah9, bl0) | 0;
          hi = Math.imul(ah9, bh0);
          lo = lo + Math.imul(al8, bl1) | 0;
          mid = mid + Math.imul(al8, bh1) | 0;
          mid = mid + Math.imul(ah8, bl1) | 0;
          hi = hi + Math.imul(ah8, bh1) | 0;
          lo = lo + Math.imul(al7, bl2) | 0;
          mid = mid + Math.imul(al7, bh2) | 0;
          mid = mid + Math.imul(ah7, bl2) | 0;
          hi = hi + Math.imul(ah7, bh2) | 0;
          lo = lo + Math.imul(al6, bl3) | 0;
          mid = mid + Math.imul(al6, bh3) | 0;
          mid = mid + Math.imul(ah6, bl3) | 0;
          hi = hi + Math.imul(ah6, bh3) | 0;
          lo = lo + Math.imul(al5, bl4) | 0;
          mid = mid + Math.imul(al5, bh4) | 0;
          mid = mid + Math.imul(ah5, bl4) | 0;
          hi = hi + Math.imul(ah5, bh4) | 0;
          lo = lo + Math.imul(al4, bl5) | 0;
          mid = mid + Math.imul(al4, bh5) | 0;
          mid = mid + Math.imul(ah4, bl5) | 0;
          hi = hi + Math.imul(ah4, bh5) | 0;
          lo = lo + Math.imul(al3, bl6) | 0;
          mid = mid + Math.imul(al3, bh6) | 0;
          mid = mid + Math.imul(ah3, bl6) | 0;
          hi = hi + Math.imul(ah3, bh6) | 0;
          lo = lo + Math.imul(al2, bl7) | 0;
          mid = mid + Math.imul(al2, bh7) | 0;
          mid = mid + Math.imul(ah2, bl7) | 0;
          hi = hi + Math.imul(ah2, bh7) | 0;
          lo = lo + Math.imul(al1, bl8) | 0;
          mid = mid + Math.imul(al1, bh8) | 0;
          mid = mid + Math.imul(ah1, bl8) | 0;
          hi = hi + Math.imul(ah1, bh8) | 0;
          lo = lo + Math.imul(al0, bl9) | 0;
          mid = mid + Math.imul(al0, bh9) | 0;
          mid = mid + Math.imul(ah0, bl9) | 0;
          hi = hi + Math.imul(ah0, bh9) | 0;
          var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
          w9 &= 67108863;
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = mid + Math.imul(ah9, bl1) | 0;
          hi = Math.imul(ah9, bh1);
          lo = lo + Math.imul(al8, bl2) | 0;
          mid = mid + Math.imul(al8, bh2) | 0;
          mid = mid + Math.imul(ah8, bl2) | 0;
          hi = hi + Math.imul(ah8, bh2) | 0;
          lo = lo + Math.imul(al7, bl3) | 0;
          mid = mid + Math.imul(al7, bh3) | 0;
          mid = mid + Math.imul(ah7, bl3) | 0;
          hi = hi + Math.imul(ah7, bh3) | 0;
          lo = lo + Math.imul(al6, bl4) | 0;
          mid = mid + Math.imul(al6, bh4) | 0;
          mid = mid + Math.imul(ah6, bl4) | 0;
          hi = hi + Math.imul(ah6, bh4) | 0;
          lo = lo + Math.imul(al5, bl5) | 0;
          mid = mid + Math.imul(al5, bh5) | 0;
          mid = mid + Math.imul(ah5, bl5) | 0;
          hi = hi + Math.imul(ah5, bh5) | 0;
          lo = lo + Math.imul(al4, bl6) | 0;
          mid = mid + Math.imul(al4, bh6) | 0;
          mid = mid + Math.imul(ah4, bl6) | 0;
          hi = hi + Math.imul(ah4, bh6) | 0;
          lo = lo + Math.imul(al3, bl7) | 0;
          mid = mid + Math.imul(al3, bh7) | 0;
          mid = mid + Math.imul(ah3, bl7) | 0;
          hi = hi + Math.imul(ah3, bh7) | 0;
          lo = lo + Math.imul(al2, bl8) | 0;
          mid = mid + Math.imul(al2, bh8) | 0;
          mid = mid + Math.imul(ah2, bl8) | 0;
          hi = hi + Math.imul(ah2, bh8) | 0;
          lo = lo + Math.imul(al1, bl9) | 0;
          mid = mid + Math.imul(al1, bh9) | 0;
          mid = mid + Math.imul(ah1, bl9) | 0;
          hi = hi + Math.imul(ah1, bh9) | 0;
          var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
          w10 &= 67108863;
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = mid + Math.imul(ah9, bl2) | 0;
          hi = Math.imul(ah9, bh2);
          lo = lo + Math.imul(al8, bl3) | 0;
          mid = mid + Math.imul(al8, bh3) | 0;
          mid = mid + Math.imul(ah8, bl3) | 0;
          hi = hi + Math.imul(ah8, bh3) | 0;
          lo = lo + Math.imul(al7, bl4) | 0;
          mid = mid + Math.imul(al7, bh4) | 0;
          mid = mid + Math.imul(ah7, bl4) | 0;
          hi = hi + Math.imul(ah7, bh4) | 0;
          lo = lo + Math.imul(al6, bl5) | 0;
          mid = mid + Math.imul(al6, bh5) | 0;
          mid = mid + Math.imul(ah6, bl5) | 0;
          hi = hi + Math.imul(ah6, bh5) | 0;
          lo = lo + Math.imul(al5, bl6) | 0;
          mid = mid + Math.imul(al5, bh6) | 0;
          mid = mid + Math.imul(ah5, bl6) | 0;
          hi = hi + Math.imul(ah5, bh6) | 0;
          lo = lo + Math.imul(al4, bl7) | 0;
          mid = mid + Math.imul(al4, bh7) | 0;
          mid = mid + Math.imul(ah4, bl7) | 0;
          hi = hi + Math.imul(ah4, bh7) | 0;
          lo = lo + Math.imul(al3, bl8) | 0;
          mid = mid + Math.imul(al3, bh8) | 0;
          mid = mid + Math.imul(ah3, bl8) | 0;
          hi = hi + Math.imul(ah3, bh8) | 0;
          lo = lo + Math.imul(al2, bl9) | 0;
          mid = mid + Math.imul(al2, bh9) | 0;
          mid = mid + Math.imul(ah2, bl9) | 0;
          hi = hi + Math.imul(ah2, bh9) | 0;
          var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
          w11 &= 67108863;
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = mid + Math.imul(ah9, bl3) | 0;
          hi = Math.imul(ah9, bh3);
          lo = lo + Math.imul(al8, bl4) | 0;
          mid = mid + Math.imul(al8, bh4) | 0;
          mid = mid + Math.imul(ah8, bl4) | 0;
          hi = hi + Math.imul(ah8, bh4) | 0;
          lo = lo + Math.imul(al7, bl5) | 0;
          mid = mid + Math.imul(al7, bh5) | 0;
          mid = mid + Math.imul(ah7, bl5) | 0;
          hi = hi + Math.imul(ah7, bh5) | 0;
          lo = lo + Math.imul(al6, bl6) | 0;
          mid = mid + Math.imul(al6, bh6) | 0;
          mid = mid + Math.imul(ah6, bl6) | 0;
          hi = hi + Math.imul(ah6, bh6) | 0;
          lo = lo + Math.imul(al5, bl7) | 0;
          mid = mid + Math.imul(al5, bh7) | 0;
          mid = mid + Math.imul(ah5, bl7) | 0;
          hi = hi + Math.imul(ah5, bh7) | 0;
          lo = lo + Math.imul(al4, bl8) | 0;
          mid = mid + Math.imul(al4, bh8) | 0;
          mid = mid + Math.imul(ah4, bl8) | 0;
          hi = hi + Math.imul(ah4, bh8) | 0;
          lo = lo + Math.imul(al3, bl9) | 0;
          mid = mid + Math.imul(al3, bh9) | 0;
          mid = mid + Math.imul(ah3, bl9) | 0;
          hi = hi + Math.imul(ah3, bh9) | 0;
          var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
          w12 &= 67108863;
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = mid + Math.imul(ah9, bl4) | 0;
          hi = Math.imul(ah9, bh4);
          lo = lo + Math.imul(al8, bl5) | 0;
          mid = mid + Math.imul(al8, bh5) | 0;
          mid = mid + Math.imul(ah8, bl5) | 0;
          hi = hi + Math.imul(ah8, bh5) | 0;
          lo = lo + Math.imul(al7, bl6) | 0;
          mid = mid + Math.imul(al7, bh6) | 0;
          mid = mid + Math.imul(ah7, bl6) | 0;
          hi = hi + Math.imul(ah7, bh6) | 0;
          lo = lo + Math.imul(al6, bl7) | 0;
          mid = mid + Math.imul(al6, bh7) | 0;
          mid = mid + Math.imul(ah6, bl7) | 0;
          hi = hi + Math.imul(ah6, bh7) | 0;
          lo = lo + Math.imul(al5, bl8) | 0;
          mid = mid + Math.imul(al5, bh8) | 0;
          mid = mid + Math.imul(ah5, bl8) | 0;
          hi = hi + Math.imul(ah5, bh8) | 0;
          lo = lo + Math.imul(al4, bl9) | 0;
          mid = mid + Math.imul(al4, bh9) | 0;
          mid = mid + Math.imul(ah4, bl9) | 0;
          hi = hi + Math.imul(ah4, bh9) | 0;
          var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
          w13 &= 67108863;
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = mid + Math.imul(ah9, bl5) | 0;
          hi = Math.imul(ah9, bh5);
          lo = lo + Math.imul(al8, bl6) | 0;
          mid = mid + Math.imul(al8, bh6) | 0;
          mid = mid + Math.imul(ah8, bl6) | 0;
          hi = hi + Math.imul(ah8, bh6) | 0;
          lo = lo + Math.imul(al7, bl7) | 0;
          mid = mid + Math.imul(al7, bh7) | 0;
          mid = mid + Math.imul(ah7, bl7) | 0;
          hi = hi + Math.imul(ah7, bh7) | 0;
          lo = lo + Math.imul(al6, bl8) | 0;
          mid = mid + Math.imul(al6, bh8) | 0;
          mid = mid + Math.imul(ah6, bl8) | 0;
          hi = hi + Math.imul(ah6, bh8) | 0;
          lo = lo + Math.imul(al5, bl9) | 0;
          mid = mid + Math.imul(al5, bh9) | 0;
          mid = mid + Math.imul(ah5, bl9) | 0;
          hi = hi + Math.imul(ah5, bh9) | 0;
          var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
          w14 &= 67108863;
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = mid + Math.imul(ah9, bl6) | 0;
          hi = Math.imul(ah9, bh6);
          lo = lo + Math.imul(al8, bl7) | 0;
          mid = mid + Math.imul(al8, bh7) | 0;
          mid = mid + Math.imul(ah8, bl7) | 0;
          hi = hi + Math.imul(ah8, bh7) | 0;
          lo = lo + Math.imul(al7, bl8) | 0;
          mid = mid + Math.imul(al7, bh8) | 0;
          mid = mid + Math.imul(ah7, bl8) | 0;
          hi = hi + Math.imul(ah7, bh8) | 0;
          lo = lo + Math.imul(al6, bl9) | 0;
          mid = mid + Math.imul(al6, bh9) | 0;
          mid = mid + Math.imul(ah6, bl9) | 0;
          hi = hi + Math.imul(ah6, bh9) | 0;
          var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
          w15 &= 67108863;
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = mid + Math.imul(ah9, bl7) | 0;
          hi = Math.imul(ah9, bh7);
          lo = lo + Math.imul(al8, bl8) | 0;
          mid = mid + Math.imul(al8, bh8) | 0;
          mid = mid + Math.imul(ah8, bl8) | 0;
          hi = hi + Math.imul(ah8, bh8) | 0;
          lo = lo + Math.imul(al7, bl9) | 0;
          mid = mid + Math.imul(al7, bh9) | 0;
          mid = mid + Math.imul(ah7, bl9) | 0;
          hi = hi + Math.imul(ah7, bh9) | 0;
          var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
          w16 &= 67108863;
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = mid + Math.imul(ah9, bl8) | 0;
          hi = Math.imul(ah9, bh8);
          lo = lo + Math.imul(al8, bl9) | 0;
          mid = mid + Math.imul(al8, bh9) | 0;
          mid = mid + Math.imul(ah8, bl9) | 0;
          hi = hi + Math.imul(ah8, bh9) | 0;
          var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
          w17 &= 67108863;
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = mid + Math.imul(ah9, bl9) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
          w18 &= 67108863;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }
        function bigMulTo(self2, num, out) {
          out.negative = num.negative ^ self2.negative;
          out.length = self2.length + num.length;
          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 67108863;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self2.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self2.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;
              var lo = r & 67108863;
              ncarry = ncarry + (r / 67108864 | 0) | 0;
              lo = lo + rword | 0;
              rword = lo & 67108863;
              ncarry = ncarry + (lo >>> 26) | 0;
              hncarry += ncarry >>> 26;
              ncarry &= 67108863;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }
          return out._strip();
        }
        function jumboMulTo(self2, num, out) {
          return bigMulTo(self2, num, out);
        }
        BN.prototype.mulTo = function mulTo(num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }
          return res;
        };
        function FFTM(x, y) {
          this.x = x;
          this.y = y;
        }
        FFTM.prototype.makeRBT = function makeRBT(N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }
          return t;
        };
        FFTM.prototype.revBin = function revBin(x, l, N) {
          if (x === 0 || x === N - 1)
            return x;
          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
          }
          return rb;
        };
        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };
        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);
          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;
            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);
            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;
              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];
                var ro = rtws[p + j + s];
                var io = itws[p + j + s];
                var rx = rtwdf_ * ro - itwdf_ * io;
                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;
                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;
                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };
        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }
          return 1 << i + 1 + odd;
        };
        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
          if (N <= 1)
            return;
          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];
            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;
            t = iws[i];
            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };
        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 8192 + Math.round(ws[2 * i] / N) + carry;
            ws[i] = w & 67108863;
            if (w < 67108864) {
              carry = 0;
            } else {
              carry = w / 67108864 | 0;
            }
          }
          return ws;
        };
        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);
            rws[2 * i] = carry & 8191;
            carry = carry >>> 13;
            rws[2 * i + 1] = carry & 8191;
            carry = carry >>> 13;
          }
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }
          assert(carry === 0);
          assert((carry & ~8191) === 0);
        };
        FFTM.prototype.stub = function stub(N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }
          return ph;
        };
        FFTM.prototype.mulp = function mulp(x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);
          var rbt = this.makeRBT(N);
          var _2 = this.stub(N);
          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);
          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);
          var rmws = out.words;
          rmws.length = N;
          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);
          this.transform(rws, _2, rwst, iwst, N, rbt);
          this.transform(nrws, _2, nrwst, niwst, N, rbt);
          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }
          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _2, N, rbt);
          this.conjugate(rmws, _2, N);
          this.normalize13b(rmws, N);
          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out._strip();
        };
        BN.prototype.mul = function mul(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };
        BN.prototype.mulf = function mulf(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };
        BN.prototype.imul = function imul(num) {
          return this.clone().mulTo(num, this);
        };
        BN.prototype.imuln = function imuln(num) {
          var isNegNum = num < 0;
          if (isNegNum)
            num = -num;
          assert(typeof num === "number");
          assert(num < 67108864);
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 67108863) + (carry & 67108863);
            carry >>= 26;
            carry += w / 67108864 | 0;
            carry += lo >>> 26;
            this.words[i] = lo & 67108863;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return isNegNum ? this.ineg() : this;
        };
        BN.prototype.muln = function muln(num) {
          return this.clone().imuln(num);
        };
        BN.prototype.sqr = function sqr() {
          return this.mul(this);
        };
        BN.prototype.isqr = function isqr() {
          return this.imul(this.clone());
        };
        BN.prototype.pow = function pow(num) {
          var w = toBitArray(num);
          if (w.length === 0)
            return new BN(1);
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0)
              break;
          }
          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0)
                continue;
              res = res.mul(q);
            }
          }
          return res;
        };
        BN.prototype.iushln = function iushln(bits) {
          assert(typeof bits === "number" && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = 67108863 >>> 26 - r << 26 - r;
          var i;
          if (r !== 0) {
            var carry = 0;
            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = (this.words[i] | 0) - newCarry << r;
              this.words[i] = c | carry;
              carry = newCarry >>> 26 - r;
            }
            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }
          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }
            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }
            this.length += s;
          }
          return this._strip();
        };
        BN.prototype.ishln = function ishln(bits) {
          assert(this.negative === 0);
          return this.iushln(bits);
        };
        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
          assert(typeof bits === "number" && bits >= 0);
          var h;
          if (hint) {
            h = (hint - hint % 26) / 26;
          } else {
            h = 0;
          }
          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 67108863 ^ 67108863 >>> r << r;
          var maskedWords = extended;
          h -= s;
          h = Math.max(0, h);
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }
          if (s === 0) {
          } else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }
          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
          }
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }
          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }
          return this._strip();
        };
        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };
        BN.prototype.shln = function shln(bits) {
          return this.clone().ishln(bits);
        };
        BN.prototype.ushln = function ushln(bits) {
          return this.clone().iushln(bits);
        };
        BN.prototype.shrn = function shrn(bits) {
          return this.clone().ishrn(bits);
        };
        BN.prototype.ushrn = function ushrn(bits) {
          return this.clone().iushrn(bits);
        };
        BN.prototype.testn = function testn(bit) {
          assert(typeof bit === "number" && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s)
            return false;
          var w = this.words[s];
          return !!(w & q);
        };
        BN.prototype.imaskn = function imaskn(bits) {
          assert(typeof bits === "number" && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          assert(this.negative === 0, "imaskn works only with positive numbers");
          if (this.length <= s) {
            return this;
          }
          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);
          if (r !== 0) {
            var mask = 67108863 ^ 67108863 >>> r << r;
            this.words[this.length - 1] &= mask;
          }
          return this._strip();
        };
        BN.prototype.maskn = function maskn(bits) {
          return this.clone().imaskn(bits);
        };
        BN.prototype.iaddn = function iaddn(num) {
          assert(typeof num === "number");
          assert(num < 67108864);
          if (num < 0)
            return this.isubn(-num);
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) <= num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }
            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }
          return this._iaddn(num);
        };
        BN.prototype._iaddn = function _iaddn(num) {
          this.words[0] += num;
          for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) {
            this.words[i] -= 67108864;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);
          return this;
        };
        BN.prototype.isubn = function isubn(num) {
          assert(typeof num === "number");
          assert(num < 67108864);
          if (num < 0)
            return this.iaddn(-num);
          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }
          this.words[0] -= num;
          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 67108864;
              this.words[i + 1] -= 1;
            }
          }
          return this._strip();
        };
        BN.prototype.addn = function addn(num) {
          return this.clone().iaddn(num);
        };
        BN.prototype.subn = function subn(num) {
          return this.clone().isubn(num);
        };
        BN.prototype.iabs = function iabs() {
          this.negative = 0;
          return this;
        };
        BN.prototype.abs = function abs() {
          return this.clone().iabs();
        };
        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
          var len = num.length + shift;
          var i;
          this._expand(len);
          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 67108863;
            carry = (w >> 26) - (right / 67108864 | 0);
            this.words[i + shift] = w & 67108863;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 67108863;
          }
          if (carry === 0)
            return this._strip();
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 67108863;
          }
          this.negative = 1;
          return this._strip();
        };
        BN.prototype._wordDiv = function _wordDiv(num, mode) {
          var shift = this.length - num.length;
          var a = this.clone();
          var b = num;
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }
          var m = a.length - b.length;
          var q;
          if (mode !== "mod") {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }
          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }
          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
            qj = Math.min(qj / bhi | 0, 67108863);
            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q._strip();
          }
          a._strip();
          if (mode !== "div" && shift !== 0) {
            a.iushrn(shift);
          }
          return {
            div: q || null,
            mod: a
          };
        };
        BN.prototype.divmod = function divmod(num, mode, positive) {
          assert(!num.isZero());
          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }
          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);
            if (mode !== "mod") {
              div = res.div.neg();
            }
            if (mode !== "div") {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }
            return {
              div,
              mod
            };
          }
          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);
            if (mode !== "mod") {
              div = res.div.neg();
            }
            return {
              div,
              mod: res.mod
            };
          }
          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);
            if (mode !== "div") {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }
            return {
              div: res.div,
              mod
            };
          }
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }
          if (num.length === 1) {
            if (mode === "div") {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }
            if (mode === "mod") {
              return {
                div: null,
                mod: new BN(this.modrn(num.words[0]))
              };
            }
            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modrn(num.words[0]))
            };
          }
          return this._wordDiv(num, mode);
        };
        BN.prototype.div = function div(num) {
          return this.divmod(num, "div", false).div;
        };
        BN.prototype.mod = function mod(num) {
          return this.divmod(num, "mod", false).mod;
        };
        BN.prototype.umod = function umod(num) {
          return this.divmod(num, "mod", true).mod;
        };
        BN.prototype.divRound = function divRound(num) {
          var dm = this.divmod(num);
          if (dm.mod.isZero())
            return dm.div;
          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);
          if (cmp < 0 || r2 === 1 && cmp === 0)
            return dm.div;
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };
        BN.prototype.modrn = function modrn(num) {
          var isNegNum = num < 0;
          if (isNegNum)
            num = -num;
          assert(num <= 67108863);
          var p = (1 << 26) % num;
          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }
          return isNegNum ? -acc : acc;
        };
        BN.prototype.modn = function modn(num) {
          return this.modrn(num);
        };
        BN.prototype.idivn = function idivn(num) {
          var isNegNum = num < 0;
          if (isNegNum)
            num = -num;
          assert(num <= 67108863);
          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 67108864;
            this.words[i] = w / num | 0;
            carry = w % num;
          }
          this._strip();
          return isNegNum ? this.ineg() : this;
        };
        BN.prototype.divn = function divn(num) {
          return this.clone().idivn(num);
        };
        BN.prototype.egcd = function egcd(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var x = this;
          var y = p.clone();
          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }
          var A = new BN(1);
          var B = new BN(0);
          var C = new BN(0);
          var D = new BN(1);
          var g = 0;
          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }
          var yp = y.clone();
          var xp = x.clone();
          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
              ;
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }
                A.iushrn(1);
                B.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
              ;
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }
                C.iushrn(1);
                D.iushrn(1);
              }
            }
            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }
          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };
        BN.prototype._invmp = function _invmp(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var a = this;
          var b = p.clone();
          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }
          var x1 = new BN(1);
          var x2 = new BN(0);
          var delta = b.clone();
          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
              ;
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }
                x1.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
              ;
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }
                x2.iushrn(1);
              }
            }
            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }
          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }
          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }
          return res;
        };
        BN.prototype.gcd = function gcd(num) {
          if (this.isZero())
            return num.abs();
          if (num.isZero())
            return this.abs();
          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }
          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }
            var r = a.cmp(b);
            if (r < 0) {
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }
            a.isub(b);
          } while (true);
          return b.iushln(shift);
        };
        BN.prototype.invm = function invm(num) {
          return this.egcd(num).a.umod(num);
        };
        BN.prototype.isEven = function isEven() {
          return (this.words[0] & 1) === 0;
        };
        BN.prototype.isOdd = function isOdd() {
          return (this.words[0] & 1) === 1;
        };
        BN.prototype.andln = function andln(num) {
          return this.words[0] & num;
        };
        BN.prototype.bincn = function bincn(bit) {
          assert(typeof bit === "number");
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 67108863;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };
        BN.prototype.isZero = function isZero() {
          return this.length === 1 && this.words[0] === 0;
        };
        BN.prototype.cmpn = function cmpn(num) {
          var negative = num < 0;
          if (this.negative !== 0 && !negative)
            return -1;
          if (this.negative === 0 && negative)
            return 1;
          this._strip();
          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }
            assert(num <= 67108863, "Number is too big");
            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0)
            return -res | 0;
          return res;
        };
        BN.prototype.cmp = function cmp(num) {
          if (this.negative !== 0 && num.negative === 0)
            return -1;
          if (this.negative === 0 && num.negative !== 0)
            return 1;
          var res = this.ucmp(num);
          if (this.negative !== 0)
            return -res | 0;
          return res;
        };
        BN.prototype.ucmp = function ucmp(num) {
          if (this.length > num.length)
            return 1;
          if (this.length < num.length)
            return -1;
          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;
            if (a === b)
              continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };
        BN.prototype.gtn = function gtn(num) {
          return this.cmpn(num) === 1;
        };
        BN.prototype.gt = function gt(num) {
          return this.cmp(num) === 1;
        };
        BN.prototype.gten = function gten(num) {
          return this.cmpn(num) >= 0;
        };
        BN.prototype.gte = function gte(num) {
          return this.cmp(num) >= 0;
        };
        BN.prototype.ltn = function ltn(num) {
          return this.cmpn(num) === -1;
        };
        BN.prototype.lt = function lt(num) {
          return this.cmp(num) === -1;
        };
        BN.prototype.lten = function lten(num) {
          return this.cmpn(num) <= 0;
        };
        BN.prototype.lte = function lte(num) {
          return this.cmp(num) <= 0;
        };
        BN.prototype.eqn = function eqn(num) {
          return this.cmpn(num) === 0;
        };
        BN.prototype.eq = function eq(num) {
          return this.cmp(num) === 0;
        };
        BN.red = function red(num) {
          return new Red(num);
        };
        BN.prototype.toRed = function toRed(ctx) {
          assert(!this.red, "Already a number in reduction context");
          assert(this.negative === 0, "red works only with positives");
          return ctx.convertTo(this)._forceRed(ctx);
        };
        BN.prototype.fromRed = function fromRed() {
          assert(this.red, "fromRed works only with numbers in reduction context");
          return this.red.convertFrom(this);
        };
        BN.prototype._forceRed = function _forceRed(ctx) {
          this.red = ctx;
          return this;
        };
        BN.prototype.forceRed = function forceRed(ctx) {
          assert(!this.red, "Already a number in reduction context");
          return this._forceRed(ctx);
        };
        BN.prototype.redAdd = function redAdd(num) {
          assert(this.red, "redAdd works only with red numbers");
          return this.red.add(this, num);
        };
        BN.prototype.redIAdd = function redIAdd(num) {
          assert(this.red, "redIAdd works only with red numbers");
          return this.red.iadd(this, num);
        };
        BN.prototype.redSub = function redSub(num) {
          assert(this.red, "redSub works only with red numbers");
          return this.red.sub(this, num);
        };
        BN.prototype.redISub = function redISub(num) {
          assert(this.red, "redISub works only with red numbers");
          return this.red.isub(this, num);
        };
        BN.prototype.redShl = function redShl(num) {
          assert(this.red, "redShl works only with red numbers");
          return this.red.shl(this, num);
        };
        BN.prototype.redMul = function redMul(num) {
          assert(this.red, "redMul works only with red numbers");
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };
        BN.prototype.redIMul = function redIMul(num) {
          assert(this.red, "redMul works only with red numbers");
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };
        BN.prototype.redSqr = function redSqr() {
          assert(this.red, "redSqr works only with red numbers");
          this.red._verify1(this);
          return this.red.sqr(this);
        };
        BN.prototype.redISqr = function redISqr() {
          assert(this.red, "redISqr works only with red numbers");
          this.red._verify1(this);
          return this.red.isqr(this);
        };
        BN.prototype.redSqrt = function redSqrt() {
          assert(this.red, "redSqrt works only with red numbers");
          this.red._verify1(this);
          return this.red.sqrt(this);
        };
        BN.prototype.redInvm = function redInvm() {
          assert(this.red, "redInvm works only with red numbers");
          this.red._verify1(this);
          return this.red.invm(this);
        };
        BN.prototype.redNeg = function redNeg() {
          assert(this.red, "redNeg works only with red numbers");
          this.red._verify1(this);
          return this.red.neg(this);
        };
        BN.prototype.redPow = function redPow(num) {
          assert(this.red && !num.red, "redPow(normalNum)");
          this.red._verify1(this);
          return this.red.pow(this, num);
        };
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };
        function MPrime(name, p) {
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);
          this.tmp = this._tmp();
        }
        MPrime.prototype._tmp = function _tmp() {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };
        MPrime.prototype.ireduce = function ireduce(num) {
          var r = num;
          var rlen;
          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);
          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            if (r.strip !== void 0) {
              r.strip();
            } else {
              r._strip();
            }
          }
          return r;
        };
        MPrime.prototype.split = function split(input, out) {
          input.iushrn(this.n, 0, out);
        };
        MPrime.prototype.imulK = function imulK(num) {
          return num.imul(this.k);
        };
        function K256() {
          MPrime.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        inherits(K256, MPrime);
        K256.prototype.split = function split(input, output) {
          var mask = 4194303;
          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;
          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;
          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };
        K256.prototype.imulK = function imulK(num) {
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 977;
            num.words[i] = lo & 67108863;
            lo = w * 64 + (lo / 67108864 | 0);
          }
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };
        function P224() {
          MPrime.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        inherits(P224, MPrime);
        function P192() {
          MPrime.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        inherits(P192, MPrime);
        function P25519() {
          MPrime.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        inherits(P25519, MPrime);
        P25519.prototype.imulK = function imulK(num) {
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 19 + carry;
            var lo = hi & 67108863;
            hi >>>= 26;
            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };
        BN._prime = function prime(name) {
          if (primes[name])
            return primes[name];
          var prime2;
          if (name === "k256") {
            prime2 = new K256();
          } else if (name === "p224") {
            prime2 = new P224();
          } else if (name === "p192") {
            prime2 = new P192();
          } else if (name === "p25519") {
            prime2 = new P25519();
          } else {
            throw new Error("Unknown prime " + name);
          }
          primes[name] = prime2;
          return prime2;
        };
        function Red(m) {
          if (typeof m === "string") {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), "modulus must be greater than 1");
            this.m = m;
            this.prime = null;
          }
        }
        Red.prototype._verify1 = function _verify1(a) {
          assert(a.negative === 0, "red works only with positives");
          assert(a.red, "red works only with red numbers");
        };
        Red.prototype._verify2 = function _verify2(a, b) {
          assert((a.negative | b.negative) === 0, "red works only with positives");
          assert(
            a.red && a.red === b.red,
            "red works only with red numbers"
          );
        };
        Red.prototype.imod = function imod(a) {
          if (this.prime)
            return this.prime.ireduce(a)._forceRed(this);
          move(a, a.umod(this.m)._forceRed(this));
          return a;
        };
        Red.prototype.neg = function neg(a) {
          if (a.isZero()) {
            return a.clone();
          }
          return this.m.sub(a)._forceRed(this);
        };
        Red.prototype.add = function add(a, b) {
          this._verify2(a, b);
          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.iadd = function iadd(a, b) {
          this._verify2(a, b);
          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };
        Red.prototype.sub = function sub(a, b) {
          this._verify2(a, b);
          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.isub = function isub(a, b) {
          this._verify2(a, b);
          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };
        Red.prototype.shl = function shl(a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };
        Red.prototype.imul = function imul(a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };
        Red.prototype.mul = function mul(a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };
        Red.prototype.isqr = function isqr(a) {
          return this.imul(a, a.clone());
        };
        Red.prototype.sqr = function sqr(a) {
          return this.mul(a, a);
        };
        Red.prototype.sqrt = function sqrt(a) {
          if (a.isZero())
            return a.clone();
          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());
          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);
          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }
          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));
            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }
          return r;
        };
        Red.prototype.invm = function invm(a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };
        Red.prototype.pow = function pow(a, num) {
          if (num.isZero())
            return new BN(1).toRed(this);
          if (num.cmpn(1) === 0)
            return a.clone();
          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }
          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }
          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = word >> j & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }
              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }
              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0))
                continue;
              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }
          return res;
        };
        Red.prototype.convertTo = function convertTo(num) {
          var r = num.umod(this.m);
          return r === num ? r.clone() : r;
        };
        Red.prototype.convertFrom = function convertFrom(num) {
          var res = num.clone();
          res.red = null;
          return res;
        };
        BN.mont = function mont(num) {
          return new Mont(num);
        };
        function Mont(m) {
          Red.call(this, m);
          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }
          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);
          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);
        Mont.prototype.convertTo = function convertTo(num) {
          return this.imod(num.ushln(this.shift));
        };
        Mont.prototype.convertFrom = function convertFrom(num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };
        Mont.prototype.imul = function imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }
          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.mul = function mul(a, b) {
          if (a.isZero() || b.isZero())
            return new BN(0)._forceRed(this);
          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.invm = function invm(a) {
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })(typeof module === "undefined" || module, exports);
    }
  });

  // node_modules/secp256k1/lib/index.js
  var require_lib = __commonJS({
    "node_modules/secp256k1/lib/index.js"(exports, module) {
      var errors = {
        IMPOSSIBLE_CASE: "Impossible case. Please create issue.",
        TWEAK_ADD: "The tweak was out of range or the resulted private key is invalid",
        TWEAK_MUL: "The tweak was out of range or equal to zero",
        CONTEXT_RANDOMIZE_UNKNOW: "Unknow error on context randomization",
        SECKEY_INVALID: "Private Key is invalid",
        PUBKEY_PARSE: "Public Key could not be parsed",
        PUBKEY_SERIALIZE: "Public Key serialization error",
        PUBKEY_COMBINE: "The sum of the public keys is not valid",
        SIG_PARSE: "Signature could not be parsed",
        SIGN: "The nonce generation function failed, or the private key was invalid",
        RECOVER: "Public key could not be recover",
        ECDH: "Scalar was invalid (zero or overflow)"
      };
      function assert(cond, msg) {
        if (!cond)
          throw new Error(msg);
      }
      function isUint8Array(name, value, length) {
        assert(value instanceof Uint8Array, `Expected ${name} to be an Uint8Array`);
        if (length !== void 0) {
          if (Array.isArray(length)) {
            const numbers = length.join(", ");
            const msg = `Expected ${name} to be an Uint8Array with length [${numbers}]`;
            assert(length.includes(value.length), msg);
          } else {
            const msg = `Expected ${name} to be an Uint8Array with length ${length}`;
            assert(value.length === length, msg);
          }
        }
      }
      function isCompressed(value) {
        assert(toTypeString(value) === "Boolean", "Expected compressed to be a Boolean");
      }
      function getAssertedOutput(output = (len) => new Uint8Array(len), length) {
        if (typeof output === "function")
          output = output(length);
        isUint8Array("output", output, length);
        return output;
      }
      function toTypeString(value) {
        return Object.prototype.toString.call(value).slice(8, -1);
      }
      module.exports = (secp256k1) => {
        return {
          contextRandomize(seed) {
            assert(
              seed === null || seed instanceof Uint8Array,
              "Expected seed to be an Uint8Array or null"
            );
            if (seed !== null)
              isUint8Array("seed", seed, 32);
            switch (secp256k1.contextRandomize(seed)) {
              case 1:
                throw new Error(errors.CONTEXT_RANDOMIZE_UNKNOW);
            }
          },
          privateKeyVerify(seckey) {
            isUint8Array("private key", seckey, 32);
            return secp256k1.privateKeyVerify(seckey) === 0;
          },
          privateKeyNegate(seckey) {
            isUint8Array("private key", seckey, 32);
            switch (secp256k1.privateKeyNegate(seckey)) {
              case 0:
                return seckey;
              case 1:
                throw new Error(errors.IMPOSSIBLE_CASE);
            }
          },
          privateKeyTweakAdd(seckey, tweak) {
            isUint8Array("private key", seckey, 32);
            isUint8Array("tweak", tweak, 32);
            switch (secp256k1.privateKeyTweakAdd(seckey, tweak)) {
              case 0:
                return seckey;
              case 1:
                throw new Error(errors.TWEAK_ADD);
            }
          },
          privateKeyTweakMul(seckey, tweak) {
            isUint8Array("private key", seckey, 32);
            isUint8Array("tweak", tweak, 32);
            switch (secp256k1.privateKeyTweakMul(seckey, tweak)) {
              case 0:
                return seckey;
              case 1:
                throw new Error(errors.TWEAK_MUL);
            }
          },
          publicKeyVerify(pubkey) {
            isUint8Array("public key", pubkey, [33, 65]);
            return secp256k1.publicKeyVerify(pubkey) === 0;
          },
          publicKeyCreate(seckey, compressed = true, output) {
            isUint8Array("private key", seckey, 32);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyCreate(output, seckey)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.SECKEY_INVALID);
              case 2:
                throw new Error(errors.PUBKEY_SERIALIZE);
            }
          },
          publicKeyConvert(pubkey, compressed = true, output) {
            isUint8Array("public key", pubkey, [33, 65]);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyConvert(output, pubkey)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.PUBKEY_SERIALIZE);
            }
          },
          publicKeyNegate(pubkey, compressed = true, output) {
            isUint8Array("public key", pubkey, [33, 65]);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyNegate(output, pubkey)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.IMPOSSIBLE_CASE);
              case 3:
                throw new Error(errors.PUBKEY_SERIALIZE);
            }
          },
          publicKeyCombine(pubkeys, compressed = true, output) {
            assert(Array.isArray(pubkeys), "Expected public keys to be an Array");
            assert(pubkeys.length > 0, "Expected public keys array will have more than zero items");
            for (const pubkey of pubkeys) {
              isUint8Array("public key", pubkey, [33, 65]);
            }
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyCombine(output, pubkeys)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.PUBKEY_COMBINE);
              case 3:
                throw new Error(errors.PUBKEY_SERIALIZE);
            }
          },
          publicKeyTweakAdd(pubkey, tweak, compressed = true, output) {
            isUint8Array("public key", pubkey, [33, 65]);
            isUint8Array("tweak", tweak, 32);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyTweakAdd(output, pubkey, tweak)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.TWEAK_ADD);
            }
          },
          publicKeyTweakMul(pubkey, tweak, compressed = true, output) {
            isUint8Array("public key", pubkey, [33, 65]);
            isUint8Array("tweak", tweak, 32);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.publicKeyTweakMul(output, pubkey, tweak)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.TWEAK_MUL);
            }
          },
          signatureNormalize(sig) {
            isUint8Array("signature", sig, 64);
            switch (secp256k1.signatureNormalize(sig)) {
              case 0:
                return sig;
              case 1:
                throw new Error(errors.SIG_PARSE);
            }
          },
          signatureExport(sig, output) {
            isUint8Array("signature", sig, 64);
            output = getAssertedOutput(output, 72);
            const obj = { output, outputlen: 72 };
            switch (secp256k1.signatureExport(obj, sig)) {
              case 0:
                return output.slice(0, obj.outputlen);
              case 1:
                throw new Error(errors.SIG_PARSE);
              case 2:
                throw new Error(errors.IMPOSSIBLE_CASE);
            }
          },
          signatureImport(sig, output) {
            isUint8Array("signature", sig);
            output = getAssertedOutput(output, 64);
            switch (secp256k1.signatureImport(output, sig)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.SIG_PARSE);
              case 2:
                throw new Error(errors.IMPOSSIBLE_CASE);
            }
          },
          ecdsaSign(msg32, seckey, options = {}, output) {
            isUint8Array("message", msg32, 32);
            isUint8Array("private key", seckey, 32);
            assert(toTypeString(options) === "Object", "Expected options to be an Object");
            if (options.data !== void 0)
              isUint8Array("options.data", options.data);
            if (options.noncefn !== void 0)
              assert(toTypeString(options.noncefn) === "Function", "Expected options.noncefn to be a Function");
            output = getAssertedOutput(output, 64);
            const obj = { signature: output, recid: null };
            switch (secp256k1.ecdsaSign(obj, msg32, seckey, options.data, options.noncefn)) {
              case 0:
                return obj;
              case 1:
                throw new Error(errors.SIGN);
              case 2:
                throw new Error(errors.IMPOSSIBLE_CASE);
            }
          },
          ecdsaVerify(sig, msg32, pubkey) {
            isUint8Array("signature", sig, 64);
            isUint8Array("message", msg32, 32);
            isUint8Array("public key", pubkey, [33, 65]);
            switch (secp256k1.ecdsaVerify(sig, msg32, pubkey)) {
              case 0:
                return true;
              case 3:
                return false;
              case 1:
                throw new Error(errors.SIG_PARSE);
              case 2:
                throw new Error(errors.PUBKEY_PARSE);
            }
          },
          ecdsaRecover(sig, recid, msg32, compressed = true, output) {
            isUint8Array("signature", sig, 64);
            assert(
              toTypeString(recid) === "Number" && recid >= 0 && recid <= 3,
              "Expected recovery id to be a Number within interval [0, 3]"
            );
            isUint8Array("message", msg32, 32);
            isCompressed(compressed);
            output = getAssertedOutput(output, compressed ? 33 : 65);
            switch (secp256k1.ecdsaRecover(output, sig, recid, msg32)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.SIG_PARSE);
              case 2:
                throw new Error(errors.RECOVER);
              case 3:
                throw new Error(errors.IMPOSSIBLE_CASE);
            }
          },
          ecdh(pubkey, seckey, options = {}, output) {
            isUint8Array("public key", pubkey, [33, 65]);
            isUint8Array("private key", seckey, 32);
            assert(toTypeString(options) === "Object", "Expected options to be an Object");
            if (options.data !== void 0)
              isUint8Array("options.data", options.data);
            if (options.hashfn !== void 0) {
              assert(toTypeString(options.hashfn) === "Function", "Expected options.hashfn to be a Function");
              if (options.xbuf !== void 0)
                isUint8Array("options.xbuf", options.xbuf, 32);
              if (options.ybuf !== void 0)
                isUint8Array("options.ybuf", options.ybuf, 32);
              isUint8Array("output", output);
            } else {
              output = getAssertedOutput(output, 32);
            }
            switch (secp256k1.ecdh(output, pubkey, seckey, options.data, options.hashfn, options.xbuf, options.ybuf)) {
              case 0:
                return output;
              case 1:
                throw new Error(errors.PUBKEY_PARSE);
              case 2:
                throw new Error(errors.ECDH);
            }
          }
        };
      };
    }
  });

  // node_modules/elliptic/package.json
  var require_package = __commonJS({
    "node_modules/elliptic/package.json"(exports, module) {
      module.exports = {
        name: "elliptic",
        version: "6.5.4",
        description: "EC cryptography",
        main: "lib/elliptic.js",
        files: [
          "lib"
        ],
        scripts: {
          lint: "eslint lib test",
          "lint:fix": "npm run lint -- --fix",
          unit: "istanbul test _mocha --reporter=spec test/index.js",
          test: "npm run lint && npm run unit",
          version: "grunt dist && git add dist/"
        },
        repository: {
          type: "git",
          url: "git@github.com:indutny/elliptic"
        },
        keywords: [
          "EC",
          "Elliptic",
          "curve",
          "Cryptography"
        ],
        author: "Fedor Indutny <fedor@indutny.com>",
        license: "MIT",
        bugs: {
          url: "https://github.com/indutny/elliptic/issues"
        },
        homepage: "https://github.com/indutny/elliptic",
        devDependencies: {
          brfs: "^2.0.2",
          coveralls: "^3.1.0",
          eslint: "^7.6.0",
          grunt: "^1.2.1",
          "grunt-browserify": "^5.3.0",
          "grunt-cli": "^1.3.2",
          "grunt-contrib-connect": "^3.0.0",
          "grunt-contrib-copy": "^1.0.0",
          "grunt-contrib-uglify": "^5.0.0",
          "grunt-mocha-istanbul": "^5.0.2",
          "grunt-saucelabs": "^9.0.1",
          istanbul: "^0.4.5",
          mocha: "^8.0.1"
        },
        dependencies: {
          "bn.js": "^4.11.9",
          brorand: "^1.1.0",
          "hash.js": "^1.0.0",
          "hmac-drbg": "^1.0.1",
          inherits: "^2.0.4",
          "minimalistic-assert": "^1.0.1",
          "minimalistic-crypto-utils": "^1.0.1"
        }
      };
    }
  });

  // node_modules/elliptic/node_modules/bn.js/lib/bn.js
  var require_bn2 = __commonJS({
    "node_modules/elliptic/node_modules/bn.js/lib/bn.js"(exports, module) {
      (function(module2, exports2) {
        "use strict";
        function assert(val, msg) {
          if (!val)
            throw new Error(msg || "Assertion failed");
        }
        function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
        function BN(number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }
          this.negative = 0;
          this.words = null;
          this.length = 0;
          this.red = null;
          if (number !== null) {
            if (base === "le" || base === "be") {
              endian = base;
              base = 10;
            }
            this._init(number || 0, base || 10, endian || "be");
          }
        }
        if (typeof module2 === "object") {
          module2.exports = BN;
        } else {
          exports2.BN = BN;
        }
        BN.BN = BN;
        BN.wordSize = 26;
        var Buffer3;
        try {
          if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
            Buffer3 = window.Buffer;
          } else {
            Buffer3 = require_buffer().Buffer;
          }
        } catch (e) {
        }
        BN.isBN = function isBN(num) {
          if (num instanceof BN) {
            return true;
          }
          return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };
        BN.max = function max(left, right) {
          if (left.cmp(right) > 0)
            return left;
          return right;
        };
        BN.min = function min(left, right) {
          if (left.cmp(right) < 0)
            return left;
          return right;
        };
        BN.prototype._init = function init(number, base, endian) {
          if (typeof number === "number") {
            return this._initNumber(number, base, endian);
          }
          if (typeof number === "object") {
            return this._initArray(number, base, endian);
          }
          if (base === "hex") {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);
          number = number.toString().replace(/\s+/g, "");
          var start = 0;
          if (number[0] === "-") {
            start++;
            this.negative = 1;
          }
          if (start < number.length) {
            if (base === 16) {
              this._parseHex(number, start, endian);
            } else {
              this._parseBase(number, base, start);
              if (endian === "le") {
                this._initArray(this.toArray(), base, endian);
              }
            }
          }
        };
        BN.prototype._initNumber = function _initNumber(number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 67108864) {
            this.words = [number & 67108863];
            this.length = 1;
          } else if (number < 4503599627370496) {
            this.words = [
              number & 67108863,
              number / 67108864 & 67108863
            ];
            this.length = 2;
          } else {
            assert(number < 9007199254740992);
            this.words = [
              number & 67108863,
              number / 67108864 & 67108863,
              1
            ];
            this.length = 3;
          }
          if (endian !== "le")
            return;
          this._initArray(this.toArray(), base, endian);
        };
        BN.prototype._initArray = function _initArray(number, base, endian) {
          assert(typeof number.length === "number");
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }
          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var j, w;
          var off = 0;
          if (endian === "be") {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
              this.words[j] |= w << off & 67108863;
              this.words[j + 1] = w >>> 26 - off & 67108863;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === "le") {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
              this.words[j] |= w << off & 67108863;
              this.words[j + 1] = w >>> 26 - off & 67108863;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this.strip();
        };
        function parseHex4Bits(string, index) {
          var c = string.charCodeAt(index);
          if (c >= 65 && c <= 70) {
            return c - 55;
          } else if (c >= 97 && c <= 102) {
            return c - 87;
          } else {
            return c - 48 & 15;
          }
        }
        function parseHexByte(string, lowerBound, index) {
          var r = parseHex4Bits(string, index);
          if (index - 1 >= lowerBound) {
            r |= parseHex4Bits(string, index - 1) << 4;
          }
          return r;
        }
        BN.prototype._parseHex = function _parseHex(number, start, endian) {
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var off = 0;
          var j = 0;
          var w;
          if (endian === "be") {
            for (i = number.length - 1; i >= start; i -= 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 67108863;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          } else {
            var parseLength = number.length - start;
            for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 67108863;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          }
          this.strip();
        };
        function parseBase(str, start, end, mul) {
          var r = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;
            r *= mul;
            if (c >= 49) {
              r += c - 49 + 10;
            } else if (c >= 17) {
              r += c - 17 + 10;
            } else {
              r += c;
            }
          }
          return r;
        }
        BN.prototype._parseBase = function _parseBase(number, base, start) {
          this.words = [0];
          this.length = 1;
          for (var limbLen = 0, limbPow = 1; limbPow <= 67108863; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = limbPow / base | 0;
          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;
          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);
            this.imuln(limbPow);
            if (this.words[0] + word < 67108864) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);
            for (i = 0; i < mod; i++) {
              pow *= base;
            }
            this.imuln(pow);
            if (this.words[0] + word < 67108864) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          this.strip();
        };
        BN.prototype.copy = function copy(dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };
        BN.prototype.clone = function clone() {
          var r = new BN(null);
          this.copy(r);
          return r;
        };
        BN.prototype._expand = function _expand(size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };
        BN.prototype.strip = function strip() {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };
        BN.prototype._normSign = function _normSign() {
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };
        BN.prototype.inspect = function inspect() {
          return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
        };
        var zeros = [
          "",
          "0",
          "00",
          "000",
          "0000",
          "00000",
          "000000",
          "0000000",
          "00000000",
          "000000000",
          "0000000000",
          "00000000000",
          "000000000000",
          "0000000000000",
          "00000000000000",
          "000000000000000",
          "0000000000000000",
          "00000000000000000",
          "000000000000000000",
          "0000000000000000000",
          "00000000000000000000",
          "000000000000000000000",
          "0000000000000000000000",
          "00000000000000000000000",
          "000000000000000000000000",
          "0000000000000000000000000"
        ];
        var groupSizes = [
          0,
          0,
          25,
          16,
          12,
          11,
          10,
          9,
          8,
          8,
          7,
          7,
          7,
          7,
          6,
          6,
          6,
          6,
          6,
          6,
          6,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5
        ];
        var groupBases = [
          0,
          0,
          33554432,
          43046721,
          16777216,
          48828125,
          60466176,
          40353607,
          16777216,
          43046721,
          1e7,
          19487171,
          35831808,
          62748517,
          7529536,
          11390625,
          16777216,
          24137569,
          34012224,
          47045881,
          64e6,
          4084101,
          5153632,
          6436343,
          7962624,
          9765625,
          11881376,
          14348907,
          17210368,
          20511149,
          243e5,
          28629151,
          33554432,
          39135393,
          45435424,
          52521875,
          60466176
        ];
        BN.prototype.toString = function toString2(base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;
          var out;
          if (base === 16 || base === "hex") {
            out = "";
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = ((w << off | carry) & 16777215).toString(16);
              carry = w >>> 24 - off & 16777215;
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = "0" + out;
            }
            if (this.negative !== 0) {
              out = "-" + out;
            }
            return out;
          }
          if (base === (base | 0) && base >= 2 && base <= 36) {
            var groupSize = groupSizes[base];
            var groupBase = groupBases[base];
            out = "";
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modn(groupBase).toString(base);
              c = c.idivn(groupBase);
              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = "0" + out;
            }
            while (out.length % padding !== 0) {
              out = "0" + out;
            }
            if (this.negative !== 0) {
              out = "-" + out;
            }
            return out;
          }
          assert(false, "Base should be between 2 and 36");
        };
        BN.prototype.toNumber = function toNumber() {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 67108864;
          } else if (this.length === 3 && this.words[2] === 1) {
            ret += 4503599627370496 + this.words[1] * 67108864;
          } else if (this.length > 2) {
            assert(false, "Number can only safely store up to 53 bits");
          }
          return this.negative !== 0 ? -ret : ret;
        };
        BN.prototype.toJSON = function toJSON() {
          return this.toString(16);
        };
        BN.prototype.toBuffer = function toBuffer(endian, length) {
          assert(typeof Buffer3 !== "undefined");
          return this.toArrayLike(Buffer3, endian, length);
        };
        BN.prototype.toArray = function toArray(endian, length) {
          return this.toArrayLike(Array, endian, length);
        };
        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, "byte array longer than desired length");
          assert(reqLength > 0, "Requested array length <= 0");
          this.strip();
          var littleEndian = endian === "le";
          var res = new ArrayType(reqLength);
          var b, i;
          var q = this.clone();
          if (!littleEndian) {
            for (i = 0; i < reqLength - byteLength; i++) {
              res[i] = 0;
            }
            for (i = 0; !q.isZero(); i++) {
              b = q.andln(255);
              q.iushrn(8);
              res[reqLength - i - 1] = b;
            }
          } else {
            for (i = 0; !q.isZero(); i++) {
              b = q.andln(255);
              q.iushrn(8);
              res[i] = b;
            }
            for (; i < reqLength; i++) {
              res[i] = 0;
            }
          }
          return res;
        };
        if (Math.clz32) {
          BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 4096) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 64) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 2) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }
        BN.prototype._zeroBits = function _zeroBits(w) {
          if (w === 0)
            return 26;
          var t = w;
          var r = 0;
          if ((t & 8191) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 127) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 15) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 1) === 0) {
            r++;
          }
          return r;
        };
        BN.prototype.bitLength = function bitLength() {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };
        function toBitArray(num) {
          var w = new Array(num.bitLength());
          for (var bit = 0; bit < w.length; bit++) {
            var off = bit / 26 | 0;
            var wbit = bit % 26;
            w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
          }
          return w;
        }
        BN.prototype.zeroBits = function zeroBits() {
          if (this.isZero())
            return 0;
          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26)
              break;
          }
          return r;
        };
        BN.prototype.byteLength = function byteLength() {
          return Math.ceil(this.bitLength() / 8);
        };
        BN.prototype.toTwos = function toTwos(width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };
        BN.prototype.fromTwos = function fromTwos(width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };
        BN.prototype.isNeg = function isNeg() {
          return this.negative !== 0;
        };
        BN.prototype.neg = function neg() {
          return this.clone().ineg();
        };
        BN.prototype.ineg = function ineg() {
          if (!this.isZero()) {
            this.negative ^= 1;
          }
          return this;
        };
        BN.prototype.iuor = function iuor(num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }
          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }
          return this.strip();
        };
        BN.prototype.ior = function ior(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };
        BN.prototype.or = function or(num) {
          if (this.length > num.length)
            return this.clone().ior(num);
          return num.clone().ior(this);
        };
        BN.prototype.uor = function uor(num) {
          if (this.length > num.length)
            return this.clone().iuor(num);
          return num.clone().iuor(this);
        };
        BN.prototype.iuand = function iuand(num) {
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }
          this.length = b.length;
          return this.strip();
        };
        BN.prototype.iand = function iand(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };
        BN.prototype.and = function and(num) {
          if (this.length > num.length)
            return this.clone().iand(num);
          return num.clone().iand(this);
        };
        BN.prototype.uand = function uand(num) {
          if (this.length > num.length)
            return this.clone().iuand(num);
          return num.clone().iuand(this);
        };
        BN.prototype.iuxor = function iuxor(num) {
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }
          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = a.length;
          return this.strip();
        };
        BN.prototype.ixor = function ixor(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };
        BN.prototype.xor = function xor(num) {
          if (this.length > num.length)
            return this.clone().ixor(num);
          return num.clone().ixor(this);
        };
        BN.prototype.uxor = function uxor(num) {
          if (this.length > num.length)
            return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };
        BN.prototype.inotn = function inotn(width) {
          assert(typeof width === "number" && width >= 0);
          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;
          this._expand(bytesNeeded);
          if (bitsLeft > 0) {
            bytesNeeded--;
          }
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 67108863;
          }
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft;
          }
          return this.strip();
        };
        BN.prototype.notn = function notn(width) {
          return this.clone().inotn(width);
        };
        BN.prototype.setn = function setn(bit, val) {
          assert(typeof bit === "number" && bit >= 0);
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          this._expand(off + 1);
          if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }
          return this.strip();
        };
        BN.prototype.iadd = function iadd(num) {
          var r;
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 67108863;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 67108863;
            carry = r >>> 26;
          }
          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          return this;
        };
        BN.prototype.add = function add(num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }
          if (this.length > num.length)
            return this.clone().iadd(num);
          return num.clone().iadd(this);
        };
        BN.prototype.isub = function isub(num) {
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }
          var cmp = this.cmp(num);
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 67108863;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 67108863;
          }
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = Math.max(this.length, i);
          if (a !== this) {
            this.negative = 1;
          }
          return this.strip();
        };
        BN.prototype.sub = function sub(num) {
          return this.clone().isub(num);
        };
        function smallMulTo(self2, num, out) {
          out.negative = num.negative ^ self2.negative;
          var len = self2.length + num.length | 0;
          out.length = len;
          len = len - 1 | 0;
          var a = self2.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;
          var lo = r & 67108863;
          var carry = r / 67108864 | 0;
          out.words[0] = lo;
          for (var k = 1; k < len; k++) {
            var ncarry = carry >>> 26;
            var rword = carry & 67108863;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self2.length + 1); j <= maxJ; j++) {
              var i = k - j | 0;
              a = self2.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += r / 67108864 | 0;
              rword = r & 67108863;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }
          return out.strip();
        }
        var comb10MulTo = function comb10MulTo2(self2, num, out) {
          var a = self2.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 8191;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 8191;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 8191;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 8191;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 8191;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 8191;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 8191;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 8191;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 8191;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 8191;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 8191;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 8191;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 8191;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 8191;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 8191;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 8191;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 8191;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 8191;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 8191;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 8191;
          var bh9 = b9 >>> 13;
          out.negative = self2.negative ^ num.negative;
          out.length = 19;
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = mid + Math.imul(ah0, bl0) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
          w0 &= 67108863;
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = mid + Math.imul(ah1, bl0) | 0;
          hi = Math.imul(ah1, bh0);
          lo = lo + Math.imul(al0, bl1) | 0;
          mid = mid + Math.imul(al0, bh1) | 0;
          mid = mid + Math.imul(ah0, bl1) | 0;
          hi = hi + Math.imul(ah0, bh1) | 0;
          var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
          w1 &= 67108863;
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = mid + Math.imul(ah2, bl0) | 0;
          hi = Math.imul(ah2, bh0);
          lo = lo + Math.imul(al1, bl1) | 0;
          mid = mid + Math.imul(al1, bh1) | 0;
          mid = mid + Math.imul(ah1, bl1) | 0;
          hi = hi + Math.imul(ah1, bh1) | 0;
          lo = lo + Math.imul(al0, bl2) | 0;
          mid = mid + Math.imul(al0, bh2) | 0;
          mid = mid + Math.imul(ah0, bl2) | 0;
          hi = hi + Math.imul(ah0, bh2) | 0;
          var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
          w2 &= 67108863;
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = mid + Math.imul(ah3, bl0) | 0;
          hi = Math.imul(ah3, bh0);
          lo = lo + Math.imul(al2, bl1) | 0;
          mid = mid + Math.imul(al2, bh1) | 0;
          mid = mid + Math.imul(ah2, bl1) | 0;
          hi = hi + Math.imul(ah2, bh1) | 0;
          lo = lo + Math.imul(al1, bl2) | 0;
          mid = mid + Math.imul(al1, bh2) | 0;
          mid = mid + Math.imul(ah1, bl2) | 0;
          hi = hi + Math.imul(ah1, bh2) | 0;
          lo = lo + Math.imul(al0, bl3) | 0;
          mid = mid + Math.imul(al0, bh3) | 0;
          mid = mid + Math.imul(ah0, bl3) | 0;
          hi = hi + Math.imul(ah0, bh3) | 0;
          var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
          w3 &= 67108863;
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = mid + Math.imul(ah4, bl0) | 0;
          hi = Math.imul(ah4, bh0);
          lo = lo + Math.imul(al3, bl1) | 0;
          mid = mid + Math.imul(al3, bh1) | 0;
          mid = mid + Math.imul(ah3, bl1) | 0;
          hi = hi + Math.imul(ah3, bh1) | 0;
          lo = lo + Math.imul(al2, bl2) | 0;
          mid = mid + Math.imul(al2, bh2) | 0;
          mid = mid + Math.imul(ah2, bl2) | 0;
          hi = hi + Math.imul(ah2, bh2) | 0;
          lo = lo + Math.imul(al1, bl3) | 0;
          mid = mid + Math.imul(al1, bh3) | 0;
          mid = mid + Math.imul(ah1, bl3) | 0;
          hi = hi + Math.imul(ah1, bh3) | 0;
          lo = lo + Math.imul(al0, bl4) | 0;
          mid = mid + Math.imul(al0, bh4) | 0;
          mid = mid + Math.imul(ah0, bl4) | 0;
          hi = hi + Math.imul(ah0, bh4) | 0;
          var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
          w4 &= 67108863;
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = mid + Math.imul(ah5, bl0) | 0;
          hi = Math.imul(ah5, bh0);
          lo = lo + Math.imul(al4, bl1) | 0;
          mid = mid + Math.imul(al4, bh1) | 0;
          mid = mid + Math.imul(ah4, bl1) | 0;
          hi = hi + Math.imul(ah4, bh1) | 0;
          lo = lo + Math.imul(al3, bl2) | 0;
          mid = mid + Math.imul(al3, bh2) | 0;
          mid = mid + Math.imul(ah3, bl2) | 0;
          hi = hi + Math.imul(ah3, bh2) | 0;
          lo = lo + Math.imul(al2, bl3) | 0;
          mid = mid + Math.imul(al2, bh3) | 0;
          mid = mid + Math.imul(ah2, bl3) | 0;
          hi = hi + Math.imul(ah2, bh3) | 0;
          lo = lo + Math.imul(al1, bl4) | 0;
          mid = mid + Math.imul(al1, bh4) | 0;
          mid = mid + Math.imul(ah1, bl4) | 0;
          hi = hi + Math.imul(ah1, bh4) | 0;
          lo = lo + Math.imul(al0, bl5) | 0;
          mid = mid + Math.imul(al0, bh5) | 0;
          mid = mid + Math.imul(ah0, bl5) | 0;
          hi = hi + Math.imul(ah0, bh5) | 0;
          var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
          w5 &= 67108863;
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = mid + Math.imul(ah6, bl0) | 0;
          hi = Math.imul(ah6, bh0);
          lo = lo + Math.imul(al5, bl1) | 0;
          mid = mid + Math.imul(al5, bh1) | 0;
          mid = mid + Math.imul(ah5, bl1) | 0;
          hi = hi + Math.imul(ah5, bh1) | 0;
          lo = lo + Math.imul(al4, bl2) | 0;
          mid = mid + Math.imul(al4, bh2) | 0;
          mid = mid + Math.imul(ah4, bl2) | 0;
          hi = hi + Math.imul(ah4, bh2) | 0;
          lo = lo + Math.imul(al3, bl3) | 0;
          mid = mid + Math.imul(al3, bh3) | 0;
          mid = mid + Math.imul(ah3, bl3) | 0;
          hi = hi + Math.imul(ah3, bh3) | 0;
          lo = lo + Math.imul(al2, bl4) | 0;
          mid = mid + Math.imul(al2, bh4) | 0;
          mid = mid + Math.imul(ah2, bl4) | 0;
          hi = hi + Math.imul(ah2, bh4) | 0;
          lo = lo + Math.imul(al1, bl5) | 0;
          mid = mid + Math.imul(al1, bh5) | 0;
          mid = mid + Math.imul(ah1, bl5) | 0;
          hi = hi + Math.imul(ah1, bh5) | 0;
          lo = lo + Math.imul(al0, bl6) | 0;
          mid = mid + Math.imul(al0, bh6) | 0;
          mid = mid + Math.imul(ah0, bl6) | 0;
          hi = hi + Math.imul(ah0, bh6) | 0;
          var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
          w6 &= 67108863;
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = mid + Math.imul(ah7, bl0) | 0;
          hi = Math.imul(ah7, bh0);
          lo = lo + Math.imul(al6, bl1) | 0;
          mid = mid + Math.imul(al6, bh1) | 0;
          mid = mid + Math.imul(ah6, bl1) | 0;
          hi = hi + Math.imul(ah6, bh1) | 0;
          lo = lo + Math.imul(al5, bl2) | 0;
          mid = mid + Math.imul(al5, bh2) | 0;
          mid = mid + Math.imul(ah5, bl2) | 0;
          hi = hi + Math.imul(ah5, bh2) | 0;
          lo = lo + Math.imul(al4, bl3) | 0;
          mid = mid + Math.imul(al4, bh3) | 0;
          mid = mid + Math.imul(ah4, bl3) | 0;
          hi = hi + Math.imul(ah4, bh3) | 0;
          lo = lo + Math.imul(al3, bl4) | 0;
          mid = mid + Math.imul(al3, bh4) | 0;
          mid = mid + Math.imul(ah3, bl4) | 0;
          hi = hi + Math.imul(ah3, bh4) | 0;
          lo = lo + Math.imul(al2, bl5) | 0;
          mid = mid + Math.imul(al2, bh5) | 0;
          mid = mid + Math.imul(ah2, bl5) | 0;
          hi = hi + Math.imul(ah2, bh5) | 0;
          lo = lo + Math.imul(al1, bl6) | 0;
          mid = mid + Math.imul(al1, bh6) | 0;
          mid = mid + Math.imul(ah1, bl6) | 0;
          hi = hi + Math.imul(ah1, bh6) | 0;
          lo = lo + Math.imul(al0, bl7) | 0;
          mid = mid + Math.imul(al0, bh7) | 0;
          mid = mid + Math.imul(ah0, bl7) | 0;
          hi = hi + Math.imul(ah0, bh7) | 0;
          var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
          w7 &= 67108863;
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = mid + Math.imul(ah8, bl0) | 0;
          hi = Math.imul(ah8, bh0);
          lo = lo + Math.imul(al7, bl1) | 0;
          mid = mid + Math.imul(al7, bh1) | 0;
          mid = mid + Math.imul(ah7, bl1) | 0;
          hi = hi + Math.imul(ah7, bh1) | 0;
          lo = lo + Math.imul(al6, bl2) | 0;
          mid = mid + Math.imul(al6, bh2) | 0;
          mid = mid + Math.imul(ah6, bl2) | 0;
          hi = hi + Math.imul(ah6, bh2) | 0;
          lo = lo + Math.imul(al5, bl3) | 0;
          mid = mid + Math.imul(al5, bh3) | 0;
          mid = mid + Math.imul(ah5, bl3) | 0;
          hi = hi + Math.imul(ah5, bh3) | 0;
          lo = lo + Math.imul(al4, bl4) | 0;
          mid = mid + Math.imul(al4, bh4) | 0;
          mid = mid + Math.imul(ah4, bl4) | 0;
          hi = hi + Math.imul(ah4, bh4) | 0;
          lo = lo + Math.imul(al3, bl5) | 0;
          mid = mid + Math.imul(al3, bh5) | 0;
          mid = mid + Math.imul(ah3, bl5) | 0;
          hi = hi + Math.imul(ah3, bh5) | 0;
          lo = lo + Math.imul(al2, bl6) | 0;
          mid = mid + Math.imul(al2, bh6) | 0;
          mid = mid + Math.imul(ah2, bl6) | 0;
          hi = hi + Math.imul(ah2, bh6) | 0;
          lo = lo + Math.imul(al1, bl7) | 0;
          mid = mid + Math.imul(al1, bh7) | 0;
          mid = mid + Math.imul(ah1, bl7) | 0;
          hi = hi + Math.imul(ah1, bh7) | 0;
          lo = lo + Math.imul(al0, bl8) | 0;
          mid = mid + Math.imul(al0, bh8) | 0;
          mid = mid + Math.imul(ah0, bl8) | 0;
          hi = hi + Math.imul(ah0, bh8) | 0;
          var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
          w8 &= 67108863;
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = mid + Math.imul(ah9, bl0) | 0;
          hi = Math.imul(ah9, bh0);
          lo = lo + Math.imul(al8, bl1) | 0;
          mid = mid + Math.imul(al8, bh1) | 0;
          mid = mid + Math.imul(ah8, bl1) | 0;
          hi = hi + Math.imul(ah8, bh1) | 0;
          lo = lo + Math.imul(al7, bl2) | 0;
          mid = mid + Math.imul(al7, bh2) | 0;
          mid = mid + Math.imul(ah7, bl2) | 0;
          hi = hi + Math.imul(ah7, bh2) | 0;
          lo = lo + Math.imul(al6, bl3) | 0;
          mid = mid + Math.imul(al6, bh3) | 0;
          mid = mid + Math.imul(ah6, bl3) | 0;
          hi = hi + Math.imul(ah6, bh3) | 0;
          lo = lo + Math.imul(al5, bl4) | 0;
          mid = mid + Math.imul(al5, bh4) | 0;
          mid = mid + Math.imul(ah5, bl4) | 0;
          hi = hi + Math.imul(ah5, bh4) | 0;
          lo = lo + Math.imul(al4, bl5) | 0;
          mid = mid + Math.imul(al4, bh5) | 0;
          mid = mid + Math.imul(ah4, bl5) | 0;
          hi = hi + Math.imul(ah4, bh5) | 0;
          lo = lo + Math.imul(al3, bl6) | 0;
          mid = mid + Math.imul(al3, bh6) | 0;
          mid = mid + Math.imul(ah3, bl6) | 0;
          hi = hi + Math.imul(ah3, bh6) | 0;
          lo = lo + Math.imul(al2, bl7) | 0;
          mid = mid + Math.imul(al2, bh7) | 0;
          mid = mid + Math.imul(ah2, bl7) | 0;
          hi = hi + Math.imul(ah2, bh7) | 0;
          lo = lo + Math.imul(al1, bl8) | 0;
          mid = mid + Math.imul(al1, bh8) | 0;
          mid = mid + Math.imul(ah1, bl8) | 0;
          hi = hi + Math.imul(ah1, bh8) | 0;
          lo = lo + Math.imul(al0, bl9) | 0;
          mid = mid + Math.imul(al0, bh9) | 0;
          mid = mid + Math.imul(ah0, bl9) | 0;
          hi = hi + Math.imul(ah0, bh9) | 0;
          var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
          w9 &= 67108863;
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = mid + Math.imul(ah9, bl1) | 0;
          hi = Math.imul(ah9, bh1);
          lo = lo + Math.imul(al8, bl2) | 0;
          mid = mid + Math.imul(al8, bh2) | 0;
          mid = mid + Math.imul(ah8, bl2) | 0;
          hi = hi + Math.imul(ah8, bh2) | 0;
          lo = lo + Math.imul(al7, bl3) | 0;
          mid = mid + Math.imul(al7, bh3) | 0;
          mid = mid + Math.imul(ah7, bl3) | 0;
          hi = hi + Math.imul(ah7, bh3) | 0;
          lo = lo + Math.imul(al6, bl4) | 0;
          mid = mid + Math.imul(al6, bh4) | 0;
          mid = mid + Math.imul(ah6, bl4) | 0;
          hi = hi + Math.imul(ah6, bh4) | 0;
          lo = lo + Math.imul(al5, bl5) | 0;
          mid = mid + Math.imul(al5, bh5) | 0;
          mid = mid + Math.imul(ah5, bl5) | 0;
          hi = hi + Math.imul(ah5, bh5) | 0;
          lo = lo + Math.imul(al4, bl6) | 0;
          mid = mid + Math.imul(al4, bh6) | 0;
          mid = mid + Math.imul(ah4, bl6) | 0;
          hi = hi + Math.imul(ah4, bh6) | 0;
          lo = lo + Math.imul(al3, bl7) | 0;
          mid = mid + Math.imul(al3, bh7) | 0;
          mid = mid + Math.imul(ah3, bl7) | 0;
          hi = hi + Math.imul(ah3, bh7) | 0;
          lo = lo + Math.imul(al2, bl8) | 0;
          mid = mid + Math.imul(al2, bh8) | 0;
          mid = mid + Math.imul(ah2, bl8) | 0;
          hi = hi + Math.imul(ah2, bh8) | 0;
          lo = lo + Math.imul(al1, bl9) | 0;
          mid = mid + Math.imul(al1, bh9) | 0;
          mid = mid + Math.imul(ah1, bl9) | 0;
          hi = hi + Math.imul(ah1, bh9) | 0;
          var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
          w10 &= 67108863;
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = mid + Math.imul(ah9, bl2) | 0;
          hi = Math.imul(ah9, bh2);
          lo = lo + Math.imul(al8, bl3) | 0;
          mid = mid + Math.imul(al8, bh3) | 0;
          mid = mid + Math.imul(ah8, bl3) | 0;
          hi = hi + Math.imul(ah8, bh3) | 0;
          lo = lo + Math.imul(al7, bl4) | 0;
          mid = mid + Math.imul(al7, bh4) | 0;
          mid = mid + Math.imul(ah7, bl4) | 0;
          hi = hi + Math.imul(ah7, bh4) | 0;
          lo = lo + Math.imul(al6, bl5) | 0;
          mid = mid + Math.imul(al6, bh5) | 0;
          mid = mid + Math.imul(ah6, bl5) | 0;
          hi = hi + Math.imul(ah6, bh5) | 0;
          lo = lo + Math.imul(al5, bl6) | 0;
          mid = mid + Math.imul(al5, bh6) | 0;
          mid = mid + Math.imul(ah5, bl6) | 0;
          hi = hi + Math.imul(ah5, bh6) | 0;
          lo = lo + Math.imul(al4, bl7) | 0;
          mid = mid + Math.imul(al4, bh7) | 0;
          mid = mid + Math.imul(ah4, bl7) | 0;
          hi = hi + Math.imul(ah4, bh7) | 0;
          lo = lo + Math.imul(al3, bl8) | 0;
          mid = mid + Math.imul(al3, bh8) | 0;
          mid = mid + Math.imul(ah3, bl8) | 0;
          hi = hi + Math.imul(ah3, bh8) | 0;
          lo = lo + Math.imul(al2, bl9) | 0;
          mid = mid + Math.imul(al2, bh9) | 0;
          mid = mid + Math.imul(ah2, bl9) | 0;
          hi = hi + Math.imul(ah2, bh9) | 0;
          var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
          w11 &= 67108863;
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = mid + Math.imul(ah9, bl3) | 0;
          hi = Math.imul(ah9, bh3);
          lo = lo + Math.imul(al8, bl4) | 0;
          mid = mid + Math.imul(al8, bh4) | 0;
          mid = mid + Math.imul(ah8, bl4) | 0;
          hi = hi + Math.imul(ah8, bh4) | 0;
          lo = lo + Math.imul(al7, bl5) | 0;
          mid = mid + Math.imul(al7, bh5) | 0;
          mid = mid + Math.imul(ah7, bl5) | 0;
          hi = hi + Math.imul(ah7, bh5) | 0;
          lo = lo + Math.imul(al6, bl6) | 0;
          mid = mid + Math.imul(al6, bh6) | 0;
          mid = mid + Math.imul(ah6, bl6) | 0;
          hi = hi + Math.imul(ah6, bh6) | 0;
          lo = lo + Math.imul(al5, bl7) | 0;
          mid = mid + Math.imul(al5, bh7) | 0;
          mid = mid + Math.imul(ah5, bl7) | 0;
          hi = hi + Math.imul(ah5, bh7) | 0;
          lo = lo + Math.imul(al4, bl8) | 0;
          mid = mid + Math.imul(al4, bh8) | 0;
          mid = mid + Math.imul(ah4, bl8) | 0;
          hi = hi + Math.imul(ah4, bh8) | 0;
          lo = lo + Math.imul(al3, bl9) | 0;
          mid = mid + Math.imul(al3, bh9) | 0;
          mid = mid + Math.imul(ah3, bl9) | 0;
          hi = hi + Math.imul(ah3, bh9) | 0;
          var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
          w12 &= 67108863;
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = mid + Math.imul(ah9, bl4) | 0;
          hi = Math.imul(ah9, bh4);
          lo = lo + Math.imul(al8, bl5) | 0;
          mid = mid + Math.imul(al8, bh5) | 0;
          mid = mid + Math.imul(ah8, bl5) | 0;
          hi = hi + Math.imul(ah8, bh5) | 0;
          lo = lo + Math.imul(al7, bl6) | 0;
          mid = mid + Math.imul(al7, bh6) | 0;
          mid = mid + Math.imul(ah7, bl6) | 0;
          hi = hi + Math.imul(ah7, bh6) | 0;
          lo = lo + Math.imul(al6, bl7) | 0;
          mid = mid + Math.imul(al6, bh7) | 0;
          mid = mid + Math.imul(ah6, bl7) | 0;
          hi = hi + Math.imul(ah6, bh7) | 0;
          lo = lo + Math.imul(al5, bl8) | 0;
          mid = mid + Math.imul(al5, bh8) | 0;
          mid = mid + Math.imul(ah5, bl8) | 0;
          hi = hi + Math.imul(ah5, bh8) | 0;
          lo = lo + Math.imul(al4, bl9) | 0;
          mid = mid + Math.imul(al4, bh9) | 0;
          mid = mid + Math.imul(ah4, bl9) | 0;
          hi = hi + Math.imul(ah4, bh9) | 0;
          var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
          w13 &= 67108863;
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = mid + Math.imul(ah9, bl5) | 0;
          hi = Math.imul(ah9, bh5);
          lo = lo + Math.imul(al8, bl6) | 0;
          mid = mid + Math.imul(al8, bh6) | 0;
          mid = mid + Math.imul(ah8, bl6) | 0;
          hi = hi + Math.imul(ah8, bh6) | 0;
          lo = lo + Math.imul(al7, bl7) | 0;
          mid = mid + Math.imul(al7, bh7) | 0;
          mid = mid + Math.imul(ah7, bl7) | 0;
          hi = hi + Math.imul(ah7, bh7) | 0;
          lo = lo + Math.imul(al6, bl8) | 0;
          mid = mid + Math.imul(al6, bh8) | 0;
          mid = mid + Math.imul(ah6, bl8) | 0;
          hi = hi + Math.imul(ah6, bh8) | 0;
          lo = lo + Math.imul(al5, bl9) | 0;
          mid = mid + Math.imul(al5, bh9) | 0;
          mid = mid + Math.imul(ah5, bl9) | 0;
          hi = hi + Math.imul(ah5, bh9) | 0;
          var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
          w14 &= 67108863;
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = mid + Math.imul(ah9, bl6) | 0;
          hi = Math.imul(ah9, bh6);
          lo = lo + Math.imul(al8, bl7) | 0;
          mid = mid + Math.imul(al8, bh7) | 0;
          mid = mid + Math.imul(ah8, bl7) | 0;
          hi = hi + Math.imul(ah8, bh7) | 0;
          lo = lo + Math.imul(al7, bl8) | 0;
          mid = mid + Math.imul(al7, bh8) | 0;
          mid = mid + Math.imul(ah7, bl8) | 0;
          hi = hi + Math.imul(ah7, bh8) | 0;
          lo = lo + Math.imul(al6, bl9) | 0;
          mid = mid + Math.imul(al6, bh9) | 0;
          mid = mid + Math.imul(ah6, bl9) | 0;
          hi = hi + Math.imul(ah6, bh9) | 0;
          var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
          w15 &= 67108863;
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = mid + Math.imul(ah9, bl7) | 0;
          hi = Math.imul(ah9, bh7);
          lo = lo + Math.imul(al8, bl8) | 0;
          mid = mid + Math.imul(al8, bh8) | 0;
          mid = mid + Math.imul(ah8, bl8) | 0;
          hi = hi + Math.imul(ah8, bh8) | 0;
          lo = lo + Math.imul(al7, bl9) | 0;
          mid = mid + Math.imul(al7, bh9) | 0;
          mid = mid + Math.imul(ah7, bl9) | 0;
          hi = hi + Math.imul(ah7, bh9) | 0;
          var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
          w16 &= 67108863;
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = mid + Math.imul(ah9, bl8) | 0;
          hi = Math.imul(ah9, bh8);
          lo = lo + Math.imul(al8, bl9) | 0;
          mid = mid + Math.imul(al8, bh9) | 0;
          mid = mid + Math.imul(ah8, bl9) | 0;
          hi = hi + Math.imul(ah8, bh9) | 0;
          var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
          w17 &= 67108863;
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = mid + Math.imul(ah9, bl9) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
          w18 &= 67108863;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }
        function bigMulTo(self2, num, out) {
          out.negative = num.negative ^ self2.negative;
          out.length = self2.length + num.length;
          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 67108863;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self2.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self2.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;
              var lo = r & 67108863;
              ncarry = ncarry + (r / 67108864 | 0) | 0;
              lo = lo + rword | 0;
              rword = lo & 67108863;
              ncarry = ncarry + (lo >>> 26) | 0;
              hncarry += ncarry >>> 26;
              ncarry &= 67108863;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }
          return out.strip();
        }
        function jumboMulTo(self2, num, out) {
          var fftm = new FFTM();
          return fftm.mulp(self2, num, out);
        }
        BN.prototype.mulTo = function mulTo(num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }
          return res;
        };
        function FFTM(x, y) {
          this.x = x;
          this.y = y;
        }
        FFTM.prototype.makeRBT = function makeRBT(N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }
          return t;
        };
        FFTM.prototype.revBin = function revBin(x, l, N) {
          if (x === 0 || x === N - 1)
            return x;
          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
          }
          return rb;
        };
        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };
        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);
          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;
            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);
            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;
              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];
                var ro = rtws[p + j + s];
                var io = itws[p + j + s];
                var rx = rtwdf_ * ro - itwdf_ * io;
                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;
                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;
                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };
        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }
          return 1 << i + 1 + odd;
        };
        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
          if (N <= 1)
            return;
          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];
            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;
            t = iws[i];
            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };
        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 8192 + Math.round(ws[2 * i] / N) + carry;
            ws[i] = w & 67108863;
            if (w < 67108864) {
              carry = 0;
            } else {
              carry = w / 67108864 | 0;
            }
          }
          return ws;
        };
        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);
            rws[2 * i] = carry & 8191;
            carry = carry >>> 13;
            rws[2 * i + 1] = carry & 8191;
            carry = carry >>> 13;
          }
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }
          assert(carry === 0);
          assert((carry & ~8191) === 0);
        };
        FFTM.prototype.stub = function stub(N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }
          return ph;
        };
        FFTM.prototype.mulp = function mulp(x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);
          var rbt = this.makeRBT(N);
          var _2 = this.stub(N);
          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);
          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);
          var rmws = out.words;
          rmws.length = N;
          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);
          this.transform(rws, _2, rwst, iwst, N, rbt);
          this.transform(nrws, _2, nrwst, niwst, N, rbt);
          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }
          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _2, N, rbt);
          this.conjugate(rmws, _2, N);
          this.normalize13b(rmws, N);
          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out.strip();
        };
        BN.prototype.mul = function mul(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };
        BN.prototype.mulf = function mulf(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };
        BN.prototype.imul = function imul(num) {
          return this.clone().mulTo(num, this);
        };
        BN.prototype.imuln = function imuln(num) {
          assert(typeof num === "number");
          assert(num < 67108864);
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 67108863) + (carry & 67108863);
            carry >>= 26;
            carry += w / 67108864 | 0;
            carry += lo >>> 26;
            this.words[i] = lo & 67108863;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };
        BN.prototype.muln = function muln(num) {
          return this.clone().imuln(num);
        };
        BN.prototype.sqr = function sqr() {
          return this.mul(this);
        };
        BN.prototype.isqr = function isqr() {
          return this.imul(this.clone());
        };
        BN.prototype.pow = function pow(num) {
          var w = toBitArray(num);
          if (w.length === 0)
            return new BN(1);
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0)
              break;
          }
          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0)
                continue;
              res = res.mul(q);
            }
          }
          return res;
        };
        BN.prototype.iushln = function iushln(bits) {
          assert(typeof bits === "number" && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = 67108863 >>> 26 - r << 26 - r;
          var i;
          if (r !== 0) {
            var carry = 0;
            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = (this.words[i] | 0) - newCarry << r;
              this.words[i] = c | carry;
              carry = newCarry >>> 26 - r;
            }
            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }
          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }
            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }
            this.length += s;
          }
          return this.strip();
        };
        BN.prototype.ishln = function ishln(bits) {
          assert(this.negative === 0);
          return this.iushln(bits);
        };
        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
          assert(typeof bits === "number" && bits >= 0);
          var h;
          if (hint) {
            h = (hint - hint % 26) / 26;
          } else {
            h = 0;
          }
          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 67108863 ^ 67108863 >>> r << r;
          var maskedWords = extended;
          h -= s;
          h = Math.max(0, h);
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }
          if (s === 0) {
          } else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }
          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
          }
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }
          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }
          return this.strip();
        };
        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };
        BN.prototype.shln = function shln(bits) {
          return this.clone().ishln(bits);
        };
        BN.prototype.ushln = function ushln(bits) {
          return this.clone().iushln(bits);
        };
        BN.prototype.shrn = function shrn(bits) {
          return this.clone().ishrn(bits);
        };
        BN.prototype.ushrn = function ushrn(bits) {
          return this.clone().iushrn(bits);
        };
        BN.prototype.testn = function testn(bit) {
          assert(typeof bit === "number" && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s)
            return false;
          var w = this.words[s];
          return !!(w & q);
        };
        BN.prototype.imaskn = function imaskn(bits) {
          assert(typeof bits === "number" && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          assert(this.negative === 0, "imaskn works only with positive numbers");
          if (this.length <= s) {
            return this;
          }
          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);
          if (r !== 0) {
            var mask = 67108863 ^ 67108863 >>> r << r;
            this.words[this.length - 1] &= mask;
          }
          return this.strip();
        };
        BN.prototype.maskn = function maskn(bits) {
          return this.clone().imaskn(bits);
        };
        BN.prototype.iaddn = function iaddn(num) {
          assert(typeof num === "number");
          assert(num < 67108864);
          if (num < 0)
            return this.isubn(-num);
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) < num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }
            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }
          return this._iaddn(num);
        };
        BN.prototype._iaddn = function _iaddn(num) {
          this.words[0] += num;
          for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) {
            this.words[i] -= 67108864;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);
          return this;
        };
        BN.prototype.isubn = function isubn(num) {
          assert(typeof num === "number");
          assert(num < 67108864);
          if (num < 0)
            return this.iaddn(-num);
          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }
          this.words[0] -= num;
          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 67108864;
              this.words[i + 1] -= 1;
            }
          }
          return this.strip();
        };
        BN.prototype.addn = function addn(num) {
          return this.clone().iaddn(num);
        };
        BN.prototype.subn = function subn(num) {
          return this.clone().isubn(num);
        };
        BN.prototype.iabs = function iabs() {
          this.negative = 0;
          return this;
        };
        BN.prototype.abs = function abs() {
          return this.clone().iabs();
        };
        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
          var len = num.length + shift;
          var i;
          this._expand(len);
          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 67108863;
            carry = (w >> 26) - (right / 67108864 | 0);
            this.words[i + shift] = w & 67108863;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 67108863;
          }
          if (carry === 0)
            return this.strip();
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 67108863;
          }
          this.negative = 1;
          return this.strip();
        };
        BN.prototype._wordDiv = function _wordDiv(num, mode) {
          var shift = this.length - num.length;
          var a = this.clone();
          var b = num;
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }
          var m = a.length - b.length;
          var q;
          if (mode !== "mod") {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }
          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }
          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
            qj = Math.min(qj / bhi | 0, 67108863);
            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q.strip();
          }
          a.strip();
          if (mode !== "div" && shift !== 0) {
            a.iushrn(shift);
          }
          return {
            div: q || null,
            mod: a
          };
        };
        BN.prototype.divmod = function divmod(num, mode, positive) {
          assert(!num.isZero());
          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }
          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);
            if (mode !== "mod") {
              div = res.div.neg();
            }
            if (mode !== "div") {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }
            return {
              div,
              mod
            };
          }
          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);
            if (mode !== "mod") {
              div = res.div.neg();
            }
            return {
              div,
              mod: res.mod
            };
          }
          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);
            if (mode !== "div") {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }
            return {
              div: res.div,
              mod
            };
          }
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }
          if (num.length === 1) {
            if (mode === "div") {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }
            if (mode === "mod") {
              return {
                div: null,
                mod: new BN(this.modn(num.words[0]))
              };
            }
            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modn(num.words[0]))
            };
          }
          return this._wordDiv(num, mode);
        };
        BN.prototype.div = function div(num) {
          return this.divmod(num, "div", false).div;
        };
        BN.prototype.mod = function mod(num) {
          return this.divmod(num, "mod", false).mod;
        };
        BN.prototype.umod = function umod(num) {
          return this.divmod(num, "mod", true).mod;
        };
        BN.prototype.divRound = function divRound(num) {
          var dm = this.divmod(num);
          if (dm.mod.isZero())
            return dm.div;
          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);
          if (cmp < 0 || r2 === 1 && cmp === 0)
            return dm.div;
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };
        BN.prototype.modn = function modn(num) {
          assert(num <= 67108863);
          var p = (1 << 26) % num;
          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }
          return acc;
        };
        BN.prototype.idivn = function idivn(num) {
          assert(num <= 67108863);
          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 67108864;
            this.words[i] = w / num | 0;
            carry = w % num;
          }
          return this.strip();
        };
        BN.prototype.divn = function divn(num) {
          return this.clone().idivn(num);
        };
        BN.prototype.egcd = function egcd(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var x = this;
          var y = p.clone();
          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }
          var A = new BN(1);
          var B = new BN(0);
          var C = new BN(0);
          var D = new BN(1);
          var g = 0;
          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }
          var yp = y.clone();
          var xp = x.clone();
          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
              ;
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }
                A.iushrn(1);
                B.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
              ;
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }
                C.iushrn(1);
                D.iushrn(1);
              }
            }
            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }
          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };
        BN.prototype._invmp = function _invmp(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var a = this;
          var b = p.clone();
          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }
          var x1 = new BN(1);
          var x2 = new BN(0);
          var delta = b.clone();
          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1)
              ;
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }
                x1.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
              ;
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }
                x2.iushrn(1);
              }
            }
            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }
          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }
          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }
          return res;
        };
        BN.prototype.gcd = function gcd(num) {
          if (this.isZero())
            return num.abs();
          if (num.isZero())
            return this.abs();
          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }
          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }
            var r = a.cmp(b);
            if (r < 0) {
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }
            a.isub(b);
          } while (true);
          return b.iushln(shift);
        };
        BN.prototype.invm = function invm(num) {
          return this.egcd(num).a.umod(num);
        };
        BN.prototype.isEven = function isEven() {
          return (this.words[0] & 1) === 0;
        };
        BN.prototype.isOdd = function isOdd() {
          return (this.words[0] & 1) === 1;
        };
        BN.prototype.andln = function andln(num) {
          return this.words[0] & num;
        };
        BN.prototype.bincn = function bincn(bit) {
          assert(typeof bit === "number");
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 67108863;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };
        BN.prototype.isZero = function isZero() {
          return this.length === 1 && this.words[0] === 0;
        };
        BN.prototype.cmpn = function cmpn(num) {
          var negative = num < 0;
          if (this.negative !== 0 && !negative)
            return -1;
          if (this.negative === 0 && negative)
            return 1;
          this.strip();
          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }
            assert(num <= 67108863, "Number is too big");
            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0)
            return -res | 0;
          return res;
        };
        BN.prototype.cmp = function cmp(num) {
          if (this.negative !== 0 && num.negative === 0)
            return -1;
          if (this.negative === 0 && num.negative !== 0)
            return 1;
          var res = this.ucmp(num);
          if (this.negative !== 0)
            return -res | 0;
          return res;
        };
        BN.prototype.ucmp = function ucmp(num) {
          if (this.length > num.length)
            return 1;
          if (this.length < num.length)
            return -1;
          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;
            if (a === b)
              continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };
        BN.prototype.gtn = function gtn(num) {
          return this.cmpn(num) === 1;
        };
        BN.prototype.gt = function gt(num) {
          return this.cmp(num) === 1;
        };
        BN.prototype.gten = function gten(num) {
          return this.cmpn(num) >= 0;
        };
        BN.prototype.gte = function gte(num) {
          return this.cmp(num) >= 0;
        };
        BN.prototype.ltn = function ltn(num) {
          return this.cmpn(num) === -1;
        };
        BN.prototype.lt = function lt(num) {
          return this.cmp(num) === -1;
        };
        BN.prototype.lten = function lten(num) {
          return this.cmpn(num) <= 0;
        };
        BN.prototype.lte = function lte(num) {
          return this.cmp(num) <= 0;
        };
        BN.prototype.eqn = function eqn(num) {
          return this.cmpn(num) === 0;
        };
        BN.prototype.eq = function eq(num) {
          return this.cmp(num) === 0;
        };
        BN.red = function red(num) {
          return new Red(num);
        };
        BN.prototype.toRed = function toRed(ctx) {
          assert(!this.red, "Already a number in reduction context");
          assert(this.negative === 0, "red works only with positives");
          return ctx.convertTo(this)._forceRed(ctx);
        };
        BN.prototype.fromRed = function fromRed() {
          assert(this.red, "fromRed works only with numbers in reduction context");
          return this.red.convertFrom(this);
        };
        BN.prototype._forceRed = function _forceRed(ctx) {
          this.red = ctx;
          return this;
        };
        BN.prototype.forceRed = function forceRed(ctx) {
          assert(!this.red, "Already a number in reduction context");
          return this._forceRed(ctx);
        };
        BN.prototype.redAdd = function redAdd(num) {
          assert(this.red, "redAdd works only with red numbers");
          return this.red.add(this, num);
        };
        BN.prototype.redIAdd = function redIAdd(num) {
          assert(this.red, "redIAdd works only with red numbers");
          return this.red.iadd(this, num);
        };
        BN.prototype.redSub = function redSub(num) {
          assert(this.red, "redSub works only with red numbers");
          return this.red.sub(this, num);
        };
        BN.prototype.redISub = function redISub(num) {
          assert(this.red, "redISub works only with red numbers");
          return this.red.isub(this, num);
        };
        BN.prototype.redShl = function redShl(num) {
          assert(this.red, "redShl works only with red numbers");
          return this.red.shl(this, num);
        };
        BN.prototype.redMul = function redMul(num) {
          assert(this.red, "redMul works only with red numbers");
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };
        BN.prototype.redIMul = function redIMul(num) {
          assert(this.red, "redMul works only with red numbers");
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };
        BN.prototype.redSqr = function redSqr() {
          assert(this.red, "redSqr works only with red numbers");
          this.red._verify1(this);
          return this.red.sqr(this);
        };
        BN.prototype.redISqr = function redISqr() {
          assert(this.red, "redISqr works only with red numbers");
          this.red._verify1(this);
          return this.red.isqr(this);
        };
        BN.prototype.redSqrt = function redSqrt() {
          assert(this.red, "redSqrt works only with red numbers");
          this.red._verify1(this);
          return this.red.sqrt(this);
        };
        BN.prototype.redInvm = function redInvm() {
          assert(this.red, "redInvm works only with red numbers");
          this.red._verify1(this);
          return this.red.invm(this);
        };
        BN.prototype.redNeg = function redNeg() {
          assert(this.red, "redNeg works only with red numbers");
          this.red._verify1(this);
          return this.red.neg(this);
        };
        BN.prototype.redPow = function redPow(num) {
          assert(this.red && !num.red, "redPow(normalNum)");
          this.red._verify1(this);
          return this.red.pow(this, num);
        };
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };
        function MPrime(name, p) {
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);
          this.tmp = this._tmp();
        }
        MPrime.prototype._tmp = function _tmp() {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };
        MPrime.prototype.ireduce = function ireduce(num) {
          var r = num;
          var rlen;
          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);
          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            if (r.strip !== void 0) {
              r.strip();
            } else {
              r._strip();
            }
          }
          return r;
        };
        MPrime.prototype.split = function split(input, out) {
          input.iushrn(this.n, 0, out);
        };
        MPrime.prototype.imulK = function imulK(num) {
          return num.imul(this.k);
        };
        function K256() {
          MPrime.call(
            this,
            "k256",
            "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
          );
        }
        inherits(K256, MPrime);
        K256.prototype.split = function split(input, output) {
          var mask = 4194303;
          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;
          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;
          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };
        K256.prototype.imulK = function imulK(num) {
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 977;
            num.words[i] = lo & 67108863;
            lo = w * 64 + (lo / 67108864 | 0);
          }
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };
        function P224() {
          MPrime.call(
            this,
            "p224",
            "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
          );
        }
        inherits(P224, MPrime);
        function P192() {
          MPrime.call(
            this,
            "p192",
            "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
          );
        }
        inherits(P192, MPrime);
        function P25519() {
          MPrime.call(
            this,
            "25519",
            "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
          );
        }
        inherits(P25519, MPrime);
        P25519.prototype.imulK = function imulK(num) {
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 19 + carry;
            var lo = hi & 67108863;
            hi >>>= 26;
            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };
        BN._prime = function prime(name) {
          if (primes[name])
            return primes[name];
          var prime2;
          if (name === "k256") {
            prime2 = new K256();
          } else if (name === "p224") {
            prime2 = new P224();
          } else if (name === "p192") {
            prime2 = new P192();
          } else if (name === "p25519") {
            prime2 = new P25519();
          } else {
            throw new Error("Unknown prime " + name);
          }
          primes[name] = prime2;
          return prime2;
        };
        function Red(m) {
          if (typeof m === "string") {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), "modulus must be greater than 1");
            this.m = m;
            this.prime = null;
          }
        }
        Red.prototype._verify1 = function _verify1(a) {
          assert(a.negative === 0, "red works only with positives");
          assert(a.red, "red works only with red numbers");
        };
        Red.prototype._verify2 = function _verify2(a, b) {
          assert((a.negative | b.negative) === 0, "red works only with positives");
          assert(
            a.red && a.red === b.red,
            "red works only with red numbers"
          );
        };
        Red.prototype.imod = function imod(a) {
          if (this.prime)
            return this.prime.ireduce(a)._forceRed(this);
          return a.umod(this.m)._forceRed(this);
        };
        Red.prototype.neg = function neg(a) {
          if (a.isZero()) {
            return a.clone();
          }
          return this.m.sub(a)._forceRed(this);
        };
        Red.prototype.add = function add(a, b) {
          this._verify2(a, b);
          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.iadd = function iadd(a, b) {
          this._verify2(a, b);
          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };
        Red.prototype.sub = function sub(a, b) {
          this._verify2(a, b);
          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.isub = function isub(a, b) {
          this._verify2(a, b);
          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };
        Red.prototype.shl = function shl(a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };
        Red.prototype.imul = function imul(a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };
        Red.prototype.mul = function mul(a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };
        Red.prototype.isqr = function isqr(a) {
          return this.imul(a, a.clone());
        };
        Red.prototype.sqr = function sqr(a) {
          return this.mul(a, a);
        };
        Red.prototype.sqrt = function sqrt(a) {
          if (a.isZero())
            return a.clone();
          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());
          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);
          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }
          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));
            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }
          return r;
        };
        Red.prototype.invm = function invm(a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };
        Red.prototype.pow = function pow(a, num) {
          if (num.isZero())
            return new BN(1).toRed(this);
          if (num.cmpn(1) === 0)
            return a.clone();
          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }
          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }
          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = word >> j & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }
              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }
              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0))
                continue;
              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }
          return res;
        };
        Red.prototype.convertTo = function convertTo(num) {
          var r = num.umod(this.m);
          return r === num ? r.clone() : r;
        };
        Red.prototype.convertFrom = function convertFrom(num) {
          var res = num.clone();
          res.red = null;
          return res;
        };
        BN.mont = function mont(num) {
          return new Mont(num);
        };
        function Mont(m) {
          Red.call(this, m);
          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }
          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);
          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);
        Mont.prototype.convertTo = function convertTo(num) {
          return this.imod(num.ushln(this.shift));
        };
        Mont.prototype.convertFrom = function convertFrom(num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };
        Mont.prototype.imul = function imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }
          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.mul = function mul(a, b) {
          if (a.isZero() || b.isZero())
            return new BN(0)._forceRed(this);
          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.invm = function invm(a) {
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })(typeof module === "undefined" || module, exports);
    }
  });

  // node_modules/minimalistic-assert/index.js
  var require_minimalistic_assert = __commonJS({
    "node_modules/minimalistic-assert/index.js"(exports, module) {
      module.exports = assert;
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      assert.equal = function assertEqual(l, r, msg) {
        if (l != r)
          throw new Error(msg || "Assertion failed: " + l + " != " + r);
      };
    }
  });

  // node_modules/minimalistic-crypto-utils/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/minimalistic-crypto-utils/lib/utils.js"(exports) {
      "use strict";
      var utils = exports;
      function toArray(msg, enc) {
        if (Array.isArray(msg))
          return msg.slice();
        if (!msg)
          return [];
        var res = [];
        if (typeof msg !== "string") {
          for (var i = 0; i < msg.length; i++)
            res[i] = msg[i] | 0;
          return res;
        }
        if (enc === "hex") {
          msg = msg.replace(/[^a-z0-9]+/ig, "");
          if (msg.length % 2 !== 0)
            msg = "0" + msg;
          for (var i = 0; i < msg.length; i += 2)
            res.push(parseInt(msg[i] + msg[i + 1], 16));
        } else {
          for (var i = 0; i < msg.length; i++) {
            var c = msg.charCodeAt(i);
            var hi = c >> 8;
            var lo = c & 255;
            if (hi)
              res.push(hi, lo);
            else
              res.push(lo);
          }
        }
        return res;
      }
      utils.toArray = toArray;
      function zero2(word) {
        if (word.length === 1)
          return "0" + word;
        else
          return word;
      }
      utils.zero2 = zero2;
      function toHex(msg) {
        var res = "";
        for (var i = 0; i < msg.length; i++)
          res += zero2(msg[i].toString(16));
        return res;
      }
      utils.toHex = toHex;
      utils.encode = function encode(arr, enc) {
        if (enc === "hex")
          return toHex(arr);
        else
          return arr;
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/utils.js
  var require_utils2 = __commonJS({
    "node_modules/elliptic/lib/elliptic/utils.js"(exports) {
      "use strict";
      var utils = exports;
      var BN = require_bn2();
      var minAssert = require_minimalistic_assert();
      var minUtils = require_utils();
      utils.assert = minAssert;
      utils.toArray = minUtils.toArray;
      utils.zero2 = minUtils.zero2;
      utils.toHex = minUtils.toHex;
      utils.encode = minUtils.encode;
      function getNAF(num, w, bits) {
        var naf = new Array(Math.max(num.bitLength(), bits) + 1);
        naf.fill(0);
        var ws = 1 << w + 1;
        var k = num.clone();
        for (var i = 0; i < naf.length; i++) {
          var z;
          var mod = k.andln(ws - 1);
          if (k.isOdd()) {
            if (mod > (ws >> 1) - 1)
              z = (ws >> 1) - mod;
            else
              z = mod;
            k.isubn(z);
          } else {
            z = 0;
          }
          naf[i] = z;
          k.iushrn(1);
        }
        return naf;
      }
      utils.getNAF = getNAF;
      function getJSF(k1, k2) {
        var jsf = [
          [],
          []
        ];
        k1 = k1.clone();
        k2 = k2.clone();
        var d1 = 0;
        var d2 = 0;
        var m8;
        while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
          var m14 = k1.andln(3) + d1 & 3;
          var m24 = k2.andln(3) + d2 & 3;
          if (m14 === 3)
            m14 = -1;
          if (m24 === 3)
            m24 = -1;
          var u1;
          if ((m14 & 1) === 0) {
            u1 = 0;
          } else {
            m8 = k1.andln(7) + d1 & 7;
            if ((m8 === 3 || m8 === 5) && m24 === 2)
              u1 = -m14;
            else
              u1 = m14;
          }
          jsf[0].push(u1);
          var u2;
          if ((m24 & 1) === 0) {
            u2 = 0;
          } else {
            m8 = k2.andln(7) + d2 & 7;
            if ((m8 === 3 || m8 === 5) && m14 === 2)
              u2 = -m24;
            else
              u2 = m24;
          }
          jsf[1].push(u2);
          if (2 * d1 === u1 + 1)
            d1 = 1 - d1;
          if (2 * d2 === u2 + 1)
            d2 = 1 - d2;
          k1.iushrn(1);
          k2.iushrn(1);
        }
        return jsf;
      }
      utils.getJSF = getJSF;
      function cachedProperty(obj, name, computer) {
        var key = "_" + name;
        obj.prototype[name] = function cachedProperty2() {
          return this[key] !== void 0 ? this[key] : this[key] = computer.call(this);
        };
      }
      utils.cachedProperty = cachedProperty;
      function parseBytes(bytes) {
        return typeof bytes === "string" ? utils.toArray(bytes, "hex") : bytes;
      }
      utils.parseBytes = parseBytes;
      function intFromLE(bytes) {
        return new BN(bytes, "hex", "le");
      }
      utils.intFromLE = intFromLE;
    }
  });

  // (disabled):crypto
  var require_crypto = __commonJS({
    "(disabled):crypto"() {
    }
  });

  // node_modules/brorand/index.js
  var require_brorand = __commonJS({
    "node_modules/brorand/index.js"(exports, module) {
      var r;
      module.exports = function rand(len) {
        if (!r)
          r = new Rand(null);
        return r.generate(len);
      };
      function Rand(rand) {
        this.rand = rand;
      }
      module.exports.Rand = Rand;
      Rand.prototype.generate = function generate(len) {
        return this._rand(len);
      };
      Rand.prototype._rand = function _rand(n) {
        if (this.rand.getBytes)
          return this.rand.getBytes(n);
        var res = new Uint8Array(n);
        for (var i = 0; i < res.length; i++)
          res[i] = this.rand.getByte();
        return res;
      };
      if (typeof self === "object") {
        if (self.crypto && self.crypto.getRandomValues) {
          Rand.prototype._rand = function _rand(n) {
            var arr = new Uint8Array(n);
            self.crypto.getRandomValues(arr);
            return arr;
          };
        } else if (self.msCrypto && self.msCrypto.getRandomValues) {
          Rand.prototype._rand = function _rand(n) {
            var arr = new Uint8Array(n);
            self.msCrypto.getRandomValues(arr);
            return arr;
          };
        } else if (typeof window === "object") {
          Rand.prototype._rand = function() {
            throw new Error("Not implemented yet");
          };
        }
      } else {
        try {
          crypto = require_crypto();
          if (typeof crypto.randomBytes !== "function")
            throw new Error("Not supported");
          Rand.prototype._rand = function _rand(n) {
            return crypto.randomBytes(n);
          };
        } catch (e) {
        }
      }
      var crypto;
    }
  });

  // node_modules/elliptic/lib/elliptic/curve/base.js
  var require_base = __commonJS({
    "node_modules/elliptic/lib/elliptic/curve/base.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var utils = require_utils2();
      var getNAF = utils.getNAF;
      var getJSF = utils.getJSF;
      var assert = utils.assert;
      function BaseCurve(type3, conf) {
        this.type = type3;
        this.p = new BN(conf.p, 16);
        this.red = conf.prime ? BN.red(conf.prime) : BN.mont(this.p);
        this.zero = new BN(0).toRed(this.red);
        this.one = new BN(1).toRed(this.red);
        this.two = new BN(2).toRed(this.red);
        this.n = conf.n && new BN(conf.n, 16);
        this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);
        this._wnafT1 = new Array(4);
        this._wnafT2 = new Array(4);
        this._wnafT3 = new Array(4);
        this._wnafT4 = new Array(4);
        this._bitLength = this.n ? this.n.bitLength() : 0;
        var adjustCount = this.n && this.p.div(this.n);
        if (!adjustCount || adjustCount.cmpn(100) > 0) {
          this.redN = null;
        } else {
          this._maxwellTrick = true;
          this.redN = this.n.toRed(this.red);
        }
      }
      module.exports = BaseCurve;
      BaseCurve.prototype.point = function point() {
        throw new Error("Not implemented");
      };
      BaseCurve.prototype.validate = function validate2() {
        throw new Error("Not implemented");
      };
      BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
        assert(p.precomputed);
        var doubles = p._getDoubles();
        var naf = getNAF(k, 1, this._bitLength);
        var I = (1 << doubles.step + 1) - (doubles.step % 2 === 0 ? 2 : 1);
        I /= 3;
        var repr = [];
        var j;
        var nafW;
        for (j = 0; j < naf.length; j += doubles.step) {
          nafW = 0;
          for (var l = j + doubles.step - 1; l >= j; l--)
            nafW = (nafW << 1) + naf[l];
          repr.push(nafW);
        }
        var a = this.jpoint(null, null, null);
        var b = this.jpoint(null, null, null);
        for (var i = I; i > 0; i--) {
          for (j = 0; j < repr.length; j++) {
            nafW = repr[j];
            if (nafW === i)
              b = b.mixedAdd(doubles.points[j]);
            else if (nafW === -i)
              b = b.mixedAdd(doubles.points[j].neg());
          }
          a = a.add(b);
        }
        return a.toP();
      };
      BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
        var w = 4;
        var nafPoints = p._getNAFPoints(w);
        w = nafPoints.wnd;
        var wnd = nafPoints.points;
        var naf = getNAF(k, w, this._bitLength);
        var acc = this.jpoint(null, null, null);
        for (var i = naf.length - 1; i >= 0; i--) {
          for (var l = 0; i >= 0 && naf[i] === 0; i--)
            l++;
          if (i >= 0)
            l++;
          acc = acc.dblp(l);
          if (i < 0)
            break;
          var z = naf[i];
          assert(z !== 0);
          if (p.type === "affine") {
            if (z > 0)
              acc = acc.mixedAdd(wnd[z - 1 >> 1]);
            else
              acc = acc.mixedAdd(wnd[-z - 1 >> 1].neg());
          } else {
            if (z > 0)
              acc = acc.add(wnd[z - 1 >> 1]);
            else
              acc = acc.add(wnd[-z - 1 >> 1].neg());
          }
        }
        return p.type === "affine" ? acc.toP() : acc;
      };
      BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW, points, coeffs, len, jacobianResult) {
        var wndWidth = this._wnafT1;
        var wnd = this._wnafT2;
        var naf = this._wnafT3;
        var max = 0;
        var i;
        var j;
        var p;
        for (i = 0; i < len; i++) {
          p = points[i];
          var nafPoints = p._getNAFPoints(defW);
          wndWidth[i] = nafPoints.wnd;
          wnd[i] = nafPoints.points;
        }
        for (i = len - 1; i >= 1; i -= 2) {
          var a = i - 1;
          var b = i;
          if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
            naf[a] = getNAF(coeffs[a], wndWidth[a], this._bitLength);
            naf[b] = getNAF(coeffs[b], wndWidth[b], this._bitLength);
            max = Math.max(naf[a].length, max);
            max = Math.max(naf[b].length, max);
            continue;
          }
          var comb = [
            points[a],
            null,
            null,
            points[b]
          ];
          if (points[a].y.cmp(points[b].y) === 0) {
            comb[1] = points[a].add(points[b]);
            comb[2] = points[a].toJ().mixedAdd(points[b].neg());
          } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
            comb[1] = points[a].toJ().mixedAdd(points[b]);
            comb[2] = points[a].add(points[b].neg());
          } else {
            comb[1] = points[a].toJ().mixedAdd(points[b]);
            comb[2] = points[a].toJ().mixedAdd(points[b].neg());
          }
          var index = [
            -3,
            -1,
            -5,
            -7,
            0,
            7,
            5,
            1,
            3
          ];
          var jsf = getJSF(coeffs[a], coeffs[b]);
          max = Math.max(jsf[0].length, max);
          naf[a] = new Array(max);
          naf[b] = new Array(max);
          for (j = 0; j < max; j++) {
            var ja = jsf[0][j] | 0;
            var jb = jsf[1][j] | 0;
            naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
            naf[b][j] = 0;
            wnd[a] = comb;
          }
        }
        var acc = this.jpoint(null, null, null);
        var tmp = this._wnafT4;
        for (i = max; i >= 0; i--) {
          var k = 0;
          while (i >= 0) {
            var zero = true;
            for (j = 0; j < len; j++) {
              tmp[j] = naf[j][i] | 0;
              if (tmp[j] !== 0)
                zero = false;
            }
            if (!zero)
              break;
            k++;
            i--;
          }
          if (i >= 0)
            k++;
          acc = acc.dblp(k);
          if (i < 0)
            break;
          for (j = 0; j < len; j++) {
            var z = tmp[j];
            p;
            if (z === 0)
              continue;
            else if (z > 0)
              p = wnd[j][z - 1 >> 1];
            else if (z < 0)
              p = wnd[j][-z - 1 >> 1].neg();
            if (p.type === "affine")
              acc = acc.mixedAdd(p);
            else
              acc = acc.add(p);
          }
        }
        for (i = 0; i < len; i++)
          wnd[i] = null;
        if (jacobianResult)
          return acc;
        else
          return acc.toP();
      };
      function BasePoint(curve, type3) {
        this.curve = curve;
        this.type = type3;
        this.precomputed = null;
      }
      BaseCurve.BasePoint = BasePoint;
      BasePoint.prototype.eq = function eq() {
        throw new Error("Not implemented");
      };
      BasePoint.prototype.validate = function validate2() {
        return this.curve.validate(this);
      };
      BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
        bytes = utils.toArray(bytes, enc);
        var len = this.p.byteLength();
        if ((bytes[0] === 4 || bytes[0] === 6 || bytes[0] === 7) && bytes.length - 1 === 2 * len) {
          if (bytes[0] === 6)
            assert(bytes[bytes.length - 1] % 2 === 0);
          else if (bytes[0] === 7)
            assert(bytes[bytes.length - 1] % 2 === 1);
          var res = this.point(
            bytes.slice(1, 1 + len),
            bytes.slice(1 + len, 1 + 2 * len)
          );
          return res;
        } else if ((bytes[0] === 2 || bytes[0] === 3) && bytes.length - 1 === len) {
          return this.pointFromX(bytes.slice(1, 1 + len), bytes[0] === 3);
        }
        throw new Error("Unknown point format");
      };
      BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
        return this.encode(enc, true);
      };
      BasePoint.prototype._encode = function _encode(compact) {
        var len = this.curve.p.byteLength();
        var x = this.getX().toArray("be", len);
        if (compact)
          return [this.getY().isEven() ? 2 : 3].concat(x);
        return [4].concat(x, this.getY().toArray("be", len));
      };
      BasePoint.prototype.encode = function encode(enc, compact) {
        return utils.encode(this._encode(compact), enc);
      };
      BasePoint.prototype.precompute = function precompute(power) {
        if (this.precomputed)
          return this;
        var precomputed = {
          doubles: null,
          naf: null,
          beta: null
        };
        precomputed.naf = this._getNAFPoints(8);
        precomputed.doubles = this._getDoubles(4, power);
        precomputed.beta = this._getBeta();
        this.precomputed = precomputed;
        return this;
      };
      BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
        if (!this.precomputed)
          return false;
        var doubles = this.precomputed.doubles;
        if (!doubles)
          return false;
        return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step);
      };
      BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
        if (this.precomputed && this.precomputed.doubles)
          return this.precomputed.doubles;
        var doubles = [this];
        var acc = this;
        for (var i = 0; i < power; i += step) {
          for (var j = 0; j < step; j++)
            acc = acc.dbl();
          doubles.push(acc);
        }
        return {
          step,
          points: doubles
        };
      };
      BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
        if (this.precomputed && this.precomputed.naf)
          return this.precomputed.naf;
        var res = [this];
        var max = (1 << wnd) - 1;
        var dbl = max === 1 ? null : this.dbl();
        for (var i = 1; i < max; i++)
          res[i] = res[i - 1].add(dbl);
        return {
          wnd,
          points: res
        };
      };
      BasePoint.prototype._getBeta = function _getBeta() {
        return null;
      };
      BasePoint.prototype.dblp = function dblp(k) {
        var r = this;
        for (var i = 0; i < k; i++)
          r = r.dbl();
        return r;
      };
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

  // node_modules/elliptic/lib/elliptic/curve/short.js
  var require_short = __commonJS({
    "node_modules/elliptic/lib/elliptic/curve/short.js"(exports, module) {
      "use strict";
      var utils = require_utils2();
      var BN = require_bn2();
      var inherits = require_inherits_browser();
      var Base = require_base();
      var assert = utils.assert;
      function ShortCurve(conf) {
        Base.call(this, "short", conf);
        this.a = new BN(conf.a, 16).toRed(this.red);
        this.b = new BN(conf.b, 16).toRed(this.red);
        this.tinv = this.two.redInvm();
        this.zeroA = this.a.fromRed().cmpn(0) === 0;
        this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;
        this.endo = this._getEndomorphism(conf);
        this._endoWnafT1 = new Array(4);
        this._endoWnafT2 = new Array(4);
      }
      inherits(ShortCurve, Base);
      module.exports = ShortCurve;
      ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
        if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
          return;
        var beta;
        var lambda;
        if (conf.beta) {
          beta = new BN(conf.beta, 16).toRed(this.red);
        } else {
          var betas = this._getEndoRoots(this.p);
          beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
          beta = beta.toRed(this.red);
        }
        if (conf.lambda) {
          lambda = new BN(conf.lambda, 16);
        } else {
          var lambdas = this._getEndoRoots(this.n);
          if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
            lambda = lambdas[0];
          } else {
            lambda = lambdas[1];
            assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
          }
        }
        var basis;
        if (conf.basis) {
          basis = conf.basis.map(function(vec) {
            return {
              a: new BN(vec.a, 16),
              b: new BN(vec.b, 16)
            };
          });
        } else {
          basis = this._getEndoBasis(lambda);
        }
        return {
          beta,
          lambda,
          basis
        };
      };
      ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
        var red = num === this.p ? this.red : BN.mont(num);
        var tinv = new BN(2).toRed(red).redInvm();
        var ntinv = tinv.redNeg();
        var s = new BN(3).toRed(red).redNeg().redSqrt().redMul(tinv);
        var l1 = ntinv.redAdd(s).fromRed();
        var l2 = ntinv.redSub(s).fromRed();
        return [l1, l2];
      };
      ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
        var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));
        var u = lambda;
        var v = this.n.clone();
        var x1 = new BN(1);
        var y1 = new BN(0);
        var x2 = new BN(0);
        var y2 = new BN(1);
        var a0;
        var b0;
        var a1;
        var b1;
        var a2;
        var b2;
        var prevR;
        var i = 0;
        var r;
        var x;
        while (u.cmpn(0) !== 0) {
          var q = v.div(u);
          r = v.sub(q.mul(u));
          x = x2.sub(q.mul(x1));
          var y = y2.sub(q.mul(y1));
          if (!a1 && r.cmp(aprxSqrt) < 0) {
            a0 = prevR.neg();
            b0 = x1;
            a1 = r.neg();
            b1 = x;
          } else if (a1 && ++i === 2) {
            break;
          }
          prevR = r;
          v = u;
          u = r;
          x2 = x1;
          x1 = x;
          y2 = y1;
          y1 = y;
        }
        a2 = r.neg();
        b2 = x;
        var len1 = a1.sqr().add(b1.sqr());
        var len2 = a2.sqr().add(b2.sqr());
        if (len2.cmp(len1) >= 0) {
          a2 = a0;
          b2 = b0;
        }
        if (a1.negative) {
          a1 = a1.neg();
          b1 = b1.neg();
        }
        if (a2.negative) {
          a2 = a2.neg();
          b2 = b2.neg();
        }
        return [
          { a: a1, b: b1 },
          { a: a2, b: b2 }
        ];
      };
      ShortCurve.prototype._endoSplit = function _endoSplit(k) {
        var basis = this.endo.basis;
        var v1 = basis[0];
        var v2 = basis[1];
        var c1 = v2.b.mul(k).divRound(this.n);
        var c2 = v1.b.neg().mul(k).divRound(this.n);
        var p1 = c1.mul(v1.a);
        var p2 = c2.mul(v2.a);
        var q1 = c1.mul(v1.b);
        var q2 = c2.mul(v2.b);
        var k1 = k.sub(p1).sub(p2);
        var k2 = q1.add(q2).neg();
        return { k1, k2 };
      };
      ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
        x = new BN(x, 16);
        if (!x.red)
          x = x.toRed(this.red);
        var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
        var y = y2.redSqrt();
        if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
          throw new Error("invalid point");
        var isOdd = y.fromRed().isOdd();
        if (odd && !isOdd || !odd && isOdd)
          y = y.redNeg();
        return this.point(x, y);
      };
      ShortCurve.prototype.validate = function validate2(point) {
        if (point.inf)
          return true;
        var x = point.x;
        var y = point.y;
        var ax = this.a.redMul(x);
        var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
        return y.redSqr().redISub(rhs).cmpn(0) === 0;
      };
      ShortCurve.prototype._endoWnafMulAdd = function _endoWnafMulAdd(points, coeffs, jacobianResult) {
        var npoints = this._endoWnafT1;
        var ncoeffs = this._endoWnafT2;
        for (var i = 0; i < points.length; i++) {
          var split = this._endoSplit(coeffs[i]);
          var p = points[i];
          var beta = p._getBeta();
          if (split.k1.negative) {
            split.k1.ineg();
            p = p.neg(true);
          }
          if (split.k2.negative) {
            split.k2.ineg();
            beta = beta.neg(true);
          }
          npoints[i * 2] = p;
          npoints[i * 2 + 1] = beta;
          ncoeffs[i * 2] = split.k1;
          ncoeffs[i * 2 + 1] = split.k2;
        }
        var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult);
        for (var j = 0; j < i * 2; j++) {
          npoints[j] = null;
          ncoeffs[j] = null;
        }
        return res;
      };
      function Point(curve, x, y, isRed) {
        Base.BasePoint.call(this, curve, "affine");
        if (x === null && y === null) {
          this.x = null;
          this.y = null;
          this.inf = true;
        } else {
          this.x = new BN(x, 16);
          this.y = new BN(y, 16);
          if (isRed) {
            this.x.forceRed(this.curve.red);
            this.y.forceRed(this.curve.red);
          }
          if (!this.x.red)
            this.x = this.x.toRed(this.curve.red);
          if (!this.y.red)
            this.y = this.y.toRed(this.curve.red);
          this.inf = false;
        }
      }
      inherits(Point, Base.BasePoint);
      ShortCurve.prototype.point = function point(x, y, isRed) {
        return new Point(this, x, y, isRed);
      };
      ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
        return Point.fromJSON(this, obj, red);
      };
      Point.prototype._getBeta = function _getBeta() {
        if (!this.curve.endo)
          return;
        var pre = this.precomputed;
        if (pre && pre.beta)
          return pre.beta;
        var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
        if (pre) {
          var curve = this.curve;
          var endoMul = function(p) {
            return curve.point(p.x.redMul(curve.endo.beta), p.y);
          };
          pre.beta = beta;
          beta.precomputed = {
            beta: null,
            naf: pre.naf && {
              wnd: pre.naf.wnd,
              points: pre.naf.points.map(endoMul)
            },
            doubles: pre.doubles && {
              step: pre.doubles.step,
              points: pre.doubles.points.map(endoMul)
            }
          };
        }
        return beta;
      };
      Point.prototype.toJSON = function toJSON() {
        if (!this.precomputed)
          return [this.x, this.y];
        return [this.x, this.y, this.precomputed && {
          doubles: this.precomputed.doubles && {
            step: this.precomputed.doubles.step,
            points: this.precomputed.doubles.points.slice(1)
          },
          naf: this.precomputed.naf && {
            wnd: this.precomputed.naf.wnd,
            points: this.precomputed.naf.points.slice(1)
          }
        }];
      };
      Point.fromJSON = function fromJSON(curve, obj, red) {
        if (typeof obj === "string")
          obj = JSON.parse(obj);
        var res = curve.point(obj[0], obj[1], red);
        if (!obj[2])
          return res;
        function obj2point(obj2) {
          return curve.point(obj2[0], obj2[1], red);
        }
        var pre = obj[2];
        res.precomputed = {
          beta: null,
          doubles: pre.doubles && {
            step: pre.doubles.step,
            points: [res].concat(pre.doubles.points.map(obj2point))
          },
          naf: pre.naf && {
            wnd: pre.naf.wnd,
            points: [res].concat(pre.naf.points.map(obj2point))
          }
        };
        return res;
      };
      Point.prototype.inspect = function inspect() {
        if (this.isInfinity())
          return "<EC Point Infinity>";
        return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + ">";
      };
      Point.prototype.isInfinity = function isInfinity() {
        return this.inf;
      };
      Point.prototype.add = function add(p) {
        if (this.inf)
          return p;
        if (p.inf)
          return this;
        if (this.eq(p))
          return this.dbl();
        if (this.neg().eq(p))
          return this.curve.point(null, null);
        if (this.x.cmp(p.x) === 0)
          return this.curve.point(null, null);
        var c = this.y.redSub(p.y);
        if (c.cmpn(0) !== 0)
          c = c.redMul(this.x.redSub(p.x).redInvm());
        var nx = c.redSqr().redISub(this.x).redISub(p.x);
        var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
        return this.curve.point(nx, ny);
      };
      Point.prototype.dbl = function dbl() {
        if (this.inf)
          return this;
        var ys1 = this.y.redAdd(this.y);
        if (ys1.cmpn(0) === 0)
          return this.curve.point(null, null);
        var a = this.curve.a;
        var x2 = this.x.redSqr();
        var dyinv = ys1.redInvm();
        var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);
        var nx = c.redSqr().redISub(this.x.redAdd(this.x));
        var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
        return this.curve.point(nx, ny);
      };
      Point.prototype.getX = function getX() {
        return this.x.fromRed();
      };
      Point.prototype.getY = function getY() {
        return this.y.fromRed();
      };
      Point.prototype.mul = function mul(k) {
        k = new BN(k, 16);
        if (this.isInfinity())
          return this;
        else if (this._hasDoubles(k))
          return this.curve._fixedNafMul(this, k);
        else if (this.curve.endo)
          return this.curve._endoWnafMulAdd([this], [k]);
        else
          return this.curve._wnafMul(this, k);
      };
      Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
        var points = [this, p2];
        var coeffs = [k1, k2];
        if (this.curve.endo)
          return this.curve._endoWnafMulAdd(points, coeffs);
        else
          return this.curve._wnafMulAdd(1, points, coeffs, 2);
      };
      Point.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
        var points = [this, p2];
        var coeffs = [k1, k2];
        if (this.curve.endo)
          return this.curve._endoWnafMulAdd(points, coeffs, true);
        else
          return this.curve._wnafMulAdd(1, points, coeffs, 2, true);
      };
      Point.prototype.eq = function eq(p) {
        return this === p || this.inf === p.inf && (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
      };
      Point.prototype.neg = function neg(_precompute) {
        if (this.inf)
          return this;
        var res = this.curve.point(this.x, this.y.redNeg());
        if (_precompute && this.precomputed) {
          var pre = this.precomputed;
          var negate = function(p) {
            return p.neg();
          };
          res.precomputed = {
            naf: pre.naf && {
              wnd: pre.naf.wnd,
              points: pre.naf.points.map(negate)
            },
            doubles: pre.doubles && {
              step: pre.doubles.step,
              points: pre.doubles.points.map(negate)
            }
          };
        }
        return res;
      };
      Point.prototype.toJ = function toJ() {
        if (this.inf)
          return this.curve.jpoint(null, null, null);
        var res = this.curve.jpoint(this.x, this.y, this.curve.one);
        return res;
      };
      function JPoint(curve, x, y, z) {
        Base.BasePoint.call(this, curve, "jacobian");
        if (x === null && y === null && z === null) {
          this.x = this.curve.one;
          this.y = this.curve.one;
          this.z = new BN(0);
        } else {
          this.x = new BN(x, 16);
          this.y = new BN(y, 16);
          this.z = new BN(z, 16);
        }
        if (!this.x.red)
          this.x = this.x.toRed(this.curve.red);
        if (!this.y.red)
          this.y = this.y.toRed(this.curve.red);
        if (!this.z.red)
          this.z = this.z.toRed(this.curve.red);
        this.zOne = this.z === this.curve.one;
      }
      inherits(JPoint, Base.BasePoint);
      ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
        return new JPoint(this, x, y, z);
      };
      JPoint.prototype.toP = function toP() {
        if (this.isInfinity())
          return this.curve.point(null, null);
        var zinv = this.z.redInvm();
        var zinv2 = zinv.redSqr();
        var ax = this.x.redMul(zinv2);
        var ay = this.y.redMul(zinv2).redMul(zinv);
        return this.curve.point(ax, ay);
      };
      JPoint.prototype.neg = function neg() {
        return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
      };
      JPoint.prototype.add = function add(p) {
        if (this.isInfinity())
          return p;
        if (p.isInfinity())
          return this;
        var pz2 = p.z.redSqr();
        var z2 = this.z.redSqr();
        var u1 = this.x.redMul(pz2);
        var u2 = p.x.redMul(z2);
        var s1 = this.y.redMul(pz2.redMul(p.z));
        var s2 = p.y.redMul(z2.redMul(this.z));
        var h = u1.redSub(u2);
        var r = s1.redSub(s2);
        if (h.cmpn(0) === 0) {
          if (r.cmpn(0) !== 0)
            return this.curve.jpoint(null, null, null);
          else
            return this.dbl();
        }
        var h2 = h.redSqr();
        var h3 = h2.redMul(h);
        var v = u1.redMul(h2);
        var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
        var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
        var nz = this.z.redMul(p.z).redMul(h);
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype.mixedAdd = function mixedAdd(p) {
        if (this.isInfinity())
          return p.toJ();
        if (p.isInfinity())
          return this;
        var z2 = this.z.redSqr();
        var u1 = this.x;
        var u2 = p.x.redMul(z2);
        var s1 = this.y;
        var s2 = p.y.redMul(z2).redMul(this.z);
        var h = u1.redSub(u2);
        var r = s1.redSub(s2);
        if (h.cmpn(0) === 0) {
          if (r.cmpn(0) !== 0)
            return this.curve.jpoint(null, null, null);
          else
            return this.dbl();
        }
        var h2 = h.redSqr();
        var h3 = h2.redMul(h);
        var v = u1.redMul(h2);
        var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
        var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
        var nz = this.z.redMul(h);
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype.dblp = function dblp(pow) {
        if (pow === 0)
          return this;
        if (this.isInfinity())
          return this;
        if (!pow)
          return this.dbl();
        var i;
        if (this.curve.zeroA || this.curve.threeA) {
          var r = this;
          for (i = 0; i < pow; i++)
            r = r.dbl();
          return r;
        }
        var a = this.curve.a;
        var tinv = this.curve.tinv;
        var jx = this.x;
        var jy = this.y;
        var jz = this.z;
        var jz4 = jz.redSqr().redSqr();
        var jyd = jy.redAdd(jy);
        for (i = 0; i < pow; i++) {
          var jx2 = jx.redSqr();
          var jyd2 = jyd.redSqr();
          var jyd4 = jyd2.redSqr();
          var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));
          var t1 = jx.redMul(jyd2);
          var nx = c.redSqr().redISub(t1.redAdd(t1));
          var t2 = t1.redISub(nx);
          var dny = c.redMul(t2);
          dny = dny.redIAdd(dny).redISub(jyd4);
          var nz = jyd.redMul(jz);
          if (i + 1 < pow)
            jz4 = jz4.redMul(jyd4);
          jx = nx;
          jz = nz;
          jyd = dny;
        }
        return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
      };
      JPoint.prototype.dbl = function dbl() {
        if (this.isInfinity())
          return this;
        if (this.curve.zeroA)
          return this._zeroDbl();
        else if (this.curve.threeA)
          return this._threeDbl();
        else
          return this._dbl();
      };
      JPoint.prototype._zeroDbl = function _zeroDbl() {
        var nx;
        var ny;
        var nz;
        if (this.zOne) {
          var xx = this.x.redSqr();
          var yy = this.y.redSqr();
          var yyyy = yy.redSqr();
          var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
          s = s.redIAdd(s);
          var m = xx.redAdd(xx).redIAdd(xx);
          var t = m.redSqr().redISub(s).redISub(s);
          var yyyy8 = yyyy.redIAdd(yyyy);
          yyyy8 = yyyy8.redIAdd(yyyy8);
          yyyy8 = yyyy8.redIAdd(yyyy8);
          nx = t;
          ny = m.redMul(s.redISub(t)).redISub(yyyy8);
          nz = this.y.redAdd(this.y);
        } else {
          var a = this.x.redSqr();
          var b = this.y.redSqr();
          var c = b.redSqr();
          var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
          d = d.redIAdd(d);
          var e = a.redAdd(a).redIAdd(a);
          var f = e.redSqr();
          var c8 = c.redIAdd(c);
          c8 = c8.redIAdd(c8);
          c8 = c8.redIAdd(c8);
          nx = f.redISub(d).redISub(d);
          ny = e.redMul(d.redISub(nx)).redISub(c8);
          nz = this.y.redMul(this.z);
          nz = nz.redIAdd(nz);
        }
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype._threeDbl = function _threeDbl() {
        var nx;
        var ny;
        var nz;
        if (this.zOne) {
          var xx = this.x.redSqr();
          var yy = this.y.redSqr();
          var yyyy = yy.redSqr();
          var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
          s = s.redIAdd(s);
          var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
          var t = m.redSqr().redISub(s).redISub(s);
          nx = t;
          var yyyy8 = yyyy.redIAdd(yyyy);
          yyyy8 = yyyy8.redIAdd(yyyy8);
          yyyy8 = yyyy8.redIAdd(yyyy8);
          ny = m.redMul(s.redISub(t)).redISub(yyyy8);
          nz = this.y.redAdd(this.y);
        } else {
          var delta = this.z.redSqr();
          var gamma = this.y.redSqr();
          var beta = this.x.redMul(gamma);
          var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
          alpha = alpha.redAdd(alpha).redIAdd(alpha);
          var beta4 = beta.redIAdd(beta);
          beta4 = beta4.redIAdd(beta4);
          var beta8 = beta4.redAdd(beta4);
          nx = alpha.redSqr().redISub(beta8);
          nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
          var ggamma8 = gamma.redSqr();
          ggamma8 = ggamma8.redIAdd(ggamma8);
          ggamma8 = ggamma8.redIAdd(ggamma8);
          ggamma8 = ggamma8.redIAdd(ggamma8);
          ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
        }
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype._dbl = function _dbl() {
        var a = this.curve.a;
        var jx = this.x;
        var jy = this.y;
        var jz = this.z;
        var jz4 = jz.redSqr().redSqr();
        var jx2 = jx.redSqr();
        var jy2 = jy.redSqr();
        var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));
        var jxd4 = jx.redAdd(jx);
        jxd4 = jxd4.redIAdd(jxd4);
        var t1 = jxd4.redMul(jy2);
        var nx = c.redSqr().redISub(t1.redAdd(t1));
        var t2 = t1.redISub(nx);
        var jyd8 = jy2.redSqr();
        jyd8 = jyd8.redIAdd(jyd8);
        jyd8 = jyd8.redIAdd(jyd8);
        jyd8 = jyd8.redIAdd(jyd8);
        var ny = c.redMul(t2).redISub(jyd8);
        var nz = jy.redAdd(jy).redMul(jz);
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype.trpl = function trpl() {
        if (!this.curve.zeroA)
          return this.dbl().add(this);
        var xx = this.x.redSqr();
        var yy = this.y.redSqr();
        var zz = this.z.redSqr();
        var yyyy = yy.redSqr();
        var m = xx.redAdd(xx).redIAdd(xx);
        var mm = m.redSqr();
        var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
        e = e.redIAdd(e);
        e = e.redAdd(e).redIAdd(e);
        e = e.redISub(mm);
        var ee = e.redSqr();
        var t = yyyy.redIAdd(yyyy);
        t = t.redIAdd(t);
        t = t.redIAdd(t);
        t = t.redIAdd(t);
        var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
        var yyu4 = yy.redMul(u);
        yyu4 = yyu4.redIAdd(yyu4);
        yyu4 = yyu4.redIAdd(yyu4);
        var nx = this.x.redMul(ee).redISub(yyu4);
        nx = nx.redIAdd(nx);
        nx = nx.redIAdd(nx);
        var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
        ny = ny.redIAdd(ny);
        ny = ny.redIAdd(ny);
        ny = ny.redIAdd(ny);
        var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);
        return this.curve.jpoint(nx, ny, nz);
      };
      JPoint.prototype.mul = function mul(k, kbase) {
        k = new BN(k, kbase);
        return this.curve._wnafMul(this, k);
      };
      JPoint.prototype.eq = function eq(p) {
        if (p.type === "affine")
          return this.eq(p.toJ());
        if (this === p)
          return true;
        var z2 = this.z.redSqr();
        var pz2 = p.z.redSqr();
        if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
          return false;
        var z3 = z2.redMul(this.z);
        var pz3 = pz2.redMul(p.z);
        return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
      };
      JPoint.prototype.eqXToP = function eqXToP(x) {
        var zs = this.z.redSqr();
        var rx = x.toRed(this.curve.red).redMul(zs);
        if (this.x.cmp(rx) === 0)
          return true;
        var xc = x.clone();
        var t = this.curve.redN.redMul(zs);
        for (; ; ) {
          xc.iadd(this.curve.n);
          if (xc.cmp(this.curve.p) >= 0)
            return false;
          rx.redIAdd(t);
          if (this.x.cmp(rx) === 0)
            return true;
        }
      };
      JPoint.prototype.inspect = function inspect() {
        if (this.isInfinity())
          return "<EC JPoint Infinity>";
        return "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">";
      };
      JPoint.prototype.isInfinity = function isInfinity() {
        return this.z.cmpn(0) === 0;
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/curve/mont.js
  var require_mont = __commonJS({
    "node_modules/elliptic/lib/elliptic/curve/mont.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var inherits = require_inherits_browser();
      var Base = require_base();
      var utils = require_utils2();
      function MontCurve(conf) {
        Base.call(this, "mont", conf);
        this.a = new BN(conf.a, 16).toRed(this.red);
        this.b = new BN(conf.b, 16).toRed(this.red);
        this.i4 = new BN(4).toRed(this.red).redInvm();
        this.two = new BN(2).toRed(this.red);
        this.a24 = this.i4.redMul(this.a.redAdd(this.two));
      }
      inherits(MontCurve, Base);
      module.exports = MontCurve;
      MontCurve.prototype.validate = function validate2(point) {
        var x = point.normalize().x;
        var x2 = x.redSqr();
        var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
        var y = rhs.redSqrt();
        return y.redSqr().cmp(rhs) === 0;
      };
      function Point(curve, x, z) {
        Base.BasePoint.call(this, curve, "projective");
        if (x === null && z === null) {
          this.x = this.curve.one;
          this.z = this.curve.zero;
        } else {
          this.x = new BN(x, 16);
          this.z = new BN(z, 16);
          if (!this.x.red)
            this.x = this.x.toRed(this.curve.red);
          if (!this.z.red)
            this.z = this.z.toRed(this.curve.red);
        }
      }
      inherits(Point, Base.BasePoint);
      MontCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
        return this.point(utils.toArray(bytes, enc), 1);
      };
      MontCurve.prototype.point = function point(x, z) {
        return new Point(this, x, z);
      };
      MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
        return Point.fromJSON(this, obj);
      };
      Point.prototype.precompute = function precompute() {
      };
      Point.prototype._encode = function _encode() {
        return this.getX().toArray("be", this.curve.p.byteLength());
      };
      Point.fromJSON = function fromJSON(curve, obj) {
        return new Point(curve, obj[0], obj[1] || curve.one);
      };
      Point.prototype.inspect = function inspect() {
        if (this.isInfinity())
          return "<EC Point Infinity>";
        return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " z: " + this.z.fromRed().toString(16, 2) + ">";
      };
      Point.prototype.isInfinity = function isInfinity() {
        return this.z.cmpn(0) === 0;
      };
      Point.prototype.dbl = function dbl() {
        var a = this.x.redAdd(this.z);
        var aa = a.redSqr();
        var b = this.x.redSub(this.z);
        var bb = b.redSqr();
        var c = aa.redSub(bb);
        var nx = aa.redMul(bb);
        var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
        return this.curve.point(nx, nz);
      };
      Point.prototype.add = function add() {
        throw new Error("Not supported on Montgomery curve");
      };
      Point.prototype.diffAdd = function diffAdd(p, diff) {
        var a = this.x.redAdd(this.z);
        var b = this.x.redSub(this.z);
        var c = p.x.redAdd(p.z);
        var d = p.x.redSub(p.z);
        var da = d.redMul(a);
        var cb = c.redMul(b);
        var nx = diff.z.redMul(da.redAdd(cb).redSqr());
        var nz = diff.x.redMul(da.redISub(cb).redSqr());
        return this.curve.point(nx, nz);
      };
      Point.prototype.mul = function mul(k) {
        var t = k.clone();
        var a = this;
        var b = this.curve.point(null, null);
        var c = this;
        for (var bits = []; t.cmpn(0) !== 0; t.iushrn(1))
          bits.push(t.andln(1));
        for (var i = bits.length - 1; i >= 0; i--) {
          if (bits[i] === 0) {
            a = a.diffAdd(b, c);
            b = b.dbl();
          } else {
            b = a.diffAdd(b, c);
            a = a.dbl();
          }
        }
        return b;
      };
      Point.prototype.mulAdd = function mulAdd() {
        throw new Error("Not supported on Montgomery curve");
      };
      Point.prototype.jumlAdd = function jumlAdd() {
        throw new Error("Not supported on Montgomery curve");
      };
      Point.prototype.eq = function eq(other) {
        return this.getX().cmp(other.getX()) === 0;
      };
      Point.prototype.normalize = function normalize() {
        this.x = this.x.redMul(this.z.redInvm());
        this.z = this.curve.one;
        return this;
      };
      Point.prototype.getX = function getX() {
        this.normalize();
        return this.x.fromRed();
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/curve/edwards.js
  var require_edwards = __commonJS({
    "node_modules/elliptic/lib/elliptic/curve/edwards.js"(exports, module) {
      "use strict";
      var utils = require_utils2();
      var BN = require_bn2();
      var inherits = require_inherits_browser();
      var Base = require_base();
      var assert = utils.assert;
      function EdwardsCurve(conf) {
        this.twisted = (conf.a | 0) !== 1;
        this.mOneA = this.twisted && (conf.a | 0) === -1;
        this.extended = this.mOneA;
        Base.call(this, "edwards", conf);
        this.a = new BN(conf.a, 16).umod(this.red.m);
        this.a = this.a.toRed(this.red);
        this.c = new BN(conf.c, 16).toRed(this.red);
        this.c2 = this.c.redSqr();
        this.d = new BN(conf.d, 16).toRed(this.red);
        this.dd = this.d.redAdd(this.d);
        assert(!this.twisted || this.c.fromRed().cmpn(1) === 0);
        this.oneC = (conf.c | 0) === 1;
      }
      inherits(EdwardsCurve, Base);
      module.exports = EdwardsCurve;
      EdwardsCurve.prototype._mulA = function _mulA(num) {
        if (this.mOneA)
          return num.redNeg();
        else
          return this.a.redMul(num);
      };
      EdwardsCurve.prototype._mulC = function _mulC(num) {
        if (this.oneC)
          return num;
        else
          return this.c.redMul(num);
      };
      EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
        return this.point(x, y, z, t);
      };
      EdwardsCurve.prototype.pointFromX = function pointFromX(x, odd) {
        x = new BN(x, 16);
        if (!x.red)
          x = x.toRed(this.red);
        var x2 = x.redSqr();
        var rhs = this.c2.redSub(this.a.redMul(x2));
        var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));
        var y2 = rhs.redMul(lhs.redInvm());
        var y = y2.redSqrt();
        if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
          throw new Error("invalid point");
        var isOdd = y.fromRed().isOdd();
        if (odd && !isOdd || !odd && isOdd)
          y = y.redNeg();
        return this.point(x, y);
      };
      EdwardsCurve.prototype.pointFromY = function pointFromY(y, odd) {
        y = new BN(y, 16);
        if (!y.red)
          y = y.toRed(this.red);
        var y2 = y.redSqr();
        var lhs = y2.redSub(this.c2);
        var rhs = y2.redMul(this.d).redMul(this.c2).redSub(this.a);
        var x2 = lhs.redMul(rhs.redInvm());
        if (x2.cmp(this.zero) === 0) {
          if (odd)
            throw new Error("invalid point");
          else
            return this.point(this.zero, y);
        }
        var x = x2.redSqrt();
        if (x.redSqr().redSub(x2).cmp(this.zero) !== 0)
          throw new Error("invalid point");
        if (x.fromRed().isOdd() !== odd)
          x = x.redNeg();
        return this.point(x, y);
      };
      EdwardsCurve.prototype.validate = function validate2(point) {
        if (point.isInfinity())
          return true;
        point.normalize();
        var x2 = point.x.redSqr();
        var y2 = point.y.redSqr();
        var lhs = x2.redMul(this.a).redAdd(y2);
        var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));
        return lhs.cmp(rhs) === 0;
      };
      function Point(curve, x, y, z, t) {
        Base.BasePoint.call(this, curve, "projective");
        if (x === null && y === null && z === null) {
          this.x = this.curve.zero;
          this.y = this.curve.one;
          this.z = this.curve.one;
          this.t = this.curve.zero;
          this.zOne = true;
        } else {
          this.x = new BN(x, 16);
          this.y = new BN(y, 16);
          this.z = z ? new BN(z, 16) : this.curve.one;
          this.t = t && new BN(t, 16);
          if (!this.x.red)
            this.x = this.x.toRed(this.curve.red);
          if (!this.y.red)
            this.y = this.y.toRed(this.curve.red);
          if (!this.z.red)
            this.z = this.z.toRed(this.curve.red);
          if (this.t && !this.t.red)
            this.t = this.t.toRed(this.curve.red);
          this.zOne = this.z === this.curve.one;
          if (this.curve.extended && !this.t) {
            this.t = this.x.redMul(this.y);
            if (!this.zOne)
              this.t = this.t.redMul(this.z.redInvm());
          }
        }
      }
      inherits(Point, Base.BasePoint);
      EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
        return Point.fromJSON(this, obj);
      };
      EdwardsCurve.prototype.point = function point(x, y, z, t) {
        return new Point(this, x, y, z, t);
      };
      Point.fromJSON = function fromJSON(curve, obj) {
        return new Point(curve, obj[0], obj[1], obj[2]);
      };
      Point.prototype.inspect = function inspect() {
        if (this.isInfinity())
          return "<EC Point Infinity>";
        return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + " z: " + this.z.fromRed().toString(16, 2) + ">";
      };
      Point.prototype.isInfinity = function isInfinity() {
        return this.x.cmpn(0) === 0 && (this.y.cmp(this.z) === 0 || this.zOne && this.y.cmp(this.curve.c) === 0);
      };
      Point.prototype._extDbl = function _extDbl() {
        var a = this.x.redSqr();
        var b = this.y.redSqr();
        var c = this.z.redSqr();
        c = c.redIAdd(c);
        var d = this.curve._mulA(a);
        var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
        var g = d.redAdd(b);
        var f = g.redSub(c);
        var h = d.redSub(b);
        var nx = e.redMul(f);
        var ny = g.redMul(h);
        var nt = e.redMul(h);
        var nz = f.redMul(g);
        return this.curve.point(nx, ny, nz, nt);
      };
      Point.prototype._projDbl = function _projDbl() {
        var b = this.x.redAdd(this.y).redSqr();
        var c = this.x.redSqr();
        var d = this.y.redSqr();
        var nx;
        var ny;
        var nz;
        var e;
        var h;
        var j;
        if (this.curve.twisted) {
          e = this.curve._mulA(c);
          var f = e.redAdd(d);
          if (this.zOne) {
            nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
            ny = f.redMul(e.redSub(d));
            nz = f.redSqr().redSub(f).redSub(f);
          } else {
            h = this.z.redSqr();
            j = f.redSub(h).redISub(h);
            nx = b.redSub(c).redISub(d).redMul(j);
            ny = f.redMul(e.redSub(d));
            nz = f.redMul(j);
          }
        } else {
          e = c.redAdd(d);
          h = this.curve._mulC(this.z).redSqr();
          j = e.redSub(h).redSub(h);
          nx = this.curve._mulC(b.redISub(e)).redMul(j);
          ny = this.curve._mulC(e).redMul(c.redISub(d));
          nz = e.redMul(j);
        }
        return this.curve.point(nx, ny, nz);
      };
      Point.prototype.dbl = function dbl() {
        if (this.isInfinity())
          return this;
        if (this.curve.extended)
          return this._extDbl();
        else
          return this._projDbl();
      };
      Point.prototype._extAdd = function _extAdd(p) {
        var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
        var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
        var c = this.t.redMul(this.curve.dd).redMul(p.t);
        var d = this.z.redMul(p.z.redAdd(p.z));
        var e = b.redSub(a);
        var f = d.redSub(c);
        var g = d.redAdd(c);
        var h = b.redAdd(a);
        var nx = e.redMul(f);
        var ny = g.redMul(h);
        var nt = e.redMul(h);
        var nz = f.redMul(g);
        return this.curve.point(nx, ny, nz, nt);
      };
      Point.prototype._projAdd = function _projAdd(p) {
        var a = this.z.redMul(p.z);
        var b = a.redSqr();
        var c = this.x.redMul(p.x);
        var d = this.y.redMul(p.y);
        var e = this.curve.d.redMul(c).redMul(d);
        var f = b.redSub(e);
        var g = b.redAdd(e);
        var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
        var nx = a.redMul(f).redMul(tmp);
        var ny;
        var nz;
        if (this.curve.twisted) {
          ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
          nz = f.redMul(g);
        } else {
          ny = a.redMul(g).redMul(d.redSub(c));
          nz = this.curve._mulC(f).redMul(g);
        }
        return this.curve.point(nx, ny, nz);
      };
      Point.prototype.add = function add(p) {
        if (this.isInfinity())
          return p;
        if (p.isInfinity())
          return this;
        if (this.curve.extended)
          return this._extAdd(p);
        else
          return this._projAdd(p);
      };
      Point.prototype.mul = function mul(k) {
        if (this._hasDoubles(k))
          return this.curve._fixedNafMul(this, k);
        else
          return this.curve._wnafMul(this, k);
      };
      Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
        return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, false);
      };
      Point.prototype.jmulAdd = function jmulAdd(k1, p, k2) {
        return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, true);
      };
      Point.prototype.normalize = function normalize() {
        if (this.zOne)
          return this;
        var zi = this.z.redInvm();
        this.x = this.x.redMul(zi);
        this.y = this.y.redMul(zi);
        if (this.t)
          this.t = this.t.redMul(zi);
        this.z = this.curve.one;
        this.zOne = true;
        return this;
      };
      Point.prototype.neg = function neg() {
        return this.curve.point(
          this.x.redNeg(),
          this.y,
          this.z,
          this.t && this.t.redNeg()
        );
      };
      Point.prototype.getX = function getX() {
        this.normalize();
        return this.x.fromRed();
      };
      Point.prototype.getY = function getY() {
        this.normalize();
        return this.y.fromRed();
      };
      Point.prototype.eq = function eq(other) {
        return this === other || this.getX().cmp(other.getX()) === 0 && this.getY().cmp(other.getY()) === 0;
      };
      Point.prototype.eqXToP = function eqXToP(x) {
        var rx = x.toRed(this.curve.red).redMul(this.z);
        if (this.x.cmp(rx) === 0)
          return true;
        var xc = x.clone();
        var t = this.curve.redN.redMul(this.z);
        for (; ; ) {
          xc.iadd(this.curve.n);
          if (xc.cmp(this.curve.p) >= 0)
            return false;
          rx.redIAdd(t);
          if (this.x.cmp(rx) === 0)
            return true;
        }
      };
      Point.prototype.toP = Point.prototype.normalize;
      Point.prototype.mixedAdd = Point.prototype.add;
    }
  });

  // node_modules/elliptic/lib/elliptic/curve/index.js
  var require_curve = __commonJS({
    "node_modules/elliptic/lib/elliptic/curve/index.js"(exports) {
      "use strict";
      var curve = exports;
      curve.base = require_base();
      curve.short = require_short();
      curve.mont = require_mont();
      curve.edwards = require_edwards();
    }
  });

  // node_modules/hash.js/lib/hash/utils.js
  var require_utils3 = __commonJS({
    "node_modules/hash.js/lib/hash/utils.js"(exports) {
      "use strict";
      var assert = require_minimalistic_assert();
      var inherits = require_inherits_browser();
      exports.inherits = inherits;
      function isSurrogatePair(msg, i) {
        if ((msg.charCodeAt(i) & 64512) !== 55296) {
          return false;
        }
        if (i < 0 || i + 1 >= msg.length) {
          return false;
        }
        return (msg.charCodeAt(i + 1) & 64512) === 56320;
      }
      function toArray(msg, enc) {
        if (Array.isArray(msg))
          return msg.slice();
        if (!msg)
          return [];
        var res = [];
        if (typeof msg === "string") {
          if (!enc) {
            var p = 0;
            for (var i = 0; i < msg.length; i++) {
              var c = msg.charCodeAt(i);
              if (c < 128) {
                res[p++] = c;
              } else if (c < 2048) {
                res[p++] = c >> 6 | 192;
                res[p++] = c & 63 | 128;
              } else if (isSurrogatePair(msg, i)) {
                c = 65536 + ((c & 1023) << 10) + (msg.charCodeAt(++i) & 1023);
                res[p++] = c >> 18 | 240;
                res[p++] = c >> 12 & 63 | 128;
                res[p++] = c >> 6 & 63 | 128;
                res[p++] = c & 63 | 128;
              } else {
                res[p++] = c >> 12 | 224;
                res[p++] = c >> 6 & 63 | 128;
                res[p++] = c & 63 | 128;
              }
            }
          } else if (enc === "hex") {
            msg = msg.replace(/[^a-z0-9]+/ig, "");
            if (msg.length % 2 !== 0)
              msg = "0" + msg;
            for (i = 0; i < msg.length; i += 2)
              res.push(parseInt(msg[i] + msg[i + 1], 16));
          }
        } else {
          for (i = 0; i < msg.length; i++)
            res[i] = msg[i] | 0;
        }
        return res;
      }
      exports.toArray = toArray;
      function toHex(msg) {
        var res = "";
        for (var i = 0; i < msg.length; i++)
          res += zero2(msg[i].toString(16));
        return res;
      }
      exports.toHex = toHex;
      function htonl(w) {
        var res = w >>> 24 | w >>> 8 & 65280 | w << 8 & 16711680 | (w & 255) << 24;
        return res >>> 0;
      }
      exports.htonl = htonl;
      function toHex32(msg, endian) {
        var res = "";
        for (var i = 0; i < msg.length; i++) {
          var w = msg[i];
          if (endian === "little")
            w = htonl(w);
          res += zero8(w.toString(16));
        }
        return res;
      }
      exports.toHex32 = toHex32;
      function zero2(word) {
        if (word.length === 1)
          return "0" + word;
        else
          return word;
      }
      exports.zero2 = zero2;
      function zero8(word) {
        if (word.length === 7)
          return "0" + word;
        else if (word.length === 6)
          return "00" + word;
        else if (word.length === 5)
          return "000" + word;
        else if (word.length === 4)
          return "0000" + word;
        else if (word.length === 3)
          return "00000" + word;
        else if (word.length === 2)
          return "000000" + word;
        else if (word.length === 1)
          return "0000000" + word;
        else
          return word;
      }
      exports.zero8 = zero8;
      function join32(msg, start, end, endian) {
        var len = end - start;
        assert(len % 4 === 0);
        var res = new Array(len / 4);
        for (var i = 0, k = start; i < res.length; i++, k += 4) {
          var w;
          if (endian === "big")
            w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];
          else
            w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
          res[i] = w >>> 0;
        }
        return res;
      }
      exports.join32 = join32;
      function split32(msg, endian) {
        var res = new Array(msg.length * 4);
        for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
          var m = msg[i];
          if (endian === "big") {
            res[k] = m >>> 24;
            res[k + 1] = m >>> 16 & 255;
            res[k + 2] = m >>> 8 & 255;
            res[k + 3] = m & 255;
          } else {
            res[k + 3] = m >>> 24;
            res[k + 2] = m >>> 16 & 255;
            res[k + 1] = m >>> 8 & 255;
            res[k] = m & 255;
          }
        }
        return res;
      }
      exports.split32 = split32;
      function rotr32(w, b) {
        return w >>> b | w << 32 - b;
      }
      exports.rotr32 = rotr32;
      function rotl32(w, b) {
        return w << b | w >>> 32 - b;
      }
      exports.rotl32 = rotl32;
      function sum32(a, b) {
        return a + b >>> 0;
      }
      exports.sum32 = sum32;
      function sum32_3(a, b, c) {
        return a + b + c >>> 0;
      }
      exports.sum32_3 = sum32_3;
      function sum32_4(a, b, c, d) {
        return a + b + c + d >>> 0;
      }
      exports.sum32_4 = sum32_4;
      function sum32_5(a, b, c, d, e) {
        return a + b + c + d + e >>> 0;
      }
      exports.sum32_5 = sum32_5;
      function sum64(buf, pos, ah, al) {
        var bh = buf[pos];
        var bl = buf[pos + 1];
        var lo = al + bl >>> 0;
        var hi = (lo < al ? 1 : 0) + ah + bh;
        buf[pos] = hi >>> 0;
        buf[pos + 1] = lo;
      }
      exports.sum64 = sum64;
      function sum64_hi(ah, al, bh, bl) {
        var lo = al + bl >>> 0;
        var hi = (lo < al ? 1 : 0) + ah + bh;
        return hi >>> 0;
      }
      exports.sum64_hi = sum64_hi;
      function sum64_lo(ah, al, bh, bl) {
        var lo = al + bl;
        return lo >>> 0;
      }
      exports.sum64_lo = sum64_lo;
      function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
        var carry = 0;
        var lo = al;
        lo = lo + bl >>> 0;
        carry += lo < al ? 1 : 0;
        lo = lo + cl >>> 0;
        carry += lo < cl ? 1 : 0;
        lo = lo + dl >>> 0;
        carry += lo < dl ? 1 : 0;
        var hi = ah + bh + ch + dh + carry;
        return hi >>> 0;
      }
      exports.sum64_4_hi = sum64_4_hi;
      function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
        var lo = al + bl + cl + dl;
        return lo >>> 0;
      }
      exports.sum64_4_lo = sum64_4_lo;
      function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
        var carry = 0;
        var lo = al;
        lo = lo + bl >>> 0;
        carry += lo < al ? 1 : 0;
        lo = lo + cl >>> 0;
        carry += lo < cl ? 1 : 0;
        lo = lo + dl >>> 0;
        carry += lo < dl ? 1 : 0;
        lo = lo + el >>> 0;
        carry += lo < el ? 1 : 0;
        var hi = ah + bh + ch + dh + eh + carry;
        return hi >>> 0;
      }
      exports.sum64_5_hi = sum64_5_hi;
      function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
        var lo = al + bl + cl + dl + el;
        return lo >>> 0;
      }
      exports.sum64_5_lo = sum64_5_lo;
      function rotr64_hi(ah, al, num) {
        var r = al << 32 - num | ah >>> num;
        return r >>> 0;
      }
      exports.rotr64_hi = rotr64_hi;
      function rotr64_lo(ah, al, num) {
        var r = ah << 32 - num | al >>> num;
        return r >>> 0;
      }
      exports.rotr64_lo = rotr64_lo;
      function shr64_hi(ah, al, num) {
        return ah >>> num;
      }
      exports.shr64_hi = shr64_hi;
      function shr64_lo(ah, al, num) {
        var r = ah << 32 - num | al >>> num;
        return r >>> 0;
      }
      exports.shr64_lo = shr64_lo;
    }
  });

  // node_modules/hash.js/lib/hash/common.js
  var require_common = __commonJS({
    "node_modules/hash.js/lib/hash/common.js"(exports) {
      "use strict";
      var utils = require_utils3();
      var assert = require_minimalistic_assert();
      function BlockHash() {
        this.pending = null;
        this.pendingTotal = 0;
        this.blockSize = this.constructor.blockSize;
        this.outSize = this.constructor.outSize;
        this.hmacStrength = this.constructor.hmacStrength;
        this.padLength = this.constructor.padLength / 8;
        this.endian = "big";
        this._delta8 = this.blockSize / 8;
        this._delta32 = this.blockSize / 32;
      }
      exports.BlockHash = BlockHash;
      BlockHash.prototype.update = function update(msg, enc) {
        msg = utils.toArray(msg, enc);
        if (!this.pending)
          this.pending = msg;
        else
          this.pending = this.pending.concat(msg);
        this.pendingTotal += msg.length;
        if (this.pending.length >= this._delta8) {
          msg = this.pending;
          var r = msg.length % this._delta8;
          this.pending = msg.slice(msg.length - r, msg.length);
          if (this.pending.length === 0)
            this.pending = null;
          msg = utils.join32(msg, 0, msg.length - r, this.endian);
          for (var i = 0; i < msg.length; i += this._delta32)
            this._update(msg, i, i + this._delta32);
        }
        return this;
      };
      BlockHash.prototype.digest = function digest(enc) {
        this.update(this._pad());
        assert(this.pending === null);
        return this._digest(enc);
      };
      BlockHash.prototype._pad = function pad3() {
        var len = this.pendingTotal;
        var bytes = this._delta8;
        var k = bytes - (len + this.padLength) % bytes;
        var res = new Array(k + this.padLength);
        res[0] = 128;
        for (var i = 1; i < k; i++)
          res[i] = 0;
        len <<= 3;
        if (this.endian === "big") {
          for (var t = 8; t < this.padLength; t++)
            res[i++] = 0;
          res[i++] = 0;
          res[i++] = 0;
          res[i++] = 0;
          res[i++] = 0;
          res[i++] = len >>> 24 & 255;
          res[i++] = len >>> 16 & 255;
          res[i++] = len >>> 8 & 255;
          res[i++] = len & 255;
        } else {
          res[i++] = len & 255;
          res[i++] = len >>> 8 & 255;
          res[i++] = len >>> 16 & 255;
          res[i++] = len >>> 24 & 255;
          res[i++] = 0;
          res[i++] = 0;
          res[i++] = 0;
          res[i++] = 0;
          for (t = 8; t < this.padLength; t++)
            res[i++] = 0;
        }
        return res;
      };
    }
  });

  // node_modules/hash.js/lib/hash/sha/common.js
  var require_common2 = __commonJS({
    "node_modules/hash.js/lib/hash/sha/common.js"(exports) {
      "use strict";
      var utils = require_utils3();
      var rotr32 = utils.rotr32;
      function ft_1(s, x, y, z) {
        if (s === 0)
          return ch32(x, y, z);
        if (s === 1 || s === 3)
          return p32(x, y, z);
        if (s === 2)
          return maj32(x, y, z);
      }
      exports.ft_1 = ft_1;
      function ch32(x, y, z) {
        return x & y ^ ~x & z;
      }
      exports.ch32 = ch32;
      function maj32(x, y, z) {
        return x & y ^ x & z ^ y & z;
      }
      exports.maj32 = maj32;
      function p32(x, y, z) {
        return x ^ y ^ z;
      }
      exports.p32 = p32;
      function s0_256(x) {
        return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
      }
      exports.s0_256 = s0_256;
      function s1_256(x) {
        return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
      }
      exports.s1_256 = s1_256;
      function g0_256(x) {
        return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
      }
      exports.g0_256 = g0_256;
      function g1_256(x) {
        return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
      }
      exports.g1_256 = g1_256;
    }
  });

  // node_modules/hash.js/lib/hash/sha/1.js
  var require__ = __commonJS({
    "node_modules/hash.js/lib/hash/sha/1.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var common = require_common();
      var shaCommon = require_common2();
      var rotl32 = utils.rotl32;
      var sum32 = utils.sum32;
      var sum32_5 = utils.sum32_5;
      var ft_1 = shaCommon.ft_1;
      var BlockHash = common.BlockHash;
      var sha1_K = [
        1518500249,
        1859775393,
        2400959708,
        3395469782
      ];
      function SHA1() {
        if (!(this instanceof SHA1))
          return new SHA1();
        BlockHash.call(this);
        this.h = [
          1732584193,
          4023233417,
          2562383102,
          271733878,
          3285377520
        ];
        this.W = new Array(80);
      }
      utils.inherits(SHA1, BlockHash);
      module.exports = SHA1;
      SHA1.blockSize = 512;
      SHA1.outSize = 160;
      SHA1.hmacStrength = 80;
      SHA1.padLength = 64;
      SHA1.prototype._update = function _update(msg, start) {
        var W = this.W;
        for (var i = 0; i < 16; i++)
          W[i] = msg[start + i];
        for (; i < W.length; i++)
          W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        var a = this.h[0];
        var b = this.h[1];
        var c = this.h[2];
        var d = this.h[3];
        var e = this.h[4];
        for (i = 0; i < W.length; i++) {
          var s = ~~(i / 20);
          var t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
          e = d;
          d = c;
          c = rotl32(b, 30);
          b = a;
          a = t;
        }
        this.h[0] = sum32(this.h[0], a);
        this.h[1] = sum32(this.h[1], b);
        this.h[2] = sum32(this.h[2], c);
        this.h[3] = sum32(this.h[3], d);
        this.h[4] = sum32(this.h[4], e);
      };
      SHA1.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h, "big");
        else
          return utils.split32(this.h, "big");
      };
    }
  });

  // node_modules/hash.js/lib/hash/sha/256.js
  var require__2 = __commonJS({
    "node_modules/hash.js/lib/hash/sha/256.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var common = require_common();
      var shaCommon = require_common2();
      var assert = require_minimalistic_assert();
      var sum32 = utils.sum32;
      var sum32_4 = utils.sum32_4;
      var sum32_5 = utils.sum32_5;
      var ch32 = shaCommon.ch32;
      var maj32 = shaCommon.maj32;
      var s0_256 = shaCommon.s0_256;
      var s1_256 = shaCommon.s1_256;
      var g0_256 = shaCommon.g0_256;
      var g1_256 = shaCommon.g1_256;
      var BlockHash = common.BlockHash;
      var sha256_K = [
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
      function SHA256() {
        if (!(this instanceof SHA256))
          return new SHA256();
        BlockHash.call(this);
        this.h = [
          1779033703,
          3144134277,
          1013904242,
          2773480762,
          1359893119,
          2600822924,
          528734635,
          1541459225
        ];
        this.k = sha256_K;
        this.W = new Array(64);
      }
      utils.inherits(SHA256, BlockHash);
      module.exports = SHA256;
      SHA256.blockSize = 512;
      SHA256.outSize = 256;
      SHA256.hmacStrength = 192;
      SHA256.padLength = 64;
      SHA256.prototype._update = function _update(msg, start) {
        var W = this.W;
        for (var i = 0; i < 16; i++)
          W[i] = msg[start + i];
        for (; i < W.length; i++)
          W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);
        var a = this.h[0];
        var b = this.h[1];
        var c = this.h[2];
        var d = this.h[3];
        var e = this.h[4];
        var f = this.h[5];
        var g = this.h[6];
        var h = this.h[7];
        assert(this.k.length === W.length);
        for (i = 0; i < W.length; i++) {
          var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
          var T2 = sum32(s0_256(a), maj32(a, b, c));
          h = g;
          g = f;
          f = e;
          e = sum32(d, T1);
          d = c;
          c = b;
          b = a;
          a = sum32(T1, T2);
        }
        this.h[0] = sum32(this.h[0], a);
        this.h[1] = sum32(this.h[1], b);
        this.h[2] = sum32(this.h[2], c);
        this.h[3] = sum32(this.h[3], d);
        this.h[4] = sum32(this.h[4], e);
        this.h[5] = sum32(this.h[5], f);
        this.h[6] = sum32(this.h[6], g);
        this.h[7] = sum32(this.h[7], h);
      };
      SHA256.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h, "big");
        else
          return utils.split32(this.h, "big");
      };
    }
  });

  // node_modules/hash.js/lib/hash/sha/224.js
  var require__3 = __commonJS({
    "node_modules/hash.js/lib/hash/sha/224.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var SHA256 = require__2();
      function SHA224() {
        if (!(this instanceof SHA224))
          return new SHA224();
        SHA256.call(this);
        this.h = [
          3238371032,
          914150663,
          812702999,
          4144912697,
          4290775857,
          1750603025,
          1694076839,
          3204075428
        ];
      }
      utils.inherits(SHA224, SHA256);
      module.exports = SHA224;
      SHA224.blockSize = 512;
      SHA224.outSize = 224;
      SHA224.hmacStrength = 192;
      SHA224.padLength = 64;
      SHA224.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h.slice(0, 7), "big");
        else
          return utils.split32(this.h.slice(0, 7), "big");
      };
    }
  });

  // node_modules/hash.js/lib/hash/sha/512.js
  var require__4 = __commonJS({
    "node_modules/hash.js/lib/hash/sha/512.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var common = require_common();
      var assert = require_minimalistic_assert();
      var rotr64_hi = utils.rotr64_hi;
      var rotr64_lo = utils.rotr64_lo;
      var shr64_hi = utils.shr64_hi;
      var shr64_lo = utils.shr64_lo;
      var sum64 = utils.sum64;
      var sum64_hi = utils.sum64_hi;
      var sum64_lo = utils.sum64_lo;
      var sum64_4_hi = utils.sum64_4_hi;
      var sum64_4_lo = utils.sum64_4_lo;
      var sum64_5_hi = utils.sum64_5_hi;
      var sum64_5_lo = utils.sum64_5_lo;
      var BlockHash = common.BlockHash;
      var sha512_K = [
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
      function SHA512() {
        if (!(this instanceof SHA512))
          return new SHA512();
        BlockHash.call(this);
        this.h = [
          1779033703,
          4089235720,
          3144134277,
          2227873595,
          1013904242,
          4271175723,
          2773480762,
          1595750129,
          1359893119,
          2917565137,
          2600822924,
          725511199,
          528734635,
          4215389547,
          1541459225,
          327033209
        ];
        this.k = sha512_K;
        this.W = new Array(160);
      }
      utils.inherits(SHA512, BlockHash);
      module.exports = SHA512;
      SHA512.blockSize = 1024;
      SHA512.outSize = 512;
      SHA512.hmacStrength = 192;
      SHA512.padLength = 128;
      SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
        var W = this.W;
        for (var i = 0; i < 32; i++)
          W[i] = msg[start + i];
        for (; i < W.length; i += 2) {
          var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);
          var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
          var c1_hi = W[i - 14];
          var c1_lo = W[i - 13];
          var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);
          var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
          var c3_hi = W[i - 32];
          var c3_lo = W[i - 31];
          W[i] = sum64_4_hi(
            c0_hi,
            c0_lo,
            c1_hi,
            c1_lo,
            c2_hi,
            c2_lo,
            c3_hi,
            c3_lo
          );
          W[i + 1] = sum64_4_lo(
            c0_hi,
            c0_lo,
            c1_hi,
            c1_lo,
            c2_hi,
            c2_lo,
            c3_hi,
            c3_lo
          );
        }
      };
      SHA512.prototype._update = function _update(msg, start) {
        this._prepareBlock(msg, start);
        var W = this.W;
        var ah = this.h[0];
        var al = this.h[1];
        var bh = this.h[2];
        var bl = this.h[3];
        var ch = this.h[4];
        var cl = this.h[5];
        var dh = this.h[6];
        var dl = this.h[7];
        var eh = this.h[8];
        var el = this.h[9];
        var fh = this.h[10];
        var fl = this.h[11];
        var gh = this.h[12];
        var gl = this.h[13];
        var hh = this.h[14];
        var hl = this.h[15];
        assert(this.k.length === W.length);
        for (var i = 0; i < W.length; i += 2) {
          var c0_hi = hh;
          var c0_lo = hl;
          var c1_hi = s1_512_hi(eh, el);
          var c1_lo = s1_512_lo(eh, el);
          var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
          var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
          var c3_hi = this.k[i];
          var c3_lo = this.k[i + 1];
          var c4_hi = W[i];
          var c4_lo = W[i + 1];
          var T1_hi = sum64_5_hi(
            c0_hi,
            c0_lo,
            c1_hi,
            c1_lo,
            c2_hi,
            c2_lo,
            c3_hi,
            c3_lo,
            c4_hi,
            c4_lo
          );
          var T1_lo = sum64_5_lo(
            c0_hi,
            c0_lo,
            c1_hi,
            c1_lo,
            c2_hi,
            c2_lo,
            c3_hi,
            c3_lo,
            c4_hi,
            c4_lo
          );
          c0_hi = s0_512_hi(ah, al);
          c0_lo = s0_512_lo(ah, al);
          c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
          c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);
          var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
          var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);
          hh = gh;
          hl = gl;
          gh = fh;
          gl = fl;
          fh = eh;
          fl = el;
          eh = sum64_hi(dh, dl, T1_hi, T1_lo);
          el = sum64_lo(dl, dl, T1_hi, T1_lo);
          dh = ch;
          dl = cl;
          ch = bh;
          cl = bl;
          bh = ah;
          bl = al;
          ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
          al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
        }
        sum64(this.h, 0, ah, al);
        sum64(this.h, 2, bh, bl);
        sum64(this.h, 4, ch, cl);
        sum64(this.h, 6, dh, dl);
        sum64(this.h, 8, eh, el);
        sum64(this.h, 10, fh, fl);
        sum64(this.h, 12, gh, gl);
        sum64(this.h, 14, hh, hl);
      };
      SHA512.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h, "big");
        else
          return utils.split32(this.h, "big");
      };
      function ch64_hi(xh, xl, yh, yl, zh) {
        var r = xh & yh ^ ~xh & zh;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function ch64_lo(xh, xl, yh, yl, zh, zl) {
        var r = xl & yl ^ ~xl & zl;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function maj64_hi(xh, xl, yh, yl, zh) {
        var r = xh & yh ^ xh & zh ^ yh & zh;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function maj64_lo(xh, xl, yh, yl, zh, zl) {
        var r = xl & yl ^ xl & zl ^ yl & zl;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function s0_512_hi(xh, xl) {
        var c0_hi = rotr64_hi(xh, xl, 28);
        var c1_hi = rotr64_hi(xl, xh, 2);
        var c2_hi = rotr64_hi(xl, xh, 7);
        var r = c0_hi ^ c1_hi ^ c2_hi;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function s0_512_lo(xh, xl) {
        var c0_lo = rotr64_lo(xh, xl, 28);
        var c1_lo = rotr64_lo(xl, xh, 2);
        var c2_lo = rotr64_lo(xl, xh, 7);
        var r = c0_lo ^ c1_lo ^ c2_lo;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function s1_512_hi(xh, xl) {
        var c0_hi = rotr64_hi(xh, xl, 14);
        var c1_hi = rotr64_hi(xh, xl, 18);
        var c2_hi = rotr64_hi(xl, xh, 9);
        var r = c0_hi ^ c1_hi ^ c2_hi;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function s1_512_lo(xh, xl) {
        var c0_lo = rotr64_lo(xh, xl, 14);
        var c1_lo = rotr64_lo(xh, xl, 18);
        var c2_lo = rotr64_lo(xl, xh, 9);
        var r = c0_lo ^ c1_lo ^ c2_lo;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function g0_512_hi(xh, xl) {
        var c0_hi = rotr64_hi(xh, xl, 1);
        var c1_hi = rotr64_hi(xh, xl, 8);
        var c2_hi = shr64_hi(xh, xl, 7);
        var r = c0_hi ^ c1_hi ^ c2_hi;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function g0_512_lo(xh, xl) {
        var c0_lo = rotr64_lo(xh, xl, 1);
        var c1_lo = rotr64_lo(xh, xl, 8);
        var c2_lo = shr64_lo(xh, xl, 7);
        var r = c0_lo ^ c1_lo ^ c2_lo;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function g1_512_hi(xh, xl) {
        var c0_hi = rotr64_hi(xh, xl, 19);
        var c1_hi = rotr64_hi(xl, xh, 29);
        var c2_hi = shr64_hi(xh, xl, 6);
        var r = c0_hi ^ c1_hi ^ c2_hi;
        if (r < 0)
          r += 4294967296;
        return r;
      }
      function g1_512_lo(xh, xl) {
        var c0_lo = rotr64_lo(xh, xl, 19);
        var c1_lo = rotr64_lo(xl, xh, 29);
        var c2_lo = shr64_lo(xh, xl, 6);
        var r = c0_lo ^ c1_lo ^ c2_lo;
        if (r < 0)
          r += 4294967296;
        return r;
      }
    }
  });

  // node_modules/hash.js/lib/hash/sha/384.js
  var require__5 = __commonJS({
    "node_modules/hash.js/lib/hash/sha/384.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var SHA512 = require__4();
      function SHA384() {
        if (!(this instanceof SHA384))
          return new SHA384();
        SHA512.call(this);
        this.h = [
          3418070365,
          3238371032,
          1654270250,
          914150663,
          2438529370,
          812702999,
          355462360,
          4144912697,
          1731405415,
          4290775857,
          2394180231,
          1750603025,
          3675008525,
          1694076839,
          1203062813,
          3204075428
        ];
      }
      utils.inherits(SHA384, SHA512);
      module.exports = SHA384;
      SHA384.blockSize = 1024;
      SHA384.outSize = 384;
      SHA384.hmacStrength = 192;
      SHA384.padLength = 128;
      SHA384.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h.slice(0, 12), "big");
        else
          return utils.split32(this.h.slice(0, 12), "big");
      };
    }
  });

  // node_modules/hash.js/lib/hash/sha.js
  var require_sha = __commonJS({
    "node_modules/hash.js/lib/hash/sha.js"(exports) {
      "use strict";
      exports.sha1 = require__();
      exports.sha224 = require__3();
      exports.sha256 = require__2();
      exports.sha384 = require__5();
      exports.sha512 = require__4();
    }
  });

  // node_modules/hash.js/lib/hash/ripemd.js
  var require_ripemd = __commonJS({
    "node_modules/hash.js/lib/hash/ripemd.js"(exports) {
      "use strict";
      var utils = require_utils3();
      var common = require_common();
      var rotl32 = utils.rotl32;
      var sum32 = utils.sum32;
      var sum32_3 = utils.sum32_3;
      var sum32_4 = utils.sum32_4;
      var BlockHash = common.BlockHash;
      function RIPEMD160() {
        if (!(this instanceof RIPEMD160))
          return new RIPEMD160();
        BlockHash.call(this);
        this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
        this.endian = "little";
      }
      utils.inherits(RIPEMD160, BlockHash);
      exports.ripemd160 = RIPEMD160;
      RIPEMD160.blockSize = 512;
      RIPEMD160.outSize = 160;
      RIPEMD160.hmacStrength = 192;
      RIPEMD160.padLength = 64;
      RIPEMD160.prototype._update = function update(msg, start) {
        var A = this.h[0];
        var B = this.h[1];
        var C = this.h[2];
        var D = this.h[3];
        var E = this.h[4];
        var Ah = A;
        var Bh = B;
        var Ch = C;
        var Dh = D;
        var Eh = E;
        for (var j = 0; j < 80; j++) {
          var T = sum32(
            rotl32(
              sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
              s[j]
            ),
            E
          );
          A = E;
          E = D;
          D = rotl32(C, 10);
          C = B;
          B = T;
          T = sum32(
            rotl32(
              sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
              sh[j]
            ),
            Eh
          );
          Ah = Eh;
          Eh = Dh;
          Dh = rotl32(Ch, 10);
          Ch = Bh;
          Bh = T;
        }
        T = sum32_3(this.h[1], C, Dh);
        this.h[1] = sum32_3(this.h[2], D, Eh);
        this.h[2] = sum32_3(this.h[3], E, Ah);
        this.h[3] = sum32_3(this.h[4], A, Bh);
        this.h[4] = sum32_3(this.h[0], B, Ch);
        this.h[0] = T;
      };
      RIPEMD160.prototype._digest = function digest(enc) {
        if (enc === "hex")
          return utils.toHex32(this.h, "little");
        else
          return utils.split32(this.h, "little");
      };
      function f(j, x, y, z) {
        if (j <= 15)
          return x ^ y ^ z;
        else if (j <= 31)
          return x & y | ~x & z;
        else if (j <= 47)
          return (x | ~y) ^ z;
        else if (j <= 63)
          return x & z | y & ~z;
        else
          return x ^ (y | ~z);
      }
      function K(j) {
        if (j <= 15)
          return 0;
        else if (j <= 31)
          return 1518500249;
        else if (j <= 47)
          return 1859775393;
        else if (j <= 63)
          return 2400959708;
        else
          return 2840853838;
      }
      function Kh(j) {
        if (j <= 15)
          return 1352829926;
        else if (j <= 31)
          return 1548603684;
        else if (j <= 47)
          return 1836072691;
        else if (j <= 63)
          return 2053994217;
        else
          return 0;
      }
      var r = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        7,
        4,
        13,
        1,
        10,
        6,
        15,
        3,
        12,
        0,
        9,
        5,
        2,
        14,
        11,
        8,
        3,
        10,
        14,
        4,
        9,
        15,
        8,
        1,
        2,
        7,
        0,
        6,
        13,
        11,
        5,
        12,
        1,
        9,
        11,
        10,
        0,
        8,
        12,
        4,
        13,
        3,
        7,
        15,
        14,
        5,
        6,
        2,
        4,
        0,
        5,
        9,
        7,
        12,
        2,
        10,
        14,
        1,
        3,
        8,
        11,
        6,
        15,
        13
      ];
      var rh = [
        5,
        14,
        7,
        0,
        9,
        2,
        11,
        4,
        13,
        6,
        15,
        8,
        1,
        10,
        3,
        12,
        6,
        11,
        3,
        7,
        0,
        13,
        5,
        10,
        14,
        15,
        8,
        12,
        4,
        9,
        1,
        2,
        15,
        5,
        1,
        3,
        7,
        14,
        6,
        9,
        11,
        8,
        12,
        2,
        10,
        0,
        4,
        13,
        8,
        6,
        4,
        1,
        3,
        11,
        15,
        0,
        5,
        12,
        2,
        13,
        9,
        7,
        10,
        14,
        12,
        15,
        10,
        4,
        1,
        5,
        8,
        7,
        6,
        2,
        13,
        14,
        0,
        3,
        9,
        11
      ];
      var s = [
        11,
        14,
        15,
        12,
        5,
        8,
        7,
        9,
        11,
        13,
        14,
        15,
        6,
        7,
        9,
        8,
        7,
        6,
        8,
        13,
        11,
        9,
        7,
        15,
        7,
        12,
        15,
        9,
        11,
        7,
        13,
        12,
        11,
        13,
        6,
        7,
        14,
        9,
        13,
        15,
        14,
        8,
        13,
        6,
        5,
        12,
        7,
        5,
        11,
        12,
        14,
        15,
        14,
        15,
        9,
        8,
        9,
        14,
        5,
        6,
        8,
        6,
        5,
        12,
        9,
        15,
        5,
        11,
        6,
        8,
        13,
        12,
        5,
        12,
        13,
        14,
        11,
        8,
        5,
        6
      ];
      var sh = [
        8,
        9,
        9,
        11,
        13,
        15,
        15,
        5,
        7,
        7,
        8,
        11,
        14,
        14,
        12,
        6,
        9,
        13,
        15,
        7,
        12,
        8,
        9,
        11,
        7,
        7,
        12,
        7,
        6,
        15,
        13,
        11,
        9,
        7,
        15,
        11,
        8,
        6,
        6,
        14,
        12,
        13,
        5,
        14,
        13,
        13,
        7,
        5,
        15,
        5,
        8,
        11,
        14,
        14,
        6,
        14,
        6,
        9,
        12,
        9,
        12,
        5,
        15,
        8,
        8,
        5,
        12,
        9,
        12,
        5,
        14,
        6,
        8,
        13,
        6,
        5,
        15,
        13,
        11,
        11
      ];
    }
  });

  // node_modules/hash.js/lib/hash/hmac.js
  var require_hmac = __commonJS({
    "node_modules/hash.js/lib/hash/hmac.js"(exports, module) {
      "use strict";
      var utils = require_utils3();
      var assert = require_minimalistic_assert();
      function Hmac(hash, key, enc) {
        if (!(this instanceof Hmac))
          return new Hmac(hash, key, enc);
        this.Hash = hash;
        this.blockSize = hash.blockSize / 8;
        this.outSize = hash.outSize / 8;
        this.inner = null;
        this.outer = null;
        this._init(utils.toArray(key, enc));
      }
      module.exports = Hmac;
      Hmac.prototype._init = function init(key) {
        if (key.length > this.blockSize)
          key = new this.Hash().update(key).digest();
        assert(key.length <= this.blockSize);
        for (var i = key.length; i < this.blockSize; i++)
          key.push(0);
        for (i = 0; i < key.length; i++)
          key[i] ^= 54;
        this.inner = new this.Hash().update(key);
        for (i = 0; i < key.length; i++)
          key[i] ^= 106;
        this.outer = new this.Hash().update(key);
      };
      Hmac.prototype.update = function update(msg, enc) {
        this.inner.update(msg, enc);
        return this;
      };
      Hmac.prototype.digest = function digest(enc) {
        this.outer.update(this.inner.digest());
        return this.outer.digest(enc);
      };
    }
  });

  // node_modules/hash.js/lib/hash.js
  var require_hash = __commonJS({
    "node_modules/hash.js/lib/hash.js"(exports) {
      var hash = exports;
      hash.utils = require_utils3();
      hash.common = require_common();
      hash.sha = require_sha();
      hash.ripemd = require_ripemd();
      hash.hmac = require_hmac();
      hash.sha1 = hash.sha.sha1;
      hash.sha256 = hash.sha.sha256;
      hash.sha224 = hash.sha.sha224;
      hash.sha384 = hash.sha.sha384;
      hash.sha512 = hash.sha.sha512;
      hash.ripemd160 = hash.ripemd.ripemd160;
    }
  });

  // node_modules/elliptic/lib/elliptic/precomputed/secp256k1.js
  var require_secp256k1 = __commonJS({
    "node_modules/elliptic/lib/elliptic/precomputed/secp256k1.js"(exports, module) {
      module.exports = {
        doubles: {
          step: 4,
          points: [
            [
              "e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a",
              "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"
            ],
            [
              "8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508",
              "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"
            ],
            [
              "175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739",
              "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"
            ],
            [
              "363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640",
              "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"
            ],
            [
              "8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c",
              "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"
            ],
            [
              "723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda",
              "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"
            ],
            [
              "eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa",
              "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"
            ],
            [
              "100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0",
              "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"
            ],
            [
              "e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d",
              "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"
            ],
            [
              "feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d",
              "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"
            ],
            [
              "da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1",
              "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"
            ],
            [
              "53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0",
              "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"
            ],
            [
              "8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047",
              "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"
            ],
            [
              "385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862",
              "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"
            ],
            [
              "6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7",
              "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"
            ],
            [
              "3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd",
              "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"
            ],
            [
              "85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83",
              "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"
            ],
            [
              "948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a",
              "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"
            ],
            [
              "6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8",
              "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"
            ],
            [
              "e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d",
              "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"
            ],
            [
              "e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725",
              "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"
            ],
            [
              "213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754",
              "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"
            ],
            [
              "4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c",
              "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"
            ],
            [
              "fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6",
              "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"
            ],
            [
              "76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39",
              "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"
            ],
            [
              "c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891",
              "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"
            ],
            [
              "d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b",
              "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"
            ],
            [
              "b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03",
              "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"
            ],
            [
              "e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d",
              "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"
            ],
            [
              "a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070",
              "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"
            ],
            [
              "90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4",
              "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"
            ],
            [
              "8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da",
              "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"
            ],
            [
              "e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11",
              "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"
            ],
            [
              "8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e",
              "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"
            ],
            [
              "e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41",
              "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"
            ],
            [
              "b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef",
              "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"
            ],
            [
              "d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8",
              "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"
            ],
            [
              "324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d",
              "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"
            ],
            [
              "4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96",
              "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"
            ],
            [
              "9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd",
              "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"
            ],
            [
              "6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5",
              "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"
            ],
            [
              "a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266",
              "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"
            ],
            [
              "7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71",
              "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"
            ],
            [
              "928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac",
              "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"
            ],
            [
              "85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751",
              "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"
            ],
            [
              "ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e",
              "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"
            ],
            [
              "827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241",
              "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"
            ],
            [
              "eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3",
              "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"
            ],
            [
              "e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f",
              "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"
            ],
            [
              "1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19",
              "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"
            ],
            [
              "146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be",
              "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"
            ],
            [
              "fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9",
              "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"
            ],
            [
              "da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2",
              "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"
            ],
            [
              "a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13",
              "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"
            ],
            [
              "174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c",
              "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"
            ],
            [
              "959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba",
              "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"
            ],
            [
              "d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151",
              "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"
            ],
            [
              "64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073",
              "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"
            ],
            [
              "8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458",
              "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"
            ],
            [
              "13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b",
              "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"
            ],
            [
              "bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366",
              "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"
            ],
            [
              "8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa",
              "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"
            ],
            [
              "8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0",
              "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"
            ],
            [
              "dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787",
              "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"
            ],
            [
              "f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e",
              "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"
            ]
          ]
        },
        naf: {
          wnd: 7,
          points: [
            [
              "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
              "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"
            ],
            [
              "2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
              "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"
            ],
            [
              "5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc",
              "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"
            ],
            [
              "acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe",
              "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"
            ],
            [
              "774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb",
              "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"
            ],
            [
              "f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8",
              "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"
            ],
            [
              "d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e",
              "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"
            ],
            [
              "defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34",
              "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"
            ],
            [
              "2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c",
              "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"
            ],
            [
              "352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5",
              "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"
            ],
            [
              "2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f",
              "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"
            ],
            [
              "9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714",
              "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"
            ],
            [
              "daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729",
              "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"
            ],
            [
              "c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db",
              "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"
            ],
            [
              "6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4",
              "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"
            ],
            [
              "1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5",
              "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"
            ],
            [
              "605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479",
              "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"
            ],
            [
              "62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d",
              "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"
            ],
            [
              "80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f",
              "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"
            ],
            [
              "7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb",
              "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"
            ],
            [
              "d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9",
              "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"
            ],
            [
              "49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963",
              "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"
            ],
            [
              "77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74",
              "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"
            ],
            [
              "f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530",
              "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"
            ],
            [
              "463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b",
              "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"
            ],
            [
              "f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247",
              "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"
            ],
            [
              "caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1",
              "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"
            ],
            [
              "2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120",
              "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"
            ],
            [
              "7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435",
              "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"
            ],
            [
              "754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18",
              "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"
            ],
            [
              "e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8",
              "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"
            ],
            [
              "186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb",
              "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"
            ],
            [
              "df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f",
              "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"
            ],
            [
              "5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143",
              "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"
            ],
            [
              "290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba",
              "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"
            ],
            [
              "af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45",
              "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"
            ],
            [
              "766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a",
              "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"
            ],
            [
              "59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e",
              "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"
            ],
            [
              "f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8",
              "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"
            ],
            [
              "7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c",
              "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"
            ],
            [
              "948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519",
              "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"
            ],
            [
              "7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab",
              "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"
            ],
            [
              "3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca",
              "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"
            ],
            [
              "d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf",
              "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"
            ],
            [
              "1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610",
              "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"
            ],
            [
              "733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4",
              "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"
            ],
            [
              "15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c",
              "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"
            ],
            [
              "a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940",
              "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"
            ],
            [
              "e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980",
              "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"
            ],
            [
              "311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3",
              "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"
            ],
            [
              "34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf",
              "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"
            ],
            [
              "f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63",
              "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"
            ],
            [
              "d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448",
              "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"
            ],
            [
              "32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf",
              "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"
            ],
            [
              "7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5",
              "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"
            ],
            [
              "ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6",
              "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"
            ],
            [
              "16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5",
              "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"
            ],
            [
              "eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99",
              "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"
            ],
            [
              "78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51",
              "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"
            ],
            [
              "494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5",
              "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"
            ],
            [
              "a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5",
              "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"
            ],
            [
              "c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997",
              "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"
            ],
            [
              "841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881",
              "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"
            ],
            [
              "5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5",
              "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"
            ],
            [
              "36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66",
              "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"
            ],
            [
              "336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726",
              "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"
            ],
            [
              "8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede",
              "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"
            ],
            [
              "1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94",
              "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"
            ],
            [
              "85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31",
              "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"
            ],
            [
              "29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51",
              "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"
            ],
            [
              "a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252",
              "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"
            ],
            [
              "4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5",
              "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"
            ],
            [
              "d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b",
              "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"
            ],
            [
              "ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4",
              "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"
            ],
            [
              "af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f",
              "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"
            ],
            [
              "e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889",
              "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"
            ],
            [
              "591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246",
              "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"
            ],
            [
              "11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984",
              "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"
            ],
            [
              "3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a",
              "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"
            ],
            [
              "cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030",
              "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"
            ],
            [
              "c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197",
              "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"
            ],
            [
              "c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593",
              "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"
            ],
            [
              "a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef",
              "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"
            ],
            [
              "347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38",
              "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"
            ],
            [
              "da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a",
              "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"
            ],
            [
              "c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111",
              "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"
            ],
            [
              "4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502",
              "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"
            ],
            [
              "3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea",
              "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"
            ],
            [
              "cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26",
              "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"
            ],
            [
              "b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986",
              "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"
            ],
            [
              "d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e",
              "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"
            ],
            [
              "48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4",
              "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"
            ],
            [
              "dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda",
              "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"
            ],
            [
              "6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859",
              "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"
            ],
            [
              "e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f",
              "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"
            ],
            [
              "eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c",
              "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"
            ],
            [
              "13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942",
              "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"
            ],
            [
              "ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a",
              "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"
            ],
            [
              "b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80",
              "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"
            ],
            [
              "ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d",
              "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"
            ],
            [
              "8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1",
              "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"
            ],
            [
              "52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63",
              "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"
            ],
            [
              "e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352",
              "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"
            ],
            [
              "7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193",
              "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"
            ],
            [
              "5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00",
              "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"
            ],
            [
              "32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58",
              "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"
            ],
            [
              "e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7",
              "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"
            ],
            [
              "8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8",
              "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"
            ],
            [
              "4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e",
              "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"
            ],
            [
              "3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d",
              "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"
            ],
            [
              "674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b",
              "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"
            ],
            [
              "d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f",
              "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"
            ],
            [
              "30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6",
              "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"
            ],
            [
              "be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297",
              "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"
            ],
            [
              "93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a",
              "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"
            ],
            [
              "b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c",
              "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"
            ],
            [
              "d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52",
              "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"
            ],
            [
              "d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb",
              "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"
            ],
            [
              "463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065",
              "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"
            ],
            [
              "7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917",
              "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"
            ],
            [
              "74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9",
              "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"
            ],
            [
              "30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3",
              "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"
            ],
            [
              "9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57",
              "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"
            ],
            [
              "176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66",
              "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"
            ],
            [
              "75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8",
              "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"
            ],
            [
              "809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721",
              "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"
            ],
            [
              "1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180",
              "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"
            ]
          ]
        }
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/curves.js
  var require_curves = __commonJS({
    "node_modules/elliptic/lib/elliptic/curves.js"(exports) {
      "use strict";
      var curves = exports;
      var hash = require_hash();
      var curve = require_curve();
      var utils = require_utils2();
      var assert = utils.assert;
      function PresetCurve(options) {
        if (options.type === "short")
          this.curve = new curve.short(options);
        else if (options.type === "edwards")
          this.curve = new curve.edwards(options);
        else
          this.curve = new curve.mont(options);
        this.g = this.curve.g;
        this.n = this.curve.n;
        this.hash = options.hash;
        assert(this.g.validate(), "Invalid curve");
        assert(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O");
      }
      curves.PresetCurve = PresetCurve;
      function defineCurve(name, options) {
        Object.defineProperty(curves, name, {
          configurable: true,
          enumerable: true,
          get: function() {
            var curve2 = new PresetCurve(options);
            Object.defineProperty(curves, name, {
              configurable: true,
              enumerable: true,
              value: curve2
            });
            return curve2;
          }
        });
      }
      defineCurve("p192", {
        type: "short",
        prime: "p192",
        p: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",
        a: "ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",
        b: "64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",
        n: "ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",
        hash: hash.sha256,
        gRed: false,
        g: [
          "188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012",
          "07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"
        ]
      });
      defineCurve("p224", {
        type: "short",
        prime: "p224",
        p: "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",
        a: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",
        b: "b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",
        n: "ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",
        hash: hash.sha256,
        gRed: false,
        g: [
          "b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21",
          "bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"
        ]
      });
      defineCurve("p256", {
        type: "short",
        prime: null,
        p: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",
        a: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",
        b: "5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",
        n: "ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",
        hash: hash.sha256,
        gRed: false,
        g: [
          "6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296",
          "4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"
        ]
      });
      defineCurve("p384", {
        type: "short",
        prime: null,
        p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",
        a: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",
        b: "b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",
        n: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",
        hash: hash.sha384,
        gRed: false,
        g: [
          "aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7",
          "3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"
        ]
      });
      defineCurve("p521", {
        type: "short",
        prime: null,
        p: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",
        a: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",
        b: "00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",
        n: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",
        hash: hash.sha512,
        gRed: false,
        g: [
          "000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66",
          "00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"
        ]
      });
      defineCurve("curve25519", {
        type: "mont",
        prime: "p25519",
        p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
        a: "76d06",
        b: "1",
        n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
        hash: hash.sha256,
        gRed: false,
        g: [
          "9"
        ]
      });
      defineCurve("ed25519", {
        type: "edwards",
        prime: "p25519",
        p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
        a: "-1",
        c: "1",
        d: "52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",
        n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
        hash: hash.sha256,
        gRed: false,
        g: [
          "216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a",
          "6666666666666666666666666666666666666666666666666666666666666658"
        ]
      });
      var pre;
      try {
        pre = require_secp256k1();
      } catch (e) {
        pre = void 0;
      }
      defineCurve("secp256k1", {
        type: "short",
        prime: "k256",
        p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
        a: "0",
        b: "7",
        n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
        h: "1",
        hash: hash.sha256,
        beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
        lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
        basis: [
          {
            a: "3086d221a7d46bcde86c90e49284eb15",
            b: "-e4437ed6010e88286f547fa90abfe4c3"
          },
          {
            a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
            b: "3086d221a7d46bcde86c90e49284eb15"
          }
        ],
        gRed: false,
        g: [
          "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
          "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
          pre
        ]
      });
    }
  });

  // node_modules/hmac-drbg/lib/hmac-drbg.js
  var require_hmac_drbg = __commonJS({
    "node_modules/hmac-drbg/lib/hmac-drbg.js"(exports, module) {
      "use strict";
      var hash = require_hash();
      var utils = require_utils();
      var assert = require_minimalistic_assert();
      function HmacDRBG(options) {
        if (!(this instanceof HmacDRBG))
          return new HmacDRBG(options);
        this.hash = options.hash;
        this.predResist = !!options.predResist;
        this.outLen = this.hash.outSize;
        this.minEntropy = options.minEntropy || this.hash.hmacStrength;
        this._reseed = null;
        this.reseedInterval = null;
        this.K = null;
        this.V = null;
        var entropy = utils.toArray(options.entropy, options.entropyEnc || "hex");
        var nonce = utils.toArray(options.nonce, options.nonceEnc || "hex");
        var pers = utils.toArray(options.pers, options.persEnc || "hex");
        assert(
          entropy.length >= this.minEntropy / 8,
          "Not enough entropy. Minimum is: " + this.minEntropy + " bits"
        );
        this._init(entropy, nonce, pers);
      }
      module.exports = HmacDRBG;
      HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
        var seed = entropy.concat(nonce).concat(pers);
        this.K = new Array(this.outLen / 8);
        this.V = new Array(this.outLen / 8);
        for (var i = 0; i < this.V.length; i++) {
          this.K[i] = 0;
          this.V[i] = 1;
        }
        this._update(seed);
        this._reseed = 1;
        this.reseedInterval = 281474976710656;
      };
      HmacDRBG.prototype._hmac = function hmac() {
        return new hash.hmac(this.hash, this.K);
      };
      HmacDRBG.prototype._update = function update(seed) {
        var kmac = this._hmac().update(this.V).update([0]);
        if (seed)
          kmac = kmac.update(seed);
        this.K = kmac.digest();
        this.V = this._hmac().update(this.V).digest();
        if (!seed)
          return;
        this.K = this._hmac().update(this.V).update([1]).update(seed).digest();
        this.V = this._hmac().update(this.V).digest();
      };
      HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
        if (typeof entropyEnc !== "string") {
          addEnc = add;
          add = entropyEnc;
          entropyEnc = null;
        }
        entropy = utils.toArray(entropy, entropyEnc);
        add = utils.toArray(add, addEnc);
        assert(
          entropy.length >= this.minEntropy / 8,
          "Not enough entropy. Minimum is: " + this.minEntropy + " bits"
        );
        this._update(entropy.concat(add || []));
        this._reseed = 1;
      };
      HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
        if (this._reseed > this.reseedInterval)
          throw new Error("Reseed is required");
        if (typeof enc !== "string") {
          addEnc = add;
          add = enc;
          enc = null;
        }
        if (add) {
          add = utils.toArray(add, addEnc || "hex");
          this._update(add);
        }
        var temp = [];
        while (temp.length < len) {
          this.V = this._hmac().update(this.V).digest();
          temp = temp.concat(this.V);
        }
        var res = temp.slice(0, len);
        this._update(add);
        this._reseed++;
        return utils.encode(res, enc);
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/ec/key.js
  var require_key = __commonJS({
    "node_modules/elliptic/lib/elliptic/ec/key.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var utils = require_utils2();
      var assert = utils.assert;
      function KeyPair(ec, options) {
        this.ec = ec;
        this.priv = null;
        this.pub = null;
        if (options.priv)
          this._importPrivate(options.priv, options.privEnc);
        if (options.pub)
          this._importPublic(options.pub, options.pubEnc);
      }
      module.exports = KeyPair;
      KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
        if (pub instanceof KeyPair)
          return pub;
        return new KeyPair(ec, {
          pub,
          pubEnc: enc
        });
      };
      KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
        if (priv instanceof KeyPair)
          return priv;
        return new KeyPair(ec, {
          priv,
          privEnc: enc
        });
      };
      KeyPair.prototype.validate = function validate2() {
        var pub = this.getPublic();
        if (pub.isInfinity())
          return { result: false, reason: "Invalid public key" };
        if (!pub.validate())
          return { result: false, reason: "Public key is not a point" };
        if (!pub.mul(this.ec.curve.n).isInfinity())
          return { result: false, reason: "Public key * N != O" };
        return { result: true, reason: null };
      };
      KeyPair.prototype.getPublic = function getPublic(compact, enc) {
        if (typeof compact === "string") {
          enc = compact;
          compact = null;
        }
        if (!this.pub)
          this.pub = this.ec.g.mul(this.priv);
        if (!enc)
          return this.pub;
        return this.pub.encode(enc, compact);
      };
      KeyPair.prototype.getPrivate = function getPrivate(enc) {
        if (enc === "hex")
          return this.priv.toString(16, 2);
        else
          return this.priv;
      };
      KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
        this.priv = new BN(key, enc || 16);
        this.priv = this.priv.umod(this.ec.curve.n);
      };
      KeyPair.prototype._importPublic = function _importPublic(key, enc) {
        if (key.x || key.y) {
          if (this.ec.curve.type === "mont") {
            assert(key.x, "Need x coordinate");
          } else if (this.ec.curve.type === "short" || this.ec.curve.type === "edwards") {
            assert(key.x && key.y, "Need both x and y coordinate");
          }
          this.pub = this.ec.curve.point(key.x, key.y);
          return;
        }
        this.pub = this.ec.curve.decodePoint(key, enc);
      };
      KeyPair.prototype.derive = function derive(pub) {
        if (!pub.validate()) {
          assert(pub.validate(), "public point not validated");
        }
        return pub.mul(this.priv).getX();
      };
      KeyPair.prototype.sign = function sign(msg, enc, options) {
        return this.ec.sign(msg, this, enc, options);
      };
      KeyPair.prototype.verify = function verify(msg, signature) {
        return this.ec.verify(msg, signature, this);
      };
      KeyPair.prototype.inspect = function inspect() {
        return "<Key priv: " + (this.priv && this.priv.toString(16, 2)) + " pub: " + (this.pub && this.pub.inspect()) + " >";
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/ec/signature.js
  var require_signature = __commonJS({
    "node_modules/elliptic/lib/elliptic/ec/signature.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var utils = require_utils2();
      var assert = utils.assert;
      function Signature(options, enc) {
        if (options instanceof Signature)
          return options;
        if (this._importDER(options, enc))
          return;
        assert(options.r && options.s, "Signature without r or s");
        this.r = new BN(options.r, 16);
        this.s = new BN(options.s, 16);
        if (options.recoveryParam === void 0)
          this.recoveryParam = null;
        else
          this.recoveryParam = options.recoveryParam;
      }
      module.exports = Signature;
      function Position() {
        this.place = 0;
      }
      function getLength(buf, p) {
        var initial = buf[p.place++];
        if (!(initial & 128)) {
          return initial;
        }
        var octetLen = initial & 15;
        if (octetLen === 0 || octetLen > 4) {
          return false;
        }
        var val = 0;
        for (var i = 0, off = p.place; i < octetLen; i++, off++) {
          val <<= 8;
          val |= buf[off];
          val >>>= 0;
        }
        if (val <= 127) {
          return false;
        }
        p.place = off;
        return val;
      }
      function rmPadding(buf) {
        var i = 0;
        var len = buf.length - 1;
        while (!buf[i] && !(buf[i + 1] & 128) && i < len) {
          i++;
        }
        if (i === 0) {
          return buf;
        }
        return buf.slice(i);
      }
      Signature.prototype._importDER = function _importDER(data, enc) {
        data = utils.toArray(data, enc);
        var p = new Position();
        if (data[p.place++] !== 48) {
          return false;
        }
        var len = getLength(data, p);
        if (len === false) {
          return false;
        }
        if (len + p.place !== data.length) {
          return false;
        }
        if (data[p.place++] !== 2) {
          return false;
        }
        var rlen = getLength(data, p);
        if (rlen === false) {
          return false;
        }
        var r = data.slice(p.place, rlen + p.place);
        p.place += rlen;
        if (data[p.place++] !== 2) {
          return false;
        }
        var slen = getLength(data, p);
        if (slen === false) {
          return false;
        }
        if (data.length !== slen + p.place) {
          return false;
        }
        var s = data.slice(p.place, slen + p.place);
        if (r[0] === 0) {
          if (r[1] & 128) {
            r = r.slice(1);
          } else {
            return false;
          }
        }
        if (s[0] === 0) {
          if (s[1] & 128) {
            s = s.slice(1);
          } else {
            return false;
          }
        }
        this.r = new BN(r);
        this.s = new BN(s);
        this.recoveryParam = null;
        return true;
      };
      function constructLength(arr, len) {
        if (len < 128) {
          arr.push(len);
          return;
        }
        var octets = 1 + (Math.log(len) / Math.LN2 >>> 3);
        arr.push(octets | 128);
        while (--octets) {
          arr.push(len >>> (octets << 3) & 255);
        }
        arr.push(len);
      }
      Signature.prototype.toDER = function toDER(enc) {
        var r = this.r.toArray();
        var s = this.s.toArray();
        if (r[0] & 128)
          r = [0].concat(r);
        if (s[0] & 128)
          s = [0].concat(s);
        r = rmPadding(r);
        s = rmPadding(s);
        while (!s[0] && !(s[1] & 128)) {
          s = s.slice(1);
        }
        var arr = [2];
        constructLength(arr, r.length);
        arr = arr.concat(r);
        arr.push(2);
        constructLength(arr, s.length);
        var backHalf = arr.concat(s);
        var res = [48];
        constructLength(res, backHalf.length);
        res = res.concat(backHalf);
        return utils.encode(res, enc);
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/ec/index.js
  var require_ec = __commonJS({
    "node_modules/elliptic/lib/elliptic/ec/index.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var HmacDRBG = require_hmac_drbg();
      var utils = require_utils2();
      var curves = require_curves();
      var rand = require_brorand();
      var assert = utils.assert;
      var KeyPair = require_key();
      var Signature = require_signature();
      function EC(options) {
        if (!(this instanceof EC))
          return new EC(options);
        if (typeof options === "string") {
          assert(
            Object.prototype.hasOwnProperty.call(curves, options),
            "Unknown curve " + options
          );
          options = curves[options];
        }
        if (options instanceof curves.PresetCurve)
          options = { curve: options };
        this.curve = options.curve.curve;
        this.n = this.curve.n;
        this.nh = this.n.ushrn(1);
        this.g = this.curve.g;
        this.g = options.curve.g;
        this.g.precompute(options.curve.n.bitLength() + 1);
        this.hash = options.hash || options.curve.hash;
      }
      module.exports = EC;
      EC.prototype.keyPair = function keyPair(options) {
        return new KeyPair(this, options);
      };
      EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
        return KeyPair.fromPrivate(this, priv, enc);
      };
      EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
        return KeyPair.fromPublic(this, pub, enc);
      };
      EC.prototype.genKeyPair = function genKeyPair(options) {
        if (!options)
          options = {};
        var drbg = new HmacDRBG({
          hash: this.hash,
          pers: options.pers,
          persEnc: options.persEnc || "utf8",
          entropy: options.entropy || rand(this.hash.hmacStrength),
          entropyEnc: options.entropy && options.entropyEnc || "utf8",
          nonce: this.n.toArray()
        });
        var bytes = this.n.byteLength();
        var ns2 = this.n.sub(new BN(2));
        for (; ; ) {
          var priv = new BN(drbg.generate(bytes));
          if (priv.cmp(ns2) > 0)
            continue;
          priv.iaddn(1);
          return this.keyFromPrivate(priv);
        }
      };
      EC.prototype._truncateToN = function _truncateToN(msg, truncOnly) {
        var delta = msg.byteLength() * 8 - this.n.bitLength();
        if (delta > 0)
          msg = msg.ushrn(delta);
        if (!truncOnly && msg.cmp(this.n) >= 0)
          return msg.sub(this.n);
        else
          return msg;
      };
      EC.prototype.sign = function sign(msg, key, enc, options) {
        if (typeof enc === "object") {
          options = enc;
          enc = null;
        }
        if (!options)
          options = {};
        key = this.keyFromPrivate(key, enc);
        msg = this._truncateToN(new BN(msg, 16));
        var bytes = this.n.byteLength();
        var bkey = key.getPrivate().toArray("be", bytes);
        var nonce = msg.toArray("be", bytes);
        var drbg = new HmacDRBG({
          hash: this.hash,
          entropy: bkey,
          nonce,
          pers: options.pers,
          persEnc: options.persEnc || "utf8"
        });
        var ns1 = this.n.sub(new BN(1));
        for (var iter = 0; ; iter++) {
          var k = options.k ? options.k(iter) : new BN(drbg.generate(this.n.byteLength()));
          k = this._truncateToN(k, true);
          if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
            continue;
          var kp = this.g.mul(k);
          if (kp.isInfinity())
            continue;
          var kpX = kp.getX();
          var r = kpX.umod(this.n);
          if (r.cmpn(0) === 0)
            continue;
          var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));
          s = s.umod(this.n);
          if (s.cmpn(0) === 0)
            continue;
          var recoveryParam = (kp.getY().isOdd() ? 1 : 0) | (kpX.cmp(r) !== 0 ? 2 : 0);
          if (options.canonical && s.cmp(this.nh) > 0) {
            s = this.n.sub(s);
            recoveryParam ^= 1;
          }
          return new Signature({ r, s, recoveryParam });
        }
      };
      EC.prototype.verify = function verify(msg, signature, key, enc) {
        msg = this._truncateToN(new BN(msg, 16));
        key = this.keyFromPublic(key, enc);
        signature = new Signature(signature, "hex");
        var r = signature.r;
        var s = signature.s;
        if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
          return false;
        if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
          return false;
        var sinv = s.invm(this.n);
        var u1 = sinv.mul(msg).umod(this.n);
        var u2 = sinv.mul(r).umod(this.n);
        var p;
        if (!this.curve._maxwellTrick) {
          p = this.g.mulAdd(u1, key.getPublic(), u2);
          if (p.isInfinity())
            return false;
          return p.getX().umod(this.n).cmp(r) === 0;
        }
        p = this.g.jmulAdd(u1, key.getPublic(), u2);
        if (p.isInfinity())
          return false;
        return p.eqXToP(r);
      };
      EC.prototype.recoverPubKey = function(msg, signature, j, enc) {
        assert((3 & j) === j, "The recovery param is more than two bits");
        signature = new Signature(signature, enc);
        var n = this.n;
        var e = new BN(msg);
        var r = signature.r;
        var s = signature.s;
        var isYOdd = j & 1;
        var isSecondKey = j >> 1;
        if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
          throw new Error("Unable to find sencond key candinate");
        if (isSecondKey)
          r = this.curve.pointFromX(r.add(this.curve.n), isYOdd);
        else
          r = this.curve.pointFromX(r, isYOdd);
        var rInv = signature.r.invm(n);
        var s1 = n.sub(e).mul(rInv).umod(n);
        var s2 = s.mul(rInv).umod(n);
        return this.g.mulAdd(s1, r, s2);
      };
      EC.prototype.getKeyRecoveryParam = function(e, signature, Q, enc) {
        signature = new Signature(signature, enc);
        if (signature.recoveryParam !== null)
          return signature.recoveryParam;
        for (var i = 0; i < 4; i++) {
          var Qprime;
          try {
            Qprime = this.recoverPubKey(e, signature, i);
          } catch (e2) {
            continue;
          }
          if (Qprime.eq(Q))
            return i;
        }
        throw new Error("Unable to find valid recovery factor");
      };
    }
  });

  // node_modules/elliptic/lib/elliptic/eddsa/key.js
  var require_key2 = __commonJS({
    "node_modules/elliptic/lib/elliptic/eddsa/key.js"(exports, module) {
      "use strict";
      var utils = require_utils2();
      var assert = utils.assert;
      var parseBytes = utils.parseBytes;
      var cachedProperty = utils.cachedProperty;
      function KeyPair(eddsa, params) {
        this.eddsa = eddsa;
        this._secret = parseBytes(params.secret);
        if (eddsa.isPoint(params.pub))
          this._pub = params.pub;
        else
          this._pubBytes = parseBytes(params.pub);
      }
      KeyPair.fromPublic = function fromPublic(eddsa, pub) {
        if (pub instanceof KeyPair)
          return pub;
        return new KeyPair(eddsa, { pub });
      };
      KeyPair.fromSecret = function fromSecret(eddsa, secret) {
        if (secret instanceof KeyPair)
          return secret;
        return new KeyPair(eddsa, { secret });
      };
      KeyPair.prototype.secret = function secret() {
        return this._secret;
      };
      cachedProperty(KeyPair, "pubBytes", function pubBytes() {
        return this.eddsa.encodePoint(this.pub());
      });
      cachedProperty(KeyPair, "pub", function pub() {
        if (this._pubBytes)
          return this.eddsa.decodePoint(this._pubBytes);
        return this.eddsa.g.mul(this.priv());
      });
      cachedProperty(KeyPair, "privBytes", function privBytes() {
        var eddsa = this.eddsa;
        var hash = this.hash();
        var lastIx = eddsa.encodingLength - 1;
        var a = hash.slice(0, eddsa.encodingLength);
        a[0] &= 248;
        a[lastIx] &= 127;
        a[lastIx] |= 64;
        return a;
      });
      cachedProperty(KeyPair, "priv", function priv() {
        return this.eddsa.decodeInt(this.privBytes());
      });
      cachedProperty(KeyPair, "hash", function hash() {
        return this.eddsa.hash().update(this.secret()).digest();
      });
      cachedProperty(KeyPair, "messagePrefix", function messagePrefix() {
        return this.hash().slice(this.eddsa.encodingLength);
      });
      KeyPair.prototype.sign = function sign(message) {
        assert(this._secret, "KeyPair can only verify");
        return this.eddsa.sign(message, this);
      };
      KeyPair.prototype.verify = function verify(message, sig) {
        return this.eddsa.verify(message, sig, this);
      };
      KeyPair.prototype.getSecret = function getSecret(enc) {
        assert(this._secret, "KeyPair is public only");
        return utils.encode(this.secret(), enc);
      };
      KeyPair.prototype.getPublic = function getPublic(enc) {
        return utils.encode(this.pubBytes(), enc);
      };
      module.exports = KeyPair;
    }
  });

  // node_modules/elliptic/lib/elliptic/eddsa/signature.js
  var require_signature2 = __commonJS({
    "node_modules/elliptic/lib/elliptic/eddsa/signature.js"(exports, module) {
      "use strict";
      var BN = require_bn2();
      var utils = require_utils2();
      var assert = utils.assert;
      var cachedProperty = utils.cachedProperty;
      var parseBytes = utils.parseBytes;
      function Signature(eddsa, sig) {
        this.eddsa = eddsa;
        if (typeof sig !== "object")
          sig = parseBytes(sig);
        if (Array.isArray(sig)) {
          sig = {
            R: sig.slice(0, eddsa.encodingLength),
            S: sig.slice(eddsa.encodingLength)
          };
        }
        assert(sig.R && sig.S, "Signature without R or S");
        if (eddsa.isPoint(sig.R))
          this._R = sig.R;
        if (sig.S instanceof BN)
          this._S = sig.S;
        this._Rencoded = Array.isArray(sig.R) ? sig.R : sig.Rencoded;
        this._Sencoded = Array.isArray(sig.S) ? sig.S : sig.Sencoded;
      }
      cachedProperty(Signature, "S", function S() {
        return this.eddsa.decodeInt(this.Sencoded());
      });
      cachedProperty(Signature, "R", function R() {
        return this.eddsa.decodePoint(this.Rencoded());
      });
      cachedProperty(Signature, "Rencoded", function Rencoded() {
        return this.eddsa.encodePoint(this.R());
      });
      cachedProperty(Signature, "Sencoded", function Sencoded() {
        return this.eddsa.encodeInt(this.S());
      });
      Signature.prototype.toBytes = function toBytes() {
        return this.Rencoded().concat(this.Sencoded());
      };
      Signature.prototype.toHex = function toHex() {
        return utils.encode(this.toBytes(), "hex").toUpperCase();
      };
      module.exports = Signature;
    }
  });

  // node_modules/elliptic/lib/elliptic/eddsa/index.js
  var require_eddsa = __commonJS({
    "node_modules/elliptic/lib/elliptic/eddsa/index.js"(exports, module) {
      "use strict";
      var hash = require_hash();
      var curves = require_curves();
      var utils = require_utils2();
      var assert = utils.assert;
      var parseBytes = utils.parseBytes;
      var KeyPair = require_key2();
      var Signature = require_signature2();
      function EDDSA(curve) {
        assert(curve === "ed25519", "only tested with ed25519 so far");
        if (!(this instanceof EDDSA))
          return new EDDSA(curve);
        curve = curves[curve].curve;
        this.curve = curve;
        this.g = curve.g;
        this.g.precompute(curve.n.bitLength() + 1);
        this.pointClass = curve.point().constructor;
        this.encodingLength = Math.ceil(curve.n.bitLength() / 8);
        this.hash = hash.sha512;
      }
      module.exports = EDDSA;
      EDDSA.prototype.sign = function sign(message, secret) {
        message = parseBytes(message);
        var key = this.keyFromSecret(secret);
        var r = this.hashInt(key.messagePrefix(), message);
        var R = this.g.mul(r);
        var Rencoded = this.encodePoint(R);
        var s_ = this.hashInt(Rencoded, key.pubBytes(), message).mul(key.priv());
        var S = r.add(s_).umod(this.curve.n);
        return this.makeSignature({ R, S, Rencoded });
      };
      EDDSA.prototype.verify = function verify(message, sig, pub) {
        message = parseBytes(message);
        sig = this.makeSignature(sig);
        var key = this.keyFromPublic(pub);
        var h = this.hashInt(sig.Rencoded(), key.pubBytes(), message);
        var SG = this.g.mul(sig.S());
        var RplusAh = sig.R().add(key.pub().mul(h));
        return RplusAh.eq(SG);
      };
      EDDSA.prototype.hashInt = function hashInt() {
        var hash2 = this.hash();
        for (var i = 0; i < arguments.length; i++)
          hash2.update(arguments[i]);
        return utils.intFromLE(hash2.digest()).umod(this.curve.n);
      };
      EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
        return KeyPair.fromPublic(this, pub);
      };
      EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
        return KeyPair.fromSecret(this, secret);
      };
      EDDSA.prototype.makeSignature = function makeSignature(sig) {
        if (sig instanceof Signature)
          return sig;
        return new Signature(this, sig);
      };
      EDDSA.prototype.encodePoint = function encodePoint(point) {
        var enc = point.getY().toArray("le", this.encodingLength);
        enc[this.encodingLength - 1] |= point.getX().isOdd() ? 128 : 0;
        return enc;
      };
      EDDSA.prototype.decodePoint = function decodePoint(bytes) {
        bytes = utils.parseBytes(bytes);
        var lastIx = bytes.length - 1;
        var normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & ~128);
        var xIsOdd = (bytes[lastIx] & 128) !== 0;
        var y = utils.intFromLE(normed);
        return this.curve.pointFromY(y, xIsOdd);
      };
      EDDSA.prototype.encodeInt = function encodeInt(num) {
        return num.toArray("le", this.encodingLength);
      };
      EDDSA.prototype.decodeInt = function decodeInt(bytes) {
        return utils.intFromLE(bytes);
      };
      EDDSA.prototype.isPoint = function isPoint(val) {
        return val instanceof this.pointClass;
      };
    }
  });

  // node_modules/elliptic/lib/elliptic.js
  var require_elliptic = __commonJS({
    "node_modules/elliptic/lib/elliptic.js"(exports) {
      "use strict";
      var elliptic = exports;
      elliptic.version = require_package().version;
      elliptic.utils = require_utils2();
      elliptic.rand = require_brorand();
      elliptic.curve = require_curve();
      elliptic.curves = require_curves();
      elliptic.ec = require_ec();
      elliptic.eddsa = require_eddsa();
    }
  });

  // node_modules/secp256k1/lib/elliptic.js
  var require_elliptic2 = __commonJS({
    "node_modules/secp256k1/lib/elliptic.js"(exports, module) {
      var EC = require_elliptic().ec;
      var ec = new EC("secp256k1");
      var ecparams = ec.curve;
      var BN = ecparams.n.constructor;
      function loadCompressedPublicKey(first, xbuf) {
        let x = new BN(xbuf);
        if (x.cmp(ecparams.p) >= 0)
          return null;
        x = x.toRed(ecparams.red);
        let y = x.redSqr().redIMul(x).redIAdd(ecparams.b).redSqrt();
        if (first === 3 !== y.isOdd())
          y = y.redNeg();
        return ec.keyPair({ pub: { x, y } });
      }
      function loadUncompressedPublicKey(first, xbuf, ybuf) {
        let x = new BN(xbuf);
        let y = new BN(ybuf);
        if (x.cmp(ecparams.p) >= 0 || y.cmp(ecparams.p) >= 0)
          return null;
        x = x.toRed(ecparams.red);
        y = y.toRed(ecparams.red);
        if ((first === 6 || first === 7) && y.isOdd() !== (first === 7))
          return null;
        const x3 = x.redSqr().redIMul(x);
        if (!y.redSqr().redISub(x3.redIAdd(ecparams.b)).isZero())
          return null;
        return ec.keyPair({ pub: { x, y } });
      }
      function loadPublicKey(pubkey) {
        const first = pubkey[0];
        switch (first) {
          case 2:
          case 3:
            if (pubkey.length !== 33)
              return null;
            return loadCompressedPublicKey(first, pubkey.subarray(1, 33));
          case 4:
          case 6:
          case 7:
            if (pubkey.length !== 65)
              return null;
            return loadUncompressedPublicKey(first, pubkey.subarray(1, 33), pubkey.subarray(33, 65));
          default:
            return null;
        }
      }
      function savePublicKey(output, point) {
        const pubkey = point.encode(null, output.length === 33);
        for (let i = 0; i < output.length; ++i)
          output[i] = pubkey[i];
      }
      module.exports = {
        contextRandomize() {
          return 0;
        },
        privateKeyVerify(seckey) {
          const bn = new BN(seckey);
          return bn.cmp(ecparams.n) < 0 && !bn.isZero() ? 0 : 1;
        },
        privateKeyNegate(seckey) {
          const bn = new BN(seckey);
          const negate = ecparams.n.sub(bn).umod(ecparams.n).toArrayLike(Uint8Array, "be", 32);
          seckey.set(negate);
          return 0;
        },
        privateKeyTweakAdd(seckey, tweak) {
          const bn = new BN(tweak);
          if (bn.cmp(ecparams.n) >= 0)
            return 1;
          bn.iadd(new BN(seckey));
          if (bn.cmp(ecparams.n) >= 0)
            bn.isub(ecparams.n);
          if (bn.isZero())
            return 1;
          const tweaked = bn.toArrayLike(Uint8Array, "be", 32);
          seckey.set(tweaked);
          return 0;
        },
        privateKeyTweakMul(seckey, tweak) {
          let bn = new BN(tweak);
          if (bn.cmp(ecparams.n) >= 0 || bn.isZero())
            return 1;
          bn.imul(new BN(seckey));
          if (bn.cmp(ecparams.n) >= 0)
            bn = bn.umod(ecparams.n);
          const tweaked = bn.toArrayLike(Uint8Array, "be", 32);
          seckey.set(tweaked);
          return 0;
        },
        publicKeyVerify(pubkey) {
          const pair = loadPublicKey(pubkey);
          return pair === null ? 1 : 0;
        },
        publicKeyCreate(output, seckey) {
          const bn = new BN(seckey);
          if (bn.cmp(ecparams.n) >= 0 || bn.isZero())
            return 1;
          const point = ec.keyFromPrivate(seckey).getPublic();
          savePublicKey(output, point);
          return 0;
        },
        publicKeyConvert(output, pubkey) {
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 1;
          const point = pair.getPublic();
          savePublicKey(output, point);
          return 0;
        },
        publicKeyNegate(output, pubkey) {
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 1;
          const point = pair.getPublic();
          point.y = point.y.redNeg();
          savePublicKey(output, point);
          return 0;
        },
        publicKeyCombine(output, pubkeys) {
          const pairs = new Array(pubkeys.length);
          for (let i = 0; i < pubkeys.length; ++i) {
            pairs[i] = loadPublicKey(pubkeys[i]);
            if (pairs[i] === null)
              return 1;
          }
          let point = pairs[0].getPublic();
          for (let i = 1; i < pairs.length; ++i)
            point = point.add(pairs[i].pub);
          if (point.isInfinity())
            return 2;
          savePublicKey(output, point);
          return 0;
        },
        publicKeyTweakAdd(output, pubkey, tweak) {
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 1;
          tweak = new BN(tweak);
          if (tweak.cmp(ecparams.n) >= 0)
            return 2;
          const point = pair.getPublic().add(ecparams.g.mul(tweak));
          if (point.isInfinity())
            return 2;
          savePublicKey(output, point);
          return 0;
        },
        publicKeyTweakMul(output, pubkey, tweak) {
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 1;
          tweak = new BN(tweak);
          if (tweak.cmp(ecparams.n) >= 0 || tweak.isZero())
            return 2;
          const point = pair.getPublic().mul(tweak);
          savePublicKey(output, point);
          return 0;
        },
        signatureNormalize(sig) {
          const r = new BN(sig.subarray(0, 32));
          const s = new BN(sig.subarray(32, 64));
          if (r.cmp(ecparams.n) >= 0 || s.cmp(ecparams.n) >= 0)
            return 1;
          if (s.cmp(ec.nh) === 1) {
            sig.set(ecparams.n.sub(s).toArrayLike(Uint8Array, "be", 32), 32);
          }
          return 0;
        },
        signatureExport(obj, sig) {
          const sigR = sig.subarray(0, 32);
          const sigS = sig.subarray(32, 64);
          if (new BN(sigR).cmp(ecparams.n) >= 0)
            return 1;
          if (new BN(sigS).cmp(ecparams.n) >= 0)
            return 1;
          const { output } = obj;
          let r = output.subarray(4, 4 + 33);
          r[0] = 0;
          r.set(sigR, 1);
          let lenR = 33;
          let posR = 0;
          for (; lenR > 1 && r[posR] === 0 && !(r[posR + 1] & 128); --lenR, ++posR)
            ;
          r = r.subarray(posR);
          if (r[0] & 128)
            return 1;
          if (lenR > 1 && r[0] === 0 && !(r[1] & 128))
            return 1;
          let s = output.subarray(6 + 33, 6 + 33 + 33);
          s[0] = 0;
          s.set(sigS, 1);
          let lenS = 33;
          let posS = 0;
          for (; lenS > 1 && s[posS] === 0 && !(s[posS + 1] & 128); --lenS, ++posS)
            ;
          s = s.subarray(posS);
          if (s[0] & 128)
            return 1;
          if (lenS > 1 && s[0] === 0 && !(s[1] & 128))
            return 1;
          obj.outputlen = 6 + lenR + lenS;
          output[0] = 48;
          output[1] = obj.outputlen - 2;
          output[2] = 2;
          output[3] = r.length;
          output.set(r, 4);
          output[4 + lenR] = 2;
          output[5 + lenR] = s.length;
          output.set(s, 6 + lenR);
          return 0;
        },
        signatureImport(output, sig) {
          if (sig.length < 8)
            return 1;
          if (sig.length > 72)
            return 1;
          if (sig[0] !== 48)
            return 1;
          if (sig[1] !== sig.length - 2)
            return 1;
          if (sig[2] !== 2)
            return 1;
          const lenR = sig[3];
          if (lenR === 0)
            return 1;
          if (5 + lenR >= sig.length)
            return 1;
          if (sig[4 + lenR] !== 2)
            return 1;
          const lenS = sig[5 + lenR];
          if (lenS === 0)
            return 1;
          if (6 + lenR + lenS !== sig.length)
            return 1;
          if (sig[4] & 128)
            return 1;
          if (lenR > 1 && sig[4] === 0 && !(sig[5] & 128))
            return 1;
          if (sig[lenR + 6] & 128)
            return 1;
          if (lenS > 1 && sig[lenR + 6] === 0 && !(sig[lenR + 7] & 128))
            return 1;
          let sigR = sig.subarray(4, 4 + lenR);
          if (sigR.length === 33 && sigR[0] === 0)
            sigR = sigR.subarray(1);
          if (sigR.length > 32)
            return 1;
          let sigS = sig.subarray(6 + lenR);
          if (sigS.length === 33 && sigS[0] === 0)
            sigS = sigS.slice(1);
          if (sigS.length > 32)
            throw new Error("S length is too long");
          let r = new BN(sigR);
          if (r.cmp(ecparams.n) >= 0)
            r = new BN(0);
          let s = new BN(sig.subarray(6 + lenR));
          if (s.cmp(ecparams.n) >= 0)
            s = new BN(0);
          output.set(r.toArrayLike(Uint8Array, "be", 32), 0);
          output.set(s.toArrayLike(Uint8Array, "be", 32), 32);
          return 0;
        },
        ecdsaSign(obj, message, seckey, data, noncefn) {
          if (noncefn) {
            const _noncefn = noncefn;
            noncefn = (counter) => {
              const nonce = _noncefn(message, seckey, null, data, counter);
              const isValid = nonce instanceof Uint8Array && nonce.length === 32;
              if (!isValid)
                throw new Error("This is the way");
              return new BN(nonce);
            };
          }
          const d = new BN(seckey);
          if (d.cmp(ecparams.n) >= 0 || d.isZero())
            return 1;
          let sig;
          try {
            sig = ec.sign(message, seckey, { canonical: true, k: noncefn, pers: data });
          } catch (err2) {
            return 1;
          }
          obj.signature.set(sig.r.toArrayLike(Uint8Array, "be", 32), 0);
          obj.signature.set(sig.s.toArrayLike(Uint8Array, "be", 32), 32);
          obj.recid = sig.recoveryParam;
          return 0;
        },
        ecdsaVerify(sig, msg32, pubkey) {
          const sigObj = { r: sig.subarray(0, 32), s: sig.subarray(32, 64) };
          const sigr = new BN(sigObj.r);
          const sigs = new BN(sigObj.s);
          if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0)
            return 1;
          if (sigs.cmp(ec.nh) === 1 || sigr.isZero() || sigs.isZero())
            return 3;
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 2;
          const point = pair.getPublic();
          const isValid = ec.verify(msg32, sigObj, point);
          return isValid ? 0 : 3;
        },
        ecdsaRecover(output, sig, recid, msg32) {
          const sigObj = { r: sig.slice(0, 32), s: sig.slice(32, 64) };
          const sigr = new BN(sigObj.r);
          const sigs = new BN(sigObj.s);
          if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0)
            return 1;
          if (sigr.isZero() || sigs.isZero())
            return 2;
          let point;
          try {
            point = ec.recoverPubKey(msg32, sigObj, recid);
          } catch (err2) {
            return 2;
          }
          savePublicKey(output, point);
          return 0;
        },
        ecdh(output, pubkey, seckey, data, hashfn, xbuf, ybuf) {
          const pair = loadPublicKey(pubkey);
          if (pair === null)
            return 1;
          const scalar = new BN(seckey);
          if (scalar.cmp(ecparams.n) >= 0 || scalar.isZero())
            return 2;
          const point = pair.getPublic().mul(scalar);
          if (hashfn === void 0) {
            const data2 = point.encode(null, true);
            const sha256 = ec.hash().update(data2).digest();
            for (let i = 0; i < 32; ++i)
              output[i] = sha256[i];
          } else {
            if (!xbuf)
              xbuf = new Uint8Array(32);
            const x = point.getX().toArray("be", 32);
            for (let i = 0; i < 32; ++i)
              xbuf[i] = x[i];
            if (!ybuf)
              ybuf = new Uint8Array(32);
            const y = point.getY().toArray("be", 32);
            for (let i = 0; i < 32; ++i)
              ybuf[i] = y[i];
            const hash = hashfn(xbuf, ybuf, data);
            const isValid = hash instanceof Uint8Array && hash.length === output.length;
            if (!isValid)
              return 2;
            output.set(hash);
          }
          return 0;
        }
      };
    }
  });

  // node_modules/secp256k1/elliptic.js
  var require_elliptic3 = __commonJS({
    "node_modules/secp256k1/elliptic.js"(exports, module) {
      module.exports = require_lib()(require_elliptic2());
    }
  });

  // src/ethereum/lib/ethjs-util/index.js
  var require_ethjs_util = __commonJS({
    "src/ethereum/lib/ethjs-util/index.js"(exports, module) {
      function isHexPrefixed(str) {
        if (typeof str !== "string") {
          throw new Error(
            "[is-hex-prefixed] value must be type 'string', is currently type " + typeof str + ", while checking isHexPrefixed."
          );
        }
        return str.slice(0, 2) === "0x";
      }
      function stripHexPrefix(str) {
        if (typeof str !== "string") {
          return str;
        }
        return isHexPrefixed(str) ? str.slice(2) : str;
      }
      function isHexString(value, length) {
        if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
          return false;
        }
        if (length && value.length !== 2 + 2 * length) {
          return false;
        }
        return true;
      }
      function padToEven(value) {
        var a = value;
        if (typeof a !== "string") {
          throw new Error(
            "[ethjs-util] while padding to even, value must be string, is currently " + typeof a + ", while padToEven."
          );
        }
        if (a.length % 2) {
          a = "0" + a;
        }
        return a;
      }
      function intToHex(i) {
        var hex = i.toString(16);
        return "0x" + hex;
      }
      function intToBuffer(i) {
        var hex = intToHex(i);
        return new Buffer(padToEven(hex.slice(2)), "hex");
      }
      module.exports = { intToBuffer, padToEven, isHexString, stripHexPrefix };
    }
  });

  // src/ethereum/lib/js-sha3/keccak.js
  var require_keccak = __commonJS({
    "src/ethereum/lib/js-sha3/keccak.js"(exports, module) {
      var INPUT_ERROR = "input is invalid type";
      var FINALIZE_ERROR = "finalize already called";
      var WINDOW = typeof window === "object";
      var root = WINDOW ? window : {};
      if (root.JS_SHA3_NO_WINDOW) {
        WINDOW = false;
      }
      var WEB_WORKER = !WINDOW && typeof self === "object";
      var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
      if (NODE_JS) {
        root = global;
      } else if (WEB_WORKER) {
        root = self;
      }
      var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && typeof module === "object" && module.exports;
      var AMD = typeof define === "function" && define.amd;
      var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
      var HEX_CHARS = "0123456789abcdef".split("");
      var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
      var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
      var KECCAK_PADDING = [1, 256, 65536, 16777216];
      var PADDING = [6, 1536, 393216, 100663296];
      var SHIFT = [0, 8, 16, 24];
      var RC = [
        1,
        0,
        32898,
        0,
        32906,
        2147483648,
        2147516416,
        2147483648,
        32907,
        0,
        2147483649,
        0,
        2147516545,
        2147483648,
        32777,
        2147483648,
        138,
        0,
        136,
        0,
        2147516425,
        0,
        2147483658,
        0,
        2147516555,
        0,
        139,
        2147483648,
        32905,
        2147483648,
        32771,
        2147483648,
        32770,
        2147483648,
        128,
        2147483648,
        32778,
        0,
        2147483658,
        2147483648,
        2147516545,
        2147483648,
        32896,
        2147483648,
        2147483649,
        0,
        2147516424,
        2147483648
      ];
      var BITS = [224, 256, 384, 512];
      var SHAKE_BITS = [128, 256];
      var OUTPUT_TYPES = ["hex", "buffer", "arrayBuffer", "array", "digest"];
      var CSHAKE_BYTEPAD = {
        "128": 168,
        "256": 136
      };
      if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
        Array.isArray = function(obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        };
      }
      if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
        ArrayBuffer.isView = function(obj) {
          return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        };
      }
      var createOutputMethod = function(bits2, padding, outputType) {
        return function(message) {
          return new Keccak(bits2, padding, bits2).update(message)[outputType]();
        };
      };
      var createShakeOutputMethod = function(bits2, padding, outputType) {
        return function(message, outputBits) {
          return new Keccak(bits2, padding, outputBits).update(message)[outputType]();
        };
      };
      var createCshakeOutputMethod = function(bits2, padding, outputType) {
        return function(message, outputBits, n, s) {
          return methods["cshake" + bits2].update(message, outputBits, n, s)[outputType]();
        };
      };
      var createKmacOutputMethod = function(bits2, padding, outputType) {
        return function(key, message, outputBits, s) {
          return methods["kmac" + bits2].update(key, message, outputBits, s)[outputType]();
        };
      };
      var createOutputMethods = function(method, createMethod2, bits2, padding) {
        for (var i2 = 0; i2 < OUTPUT_TYPES.length; ++i2) {
          var type3 = OUTPUT_TYPES[i2];
          method[type3] = createMethod2(bits2, padding, type3);
        }
        return method;
      };
      var createMethod = function(bits2, padding) {
        var method = createOutputMethod(bits2, padding, "hex");
        method.create = function() {
          return new Keccak(bits2, padding, bits2);
        };
        method.update = function(message) {
          return method.create().update(message);
        };
        return createOutputMethods(method, createOutputMethod, bits2, padding);
      };
      var createShakeMethod = function(bits2, padding) {
        var method = createShakeOutputMethod(bits2, padding, "hex");
        method.create = function(outputBits) {
          return new Keccak(bits2, padding, outputBits);
        };
        method.update = function(message, outputBits) {
          return method.create(outputBits).update(message);
        };
        return createOutputMethods(method, createShakeOutputMethod, bits2, padding);
      };
      var createCshakeMethod = function(bits2, padding) {
        var w = CSHAKE_BYTEPAD[bits2];
        var method = createCshakeOutputMethod(bits2, padding, "hex");
        method.create = function(outputBits, n, s) {
          if (!n && !s) {
            return methods["shake" + bits2].create(outputBits);
          } else {
            return new Keccak(bits2, padding, outputBits).bytepad([n, s], w);
          }
        };
        method.update = function(message, outputBits, n, s) {
          return method.create(outputBits, n, s).update(message);
        };
        return createOutputMethods(method, createCshakeOutputMethod, bits2, padding);
      };
      var createKmacMethod = function(bits2, padding) {
        var w = CSHAKE_BYTEPAD[bits2];
        var method = createKmacOutputMethod(bits2, padding, "hex");
        method.create = function(key, outputBits, s) {
          return new Kmac(bits2, padding, outputBits).bytepad(["KMAC", s], w).bytepad([key], w);
        };
        method.update = function(key, message, outputBits, s) {
          return method.create(key, outputBits, s).update(message);
        };
        return createOutputMethods(method, createKmacOutputMethod, bits2, padding);
      };
      var algorithms = [
        {
          name: "keccak",
          padding: KECCAK_PADDING,
          bits: BITS,
          createMethod
        },
        { name: "sha3", padding: PADDING, bits: BITS, createMethod },
        {
          name: "shake",
          padding: SHAKE_PADDING,
          bits: SHAKE_BITS,
          createMethod: createShakeMethod
        },
        {
          name: "cshake",
          padding: CSHAKE_PADDING,
          bits: SHAKE_BITS,
          createMethod: createCshakeMethod
        },
        {
          name: "kmac",
          padding: CSHAKE_PADDING,
          bits: SHAKE_BITS,
          createMethod: createKmacMethod
        }
      ];
      var methods = {};
      var methodNames = [];
      for (i = 0; i < algorithms.length; ++i) {
        algorithm = algorithms[i];
        bits = algorithm.bits;
        for (j = 0; j < bits.length; ++j) {
          methodName = algorithm.name + "_" + bits[j];
          methodNames.push(methodName);
          methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
          if (algorithm.name !== "sha3") {
            newMethodName = algorithm.name + bits[j];
            methodNames.push(newMethodName);
            methods[newMethodName] = methods[methodName];
          }
        }
      }
      var algorithm;
      var bits;
      var methodName;
      var newMethodName;
      var j;
      var i;
      function Keccak(bits2, padding, outputBits) {
        this.blocks = [];
        this.s = [];
        this.padding = padding;
        this.outputBits = outputBits;
        this.reset = true;
        this.finalized = false;
        this.block = 0;
        this.start = 0;
        this.blockCount = 1600 - (bits2 << 1) >> 5;
        this.byteCount = this.blockCount << 2;
        this.outputBlocks = outputBits >> 5;
        this.extraBytes = (outputBits & 31) >> 3;
        for (var i2 = 0; i2 < 50; ++i2) {
          this.s[i2] = 0;
        }
      }
      Keccak.prototype.update = function(message) {
        if (this.finalized) {
          throw new Error(FINALIZE_ERROR);
        }
        var notString, type3 = typeof message;
        if (type3 !== "string") {
          if (type3 === "object") {
            if (message === null) {
              throw new Error(INPUT_ERROR);
            } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            } else if (!Array.isArray(message)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                throw new Error(INPUT_ERROR);
              }
            }
          } else {
            throw new Error(INPUT_ERROR);
          }
          notString = true;
        }
        var blocks = this.blocks, byteCount = this.byteCount, length = message.length, blockCount = this.blockCount, index = 0, s = this.s, i2, code;
        while (index < length) {
          if (this.reset) {
            this.reset = false;
            blocks[0] = this.block;
            for (i2 = 1; i2 < blockCount + 1; ++i2) {
              blocks[i2] = 0;
            }
          }
          if (notString) {
            for (i2 = this.start; index < length && i2 < byteCount; ++index) {
              blocks[i2 >> 2] |= message[index] << SHIFT[i2++ & 3];
            }
          } else {
            for (i2 = this.start; index < length && i2 < byteCount; ++index) {
              code = message.charCodeAt(index);
              if (code < 128) {
                blocks[i2 >> 2] |= code << SHIFT[i2++ & 3];
              } else if (code < 2048) {
                blocks[i2 >> 2] |= (192 | code >> 6) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
              } else if (code < 55296 || code >= 57344) {
                blocks[i2 >> 2] |= (224 | code >> 12) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
              } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks[i2 >> 2] |= (240 | code >> 18) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code >> 12 & 63) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
              }
            }
          }
          this.lastByteIndex = i2;
          if (i2 >= byteCount) {
            this.start = i2 - byteCount;
            this.block = blocks[blockCount];
            for (i2 = 0; i2 < blockCount; ++i2) {
              s[i2] ^= blocks[i2];
            }
            f(s);
            this.reset = true;
          } else {
            this.start = i2;
          }
        }
        return this;
      };
      Keccak.prototype.encode = function(x, right) {
        var o = x & 255, n = 1;
        var bytes = [o];
        x = x >> 8;
        o = x & 255;
        while (o > 0) {
          bytes.unshift(o);
          x = x >> 8;
          o = x & 255;
          ++n;
        }
        if (right) {
          bytes.push(n);
        } else {
          bytes.unshift(n);
        }
        this.update(bytes);
        return bytes.length;
      };
      Keccak.prototype.encodeString = function(str) {
        var notString, type3 = typeof str;
        if (type3 !== "string") {
          if (type3 === "object") {
            if (str === null) {
              throw new Error(INPUT_ERROR);
            } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
              str = new Uint8Array(str);
            } else if (!Array.isArray(str)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
                throw new Error(INPUT_ERROR);
              }
            }
          } else {
            throw new Error(INPUT_ERROR);
          }
          notString = true;
        }
        var bytes = 0, length = str.length;
        if (notString) {
          bytes = length;
        } else {
          for (var i2 = 0; i2 < str.length; ++i2) {
            var code = str.charCodeAt(i2);
            if (code < 128) {
              bytes += 1;
            } else if (code < 2048) {
              bytes += 2;
            } else if (code < 55296 || code >= 57344) {
              bytes += 3;
            } else {
              code = 65536 + ((code & 1023) << 10 | str.charCodeAt(++i2) & 1023);
              bytes += 4;
            }
          }
        }
        bytes += this.encode(bytes * 8);
        this.update(str);
        return bytes;
      };
      Keccak.prototype.bytepad = function(strs, w) {
        var bytes = this.encode(w);
        for (var i2 = 0; i2 < strs.length; ++i2) {
          bytes += this.encodeString(strs[i2]);
        }
        var paddingBytes = w - bytes % w;
        var zeros = [];
        zeros.length = paddingBytes;
        this.update(zeros);
        return this;
      };
      Keccak.prototype.finalize = function() {
        if (this.finalized) {
          return;
        }
        this.finalized = true;
        var blocks = this.blocks, i2 = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
        blocks[i2 >> 2] |= this.padding[i2 & 3];
        if (this.lastByteIndex === this.byteCount) {
          blocks[0] = blocks[blockCount];
          for (i2 = 1; i2 < blockCount + 1; ++i2) {
            blocks[i2] = 0;
          }
        }
        blocks[blockCount - 1] |= 2147483648;
        for (i2 = 0; i2 < blockCount; ++i2) {
          s[i2] ^= blocks[i2];
        }
        f(s);
      };
      Keccak.prototype.toString = Keccak.prototype.hex = function() {
        this.finalize();
        var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
        var hex = "", block;
        while (j2 < outputBlocks) {
          for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
            block = s[i2];
            hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15] + HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15] + HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15] + HEX_CHARS[block >> 28 & 15] + HEX_CHARS[block >> 24 & 15];
          }
          if (j2 % blockCount === 0) {
            f(s);
            i2 = 0;
          }
        }
        if (extraBytes) {
          block = s[i2];
          hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15];
          if (extraBytes > 1) {
            hex += HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15];
          }
          if (extraBytes > 2) {
            hex += HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15];
          }
        }
        return hex;
      };
      Keccak.prototype.arrayBuffer = function() {
        this.finalize();
        var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
        var bytes = this.outputBits >> 3;
        var buffer;
        if (extraBytes) {
          buffer = new ArrayBuffer(outputBlocks + 1 << 2);
        } else {
          buffer = new ArrayBuffer(bytes);
        }
        var array = new Uint32Array(buffer);
        while (j2 < outputBlocks) {
          for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
            array[j2] = s[i2];
          }
          if (j2 % blockCount === 0) {
            f(s);
          }
        }
        if (extraBytes) {
          array[i2] = s[i2];
          buffer = buffer.slice(0, bytes);
        }
        return buffer;
      };
      Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;
      Keccak.prototype.digest = Keccak.prototype.array = function() {
        this.finalize();
        var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
        var array = [], offset, block;
        while (j2 < outputBlocks) {
          for (i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2) {
            offset = j2 << 2;
            block = s[i2];
            array[offset] = block & 255;
            array[offset + 1] = block >> 8 & 255;
            array[offset + 2] = block >> 16 & 255;
            array[offset + 3] = block >> 24 & 255;
          }
          if (j2 % blockCount === 0) {
            f(s);
          }
        }
        if (extraBytes) {
          offset = j2 << 2;
          block = s[i2];
          array[offset] = block & 255;
          if (extraBytes > 1) {
            array[offset + 1] = block >> 8 & 255;
          }
          if (extraBytes > 2) {
            array[offset + 2] = block >> 16 & 255;
          }
        }
        return array;
      };
      function Kmac(bits2, padding, outputBits) {
        Keccak.call(this, bits2, padding, outputBits);
      }
      Kmac.prototype = new Keccak();
      Kmac.prototype.finalize = function() {
        this.encode(this.outputBits, true);
        return Keccak.prototype.finalize.call(this);
      };
      var f = function(s) {
        var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
        for (n = 0; n < 48; n += 2) {
          c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
          c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
          c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
          c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
          c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
          c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
          c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
          c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
          c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
          c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
          h = c8 ^ (c2 << 1 | c3 >>> 31);
          l = c9 ^ (c3 << 1 | c2 >>> 31);
          s[0] ^= h;
          s[1] ^= l;
          s[10] ^= h;
          s[11] ^= l;
          s[20] ^= h;
          s[21] ^= l;
          s[30] ^= h;
          s[31] ^= l;
          s[40] ^= h;
          s[41] ^= l;
          h = c0 ^ (c4 << 1 | c5 >>> 31);
          l = c1 ^ (c5 << 1 | c4 >>> 31);
          s[2] ^= h;
          s[3] ^= l;
          s[12] ^= h;
          s[13] ^= l;
          s[22] ^= h;
          s[23] ^= l;
          s[32] ^= h;
          s[33] ^= l;
          s[42] ^= h;
          s[43] ^= l;
          h = c2 ^ (c6 << 1 | c7 >>> 31);
          l = c3 ^ (c7 << 1 | c6 >>> 31);
          s[4] ^= h;
          s[5] ^= l;
          s[14] ^= h;
          s[15] ^= l;
          s[24] ^= h;
          s[25] ^= l;
          s[34] ^= h;
          s[35] ^= l;
          s[44] ^= h;
          s[45] ^= l;
          h = c4 ^ (c8 << 1 | c9 >>> 31);
          l = c5 ^ (c9 << 1 | c8 >>> 31);
          s[6] ^= h;
          s[7] ^= l;
          s[16] ^= h;
          s[17] ^= l;
          s[26] ^= h;
          s[27] ^= l;
          s[36] ^= h;
          s[37] ^= l;
          s[46] ^= h;
          s[47] ^= l;
          h = c6 ^ (c0 << 1 | c1 >>> 31);
          l = c7 ^ (c1 << 1 | c0 >>> 31);
          s[8] ^= h;
          s[9] ^= l;
          s[18] ^= h;
          s[19] ^= l;
          s[28] ^= h;
          s[29] ^= l;
          s[38] ^= h;
          s[39] ^= l;
          s[48] ^= h;
          s[49] ^= l;
          b0 = s[0];
          b1 = s[1];
          b32 = s[11] << 4 | s[10] >>> 28;
          b33 = s[10] << 4 | s[11] >>> 28;
          b14 = s[20] << 3 | s[21] >>> 29;
          b15 = s[21] << 3 | s[20] >>> 29;
          b46 = s[31] << 9 | s[30] >>> 23;
          b47 = s[30] << 9 | s[31] >>> 23;
          b28 = s[40] << 18 | s[41] >>> 14;
          b29 = s[41] << 18 | s[40] >>> 14;
          b20 = s[2] << 1 | s[3] >>> 31;
          b21 = s[3] << 1 | s[2] >>> 31;
          b2 = s[13] << 12 | s[12] >>> 20;
          b3 = s[12] << 12 | s[13] >>> 20;
          b34 = s[22] << 10 | s[23] >>> 22;
          b35 = s[23] << 10 | s[22] >>> 22;
          b16 = s[33] << 13 | s[32] >>> 19;
          b17 = s[32] << 13 | s[33] >>> 19;
          b48 = s[42] << 2 | s[43] >>> 30;
          b49 = s[43] << 2 | s[42] >>> 30;
          b40 = s[5] << 30 | s[4] >>> 2;
          b41 = s[4] << 30 | s[5] >>> 2;
          b22 = s[14] << 6 | s[15] >>> 26;
          b23 = s[15] << 6 | s[14] >>> 26;
          b4 = s[25] << 11 | s[24] >>> 21;
          b5 = s[24] << 11 | s[25] >>> 21;
          b36 = s[34] << 15 | s[35] >>> 17;
          b37 = s[35] << 15 | s[34] >>> 17;
          b18 = s[45] << 29 | s[44] >>> 3;
          b19 = s[44] << 29 | s[45] >>> 3;
          b10 = s[6] << 28 | s[7] >>> 4;
          b11 = s[7] << 28 | s[6] >>> 4;
          b42 = s[17] << 23 | s[16] >>> 9;
          b43 = s[16] << 23 | s[17] >>> 9;
          b24 = s[26] << 25 | s[27] >>> 7;
          b25 = s[27] << 25 | s[26] >>> 7;
          b6 = s[36] << 21 | s[37] >>> 11;
          b7 = s[37] << 21 | s[36] >>> 11;
          b38 = s[47] << 24 | s[46] >>> 8;
          b39 = s[46] << 24 | s[47] >>> 8;
          b30 = s[8] << 27 | s[9] >>> 5;
          b31 = s[9] << 27 | s[8] >>> 5;
          b12 = s[18] << 20 | s[19] >>> 12;
          b13 = s[19] << 20 | s[18] >>> 12;
          b44 = s[29] << 7 | s[28] >>> 25;
          b45 = s[28] << 7 | s[29] >>> 25;
          b26 = s[38] << 8 | s[39] >>> 24;
          b27 = s[39] << 8 | s[38] >>> 24;
          b8 = s[48] << 14 | s[49] >>> 18;
          b9 = s[49] << 14 | s[48] >>> 18;
          s[0] = b0 ^ ~b2 & b4;
          s[1] = b1 ^ ~b3 & b5;
          s[10] = b10 ^ ~b12 & b14;
          s[11] = b11 ^ ~b13 & b15;
          s[20] = b20 ^ ~b22 & b24;
          s[21] = b21 ^ ~b23 & b25;
          s[30] = b30 ^ ~b32 & b34;
          s[31] = b31 ^ ~b33 & b35;
          s[40] = b40 ^ ~b42 & b44;
          s[41] = b41 ^ ~b43 & b45;
          s[2] = b2 ^ ~b4 & b6;
          s[3] = b3 ^ ~b5 & b7;
          s[12] = b12 ^ ~b14 & b16;
          s[13] = b13 ^ ~b15 & b17;
          s[22] = b22 ^ ~b24 & b26;
          s[23] = b23 ^ ~b25 & b27;
          s[32] = b32 ^ ~b34 & b36;
          s[33] = b33 ^ ~b35 & b37;
          s[42] = b42 ^ ~b44 & b46;
          s[43] = b43 ^ ~b45 & b47;
          s[4] = b4 ^ ~b6 & b8;
          s[5] = b5 ^ ~b7 & b9;
          s[14] = b14 ^ ~b16 & b18;
          s[15] = b15 ^ ~b17 & b19;
          s[24] = b24 ^ ~b26 & b28;
          s[25] = b25 ^ ~b27 & b29;
          s[34] = b34 ^ ~b36 & b38;
          s[35] = b35 ^ ~b37 & b39;
          s[44] = b44 ^ ~b46 & b48;
          s[45] = b45 ^ ~b47 & b49;
          s[6] = b6 ^ ~b8 & b0;
          s[7] = b7 ^ ~b9 & b1;
          s[16] = b16 ^ ~b18 & b10;
          s[17] = b17 ^ ~b19 & b11;
          s[26] = b26 ^ ~b28 & b20;
          s[27] = b27 ^ ~b29 & b21;
          s[36] = b36 ^ ~b38 & b30;
          s[37] = b37 ^ ~b39 & b31;
          s[46] = b46 ^ ~b48 & b40;
          s[47] = b47 ^ ~b49 & b41;
          s[8] = b8 ^ ~b0 & b2;
          s[9] = b9 ^ ~b1 & b3;
          s[18] = b18 ^ ~b10 & b12;
          s[19] = b19 ^ ~b11 & b13;
          s[28] = b28 ^ ~b20 & b22;
          s[29] = b29 ^ ~b21 & b23;
          s[38] = b38 ^ ~b30 & b32;
          s[39] = b39 ^ ~b31 & b33;
          s[48] = b48 ^ ~b40 & b42;
          s[49] = b49 ^ ~b41 & b43;
          s[0] ^= RC[n];
          s[1] ^= RC[n + 1];
        }
      };
      if (COMMON_JS) {
        module.exports = methods;
      } else {
        for (i = 0; i < methodNames.length; ++i) {
          root[methodNames[i]] = methods[methodNames[i]];
        }
        if (AMD) {
          define(function() {
            return methods;
          });
        }
      }
    }
  });

  // src/ethereum/lib/ethereumjs-util/index.js
  var require_ethereumjs_util = __commonJS({
    "src/ethereum/lib/ethereumjs-util/index.js"(exports) {
      var BN = require_bn();
      var _secp256k1 = require_elliptic3();
      var ethjsUtil = require_ethjs_util();
      var { keccak256 } = require_keccak();
      exports.keccak = function(a, bits) {
        if (bits === void 0) {
          bits = 256;
        }
        if (typeof a === "string" && !ethjsUtil.isHexString(a)) {
          a = Buffer.from(a, "utf8");
        } else {
          a = exports.toBuffer(a);
        }
        if (!bits)
          bits = 256;
        switch (bits) {
          case 256: {
            return Buffer.from(keccak256.buffer(a));
          }
          default: {
            throw new Error("Invald algorithm: keccak" + bits);
          }
        }
      };
      exports.keccak256 = function(a) {
        return exports.keccak(a);
      };
      exports.isHexPrefixed = ethjsUtil.isHexPrefixed;
      exports.stripHexPrefix = ethjsUtil.stripHexPrefix;
      exports.toBuffer = function(v) {
        if (!Buffer.isBuffer(v)) {
          if (Array.isArray(v)) {
            v = Buffer.from(v);
          } else if (typeof v === "string") {
            if (ethjsUtil.isHexString(v)) {
              v = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(v)), "hex");
            } else {
              throw new Error(
                "Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: " + v
              );
            }
          } else if (typeof v === "number") {
            v = ethjsUtil.intToBuffer(v);
          } else if (v === null || v === void 0) {
            v = Buffer.allocUnsafe(0);
          } else if (BN.isBN(v)) {
            v = v.toArrayLike(Buffer);
          } else if (v.toArray) {
            v = Buffer.from(v.toArray());
          } else {
            throw new Error("invalid type");
          }
        }
        return v;
      };
      exports.bufferToHex = function(buf) {
        buf = exports.toBuffer(buf);
        return "0x" + buf.toString("hex");
      };
      exports.zeros = function(bytes) {
        return Buffer.allocUnsafe(bytes).fill(0);
      };
      exports.setLengthLeft = function(msg, length, right) {
        if (right === void 0) {
          right = false;
        }
        var buf = exports.zeros(length);
        msg = exports.toBuffer(msg);
        if (right) {
          if (msg.length < length) {
            msg.copy(buf);
            return buf;
          }
          return msg.slice(0, length);
        } else {
          if (msg.length < length) {
            msg.copy(buf, length - msg.length);
            return buf;
          }
          return msg.slice(-length);
        }
      };
      exports.setLength = exports.setLengthLeft;
      exports.setLengthRight = function(msg, length) {
        return exports.setLength(msg, length, true);
      };
      exports.toBuffer = function(v) {
        if (!Buffer.isBuffer(v)) {
          if (Array.isArray(v)) {
            v = Buffer.from(v);
          } else if (typeof v === "string") {
            if (ethjsUtil.isHexString(v)) {
              v = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(v)), "hex");
            } else {
              throw new Error(
                "Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: " + v
              );
            }
          } else if (typeof v === "number") {
            v = ethjsUtil.intToBuffer(v);
          } else if (v === null || v === void 0) {
            v = Buffer.allocUnsafe(0);
          } else if (BN.isBN(v)) {
            v = v.toArrayLike(Buffer);
          } else if (v.toArray) {
            v = Buffer.from(v.toArray());
          } else {
            throw new Error("invalid type");
          }
        }
        return v;
      };
      exports.fromRpcSig = function(sig) {
        var buf = exports.toBuffer(sig);
        if (buf.length !== 65) {
          throw new Error("Invalid signature length");
        }
        var v = buf[64];
        if (v < 27) {
          v += 27;
        }
        return {
          v,
          r: buf.slice(0, 32),
          s: buf.slice(32, 64)
        };
      };
      function calculateSigRecovery(v, chainId) {
        return chainId ? v - (2 * chainId + 35) : v - 27;
      }
      function isValidSigRecovery(recovery) {
        return recovery === 0 || recovery === 1;
      }
      var secp256k1 = {};
      secp256k1.recover = function(message, signature, recid, compressed) {
        return Buffer.from(
          _secp256k1.ecdsaRecover(
            Uint8Array.from(signature),
            recid,
            Uint8Array.from(message),
            compressed
          )
        );
      };
      secp256k1.publicKeyConvert = function(publicKey, compressed) {
        return Buffer.from(
          _secp256k1.publicKeyConvert(Uint8Array.from(publicKey), compressed)
        );
      };
      exports.ecrecover = function(msgHash, v, r, s, chainId) {
        var signature = Buffer.concat(
          [exports.setLength(r, 32), exports.setLength(s, 32)],
          64
        );
        var recovery = calculateSigRecovery(v, chainId);
        if (!isValidSigRecovery(recovery)) {
          throw new Error("Invalid signature v value");
        }
        var senderPubKey = secp256k1.recover(msgHash, signature, recovery);
        return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
      };
      exports.pubToAddress = function(pubKey, sanitize) {
        if (sanitize === void 0) {
          sanitize = false;
        }
        pubKey = exports.toBuffer(pubKey);
        if (sanitize && pubKey.length !== 64) {
          pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1);
        }
        if (pubKey.length !== 64) {
          throw new Error("Invalid length");
        }
        return exports.keccak(pubKey).slice(-20);
      };
      exports.publicToAddress = exports.pubToAddress;
      exports.hashPersonalMessage = function(message) {
        const prefix = Buffer.from(
          `Ethereum Signed Message:
${message.length}`,
          "utf-8"
        );
        return Buffer.from(exports.keccak(Buffer.concat([prefix, message])));
      };
    }
  });

  // src/ethereum/lib/ethereumjs-abi/index.js
  var require_ethereumjs_abi = __commonJS({
    "src/ethereum/lib/ethereumjs-abi/index.js"(exports, module) {
      var utils = require_ethereumjs_util();
      var BN = require_bn();
      var ABI = function() {
      };
      function elementaryName(name) {
        if (name.startsWith("int[")) {
          return "int256" + name.slice(3);
        } else if (name === "int") {
          return "int256";
        } else if (name.startsWith("uint[")) {
          return "uint256" + name.slice(4);
        } else if (name === "uint") {
          return "uint256";
        } else if (name.startsWith("fixed[")) {
          return "fixed128x128" + name.slice(5);
        } else if (name === "fixed") {
          return "fixed128x128";
        } else if (name.startsWith("ufixed[")) {
          return "ufixed128x128" + name.slice(6);
        } else if (name === "ufixed") {
          return "ufixed128x128";
        }
        return name;
      }
      ABI.eventID = function(name, types) {
        var sig = name + "(" + types.map(elementaryName).join(",") + ")";
        return utils.keccak256(Buffer.from(sig));
      };
      ABI.methodID = function(name, types) {
        return ABI.eventID(name, types).slice(0, 4);
      };
      function parseTypeN(type3) {
        return parseInt(/^\D+(\d+)$/.exec(type3)[1], 10);
      }
      function parseTypeNxM(type3) {
        var tmp = /^\D+(\d+)x(\d+)$/.exec(type3);
        return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)];
      }
      function parseTypeArray(type3) {
        var tmp = type3.match(/(.*)\[(.*?)\]$/);
        if (tmp) {
          return tmp[2] === "" ? "dynamic" : parseInt(tmp[2], 10);
        }
        return null;
      }
      function parseNumber(arg) {
        var type3 = typeof arg;
        if (type3 === "string") {
          if (utils.isHexPrefixed(arg)) {
            return new BN(utils.stripHexPrefix(arg), 16);
          } else {
            return new BN(arg, 10);
          }
        } else if (type3 === "number") {
          return new BN(arg);
        } else if (arg.toArray) {
          return arg;
        } else {
          throw new Error("Argument is not a number");
        }
      }
      function parseSignature(sig) {
        var tmp = /^(\w+)\((.*)\)$/.exec(sig);
        if (tmp.length !== 3) {
          throw new Error("Invalid method signature");
        }
        var args = /^(.+)\):\((.+)$/.exec(tmp[2]);
        if (args !== null && args.length === 3) {
          return {
            method: tmp[1],
            args: args[1].split(","),
            retargs: args[2].split(",")
          };
        } else {
          var params = tmp[2].split(",");
          if (params.length === 1 && params[0] === "") {
            params = [];
          }
          return {
            method: tmp[1],
            args: params
          };
        }
      }
      function encodeSingle(type3, arg) {
        var size, num, ret, i;
        if (type3 === "address") {
          return encodeSingle("uint160", parseNumber(arg));
        } else if (type3 === "bool") {
          return encodeSingle("uint8", arg ? 1 : 0);
        } else if (type3 === "string") {
          return encodeSingle("bytes", Buffer.from(arg, "utf8"));
        } else if (isArray(type3)) {
          if (typeof arg.length === "undefined") {
            throw new Error("Not an array?");
          }
          size = parseTypeArray(type3);
          if (size !== "dynamic" && size !== 0 && arg.length > size) {
            throw new Error("Elements exceed array size: " + size);
          }
          ret = [];
          type3 = type3.slice(0, type3.lastIndexOf("["));
          if (typeof arg === "string") {
            arg = JSON.parse(arg);
          }
          for (i in arg) {
            ret.push(encodeSingle(type3, arg[i]));
          }
          if (size === "dynamic") {
            var length = encodeSingle("uint256", arg.length);
            ret.unshift(length);
          }
          return Buffer.concat(ret);
        } else if (type3 === "bytes") {
          arg = Buffer.from(arg);
          ret = Buffer.concat([encodeSingle("uint256", arg.length), arg]);
          if (arg.length % 32 !== 0) {
            ret = Buffer.concat([ret, utils.zeros(32 - arg.length % 32)]);
          }
          return ret;
        } else if (type3.startsWith("bytes")) {
          size = parseTypeN(type3);
          if (size < 1 || size > 32) {
            throw new Error("Invalid bytes<N> width: " + size);
          }
          return utils.setLengthRight(arg, 32);
        } else if (type3.startsWith("uint")) {
          size = parseTypeN(type3);
          if (size % 8 || size < 8 || size > 256) {
            throw new Error("Invalid uint<N> width: " + size);
          }
          num = parseNumber(arg);
          if (num.bitLength() > size) {
            throw new Error(
              "Supplied uint exceeds width: " + size + " vs " + num.bitLength()
            );
          }
          if (num < 0) {
            throw new Error("Supplied uint is negative");
          }
          return num.toArrayLike(Buffer, "be", 32);
        } else if (type3.startsWith("int")) {
          size = parseTypeN(type3);
          if (size % 8 || size < 8 || size > 256) {
            throw new Error("Invalid int<N> width: " + size);
          }
          num = parseNumber(arg);
          if (num.bitLength() > size) {
            throw new Error(
              "Supplied int exceeds width: " + size + " vs " + num.bitLength()
            );
          }
          return num.toTwos(256).toArrayLike(Buffer, "be", 32);
        } else if (type3.startsWith("ufixed")) {
          size = parseTypeNxM(type3);
          num = parseNumber(arg);
          if (num < 0) {
            throw new Error("Supplied ufixed is negative");
          }
          return encodeSingle("uint256", num.mul(new BN(2).pow(new BN(size[1]))));
        } else if (type3.startsWith("fixed")) {
          size = parseTypeNxM(type3);
          return encodeSingle(
            "int256",
            parseNumber(arg).mul(new BN(2).pow(new BN(size[1])))
          );
        }
        throw new Error("Unsupported or invalid type: " + type3);
      }
      function decodeSingle(parsedType, data, offset) {
        if (typeof parsedType === "string") {
          parsedType = parseType(parsedType);
        }
        var size, num, ret, i;
        if (parsedType.name === "address") {
          return decodeSingle(parsedType.rawType, data, offset).toArrayLike(Buffer, "be", 20).toString("hex");
        } else if (parsedType.name === "bool") {
          return decodeSingle(parsedType.rawType, data, offset).toString() === new BN(1).toString();
        } else if (parsedType.name === "string") {
          var bytes = decodeSingle(parsedType.rawType, data, offset);
          return Buffer.from(bytes, "utf8").toString();
        } else if (parsedType.isArray) {
          ret = [];
          size = parsedType.size;
          if (parsedType.size === "dynamic") {
            offset = decodeSingle("uint256", data, offset).toNumber();
            size = decodeSingle("uint256", data, offset).toNumber();
            offset = offset + 32;
          }
          for (i = 0; i < size; i++) {
            var decoded = decodeSingle(parsedType.subArray, data, offset);
            ret.push(decoded);
            offset += parsedType.subArray.memoryUsage;
          }
          return ret;
        } else if (parsedType.name === "bytes") {
          offset = decodeSingle("uint256", data, offset).toNumber();
          size = decodeSingle("uint256", data, offset).toNumber();
          return data.slice(offset + 32, offset + 32 + size);
        } else if (parsedType.name.startsWith("bytes")) {
          return data.slice(offset, offset + parsedType.size);
        } else if (parsedType.name.startsWith("uint")) {
          num = new BN(data.slice(offset, offset + 32), 16, "be");
          if (num.bitLength() > parsedType.size) {
            throw new Error(
              "Decoded int exceeds width: " + parsedType.size + " vs " + num.bitLength()
            );
          }
          return num;
        } else if (parsedType.name.startsWith("int")) {
          num = new BN(data.slice(offset, offset + 32), 16, "be").fromTwos(256);
          if (num.bitLength() > parsedType.size) {
            throw new Error(
              "Decoded uint exceeds width: " + parsedType.size + " vs " + num.bitLength()
            );
          }
          return num;
        } else if (parsedType.name.startsWith("ufixed")) {
          size = new BN(2).pow(new BN(parsedType.size[1]));
          num = decodeSingle("uint256", data, offset);
          if (!num.mod(size).isZero()) {
            throw new Error("Decimals not supported yet");
          }
          return num.div(size);
        } else if (parsedType.name.startsWith("fixed")) {
          size = new BN(2).pow(new BN(parsedType.size[1]));
          num = decodeSingle("int256", data, offset);
          if (!num.mod(size).isZero()) {
            throw new Error("Decimals not supported yet");
          }
          return num.div(size);
        }
        throw new Error("Unsupported or invalid type: " + parsedType.name);
      }
      function parseType(type3) {
        var size;
        var ret;
        if (isArray(type3)) {
          size = parseTypeArray(type3);
          var subArray = type3.slice(0, type3.lastIndexOf("["));
          subArray = parseType(subArray);
          ret = {
            isArray: true,
            name: type3,
            size,
            memoryUsage: size === "dynamic" ? 32 : subArray.memoryUsage * size,
            subArray
          };
          return ret;
        } else {
          var rawType;
          switch (type3) {
            case "address":
              rawType = "uint160";
              break;
            case "bool":
              rawType = "uint8";
              break;
            case "string":
              rawType = "bytes";
              break;
          }
          ret = {
            rawType,
            name: type3,
            memoryUsage: 32
          };
          if (type3.startsWith("bytes") && type3 !== "bytes" || type3.startsWith("uint") || type3.startsWith("int")) {
            ret.size = parseTypeN(type3);
          } else if (type3.startsWith("ufixed") || type3.startsWith("fixed")) {
            ret.size = parseTypeNxM(type3);
          }
          if (type3.startsWith("bytes") && type3 !== "bytes" && (ret.size < 1 || ret.size > 32)) {
            throw new Error("Invalid bytes<N> width: " + ret.size);
          }
          if ((type3.startsWith("uint") || type3.startsWith("int")) && (ret.size % 8 || ret.size < 8 || ret.size > 256)) {
            throw new Error("Invalid int/uint<N> width: " + ret.size);
          }
          return ret;
        }
      }
      function isDynamic(type3) {
        return type3 === "string" || type3 === "bytes" || parseTypeArray(type3) === "dynamic";
      }
      function isArray(type3) {
        return type3.lastIndexOf("]") === type3.length - 1;
      }
      ABI.rawEncode = function(types, values) {
        var output = [];
        var data = [];
        var headLength = 0;
        types.forEach(function(type4) {
          if (isArray(type4)) {
            var size = parseTypeArray(type4);
            if (size !== "dynamic") {
              headLength += 32 * size;
            } else {
              headLength += 32;
            }
          } else {
            headLength += 32;
          }
        });
        for (var i = 0; i < types.length; i++) {
          var type3 = elementaryName(types[i]);
          var value = values[i];
          var cur = encodeSingle(type3, value);
          if (isDynamic(type3)) {
            output.push(encodeSingle("uint256", headLength));
            data.push(cur);
            headLength += cur.length;
          } else {
            output.push(cur);
          }
        }
        return Buffer.concat(output.concat(data));
      };
      ABI.rawDecode = function(types, data) {
        var ret = [];
        data = Buffer.from(data);
        var offset = 0;
        for (var i = 0; i < types.length; i++) {
          var type3 = elementaryName(types[i]);
          var parsed = parseType(type3, data, offset);
          var decoded = decodeSingle(parsed, data, offset);
          offset += parsed.memoryUsage;
          ret.push(decoded);
        }
        return ret;
      };
      ABI.simpleEncode = function(method) {
        var args = Array.prototype.slice.call(arguments).slice(1);
        var sig = parseSignature(method);
        if (args.length !== sig.args.length) {
          throw new Error("Argument count mismatch");
        }
        return Buffer.concat([
          ABI.methodID(sig.method, sig.args),
          ABI.rawEncode(sig.args, args)
        ]);
      };
      ABI.simpleDecode = function(method, data) {
        var sig = parseSignature(method);
        if (!sig.retargs) {
          throw new Error("No return values in method");
        }
        return ABI.rawDecode(sig.retargs, data);
      };
      function stringify(type3, value) {
        if (type3.startsWith("address") || type3.startsWith("bytes")) {
          return "0x" + value.toString("hex");
        } else {
          return value.toString();
        }
      }
      ABI.stringify = function(types, values) {
        var ret = [];
        for (var i in types) {
          var type3 = types[i];
          var value = values[i];
          if (/^[^\[]+\[.*\]$/.test(type3)) {
            value = value.map(function(item) {
              return stringify(type3, item);
            }).join(", ");
          } else {
            value = stringify(type3, value);
          }
          ret.push(value);
        }
        return ret;
      };
      ABI.solidityHexValue = function(type3, value, bitsize) {
        var size, num;
        if (isArray(type3)) {
          var subType = type3.replace(/\[.*?\]/, "");
          if (!isArray(subType)) {
            var arraySize = parseTypeArray(type3);
            if (arraySize !== "dynamic" && arraySize !== 0 && value.length > arraySize) {
              throw new Error("Elements exceed array size: " + arraySize);
            }
          }
          var arrayValues = value.map(function(v) {
            return ABI.solidityHexValue(subType, v, 256);
          });
          return Buffer.concat(arrayValues);
        } else if (type3 === "bytes") {
          return value;
        } else if (type3 === "string") {
          return Buffer.from(value, "utf8");
        } else if (type3 === "bool") {
          bitsize = bitsize || 8;
          var padding = Array(bitsize / 4).join("0");
          return Buffer.from(value ? padding + "1" : padding + "0", "hex");
        } else if (type3 === "address") {
          var bytesize = 20;
          if (bitsize) {
            bytesize = bitsize / 8;
          }
          return utils.setLengthLeft(value, bytesize);
        } else if (type3.startsWith("bytes")) {
          size = parseTypeN(type3);
          if (size < 1 || size > 32) {
            throw new Error("Invalid bytes<N> width: " + size);
          }
          return utils.setLengthRight(value, size);
        } else if (type3.startsWith("uint")) {
          size = parseTypeN(type3);
          if (size % 8 || size < 8 || size > 256) {
            throw new Error("Invalid uint<N> width: " + size);
          }
          num = parseNumber(value);
          if (num.bitLength() > size) {
            throw new Error(
              "Supplied uint exceeds width: " + size + " vs " + num.bitLength()
            );
          }
          bitsize = bitsize || size;
          return num.toArrayLike(Buffer, "be", bitsize / 8);
        } else if (type3.startsWith("int")) {
          size = parseTypeN(type3);
          if (size % 8 || size < 8 || size > 256) {
            throw new Error("Invalid int<N> width: " + size);
          }
          num = parseNumber(value);
          if (num.bitLength() > size) {
            throw new Error(
              "Supplied int exceeds width: " + size + " vs " + num.bitLength()
            );
          }
          bitsize = bitsize || size;
          return num.toTwos(size).toArrayLike(Buffer, "be", bitsize / 8);
        } else {
          throw new Error("Unsupported or invalid type: " + type3);
        }
      };
      ABI.solidityPack = function(types, values) {
        if (types.length !== values.length) {
          throw new Error("Number of types are not matching the values");
        }
        var ret = [];
        for (var i = 0; i < types.length; i++) {
          var type3 = elementaryName(types[i]);
          var value = values[i];
          ret.push(ABI.solidityHexValue(type3, value, null));
        }
        return Buffer.concat(ret);
      };
      ABI.soliditySHA3 = function(types, values) {
        return utils.keccak256(ABI.solidityPack(types, values));
      };
      function isNumeric(c) {
        return c >= "0" && c <= "9";
      }
      ABI.fromSerpent = function(sig) {
        var ret = [];
        for (var i = 0; i < sig.length; i++) {
          var type3 = sig[i];
          if (type3 === "s") {
            ret.push("bytes");
          } else if (type3 === "b") {
            var tmp = "bytes";
            var j = i + 1;
            while (j < sig.length && isNumeric(sig[j])) {
              tmp += sig[j] - "0";
              j++;
            }
            i = j - 1;
            ret.push(tmp);
          } else if (type3 === "i") {
            ret.push("int256");
          } else if (type3 === "a") {
            ret.push("int256[]");
          } else {
            throw new Error("Unsupported or invalid type: " + type3);
          }
        }
        return ret;
      };
      ABI.toSerpent = function(types) {
        var ret = [];
        for (var i = 0; i < types.length; i++) {
          var type3 = types[i];
          if (type3 === "bytes") {
            ret.push("s");
          } else if (type3.startsWith("bytes")) {
            ret.push("b" + parseTypeN(type3));
          } else if (type3 === "int256") {
            ret.push("i");
          } else if (type3 === "int256[]") {
            ret.push("a");
          } else {
            throw new Error("Unsupported or invalid type: " + type3);
          }
        }
        return ret.join("");
      };
      module.exports = ABI;
    }
  });

  // src/ethereum/lib/eth-sig-util/index.js
  var require_eth_sig_util = __commonJS({
    "src/ethereum/lib/eth-sig-util/index.js"(exports, module) {
      var ethereumjs_util_1 = require_ethereumjs_util();
      var ethereumjs_abi_1 = require_ethereumjs_abi();
      var { isHexString } = require_ethjs_util();
      var SignTypedDataVersion = {};
      SignTypedDataVersion["V1"] = "V1";
      SignTypedDataVersion["V3"] = "V3";
      SignTypedDataVersion["V4"] = "V4";
      function encodeField(types, name, type3, value, version) {
        if (types[type3] !== void 0) {
          return [
            "bytes32",
            version === SignTypedDataVersion.V4 && value == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : ethereumjs_util_1.keccak(encodeData(type3, value, types, version))
          ];
        }
        if (value === void 0) {
          throw new Error(`missing value for field ${name} of type ${type3}`);
        }
        if (type3 === "bytes") {
          return ["bytes32", ethereumjs_util_1.keccak(value)];
        }
        if (type3 === "string") {
          if (typeof value === "string") {
            value = Buffer.from(value, "utf8");
          }
          return ["bytes32", ethereumjs_util_1.keccak(value)];
        }
        if (type3.lastIndexOf("]") === type3.length - 1) {
          if (version === SignTypedDataVersion.V3) {
            throw new Error(
              "Arrays are unimplemented in encodeData; use V4 extension"
            );
          }
          const parsedType = type3.slice(0, type3.lastIndexOf("["));
          const typeValuePairs = value.map(
            (item) => encodeField(types, name, parsedType, item, version)
          );
          return [
            "bytes32",
            ethereumjs_util_1.keccak(
              ethereumjs_abi_1.rawEncode(
                typeValuePairs.map(([t]) => t),
                typeValuePairs.map(([, v]) => v)
              )
            )
          ];
        }
        return [type3, value];
      }
      function findTypeDependencies(primaryType, types, results = /* @__PURE__ */ new Set()) {
        ;
        [primaryType] = primaryType.match(/^\w*/u);
        if (results.has(primaryType) || types[primaryType] === void 0) {
          return results;
        }
        results.add(primaryType);
        for (const field of types[primaryType]) {
          findTypeDependencies(field.type, types, results);
        }
        return results;
      }
      function encodeType(primaryType, types) {
        let result = "";
        const unsortedDeps = findTypeDependencies(primaryType, types);
        unsortedDeps.delete(primaryType);
        const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
        for (const type3 of deps) {
          const children = types[type3];
          if (!children) {
            throw new Error(`No type definition specified: ${type3}`);
          }
          result += `${type3}(${types[type3].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
        }
        return result;
      }
      function hashType(primaryType, types) {
        return ethereumjs_util_1.keccak(encodeType(primaryType, types));
      }
      function encodeData(primaryType, data, types, version) {
        const encodedTypes = ["bytes32"];
        const encodedValues = [hashType(primaryType, types)];
        for (const field of types[primaryType]) {
          if (version === SignTypedDataVersion.V3 && data[field.name] === void 0) {
            continue;
          }
          const [type3, value] = encodeField(
            types,
            field.name,
            field.type,
            data[field.name],
            version
          );
          encodedTypes.push(type3);
          encodedValues.push(value);
        }
        return ethereumjs_abi_1.rawEncode(encodedTypes, encodedValues);
      }
      function hashStruct(primaryType, data, types, version) {
        return ethereumjs_util_1.keccak(encodeData(primaryType, data, types, version));
      }
      function isNullish(value) {
        return value === null || value === void 0;
      }
      var TYPED_MESSAGE_SCHEMA = {
        type: "object",
        properties: {
          types: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" }
                },
                required: ["name", "type"]
              }
            }
          },
          primaryType: { type: "string" },
          domain: { type: "object" },
          message: { type: "object" }
        },
        required: ["types", "primaryType", "domain", "message"]
      };
      function sanitizeData(data) {
        const sanitizedData = {};
        for (const key in TYPED_MESSAGE_SCHEMA.properties) {
          if (data[key]) {
            sanitizedData[key] = data[key];
          }
        }
        if ("types" in sanitizedData) {
          sanitizedData.types = Object.assign(
            { EIP712Domain: [] },
            sanitizedData.types
          );
        }
        return sanitizedData;
      }
      function eip712Hash(typedData, version) {
        const sanitizedData = sanitizeData(typedData);
        const parts = [Buffer.from("1901", "hex")];
        parts.push(
          hashStruct(
            "EIP712Domain",
            sanitizedData.domain,
            sanitizedData.types,
            version
          )
        );
        if (sanitizedData.primaryType !== "EIP712Domain") {
          parts.push(
            hashStruct(
              sanitizedData.primaryType,
              sanitizedData.message,
              sanitizedData.types,
              version
            )
          );
        }
        return ethereumjs_util_1.keccak(Buffer.concat(parts));
      }
      function recoverPublicKey(messageHash, signature) {
        const sigParams = ethereumjs_util_1.fromRpcSig(signature);
        return ethereumjs_util_1.ecrecover(
          messageHash,
          sigParams.v,
          sigParams.r,
          sigParams.s
        );
      }
      function recoverTypedSignature2({ data, signature, version }) {
        if (isNullish(data)) {
          throw new Error("Missing data parameter");
        } else if (isNullish(signature)) {
          throw new Error("Missing signature parameter");
        }
        const messageHash = eip712Hash(data, "V4");
        const publicKey = recoverPublicKey(messageHash, signature);
        const sender = ethereumjs_util_1.publicToAddress(publicKey);
        return ethereumjs_util_1.bufferToHex(sender);
      }
      function legacyToBuffer(value) {
        return typeof value === "string" && !isHexString(value) ? Buffer.from(value) : ethereumjs_util_1.toBuffer(value);
      }
      function getPublicKeyFor(message, signature) {
        const messageHash = ethereumjs_util_1.hashPersonalMessage(
          legacyToBuffer(message)
        );
        return recoverPublicKey(messageHash, signature);
      }
      function recoverPersonalSignature2({ data, signature }) {
        if (isNullish(data)) {
          throw new Error("Missing data parameter");
        } else if (isNullish(signature)) {
          throw new Error("Missing signature parameter");
        }
        const publicKey = getPublicKeyFor(data, signature);
        const sender = ethereumjs_util_1.publicToAddress(publicKey);
        const senderHex = ethereumjs_util_1.bufferToHex(sender);
        return senderHex;
      }
      module.exports = {
        recoverTypedSignature: recoverTypedSignature2,
        recoverPersonalSignature: recoverPersonalSignature2
      };
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
  var require_buffer2 = __commonJS({
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

  // src/ethereum/actions/read/verify712.js
  var { recoverTypedSignature } = require_eth_sig_util();
  var verify712_default = async (state, action) => {
    const { data, signature } = action.input;
    const signer = recoverTypedSignature({
      version: "V4",
      data,
      signature
    });
    return { result: { signer } };
  };

  // src/ethereum/actions/read/verify.js
  var { recoverPersonalSignature } = require_eth_sig_util();
  var verify_default = async (state, action) => {
    const { data, signature } = action.input;
    const signer = recoverPersonalSignature({
      data: JSON.stringify(data),
      signature
    });
    return { result: { signer } };
  };

  // src/common/lib/validate.js
  var import_buffer = __toESM(require_buffer2());
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

  // src/ethereum/eth.js
  async function handle(state, action) {
    switch (action.input.function) {
      case "verify":
        return await verify_default(state, action);
      case "verify712":
        return await verify712_default(state, action);
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

