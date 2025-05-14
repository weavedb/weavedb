
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
        const self = (base || "").split("#")[0];
        if (self)
          schemas.set(self, root);
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

  // src/poseidon/poseidonConstants.js
  async function handle(state, action) {
    switch (action.input.function) {
      case "get":
        return { result: state.poseidonConstants };
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

