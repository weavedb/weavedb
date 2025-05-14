
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

  // sdk/contracts/weavedb/actions/read/ids.js
  var require_ids = __commonJS({
    "sdk/contracts/weavedb/actions/read/ids.js"(exports, module) {
      var ids = async (state, action) => {
        const { ids: ids2 } = state;
        const { tx } = action.input;
        return { result: ids2[tx] || null };
      };
      module.exports = { ids };
    }
  });

  // sdk/contracts/node_modules/ramda/src/F.js
  var require_F = __commonJS({
    "sdk/contracts/node_modules/ramda/src/F.js"(exports, module) {
      var F = function() {
        return false;
      };
      module.exports = F;
    }
  });

  // sdk/contracts/node_modules/ramda/src/T.js
  var require_T = __commonJS({
    "sdk/contracts/node_modules/ramda/src/T.js"(exports, module) {
      var T = function() {
        return true;
      };
      module.exports = T;
    }
  });

  // sdk/contracts/node_modules/ramda/src/__.js
  var require__ = __commonJS({
    "sdk/contracts/node_modules/ramda/src/__.js"(exports, module) {
      module.exports = {
        "@@functional/placeholder": true
      };
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isPlaceholder.js
  var require_isPlaceholder = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isPlaceholder.js"(exports, module) {
      function _isPlaceholder(a) {
        return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
      }
      module.exports = _isPlaceholder;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_curry1.js
  var require_curry1 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_curry1.js"(exports, module) {
      var _isPlaceholder = require_isPlaceholder();
      function _curry1(fn) {
        return function f1(a) {
          if (arguments.length === 0 || _isPlaceholder(a)) {
            return f1;
          } else {
            return fn.apply(this, arguments);
          }
        };
      }
      module.exports = _curry1;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_curry2.js
  var require_curry2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_curry2.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isPlaceholder = require_isPlaceholder();
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
      module.exports = _curry2;
    }
  });

  // sdk/contracts/node_modules/ramda/src/add.js
  var require_add = __commonJS({
    "sdk/contracts/node_modules/ramda/src/add.js"(exports, module) {
      var _curry2 = require_curry2();
      var add = /* @__PURE__ */ _curry2(function add2(a, b) {
        return Number(a) + Number(b);
      });
      module.exports = add;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_concat.js
  var require_concat = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_concat.js"(exports, module) {
      function _concat(set1, set2) {
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
      module.exports = _concat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_arity.js
  var require_arity = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_arity.js"(exports, module) {
      function _arity(n, fn) {
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
      module.exports = _arity;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_curryN.js
  var require_curryN = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_curryN.js"(exports, module) {
      var _arity = require_arity();
      var _isPlaceholder = require_isPlaceholder();
      function _curryN(length, received, fn) {
        return function() {
          var combined = [];
          var argsIdx = 0;
          var left = length;
          var combinedIdx = 0;
          while (combinedIdx < received.length || argsIdx < arguments.length) {
            var result;
            if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
              result = received[combinedIdx];
            } else {
              result = arguments[argsIdx];
              argsIdx += 1;
            }
            combined[combinedIdx] = result;
            if (!_isPlaceholder(result)) {
              left -= 1;
            }
            combinedIdx += 1;
          }
          return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
        };
      }
      module.exports = _curryN;
    }
  });

  // sdk/contracts/node_modules/ramda/src/curryN.js
  var require_curryN2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/curryN.js"(exports, module) {
      var _arity = require_arity();
      var _curry1 = require_curry1();
      var _curry2 = require_curry2();
      var _curryN = require_curryN();
      var curryN = /* @__PURE__ */ _curry2(function curryN2(length, fn) {
        if (length === 1) {
          return _curry1(fn);
        }
        return _arity(length, _curryN(length, [], fn));
      });
      module.exports = curryN;
    }
  });

  // sdk/contracts/node_modules/ramda/src/addIndex.js
  var require_addIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/addIndex.js"(exports, module) {
      var _concat = require_concat();
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var addIndex = /* @__PURE__ */ _curry1(function addIndex2(fn) {
        return curryN(fn.length, function() {
          var idx = 0;
          var origFn = arguments[0];
          var list = arguments[arguments.length - 1];
          var args = Array.prototype.slice.call(arguments, 0);
          args[0] = function() {
            var result = origFn.apply(this, _concat(arguments, [idx, list]));
            idx += 1;
            return result;
          };
          return fn.apply(this, args);
        });
      });
      module.exports = addIndex;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_curry3.js
  var require_curry3 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_curry3.js"(exports, module) {
      var _curry1 = require_curry1();
      var _curry2 = require_curry2();
      var _isPlaceholder = require_isPlaceholder();
      function _curry3(fn) {
        return function f3(a, b, c) {
          switch (arguments.length) {
            case 0:
              return f3;
            case 1:
              return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
                return fn(a, _b, _c);
              });
            case 2:
              return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
                return fn(_a, b, _c);
              }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
                return fn(a, _b, _c);
              }) : _curry1(function(_c) {
                return fn(a, b, _c);
              });
            default:
              return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
                return fn(_a, _b, c);
              }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
                return fn(_a, b, _c);
              }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
                return fn(a, _b, _c);
              }) : _isPlaceholder(a) ? _curry1(function(_a) {
                return fn(_a, b, c);
              }) : _isPlaceholder(b) ? _curry1(function(_b) {
                return fn(a, _b, c);
              }) : _isPlaceholder(c) ? _curry1(function(_c) {
                return fn(a, b, _c);
              }) : fn(a, b, c);
          }
        };
      }
      module.exports = _curry3;
    }
  });

  // sdk/contracts/node_modules/ramda/src/adjust.js
  var require_adjust = __commonJS({
    "sdk/contracts/node_modules/ramda/src/adjust.js"(exports, module) {
      var _concat = require_concat();
      var _curry3 = require_curry3();
      var adjust = /* @__PURE__ */ _curry3(function adjust2(idx, fn, list) {
        var len = list.length;
        if (idx >= len || idx < -len) {
          return list;
        }
        var _idx = (len + idx) % len;
        var _list = _concat(list);
        _list[_idx] = fn(list[_idx]);
        return _list;
      });
      module.exports = adjust;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isArray.js
  var require_isArray = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isArray.js"(exports, module) {
      module.exports = Array.isArray || function _isArray(val) {
        return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
      };
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isTransformer.js
  var require_isTransformer = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isTransformer.js"(exports, module) {
      function _isTransformer(obj) {
        return obj != null && typeof obj["@@transducer/step"] === "function";
      }
      module.exports = _isTransformer;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_dispatchable.js
  var require_dispatchable = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_dispatchable.js"(exports, module) {
      var _isArray = require_isArray();
      var _isTransformer = require_isTransformer();
      function _dispatchable(methodNames, transducerCreator, fn) {
        return function() {
          if (arguments.length === 0) {
            return fn();
          }
          var obj = arguments[arguments.length - 1];
          if (!_isArray(obj)) {
            var idx = 0;
            while (idx < methodNames.length) {
              if (typeof obj[methodNames[idx]] === "function") {
                return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
              }
              idx += 1;
            }
            if (_isTransformer(obj)) {
              var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
              return transducer(obj);
            }
          }
          return fn.apply(this, arguments);
        };
      }
      module.exports = _dispatchable;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_reduced.js
  var require_reduced = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_reduced.js"(exports, module) {
      function _reduced(x) {
        return x && x["@@transducer/reduced"] ? x : {
          "@@transducer/value": x,
          "@@transducer/reduced": true
        };
      }
      module.exports = _reduced;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xfBase.js
  var require_xfBase = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfBase.js"(exports, module) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xall.js
  var require_xall = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xall.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
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
            result = _reduced(this.xf["@@transducer/step"](result, false));
          }
          return result;
        };
        return XAll2;
      }();
      var _xall = /* @__PURE__ */ _curry2(function _xall2(f, xf) {
        return new XAll(f, xf);
      });
      module.exports = _xall;
    }
  });

  // sdk/contracts/node_modules/ramda/src/all.js
  var require_all = __commonJS({
    "sdk/contracts/node_modules/ramda/src/all.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xall = require_xall();
      var all = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["all"], _xall, function all2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/max.js
  var require_max = __commonJS({
    "sdk/contracts/node_modules/ramda/src/max.js"(exports, module) {
      var _curry2 = require_curry2();
      var max = /* @__PURE__ */ _curry2(function max2(a, b) {
        return b > a ? b : a;
      });
      module.exports = max;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_map.js
  var require_map = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_map.js"(exports, module) {
      function _map(fn, functor) {
        var idx = 0;
        var len = functor.length;
        var result = Array(len);
        while (idx < len) {
          result[idx] = fn(functor[idx]);
          idx += 1;
        }
        return result;
      }
      module.exports = _map;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isString.js
  var require_isString = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isString.js"(exports, module) {
      function _isString(x) {
        return Object.prototype.toString.call(x) === "[object String]";
      }
      module.exports = _isString;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isArrayLike.js
  var require_isArrayLike = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isArrayLike.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isArray = require_isArray();
      var _isString = require_isString();
      var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
        if (_isArray(x)) {
          return true;
        }
        if (!x) {
          return false;
        }
        if (typeof x !== "object") {
          return false;
        }
        if (_isString(x)) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xwrap.js
  var require_xwrap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xwrap.js"(exports, module) {
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
      function _xwrap(fn) {
        return new XWrap(fn);
      }
      module.exports = _xwrap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/bind.js
  var require_bind = __commonJS({
    "sdk/contracts/node_modules/ramda/src/bind.js"(exports, module) {
      var _arity = require_arity();
      var _curry2 = require_curry2();
      var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
        return _arity(fn.length, function() {
          return fn.apply(thisObj, arguments);
        });
      });
      module.exports = bind;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_reduce.js
  var require_reduce = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_reduce.js"(exports, module) {
      var _isArrayLike = require_isArrayLike();
      var _xwrap = require_xwrap();
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
      function _reduce(fn, acc, list) {
        if (typeof fn === "function") {
          fn = _xwrap(fn);
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
      module.exports = _reduce;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xmap.js
  var require_xmap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xmap.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xmap = /* @__PURE__ */ _curry2(function _xmap2(f, xf) {
        return new XMap(f, xf);
      });
      module.exports = _xmap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_has.js
  var require_has = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_has.js"(exports, module) {
      function _has(prop, obj) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      module.exports = _has;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isArguments.js
  var require_isArguments = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isArguments.js"(exports, module) {
      var _has = require_has();
      var toString = Object.prototype.toString;
      var _isArguments = /* @__PURE__ */ function() {
        return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
          return toString.call(x) === "[object Arguments]";
        } : function _isArguments2(x) {
          return _has("callee", x);
        };
      }();
      module.exports = _isArguments;
    }
  });

  // sdk/contracts/node_modules/ramda/src/keys.js
  var require_keys = __commonJS({
    "sdk/contracts/node_modules/ramda/src/keys.js"(exports, module) {
      var _curry1 = require_curry1();
      var _has = require_has();
      var _isArguments = require_isArguments();
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
      }) : /* @__PURE__ */ _curry1(function keys2(obj) {
        if (Object(obj) !== obj) {
          return [];
        }
        var prop, nIdx;
        var ks = [];
        var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
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
      module.exports = keys;
    }
  });

  // sdk/contracts/node_modules/ramda/src/map.js
  var require_map2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/map.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _map = require_map();
      var _reduce = require_reduce();
      var _xmap = require_xmap();
      var curryN = require_curryN2();
      var keys = require_keys();
      var map = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], _xmap, function map2(fn, functor) {
          switch (Object.prototype.toString.call(functor)) {
            case "[object Function]":
              return curryN(functor.length, function() {
                return fn.call(this, functor.apply(this, arguments));
              });
            case "[object Object]":
              return _reduce(function(acc, key) {
                acc[key] = fn(functor[key]);
                return acc;
              }, {}, keys(functor));
            default:
              return _map(fn, functor);
          }
        })
      );
      module.exports = map;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isInteger.js
  var require_isInteger = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isInteger.js"(exports, module) {
      module.exports = Number.isInteger || function _isInteger(n) {
        return n << 0 === n;
      };
    }
  });

  // sdk/contracts/node_modules/ramda/src/nth.js
  var require_nth = __commonJS({
    "sdk/contracts/node_modules/ramda/src/nth.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isString = require_isString();
      var nth = /* @__PURE__ */ _curry2(function nth2(offset, list) {
        var idx = offset < 0 ? list.length + offset : offset;
        return _isString(list) ? list.charAt(idx) : list[idx];
      });
      module.exports = nth;
    }
  });

  // sdk/contracts/node_modules/ramda/src/prop.js
  var require_prop = __commonJS({
    "sdk/contracts/node_modules/ramda/src/prop.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isInteger = require_isInteger();
      var nth = require_nth();
      var prop = /* @__PURE__ */ _curry2(function prop2(p, obj) {
        if (obj == null) {
          return;
        }
        return _isInteger(p) ? nth(p, obj) : obj[p];
      });
      module.exports = prop;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pluck.js
  var require_pluck = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pluck.js"(exports, module) {
      var _curry2 = require_curry2();
      var map = require_map2();
      var prop = require_prop();
      var pluck = /* @__PURE__ */ _curry2(function pluck2(p, list) {
        return map(prop(p), list);
      });
      module.exports = pluck;
    }
  });

  // sdk/contracts/node_modules/ramda/src/reduce.js
  var require_reduce2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reduce.js"(exports, module) {
      var _curry3 = require_curry3();
      var _reduce = require_reduce();
      var reduce = /* @__PURE__ */ _curry3(_reduce);
      module.exports = reduce;
    }
  });

  // sdk/contracts/node_modules/ramda/src/allPass.js
  var require_allPass = __commonJS({
    "sdk/contracts/node_modules/ramda/src/allPass.js"(exports, module) {
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var allPass = /* @__PURE__ */ _curry1(function allPass2(preds) {
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

  // sdk/contracts/node_modules/ramda/src/always.js
  var require_always = __commonJS({
    "sdk/contracts/node_modules/ramda/src/always.js"(exports, module) {
      var _curry1 = require_curry1();
      var always = /* @__PURE__ */ _curry1(function always2(val) {
        return function() {
          return val;
        };
      });
      module.exports = always;
    }
  });

  // sdk/contracts/node_modules/ramda/src/and.js
  var require_and = __commonJS({
    "sdk/contracts/node_modules/ramda/src/and.js"(exports, module) {
      var _curry2 = require_curry2();
      var and = /* @__PURE__ */ _curry2(function and2(a, b) {
        return a && b;
      });
      module.exports = and;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xany.js
  var require_xany = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xany.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
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
            result = _reduced(this.xf["@@transducer/step"](result, true));
          }
          return result;
        };
        return XAny2;
      }();
      var _xany = /* @__PURE__ */ _curry2(function _xany2(f, xf) {
        return new XAny(f, xf);
      });
      module.exports = _xany;
    }
  });

  // sdk/contracts/node_modules/ramda/src/any.js
  var require_any = __commonJS({
    "sdk/contracts/node_modules/ramda/src/any.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xany = require_xany();
      var any = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["any"], _xany, function any2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/anyPass.js
  var require_anyPass = __commonJS({
    "sdk/contracts/node_modules/ramda/src/anyPass.js"(exports, module) {
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var anyPass = /* @__PURE__ */ _curry1(function anyPass2(preds) {
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

  // sdk/contracts/node_modules/ramda/src/ap.js
  var require_ap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/ap.js"(exports, module) {
      var _concat = require_concat();
      var _curry2 = require_curry2();
      var _reduce = require_reduce();
      var map = require_map2();
      var ap = /* @__PURE__ */ _curry2(function ap2(applyF, applyX) {
        return typeof applyX["fantasy-land/ap"] === "function" ? applyX["fantasy-land/ap"](applyF) : typeof applyF.ap === "function" ? applyF.ap(applyX) : typeof applyF === "function" ? function(x) {
          return applyF(x)(applyX(x));
        } : _reduce(function(acc, f) {
          return _concat(acc, map(f, applyX));
        }, [], applyF);
      });
      module.exports = ap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_aperture.js
  var require_aperture = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_aperture.js"(exports, module) {
      function _aperture(n, list) {
        var idx = 0;
        var limit = list.length - (n - 1);
        var acc = new Array(limit >= 0 ? limit : 0);
        while (idx < limit) {
          acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
          idx += 1;
        }
        return acc;
      }
      module.exports = _aperture;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xaperture.js
  var require_xaperture = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xaperture.js"(exports, module) {
      var _concat = require_concat();
      var _curry2 = require_curry2();
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
          return _concat(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
        };
        return XAperture2;
      }();
      var _xaperture = /* @__PURE__ */ _curry2(function _xaperture2(n, xf) {
        return new XAperture(n, xf);
      });
      module.exports = _xaperture;
    }
  });

  // sdk/contracts/node_modules/ramda/src/aperture.js
  var require_aperture2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/aperture.js"(exports, module) {
      var _aperture = require_aperture();
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xaperture = require_xaperture();
      var aperture = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xaperture, _aperture)
      );
      module.exports = aperture;
    }
  });

  // sdk/contracts/node_modules/ramda/src/append.js
  var require_append = __commonJS({
    "sdk/contracts/node_modules/ramda/src/append.js"(exports, module) {
      var _concat = require_concat();
      var _curry2 = require_curry2();
      var append = /* @__PURE__ */ _curry2(function append2(el, list) {
        return _concat(list, [el]);
      });
      module.exports = append;
    }
  });

  // sdk/contracts/node_modules/ramda/src/apply.js
  var require_apply = __commonJS({
    "sdk/contracts/node_modules/ramda/src/apply.js"(exports, module) {
      var _curry2 = require_curry2();
      var apply = /* @__PURE__ */ _curry2(function apply2(fn, args) {
        return fn.apply(this, args);
      });
      module.exports = apply;
    }
  });

  // sdk/contracts/node_modules/ramda/src/values.js
  var require_values = __commonJS({
    "sdk/contracts/node_modules/ramda/src/values.js"(exports, module) {
      var _curry1 = require_curry1();
      var keys = require_keys();
      var values = /* @__PURE__ */ _curry1(function values2(obj) {
        var props = keys(obj);
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

  // sdk/contracts/node_modules/ramda/src/applySpec.js
  var require_applySpec = __commonJS({
    "sdk/contracts/node_modules/ramda/src/applySpec.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isArray = require_isArray();
      var apply = require_apply();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var keys = require_keys();
      var values = require_values();
      function mapValues(fn, obj) {
        return _isArray(obj) ? obj.map(fn) : keys(obj).reduce(function(acc, key) {
          acc[key] = fn(obj[key]);
          return acc;
        }, {});
      }
      var applySpec = /* @__PURE__ */ _curry1(function applySpec2(spec) {
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

  // sdk/contracts/node_modules/ramda/src/applyTo.js
  var require_applyTo = __commonJS({
    "sdk/contracts/node_modules/ramda/src/applyTo.js"(exports, module) {
      var _curry2 = require_curry2();
      var applyTo = /* @__PURE__ */ _curry2(function applyTo2(x, f) {
        return f(x);
      });
      module.exports = applyTo;
    }
  });

  // sdk/contracts/node_modules/ramda/src/ascend.js
  var require_ascend = __commonJS({
    "sdk/contracts/node_modules/ramda/src/ascend.js"(exports, module) {
      var _curry3 = require_curry3();
      var ascend = /* @__PURE__ */ _curry3(function ascend2(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
      });
      module.exports = ascend;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_assoc.js
  var require_assoc = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_assoc.js"(exports, module) {
      var _isArray = require_isArray();
      var _isInteger = require_isInteger();
      function _assoc(prop, val, obj) {
        if (_isInteger(prop) && _isArray(obj)) {
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
      module.exports = _assoc;
    }
  });

  // sdk/contracts/node_modules/ramda/src/isNil.js
  var require_isNil = __commonJS({
    "sdk/contracts/node_modules/ramda/src/isNil.js"(exports, module) {
      var _curry1 = require_curry1();
      var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
        return x == null;
      });
      module.exports = isNil;
    }
  });

  // sdk/contracts/node_modules/ramda/src/assocPath.js
  var require_assocPath = __commonJS({
    "sdk/contracts/node_modules/ramda/src/assocPath.js"(exports, module) {
      var _curry3 = require_curry3();
      var _has = require_has();
      var _isInteger = require_isInteger();
      var _assoc = require_assoc();
      var isNil = require_isNil();
      var assocPath = /* @__PURE__ */ _curry3(function assocPath2(path, val, obj) {
        if (path.length === 0) {
          return val;
        }
        var idx = path[0];
        if (path.length > 1) {
          var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
          val = assocPath2(Array.prototype.slice.call(path, 1), val, nextObj);
        }
        return _assoc(idx, val, obj);
      });
      module.exports = assocPath;
    }
  });

  // sdk/contracts/node_modules/ramda/src/assoc.js
  var require_assoc2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/assoc.js"(exports, module) {
      var _curry3 = require_curry3();
      var assocPath = require_assocPath();
      var assoc = /* @__PURE__ */ _curry3(function assoc2(prop, val, obj) {
        return assocPath([prop], val, obj);
      });
      module.exports = assoc;
    }
  });

  // sdk/contracts/node_modules/ramda/src/nAry.js
  var require_nAry = __commonJS({
    "sdk/contracts/node_modules/ramda/src/nAry.js"(exports, module) {
      var _curry2 = require_curry2();
      var nAry = /* @__PURE__ */ _curry2(function nAry2(n, fn) {
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

  // sdk/contracts/node_modules/ramda/src/binary.js
  var require_binary = __commonJS({
    "sdk/contracts/node_modules/ramda/src/binary.js"(exports, module) {
      var _curry1 = require_curry1();
      var nAry = require_nAry();
      var binary = /* @__PURE__ */ _curry1(function binary2(fn) {
        return nAry(2, fn);
      });
      module.exports = binary;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isFunction.js
  var require_isFunction = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isFunction.js"(exports, module) {
      function _isFunction(x) {
        var type = Object.prototype.toString.call(x);
        return type === "[object Function]" || type === "[object AsyncFunction]" || type === "[object GeneratorFunction]" || type === "[object AsyncGeneratorFunction]";
      }
      module.exports = _isFunction;
    }
  });

  // sdk/contracts/node_modules/ramda/src/liftN.js
  var require_liftN = __commonJS({
    "sdk/contracts/node_modules/ramda/src/liftN.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduce = require_reduce();
      var ap = require_ap();
      var curryN = require_curryN2();
      var map = require_map2();
      var liftN = /* @__PURE__ */ _curry2(function liftN2(arity, fn) {
        var lifted = curryN(arity, fn);
        return curryN(arity, function() {
          return _reduce(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
        });
      });
      module.exports = liftN;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lift.js
  var require_lift = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lift.js"(exports, module) {
      var _curry1 = require_curry1();
      var liftN = require_liftN();
      var lift = /* @__PURE__ */ _curry1(function lift2(fn) {
        return liftN(fn.length, fn);
      });
      module.exports = lift;
    }
  });

  // sdk/contracts/node_modules/ramda/src/both.js
  var require_both = __commonJS({
    "sdk/contracts/node_modules/ramda/src/both.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isFunction = require_isFunction();
      var and = require_and();
      var lift = require_lift();
      var both = /* @__PURE__ */ _curry2(function both2(f, g) {
        return _isFunction(f) ? function _both() {
          return f.apply(this, arguments) && g.apply(this, arguments);
        } : lift(and)(f, g);
      });
      module.exports = both;
    }
  });

  // sdk/contracts/node_modules/ramda/src/call.js
  var require_call = __commonJS({
    "sdk/contracts/node_modules/ramda/src/call.js"(exports, module) {
      var _curry1 = require_curry1();
      var call = /* @__PURE__ */ _curry1(function call2(fn) {
        return fn.apply(this, Array.prototype.slice.call(arguments, 1));
      });
      module.exports = call;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_makeFlat.js
  var require_makeFlat = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_makeFlat.js"(exports, module) {
      var _isArrayLike = require_isArrayLike();
      function _makeFlat(recursive) {
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
      module.exports = _makeFlat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_forceReduced.js
  var require_forceReduced = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_forceReduced.js"(exports, module) {
      function _forceReduced(x) {
        return {
          "@@transducer/value": x,
          "@@transducer/reduced": true
        };
      }
      module.exports = _forceReduced;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_flatCat.js
  var require_flatCat = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_flatCat.js"(exports, module) {
      var _forceReduced = require_forceReduced();
      var _isArrayLike = require_isArrayLike();
      var _reduce = require_reduce();
      var _xfBase = require_xfBase();
      var preservingReduced = function(xf) {
        return {
          "@@transducer/init": _xfBase.init,
          "@@transducer/result": function(result) {
            return xf["@@transducer/result"](result);
          },
          "@@transducer/step": function(result, input) {
            var ret = xf["@@transducer/step"](result, input);
            return ret["@@transducer/reduced"] ? _forceReduced(ret) : ret;
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
            return !_isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
          }
        };
      };
      module.exports = _flatCat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xchain.js
  var require_xchain = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xchain.js"(exports, module) {
      var _curry2 = require_curry2();
      var _flatCat = require_flatCat();
      var map = require_map2();
      var _xchain = /* @__PURE__ */ _curry2(function _xchain2(f, xf) {
        return map(f, _flatCat(xf));
      });
      module.exports = _xchain;
    }
  });

  // sdk/contracts/node_modules/ramda/src/chain.js
  var require_chain = __commonJS({
    "sdk/contracts/node_modules/ramda/src/chain.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _makeFlat = require_makeFlat();
      var _xchain = require_xchain();
      var map = require_map2();
      var chain = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["fantasy-land/chain", "chain"], _xchain, function chain2(fn, monad) {
          if (typeof monad === "function") {
            return function(x) {
              return fn(monad(x))(x);
            };
          }
          return _makeFlat(false)(map(fn, monad));
        })
      );
      module.exports = chain;
    }
  });

  // sdk/contracts/node_modules/ramda/src/clamp.js
  var require_clamp = __commonJS({
    "sdk/contracts/node_modules/ramda/src/clamp.js"(exports, module) {
      var _curry3 = require_curry3();
      var clamp = /* @__PURE__ */ _curry3(function clamp2(min, max, value) {
        if (min > max) {
          throw new Error("min must not be greater than max in clamp(min, max, value)");
        }
        return value < min ? min : value > max ? max : value;
      });
      module.exports = clamp;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_cloneRegExp.js
  var require_cloneRegExp = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_cloneRegExp.js"(exports, module) {
      function _cloneRegExp(pattern) {
        return new RegExp(pattern.source, (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : ""));
      }
      module.exports = _cloneRegExp;
    }
  });

  // sdk/contracts/node_modules/ramda/src/type.js
  var require_type = __commonJS({
    "sdk/contracts/node_modules/ramda/src/type.js"(exports, module) {
      var _curry1 = require_curry1();
      var type = /* @__PURE__ */ _curry1(function type2(val) {
        return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
      });
      module.exports = type;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_clone.js
  var require_clone = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_clone.js"(exports, module) {
      var _cloneRegExp = require_cloneRegExp();
      var type = require_type();
      function _clone(value, refFrom, refTo, deep) {
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
              copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
            }
          }
          return copiedValue;
        };
        switch (type(value)) {
          case "Object":
            return copy(Object.create(Object.getPrototypeOf(value)));
          case "Array":
            return copy([]);
          case "Date":
            return new Date(value.valueOf());
          case "RegExp":
            return _cloneRegExp(value);
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
      module.exports = _clone;
    }
  });

  // sdk/contracts/node_modules/ramda/src/clone.js
  var require_clone2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/clone.js"(exports, module) {
      var _clone = require_clone();
      var _curry1 = require_curry1();
      var clone = /* @__PURE__ */ _curry1(function clone2(value) {
        return value != null && typeof value.clone === "function" ? value.clone() : _clone(value, [], [], true);
      });
      module.exports = clone;
    }
  });

  // sdk/contracts/node_modules/ramda/src/collectBy.js
  var require_collectBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/collectBy.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduce = require_reduce();
      var collectBy = /* @__PURE__ */ _curry2(function collectBy2(fn, list) {
        var group = _reduce(function(o, x) {
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

  // sdk/contracts/node_modules/ramda/src/comparator.js
  var require_comparator = __commonJS({
    "sdk/contracts/node_modules/ramda/src/comparator.js"(exports, module) {
      var _curry1 = require_curry1();
      var comparator = /* @__PURE__ */ _curry1(function comparator2(pred) {
        return function(a, b) {
          return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
        };
      });
      module.exports = comparator;
    }
  });

  // sdk/contracts/node_modules/ramda/src/not.js
  var require_not = __commonJS({
    "sdk/contracts/node_modules/ramda/src/not.js"(exports, module) {
      var _curry1 = require_curry1();
      var not = /* @__PURE__ */ _curry1(function not2(a) {
        return !a;
      });
      module.exports = not;
    }
  });

  // sdk/contracts/node_modules/ramda/src/complement.js
  var require_complement = __commonJS({
    "sdk/contracts/node_modules/ramda/src/complement.js"(exports, module) {
      var lift = require_lift();
      var not = require_not();
      var complement = /* @__PURE__ */ lift(not);
      module.exports = complement;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_pipe.js
  var require_pipe = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_pipe.js"(exports, module) {
      function _pipe(f, g) {
        return function() {
          return g.call(this, f.apply(this, arguments));
        };
      }
      module.exports = _pipe;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_checkForMethod.js
  var require_checkForMethod = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_checkForMethod.js"(exports, module) {
      var _isArray = require_isArray();
      function _checkForMethod(methodname, fn) {
        return function() {
          var length = arguments.length;
          if (length === 0) {
            return fn();
          }
          var obj = arguments[length - 1];
          return _isArray(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
        };
      }
      module.exports = _checkForMethod;
    }
  });

  // sdk/contracts/node_modules/ramda/src/slice.js
  var require_slice = __commonJS({
    "sdk/contracts/node_modules/ramda/src/slice.js"(exports, module) {
      var _checkForMethod = require_checkForMethod();
      var _curry3 = require_curry3();
      var slice = /* @__PURE__ */ _curry3(
        /* @__PURE__ */ _checkForMethod("slice", function slice2(fromIndex, toIndex, list) {
          return Array.prototype.slice.call(list, fromIndex, toIndex);
        })
      );
      module.exports = slice;
    }
  });

  // sdk/contracts/node_modules/ramda/src/tail.js
  var require_tail = __commonJS({
    "sdk/contracts/node_modules/ramda/src/tail.js"(exports, module) {
      var _checkForMethod = require_checkForMethod();
      var _curry1 = require_curry1();
      var slice = require_slice();
      var tail = /* @__PURE__ */ _curry1(
        /* @__PURE__ */ _checkForMethod(
          "tail",
          /* @__PURE__ */ slice(1, Infinity)
        )
      );
      module.exports = tail;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pipe.js
  var require_pipe2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pipe.js"(exports, module) {
      var _arity = require_arity();
      var _pipe = require_pipe();
      var reduce = require_reduce2();
      var tail = require_tail();
      function pipe() {
        if (arguments.length === 0) {
          throw new Error("pipe requires at least one argument");
        }
        return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
      }
      module.exports = pipe;
    }
  });

  // sdk/contracts/node_modules/ramda/src/reverse.js
  var require_reverse = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reverse.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isString = require_isString();
      var reverse = /* @__PURE__ */ _curry1(function reverse2(list) {
        return _isString(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
      });
      module.exports = reverse;
    }
  });

  // sdk/contracts/node_modules/ramda/src/compose.js
  var require_compose = __commonJS({
    "sdk/contracts/node_modules/ramda/src/compose.js"(exports, module) {
      var pipe = require_pipe2();
      var reverse = require_reverse();
      function compose() {
        if (arguments.length === 0) {
          throw new Error("compose requires at least one argument");
        }
        return pipe.apply(this, reverse(arguments));
      }
      module.exports = compose;
    }
  });

  // sdk/contracts/node_modules/ramda/src/head.js
  var require_head = __commonJS({
    "sdk/contracts/node_modules/ramda/src/head.js"(exports, module) {
      var nth = require_nth();
      var head = /* @__PURE__ */ nth(0);
      module.exports = head;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_identity.js
  var require_identity = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_identity.js"(exports, module) {
      function _identity(x) {
        return x;
      }
      module.exports = _identity;
    }
  });

  // sdk/contracts/node_modules/ramda/src/identity.js
  var require_identity2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/identity.js"(exports, module) {
      var _curry1 = require_curry1();
      var _identity = require_identity();
      var identity = /* @__PURE__ */ _curry1(_identity);
      module.exports = identity;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pipeWith.js
  var require_pipeWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pipeWith.js"(exports, module) {
      var _arity = require_arity();
      var _curry2 = require_curry2();
      var head = require_head();
      var _reduce = require_reduce();
      var tail = require_tail();
      var identity = require_identity2();
      var pipeWith = /* @__PURE__ */ _curry2(function pipeWith2(xf, list) {
        if (list.length <= 0) {
          return identity;
        }
        var headList = head(list);
        var tailList = tail(list);
        return _arity(headList.length, function() {
          return _reduce(function(result, f) {
            return xf.call(this, f, result);
          }, headList.apply(this, arguments), tailList);
        });
      });
      module.exports = pipeWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/composeWith.js
  var require_composeWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/composeWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var pipeWith = require_pipeWith();
      var reverse = require_reverse();
      var composeWith = /* @__PURE__ */ _curry2(function composeWith2(xf, list) {
        return pipeWith.apply(this, [xf, reverse(list)]);
      });
      module.exports = composeWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_arrayFromIterator.js
  var require_arrayFromIterator = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_arrayFromIterator.js"(exports, module) {
      function _arrayFromIterator(iter) {
        var list = [];
        var next;
        while (!(next = iter.next()).done) {
          list.push(next.value);
        }
        return list;
      }
      module.exports = _arrayFromIterator;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_includesWith.js
  var require_includesWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_includesWith.js"(exports, module) {
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
      module.exports = _includesWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_functionName.js
  var require_functionName = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_functionName.js"(exports, module) {
      function _functionName(f) {
        var match = String(f).match(/^function (\w*)/);
        return match == null ? "" : match[1];
      }
      module.exports = _functionName;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_objectIs.js
  var require_objectIs = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_objectIs.js"(exports, module) {
      function _objectIs(a, b) {
        if (a === b) {
          return a !== 0 || 1 / a === 1 / b;
        } else {
          return a !== a && b !== b;
        }
      }
      module.exports = typeof Object.is === "function" ? Object.is : _objectIs;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_equals.js
  var require_equals = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_equals.js"(exports, module) {
      var _arrayFromIterator = require_arrayFromIterator();
      var _includesWith = require_includesWith();
      var _functionName = require_functionName();
      var _has = require_has();
      var _objectIs = require_objectIs();
      var keys = require_keys();
      var type = require_type();
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
        if (_objectIs(a, b)) {
          return true;
        }
        var typeA = type(a);
        if (typeA !== type(b)) {
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
            if (!(typeof a === typeof b && _objectIs(a.valueOf(), b.valueOf()))) {
              return false;
            }
            break;
          case "Date":
            if (!_objectIs(a.valueOf(), b.valueOf())) {
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
        var keysA = keys(a);
        if (keysA.length !== keys(b).length) {
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
      module.exports = _equals;
    }
  });

  // sdk/contracts/node_modules/ramda/src/equals.js
  var require_equals2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/equals.js"(exports, module) {
      var _curry2 = require_curry2();
      var _equals = require_equals();
      var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
        return _equals(a, b, [], []);
      });
      module.exports = equals;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_indexOf.js
  var require_indexOf = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_indexOf.js"(exports, module) {
      var equals = require_equals2();
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
          if (equals(list[idx], a)) {
            return idx;
          }
          idx += 1;
        }
        return -1;
      }
      module.exports = _indexOf;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_includes.js
  var require_includes = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_includes.js"(exports, module) {
      var _indexOf = require_indexOf();
      function _includes(a, list) {
        return _indexOf(list, a, 0) >= 0;
      }
      module.exports = _includes;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_quote.js
  var require_quote = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_quote.js"(exports, module) {
      function _quote(s) {
        var escaped = s.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\f/g, "\\f").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\0/g, "\\0");
        return '"' + escaped.replace(/"/g, '\\"') + '"';
      }
      module.exports = _quote;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_toISOString.js
  var require_toISOString = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_toISOString.js"(exports, module) {
      var pad = function pad2(n) {
        return (n < 10 ? "0" : "") + n;
      };
      var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d) {
        return d.toISOString();
      } : function _toISOString2(d) {
        return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "." + (d.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
      };
      module.exports = _toISOString;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_complement.js
  var require_complement2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_complement.js"(exports, module) {
      function _complement(f) {
        return function() {
          return !f.apply(this, arguments);
        };
      }
      module.exports = _complement;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_filter.js
  var require_filter = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_filter.js"(exports, module) {
      function _filter(fn, list) {
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
      module.exports = _filter;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isObject.js
  var require_isObject = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isObject.js"(exports, module) {
      function _isObject(x) {
        return Object.prototype.toString.call(x) === "[object Object]";
      }
      module.exports = _isObject;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xfilter.js
  var require_xfilter = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfilter.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xfilter = /* @__PURE__ */ _curry2(function _xfilter2(f, xf) {
        return new XFilter(f, xf);
      });
      module.exports = _xfilter;
    }
  });

  // sdk/contracts/node_modules/ramda/src/filter.js
  var require_filter2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/filter.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _filter = require_filter();
      var _isObject = require_isObject();
      var _reduce = require_reduce();
      var _xfilter = require_xfilter();
      var keys = require_keys();
      var filter = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["fantasy-land/filter", "filter"], _xfilter, function(pred, filterable) {
          return _isObject(filterable) ? _reduce(function(acc, key) {
            if (pred(filterable[key])) {
              acc[key] = filterable[key];
            }
            return acc;
          }, {}, keys(filterable)) : _filter(pred, filterable);
        })
      );
      module.exports = filter;
    }
  });

  // sdk/contracts/node_modules/ramda/src/reject.js
  var require_reject = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reject.js"(exports, module) {
      var _complement = require_complement2();
      var _curry2 = require_curry2();
      var filter = require_filter2();
      var reject = /* @__PURE__ */ _curry2(function reject2(pred, filterable) {
        return filter(_complement(pred), filterable);
      });
      module.exports = reject;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_toString.js
  var require_toString = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_toString.js"(exports, module) {
      var _includes = require_includes();
      var _map = require_map();
      var _quote = require_quote();
      var _toISOString = require_toISOString();
      var keys = require_keys();
      var reject = require_reject();
      function _toString(x, seen) {
        var recur = function recur2(y) {
          var xs = seen.concat([x]);
          return _includes(y, xs) ? "<Circular>" : _toString(y, xs);
        };
        var mapPairs = function(obj, keys2) {
          return _map(function(k) {
            return _quote(k) + ": " + recur(obj[k]);
          }, keys2.slice().sort());
        };
        switch (Object.prototype.toString.call(x)) {
          case "[object Arguments]":
            return "(function() { return arguments; }(" + _map(recur, x).join(", ") + "))";
          case "[object Array]":
            return "[" + _map(recur, x).concat(mapPairs(x, reject(function(k) {
              return /^\d+$/.test(k);
            }, keys(x)))).join(", ") + "]";
          case "[object Boolean]":
            return typeof x === "object" ? "new Boolean(" + recur(x.valueOf()) + ")" : x.toString();
          case "[object Date]":
            return "new Date(" + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ")";
          case "[object Null]":
            return "null";
          case "[object Number]":
            return typeof x === "object" ? "new Number(" + recur(x.valueOf()) + ")" : 1 / x === -Infinity ? "-0" : x.toString(10);
          case "[object String]":
            return typeof x === "object" ? "new String(" + recur(x.valueOf()) + ")" : _quote(x);
          case "[object Undefined]":
            return "undefined";
          default:
            if (typeof x.toString === "function") {
              var repr = x.toString();
              if (repr !== "[object Object]") {
                return repr;
              }
            }
            return "{" + mapPairs(x, keys(x)).join(", ") + "}";
        }
      }
      module.exports = _toString;
    }
  });

  // sdk/contracts/node_modules/ramda/src/toString.js
  var require_toString2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/toString.js"(exports, module) {
      var _curry1 = require_curry1();
      var _toString = require_toString();
      var toString = /* @__PURE__ */ _curry1(function toString2(val) {
        return _toString(val, []);
      });
      module.exports = toString;
    }
  });

  // sdk/contracts/node_modules/ramda/src/concat.js
  var require_concat2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/concat.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isArray = require_isArray();
      var _isFunction = require_isFunction();
      var _isString = require_isString();
      var toString = require_toString2();
      var concat = /* @__PURE__ */ _curry2(function concat2(a, b) {
        if (_isArray(a)) {
          if (_isArray(b)) {
            return a.concat(b);
          }
          throw new TypeError(toString(b) + " is not an array");
        }
        if (_isString(a)) {
          if (_isString(b)) {
            return a + b;
          }
          throw new TypeError(toString(b) + " is not a string");
        }
        if (a != null && _isFunction(a["fantasy-land/concat"])) {
          return a["fantasy-land/concat"](b);
        }
        if (a != null && _isFunction(a.concat)) {
          return a.concat(b);
        }
        throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
      });
      module.exports = concat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/cond.js
  var require_cond = __commonJS({
    "sdk/contracts/node_modules/ramda/src/cond.js"(exports, module) {
      var _arity = require_arity();
      var _curry1 = require_curry1();
      var map = require_map2();
      var max = require_max();
      var reduce = require_reduce2();
      var cond = /* @__PURE__ */ _curry1(function cond2(pairs) {
        var arity = reduce(max, 0, map(function(pair) {
          return pair[0].length;
        }, pairs));
        return _arity(arity, function() {
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

  // sdk/contracts/node_modules/ramda/src/curry.js
  var require_curry = __commonJS({
    "sdk/contracts/node_modules/ramda/src/curry.js"(exports, module) {
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var curry = /* @__PURE__ */ _curry1(function curry2(fn) {
        return curryN(fn.length, fn);
      });
      module.exports = curry;
    }
  });

  // sdk/contracts/node_modules/ramda/src/constructN.js
  var require_constructN = __commonJS({
    "sdk/contracts/node_modules/ramda/src/constructN.js"(exports, module) {
      var _curry2 = require_curry2();
      var curry = require_curry();
      var nAry = require_nAry();
      var constructN = /* @__PURE__ */ _curry2(function constructN2(n, Fn) {
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

  // sdk/contracts/node_modules/ramda/src/construct.js
  var require_construct = __commonJS({
    "sdk/contracts/node_modules/ramda/src/construct.js"(exports, module) {
      var _curry1 = require_curry1();
      var constructN = require_constructN();
      var construct = /* @__PURE__ */ _curry1(function construct2(Fn) {
        return constructN(Fn.length, Fn);
      });
      module.exports = construct;
    }
  });

  // sdk/contracts/node_modules/ramda/src/converge.js
  var require_converge = __commonJS({
    "sdk/contracts/node_modules/ramda/src/converge.js"(exports, module) {
      var _curry2 = require_curry2();
      var _map = require_map();
      var curryN = require_curryN2();
      var max = require_max();
      var pluck = require_pluck();
      var reduce = require_reduce2();
      var converge = /* @__PURE__ */ _curry2(function converge2(after, fns) {
        return curryN(reduce(max, 0, pluck("length", fns)), function() {
          var args = arguments;
          var context = this;
          return after.apply(context, _map(function(fn) {
            return fn.apply(context, args);
          }, fns));
        });
      });
      module.exports = converge;
    }
  });

  // sdk/contracts/node_modules/ramda/src/count.js
  var require_count = __commonJS({
    "sdk/contracts/node_modules/ramda/src/count.js"(exports, module) {
      var _reduce = require_reduce();
      var curry = require_curry();
      var count = /* @__PURE__ */ curry(function(pred, list) {
        return _reduce(function(a, e) {
          return pred(e) ? a + 1 : a;
        }, 0, list);
      });
      module.exports = count;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xreduceBy.js
  var require_xreduceBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xreduceBy.js"(exports, module) {
      var _curryN = require_curryN();
      var _has = require_has();
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
            if (_has(key, this.inputs)) {
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
      var _xreduceBy = /* @__PURE__ */ _curryN(4, [], function _xreduceBy2(valueFn, valueAcc, keyFn, xf) {
        return new XReduceBy(valueFn, valueAcc, keyFn, xf);
      });
      module.exports = _xreduceBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/reduceBy.js
  var require_reduceBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reduceBy.js"(exports, module) {
      var _clone = require_clone();
      var _curryN = require_curryN();
      var _dispatchable = require_dispatchable();
      var _has = require_has();
      var _reduce = require_reduce();
      var _reduced = require_reduced();
      var _xreduceBy = require_xreduceBy();
      var reduceBy = /* @__PURE__ */ _curryN(
        4,
        [],
        /* @__PURE__ */ _dispatchable([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
          return _reduce(function(acc, elt) {
            var key = keyFn(elt);
            var value = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, [], [], false), elt);
            if (value && value["@@transducer/reduced"]) {
              return _reduced(acc);
            }
            acc[key] = value;
            return acc;
          }, {}, list);
        })
      );
      module.exports = reduceBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/countBy.js
  var require_countBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/countBy.js"(exports, module) {
      var reduceBy = require_reduceBy();
      var countBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
        return acc + 1;
      }, 0);
      module.exports = countBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dec.js
  var require_dec = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dec.js"(exports, module) {
      var add = require_add();
      var dec = /* @__PURE__ */ add(-1);
      module.exports = dec;
    }
  });

  // sdk/contracts/node_modules/ramda/src/defaultTo.js
  var require_defaultTo = __commonJS({
    "sdk/contracts/node_modules/ramda/src/defaultTo.js"(exports, module) {
      var _curry2 = require_curry2();
      var defaultTo = /* @__PURE__ */ _curry2(function defaultTo2(d, v) {
        return v == null || v !== v ? d : v;
      });
      module.exports = defaultTo;
    }
  });

  // sdk/contracts/node_modules/ramda/src/descend.js
  var require_descend = __commonJS({
    "sdk/contracts/node_modules/ramda/src/descend.js"(exports, module) {
      var _curry3 = require_curry3();
      var descend = /* @__PURE__ */ _curry3(function descend2(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa > bb ? -1 : aa < bb ? 1 : 0;
      });
      module.exports = descend;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_Set.js
  var require_Set = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_Set.js"(exports, module) {
      var _includes = require_includes();
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
        var type = typeof item;
        var prevSize, newSize;
        switch (type) {
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
              if (!(type in set._items)) {
                if (shouldAdd) {
                  set._items[type] = {};
                  set._items[type][item] = true;
                }
                return false;
              } else if (item in set._items[type]) {
                return true;
              } else {
                if (shouldAdd) {
                  set._items[type][item] = true;
                }
                return false;
              }
            }
          case "boolean":
            if (type in set._items) {
              var bIdx = item ? 1 : 0;
              if (set._items[type][bIdx]) {
                return true;
              } else {
                if (shouldAdd) {
                  set._items[type][bIdx] = true;
                }
                return false;
              }
            } else {
              if (shouldAdd) {
                set._items[type] = item ? [false, true] : [true, false];
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
              if (!(type in set._items)) {
                if (shouldAdd) {
                  set._items[type] = [item];
                }
                return false;
              }
              if (!_includes(item, set._items[type])) {
                if (shouldAdd) {
                  set._items[type].push(item);
                }
                return false;
              }
              return true;
            }
          case "undefined":
            if (set._items[type]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type] = true;
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
            type = Object.prototype.toString.call(item);
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = [item];
              }
              return false;
            }
            if (!_includes(item, set._items[type])) {
              if (shouldAdd) {
                set._items[type].push(item);
              }
              return false;
            }
            return true;
        }
      }
      module.exports = _Set;
    }
  });

  // sdk/contracts/node_modules/ramda/src/difference.js
  var require_difference = __commonJS({
    "sdk/contracts/node_modules/ramda/src/difference.js"(exports, module) {
      var _curry2 = require_curry2();
      var _Set = require_Set();
      var difference = /* @__PURE__ */ _curry2(function difference2(first, second) {
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

  // sdk/contracts/node_modules/ramda/src/differenceWith.js
  var require_differenceWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/differenceWith.js"(exports, module) {
      var _includesWith = require_includesWith();
      var _curry3 = require_curry3();
      var differenceWith = /* @__PURE__ */ _curry3(function differenceWith2(pred, first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        while (idx < firstLen) {
          if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
            out.push(first[idx]);
          }
          idx += 1;
        }
        return out;
      });
      module.exports = differenceWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/remove.js
  var require_remove = __commonJS({
    "sdk/contracts/node_modules/ramda/src/remove.js"(exports, module) {
      var _curry3 = require_curry3();
      var remove = /* @__PURE__ */ _curry3(function remove2(start, count, list) {
        var result = Array.prototype.slice.call(list, 0);
        result.splice(start, count);
        return result;
      });
      module.exports = remove;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_dissoc.js
  var require_dissoc = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_dissoc.js"(exports, module) {
      var _isInteger = require_isInteger();
      var _isArray = require_isArray();
      var remove = require_remove();
      function _dissoc(prop, obj) {
        if (obj == null) {
          return obj;
        }
        if (_isInteger(prop) && _isArray(obj)) {
          return remove(prop, 1, obj);
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        delete result[prop];
        return result;
      }
      module.exports = _dissoc;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dissocPath.js
  var require_dissocPath = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dissocPath.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dissoc = require_dissoc();
      var _isInteger = require_isInteger();
      var _isArray = require_isArray();
      var assoc = require_assoc2();
      function _shallowCloneObject(prop, obj) {
        if (_isInteger(prop) && _isArray(obj)) {
          return [].concat(obj);
        }
        var result = {};
        for (var p in obj) {
          result[p] = obj[p];
        }
        return result;
      }
      var dissocPath = /* @__PURE__ */ _curry2(function dissocPath2(path, obj) {
        if (obj == null) {
          return obj;
        }
        switch (path.length) {
          case 0:
            return obj;
          case 1:
            return _dissoc(path[0], obj);
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

  // sdk/contracts/node_modules/ramda/src/dissoc.js
  var require_dissoc2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dissoc.js"(exports, module) {
      var _curry2 = require_curry2();
      var dissocPath = require_dissocPath();
      var dissoc = /* @__PURE__ */ _curry2(function dissoc2(prop, obj) {
        return dissocPath([prop], obj);
      });
      module.exports = dissoc;
    }
  });

  // sdk/contracts/node_modules/ramda/src/divide.js
  var require_divide = __commonJS({
    "sdk/contracts/node_modules/ramda/src/divide.js"(exports, module) {
      var _curry2 = require_curry2();
      var divide = /* @__PURE__ */ _curry2(function divide2(a, b) {
        return a / b;
      });
      module.exports = divide;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xdrop.js
  var require_xdrop = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xdrop.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xdrop = /* @__PURE__ */ _curry2(function _xdrop2(n, xf) {
        return new XDrop(n, xf);
      });
      module.exports = _xdrop;
    }
  });

  // sdk/contracts/node_modules/ramda/src/drop.js
  var require_drop = __commonJS({
    "sdk/contracts/node_modules/ramda/src/drop.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xdrop = require_xdrop();
      var slice = require_slice();
      var drop = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["drop"], _xdrop, function drop2(n, xs) {
          return slice(Math.max(0, n), Infinity, xs);
        })
      );
      module.exports = drop;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xtake.js
  var require_xtake = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xtake.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
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
          return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
        };
        return XTake2;
      }();
      var _xtake = /* @__PURE__ */ _curry2(function _xtake2(n, xf) {
        return new XTake(n, xf);
      });
      module.exports = _xtake;
    }
  });

  // sdk/contracts/node_modules/ramda/src/take.js
  var require_take = __commonJS({
    "sdk/contracts/node_modules/ramda/src/take.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xtake = require_xtake();
      var slice = require_slice();
      var take = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["take"], _xtake, function take2(n, xs) {
          return slice(0, n < 0 ? Infinity : n, xs);
        })
      );
      module.exports = take;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_dropLast.js
  var require_dropLast = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_dropLast.js"(exports, module) {
      var take = require_take();
      function dropLast(n, xs) {
        return take(n < xs.length ? xs.length - n : 0, xs);
      }
      module.exports = dropLast;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xdropLast.js
  var require_xdropLast = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xdropLast.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xdropLast = /* @__PURE__ */ _curry2(function _xdropLast2(n, xf) {
        return new XDropLast(n, xf);
      });
      module.exports = _xdropLast;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dropLast.js
  var require_dropLast2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dropLast.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _dropLast = require_dropLast();
      var _xdropLast = require_xdropLast();
      var dropLast = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xdropLast, _dropLast)
      );
      module.exports = dropLast;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_dropLastWhile.js
  var require_dropLastWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_dropLastWhile.js"(exports, module) {
      var slice = require_slice();
      function dropLastWhile(pred, xs) {
        var idx = xs.length - 1;
        while (idx >= 0 && pred(xs[idx])) {
          idx -= 1;
        }
        return slice(0, idx + 1, xs);
      }
      module.exports = dropLastWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xdropLastWhile.js
  var require_xdropLastWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xdropLastWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduce = require_reduce();
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
          result = _reduce(this.xf["@@transducer/step"], result, this.retained);
          this.retained = [];
          return this.xf["@@transducer/step"](result, input);
        };
        XDropLastWhile2.prototype.retain = function(result, input) {
          this.retained.push(input);
          return result;
        };
        return XDropLastWhile2;
      }();
      var _xdropLastWhile = /* @__PURE__ */ _curry2(function _xdropLastWhile2(fn, xf) {
        return new XDropLastWhile(fn, xf);
      });
      module.exports = _xdropLastWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dropLastWhile.js
  var require_dropLastWhile2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dropLastWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _dropLastWhile = require_dropLastWhile();
      var _xdropLastWhile = require_xdropLastWhile();
      var dropLastWhile = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xdropLastWhile, _dropLastWhile)
      );
      module.exports = dropLastWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xdropRepeatsWith.js
  var require_xdropRepeatsWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xdropRepeatsWith.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xdropRepeatsWith = /* @__PURE__ */ _curry2(function _xdropRepeatsWith2(pred, xf) {
        return new XDropRepeatsWith(pred, xf);
      });
      module.exports = _xdropRepeatsWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/last.js
  var require_last = __commonJS({
    "sdk/contracts/node_modules/ramda/src/last.js"(exports, module) {
      var nth = require_nth();
      var last = /* @__PURE__ */ nth(-1);
      module.exports = last;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dropRepeatsWith.js
  var require_dropRepeatsWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dropRepeatsWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xdropRepeatsWith = require_xdropRepeatsWith();
      var last = require_last();
      var dropRepeatsWith = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xdropRepeatsWith, function dropRepeatsWith2(pred, list) {
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

  // sdk/contracts/node_modules/ramda/src/dropRepeats.js
  var require_dropRepeats = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dropRepeats.js"(exports, module) {
      var _curry1 = require_curry1();
      var _dispatchable = require_dispatchable();
      var _xdropRepeatsWith = require_xdropRepeatsWith();
      var dropRepeatsWith = require_dropRepeatsWith();
      var equals = require_equals2();
      var dropRepeats = /* @__PURE__ */ _curry1(
        /* @__PURE__ */ _dispatchable(
          [],
          /* @__PURE__ */ _xdropRepeatsWith(equals),
          /* @__PURE__ */ dropRepeatsWith(equals)
        )
      );
      module.exports = dropRepeats;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xdropWhile.js
  var require_xdropWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xdropWhile.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xdropWhile = /* @__PURE__ */ _curry2(function _xdropWhile2(f, xf) {
        return new XDropWhile(f, xf);
      });
      module.exports = _xdropWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/dropWhile.js
  var require_dropWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/dropWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xdropWhile = require_xdropWhile();
      var slice = require_slice();
      var dropWhile = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["dropWhile"], _xdropWhile, function dropWhile2(pred, xs) {
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

  // sdk/contracts/node_modules/ramda/src/or.js
  var require_or = __commonJS({
    "sdk/contracts/node_modules/ramda/src/or.js"(exports, module) {
      var _curry2 = require_curry2();
      var or = /* @__PURE__ */ _curry2(function or2(a, b) {
        return a || b;
      });
      module.exports = or;
    }
  });

  // sdk/contracts/node_modules/ramda/src/either.js
  var require_either = __commonJS({
    "sdk/contracts/node_modules/ramda/src/either.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isFunction = require_isFunction();
      var lift = require_lift();
      var or = require_or();
      var either = /* @__PURE__ */ _curry2(function either2(f, g) {
        return _isFunction(f) ? function _either() {
          return f.apply(this, arguments) || g.apply(this, arguments);
        } : lift(or)(f, g);
      });
      module.exports = either;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isTypedArray.js
  var require_isTypedArray = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isTypedArray.js"(exports, module) {
      function _isTypedArray(val) {
        var type = Object.prototype.toString.call(val);
        return type === "[object Uint8ClampedArray]" || type === "[object Int8Array]" || type === "[object Uint8Array]" || type === "[object Int16Array]" || type === "[object Uint16Array]" || type === "[object Int32Array]" || type === "[object Uint32Array]" || type === "[object Float32Array]" || type === "[object Float64Array]" || type === "[object BigInt64Array]" || type === "[object BigUint64Array]";
      }
      module.exports = _isTypedArray;
    }
  });

  // sdk/contracts/node_modules/ramda/src/empty.js
  var require_empty = __commonJS({
    "sdk/contracts/node_modules/ramda/src/empty.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isArguments = require_isArguments();
      var _isArray = require_isArray();
      var _isObject = require_isObject();
      var _isString = require_isString();
      var _isTypedArray = require_isTypedArray();
      var empty = /* @__PURE__ */ _curry1(function empty2(x) {
        return x != null && typeof x["fantasy-land/empty"] === "function" ? x["fantasy-land/empty"]() : x != null && x.constructor != null && typeof x.constructor["fantasy-land/empty"] === "function" ? x.constructor["fantasy-land/empty"]() : x != null && typeof x.empty === "function" ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === "function" ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? "" : _isObject(x) ? {} : _isArguments(x) ? function() {
          return arguments;
        }() : _isTypedArray(x) ? x.constructor.from("") : void 0;
      });
      module.exports = empty;
    }
  });

  // sdk/contracts/node_modules/ramda/src/takeLast.js
  var require_takeLast = __commonJS({
    "sdk/contracts/node_modules/ramda/src/takeLast.js"(exports, module) {
      var _curry2 = require_curry2();
      var drop = require_drop();
      var takeLast = /* @__PURE__ */ _curry2(function takeLast2(n, xs) {
        return drop(n >= 0 ? xs.length - n : 0, xs);
      });
      module.exports = takeLast;
    }
  });

  // sdk/contracts/node_modules/ramda/src/endsWith.js
  var require_endsWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/endsWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var equals = require_equals2();
      var takeLast = require_takeLast();
      var endsWith = /* @__PURE__ */ _curry2(function(suffix, list) {
        return equals(takeLast(suffix.length, list), suffix);
      });
      module.exports = endsWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/eqBy.js
  var require_eqBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/eqBy.js"(exports, module) {
      var _curry3 = require_curry3();
      var equals = require_equals2();
      var eqBy = /* @__PURE__ */ _curry3(function eqBy2(f, x, y) {
        return equals(f(x), f(y));
      });
      module.exports = eqBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/eqProps.js
  var require_eqProps = __commonJS({
    "sdk/contracts/node_modules/ramda/src/eqProps.js"(exports, module) {
      var _curry3 = require_curry3();
      var equals = require_equals2();
      var eqProps = /* @__PURE__ */ _curry3(function eqProps2(prop, obj1, obj2) {
        return equals(obj1[prop], obj2[prop]);
      });
      module.exports = eqProps;
    }
  });

  // sdk/contracts/node_modules/ramda/src/evolve.js
  var require_evolve = __commonJS({
    "sdk/contracts/node_modules/ramda/src/evolve.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isArray = require_isArray();
      var _isObject = require_isObject();
      var evolve = /* @__PURE__ */ _curry2(function evolve2(transformations, object) {
        if (!_isObject(object) && !_isArray(object)) {
          return object;
        }
        var result = object instanceof Array ? [] : {};
        var transformation, key, type;
        for (key in object) {
          transformation = transformations[key];
          type = typeof transformation;
          result[key] = type === "function" ? transformation(object[key]) : transformation && type === "object" ? evolve2(transformation, object[key]) : object[key];
        }
        return result;
      });
      module.exports = evolve;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xfind.js
  var require_xfind = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfind.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
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
            result = _reduced(this.xf["@@transducer/step"](result, input));
          }
          return result;
        };
        return XFind2;
      }();
      var _xfind = /* @__PURE__ */ _curry2(function _xfind2(f, xf) {
        return new XFind(f, xf);
      });
      module.exports = _xfind;
    }
  });

  // sdk/contracts/node_modules/ramda/src/find.js
  var require_find = __commonJS({
    "sdk/contracts/node_modules/ramda/src/find.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xfind = require_xfind();
      var find = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["find"], _xfind, function find2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xfindIndex.js
  var require_xfindIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfindIndex.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
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
            result = _reduced(this.xf["@@transducer/step"](result, this.idx));
          }
          return result;
        };
        return XFindIndex2;
      }();
      var _xfindIndex = /* @__PURE__ */ _curry2(function _xfindIndex2(f, xf) {
        return new XFindIndex(f, xf);
      });
      module.exports = _xfindIndex;
    }
  });

  // sdk/contracts/node_modules/ramda/src/findIndex.js
  var require_findIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/findIndex.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xfindIndex = require_xfindIndex();
      var findIndex = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xfindIndex, function findIndex2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xfindLast.js
  var require_xfindLast = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfindLast.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xfindLast = /* @__PURE__ */ _curry2(function _xfindLast2(f, xf) {
        return new XFindLast(f, xf);
      });
      module.exports = _xfindLast;
    }
  });

  // sdk/contracts/node_modules/ramda/src/findLast.js
  var require_findLast = __commonJS({
    "sdk/contracts/node_modules/ramda/src/findLast.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xfindLast = require_xfindLast();
      var findLast = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xfindLast, function findLast2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xfindLastIndex.js
  var require_xfindLastIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xfindLastIndex.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xfindLastIndex = /* @__PURE__ */ _curry2(function _xfindLastIndex2(f, xf) {
        return new XFindLastIndex(f, xf);
      });
      module.exports = _xfindLastIndex;
    }
  });

  // sdk/contracts/node_modules/ramda/src/findLastIndex.js
  var require_findLastIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/findLastIndex.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xfindLastIndex = require_xfindLastIndex();
      var findLastIndex = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xfindLastIndex, function findLastIndex2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/flatten.js
  var require_flatten = __commonJS({
    "sdk/contracts/node_modules/ramda/src/flatten.js"(exports, module) {
      var _curry1 = require_curry1();
      var _makeFlat = require_makeFlat();
      var flatten = /* @__PURE__ */ _curry1(
        /* @__PURE__ */ _makeFlat(true)
      );
      module.exports = flatten;
    }
  });

  // sdk/contracts/node_modules/ramda/src/flip.js
  var require_flip = __commonJS({
    "sdk/contracts/node_modules/ramda/src/flip.js"(exports, module) {
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var flip = /* @__PURE__ */ _curry1(function flip2(fn) {
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

  // sdk/contracts/node_modules/ramda/src/forEach.js
  var require_forEach = __commonJS({
    "sdk/contracts/node_modules/ramda/src/forEach.js"(exports, module) {
      var _checkForMethod = require_checkForMethod();
      var _curry2 = require_curry2();
      var forEach = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _checkForMethod("forEach", function forEach2(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/forEachObjIndexed.js
  var require_forEachObjIndexed = __commonJS({
    "sdk/contracts/node_modules/ramda/src/forEachObjIndexed.js"(exports, module) {
      var _curry2 = require_curry2();
      var keys = require_keys();
      var forEachObjIndexed = /* @__PURE__ */ _curry2(function forEachObjIndexed2(fn, obj) {
        var keyList = keys(obj);
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

  // sdk/contracts/node_modules/ramda/src/fromPairs.js
  var require_fromPairs = __commonJS({
    "sdk/contracts/node_modules/ramda/src/fromPairs.js"(exports, module) {
      var _curry1 = require_curry1();
      var fromPairs = /* @__PURE__ */ _curry1(function fromPairs2(pairs) {
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

  // sdk/contracts/node_modules/ramda/src/groupBy.js
  var require_groupBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/groupBy.js"(exports, module) {
      var _checkForMethod = require_checkForMethod();
      var _curry2 = require_curry2();
      var reduceBy = require_reduceBy();
      var groupBy = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _checkForMethod(
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

  // sdk/contracts/node_modules/ramda/src/groupWith.js
  var require_groupWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/groupWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var groupWith = /* @__PURE__ */ _curry2(function(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/gt.js
  var require_gt = __commonJS({
    "sdk/contracts/node_modules/ramda/src/gt.js"(exports, module) {
      var _curry2 = require_curry2();
      var gt = /* @__PURE__ */ _curry2(function gt2(a, b) {
        return a > b;
      });
      module.exports = gt;
    }
  });

  // sdk/contracts/node_modules/ramda/src/gte.js
  var require_gte = __commonJS({
    "sdk/contracts/node_modules/ramda/src/gte.js"(exports, module) {
      var _curry2 = require_curry2();
      var gte = /* @__PURE__ */ _curry2(function gte2(a, b) {
        return a >= b;
      });
      module.exports = gte;
    }
  });

  // sdk/contracts/node_modules/ramda/src/hasPath.js
  var require_hasPath = __commonJS({
    "sdk/contracts/node_modules/ramda/src/hasPath.js"(exports, module) {
      var _curry2 = require_curry2();
      var _has = require_has();
      var isNil = require_isNil();
      var hasPath = /* @__PURE__ */ _curry2(function hasPath2(_path, obj) {
        if (_path.length === 0 || isNil(obj)) {
          return false;
        }
        var val = obj;
        var idx = 0;
        while (idx < _path.length) {
          if (!isNil(val) && _has(_path[idx], val)) {
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

  // sdk/contracts/node_modules/ramda/src/has.js
  var require_has2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/has.js"(exports, module) {
      var _curry2 = require_curry2();
      var hasPath = require_hasPath();
      var has = /* @__PURE__ */ _curry2(function has2(prop, obj) {
        return hasPath([prop], obj);
      });
      module.exports = has;
    }
  });

  // sdk/contracts/node_modules/ramda/src/hasIn.js
  var require_hasIn = __commonJS({
    "sdk/contracts/node_modules/ramda/src/hasIn.js"(exports, module) {
      var _curry2 = require_curry2();
      var isNil = require_isNil();
      var hasIn = /* @__PURE__ */ _curry2(function hasIn2(prop, obj) {
        if (isNil(obj)) {
          return false;
        }
        return prop in obj;
      });
      module.exports = hasIn;
    }
  });

  // sdk/contracts/node_modules/ramda/src/identical.js
  var require_identical = __commonJS({
    "sdk/contracts/node_modules/ramda/src/identical.js"(exports, module) {
      var _objectIs = require_objectIs();
      var _curry2 = require_curry2();
      var identical = /* @__PURE__ */ _curry2(_objectIs);
      module.exports = identical;
    }
  });

  // sdk/contracts/node_modules/ramda/src/ifElse.js
  var require_ifElse = __commonJS({
    "sdk/contracts/node_modules/ramda/src/ifElse.js"(exports, module) {
      var _curry3 = require_curry3();
      var curryN = require_curryN2();
      var ifElse = /* @__PURE__ */ _curry3(function ifElse2(condition, onTrue, onFalse) {
        return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
          return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
        });
      });
      module.exports = ifElse;
    }
  });

  // sdk/contracts/node_modules/ramda/src/inc.js
  var require_inc = __commonJS({
    "sdk/contracts/node_modules/ramda/src/inc.js"(exports, module) {
      var add = require_add();
      var inc = /* @__PURE__ */ add(1);
      module.exports = inc;
    }
  });

  // sdk/contracts/node_modules/ramda/src/includes.js
  var require_includes2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/includes.js"(exports, module) {
      var _includes = require_includes();
      var _curry2 = require_curry2();
      var includes = /* @__PURE__ */ _curry2(_includes);
      module.exports = includes;
    }
  });

  // sdk/contracts/node_modules/ramda/src/indexBy.js
  var require_indexBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/indexBy.js"(exports, module) {
      var reduceBy = require_reduceBy();
      var indexBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
        return elem;
      }, null);
      module.exports = indexBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/indexOf.js
  var require_indexOf2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/indexOf.js"(exports, module) {
      var _curry2 = require_curry2();
      var _indexOf = require_indexOf();
      var _isArray = require_isArray();
      var indexOf = /* @__PURE__ */ _curry2(function indexOf2(target, xs) {
        return typeof xs.indexOf === "function" && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
      });
      module.exports = indexOf;
    }
  });

  // sdk/contracts/node_modules/ramda/src/init.js
  var require_init = __commonJS({
    "sdk/contracts/node_modules/ramda/src/init.js"(exports, module) {
      var slice = require_slice();
      var init = /* @__PURE__ */ slice(0, -1);
      module.exports = init;
    }
  });

  // sdk/contracts/node_modules/ramda/src/innerJoin.js
  var require_innerJoin = __commonJS({
    "sdk/contracts/node_modules/ramda/src/innerJoin.js"(exports, module) {
      var _includesWith = require_includesWith();
      var _curry3 = require_curry3();
      var _filter = require_filter();
      var innerJoin = /* @__PURE__ */ _curry3(function innerJoin2(pred, xs, ys) {
        return _filter(function(x) {
          return _includesWith(pred, x, ys);
        }, xs);
      });
      module.exports = innerJoin;
    }
  });

  // sdk/contracts/node_modules/ramda/src/insert.js
  var require_insert = __commonJS({
    "sdk/contracts/node_modules/ramda/src/insert.js"(exports, module) {
      var _curry3 = require_curry3();
      var insert = /* @__PURE__ */ _curry3(function insert2(idx, elt, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        var result = Array.prototype.slice.call(list, 0);
        result.splice(idx, 0, elt);
        return result;
      });
      module.exports = insert;
    }
  });

  // sdk/contracts/node_modules/ramda/src/insertAll.js
  var require_insertAll = __commonJS({
    "sdk/contracts/node_modules/ramda/src/insertAll.js"(exports, module) {
      var _curry3 = require_curry3();
      var insertAll = /* @__PURE__ */ _curry3(function insertAll2(idx, elts, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
      });
      module.exports = insertAll;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xuniqBy.js
  var require_xuniqBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xuniqBy.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xuniqBy = /* @__PURE__ */ _curry2(function _xuniqBy2(f, xf) {
        return new XUniqBy(f, xf);
      });
      module.exports = _xuniqBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/uniqBy.js
  var require_uniqBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/uniqBy.js"(exports, module) {
      var _Set = require_Set();
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xuniqBy = require_xuniqBy();
      var uniqBy = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xuniqBy, function(fn, list) {
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

  // sdk/contracts/node_modules/ramda/src/uniq.js
  var require_uniq = __commonJS({
    "sdk/contracts/node_modules/ramda/src/uniq.js"(exports, module) {
      var identity = require_identity2();
      var uniqBy = require_uniqBy();
      var uniq = /* @__PURE__ */ uniqBy(identity);
      module.exports = uniq;
    }
  });

  // sdk/contracts/node_modules/ramda/src/intersection.js
  var require_intersection = __commonJS({
    "sdk/contracts/node_modules/ramda/src/intersection.js"(exports, module) {
      var _includes = require_includes();
      var _curry2 = require_curry2();
      var _filter = require_filter();
      var flip = require_flip();
      var uniq = require_uniq();
      var intersection = /* @__PURE__ */ _curry2(function intersection2(list1, list2) {
        var lookupList, filteredList;
        if (list1.length > list2.length) {
          lookupList = list1;
          filteredList = list2;
        } else {
          lookupList = list2;
          filteredList = list1;
        }
        return uniq(_filter(flip(_includes)(lookupList), filteredList));
      });
      module.exports = intersection;
    }
  });

  // sdk/contracts/node_modules/ramda/src/intersperse.js
  var require_intersperse = __commonJS({
    "sdk/contracts/node_modules/ramda/src/intersperse.js"(exports, module) {
      var _checkForMethod = require_checkForMethod();
      var _curry2 = require_curry2();
      var intersperse = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _checkForMethod("intersperse", function intersperse2(separator, list) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_objectAssign.js
  var require_objectAssign = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_objectAssign.js"(exports, module) {
      var _has = require_has();
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
              if (_has(nextKey, source)) {
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

  // sdk/contracts/node_modules/ramda/src/objOf.js
  var require_objOf = __commonJS({
    "sdk/contracts/node_modules/ramda/src/objOf.js"(exports, module) {
      var _curry2 = require_curry2();
      var objOf = /* @__PURE__ */ _curry2(function objOf2(key, val) {
        var obj = {};
        obj[key] = val;
        return obj;
      });
      module.exports = objOf;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_stepCat.js
  var require_stepCat = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_stepCat.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _identity = require_identity();
      var _isArrayLike = require_isArrayLike();
      var _isTransformer = require_isTransformer();
      var objOf = require_objOf();
      var _stepCatArray = {
        "@@transducer/init": Array,
        "@@transducer/step": function(xs, x) {
          xs.push(x);
          return xs;
        },
        "@@transducer/result": _identity
      };
      var _stepCatString = {
        "@@transducer/init": String,
        "@@transducer/step": function(a, b) {
          return a + b;
        },
        "@@transducer/result": _identity
      };
      var _stepCatObject = {
        "@@transducer/init": Object,
        "@@transducer/step": function(result, input) {
          return _objectAssign(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
        },
        "@@transducer/result": _identity
      };
      function _stepCat(obj) {
        if (_isTransformer(obj)) {
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
      module.exports = _stepCat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/into.js
  var require_into = __commonJS({
    "sdk/contracts/node_modules/ramda/src/into.js"(exports, module) {
      var _clone = require_clone();
      var _curry3 = require_curry3();
      var _isTransformer = require_isTransformer();
      var _reduce = require_reduce();
      var _stepCat = require_stepCat();
      var into = /* @__PURE__ */ _curry3(function into2(acc, xf, list) {
        return _isTransformer(acc) ? _reduce(xf(acc), acc["@@transducer/init"](), list) : _reduce(xf(_stepCat(acc)), _clone(acc, [], [], false), list);
      });
      module.exports = into;
    }
  });

  // sdk/contracts/node_modules/ramda/src/invert.js
  var require_invert = __commonJS({
    "sdk/contracts/node_modules/ramda/src/invert.js"(exports, module) {
      var _curry1 = require_curry1();
      var _has = require_has();
      var keys = require_keys();
      var invert = /* @__PURE__ */ _curry1(function invert2(obj) {
        var props = keys(obj);
        var len = props.length;
        var idx = 0;
        var out = {};
        while (idx < len) {
          var key = props[idx];
          var val = obj[key];
          var list = _has(val, out) ? out[val] : out[val] = [];
          list[list.length] = key;
          idx += 1;
        }
        return out;
      });
      module.exports = invert;
    }
  });

  // sdk/contracts/node_modules/ramda/src/invertObj.js
  var require_invertObj = __commonJS({
    "sdk/contracts/node_modules/ramda/src/invertObj.js"(exports, module) {
      var _curry1 = require_curry1();
      var keys = require_keys();
      var invertObj = /* @__PURE__ */ _curry1(function invertObj2(obj) {
        var props = keys(obj);
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

  // sdk/contracts/node_modules/ramda/src/invoker.js
  var require_invoker = __commonJS({
    "sdk/contracts/node_modules/ramda/src/invoker.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isFunction = require_isFunction();
      var curryN = require_curryN2();
      var toString = require_toString2();
      var invoker = /* @__PURE__ */ _curry2(function invoker2(arity, method) {
        return curryN(arity + 1, function() {
          var target = arguments[arity];
          if (target != null && _isFunction(target[method])) {
            return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
          }
          throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
        });
      });
      module.exports = invoker;
    }
  });

  // sdk/contracts/node_modules/ramda/src/is.js
  var require_is = __commonJS({
    "sdk/contracts/node_modules/ramda/src/is.js"(exports, module) {
      var _curry2 = require_curry2();
      var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
        return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
      });
      module.exports = is;
    }
  });

  // sdk/contracts/node_modules/ramda/src/isEmpty.js
  var require_isEmpty = __commonJS({
    "sdk/contracts/node_modules/ramda/src/isEmpty.js"(exports, module) {
      var _curry1 = require_curry1();
      var empty = require_empty();
      var equals = require_equals2();
      var isEmpty = /* @__PURE__ */ _curry1(function isEmpty2(x) {
        return x != null && equals(x, empty(x));
      });
      module.exports = isEmpty;
    }
  });

  // sdk/contracts/node_modules/ramda/src/join.js
  var require_join = __commonJS({
    "sdk/contracts/node_modules/ramda/src/join.js"(exports, module) {
      var invoker = require_invoker();
      var join = /* @__PURE__ */ invoker(1, "join");
      module.exports = join;
    }
  });

  // sdk/contracts/node_modules/ramda/src/juxt.js
  var require_juxt = __commonJS({
    "sdk/contracts/node_modules/ramda/src/juxt.js"(exports, module) {
      var _curry1 = require_curry1();
      var converge = require_converge();
      var juxt = /* @__PURE__ */ _curry1(function juxt2(fns) {
        return converge(function() {
          return Array.prototype.slice.call(arguments, 0);
        }, fns);
      });
      module.exports = juxt;
    }
  });

  // sdk/contracts/node_modules/ramda/src/keysIn.js
  var require_keysIn = __commonJS({
    "sdk/contracts/node_modules/ramda/src/keysIn.js"(exports, module) {
      var _curry1 = require_curry1();
      var keysIn = /* @__PURE__ */ _curry1(function keysIn2(obj) {
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

  // sdk/contracts/node_modules/ramda/src/lastIndexOf.js
  var require_lastIndexOf = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lastIndexOf.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isArray = require_isArray();
      var equals = require_equals2();
      var lastIndexOf = /* @__PURE__ */ _curry2(function lastIndexOf2(target, xs) {
        if (typeof xs.lastIndexOf === "function" && !_isArray(xs)) {
          return xs.lastIndexOf(target);
        } else {
          var idx = xs.length - 1;
          while (idx >= 0) {
            if (equals(xs[idx], target)) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_isNumber.js
  var require_isNumber = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isNumber.js"(exports, module) {
      function _isNumber(x) {
        return Object.prototype.toString.call(x) === "[object Number]";
      }
      module.exports = _isNumber;
    }
  });

  // sdk/contracts/node_modules/ramda/src/length.js
  var require_length = __commonJS({
    "sdk/contracts/node_modules/ramda/src/length.js"(exports, module) {
      var _curry1 = require_curry1();
      var _isNumber = require_isNumber();
      var length = /* @__PURE__ */ _curry1(function length2(list) {
        return list != null && _isNumber(list.length) ? list.length : NaN;
      });
      module.exports = length;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lens.js
  var require_lens = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lens.js"(exports, module) {
      var _curry2 = require_curry2();
      var map = require_map2();
      var lens = /* @__PURE__ */ _curry2(function lens2(getter, setter) {
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

  // sdk/contracts/node_modules/ramda/src/update.js
  var require_update = __commonJS({
    "sdk/contracts/node_modules/ramda/src/update.js"(exports, module) {
      var _curry3 = require_curry3();
      var adjust = require_adjust();
      var always = require_always();
      var update = /* @__PURE__ */ _curry3(function update2(idx, x, list) {
        return adjust(idx, always(x), list);
      });
      module.exports = update;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lensIndex.js
  var require_lensIndex = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lensIndex.js"(exports, module) {
      var _curry1 = require_curry1();
      var lens = require_lens();
      var nth = require_nth();
      var update = require_update();
      var lensIndex = /* @__PURE__ */ _curry1(function lensIndex2(n) {
        return lens(nth(n), update(n));
      });
      module.exports = lensIndex;
    }
  });

  // sdk/contracts/node_modules/ramda/src/paths.js
  var require_paths = __commonJS({
    "sdk/contracts/node_modules/ramda/src/paths.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isInteger = require_isInteger();
      var nth = require_nth();
      var paths = /* @__PURE__ */ _curry2(function paths2(pathsArray, obj) {
        return pathsArray.map(function(paths3) {
          var val = obj;
          var idx = 0;
          var p;
          while (idx < paths3.length) {
            if (val == null) {
              return;
            }
            p = paths3[idx];
            val = _isInteger(p) ? nth(p, val) : val[p];
            idx += 1;
          }
          return val;
        });
      });
      module.exports = paths;
    }
  });

  // sdk/contracts/node_modules/ramda/src/path.js
  var require_path = __commonJS({
    "sdk/contracts/node_modules/ramda/src/path.js"(exports, module) {
      var _curry2 = require_curry2();
      var paths = require_paths();
      var path = /* @__PURE__ */ _curry2(function path2(pathAr, obj) {
        return paths([pathAr], obj)[0];
      });
      module.exports = path;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lensPath.js
  var require_lensPath = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lensPath.js"(exports, module) {
      var _curry1 = require_curry1();
      var assocPath = require_assocPath();
      var lens = require_lens();
      var path = require_path();
      var lensPath = /* @__PURE__ */ _curry1(function lensPath2(p) {
        return lens(path(p), assocPath(p));
      });
      module.exports = lensPath;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lensProp.js
  var require_lensProp = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lensProp.js"(exports, module) {
      var _curry1 = require_curry1();
      var assoc = require_assoc2();
      var lens = require_lens();
      var prop = require_prop();
      var lensProp = /* @__PURE__ */ _curry1(function lensProp2(k) {
        return lens(prop(k), assoc(k));
      });
      module.exports = lensProp;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lt.js
  var require_lt = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lt.js"(exports, module) {
      var _curry2 = require_curry2();
      var lt = /* @__PURE__ */ _curry2(function lt2(a, b) {
        return a < b;
      });
      module.exports = lt;
    }
  });

  // sdk/contracts/node_modules/ramda/src/lte.js
  var require_lte = __commonJS({
    "sdk/contracts/node_modules/ramda/src/lte.js"(exports, module) {
      var _curry2 = require_curry2();
      var lte = /* @__PURE__ */ _curry2(function lte2(a, b) {
        return a <= b;
      });
      module.exports = lte;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mapAccum.js
  var require_mapAccum = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mapAccum.js"(exports, module) {
      var _curry3 = require_curry3();
      var mapAccum = /* @__PURE__ */ _curry3(function mapAccum2(fn, acc, list) {
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

  // sdk/contracts/node_modules/ramda/src/mapAccumRight.js
  var require_mapAccumRight = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mapAccumRight.js"(exports, module) {
      var _curry3 = require_curry3();
      var mapAccumRight = /* @__PURE__ */ _curry3(function mapAccumRight2(fn, acc, list) {
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

  // sdk/contracts/node_modules/ramda/src/mapObjIndexed.js
  var require_mapObjIndexed = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mapObjIndexed.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduce = require_reduce();
      var keys = require_keys();
      var mapObjIndexed = /* @__PURE__ */ _curry2(function mapObjIndexed2(fn, obj) {
        return _reduce(function(acc, key) {
          acc[key] = fn(obj[key], key, obj);
          return acc;
        }, {}, keys(obj));
      });
      module.exports = mapObjIndexed;
    }
  });

  // sdk/contracts/node_modules/ramda/src/match.js
  var require_match = __commonJS({
    "sdk/contracts/node_modules/ramda/src/match.js"(exports, module) {
      var _curry2 = require_curry2();
      var match = /* @__PURE__ */ _curry2(function match2(rx, str) {
        return str.match(rx) || [];
      });
      module.exports = match;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mathMod.js
  var require_mathMod = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mathMod.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isInteger = require_isInteger();
      var mathMod = /* @__PURE__ */ _curry2(function mathMod2(m, p) {
        if (!_isInteger(m)) {
          return NaN;
        }
        if (!_isInteger(p) || p < 1) {
          return NaN;
        }
        return (m % p + p) % p;
      });
      module.exports = mathMod;
    }
  });

  // sdk/contracts/node_modules/ramda/src/maxBy.js
  var require_maxBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/maxBy.js"(exports, module) {
      var _curry3 = require_curry3();
      var maxBy = /* @__PURE__ */ _curry3(function maxBy2(f, a, b) {
        return f(b) > f(a) ? b : a;
      });
      module.exports = maxBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/sum.js
  var require_sum = __commonJS({
    "sdk/contracts/node_modules/ramda/src/sum.js"(exports, module) {
      var add = require_add();
      var reduce = require_reduce2();
      var sum = /* @__PURE__ */ reduce(add, 0);
      module.exports = sum;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mean.js
  var require_mean = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mean.js"(exports, module) {
      var _curry1 = require_curry1();
      var sum = require_sum();
      var mean = /* @__PURE__ */ _curry1(function mean2(list) {
        return sum(list) / list.length;
      });
      module.exports = mean;
    }
  });

  // sdk/contracts/node_modules/ramda/src/median.js
  var require_median = __commonJS({
    "sdk/contracts/node_modules/ramda/src/median.js"(exports, module) {
      var _curry1 = require_curry1();
      var mean = require_mean();
      var median = /* @__PURE__ */ _curry1(function median2(list) {
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

  // sdk/contracts/node_modules/ramda/src/memoizeWith.js
  var require_memoizeWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/memoizeWith.js"(exports, module) {
      var _arity = require_arity();
      var _curry2 = require_curry2();
      var _has = require_has();
      var memoizeWith = /* @__PURE__ */ _curry2(function memoizeWith2(mFn, fn) {
        var cache = {};
        return _arity(fn.length, function() {
          var key = mFn.apply(this, arguments);
          if (!_has(key, cache)) {
            cache[key] = fn.apply(this, arguments);
          }
          return cache[key];
        });
      });
      module.exports = memoizeWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeAll.js
  var require_mergeAll = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeAll.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry1 = require_curry1();
      var mergeAll = /* @__PURE__ */ _curry1(function mergeAll2(list) {
        return _objectAssign.apply(null, [{}].concat(list));
      });
      module.exports = mergeAll;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeWithKey.js
  var require_mergeWithKey = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeWithKey.js"(exports, module) {
      var _curry3 = require_curry3();
      var _has = require_has();
      var mergeWithKey = /* @__PURE__ */ _curry3(function mergeWithKey2(fn, l, r) {
        var result = {};
        var k;
        for (k in l) {
          if (_has(k, l)) {
            result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
          }
        }
        for (k in r) {
          if (_has(k, r) && !_has(k, result)) {
            result[k] = r[k];
          }
        }
        return result;
      });
      module.exports = mergeWithKey;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeDeepWithKey.js
  var require_mergeDeepWithKey = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeDeepWithKey.js"(exports, module) {
      var _curry3 = require_curry3();
      var _isObject = require_isObject();
      var mergeWithKey = require_mergeWithKey();
      var mergeDeepWithKey = /* @__PURE__ */ _curry3(function mergeDeepWithKey2(fn, lObj, rObj) {
        return mergeWithKey(function(k, lVal, rVal) {
          if (_isObject(lVal) && _isObject(rVal)) {
            return mergeDeepWithKey2(fn, lVal, rVal);
          } else {
            return fn(k, lVal, rVal);
          }
        }, lObj, rObj);
      });
      module.exports = mergeDeepWithKey;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeDeepLeft.js
  var require_mergeDeepLeft = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeDeepLeft.js"(exports, module) {
      var _curry2 = require_curry2();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepLeft = /* @__PURE__ */ _curry2(function mergeDeepLeft2(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return lVal;
        }, lObj, rObj);
      });
      module.exports = mergeDeepLeft;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeDeepRight.js
  var require_mergeDeepRight = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeDeepRight.js"(exports, module) {
      var _curry2 = require_curry2();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepRight = /* @__PURE__ */ _curry2(function mergeDeepRight2(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return rVal;
        }, lObj, rObj);
      });
      module.exports = mergeDeepRight;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeDeepWith.js
  var require_mergeDeepWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeDeepWith.js"(exports, module) {
      var _curry3 = require_curry3();
      var mergeDeepWithKey = require_mergeDeepWithKey();
      var mergeDeepWith = /* @__PURE__ */ _curry3(function mergeDeepWith2(fn, lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
          return fn(lVal, rVal);
        }, lObj, rObj);
      });
      module.exports = mergeDeepWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeLeft.js
  var require_mergeLeft = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeLeft.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry2 = require_curry2();
      var mergeLeft = /* @__PURE__ */ _curry2(function mergeLeft2(l, r) {
        return _objectAssign({}, r, l);
      });
      module.exports = mergeLeft;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeRight.js
  var require_mergeRight = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeRight.js"(exports, module) {
      var _objectAssign = require_objectAssign();
      var _curry2 = require_curry2();
      var mergeRight = /* @__PURE__ */ _curry2(function mergeRight2(l, r) {
        return _objectAssign({}, l, r);
      });
      module.exports = mergeRight;
    }
  });

  // sdk/contracts/node_modules/ramda/src/mergeWith.js
  var require_mergeWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/mergeWith.js"(exports, module) {
      var _curry3 = require_curry3();
      var mergeWithKey = require_mergeWithKey();
      var mergeWith = /* @__PURE__ */ _curry3(function mergeWith2(fn, l, r) {
        return mergeWithKey(function(_2, _l, _r) {
          return fn(_l, _r);
        }, l, r);
      });
      module.exports = mergeWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/min.js
  var require_min = __commonJS({
    "sdk/contracts/node_modules/ramda/src/min.js"(exports, module) {
      var _curry2 = require_curry2();
      var min = /* @__PURE__ */ _curry2(function min2(a, b) {
        return b < a ? b : a;
      });
      module.exports = min;
    }
  });

  // sdk/contracts/node_modules/ramda/src/minBy.js
  var require_minBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/minBy.js"(exports, module) {
      var _curry3 = require_curry3();
      var minBy = /* @__PURE__ */ _curry3(function minBy2(f, a, b) {
        return f(b) < f(a) ? b : a;
      });
      module.exports = minBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_modify.js
  var require_modify = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_modify.js"(exports, module) {
      var _isArray = require_isArray();
      var _isInteger = require_isInteger();
      function _modify(prop, fn, obj) {
        if (_isInteger(prop) && _isArray(obj)) {
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
      module.exports = _modify;
    }
  });

  // sdk/contracts/node_modules/ramda/src/modifyPath.js
  var require_modifyPath = __commonJS({
    "sdk/contracts/node_modules/ramda/src/modifyPath.js"(exports, module) {
      var _curry3 = require_curry3();
      var _isArray = require_isArray();
      var _isObject = require_isObject();
      var _has = require_has();
      var _assoc = require_assoc();
      var _modify = require_modify();
      var modifyPath = /* @__PURE__ */ _curry3(function modifyPath2(path, fn, object) {
        if (!_isObject(object) && !_isArray(object) || path.length === 0) {
          return object;
        }
        var idx = path[0];
        if (!_has(idx, object)) {
          return object;
        }
        if (path.length === 1) {
          return _modify(idx, fn, object);
        }
        var val = modifyPath2(Array.prototype.slice.call(path, 1), fn, object[idx]);
        if (val === object[idx]) {
          return object;
        }
        return _assoc(idx, val, object);
      });
      module.exports = modifyPath;
    }
  });

  // sdk/contracts/node_modules/ramda/src/modify.js
  var require_modify2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/modify.js"(exports, module) {
      var _curry3 = require_curry3();
      var modifyPath = require_modifyPath();
      var modify = /* @__PURE__ */ _curry3(function modify2(prop, fn, object) {
        return modifyPath([prop], fn, object);
      });
      module.exports = modify;
    }
  });

  // sdk/contracts/node_modules/ramda/src/modulo.js
  var require_modulo = __commonJS({
    "sdk/contracts/node_modules/ramda/src/modulo.js"(exports, module) {
      var _curry2 = require_curry2();
      var modulo = /* @__PURE__ */ _curry2(function modulo2(a, b) {
        return a % b;
      });
      module.exports = modulo;
    }
  });

  // sdk/contracts/node_modules/ramda/src/move.js
  var require_move = __commonJS({
    "sdk/contracts/node_modules/ramda/src/move.js"(exports, module) {
      var _curry3 = require_curry3();
      var move = /* @__PURE__ */ _curry3(function(from, to, list) {
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

  // sdk/contracts/node_modules/ramda/src/multiply.js
  var require_multiply = __commonJS({
    "sdk/contracts/node_modules/ramda/src/multiply.js"(exports, module) {
      var _curry2 = require_curry2();
      var multiply = /* @__PURE__ */ _curry2(function multiply2(a, b) {
        return a * b;
      });
      module.exports = multiply;
    }
  });

  // sdk/contracts/node_modules/ramda/src/partialObject.js
  var require_partialObject = __commonJS({
    "sdk/contracts/node_modules/ramda/src/partialObject.js"(exports, module) {
      var mergeDeepRight = require_mergeDeepRight();
      var _curry2 = require_curry2();
      module.exports = /* @__PURE__ */ _curry2((f, o) => (props) => f.call(exports, mergeDeepRight(o, props)));
    }
  });

  // sdk/contracts/node_modules/ramda/src/negate.js
  var require_negate = __commonJS({
    "sdk/contracts/node_modules/ramda/src/negate.js"(exports, module) {
      var _curry1 = require_curry1();
      var negate = /* @__PURE__ */ _curry1(function negate2(n) {
        return -n;
      });
      module.exports = negate;
    }
  });

  // sdk/contracts/node_modules/ramda/src/none.js
  var require_none = __commonJS({
    "sdk/contracts/node_modules/ramda/src/none.js"(exports, module) {
      var _complement = require_complement2();
      var _curry2 = require_curry2();
      var all = require_all();
      var none = /* @__PURE__ */ _curry2(function none2(fn, input) {
        return all(_complement(fn), input);
      });
      module.exports = none;
    }
  });

  // sdk/contracts/node_modules/ramda/src/nthArg.js
  var require_nthArg = __commonJS({
    "sdk/contracts/node_modules/ramda/src/nthArg.js"(exports, module) {
      var _curry1 = require_curry1();
      var curryN = require_curryN2();
      var nth = require_nth();
      var nthArg = /* @__PURE__ */ _curry1(function nthArg2(n) {
        var arity = n < 0 ? 1 : n + 1;
        return curryN(arity, function() {
          return nth(n, arguments);
        });
      });
      module.exports = nthArg;
    }
  });

  // sdk/contracts/node_modules/ramda/src/o.js
  var require_o = __commonJS({
    "sdk/contracts/node_modules/ramda/src/o.js"(exports, module) {
      var _curry3 = require_curry3();
      var o = /* @__PURE__ */ _curry3(function o2(f, g, x) {
        return f(g(x));
      });
      module.exports = o;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_of.js
  var require_of = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_of.js"(exports, module) {
      function _of(x) {
        return [x];
      }
      module.exports = _of;
    }
  });

  // sdk/contracts/node_modules/ramda/src/of.js
  var require_of2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/of.js"(exports, module) {
      var _curry1 = require_curry1();
      var _of = require_of();
      var of = /* @__PURE__ */ _curry1(_of);
      module.exports = of;
    }
  });

  // sdk/contracts/node_modules/ramda/src/omit.js
  var require_omit = __commonJS({
    "sdk/contracts/node_modules/ramda/src/omit.js"(exports, module) {
      var _curry2 = require_curry2();
      var omit = /* @__PURE__ */ _curry2(function omit2(names, obj) {
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

  // sdk/contracts/node_modules/ramda/src/on.js
  var require_on = __commonJS({
    "sdk/contracts/node_modules/ramda/src/on.js"(exports, module) {
      var curryN = require_curryN();
      var on = /* @__PURE__ */ curryN(4, [], function on2(f, g, a, b) {
        return f(g(a), g(b));
      });
      module.exports = on;
    }
  });

  // sdk/contracts/node_modules/ramda/src/once.js
  var require_once = __commonJS({
    "sdk/contracts/node_modules/ramda/src/once.js"(exports, module) {
      var _arity = require_arity();
      var _curry1 = require_curry1();
      var once = /* @__PURE__ */ _curry1(function once2(fn) {
        var called = false;
        var result;
        return _arity(fn.length, function() {
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

  // sdk/contracts/node_modules/ramda/src/internal/_assertPromise.js
  var require_assertPromise = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_assertPromise.js"(exports, module) {
      var _isFunction = require_isFunction();
      var _toString = require_toString();
      function _assertPromise(name, p) {
        if (p == null || !_isFunction(p.then)) {
          throw new TypeError("`" + name + "` expected a Promise, received " + _toString(p, []));
        }
      }
      module.exports = _assertPromise;
    }
  });

  // sdk/contracts/node_modules/ramda/src/otherwise.js
  var require_otherwise = __commonJS({
    "sdk/contracts/node_modules/ramda/src/otherwise.js"(exports, module) {
      var _curry2 = require_curry2();
      var _assertPromise = require_assertPromise();
      var otherwise = /* @__PURE__ */ _curry2(function otherwise2(f, p) {
        _assertPromise("otherwise", p);
        return p.then(null, f);
      });
      module.exports = otherwise;
    }
  });

  // sdk/contracts/node_modules/ramda/src/over.js
  var require_over = __commonJS({
    "sdk/contracts/node_modules/ramda/src/over.js"(exports, module) {
      var _curry3 = require_curry3();
      var Identity = function(x) {
        return {
          value: x,
          map: function(f) {
            return Identity(f(x));
          }
        };
      };
      var over = /* @__PURE__ */ _curry3(function over2(lens, f, x) {
        return lens(function(y) {
          return Identity(f(y));
        })(x).value;
      });
      module.exports = over;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pair.js
  var require_pair = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pair.js"(exports, module) {
      var _curry2 = require_curry2();
      var pair = /* @__PURE__ */ _curry2(function pair2(fst, snd) {
        return [fst, snd];
      });
      module.exports = pair;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_createPartialApplicator.js
  var require_createPartialApplicator = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_createPartialApplicator.js"(exports, module) {
      var _arity = require_arity();
      var _curry2 = require_curry2();
      function _createPartialApplicator(concat) {
        return _curry2(function(fn, args) {
          return _arity(Math.max(0, fn.length - args.length), function() {
            return fn.apply(this, concat(args, arguments));
          });
        });
      }
      module.exports = _createPartialApplicator;
    }
  });

  // sdk/contracts/node_modules/ramda/src/partial.js
  var require_partial = __commonJS({
    "sdk/contracts/node_modules/ramda/src/partial.js"(exports, module) {
      var _concat = require_concat();
      var _createPartialApplicator = require_createPartialApplicator();
      var partial = /* @__PURE__ */ _createPartialApplicator(_concat);
      module.exports = partial;
    }
  });

  // sdk/contracts/node_modules/ramda/src/partialRight.js
  var require_partialRight = __commonJS({
    "sdk/contracts/node_modules/ramda/src/partialRight.js"(exports, module) {
      var _concat = require_concat();
      var _createPartialApplicator = require_createPartialApplicator();
      var flip = require_flip();
      var partialRight = /* @__PURE__ */ _createPartialApplicator(
        /* @__PURE__ */ flip(_concat)
      );
      module.exports = partialRight;
    }
  });

  // sdk/contracts/node_modules/ramda/src/partition.js
  var require_partition = __commonJS({
    "sdk/contracts/node_modules/ramda/src/partition.js"(exports, module) {
      var filter = require_filter2();
      var juxt = require_juxt();
      var reject = require_reject();
      var partition = /* @__PURE__ */ juxt([filter, reject]);
      module.exports = partition;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pathEq.js
  var require_pathEq = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pathEq.js"(exports, module) {
      var _curry3 = require_curry3();
      var equals = require_equals2();
      var path = require_path();
      var pathEq = /* @__PURE__ */ _curry3(function pathEq2(_path, val, obj) {
        return equals(path(_path, obj), val);
      });
      module.exports = pathEq;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pathOr.js
  var require_pathOr = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pathOr.js"(exports, module) {
      var _curry3 = require_curry3();
      var defaultTo = require_defaultTo();
      var path = require_path();
      var pathOr = /* @__PURE__ */ _curry3(function pathOr2(d, p, obj) {
        return defaultTo(d, path(p, obj));
      });
      module.exports = pathOr;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pathSatisfies.js
  var require_pathSatisfies = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pathSatisfies.js"(exports, module) {
      var _curry3 = require_curry3();
      var path = require_path();
      var pathSatisfies = /* @__PURE__ */ _curry3(function pathSatisfies2(pred, propPath, obj) {
        return pred(path(propPath, obj));
      });
      module.exports = pathSatisfies;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pick.js
  var require_pick = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pick.js"(exports, module) {
      var _curry2 = require_curry2();
      var pick = /* @__PURE__ */ _curry2(function pick2(names, obj) {
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

  // sdk/contracts/node_modules/ramda/src/pickAll.js
  var require_pickAll = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pickAll.js"(exports, module) {
      var _curry2 = require_curry2();
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
      module.exports = pickAll;
    }
  });

  // sdk/contracts/node_modules/ramda/src/pickBy.js
  var require_pickBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/pickBy.js"(exports, module) {
      var _curry2 = require_curry2();
      var pickBy = /* @__PURE__ */ _curry2(function pickBy2(test, obj) {
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

  // sdk/contracts/node_modules/ramda/src/prepend.js
  var require_prepend = __commonJS({
    "sdk/contracts/node_modules/ramda/src/prepend.js"(exports, module) {
      var _concat = require_concat();
      var _curry2 = require_curry2();
      var prepend = /* @__PURE__ */ _curry2(function prepend2(el, list) {
        return _concat([el], list);
      });
      module.exports = prepend;
    }
  });

  // sdk/contracts/node_modules/ramda/src/product.js
  var require_product = __commonJS({
    "sdk/contracts/node_modules/ramda/src/product.js"(exports, module) {
      var multiply = require_multiply();
      var reduce = require_reduce2();
      var product = /* @__PURE__ */ reduce(multiply, 1);
      module.exports = product;
    }
  });

  // sdk/contracts/node_modules/ramda/src/useWith.js
  var require_useWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/useWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var curryN = require_curryN2();
      var useWith = /* @__PURE__ */ _curry2(function useWith2(fn, transformers) {
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

  // sdk/contracts/node_modules/ramda/src/project.js
  var require_project = __commonJS({
    "sdk/contracts/node_modules/ramda/src/project.js"(exports, module) {
      var _map = require_map();
      var identity = require_identity2();
      var pickAll = require_pickAll();
      var useWith = require_useWith();
      var project = /* @__PURE__ */ useWith(_map, [pickAll, identity]);
      module.exports = project;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_promap.js
  var require_promap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_promap.js"(exports, module) {
      function _promap(f, g, profunctor) {
        return function(x) {
          return g(profunctor(f(x)));
        };
      }
      module.exports = _promap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xpromap.js
  var require_xpromap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xpromap.js"(exports, module) {
      var _curry3 = require_curry3();
      var _xfBase = require_xfBase();
      var _promap = require_promap();
      var XPromap = /* @__PURE__ */ function() {
        function XPromap2(f, g, xf) {
          this.xf = xf;
          this.f = f;
          this.g = g;
        }
        XPromap2.prototype["@@transducer/init"] = _xfBase.init;
        XPromap2.prototype["@@transducer/result"] = _xfBase.result;
        XPromap2.prototype["@@transducer/step"] = function(result, input) {
          return this.xf["@@transducer/step"](result, _promap(this.f, this.g, input));
        };
        return XPromap2;
      }();
      var _xpromap = /* @__PURE__ */ _curry3(function _xpromap2(f, g, xf) {
        return new XPromap(f, g, xf);
      });
      module.exports = _xpromap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/promap.js
  var require_promap2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/promap.js"(exports, module) {
      var _curry3 = require_curry3();
      var _dispatchable = require_dispatchable();
      var _promap = require_promap();
      var _xpromap = require_xpromap();
      var promap = /* @__PURE__ */ _curry3(
        /* @__PURE__ */ _dispatchable(["fantasy-land/promap", "promap"], _xpromap, _promap)
      );
      module.exports = promap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/propEq.js
  var require_propEq = __commonJS({
    "sdk/contracts/node_modules/ramda/src/propEq.js"(exports, module) {
      var _curry3 = require_curry3();
      var prop = require_prop();
      var equals = require_equals2();
      var propEq = /* @__PURE__ */ _curry3(function propEq2(name, val, obj) {
        return equals(val, prop(name, obj));
      });
      module.exports = propEq;
    }
  });

  // sdk/contracts/node_modules/ramda/src/propIs.js
  var require_propIs = __commonJS({
    "sdk/contracts/node_modules/ramda/src/propIs.js"(exports, module) {
      var _curry3 = require_curry3();
      var prop = require_prop();
      var is = require_is();
      var propIs = /* @__PURE__ */ _curry3(function propIs2(type, name, obj) {
        return is(type, prop(name, obj));
      });
      module.exports = propIs;
    }
  });

  // sdk/contracts/node_modules/ramda/src/propOr.js
  var require_propOr = __commonJS({
    "sdk/contracts/node_modules/ramda/src/propOr.js"(exports, module) {
      var _curry3 = require_curry3();
      var defaultTo = require_defaultTo();
      var prop = require_prop();
      var propOr = /* @__PURE__ */ _curry3(function propOr2(val, p, obj) {
        return defaultTo(val, prop(p, obj));
      });
      module.exports = propOr;
    }
  });

  // sdk/contracts/node_modules/ramda/src/propSatisfies.js
  var require_propSatisfies = __commonJS({
    "sdk/contracts/node_modules/ramda/src/propSatisfies.js"(exports, module) {
      var _curry3 = require_curry3();
      var prop = require_prop();
      var propSatisfies = /* @__PURE__ */ _curry3(function propSatisfies2(pred, name, obj) {
        return pred(prop(name, obj));
      });
      module.exports = propSatisfies;
    }
  });

  // sdk/contracts/node_modules/ramda/src/props.js
  var require_props = __commonJS({
    "sdk/contracts/node_modules/ramda/src/props.js"(exports, module) {
      var _curry2 = require_curry2();
      var path = require_path();
      var props = /* @__PURE__ */ _curry2(function props2(ps, obj) {
        return ps.map(function(p) {
          return path([p], obj);
        });
      });
      module.exports = props;
    }
  });

  // sdk/contracts/node_modules/ramda/src/range.js
  var require_range = __commonJS({
    "sdk/contracts/node_modules/ramda/src/range.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isNumber = require_isNumber();
      var range = /* @__PURE__ */ _curry2(function range2(from, to) {
        if (!(_isNumber(from) && _isNumber(to))) {
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

  // sdk/contracts/node_modules/ramda/src/reduceRight.js
  var require_reduceRight = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reduceRight.js"(exports, module) {
      var _curry3 = require_curry3();
      var reduceRight = /* @__PURE__ */ _curry3(function reduceRight2(fn, acc, list) {
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

  // sdk/contracts/node_modules/ramda/src/reduceWhile.js
  var require_reduceWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reduceWhile.js"(exports, module) {
      var _curryN = require_curryN();
      var _reduce = require_reduce();
      var _reduced = require_reduced();
      var reduceWhile = /* @__PURE__ */ _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
        return _reduce(function(acc, x) {
          return pred(acc, x) ? fn(acc, x) : _reduced(acc);
        }, a, list);
      });
      module.exports = reduceWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/reduced.js
  var require_reduced2 = __commonJS({
    "sdk/contracts/node_modules/ramda/src/reduced.js"(exports, module) {
      var _curry1 = require_curry1();
      var _reduced = require_reduced();
      var reduced = /* @__PURE__ */ _curry1(_reduced);
      module.exports = reduced;
    }
  });

  // sdk/contracts/node_modules/ramda/src/times.js
  var require_times = __commonJS({
    "sdk/contracts/node_modules/ramda/src/times.js"(exports, module) {
      var _curry2 = require_curry2();
      var times = /* @__PURE__ */ _curry2(function times2(fn, n) {
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

  // sdk/contracts/node_modules/ramda/src/repeat.js
  var require_repeat = __commonJS({
    "sdk/contracts/node_modules/ramda/src/repeat.js"(exports, module) {
      var _curry2 = require_curry2();
      var always = require_always();
      var times = require_times();
      var repeat = /* @__PURE__ */ _curry2(function repeat2(value, n) {
        return times(always(value), n);
      });
      module.exports = repeat;
    }
  });

  // sdk/contracts/node_modules/ramda/src/replace.js
  var require_replace = __commonJS({
    "sdk/contracts/node_modules/ramda/src/replace.js"(exports, module) {
      var _curry3 = require_curry3();
      var replace = /* @__PURE__ */ _curry3(function replace2(regex, replacement, str) {
        return str.replace(regex, replacement);
      });
      module.exports = replace;
    }
  });

  // sdk/contracts/node_modules/ramda/src/scan.js
  var require_scan = __commonJS({
    "sdk/contracts/node_modules/ramda/src/scan.js"(exports, module) {
      var _curry3 = require_curry3();
      var scan = /* @__PURE__ */ _curry3(function scan2(fn, acc, list) {
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

  // sdk/contracts/node_modules/ramda/src/sequence.js
  var require_sequence = __commonJS({
    "sdk/contracts/node_modules/ramda/src/sequence.js"(exports, module) {
      var _curry2 = require_curry2();
      var ap = require_ap();
      var map = require_map2();
      var prepend = require_prepend();
      var reduceRight = require_reduceRight();
      var sequence = /* @__PURE__ */ _curry2(function sequence2(of, traversable) {
        return typeof traversable.sequence === "function" ? traversable.sequence(of) : reduceRight(function(x, acc) {
          return ap(map(prepend, x), acc);
        }, of([]), traversable);
      });
      module.exports = sequence;
    }
  });

  // sdk/contracts/node_modules/ramda/src/set.js
  var require_set = __commonJS({
    "sdk/contracts/node_modules/ramda/src/set.js"(exports, module) {
      var _curry3 = require_curry3();
      var always = require_always();
      var over = require_over();
      var set = /* @__PURE__ */ _curry3(function set2(lens, v, x) {
        return over(lens, always(v), x);
      });
      module.exports = set;
    }
  });

  // sdk/contracts/node_modules/ramda/src/sort.js
  var require_sort = __commonJS({
    "sdk/contracts/node_modules/ramda/src/sort.js"(exports, module) {
      var _curry2 = require_curry2();
      var sort = /* @__PURE__ */ _curry2(function sort2(comparator, list) {
        return Array.prototype.slice.call(list, 0).sort(comparator);
      });
      module.exports = sort;
    }
  });

  // sdk/contracts/node_modules/ramda/src/sortBy.js
  var require_sortBy = __commonJS({
    "sdk/contracts/node_modules/ramda/src/sortBy.js"(exports, module) {
      var _curry2 = require_curry2();
      var sortBy = /* @__PURE__ */ _curry2(function sortBy2(fn, list) {
        return Array.prototype.slice.call(list, 0).sort(function(a, b) {
          var aa = fn(a);
          var bb = fn(b);
          return aa < bb ? -1 : aa > bb ? 1 : 0;
        });
      });
      module.exports = sortBy;
    }
  });

  // sdk/contracts/node_modules/ramda/src/sortWith.js
  var require_sortWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/sortWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var sortWith = /* @__PURE__ */ _curry2(function sortWith2(fns, list) {
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

  // sdk/contracts/node_modules/ramda/src/split.js
  var require_split = __commonJS({
    "sdk/contracts/node_modules/ramda/src/split.js"(exports, module) {
      var invoker = require_invoker();
      var split = /* @__PURE__ */ invoker(1, "split");
      module.exports = split;
    }
  });

  // sdk/contracts/node_modules/ramda/src/splitAt.js
  var require_splitAt = __commonJS({
    "sdk/contracts/node_modules/ramda/src/splitAt.js"(exports, module) {
      var _curry2 = require_curry2();
      var length = require_length();
      var slice = require_slice();
      var splitAt = /* @__PURE__ */ _curry2(function splitAt2(index, array) {
        return [slice(0, index, array), slice(index, length(array), array)];
      });
      module.exports = splitAt;
    }
  });

  // sdk/contracts/node_modules/ramda/src/splitEvery.js
  var require_splitEvery = __commonJS({
    "sdk/contracts/node_modules/ramda/src/splitEvery.js"(exports, module) {
      var _curry2 = require_curry2();
      var slice = require_slice();
      var splitEvery = /* @__PURE__ */ _curry2(function splitEvery2(n, list) {
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

  // sdk/contracts/node_modules/ramda/src/splitWhen.js
  var require_splitWhen = __commonJS({
    "sdk/contracts/node_modules/ramda/src/splitWhen.js"(exports, module) {
      var _curry2 = require_curry2();
      var splitWhen = /* @__PURE__ */ _curry2(function splitWhen2(pred, list) {
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

  // sdk/contracts/node_modules/ramda/src/splitWhenever.js
  var require_splitWhenever = __commonJS({
    "sdk/contracts/node_modules/ramda/src/splitWhenever.js"(exports, module) {
      var _curryN = require_curryN();
      var splitWhenever = /* @__PURE__ */ _curryN(2, [], function splitWhenever2(pred, list) {
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

  // sdk/contracts/node_modules/ramda/src/startsWith.js
  var require_startsWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/startsWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var equals = require_equals2();
      var take = require_take();
      var startsWith = /* @__PURE__ */ _curry2(function(prefix, list) {
        return equals(take(prefix.length, list), prefix);
      });
      module.exports = startsWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/subtract.js
  var require_subtract = __commonJS({
    "sdk/contracts/node_modules/ramda/src/subtract.js"(exports, module) {
      var _curry2 = require_curry2();
      var subtract = /* @__PURE__ */ _curry2(function subtract2(a, b) {
        return Number(a) - Number(b);
      });
      module.exports = subtract;
    }
  });

  // sdk/contracts/node_modules/ramda/src/symmetricDifference.js
  var require_symmetricDifference = __commonJS({
    "sdk/contracts/node_modules/ramda/src/symmetricDifference.js"(exports, module) {
      var _curry2 = require_curry2();
      var concat = require_concat2();
      var difference = require_difference();
      var symmetricDifference = /* @__PURE__ */ _curry2(function symmetricDifference2(list1, list2) {
        return concat(difference(list1, list2), difference(list2, list1));
      });
      module.exports = symmetricDifference;
    }
  });

  // sdk/contracts/node_modules/ramda/src/symmetricDifferenceWith.js
  var require_symmetricDifferenceWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/symmetricDifferenceWith.js"(exports, module) {
      var _curry3 = require_curry3();
      var concat = require_concat2();
      var differenceWith = require_differenceWith();
      var symmetricDifferenceWith = /* @__PURE__ */ _curry3(function symmetricDifferenceWith2(pred, list1, list2) {
        return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
      });
      module.exports = symmetricDifferenceWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/takeLastWhile.js
  var require_takeLastWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/takeLastWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var slice = require_slice();
      var takeLastWhile = /* @__PURE__ */ _curry2(function takeLastWhile2(fn, xs) {
        var idx = xs.length - 1;
        while (idx >= 0 && fn(xs[idx])) {
          idx -= 1;
        }
        return slice(idx + 1, Infinity, xs);
      });
      module.exports = takeLastWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xtakeWhile.js
  var require_xtakeWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xtakeWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var _reduced = require_reduced();
      var _xfBase = require_xfBase();
      var XTakeWhile = /* @__PURE__ */ function() {
        function XTakeWhile2(f, xf) {
          this.xf = xf;
          this.f = f;
        }
        XTakeWhile2.prototype["@@transducer/init"] = _xfBase.init;
        XTakeWhile2.prototype["@@transducer/result"] = _xfBase.result;
        XTakeWhile2.prototype["@@transducer/step"] = function(result, input) {
          return this.f(input) ? this.xf["@@transducer/step"](result, input) : _reduced(result);
        };
        return XTakeWhile2;
      }();
      var _xtakeWhile = /* @__PURE__ */ _curry2(function _xtakeWhile2(f, xf) {
        return new XTakeWhile(f, xf);
      });
      module.exports = _xtakeWhile;
    }
  });

  // sdk/contracts/node_modules/ramda/src/takeWhile.js
  var require_takeWhile = __commonJS({
    "sdk/contracts/node_modules/ramda/src/takeWhile.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xtakeWhile = require_xtakeWhile();
      var slice = require_slice();
      var takeWhile = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable(["takeWhile"], _xtakeWhile, function takeWhile2(fn, xs) {
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

  // sdk/contracts/node_modules/ramda/src/internal/_xtap.js
  var require_xtap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xtap.js"(exports, module) {
      var _curry2 = require_curry2();
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
      var _xtap = /* @__PURE__ */ _curry2(function _xtap2(f, xf) {
        return new XTap(f, xf);
      });
      module.exports = _xtap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/tap.js
  var require_tap = __commonJS({
    "sdk/contracts/node_modules/ramda/src/tap.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _xtap = require_xtap();
      var tap = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xtap, function tap2(fn, x) {
          fn(x);
          return x;
        })
      );
      module.exports = tap;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_isRegExp.js
  var require_isRegExp = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_isRegExp.js"(exports, module) {
      function _isRegExp(x) {
        return Object.prototype.toString.call(x) === "[object RegExp]";
      }
      module.exports = _isRegExp;
    }
  });

  // sdk/contracts/node_modules/ramda/src/test.js
  var require_test = __commonJS({
    "sdk/contracts/node_modules/ramda/src/test.js"(exports, module) {
      var _cloneRegExp = require_cloneRegExp();
      var _curry2 = require_curry2();
      var _isRegExp = require_isRegExp();
      var toString = require_toString2();
      var test = /* @__PURE__ */ _curry2(function test2(pattern, str) {
        if (!_isRegExp(pattern)) {
          throw new TypeError("\u2018test\u2019 requires a value of type RegExp as its first argument; received " + toString(pattern));
        }
        return _cloneRegExp(pattern).test(str);
      });
      module.exports = test;
    }
  });

  // sdk/contracts/node_modules/ramda/src/andThen.js
  var require_andThen = __commonJS({
    "sdk/contracts/node_modules/ramda/src/andThen.js"(exports, module) {
      var _curry2 = require_curry2();
      var _assertPromise = require_assertPromise();
      var andThen = /* @__PURE__ */ _curry2(function andThen2(f, p) {
        _assertPromise("andThen", p);
        return p.then(f);
      });
      module.exports = andThen;
    }
  });

  // sdk/contracts/node_modules/ramda/src/toLower.js
  var require_toLower = __commonJS({
    "sdk/contracts/node_modules/ramda/src/toLower.js"(exports, module) {
      var invoker = require_invoker();
      var toLower = /* @__PURE__ */ invoker(0, "toLowerCase");
      module.exports = toLower;
    }
  });

  // sdk/contracts/node_modules/ramda/src/toPairs.js
  var require_toPairs = __commonJS({
    "sdk/contracts/node_modules/ramda/src/toPairs.js"(exports, module) {
      var _curry1 = require_curry1();
      var _has = require_has();
      var toPairs = /* @__PURE__ */ _curry1(function toPairs2(obj) {
        var pairs = [];
        for (var prop in obj) {
          if (_has(prop, obj)) {
            pairs[pairs.length] = [prop, obj[prop]];
          }
        }
        return pairs;
      });
      module.exports = toPairs;
    }
  });

  // sdk/contracts/node_modules/ramda/src/toPairsIn.js
  var require_toPairsIn = __commonJS({
    "sdk/contracts/node_modules/ramda/src/toPairsIn.js"(exports, module) {
      var _curry1 = require_curry1();
      var toPairsIn = /* @__PURE__ */ _curry1(function toPairsIn2(obj) {
        var pairs = [];
        for (var prop in obj) {
          pairs[pairs.length] = [prop, obj[prop]];
        }
        return pairs;
      });
      module.exports = toPairsIn;
    }
  });

  // sdk/contracts/node_modules/ramda/src/toUpper.js
  var require_toUpper = __commonJS({
    "sdk/contracts/node_modules/ramda/src/toUpper.js"(exports, module) {
      var invoker = require_invoker();
      var toUpper = /* @__PURE__ */ invoker(0, "toUpperCase");
      module.exports = toUpper;
    }
  });

  // sdk/contracts/node_modules/ramda/src/transduce.js
  var require_transduce = __commonJS({
    "sdk/contracts/node_modules/ramda/src/transduce.js"(exports, module) {
      var _reduce = require_reduce();
      var _xwrap = require_xwrap();
      var curryN = require_curryN2();
      var transduce = /* @__PURE__ */ curryN(4, function transduce2(xf, fn, acc, list) {
        return _reduce(xf(typeof fn === "function" ? _xwrap(fn) : fn), acc, list);
      });
      module.exports = transduce;
    }
  });

  // sdk/contracts/node_modules/ramda/src/transpose.js
  var require_transpose = __commonJS({
    "sdk/contracts/node_modules/ramda/src/transpose.js"(exports, module) {
      var _curry1 = require_curry1();
      var transpose = /* @__PURE__ */ _curry1(function transpose2(outerlist) {
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

  // sdk/contracts/node_modules/ramda/src/traverse.js
  var require_traverse = __commonJS({
    "sdk/contracts/node_modules/ramda/src/traverse.js"(exports, module) {
      var _curry3 = require_curry3();
      var map = require_map2();
      var sequence = require_sequence();
      var traverse = /* @__PURE__ */ _curry3(function traverse2(of, f, traversable) {
        return typeof traversable["fantasy-land/traverse"] === "function" ? traversable["fantasy-land/traverse"](f, of) : typeof traversable.traverse === "function" ? traversable.traverse(f, of) : sequence(of, map(f, traversable));
      });
      module.exports = traverse;
    }
  });

  // sdk/contracts/node_modules/ramda/src/trim.js
  var require_trim = __commonJS({
    "sdk/contracts/node_modules/ramda/src/trim.js"(exports, module) {
      var _curry1 = require_curry1();
      var ws = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
      var zeroWidth = "\u200B";
      var hasProtoTrim = typeof String.prototype.trim === "function";
      var trim = !hasProtoTrim || /* @__PURE__ */ ws.trim() || !/* @__PURE__ */ zeroWidth.trim() ? /* @__PURE__ */ _curry1(function trim2(str) {
        var beginRx = new RegExp("^[" + ws + "][" + ws + "]*");
        var endRx = new RegExp("[" + ws + "][" + ws + "]*$");
        return str.replace(beginRx, "").replace(endRx, "");
      }) : /* @__PURE__ */ _curry1(function trim2(str) {
        return str.trim();
      });
      module.exports = trim;
    }
  });

  // sdk/contracts/node_modules/ramda/src/tryCatch.js
  var require_tryCatch = __commonJS({
    "sdk/contracts/node_modules/ramda/src/tryCatch.js"(exports, module) {
      var _arity = require_arity();
      var _concat = require_concat();
      var _curry2 = require_curry2();
      var tryCatch = /* @__PURE__ */ _curry2(function _tryCatch(tryer, catcher) {
        return _arity(tryer.length, function() {
          try {
            return tryer.apply(this, arguments);
          } catch (e) {
            return catcher.apply(this, _concat([e], arguments));
          }
        });
      });
      module.exports = tryCatch;
    }
  });

  // sdk/contracts/node_modules/ramda/src/unapply.js
  var require_unapply = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unapply.js"(exports, module) {
      var _curry1 = require_curry1();
      var unapply = /* @__PURE__ */ _curry1(function unapply2(fn) {
        return function() {
          return fn(Array.prototype.slice.call(arguments, 0));
        };
      });
      module.exports = unapply;
    }
  });

  // sdk/contracts/node_modules/ramda/src/unary.js
  var require_unary = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unary.js"(exports, module) {
      var _curry1 = require_curry1();
      var nAry = require_nAry();
      var unary = /* @__PURE__ */ _curry1(function unary2(fn) {
        return nAry(1, fn);
      });
      module.exports = unary;
    }
  });

  // sdk/contracts/node_modules/ramda/src/uncurryN.js
  var require_uncurryN = __commonJS({
    "sdk/contracts/node_modules/ramda/src/uncurryN.js"(exports, module) {
      var _curry2 = require_curry2();
      var curryN = require_curryN2();
      var uncurryN = /* @__PURE__ */ _curry2(function uncurryN2(depth, fn) {
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

  // sdk/contracts/node_modules/ramda/src/unfold.js
  var require_unfold = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unfold.js"(exports, module) {
      var _curry2 = require_curry2();
      var unfold = /* @__PURE__ */ _curry2(function unfold2(fn, seed) {
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

  // sdk/contracts/node_modules/ramda/src/union.js
  var require_union = __commonJS({
    "sdk/contracts/node_modules/ramda/src/union.js"(exports, module) {
      var _concat = require_concat();
      var _curry2 = require_curry2();
      var compose = require_compose();
      var uniq = require_uniq();
      var union = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ compose(uniq, _concat)
      );
      module.exports = union;
    }
  });

  // sdk/contracts/node_modules/ramda/src/internal/_xuniqWith.js
  var require_xuniqWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/internal/_xuniqWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var _includesWith = require_includesWith();
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
          if (_includesWith(this.pred, input, this.items)) {
            return result;
          } else {
            this.items.push(input);
            return this.xf["@@transducer/step"](result, input);
          }
        };
        return XUniqWith2;
      }();
      var _xuniqWith = /* @__PURE__ */ _curry2(function _xuniqWith2(pred, xf) {
        return new XUniqWith(pred, xf);
      });
      module.exports = _xuniqWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/uniqWith.js
  var require_uniqWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/uniqWith.js"(exports, module) {
      var _curry2 = require_curry2();
      var _dispatchable = require_dispatchable();
      var _includesWith = require_includesWith();
      var _xuniqWith = require_xuniqWith();
      var uniqWith = /* @__PURE__ */ _curry2(
        /* @__PURE__ */ _dispatchable([], _xuniqWith, function(pred, list) {
          var idx = 0;
          var len = list.length;
          var result = [];
          var item;
          while (idx < len) {
            item = list[idx];
            if (!_includesWith(pred, item, result)) {
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

  // sdk/contracts/node_modules/ramda/src/unionWith.js
  var require_unionWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unionWith.js"(exports, module) {
      var _concat = require_concat();
      var _curry3 = require_curry3();
      var uniqWith = require_uniqWith();
      var unionWith = /* @__PURE__ */ _curry3(function unionWith2(pred, list1, list2) {
        return uniqWith(pred, _concat(list1, list2));
      });
      module.exports = unionWith;
    }
  });

  // sdk/contracts/node_modules/ramda/src/unless.js
  var require_unless = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unless.js"(exports, module) {
      var _curry3 = require_curry3();
      var unless = /* @__PURE__ */ _curry3(function unless2(pred, whenFalseFn, x) {
        return pred(x) ? x : whenFalseFn(x);
      });
      module.exports = unless;
    }
  });

  // sdk/contracts/node_modules/ramda/src/unnest.js
  var require_unnest = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unnest.js"(exports, module) {
      var _identity = require_identity();
      var chain = require_chain();
      var unnest = /* @__PURE__ */ chain(_identity);
      module.exports = unnest;
    }
  });

  // sdk/contracts/node_modules/ramda/src/until.js
  var require_until = __commonJS({
    "sdk/contracts/node_modules/ramda/src/until.js"(exports, module) {
      var _curry3 = require_curry3();
      var until = /* @__PURE__ */ _curry3(function until2(pred, fn, init) {
        var val = init;
        while (!pred(val)) {
          val = fn(val);
        }
        return val;
      });
      module.exports = until;
    }
  });

  // sdk/contracts/node_modules/ramda/src/unwind.js
  var require_unwind = __commonJS({
    "sdk/contracts/node_modules/ramda/src/unwind.js"(exports, module) {
      var _curry2 = require_curry2();
      var _isArray = require_isArray();
      var _map = require_map();
      var _assoc = require_assoc();
      var unwind = /* @__PURE__ */ _curry2(function(key, object) {
        if (!(key in object && _isArray(object[key]))) {
          return [object];
        }
        return _map(function(item) {
          return _assoc(key, item, object);
        }, object[key]);
      });
      module.exports = unwind;
    }
  });

  // sdk/contracts/node_modules/ramda/src/valuesIn.js
  var require_valuesIn = __commonJS({
    "sdk/contracts/node_modules/ramda/src/valuesIn.js"(exports, module) {
      var _curry1 = require_curry1();
      var valuesIn = /* @__PURE__ */ _curry1(function valuesIn2(obj) {
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

  // sdk/contracts/node_modules/ramda/src/view.js
  var require_view = __commonJS({
    "sdk/contracts/node_modules/ramda/src/view.js"(exports, module) {
      var _curry2 = require_curry2();
      var Const = function(x) {
        return {
          value: x,
          "fantasy-land/map": function() {
            return this;
          }
        };
      };
      var view = /* @__PURE__ */ _curry2(function view2(lens, x) {
        return lens(Const)(x).value;
      });
      module.exports = view;
    }
  });

  // sdk/contracts/node_modules/ramda/src/when.js
  var require_when = __commonJS({
    "sdk/contracts/node_modules/ramda/src/when.js"(exports, module) {
      var _curry3 = require_curry3();
      var when = /* @__PURE__ */ _curry3(function when2(pred, whenTrueFn, x) {
        return pred(x) ? whenTrueFn(x) : x;
      });
      module.exports = when;
    }
  });

  // sdk/contracts/node_modules/ramda/src/where.js
  var require_where = __commonJS({
    "sdk/contracts/node_modules/ramda/src/where.js"(exports, module) {
      var _curry2 = require_curry2();
      var _has = require_has();
      var where = /* @__PURE__ */ _curry2(function where2(spec, testObj) {
        for (var prop in spec) {
          if (_has(prop, spec) && !spec[prop](testObj[prop])) {
            return false;
          }
        }
        return true;
      });
      module.exports = where;
    }
  });

  // sdk/contracts/node_modules/ramda/src/whereAny.js
  var require_whereAny = __commonJS({
    "sdk/contracts/node_modules/ramda/src/whereAny.js"(exports, module) {
      var _curry2 = require_curry2();
      var _has = require_has();
      var whereAny = /* @__PURE__ */ _curry2(function whereAny2(spec, testObj) {
        for (var prop in spec) {
          if (_has(prop, spec) && spec[prop](testObj[prop])) {
            return true;
          }
        }
        return false;
      });
      module.exports = whereAny;
    }
  });

  // sdk/contracts/node_modules/ramda/src/whereEq.js
  var require_whereEq = __commonJS({
    "sdk/contracts/node_modules/ramda/src/whereEq.js"(exports, module) {
      var _curry2 = require_curry2();
      var equals = require_equals2();
      var map = require_map2();
      var where = require_where();
      var whereEq = /* @__PURE__ */ _curry2(function whereEq2(spec, testObj) {
        return where(map(equals, spec), testObj);
      });
      module.exports = whereEq;
    }
  });

  // sdk/contracts/node_modules/ramda/src/without.js
  var require_without = __commonJS({
    "sdk/contracts/node_modules/ramda/src/without.js"(exports, module) {
      var _includes = require_includes();
      var _curry2 = require_curry2();
      var flip = require_flip();
      var reject = require_reject();
      var without = /* @__PURE__ */ _curry2(function(xs, list) {
        return reject(flip(_includes)(xs), list);
      });
      module.exports = without;
    }
  });

  // sdk/contracts/node_modules/ramda/src/xor.js
  var require_xor = __commonJS({
    "sdk/contracts/node_modules/ramda/src/xor.js"(exports, module) {
      var _curry2 = require_curry2();
      var xor = /* @__PURE__ */ _curry2(function xor2(a, b) {
        return Boolean(!a ^ !b);
      });
      module.exports = xor;
    }
  });

  // sdk/contracts/node_modules/ramda/src/xprod.js
  var require_xprod = __commonJS({
    "sdk/contracts/node_modules/ramda/src/xprod.js"(exports, module) {
      var _curry2 = require_curry2();
      var xprod = /* @__PURE__ */ _curry2(function xprod2(a, b) {
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

  // sdk/contracts/node_modules/ramda/src/zip.js
  var require_zip = __commonJS({
    "sdk/contracts/node_modules/ramda/src/zip.js"(exports, module) {
      var _curry2 = require_curry2();
      var zip = /* @__PURE__ */ _curry2(function zip2(a, b) {
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

  // sdk/contracts/node_modules/ramda/src/zipObj.js
  var require_zipObj = __commonJS({
    "sdk/contracts/node_modules/ramda/src/zipObj.js"(exports, module) {
      var _curry2 = require_curry2();
      var zipObj = /* @__PURE__ */ _curry2(function zipObj2(keys, values) {
        var idx = 0;
        var len = Math.min(keys.length, values.length);
        var out = {};
        while (idx < len) {
          out[keys[idx]] = values[idx];
          idx += 1;
        }
        return out;
      });
      module.exports = zipObj;
    }
  });

  // sdk/contracts/node_modules/ramda/src/zipWith.js
  var require_zipWith = __commonJS({
    "sdk/contracts/node_modules/ramda/src/zipWith.js"(exports, module) {
      var _curry3 = require_curry3();
      var zipWith = /* @__PURE__ */ _curry3(function zipWith2(fn, a, b) {
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

  // sdk/contracts/node_modules/ramda/src/thunkify.js
  var require_thunkify = __commonJS({
    "sdk/contracts/node_modules/ramda/src/thunkify.js"(exports, module) {
      var curryN = require_curryN2();
      var _curry1 = require_curry1();
      var thunkify = /* @__PURE__ */ _curry1(function thunkify2(fn) {
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

  // sdk/contracts/node_modules/ramda/src/index.js
  var require_src = __commonJS({
    "sdk/contracts/node_modules/ramda/src/index.js"(exports, module) {
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

  // sdk/contracts/node_modules/fpjson-lang/dist/cjs/index.js
  var require_cjs = __commonJS({
    "sdk/contracts/node_modules/fpjson-lang/dist/cjs/index.js"(exports, module) {
      var m = Object.create;
      var o = Object.defineProperty;
      var v = Object.getOwnPropertyDescriptor;
      var A = Object.getOwnPropertyNames;
      var $ = Object.getPrototypeOf;
      var b = Object.prototype.hasOwnProperty;
      var j = (t, i) => {
        for (var R in i)
          o(t, R, { get: i[R], enumerable: true });
      };
      var g = (t, i, R, a) => {
        if (i && typeof i == "object" || typeof i == "function")
          for (let n of A(i))
            !b.call(t, n) && n !== R && o(t, n, { get: () => i[n], enumerable: !(a = v(i, n)) || a.enumerable });
        return t;
      };
      var N = (t, i, R) => (R = t != null ? m($(t)) : {}, g(i || !t || !t.__esModule ? o(R, "default", { value: t, enumerable: true }) : R, t));
      var O = (t) => g(o({}, "__esModule", { value: true }), t);
      var x = {};
      j(x, { default: () => w });
      module.exports = O(x);
      var e = N(require_src(), 1);
      var S = { Object, Array, String, Number, Boolean };
      var p = (t) => typeof t == "function";
      var r = (t, i = {}) => {
        if (e.isNil(t))
          return t;
        let R = e.curry((s) => (/^\$/.test(s) && (s = a(e.tail(s), true)), e.path(s.split("."))(i))), a = e.curry((s, u) => R(s)), n = e.curry((s, u) => {
          let f = i;
          /^\$/.test(s) && (s = a(e.tail(s), true));
          let _2 = s.split(".");
          for (let y of e.init(_2))
            e.isNil(f[y]) && (f[y] = {}), f = f[y];
          return f[e.last(_2)] = u, u;
        }), l = null;
        if (p(t[0])) {
          let s = e.tail(t);
          l = t[0](...s);
        } else
          e.is(Array)(t) && t.length === 1 && t[0] === "__" ? l = e.__ : t[0] === "typ" ? l = S[t[1]] : t[0] === "reg" ? l = new RegExp(...e.tail(t)) : e.is(Array)(t) && (e.includes(t[0])(["let", "var", "$"]) || p(e[t[0]])) ? (l = e.compose(e.ifElse(e.o(e.gt(e.__, 0), e.length), e.apply(t[0] === "$" ? R : t[0] === "var" ? a : t[0] === "let" ? n : e[t[0]]), e.always(e[t[0]])), e.map((s) => r(s, i)), e.tail)(t), l = typeof l > "u" ? [] : l) : e.is(Object)(t) && e.is(String)(t.var) ? l = e.path(t.var.split("."))(i) : e.is(Array)(t) || e.is(Object)(t) ? l = e.map((s) => r(s, i))(t) : l = t;
        let c = null;
        return e.is(Array)(l) && e.is(String)(l[0]) && l[0] === "[]" ? c = e.tail(l) : c = p(l[0]) ? r(l, i) : l, c;
      };
      var w = r;
    }
  });

  // sdk/contracts/node_modules/json-logic-js/logic.js
  var require_logic = __commonJS({
    "sdk/contracts/node_modules/json-logic-js/logic.js"(exports, module) {
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
        var jsonLogic = {};
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
            return jsonLogic.truthy(a);
          },
          "!": function(a) {
            return !jsonLogic.truthy(a);
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
            var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var value = jsonLogic.apply({ "var": key }, this);
              if (value === null || value === "") {
                missing.push(key);
              }
            }
            return missing;
          },
          "missing_some": function(need_count, options) {
            var are_missing = jsonLogic.apply({ "missing": options }, this);
            if (options.length - are_missing.length >= need_count) {
              return [];
            } else {
              return are_missing;
            }
          }
        };
        jsonLogic.is_logic = function(logic) {
          return typeof logic === "object" && logic !== null && !Array.isArray(logic) && Object.keys(logic).length === 1;
        };
        jsonLogic.truthy = function(value) {
          if (Array.isArray(value) && value.length === 0) {
            return false;
          }
          return !!value;
        };
        jsonLogic.get_operator = function(logic) {
          return Object.keys(logic)[0];
        };
        jsonLogic.get_values = function(logic) {
          return logic[jsonLogic.get_operator(logic)];
        };
        jsonLogic.apply = function(logic, data) {
          if (Array.isArray(logic)) {
            return logic.map(function(l) {
              return jsonLogic.apply(l, data);
            });
          }
          if (!jsonLogic.is_logic(logic)) {
            return logic;
          }
          var op = jsonLogic.get_operator(logic);
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
              if (jsonLogic.truthy(jsonLogic.apply(values[i], data))) {
                return jsonLogic.apply(values[i + 1], data);
              }
            }
            if (values.length === i + 1) {
              return jsonLogic.apply(values[i], data);
            }
            return null;
          } else if (op === "and") {
            for (i = 0; i < values.length; i += 1) {
              current = jsonLogic.apply(values[i], data);
              if (!jsonLogic.truthy(current)) {
                return current;
              }
            }
            return current;
          } else if (op === "or") {
            for (i = 0; i < values.length; i += 1) {
              current = jsonLogic.apply(values[i], data);
              if (jsonLogic.truthy(current)) {
                return current;
              }
            }
            return current;
          } else if (op === "filter") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData)) {
              return [];
            }
            return scopedData.filter(function(datum) {
              return jsonLogic.truthy(jsonLogic.apply(scopedLogic, datum));
            });
          } else if (op === "map") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData)) {
              return [];
            }
            return scopedData.map(function(datum) {
              return jsonLogic.apply(scopedLogic, datum);
            });
          } else if (op === "reduce") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            initial = typeof values[2] !== "undefined" ? values[2] : null;
            if (!Array.isArray(scopedData)) {
              return initial;
            }
            return scopedData.reduce(
              function(accumulator, current2) {
                return jsonLogic.apply(
                  scopedLogic,
                  { current: current2, accumulator }
                );
              },
              initial
            );
          } else if (op === "all") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return false;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (!jsonLogic.truthy(jsonLogic.apply(scopedLogic, scopedData[i]))) {
                return false;
              }
            }
            return true;
          } else if (op === "none") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return true;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (jsonLogic.truthy(jsonLogic.apply(scopedLogic, scopedData[i]))) {
                return false;
              }
            }
            return true;
          } else if (op === "some") {
            scopedData = jsonLogic.apply(values[0], data);
            scopedLogic = values[1];
            if (!Array.isArray(scopedData) || !scopedData.length) {
              return false;
            }
            for (i = 0; i < scopedData.length; i += 1) {
              if (jsonLogic.truthy(jsonLogic.apply(scopedLogic, scopedData[i]))) {
                return true;
              }
            }
            return false;
          }
          values = values.map(function(val) {
            return jsonLogic.apply(val, data);
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
        jsonLogic.uses_data = function(logic) {
          var collection = [];
          if (jsonLogic.is_logic(logic)) {
            var op = jsonLogic.get_operator(logic);
            var values = logic[op];
            if (!Array.isArray(values)) {
              values = [values];
            }
            if (op === "var") {
              collection.push(values[0]);
            } else {
              values.forEach(function(val) {
                collection.push.apply(collection, jsonLogic.uses_data(val));
              });
            }
          }
          return arrayUnique(collection);
        };
        jsonLogic.add_operation = function(name, code) {
          operations[name] = code;
        };
        jsonLogic.rm_operation = function(name) {
          delete operations[name];
        };
        jsonLogic.rule_like = function(rule, pattern) {
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
            return Array.isArray(rule) && !jsonLogic.is_logic(rule);
          }
          if (jsonLogic.is_logic(pattern)) {
            if (jsonLogic.is_logic(rule)) {
              var pattern_op = jsonLogic.get_operator(pattern);
              var rule_op = jsonLogic.get_operator(rule);
              if (pattern_op === "@" || pattern_op === rule_op) {
                return jsonLogic.rule_like(
                  jsonLogic.get_values(rule, false),
                  jsonLogic.get_values(pattern, false)
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
                if (!jsonLogic.rule_like(rule[i], pattern[i])) {
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
        return jsonLogic;
      });
    }
  });

  // sdk/contracts/weavedb/lib/pure.js
  var require_pure = __commonJS({
    "sdk/contracts/weavedb/lib/pure.js"(exports, module) {
      var isValidName = (str) => /^[^\/]+$/.test(str) && !/^__.*__+$/.test(str) && !/^\.{1,2}$/.test(str) && Buffer.byteLength(str, "utf8") <= 1500;
      module.exports = { isValidName };
    }
  });

  // node_modules/punycode/punycode.js
  var require_punycode = __commonJS({
    "node_modules/punycode/punycode.js"(exports, module) {
      (function(root) {
        var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
        var freeModule = typeof module == "object" && module && !module.nodeType && module;
        var freeGlobal = typeof global == "object" && global;
        if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
          root = freeGlobal;
        }
        var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
          "overflow": "Overflow: input needs wider integers to process",
          "not-basic": "Illegal input >= 0x80 (not a basic code point)",
          "invalid-input": "Invalid input"
        }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;
        function error(type) {
          throw RangeError(errors[type]);
        }
        function map(array, fn) {
          var length = array.length;
          var result = [];
          while (length--) {
            result[length] = fn(array[length]);
          }
          return result;
        }
        function mapDomain(string, fn) {
          var parts = string.split("@");
          var result = "";
          if (parts.length > 1) {
            result = parts[0] + "@";
            string = parts[1];
          }
          string = string.replace(regexSeparators, ".");
          var labels = string.split(".");
          var encoded = map(labels, fn).join(".");
          return result + encoded;
        }
        function ucs2decode(string) {
          var output = [], counter = 0, length = string.length, value, extra;
          while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 55296 && value <= 56319 && counter < length) {
              extra = string.charCodeAt(counter++);
              if ((extra & 64512) == 56320) {
                output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
              } else {
                output.push(value);
                counter--;
              }
            } else {
              output.push(value);
            }
          }
          return output;
        }
        function ucs2encode(array) {
          return map(array, function(value) {
            var output = "";
            if (value > 65535) {
              value -= 65536;
              output += stringFromCharCode(value >>> 10 & 1023 | 55296);
              value = 56320 | value & 1023;
            }
            output += stringFromCharCode(value);
            return output;
          }).join("");
        }
        function basicToDigit(codePoint) {
          if (codePoint - 48 < 10) {
            return codePoint - 22;
          }
          if (codePoint - 65 < 26) {
            return codePoint - 65;
          }
          if (codePoint - 97 < 26) {
            return codePoint - 97;
          }
          return base;
        }
        function digitToBasic(digit, flag) {
          return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
        }
        function adapt(delta, numPoints, firstTime) {
          var k = 0;
          delta = firstTime ? floor(delta / damp) : delta >> 1;
          delta += floor(delta / numPoints);
          for (; delta > baseMinusTMin * tMax >> 1; k += base) {
            delta = floor(delta / baseMinusTMin);
          }
          return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
        }
        function decode(input) {
          var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
          basic = input.lastIndexOf(delimiter);
          if (basic < 0) {
            basic = 0;
          }
          for (j = 0; j < basic; ++j) {
            if (input.charCodeAt(j) >= 128) {
              error("not-basic");
            }
            output.push(input.charCodeAt(j));
          }
          for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
            for (oldi = i, w = 1, k = base; ; k += base) {
              if (index >= inputLength) {
                error("invalid-input");
              }
              digit = basicToDigit(input.charCodeAt(index++));
              if (digit >= base || digit > floor((maxInt - i) / w)) {
                error("overflow");
              }
              i += digit * w;
              t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (digit < t) {
                break;
              }
              baseMinusT = base - t;
              if (w > floor(maxInt / baseMinusT)) {
                error("overflow");
              }
              w *= baseMinusT;
            }
            out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);
            if (floor(i / out) > maxInt - n) {
              error("overflow");
            }
            n += floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
          }
          return ucs2encode(output);
        }
        function encode(input) {
          var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
          input = ucs2decode(input);
          inputLength = input.length;
          n = initialN;
          delta = 0;
          bias = initialBias;
          for (j = 0; j < inputLength; ++j) {
            currentValue = input[j];
            if (currentValue < 128) {
              output.push(stringFromCharCode(currentValue));
            }
          }
          handledCPCount = basicLength = output.length;
          if (basicLength) {
            output.push(delimiter);
          }
          while (handledCPCount < inputLength) {
            for (m = maxInt, j = 0; j < inputLength; ++j) {
              currentValue = input[j];
              if (currentValue >= n && currentValue < m) {
                m = currentValue;
              }
            }
            handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
              error("overflow");
            }
            delta += (m - n) * handledCPCountPlusOne;
            n = m;
            for (j = 0; j < inputLength; ++j) {
              currentValue = input[j];
              if (currentValue < n && ++delta > maxInt) {
                error("overflow");
              }
              if (currentValue == n) {
                for (q = delta, k = base; ; k += base) {
                  t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                  if (q < t) {
                    break;
                  }
                  qMinusT = q - t;
                  baseMinusT = base - t;
                  output.push(
                    stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
                  );
                  q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                delta = 0;
                ++handledCPCount;
              }
            }
            ++delta;
            ++n;
          }
          return output.join("");
        }
        function toUnicode(input) {
          return mapDomain(input, function(string) {
            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
          });
        }
        function toASCII(input) {
          return mapDomain(input, function(string) {
            return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
          });
        }
        punycode = {
          "version": "1.3.2",
          "ucs2": {
            "decode": ucs2decode,
            "encode": ucs2encode
          },
          "decode": decode,
          "encode": encode,
          "toASCII": toASCII,
          "toUnicode": toUnicode
        };
        if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
          define("punycode", function() {
            return punycode;
          });
        } else if (freeExports && freeModule) {
          if (module.exports == freeExports) {
            freeModule.exports = punycode;
          } else {
            for (key in punycode) {
              punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
            }
          }
        } else {
          root.punycode = punycode;
        }
      })(exports);
    }
  });

  // node_modules/url/util.js
  var require_util = __commonJS({
    "node_modules/url/util.js"(exports, module) {
      "use strict";
      module.exports = {
        isString: function(arg) {
          return typeof arg === "string";
        },
        isObject: function(arg) {
          return typeof arg === "object" && arg !== null;
        },
        isNull: function(arg) {
          return arg === null;
        },
        isNullOrUndefined: function(arg) {
          return arg == null;
        }
      };
    }
  });

  // node_modules/querystring/decode.js
  var require_decode = __commonJS({
    "node_modules/querystring/decode.js"(exports, module) {
      "use strict";
      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      module.exports = function(qs, sep, eq, options) {
        sep = sep || "&";
        eq = eq || "=";
        var obj = {};
        if (typeof qs !== "string" || qs.length === 0) {
          return obj;
        }
        var regexp = /\+/g;
        qs = qs.split(sep);
        var maxKeys = 1e3;
        if (options && typeof options.maxKeys === "number") {
          maxKeys = options.maxKeys;
        }
        var len = qs.length;
        if (maxKeys > 0 && len > maxKeys) {
          len = maxKeys;
        }
        for (var i = 0; i < len; ++i) {
          var x = qs[i].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
          if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
          } else {
            kstr = x;
            vstr = "";
          }
          k = decodeURIComponent(kstr);
          v = decodeURIComponent(vstr);
          if (!hasOwnProperty(obj, k)) {
            obj[k] = v;
          } else if (Array.isArray(obj[k])) {
            obj[k].push(v);
          } else {
            obj[k] = [obj[k], v];
          }
        }
        return obj;
      };
    }
  });

  // node_modules/querystring/encode.js
  var require_encode = __commonJS({
    "node_modules/querystring/encode.js"(exports, module) {
      "use strict";
      var stringifyPrimitive = function(v) {
        switch (typeof v) {
          case "string":
            return v;
          case "boolean":
            return v ? "true" : "false";
          case "number":
            return isFinite(v) ? v : "";
          default:
            return "";
        }
      };
      module.exports = function(obj, sep, eq, name) {
        sep = sep || "&";
        eq = eq || "=";
        if (obj === null) {
          obj = void 0;
        }
        if (typeof obj === "object") {
          return Object.keys(obj).map(function(k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
            if (Array.isArray(obj[k])) {
              return obj[k].map(function(v) {
                return ks + encodeURIComponent(stringifyPrimitive(v));
              }).join(sep);
            } else {
              return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
          }).join(sep);
        }
        if (!name)
          return "";
        return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
      };
    }
  });

  // node_modules/querystring/index.js
  var require_querystring = __commonJS({
    "node_modules/querystring/index.js"(exports) {
      "use strict";
      exports.decode = exports.parse = require_decode();
      exports.encode = exports.stringify = require_encode();
    }
  });

  // node_modules/url/url.js
  var require_url = __commonJS({
    "node_modules/url/url.js"(exports) {
      "use strict";
      var punycode = require_punycode();
      var util = require_util();
      exports.parse = urlParse;
      exports.resolve = urlResolve;
      exports.resolveObject = urlResolveObject;
      exports.format = urlFormat;
      exports.Url = Url;
      function Url() {
        this.protocol = null;
        this.slashes = null;
        this.auth = null;
        this.host = null;
        this.port = null;
        this.hostname = null;
        this.hash = null;
        this.search = null;
        this.query = null;
        this.pathname = null;
        this.path = null;
        this.href = null;
      }
      var protocolPattern = /^([a-z0-9.+-]+:)/i;
      var portPattern = /:[0-9]*$/;
      var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
      var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
      var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
      var autoEscape = ["'"].concat(unwise);
      var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
      var hostEndingChars = ["/", "?", "#"];
      var hostnameMaxLen = 255;
      var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
      var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
      var unsafeProtocol = {
        "javascript": true,
        "javascript:": true
      };
      var hostlessProtocol = {
        "javascript": true,
        "javascript:": true
      };
      var slashedProtocol = {
        "http": true,
        "https": true,
        "ftp": true,
        "gopher": true,
        "file": true,
        "http:": true,
        "https:": true,
        "ftp:": true,
        "gopher:": true,
        "file:": true
      };
      var querystring = require_querystring();
      function urlParse(url, parseQueryString, slashesDenoteHost) {
        if (url && util.isObject(url) && url instanceof Url)
          return url;
        var u = new Url();
        u.parse(url, parseQueryString, slashesDenoteHost);
        return u;
      }
      Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
        if (!util.isString(url)) {
          throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
        }
        var queryIndex = url.indexOf("?"), splitter = queryIndex !== -1 && queryIndex < url.indexOf("#") ? "?" : "#", uSplit = url.split(splitter), slashRegex = /\\/g;
        uSplit[0] = uSplit[0].replace(slashRegex, "/");
        url = uSplit.join(splitter);
        var rest = url;
        rest = rest.trim();
        if (!slashesDenoteHost && url.split("#").length === 1) {
          var simplePath = simplePathPattern.exec(rest);
          if (simplePath) {
            this.path = rest;
            this.href = rest;
            this.pathname = simplePath[1];
            if (simplePath[2]) {
              this.search = simplePath[2];
              if (parseQueryString) {
                this.query = querystring.parse(this.search.substr(1));
              } else {
                this.query = this.search.substr(1);
              }
            } else if (parseQueryString) {
              this.search = "";
              this.query = {};
            }
            return this;
          }
        }
        var proto = protocolPattern.exec(rest);
        if (proto) {
          proto = proto[0];
          var lowerProto = proto.toLowerCase();
          this.protocol = lowerProto;
          rest = rest.substr(proto.length);
        }
        if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
          var slashes = rest.substr(0, 2) === "//";
          if (slashes && !(proto && hostlessProtocol[proto])) {
            rest = rest.substr(2);
            this.slashes = true;
          }
        }
        if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
          var hostEnd = -1;
          for (var i = 0; i < hostEndingChars.length; i++) {
            var hec = rest.indexOf(hostEndingChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
              hostEnd = hec;
          }
          var auth, atSign;
          if (hostEnd === -1) {
            atSign = rest.lastIndexOf("@");
          } else {
            atSign = rest.lastIndexOf("@", hostEnd);
          }
          if (atSign !== -1) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
          }
          hostEnd = -1;
          for (var i = 0; i < nonHostChars.length; i++) {
            var hec = rest.indexOf(nonHostChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
              hostEnd = hec;
          }
          if (hostEnd === -1)
            hostEnd = rest.length;
          this.host = rest.slice(0, hostEnd);
          rest = rest.slice(hostEnd);
          this.parseHost();
          this.hostname = this.hostname || "";
          var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
          if (!ipv6Hostname) {
            var hostparts = this.hostname.split(/\./);
            for (var i = 0, l = hostparts.length; i < l; i++) {
              var part = hostparts[i];
              if (!part)
                continue;
              if (!part.match(hostnamePartPattern)) {
                var newpart = "";
                for (var j = 0, k = part.length; j < k; j++) {
                  if (part.charCodeAt(j) > 127) {
                    newpart += "x";
                  } else {
                    newpart += part[j];
                  }
                }
                if (!newpart.match(hostnamePartPattern)) {
                  var validParts = hostparts.slice(0, i);
                  var notHost = hostparts.slice(i + 1);
                  var bit = part.match(hostnamePartStart);
                  if (bit) {
                    validParts.push(bit[1]);
                    notHost.unshift(bit[2]);
                  }
                  if (notHost.length) {
                    rest = "/" + notHost.join(".") + rest;
                  }
                  this.hostname = validParts.join(".");
                  break;
                }
              }
            }
          }
          if (this.hostname.length > hostnameMaxLen) {
            this.hostname = "";
          } else {
            this.hostname = this.hostname.toLowerCase();
          }
          if (!ipv6Hostname) {
            this.hostname = punycode.toASCII(this.hostname);
          }
          var p = this.port ? ":" + this.port : "";
          var h = this.hostname || "";
          this.host = h + p;
          this.href += this.host;
          if (ipv6Hostname) {
            this.hostname = this.hostname.substr(1, this.hostname.length - 2);
            if (rest[0] !== "/") {
              rest = "/" + rest;
            }
          }
        }
        if (!unsafeProtocol[lowerProto]) {
          for (var i = 0, l = autoEscape.length; i < l; i++) {
            var ae = autoEscape[i];
            if (rest.indexOf(ae) === -1)
              continue;
            var esc = encodeURIComponent(ae);
            if (esc === ae) {
              esc = escape(ae);
            }
            rest = rest.split(ae).join(esc);
          }
        }
        var hash = rest.indexOf("#");
        if (hash !== -1) {
          this.hash = rest.substr(hash);
          rest = rest.slice(0, hash);
        }
        var qm = rest.indexOf("?");
        if (qm !== -1) {
          this.search = rest.substr(qm);
          this.query = rest.substr(qm + 1);
          if (parseQueryString) {
            this.query = querystring.parse(this.query);
          }
          rest = rest.slice(0, qm);
        } else if (parseQueryString) {
          this.search = "";
          this.query = {};
        }
        if (rest)
          this.pathname = rest;
        if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
          this.pathname = "/";
        }
        if (this.pathname || this.search) {
          var p = this.pathname || "";
          var s = this.search || "";
          this.path = p + s;
        }
        this.href = this.format();
        return this;
      };
      function urlFormat(obj) {
        if (util.isString(obj))
          obj = urlParse(obj);
        if (!(obj instanceof Url))
          return Url.prototype.format.call(obj);
        return obj.format();
      }
      Url.prototype.format = function() {
        var auth = this.auth || "";
        if (auth) {
          auth = encodeURIComponent(auth);
          auth = auth.replace(/%3A/i, ":");
          auth += "@";
        }
        var protocol = this.protocol || "", pathname = this.pathname || "", hash = this.hash || "", host = false, query = "";
        if (this.host) {
          host = auth + this.host;
        } else if (this.hostname) {
          host = auth + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]");
          if (this.port) {
            host += ":" + this.port;
          }
        }
        if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
          query = querystring.stringify(this.query);
        }
        var search = this.search || query && "?" + query || "";
        if (protocol && protocol.substr(-1) !== ":")
          protocol += ":";
        if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
          host = "//" + (host || "");
          if (pathname && pathname.charAt(0) !== "/")
            pathname = "/" + pathname;
        } else if (!host) {
          host = "";
        }
        if (hash && hash.charAt(0) !== "#")
          hash = "#" + hash;
        if (search && search.charAt(0) !== "?")
          search = "?" + search;
        pathname = pathname.replace(/[?#]/g, function(match) {
          return encodeURIComponent(match);
        });
        search = search.replace("#", "%23");
        return protocol + host + pathname + search + hash;
      };
      function urlResolve(source, relative) {
        return urlParse(source, false, true).resolve(relative);
      }
      Url.prototype.resolve = function(relative) {
        return this.resolveObject(urlParse(relative, false, true)).format();
      };
      function urlResolveObject(source, relative) {
        if (!source)
          return relative;
        return urlParse(source, false, true).resolveObject(relative);
      }
      Url.prototype.resolveObject = function(relative) {
        if (util.isString(relative)) {
          var rel = new Url();
          rel.parse(relative, false, true);
          relative = rel;
        }
        var result = new Url();
        var tkeys = Object.keys(this);
        for (var tk = 0; tk < tkeys.length; tk++) {
          var tkey = tkeys[tk];
          result[tkey] = this[tkey];
        }
        result.hash = relative.hash;
        if (relative.href === "") {
          result.href = result.format();
          return result;
        }
        if (relative.slashes && !relative.protocol) {
          var rkeys = Object.keys(relative);
          for (var rk = 0; rk < rkeys.length; rk++) {
            var rkey = rkeys[rk];
            if (rkey !== "protocol")
              result[rkey] = relative[rkey];
          }
          if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
            result.path = result.pathname = "/";
          }
          result.href = result.format();
          return result;
        }
        if (relative.protocol && relative.protocol !== result.protocol) {
          if (!slashedProtocol[relative.protocol]) {
            var keys = Object.keys(relative);
            for (var v = 0; v < keys.length; v++) {
              var k = keys[v];
              result[k] = relative[k];
            }
            result.href = result.format();
            return result;
          }
          result.protocol = relative.protocol;
          if (!relative.host && !hostlessProtocol[relative.protocol]) {
            var relPath = (relative.pathname || "").split("/");
            while (relPath.length && !(relative.host = relPath.shift()))
              ;
            if (!relative.host)
              relative.host = "";
            if (!relative.hostname)
              relative.hostname = "";
            if (relPath[0] !== "")
              relPath.unshift("");
            if (relPath.length < 2)
              relPath.unshift("");
            result.pathname = relPath.join("/");
          } else {
            result.pathname = relative.pathname;
          }
          result.search = relative.search;
          result.query = relative.query;
          result.host = relative.host || "";
          result.auth = relative.auth;
          result.hostname = relative.hostname || relative.host;
          result.port = relative.port;
          if (result.pathname || result.search) {
            var p = result.pathname || "";
            var s = result.search || "";
            result.path = p + s;
          }
          result.slashes = result.slashes || relative.slashes;
          result.href = result.format();
          return result;
        }
        var isSourceAbs = result.pathname && result.pathname.charAt(0) === "/", isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === "/", mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname, removeAllDots = mustEndAbs, srcPath = result.pathname && result.pathname.split("/") || [], relPath = relative.pathname && relative.pathname.split("/") || [], psychotic = result.protocol && !slashedProtocol[result.protocol];
        if (psychotic) {
          result.hostname = "";
          result.port = null;
          if (result.host) {
            if (srcPath[0] === "")
              srcPath[0] = result.host;
            else
              srcPath.unshift(result.host);
          }
          result.host = "";
          if (relative.protocol) {
            relative.hostname = null;
            relative.port = null;
            if (relative.host) {
              if (relPath[0] === "")
                relPath[0] = relative.host;
              else
                relPath.unshift(relative.host);
            }
            relative.host = null;
          }
          mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
        }
        if (isRelAbs) {
          result.host = relative.host || relative.host === "" ? relative.host : result.host;
          result.hostname = relative.hostname || relative.hostname === "" ? relative.hostname : result.hostname;
          result.search = relative.search;
          result.query = relative.query;
          srcPath = relPath;
        } else if (relPath.length) {
          if (!srcPath)
            srcPath = [];
          srcPath.pop();
          srcPath = srcPath.concat(relPath);
          result.search = relative.search;
          result.query = relative.query;
        } else if (!util.isNullOrUndefined(relative.search)) {
          if (psychotic) {
            result.hostname = result.host = srcPath.shift();
            var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
            if (authInHost) {
              result.auth = authInHost.shift();
              result.host = result.hostname = authInHost.shift();
            }
          }
          result.search = relative.search;
          result.query = relative.query;
          if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
            result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "");
          }
          result.href = result.format();
          return result;
        }
        if (!srcPath.length) {
          result.pathname = null;
          if (result.search) {
            result.path = "/" + result.search;
          } else {
            result.path = null;
          }
          result.href = result.format();
          return result;
        }
        var last = srcPath.slice(-1)[0];
        var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === "." || last === "..") || last === "";
        var up = 0;
        for (var i = srcPath.length; i >= 0; i--) {
          last = srcPath[i];
          if (last === ".") {
            srcPath.splice(i, 1);
          } else if (last === "..") {
            srcPath.splice(i, 1);
            up++;
          } else if (up) {
            srcPath.splice(i, 1);
            up--;
          }
        }
        if (!mustEndAbs && !removeAllDots) {
          for (; up--; up) {
            srcPath.unshift("..");
          }
        }
        if (mustEndAbs && srcPath[0] !== "" && (!srcPath[0] || srcPath[0].charAt(0) !== "/")) {
          srcPath.unshift("");
        }
        if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") {
          srcPath.push("");
        }
        var isAbsolute = srcPath[0] === "" || srcPath[0] && srcPath[0].charAt(0) === "/";
        if (psychotic) {
          result.hostname = result.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
          var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
          if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
          }
        }
        mustEndAbs = mustEndAbs || result.host && srcPath.length;
        if (mustEndAbs && !isAbsolute) {
          srcPath.unshift("");
        }
        if (!srcPath.length) {
          result.pathname = null;
          result.path = null;
        } else {
          result.pathname = srcPath.join("/");
        }
        if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
          result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "");
        }
        result.auth = relative.auth || result.auth;
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
      };
      Url.prototype.parseHost = function() {
        var host = this.host;
        var port = portPattern.exec(host);
        if (port) {
          port = port[0];
          if (port !== ":") {
            this.port = port.substr(1);
          }
          host = host.substr(0, host.length - port.length);
        }
        if (host)
          this.hostname = host;
      };
    }
  });

  // sdk/contracts/weavedb/lib/jsonschema/helpers.js
  var require_helpers = __commonJS({
    "sdk/contracts/weavedb/lib/jsonschema/helpers.js"(exports, module) {
      "use strict";
      var uri = require_url();
      var ValidationError = exports.ValidationError = function ValidationError2(message, instance, schema, path, name, argument) {
        if (Array.isArray(path)) {
          this.path = path;
          this.property = path.reduce(function(sum, item) {
            return sum + makeSuffix(item);
          }, "instance");
        } else if (path !== void 0) {
          this.property = path;
        }
        if (message) {
          this.message = message;
        }
        if (schema) {
          var id = schema.$id || schema.id;
          this.schema = id || schema;
        }
        if (instance !== void 0) {
          this.instance = instance;
        }
        this.name = name;
        this.argument = argument;
        this.stack = this.toString();
      };
      ValidationError.prototype.toString = function toString() {
        return this.property + " " + this.message;
      };
      var ValidatorResult = exports.ValidatorResult = function ValidatorResult2(instance, schema, options, ctx) {
        this.instance = instance;
        this.schema = schema;
        this.options = options;
        this.path = ctx.path;
        this.propertyPath = ctx.propertyPath;
        this.errors = [];
        this.throwError = options && options.throwError;
        this.throwFirst = options && options.throwFirst;
        this.throwAll = options && options.throwAll;
        this.disableFormat = options && options.disableFormat === true;
      };
      ValidatorResult.prototype.addError = function addError(detail) {
        var err;
        if (typeof detail == "string") {
          err = new ValidationError(detail, this.instance, this.schema, this.path);
        } else {
          if (!detail)
            throw new Error("Missing error detail");
          if (!detail.message)
            throw new Error("Missing error message");
          if (!detail.name)
            throw new Error("Missing validator type");
          err = new ValidationError(
            detail.message,
            this.instance,
            this.schema,
            this.path,
            detail.name,
            detail.argument
          );
        }
        this.errors.push(err);
        if (this.throwFirst) {
          throw new ValidatorResultError(this);
        } else if (this.throwError) {
          throw err;
        }
        return err;
      };
      ValidatorResult.prototype.importErrors = function importErrors(res) {
        if (typeof res == "string" || res && res.validatorType) {
          this.addError(res);
        } else if (res && res.errors) {
          this.errors = this.errors.concat(res.errors);
        }
      };
      function stringizer(v, i) {
        return i + ": " + v.toString() + "\n";
      }
      ValidatorResult.prototype.toString = function toString(res) {
        return this.errors.map(stringizer).join("");
      };
      Object.defineProperty(ValidatorResult.prototype, "valid", {
        get: function() {
          return !this.errors.length;
        }
      });
      module.exports.ValidatorResultError = ValidatorResultError;
      function ValidatorResultError(result) {
        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, ValidatorResultError);
        }
        this.instance = result.instance;
        this.schema = result.schema;
        this.options = result.options;
        this.errors = result.errors;
      }
      ValidatorResultError.prototype = new Error();
      ValidatorResultError.prototype.constructor = ValidatorResultError;
      ValidatorResultError.prototype.name = "Validation Error";
      var SchemaError = exports.SchemaError = function SchemaError2(msg, schema) {
        this.message = msg;
        this.schema = schema;
        Error.call(this, msg);
        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, SchemaError2);
        }
      };
      SchemaError.prototype = Object.create(Error.prototype, {
        constructor: { value: SchemaError, enumerable: false },
        name: { value: "SchemaError", enumerable: false }
      });
      var SchemaContext = exports.SchemaContext = function SchemaContext2(schema, options, path, base, schemas) {
        this.schema = schema;
        this.options = options;
        if (Array.isArray(path)) {
          this.path = path;
          this.propertyPath = path.reduce(function(sum, item) {
            return sum + makeSuffix(item);
          }, "instance");
        } else {
          this.propertyPath = path;
        }
        this.base = base;
        this.schemas = schemas;
      };
      SchemaContext.prototype.resolve = function resolve(target) {
        return uri.resolve(this.base, target);
      };
      SchemaContext.prototype.makeChild = function makeChild(schema, propertyName) {
        var path = propertyName === void 0 ? this.path : this.path.concat([propertyName]);
        var id = schema.$id || schema.id;
        var base = uri.resolve(this.base, id || "");
        var ctx = new SchemaContext(
          schema,
          this.options,
          path,
          base,
          Object.create(this.schemas)
        );
        if (id && !ctx.schemas[base]) {
          ctx.schemas[base] = schema;
        }
        return ctx;
      };
      var FORMAT_REGEXPS = exports.FORMAT_REGEXPS = {
        "date-time": /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])[tT ](2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])(\.\d+)?([zZ]|[+-]([0-5][0-9]):(60|[0-5][0-9]))$/,
        date: /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])$/,
        time: /^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/,
        duration: /P(T\d+(H(\d+M(\d+S)?)?|M(\d+S)?|S)|\d+(D|M(\d+D)?|Y(\d+M(\d+D)?)?)(T\d+(H(\d+M(\d+S)?)?|M(\d+S)?|S))?|\d+W)/i,
        email: /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/,
        "idn-email": /^("(?:[!#-\[\]-\u{10FFFF}]|\\[\t -\u{10FFFF}])*"|[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}](?:\.?[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}])*)@([!#-'*+\-/-9=?A-Z\^-\u{10FFFF}](?:\.?[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}])*|\[[!-Z\^-\u{10FFFF}]*\])$/u,
        "ip-address": /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        ipv6: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
        uri: /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s]*$/,
        "uri-reference": /^(((([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|([A-Za-z][+\-.0-9A-Za-z]*:?)?)|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|(\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?)?))#(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|(([A-Za-z][+\-.0-9A-Za-z]*)?%[0-9A-Fa-f]{2}|[!$&-.0-9;=@_~]|[A-Za-z][+\-.0-9A-Za-z]*[!$&-*,;=@_~])(%[0-9A-Fa-f]{2}|[!$&-.0-9;=@-Z_a-z~])*((([/?](%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*)?#|[/?])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*)?|([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~])*|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~])+(:\d*)?|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?:\d*|\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~]+)?|[.0-:A-Fa-f]+)\])?)?|[A-Za-z][+\-.0-9A-Za-z]*:?)?$/,
        iri: /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s]*$/,
        "iri-reference": /^(((([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~-\u{10FFFF}]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*|([A-Za-z][+\-.0-9A-Za-z]*:?)?)|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~-\u{10FFFF}])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~-\u{10FFFF}]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~-\u{10FFFF}])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*|(\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~-\u{10FFFF}])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~-\u{10FFFF}]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?)?))#(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*|(([A-Za-z][+\-.0-9A-Za-z]*)?%[0-9A-Fa-f]{2}|[!$&-.0-9;=@_~-\u{10FFFF}]|[A-Za-z][+\-.0-9A-Za-z]*[!$&-*,;=@_~-\u{10FFFF}])(%[0-9A-Fa-f]{2}|[!$&-.0-9;=@-Z_a-z~-\u{10FFFF}])*((([/?](%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*)?#|[/?])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*)?|([A-Za-z][+\-.0-9A-Za-z]*(:%[0-9A-Fa-f]{2}|:[!$&-.0-;=?-Z_a-z~-\u{10FFFF}]|[/?])|\?)(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*|([A-Za-z][+\-.0-9A-Za-z]*:)?\/((%[0-9A-Fa-f]{2}|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~-\u{10FFFF}])+|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~-\u{10FFFF}]+)?|[.0-:A-Fa-f]+)\])?)(:\d*)?[/?]|[!$&-.0-;=?-Z_a-z~-\u{10FFFF}])(%[0-9A-Fa-f]{2}|[!$&-;=?-Z_a-z~-\u{10FFFF}])*|\/((%[0-9A-Fa-f]{2}|[!$&-.0-9;=A-Z_a-z~-\u{10FFFF}])+(:\d*)?|(\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~-\u{10FFFF}]+)?|[.0-:A-Fa-f]+)\])?:\d*|\[(([Vv][0-9A-Fa-f]+\.[!$&-.0-;=A-Z_a-z~-\u{10FFFF}]+)?|[.0-:A-Fa-f]+)\])?)?|[A-Za-z][+\-.0-9A-Za-z]*:?)?$/u,
        uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
        "uri-template": /(%[0-9a-f]{2}|[!#$&(-;=?@\[\]_a-z~]|\{[!#&+,./;=?@|]?(%[0-9a-f]{2}|[0-9_a-z])(\.?(%[0-9a-f]{2}|[0-9_a-z]))*(:[1-9]\d{0,3}|\*)?(,(%[0-9a-f]{2}|[0-9_a-z])(\.?(%[0-9a-f]{2}|[0-9_a-z]))*(:[1-9]\d{0,3}|\*)?)*\})*/iu,
        "json-pointer": /^(\/([\x00-\x2e0-@\[-}\x7f]|~[01])*)*$/iu,
        "relative-json-pointer": /^\d+(#|(\/([\x00-\x2e0-@\[-}\x7f]|~[01])*)*)$/iu,
        hostname: /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/,
        "host-name": /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/,
        "utc-millisec": function(input) {
          return typeof input === "string" && parseFloat(input) === parseInt(input, 10) && !isNaN(input);
        },
        regex: function(input) {
          var result = true;
          try {
            new RegExp(input);
          } catch (e) {
            result = false;
          }
          return result;
        },
        style: /[\r\n\t ]*[^\r\n\t ][^:]*:[\r\n\t ]*[^\r\n\t ;]*[\r\n\t ]*;?/,
        color: /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/,
        phone: /^\+(?:[0-9] ?){6,14}[0-9]$/,
        alpha: /^[a-zA-Z]+$/,
        alphanumeric: /^[a-zA-Z0-9]+$/
      };
      FORMAT_REGEXPS.regexp = FORMAT_REGEXPS.regex;
      FORMAT_REGEXPS.pattern = FORMAT_REGEXPS.regex;
      FORMAT_REGEXPS.ipv4 = FORMAT_REGEXPS["ip-address"];
      exports.isFormat = function isFormat(input, format, validator) {
        if (typeof input === "string" && FORMAT_REGEXPS[format] !== void 0) {
          if (FORMAT_REGEXPS[format] instanceof RegExp) {
            return FORMAT_REGEXPS[format].test(input);
          }
          if (typeof FORMAT_REGEXPS[format] === "function") {
            return FORMAT_REGEXPS[format](input);
          }
        } else if (validator && validator.customFormats && typeof validator.customFormats[format] === "function") {
          return validator.customFormats[format](input);
        }
        return true;
      };
      var makeSuffix = exports.makeSuffix = function makeSuffix2(key) {
        key = key.toString();
        if (!key.match(/[.\s\[\]]/) && !key.match(/^[\d]/)) {
          return "." + key;
        }
        if (key.match(/^\d+$/)) {
          return "[" + key + "]";
        }
        return "[" + JSON.stringify(key) + "]";
      };
      exports.deepCompareStrict = function deepCompareStrict(a, b) {
        if (typeof a !== typeof b) {
          return false;
        }
        if (Array.isArray(a)) {
          if (!Array.isArray(b)) {
            return false;
          }
          if (a.length !== b.length) {
            return false;
          }
          return a.every(function(v, i) {
            return deepCompareStrict(a[i], b[i]);
          });
        }
        if (typeof a === "object") {
          if (!a || !b) {
            return a === b;
          }
          var aKeys = Object.keys(a);
          var bKeys = Object.keys(b);
          if (aKeys.length !== bKeys.length) {
            return false;
          }
          return aKeys.every(function(v) {
            return deepCompareStrict(a[v], b[v]);
          });
        }
        return a === b;
      };
      function deepMerger(target, dst, e, i) {
        if (typeof e === "object") {
          dst[i] = deepMerge(target[i], e);
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        }
      }
      function copyist(src, dst, key) {
        dst[key] = src[key];
      }
      function copyistWithDeepMerge(target, src, dst, key) {
        if (typeof src[key] !== "object" || !src[key]) {
          dst[key] = src[key];
        } else {
          if (!target[key]) {
            dst[key] = src[key];
          } else {
            dst[key] = deepMerge(target[key], src[key]);
          }
        }
      }
      function deepMerge(target, src) {
        var array = Array.isArray(src);
        var dst = array && [] || {};
        if (array) {
          target = target || [];
          dst = dst.concat(target);
          src.forEach(deepMerger.bind(null, target, dst));
        } else {
          if (target && typeof target === "object") {
            Object.keys(target).forEach(copyist.bind(null, target, dst));
          }
          Object.keys(src).forEach(copyistWithDeepMerge.bind(null, target, src, dst));
        }
        return dst;
      }
      module.exports.deepMerge = deepMerge;
      exports.objectGetPath = function objectGetPath(o, s) {
        var parts = s.split("/").slice(1);
        var k;
        while (typeof (k = parts.shift()) == "string") {
          var n = decodeURIComponent(k.replace(/~0/, "~").replace(/~1/g, "/"));
          if (!(n in o))
            return;
          o = o[n];
        }
        return o;
      };
      function pathEncoder(v) {
        return "/" + encodeURIComponent(v).replace(/~/g, "%7E");
      }
      exports.encodePath = function encodePointer(a) {
        return a.map(pathEncoder).join("");
      };
      exports.getDecimalPlaces = function getDecimalPlaces(number) {
        var decimalPlaces = 0;
        if (isNaN(number))
          return decimalPlaces;
        if (typeof number !== "number") {
          number = Number(number);
        }
        var parts = number.toString().split("e");
        if (parts.length === 2) {
          if (parts[1][0] !== "-") {
            return decimalPlaces;
          } else {
            decimalPlaces = Number(parts[1].slice(1));
          }
        }
        var decimalParts = parts[0].split(".");
        if (decimalParts.length === 2) {
          decimalPlaces += decimalParts[1].length;
        }
        return decimalPlaces;
      };
      exports.isSchema = function isSchema(val) {
        return typeof val === "object" && val || typeof val === "boolean";
      };
    }
  });

  // sdk/contracts/weavedb/lib/jsonschema/attribute.js
  var require_attribute = __commonJS({
    "sdk/contracts/weavedb/lib/jsonschema/attribute.js"(exports, module) {
      "use strict";
      var helpers = require_helpers();
      var ValidatorResult = helpers.ValidatorResult;
      var SchemaError = helpers.SchemaError;
      var attribute = {};
      attribute.ignoreProperties = {
        "id": true,
        "default": true,
        "description": true,
        "title": true,
        "additionalItems": true,
        "then": true,
        "else": true,
        "$schema": true,
        "$ref": true,
        "extends": true
      };
      var validators = attribute.validators = {};
      validators.type = function validateType(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        var types = Array.isArray(schema.type) ? schema.type : [schema.type];
        if (!types.some(this.testType.bind(this, instance, schema, options, ctx))) {
          var list = types.map(function(v) {
            if (!v)
              return;
            var id = v.$id || v.id;
            return id ? "<" + id + ">" : v + "";
          });
          result.addError({
            name: "type",
            argument: list,
            message: "is not of a type(s) " + list
          });
        }
        return result;
      };
      function testSchemaNoThrow(instance, options, ctx, callback, schema) {
        var throwError = options.throwError;
        var throwAll = options.throwAll;
        options.throwError = false;
        options.throwAll = false;
        var res = this.validateSchema(instance, schema, options, ctx);
        options.throwError = throwError;
        options.throwAll = throwAll;
        if (!res.valid && callback instanceof Function) {
          callback(res);
        }
        return res.valid;
      }
      validators.anyOf = function validateAnyOf(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        var inner = new ValidatorResult(instance, schema, options, ctx);
        if (!Array.isArray(schema.anyOf)) {
          throw new SchemaError("anyOf must be an array");
        }
        if (!schema.anyOf.some(
          testSchemaNoThrow.bind(
            this,
            instance,
            options,
            ctx,
            function(res) {
              inner.importErrors(res);
            }
          )
        )) {
          var list = schema.anyOf.map(function(v, i) {
            var id = v.$id || v.id;
            if (id)
              return "<" + id + ">";
            return v.title && JSON.stringify(v.title) || v["$ref"] && "<" + v["$ref"] + ">" || "[subschema " + i + "]";
          });
          if (options.nestedErrors) {
            result.importErrors(inner);
          }
          result.addError({
            name: "anyOf",
            argument: list,
            message: "is not any of " + list.join(",")
          });
        }
        return result;
      };
      validators.allOf = function validateAllOf(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        if (!Array.isArray(schema.allOf)) {
          throw new SchemaError("allOf must be an array");
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        var self = this;
        schema.allOf.forEach(function(v, i) {
          var valid = self.validateSchema(instance, v, options, ctx);
          if (!valid.valid) {
            var id = v.$id || v.id;
            var msg = id || v.title && JSON.stringify(v.title) || v["$ref"] && "<" + v["$ref"] + ">" || "[subschema " + i + "]";
            result.addError({
              name: "allOf",
              argument: { id: msg, length: valid.errors.length, valid },
              message: "does not match allOf schema " + msg + " with " + valid.errors.length + " error[s]:"
            });
            result.importErrors(valid);
          }
        });
        return result;
      };
      validators.oneOf = function validateOneOf(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        if (!Array.isArray(schema.oneOf)) {
          throw new SchemaError("oneOf must be an array");
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        var inner = new ValidatorResult(instance, schema, options, ctx);
        var count = schema.oneOf.filter(
          testSchemaNoThrow.bind(
            this,
            instance,
            options,
            ctx,
            function(res) {
              inner.importErrors(res);
            }
          )
        ).length;
        var list = schema.oneOf.map(function(v, i) {
          var id = v.$id || v.id;
          return id || v.title && JSON.stringify(v.title) || v["$ref"] && "<" + v["$ref"] + ">" || "[subschema " + i + "]";
        });
        if (count !== 1) {
          if (options.nestedErrors) {
            result.importErrors(inner);
          }
          result.addError({
            name: "oneOf",
            argument: list,
            message: "is not exactly one from " + list.join(",")
          });
        }
        return result;
      };
      validators.if = function validateIf(instance, schema, options, ctx) {
        if (instance === void 0)
          return null;
        if (!helpers.isSchema(schema.if))
          throw new Error('Expected "if" keyword to be a schema');
        var ifValid = testSchemaNoThrow.call(this, instance, options, ctx, null, schema.if);
        var result = new ValidatorResult(instance, schema, options, ctx);
        var res;
        if (ifValid) {
          if (schema.then === void 0)
            return;
          if (!helpers.isSchema(schema.then))
            throw new Error('Expected "then" keyword to be a schema');
          res = this.validateSchema(instance, schema.then, options, ctx.makeChild(schema.then));
          result.importErrors(res);
        } else {
          if (schema.else === void 0)
            return;
          if (!helpers.isSchema(schema.else))
            throw new Error('Expected "else" keyword to be a schema');
          res = this.validateSchema(instance, schema.else, options, ctx.makeChild(schema.else));
          result.importErrors(res);
        }
        return result;
      };
      function getEnumerableProperty(object, key) {
        if (Object.hasOwnProperty.call(object, key))
          return object[key];
        if (!(key in object))
          return;
        while (object = Object.getPrototypeOf(object)) {
          if (Object.propertyIsEnumerable.call(object, key))
            return object[key];
        }
      }
      validators.propertyNames = function validatePropertyNames(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var subschema = schema.propertyNames !== void 0 ? schema.propertyNames : {};
        if (!helpers.isSchema(subschema))
          throw new SchemaError('Expected "propertyNames" to be a schema (object or boolean)');
        for (var property in instance) {
          if (getEnumerableProperty(instance, property) !== void 0) {
            var res = this.validateSchema(property, subschema, options, ctx.makeChild(subschema));
            result.importErrors(res);
          }
        }
        return result;
      };
      validators.properties = function validateProperties(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var properties = schema.properties || {};
        for (var property in properties) {
          var subschema = properties[property];
          if (subschema === void 0) {
            continue;
          } else if (subschema === null) {
            throw new SchemaError('Unexpected null, expected schema in "properties"');
          }
          if (typeof options.preValidateProperty == "function") {
            options.preValidateProperty(instance, property, subschema, options, ctx);
          }
          var prop = getEnumerableProperty(instance, property);
          var res = this.validateSchema(prop, subschema, options, ctx.makeChild(subschema, property));
          if (res.instance !== result.instance[property])
            result.instance[property] = res.instance;
          result.importErrors(res);
        }
        return result;
      };
      function testAdditionalProperty(instance, schema, options, ctx, property, result) {
        if (!this.types.object(instance))
          return;
        if (schema.properties && schema.properties[property] !== void 0) {
          return;
        }
        if (schema.additionalProperties === false) {
          result.addError({
            name: "additionalProperties",
            argument: property,
            message: "is not allowed to have the additional property " + JSON.stringify(property)
          });
        } else {
          var additionalProperties = schema.additionalProperties || {};
          if (typeof options.preValidateProperty == "function") {
            options.preValidateProperty(instance, property, additionalProperties, options, ctx);
          }
          var res = this.validateSchema(instance[property], additionalProperties, options, ctx.makeChild(additionalProperties, property));
          if (res.instance !== result.instance[property])
            result.instance[property] = res.instance;
          result.importErrors(res);
        }
      }
      validators.patternProperties = function validatePatternProperties(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var patternProperties = schema.patternProperties || {};
        for (var property in instance) {
          var test = true;
          for (var pattern in patternProperties) {
            var subschema = patternProperties[pattern];
            if (subschema === void 0) {
              continue;
            } else if (subschema === null) {
              throw new SchemaError('Unexpected null, expected schema in "patternProperties"');
            }
            try {
              var regexp = new RegExp(pattern, "u");
            } catch (_e) {
              regexp = new RegExp(pattern);
            }
            if (!regexp.test(property)) {
              continue;
            }
            test = false;
            if (typeof options.preValidateProperty == "function") {
              options.preValidateProperty(instance, property, subschema, options, ctx);
            }
            var res = this.validateSchema(instance[property], subschema, options, ctx.makeChild(subschema, property));
            if (res.instance !== result.instance[property])
              result.instance[property] = res.instance;
            result.importErrors(res);
          }
          if (test) {
            testAdditionalProperty.call(this, instance, schema, options, ctx, property, result);
          }
        }
        return result;
      };
      validators.additionalProperties = function validateAdditionalProperties(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        if (schema.patternProperties) {
          return null;
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        for (var property in instance) {
          testAdditionalProperty.call(this, instance, schema, options, ctx, property, result);
        }
        return result;
      };
      validators.minProperties = function validateMinProperties(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var keys = Object.keys(instance);
        if (!(keys.length >= schema.minProperties)) {
          result.addError({
            name: "minProperties",
            argument: schema.minProperties,
            message: "does not meet minimum property length of " + schema.minProperties
          });
        }
        return result;
      };
      validators.maxProperties = function validateMaxProperties(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var keys = Object.keys(instance);
        if (!(keys.length <= schema.maxProperties)) {
          result.addError({
            name: "maxProperties",
            argument: schema.maxProperties,
            message: "does not meet maximum property length of " + schema.maxProperties
          });
        }
        return result;
      };
      validators.items = function validateItems(instance, schema, options, ctx) {
        var self = this;
        if (!this.types.array(instance))
          return;
        if (schema.items === void 0)
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        instance.every(function(value, i) {
          if (Array.isArray(schema.items)) {
            var items = schema.items[i] === void 0 ? schema.additionalItems : schema.items[i];
          } else {
            var items = schema.items;
          }
          if (items === void 0) {
            return true;
          }
          if (items === false) {
            result.addError({
              name: "items",
              message: "additionalItems not permitted"
            });
            return false;
          }
          var res = self.validateSchema(value, items, options, ctx.makeChild(items, i));
          if (res.instance !== result.instance[i])
            result.instance[i] = res.instance;
          result.importErrors(res);
          return true;
        });
        return result;
      };
      validators.contains = function validateContains(instance, schema, options, ctx) {
        var self = this;
        if (!this.types.array(instance))
          return;
        if (schema.contains === void 0)
          return;
        if (!helpers.isSchema(schema.contains))
          throw new Error('Expected "contains" keyword to be a schema');
        var result = new ValidatorResult(instance, schema, options, ctx);
        var count = instance.some(function(value, i) {
          var res = self.validateSchema(value, schema.contains, options, ctx.makeChild(schema.contains, i));
          return res.errors.length === 0;
        });
        if (count === false) {
          result.addError({
            name: "contains",
            argument: schema.contains,
            message: "must contain an item matching given schema"
          });
        }
        return result;
      };
      validators.minimum = function validateMinimum(instance, schema, options, ctx) {
        if (!this.types.number(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (schema.exclusiveMinimum && schema.exclusiveMinimum === true) {
          if (!(instance > schema.minimum)) {
            result.addError({
              name: "minimum",
              argument: schema.minimum,
              message: "must be greater than " + schema.minimum
            });
          }
        } else {
          if (!(instance >= schema.minimum)) {
            result.addError({
              name: "minimum",
              argument: schema.minimum,
              message: "must be greater than or equal to " + schema.minimum
            });
          }
        }
        return result;
      };
      validators.maximum = function validateMaximum(instance, schema, options, ctx) {
        if (!this.types.number(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (schema.exclusiveMaximum && schema.exclusiveMaximum === true) {
          if (!(instance < schema.maximum)) {
            result.addError({
              name: "maximum",
              argument: schema.maximum,
              message: "must be less than " + schema.maximum
            });
          }
        } else {
          if (!(instance <= schema.maximum)) {
            result.addError({
              name: "maximum",
              argument: schema.maximum,
              message: "must be less than or equal to " + schema.maximum
            });
          }
        }
        return result;
      };
      validators.exclusiveMinimum = function validateExclusiveMinimum(instance, schema, options, ctx) {
        if (typeof schema.exclusiveMinimum === "boolean")
          return;
        if (!this.types.number(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var valid = instance > schema.exclusiveMinimum;
        if (!valid) {
          result.addError({
            name: "exclusiveMinimum",
            argument: schema.exclusiveMinimum,
            message: "must be strictly greater than " + schema.exclusiveMinimum
          });
        }
        return result;
      };
      validators.exclusiveMaximum = function validateExclusiveMaximum(instance, schema, options, ctx) {
        if (typeof schema.exclusiveMaximum === "boolean")
          return;
        if (!this.types.number(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var valid = instance < schema.exclusiveMaximum;
        if (!valid) {
          result.addError({
            name: "exclusiveMaximum",
            argument: schema.exclusiveMaximum,
            message: "must be strictly less than " + schema.exclusiveMaximum
          });
        }
        return result;
      };
      var validateMultipleOfOrDivisbleBy = function validateMultipleOfOrDivisbleBy2(instance, schema, options, ctx, validationType, errorMessage) {
        if (!this.types.number(instance))
          return;
        var validationArgument = schema[validationType];
        if (validationArgument == 0) {
          throw new SchemaError(validationType + " cannot be zero");
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        var instanceDecimals = helpers.getDecimalPlaces(instance);
        var divisorDecimals = helpers.getDecimalPlaces(validationArgument);
        var maxDecimals = Math.max(instanceDecimals, divisorDecimals);
        var multiplier = Math.pow(10, maxDecimals);
        if (Math.round(instance * multiplier) % Math.round(validationArgument * multiplier) !== 0) {
          result.addError({
            name: validationType,
            argument: validationArgument,
            message: errorMessage + JSON.stringify(validationArgument)
          });
        }
        return result;
      };
      validators.multipleOf = function validateMultipleOf(instance, schema, options, ctx) {
        return validateMultipleOfOrDivisbleBy.call(this, instance, schema, options, ctx, "multipleOf", "is not a multiple of (divisible by) ");
      };
      validators.divisibleBy = function validateDivisibleBy(instance, schema, options, ctx) {
        return validateMultipleOfOrDivisbleBy.call(this, instance, schema, options, ctx, "divisibleBy", "is not divisible by (multiple of) ");
      };
      validators.required = function validateRequired(instance, schema, options, ctx) {
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (instance === void 0 && schema.required === true) {
          result.addError({
            name: "required",
            message: "is required"
          });
        } else if (this.types.object(instance) && Array.isArray(schema.required)) {
          schema.required.forEach(function(n) {
            if (getEnumerableProperty(instance, n) === void 0) {
              result.addError({
                name: "required",
                argument: n,
                message: "requires property " + JSON.stringify(n)
              });
            }
          });
        }
        return result;
      };
      validators.pattern = function validatePattern(instance, schema, options, ctx) {
        if (!this.types.string(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var pattern = schema.pattern;
        try {
          var regexp = new RegExp(pattern, "u");
        } catch (_e) {
          regexp = new RegExp(pattern);
        }
        if (!instance.match(regexp)) {
          result.addError({
            name: "pattern",
            argument: schema.pattern,
            message: "does not match pattern " + JSON.stringify(schema.pattern.toString())
          });
        }
        return result;
      };
      validators.format = function validateFormat(instance, schema, options, ctx) {
        if (instance === void 0)
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!result.disableFormat && !helpers.isFormat(instance, schema.format, this)) {
          result.addError({
            name: "format",
            argument: schema.format,
            message: "does not conform to the " + JSON.stringify(schema.format) + " format"
          });
        }
        return result;
      };
      validators.minLength = function validateMinLength(instance, schema, options, ctx) {
        if (!this.types.string(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var hsp = instance.match(/[\uDC00-\uDFFF]/g);
        var length = instance.length - (hsp ? hsp.length : 0);
        if (!(length >= schema.minLength)) {
          result.addError({
            name: "minLength",
            argument: schema.minLength,
            message: "does not meet minimum length of " + schema.minLength
          });
        }
        return result;
      };
      validators.maxLength = function validateMaxLength(instance, schema, options, ctx) {
        if (!this.types.string(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var hsp = instance.match(/[\uDC00-\uDFFF]/g);
        var length = instance.length - (hsp ? hsp.length : 0);
        if (!(length <= schema.maxLength)) {
          result.addError({
            name: "maxLength",
            argument: schema.maxLength,
            message: "does not meet maximum length of " + schema.maxLength
          });
        }
        return result;
      };
      validators.minItems = function validateMinItems(instance, schema, options, ctx) {
        if (!this.types.array(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!(instance.length >= schema.minItems)) {
          result.addError({
            name: "minItems",
            argument: schema.minItems,
            message: "does not meet minimum length of " + schema.minItems
          });
        }
        return result;
      };
      validators.maxItems = function validateMaxItems(instance, schema, options, ctx) {
        if (!this.types.array(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!(instance.length <= schema.maxItems)) {
          result.addError({
            name: "maxItems",
            argument: schema.maxItems,
            message: "does not meet maximum length of " + schema.maxItems
          });
        }
        return result;
      };
      function testArrays(v, i, a) {
        var j, len = a.length;
        for (j = i + 1, len; j < len; j++) {
          if (helpers.deepCompareStrict(v, a[j])) {
            return false;
          }
        }
        return true;
      }
      validators.uniqueItems = function validateUniqueItems(instance, schema, options, ctx) {
        if (schema.uniqueItems !== true)
          return;
        if (!this.types.array(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!instance.every(testArrays)) {
          result.addError({
            name: "uniqueItems",
            message: "contains duplicate item"
          });
        }
        return result;
      };
      validators.dependencies = function validateDependencies(instance, schema, options, ctx) {
        if (!this.types.object(instance))
          return;
        var result = new ValidatorResult(instance, schema, options, ctx);
        for (var property in schema.dependencies) {
          if (instance[property] === void 0) {
            continue;
          }
          var dep = schema.dependencies[property];
          var childContext = ctx.makeChild(dep, property);
          if (typeof dep == "string") {
            dep = [dep];
          }
          if (Array.isArray(dep)) {
            dep.forEach(function(prop) {
              if (instance[prop] === void 0) {
                result.addError({
                  name: "dependencies",
                  argument: childContext.propertyPath,
                  message: "property " + prop + " not found, required by " + childContext.propertyPath
                });
              }
            });
          } else {
            var res = this.validateSchema(instance, dep, options, childContext);
            if (result.instance !== res.instance)
              result.instance = res.instance;
            if (res && res.errors.length) {
              result.addError({
                name: "dependencies",
                argument: childContext.propertyPath,
                message: "does not meet dependency required by " + childContext.propertyPath
              });
              result.importErrors(res);
            }
          }
        }
        return result;
      };
      validators["enum"] = function validateEnum(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        if (!Array.isArray(schema["enum"])) {
          throw new SchemaError("enum expects an array", schema);
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!schema["enum"].some(helpers.deepCompareStrict.bind(null, instance))) {
          result.addError({
            name: "enum",
            argument: schema["enum"],
            message: "is not one of enum values: " + schema["enum"].map(String).join(",")
          });
        }
        return result;
      };
      validators["const"] = function validateEnum(instance, schema, options, ctx) {
        if (instance === void 0) {
          return null;
        }
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (!helpers.deepCompareStrict(schema["const"], instance)) {
          result.addError({
            name: "const",
            argument: schema["const"],
            message: "does not exactly match expected constant: " + schema["const"]
          });
        }
        return result;
      };
      validators.not = validators.disallow = function validateNot(instance, schema, options, ctx) {
        var self = this;
        if (instance === void 0)
          return null;
        var result = new ValidatorResult(instance, schema, options, ctx);
        var notTypes = schema.not || schema.disallow;
        if (!notTypes)
          return null;
        if (!Array.isArray(notTypes))
          notTypes = [notTypes];
        notTypes.forEach(function(type) {
          if (self.testType(instance, schema, options, ctx, type)) {
            var id = type && (type.$id || type.id);
            var schemaId = id || type;
            result.addError({
              name: "not",
              argument: schemaId,
              message: "is of prohibited type " + schemaId
            });
          }
        });
        return result;
      };
      module.exports = attribute;
    }
  });

  // sdk/contracts/weavedb/lib/jsonschema/scan.js
  var require_scan2 = __commonJS({
    "sdk/contracts/weavedb/lib/jsonschema/scan.js"(exports, module) {
      "use strict";
      var urilib = require_url();
      var helpers = require_helpers();
      module.exports.SchemaScanResult = SchemaScanResult;
      function SchemaScanResult(found, ref) {
        this.id = found;
        this.ref = ref;
      }
      module.exports.scan = function scan(base, schema) {
        function scanSchema(baseuri, schema2) {
          if (!schema2 || typeof schema2 != "object")
            return;
          if (schema2.$ref) {
            var resolvedUri = urilib.resolve(baseuri, schema2.$ref);
            ref[resolvedUri] = ref[resolvedUri] ? ref[resolvedUri] + 1 : 0;
            return;
          }
          var id = schema2.$id || schema2.id;
          var ourBase = id ? urilib.resolve(baseuri, id) : baseuri;
          if (ourBase) {
            if (ourBase.indexOf("#") < 0)
              ourBase += "#";
            if (found[ourBase]) {
              if (!helpers.deepCompareStrict(found[ourBase], schema2)) {
                throw new Error(
                  "Schema <" + ourBase + "> already exists with different definition"
                );
              }
              return found[ourBase];
            }
            found[ourBase] = schema2;
            if (ourBase[ourBase.length - 1] == "#") {
              found[ourBase.substring(0, ourBase.length - 1)] = schema2;
            }
          }
          scanArray(
            ourBase + "/items",
            Array.isArray(schema2.items) ? schema2.items : [schema2.items]
          );
          scanArray(
            ourBase + "/extends",
            Array.isArray(schema2.extends) ? schema2.extends : [schema2.extends]
          );
          scanSchema(ourBase + "/additionalItems", schema2.additionalItems);
          scanObject(ourBase + "/properties", schema2.properties);
          scanSchema(ourBase + "/additionalProperties", schema2.additionalProperties);
          scanObject(ourBase + "/definitions", schema2.definitions);
          scanObject(ourBase + "/patternProperties", schema2.patternProperties);
          scanObject(ourBase + "/dependencies", schema2.dependencies);
          scanArray(ourBase + "/disallow", schema2.disallow);
          scanArray(ourBase + "/allOf", schema2.allOf);
          scanArray(ourBase + "/anyOf", schema2.anyOf);
          scanArray(ourBase + "/oneOf", schema2.oneOf);
          scanSchema(ourBase + "/not", schema2.not);
        }
        function scanArray(baseuri, schemas) {
          if (!Array.isArray(schemas))
            return;
          for (var i = 0; i < schemas.length; i++) {
            scanSchema(baseuri + "/" + i, schemas[i]);
          }
        }
        function scanObject(baseuri, schemas) {
          if (!schemas || typeof schemas != "object")
            return;
          for (var p in schemas) {
            scanSchema(baseuri + "/" + p, schemas[p]);
          }
        }
        var found = {};
        var ref = {};
        scanSchema(base, schema);
        return new SchemaScanResult(found, ref);
      };
    }
  });

  // sdk/contracts/weavedb/lib/jsonschema/validator.js
  var require_validator = __commonJS({
    "sdk/contracts/weavedb/lib/jsonschema/validator.js"(exports, module) {
      "use strict";
      var urilib = require_url();
      var attribute = require_attribute();
      var helpers = require_helpers();
      var scanSchema = require_scan2().scan;
      var ValidatorResult = helpers.ValidatorResult;
      var ValidatorResultError = helpers.ValidatorResultError;
      var SchemaError = helpers.SchemaError;
      var SchemaContext = helpers.SchemaContext;
      var anonymousBase = "/";
      var Validator = function Validator2() {
        this.customFormats = Object.create(Validator2.prototype.customFormats);
        this.schemas = {};
        this.unresolvedRefs = [];
        this.types = Object.create(types);
        this.attributes = Object.create(attribute.validators);
      };
      Validator.prototype.customFormats = {};
      Validator.prototype.schemas = null;
      Validator.prototype.types = null;
      Validator.prototype.attributes = null;
      Validator.prototype.unresolvedRefs = null;
      Validator.prototype.addSchema = function addSchema(schema, base) {
        var self = this;
        if (!schema) {
          return null;
        }
        var scan = scanSchema(base || anonymousBase, schema);
        var ourUri = base || schema.$id || schema.id;
        for (var uri in scan.id) {
          this.schemas[uri] = scan.id[uri];
        }
        for (var uri in scan.ref) {
          this.unresolvedRefs.push(uri);
        }
        this.unresolvedRefs = this.unresolvedRefs.filter(function(uri2) {
          return typeof self.schemas[uri2] === "undefined";
        });
        return this.schemas[ourUri];
      };
      Validator.prototype.addSubSchemaArray = function addSubSchemaArray(baseuri, schemas) {
        if (!Array.isArray(schemas))
          return;
        for (var i = 0; i < schemas.length; i++) {
          this.addSubSchema(baseuri, schemas[i]);
        }
      };
      Validator.prototype.addSubSchemaObject = function addSubSchemaArray(baseuri, schemas) {
        if (!schemas || typeof schemas != "object")
          return;
        for (var p in schemas) {
          this.addSubSchema(baseuri, schemas[p]);
        }
      };
      Validator.prototype.setSchemas = function setSchemas(schemas) {
        this.schemas = schemas;
      };
      Validator.prototype.getSchema = function getSchema(urn) {
        return this.schemas[urn];
      };
      Validator.prototype.validate = function validate(instance, schema, options, ctx) {
        if (typeof schema !== "boolean" && typeof schema !== "object" || schema === null) {
          throw new SchemaError("Expected `schema` to be an object or boolean");
        }
        if (!options) {
          options = {};
        }
        var id = schema.$id || schema.id;
        var base = urilib.resolve(options.base || anonymousBase, id || "");
        if (!ctx) {
          ctx = new SchemaContext(
            schema,
            options,
            [],
            base,
            Object.create(this.schemas)
          );
          if (!ctx.schemas[base]) {
            ctx.schemas[base] = schema;
          }
          var found = scanSchema(base, schema);
          for (var n in found.id) {
            var sch = found.id[n];
            ctx.schemas[n] = sch;
          }
        }
        if (options.required && instance === void 0) {
          var result = new ValidatorResult(instance, schema, options, ctx);
          result.addError("is required, but is undefined");
          return result;
        }
        var result = this.validateSchema(instance, schema, options, ctx);
        if (!result) {
          throw new Error("Result undefined");
        } else if (options.throwAll && result.errors.length) {
          throw new ValidatorResultError(result);
        }
        return result;
      };
      function shouldResolve(schema) {
        var ref = typeof schema === "string" ? schema : schema.$ref;
        if (typeof ref == "string")
          return ref;
        return false;
      }
      Validator.prototype.validateSchema = function validateSchema(instance, schema, options, ctx) {
        var result = new ValidatorResult(instance, schema, options, ctx);
        if (typeof schema === "boolean") {
          if (schema === true) {
            schema = {};
          } else if (schema === false) {
            schema = { type: [] };
          }
        } else if (!schema) {
          throw new Error("schema is undefined");
        }
        if (schema["extends"]) {
          if (Array.isArray(schema["extends"])) {
            var schemaobj = { schema, ctx };
            schema["extends"].forEach(this.schemaTraverser.bind(this, schemaobj));
            schema = schemaobj.schema;
            schemaobj.schema = null;
            schemaobj.ctx = null;
            schemaobj = null;
          } else {
            schema = helpers.deepMerge(
              schema,
              this.superResolve(schema["extends"], ctx)
            );
          }
        }
        var switchSchema = shouldResolve(schema);
        if (switchSchema) {
          var resolved = this.resolve(schema, switchSchema, ctx);
          var subctx = new SchemaContext(
            resolved.subschema,
            options,
            ctx.path,
            resolved.switchSchema,
            ctx.schemas
          );
          return this.validateSchema(instance, resolved.subschema, options, subctx);
        }
        var skipAttributes = options && options.skipAttributes || [];
        for (var key in schema) {
          if (!attribute.ignoreProperties[key] && skipAttributes.indexOf(key) < 0) {
            var validatorErr = null;
            var validator = this.attributes[key];
            if (validator) {
              validatorErr = validator.call(this, instance, schema, options, ctx);
            } else if (options.allowUnknownAttributes === false) {
              throw new SchemaError("Unsupported attribute: " + key, schema);
            }
            if (validatorErr) {
              result.importErrors(validatorErr);
            }
          }
        }
        if (typeof options.rewrite == "function") {
          var value = options.rewrite.call(this, instance, schema, options, ctx);
          result.instance = value;
        }
        return result;
      };
      Validator.prototype.schemaTraverser = function schemaTraverser(schemaobj, s) {
        schemaobj.schema = helpers.deepMerge(
          schemaobj.schema,
          this.superResolve(s, schemaobj.ctx)
        );
      };
      Validator.prototype.superResolve = function superResolve(schema, ctx) {
        var ref = shouldResolve(schema);
        if (ref) {
          return this.resolve(schema, ref, ctx).subschema;
        }
        return schema;
      };
      Validator.prototype.resolve = function resolve(schema, switchSchema, ctx) {
        switchSchema = ctx.resolve(switchSchema);
        if (ctx.schemas[switchSchema]) {
          return { subschema: ctx.schemas[switchSchema], switchSchema };
        }
        var parsed = urilib.parse(switchSchema);
        var fragment = parsed && parsed.hash;
        var document = fragment && fragment.length && switchSchema.substr(0, switchSchema.length - fragment.length);
        if (!document || !ctx.schemas[document]) {
          throw new SchemaError("no such schema <" + switchSchema + ">", schema);
        }
        var subschema = helpers.objectGetPath(
          ctx.schemas[document],
          fragment.substr(1)
        );
        if (subschema === void 0) {
          throw new SchemaError(
            "no such schema " + fragment + " located in <" + document + ">",
            schema
          );
        }
        return { subschema, switchSchema };
      };
      Validator.prototype.testType = function validateType(instance, schema, options, ctx, type) {
        if (type === void 0) {
          return;
        } else if (type === null) {
          throw new SchemaError('Unexpected null in "type" keyword');
        }
        if (typeof this.types[type] == "function") {
          return this.types[type].call(this, instance);
        }
        if (type && typeof type == "object") {
          var res = this.validateSchema(instance, type, options, ctx);
          return res === void 0 || !(res && res.errors.length);
        }
        return true;
      };
      var types = Validator.prototype.types = {};
      types.string = function testString(instance) {
        return typeof instance == "string";
      };
      types.number = function testNumber(instance) {
        return typeof instance == "number" && isFinite(instance);
      };
      types.integer = function testInteger(instance) {
        return typeof instance == "number" && instance % 1 === 0;
      };
      types.boolean = function testBoolean(instance) {
        return typeof instance == "boolean";
      };
      types.array = function testArray(instance) {
        return Array.isArray(instance);
      };
      types["null"] = function testNull(instance) {
        return instance === null;
      };
      types.date = function testDate(instance) {
        return instance instanceof Date;
      };
      types.any = function testAny(instance) {
        return true;
      };
      types.object = function testObject(instance) {
        return instance && typeof instance === "object" && !Array.isArray(instance) && !(instance instanceof Date);
      };
      module.exports = Validator;
    }
  });

  // sdk/contracts/weavedb/lib/jsonschema/index.js
  var require_jsonschema = __commonJS({
    "sdk/contracts/weavedb/lib/jsonschema/index.js"(exports, module) {
      "use strict";
      var Validator = module.exports.Validator = require_validator();
      module.exports.ValidatorResult = require_helpers().ValidatorResult;
      module.exports.ValidatorResultError = require_helpers().ValidatorResultError;
      module.exports.ValidationError = require_helpers().ValidationError;
      module.exports.SchemaError = require_helpers().SchemaError;
      module.exports.SchemaScanResult = require_scan2().SchemaScanResult;
      module.exports.scan = require_scan2().scan;
      module.exports.validate = function(instance, schema, options) {
        var v = new Validator();
        return v.validate(instance, schema, options);
      };
    }
  });

  // sdk/contracts/weavedb/lib/utils.js
  var require_utils = __commonJS({
    "sdk/contracts/weavedb/lib/utils.js"(exports, module) {
      var fpjson = require_cjs();
      fpjson = fpjson.default || fpjson;
      var jsonLogic = require_logic();
      var {
        tail,
        mergeLeft,
        of,
        concat,
        without,
        is,
        complement,
        isNil,
        slice,
        includes,
        last,
        intersection
      } = require_src();
      var { isValidName } = require_pure();
      var clone = (state) => JSON.parse(JSON.stringify(state));
      var { validate: validator } = require_jsonschema();
      var err = (msg = `The wrong query`, contractErr = false) => {
        if (contractErr) {
          const error = typeof ContractError === "undefined" ? Error : ContractError;
          throw new error(msg);
        } else {
          throw msg;
        }
      };
      var getCol = (data, path, _signer) => {
        const [col, id] = path;
        if (!isValidName(col))
          err(`collection id is not valid: ${col}`);
        data[col] ||= { __docs: {} };
        if (isNil(id)) {
          return data[col];
        } else {
          if (!isValidName(id))
            err(`doc id is not valid: ${id}`);
          data[col].__docs[id] ||= { __data: null, subs: {} };
          if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
            data[col].__docs[id].setter = _signer;
          }
          return getCol(
            data[col].__docs[id].subs,
            slice(2, path.length, path),
            _signer
          );
        }
      };
      var getField = (data, path) => {
        if (path.length === 1) {
          return [path[0], data];
        } else {
          if (isNil(data[path[0]]))
            data[path[0]] = {};
          return getField(data[path[0]], tail(path));
        }
      };
      var mergeData = (_data, new_data, overwrite = false, signer, SmartWeave2) => {
        let exists = true;
        if (isNil(_data.__data) || overwrite) {
          _data.__data = {};
          exists = false;
        }
        for (let k in new_data) {
          const path = exists ? k.split(".") : [k];
          const [field, obj] = getField(_data.__data, path);
          const d = new_data[k];
          if (is(Object)(d) && d.__op === "arrayUnion") {
            if (complement(is)(Array, d.arr))
              err();
            if (complement(is)(Array, obj[field]))
              obj[field] = [];
            obj[field] = concat(obj[field], d.arr);
          } else if (is(Object)(d) && d.__op === "arrayRemove") {
            if (complement(is)(Array, d.arr))
              err();
            if (complement(is)(Array, obj[field]))
              obj[field] = [];
            obj[field] = without(d.arr, obj[field]);
          } else if (is(Object)(d) && d.__op === "inc") {
            if (isNaN(d.n))
              err();
            if (isNil(obj[field]))
              obj[field] = 0;
            obj[field] += d.n;
          } else if (is(Object)(d) && d.__op === "del") {
            delete obj[field];
          } else if (is(Object)(d) && d.__op === "ts") {
            obj[field] = SmartWeave2.block.timestamp;
          } else if (is(Object)(d) && d.__op === "signer") {
            obj[field] = signer;
          } else {
            obj[field] = d;
          }
        }
        return _data;
      };
      var getDoc = (data, path, _signer, func, new_data, secure = false, relayer, jobID, extra, state, action, SmartWeave2) => {
        const [_col, id] = path;
        if (!isValidName(_col))
          err(`collection id is not valid: ${_col}`);
        if (!isValidName(id))
          err(`doc id is not valid: ${id}`);
        data[_col] ||= { __docs: {} };
        const col = data[_col];
        const { rules, schema } = col;
        col.__docs[id] ||= { __data: null, subs: {} };
        const doc = col.__docs[id];
        if (!isNil(_signer) && isNil(doc.setter))
          doc.setter = _signer;
        let next_data = null;
        if (path.length === 2) {
          if (includes(func)(["set", "add"])) {
            next_data = mergeData(
              clone(doc),
              new_data,
              true,
              _signer,
              SmartWeave2
            ).__data;
          } else if (includes(func)(["update", "upsert"])) {
            next_data = mergeData(
              clone(doc),
              new_data,
              false,
              _signer,
              SmartWeave2
            ).__data;
          }
        }
        if (includes(func)(["set", "add", "update", "upsert", "delete"]) && (secure || !isNil(rules))) {
          let op = func;
          if (includes(op)(["set", "add"]))
            op = "create";
          if (op === "create" && !isNil(doc.__data))
            op = "update";
          if (op === "upsert") {
            if (!isNil(doc.__data)) {
              op = "update";
            } else {
              op = "create";
            }
          }
          let allowed = false;
          let rule_data = {
            contract: {
              id: SmartWeave2.contract.id,
              version: state.version,
              owners: is(Array, state.owner) ? state.owner : [state.owner]
            },
            request: {
              caller: action.caller,
              method: op,
              auth: { signer: _signer, relayer, jobID, extra },
              block: {
                height: SmartWeave2.block.height,
                timestamp: SmartWeave2.block.timestamp
              },
              transaction: {
                id: SmartWeave2.transaction.id
              },
              resource: { data: new_data },
              id: last(path),
              path
            },
            resource: {
              data: doc.__data,
              setter: doc.setter,
              newData: next_data,
              id: last(path),
              path
            }
          };
          const setElm = (k, val) => {
            let elm = rule_data;
            let elm_path = k.split(".");
            let i = 0;
            for (let v of elm_path) {
              if (i === elm_path.length - 1) {
                elm[v] = val;
                break;
              } else if (isNil(elm[v]))
                elm[v] = {};
              elm = elm[v];
              i++;
            }
            return elm;
          };
          if (!isNil(rules)) {
            for (let k in rules || {}) {
              const [permission, _ops] = k.split(" ");
              if (permission !== "let")
                continue;
              const rule = rules[k];
              let ok = false;
              if (isNil(_ops)) {
                ok = true;
              } else {
                const ops = _ops.split(",");
                if (intersection(ops)(["write", op]).length > 0) {
                  ok = true;
                }
              }
              if (ok) {
                for (let k2 in rule || {}) {
                  setElm(k2, fpjson(clone(rule[k2]), rule_data));
                }
              }
            }
          }
          for (let k in rules || {}) {
            const spk = k.split(" ");
            if (spk[0] === "let")
              continue;
            const rule = rules[k];
            const [permission, _ops] = k.split(" ");
            const ops = _ops.split(",");
            if (intersection(ops)(["write", op]).length > 0) {
              const ok = jsonLogic.apply(rule, rule_data);
              if (permission === "allow" && ok) {
                allowed = true;
              } else if (permission === "deny" && ok)
                err();
            }
          }
          if (!allowed)
            err("operation not allowed");
        }
        return path.length >= 4 ? getDoc(
          doc.subs,
          slice(2, path.length, path),
          _signer,
          func,
          new_data,
          secure,
          relayer,
          jobID,
          extra,
          state,
          action,
          SmartWeave2
        ) : {
          doc,
          schema,
          rules,
          col,
          next_data
        };
      };
      var isEvolving = (state) => !isNil(state.evolveHistory) && !isNil(last(state.evolveHistory)) && isNil(last(state.evolveHistory).newVersion);
      function bigIntFromBytes(byteArr) {
        let hexString = "";
        for (const byte of byteArr) {
          hexString += byte.toString(16).padStart(2, "0");
        }
        return BigInt("0x" + hexString);
      }
      async function getRandomIntNumber(max, action, uniqueValue = "", salt, SmartWeave2) {
        const pseudoRandomData = SmartWeave2.arweave.utils.stringToBuffer(
          SmartWeave2.block.height + SmartWeave2.block.timestamp + SmartWeave2.transaction.id + action.caller + uniqueValue + salt.toString()
        );
        const hashBytes = await SmartWeave2.arweave.crypto.hash(pseudoRandomData);
        const randomBigInt = bigIntFromBytes(hashBytes);
        return Number(randomBigInt % BigInt(max));
      }
      var genId = async (action, salt, SmartWeave2) => {
        const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let autoId = "";
        for (let i = 0; i < 20; i++) {
          autoId += CHARS.charAt(
            await getRandomIntNumber(CHARS.length, action, i, salt, SmartWeave2) - 1
          );
        }
        return autoId;
      };
      var parse = async (state, action, func, signer, salt, contractErr = true, SmartWeave2) => {
        const { data } = state;
        const { query } = action.input;
        const { relayer, jobID, extra } = action;
        let new_data = null;
        let path = null;
        let col;
        if (includes(func)([
          "delete",
          "getSchema",
          "getRules",
          "getAlgorithms",
          "removeRelayerJob",
          "getRelayerJob",
          "listCollections"
        ])) {
          path = query;
        } else {
          ;
          [new_data, ...path] = query;
          if (func === "add") {
            const id = await genId(action, salt, SmartWeave2);
            if (isNil(state.ids[SmartWeave2.transaction.id])) {
              state.ids[SmartWeave2.transaction.id] = [];
            }
            state.ids[SmartWeave2.transaction.id].push(id);
            path.push(id);
          }
        }
        if (isNil(new_data) && !includes(func)([
          "listCollections",
          "delete",
          "getSchema",
          "getRules",
          "getAlgorithms",
          "getRelayerJob",
          "removeRelayerJob",
          "getRelayerJob"
        ]) || path.length === 0 && !includes(func)(["setAlgorithms", "listCollections"]) || path.length % 2 !== 0 && !includes(func)([
          "addRelayerJob",
          "removeRelayerJob",
          "getRelayerJob",
          "addIndex",
          "removeIndex",
          "setSchema",
          "getSchema",
          "getAlgorithms",
          "setRules",
          "getRules",
          "linkContract",
          "unlinkContract"
        ])) {
          err(`the wrong query length[${query.length}] for ${func}`, contractErr);
        }
        let _data = null;
        let schema = null;
        let rules = null;
        let next_data;
        if (includes(func)([
          "addIndex",
          "removeIndex",
          "setSchema",
          "getSchema",
          "setRules",
          "getRules"
        ])) {
          _data = getCol(data, path, signer, func);
          col = _data;
        } else if (!includes(func)([
          "setAlgorithms",
          "addRelayerJob",
          "removeRelayerJob",
          "getAlgorithms",
          "linkContract",
          "unlinkContract"
        ]) && path.length !== 0) {
          const doc = getDoc(
            data,
            path,
            signer,
            func,
            new_data,
            state.secure,
            relayer,
            jobID,
            extra,
            state,
            action,
            SmartWeave2
          );
          _data = doc.doc;
          ({ next_data, schema, rules, col } = doc);
        }
        let owner = state.owner || [];
        if (is(String)(owner))
          owner = of(owner);
        if (includes(func)([
          "addRelayerJob",
          "removeRelayerJob",
          "addIndex",
          "removeIndex",
          "setSchema",
          "setAlgorithms",
          "setRules",
          "unlinkContract",
          "linkContract",
          "unlinkContract"
        ]) && !includes(signer)(owner)) {
          err("caller is not contract owner", contractErr);
        }
        return { data, query, new_data, path, _data, schema, col, next_data };
      };
      var read = async (contract, param, SmartWeave2) => {
        return (await SmartWeave2.contracts.viewContractState(contract, param)).result;
      };
      var validateSchema = (schema, data, contractErr) => {
        if (!isNil(schema)) {
          const valid = validator(data, clone(schema)).valid;
          if (!valid)
            err(null, contractErr);
        }
      };
      var isOwner = (signer, state) => {
        let owner = state.owner || [];
        if (is(String)(owner))
          owner = of(owner);
        if (!includes(signer)(owner)) {
          err(`Signer[${signer}] is not the owner[${owner.join(", ")}].`);
        }
        return owner;
      };
      var wrapResult = (state, original_signer, SmartWeave2, extra = {}) => ({
        state,
        result: mergeLeft(extra, {
          original_signer,
          transaction: {
            id: SmartWeave2?.transaction?.id || null,
            owner: SmartWeave2?.transaction?.owner || null,
            tags: SmartWeave2?.transaction?.tags || null,
            quantity: SmartWeave2?.transaction?.quantity || null,
            target: SmartWeave2?.transaction?.target || null,
            reward: SmartWeave2?.transaction?.reward || null
          },
          block: {
            height: SmartWeave2?.block?.height || null,
            timestamp: SmartWeave2?.block?.timestamp || null,
            indep_hash: SmartWeave2?.block?.indep_hash || null
          }
        })
      });
      module.exports = {
        wrapResult,
        isOwner,
        clone,
        err,
        getDoc,
        getCol,
        isEvolving,
        parse,
        read,
        validateSchema,
        mergeData
      };
    }
  });

  // sdk/contracts/weavedb/actions/read/nonce.js
  var require_nonce = __commonJS({
    "sdk/contracts/weavedb/actions/read/nonce.js"(exports, module) {
      var { isNil } = require_src();
      var { err } = require_utils();
      var nonce = async (state, action) => {
        const { nonces } = state;
        let { address } = action.input;
        if (isNil(address))
          err(`No Address`);
        if (/^0x/.test(address))
          address = address.toLowerCase();
        return { result: nonces[address] || 0 };
      };
      module.exports = { nonce };
    }
  });

  // sdk/contracts/weavedb/actions/read/version.js
  var require_version = __commonJS({
    "sdk/contracts/weavedb/actions/read/version.js"(exports, module) {
      var { isNil } = require_src();
      var { err } = require_utils();
      var version = async (state, action) => {
        if (isNil(state.version))
          err(`No version assigned`);
        return { result: state.version };
      };
      module.exports = { version };
    }
  });

  // sdk/contracts/weavedb/actions/read/hash.js
  var require_hash = __commonJS({
    "sdk/contracts/weavedb/actions/read/hash.js"(exports, module) {
      var hash = async (state, action) => {
        return { result: state.hash || null };
      };
      module.exports = { hash };
    }
  });

  // sdk/contracts/weavedb/lib/index.js
  var require_lib = __commonJS({
    "sdk/contracts/weavedb/lib/index.js"(exports, module) {
      var {
        intersection,
        uniq,
        concat,
        pluck,
        indexOf,
        slice,
        findIndex,
        append,
        clone,
        keys,
        reverse,
        map,
        isNil,
        range,
        values,
        descend,
        ascend,
        compose,
        prop,
        hasPath,
        filter,
        none,
        difference,
        equals
      } = require_src();
      var comp = (val, x) => {
        let res = 0;
        for (let i of range(0, val.length)) {
          let a = val[i].val;
          let b = x[i];
          if (val[i].desc) {
            a = x[i];
            b = val[i].val;
          }
          if (a > b) {
            res = -1;
            break;
          } else if (a < b) {
            res = 1;
            break;
          }
        }
        return res;
      };
      var bsearch = function(arr, x, k, db, start = 0, end = arr.length - 1) {
        if (start > end)
          return null;
        const mid = Math.floor((start + end) / 2);
        const val = isNil(k) ? arr[mid] : db[arr[mid]].__data[k];
        if (val === x)
          return mid;
        if (val > x && mid === 0)
          return 0;
        if (mid !== 0 && val > x && (isNil(k) ? arr[mid - 1] : db[arr[mid - 1]].__data[k]) <= x) {
          return mid;
        }
        if (val > x) {
          return bsearch(arr, x, k, db, start, mid - 1);
        } else {
          return bsearch(arr, x, k, db, mid + 1, end);
        }
      };
      var addSingleIndex = (_id, k, data, ind, db) => {
        if (!isNil(k) && isNil(ind[k])) {
          ind[k] = { asc: { _: [], subs: {} } };
        }
        const _k = k || "__id__";
        const _data = isNil(k) ? _id : data[k];
        let indexes = ind[_k].asc._;
        const _ind = bsearch(indexes, _data, k, db);
        if (isNil(_ind))
          indexes.push(_id);
        else
          ind[_k].asc._.splice(_ind, 0, _id);
      };
      var removeSingleIndex = (_id, k, ind) => {
        const _k = k || "__id__";
        let indexes = ind[_k].asc._;
        const _ind = indexOf(_id, indexes);
        if (!isNil(_ind))
          ind[_k].asc._.splice(_ind, 1);
      };
      var bsearch2 = function(arr, x, sort, db, start = 0, end = arr.length - 1) {
        if (start > end)
          return null;
        let mid = Math.floor((start + end) / 2);
        const val = map((v) => ({
          desc: v[1] === "desc",
          val: db[arr[mid]].__data[v[0]]
        }))(sort);
        const res = comp(val, x);
        if (res === 0)
          return mid;
        if (res === -1 && mid === 0)
          return 0;
        if (mid > 0) {
          const val2 = map((v) => ({
            desc: v[1] === "desc",
            val: db[arr[mid - 1]].__data[v[0]]
          }))(sort);
          const res2 = comp(val2, x);
          if (res === -1 && res2 >= 0)
            return mid;
        }
        if (res === -1) {
          return bsearch2(arr, x, sort, db, start, mid - 1);
        } else {
          return bsearch2(arr, x, sort, db, mid + 1, end);
        }
      };
      var addInd = (_id, index, db, sort, data) => {
        const x = map((v) => data[v[0]])(sort);
        const _ind = bsearch2(index._, x, sort, db);
        if (isNil(_ind))
          index._.push(_id);
        else
          index._.splice(_ind, 0, _id);
      };
      var removeInd = (_id, index) => {
        const _ind = indexOf(_id, index._);
        if (!isNil(_ind))
          index._.splice(_ind, 1);
      };
      var _addData = (ind, _id, path = [], db, data, top = false) => {
        for (let k in ind) {
          if (k === "__id__")
            continue;
          for (let k2 in ind[k]) {
            if (!isNil(ind[k][k2]._) && !top) {
              let sort = append([k, k2])(path);
              const fields = map(prop(0), sort);
              if (difference(fields, keys(data)).length === 0) {
                addInd(_id, ind[k][k2], db, sort, data);
              }
            }
            _addData(
              ind[k][k2].subs,
              _id,
              compose(append([k, k2]), clone)(path),
              db,
              data
            );
          }
        }
      };
      var getIndex = (state, path) => {
        if (isNil(state.indexes[path.join(".")]))
          state.indexes[path.join(".")] = {};
        return state.indexes[path.join(".")];
      };
      var addData = (_id, data, ind, db) => {
        if (isNil(ind["__id__"])) {
          ind["__id__"] = { asc: { _: [_id], subs: {} } };
        } else {
          addSingleIndex(_id, null, data, ind, db);
        }
        for (let k in data) {
          if (k === "__id__")
            continue;
          if (isNil(ind[k])) {
            ind[k] = { asc: { _: [_id], subs: {} } };
          } else {
            addSingleIndex(_id, k, data, ind, db);
          }
        }
        _addData(ind, _id, [], db, data, true);
      };
      var _updateData = (ind, _id, path = [], db, top = false, update, new_data, old_data) => {
        for (let k in ind) {
          if (k === "__id__")
            continue;
          for (let k2 in ind[k]) {
            if (!isNil(ind[k][k2]._) && !top) {
              let sort = append([k, k2])(path);
              const fields = map(prop(0), sort);
              let ex_old = false;
              let ex_new = false;
              if (difference(fields, keys(old_data)).length === 0)
                ex_old = true;
              if (difference(fields, keys(new_data)).length === 0)
                ex_new = true;
              if (ex_old && !ex_new) {
                removeInd(_id, ind[k][k2]);
              } else if (!ex_old && ex_new) {
                addInd(_id, ind[k][k2], db, sort, new_data);
              } else if (intersection(update.u, fields).length !== 0) {
                removeInd(_id, ind[k][k2]);
                addInd(_id, ind[k][k2], db, sort, new_data);
              }
            }
            _updateData(
              ind[k][k2].subs,
              _id,
              compose(append([k, k2]), clone)(path),
              db,
              false,
              update,
              new_data,
              old_data
            );
          }
        }
      };
      var updateData = (_id, data, old_data, ind, db) => {
        if (isNil(old_data))
          return;
        const _keys = compose(uniq, concat(keys(old_data)), keys)(data);
        let c = [];
        let d = [];
        let u = [];
        for (let v of _keys) {
          if (v === "__id__")
            continue;
          if (isNil(data[v])) {
            d.push(v);
            removeSingleIndex(_id, v, ind);
          } else if (isNil(old_data[v])) {
            c.push(v);
            addSingleIndex(_id, v, data, ind, db);
          } else if (!equals(data[v], old_data[v])) {
            u.push(v);
            removeSingleIndex(_id, v, ind);
            addSingleIndex(_id, v, data, ind, db);
          }
        }
        _updateData(ind, _id, [], db, true, { c, d, u }, data, old_data);
      };
      var _removeData = (ind, _id, path = [], db, top = false) => {
        for (let k in ind) {
          if (k === "__id__")
            continue;
          for (let k2 in ind[k]) {
            if (!isNil(ind[k][k2]._) && !top) {
              let sort = append([k, k2])(path);
              const fields = map(prop(0), sort);
              if (difference(fields, keys(db[_id].__data)).length === 0) {
                removeInd(_id, ind[k][k2]);
              }
            }
            _removeData(
              ind[k][k2].subs,
              _id,
              compose(append([k, k2]), clone)(path),
              db
            );
          }
        }
      };
      var _sort = (sort, ind, db) => {
        const fields = map(prop(0), sort);
        for (let id in db) {
          if (difference(fields, keys(db[id].__data)).length === 0) {
            const x = map((v) => db[id].__data[v[0]])(sort);
            const _ind = bsearch2(ind, x, sort, db);
            if (isNil(_ind))
              ind.push(id);
            else
              ind.splice(_ind, 0, id);
          }
        }
        return ind;
      };
      var removeData = (_id, ind, db) => {
        if (isNil(db[_id]))
          return;
        if (!isNil(ind["__id__"])) {
          removeSingleIndex(_id, null, ind);
        }
        let data = db[_id];
        for (let k in db[_id].__data) {
          if (!isNil(ind[k]))
            removeSingleIndex(_id, k, ind);
        }
        _removeData(ind, _id, [], db, true);
        delete db[_id];
      };
      var _getIndex = (sort, ind) => {
        if (sort.length <= 1)
          return { index: null, ex: false };
        let _ind = ind;
        let i = 0;
        let ex = true;
        for (let v of sort) {
          let subs = i === 0 ? _ind : _ind.subs;
          if (!hasPath([v[0]])(subs)) {
            subs[v[0]] = {};
          }
          if (!hasPath([v[0], v[1] || "asc", "_"])(subs)) {
            if (i === sort.length - 1)
              ex = false;
            subs[v[0]][v[1] || "asc"] = { subs: {} };
          }
          _ind = subs[v[0]][v[1] || "asc"];
          i++;
        }
        return { index: _ind, ex };
      };
      var addIndex = (sort, ind, db) => {
        let { index: _ind, ex } = _getIndex(sort, ind);
        if (isNil(_ind._))
          _ind._ = [];
        if (!ex)
          _ind._ = _sort(sort, _ind._, db);
      };
      var removeIndex = (sort, ind, db) => {
        let { index: _ind, ex } = _getIndex(sort, ind);
        delete _ind._;
      };
      module.exports = {
        getIndex,
        addData,
        removeIndex,
        addIndex,
        _getIndex,
        removeData,
        updateData
      };
    }
  });

  // sdk/contracts/weavedb/actions/read/get.js
  var require_get = __commonJS({
    "sdk/contracts/weavedb/actions/read/get.js"(exports, module) {
      var {
        path: __path,
        hasPath,
        uniq,
        pluck,
        range,
        addIndex,
        keys,
        groupBy,
        flatten,
        sortBy,
        reverse,
        take,
        tail,
        intersection,
        always,
        o,
        compose,
        when,
        last,
        prop,
        values,
        ifElse,
        splitWhen,
        complement,
        is,
        isNil,
        includes,
        append,
        any,
        slice,
        filter,
        map
      } = require_src();
      var { getDoc, getCol, err } = require_utils();
      var { getIndex } = require_lib();
      var parseQuery = (query) => {
        const [path, opt] = splitWhen(complement(is)(String), query);
        let _limit = null;
        let _filter = null;
        let _sort = null;
        let _startAt = null;
        let _startAfter = null;
        let _endAt = null;
        let _endBefore = null;
        for (const v of opt) {
          if (is(Number)(v)) {
            if (isNil(_limit)) {
              _limit = v;
            } else {
              err();
            }
          } else if (is(Array)(v)) {
            if (v.length === 0)
              err();
            if (v[0] === "startAt") {
              if (isNil(_startAt) && v.length > 1 && v.length > 1) {
                _startAt = v;
              } else {
                err();
              }
            } else if (v[0] === "startAfter") {
              if (isNil(_startAfter) && v.length > 1 && v.length > 1) {
                _startAfter = v;
              } else {
                err();
              }
            } else if (v[0] === "endAt") {
              if (isNil(_endAt) && v.length > 1 && v.length > 1) {
                _endAt = v;
              } else {
                err();
              }
            } else if (v[0] === "endBefore") {
              if (isNil(_endBefore) && v.length > 1 && v.length > 1) {
                _endBefore = v;
              } else {
                err();
              }
            } else if (v.length === 3) {
              if (includes(v[1])([
                ">",
                "=",
                "==",
                "!=",
                "<",
                ">=",
                "<=",
                "in",
                "not-in",
                "array-contains",
                "array-contains-any"
              ])) {
                if (isNil(_filter)) {
                  _filter = {};
                }
                if (!isNil(_filter[v[1]]))
                  err();
                _filter[v[1]] = v;
              } else {
                err();
              }
            } else if (v.length === 2) {
              if (includes(v[1])(["asc", "desc"])) {
                if (isNil(_sort)) {
                  _sort = [v];
                } else {
                  _sort.push(v);
                }
              } else {
                err();
              }
            } else if (v.length === 1) {
              if (isNil(_sort)) {
                _sort = [append("asc", v)];
              } else {
                _sort.push(append("asc", v));
              }
            } else {
              err();
            }
          }
        }
        const checkSkip = (a, b) => {
          if (!isNil(a) || !isNil(b)) {
            if (!isNil(a) && !isNil(b))
              err();
            if ((a || b).length < (_sort || []).length)
              err();
          }
        };
        if (isNil(path) || path.length === 0)
          err();
        checkSkip(_startAt, _startAfter);
        checkSkip(_endAt, _endBefore);
        return {
          path,
          _limit,
          _filter,
          _sort,
          _startAt,
          _startAfter,
          _endAt,
          _endBefore
        };
      };
      var getColIndex = (state, data, path, _sort) => {
        let index = [];
        let ind = getIndex(state, path);
        if (!isNil(_sort)) {
          let i = 0;
          let _ind = ind;
          for (let v of _sort) {
            let subs = i === 0 ? _ind : _ind.subs;
            if (isNil(subs[v[0]])) {
              if (i === 0)
                break;
              err();
            }
            _ind = subs[v[0]][_sort.length === 1 ? "asc" : v[1] || "asc"];
            i++;
          }
          index = _ind._ || [];
          if (_sort.length === 1 && _sort[0][1] === "desc")
            index = reverse(index);
        } else {
          index = !isNil(ind.__id__) ? ind.__id__.asc._ : keys(getCol(data, path).__docs);
        }
        return index;
      };
      var comp = (val, x) => {
        let res = 0;
        for (let i of range(0, val.length)) {
          let a = val[i].val;
          let b = x[i];
          if (val[i].desc) {
            a = x[i];
            b = val[i].val;
          }
          if (a > b) {
            res = -1;
            break;
          } else if (a < b) {
            res = 1;
            break;
          }
        }
        return res;
      };
      var bsearch = function(arr, x, sort, db, start = 0, end = arr.length - 1) {
        if (start > end)
          return null;
        let mid = Math.floor((start + end) / 2);
        const val = addIndex(map)((v, i) => ({
          desc: sort[i][1] === "desc",
          val: db[arr[mid]].__data[sort[i][0]]
        }))(tail(x));
        let res = comp(val, tail(x));
        let res2 = 1;
        if (includes(x[0])(["startAt", "startAfter"])) {
          if (mid > 0) {
            const val2 = addIndex(map)((v, i) => ({
              desc: sort[i][1] === "desc",
              val: db[arr[mid - 1]].__data[sort[i][0]]
            }))(tail(x));
            res2 = comp(val2, tail(x));
          }
        } else {
          if (mid < arr.length - 1) {
            const val2 = addIndex(map)((v, i) => ({
              desc: sort[i][1] === "desc",
              val: db[arr[mid + 1]].__data[sort[i][0]]
            }))(tail(x));
            res2 = comp(val2, tail(x));
          }
        }
        let down = false;
        switch (x[0]) {
          case "startAt":
            if (res2 === 1 && res <= 0)
              return mid;
            if (res <= 0)
              down = true;
            break;
          case "startAfter":
            if (res2 >= 0 && res === -1)
              return mid;
            if (res < 0)
              down = true;
            break;
          case "endAt":
            if (res2 === -1 && res >= 0)
              return mid;
            if (res < 0)
              down = true;
            break;
          case "endBefore":
            if (res2 <= 0 && res === 1)
              return mid;
            if (res <= 0)
              down = true;
            break;
        }
        if (down) {
          return bsearch(arr, x, sort, db, start, mid - 1);
        } else {
          return bsearch(arr, x, sort, db, mid + 1, end);
        }
      };
      var get = async (state, action, cursor = false, SmartWeave2) => {
        const {
          path,
          _limit,
          _filter,
          _sort,
          _startAt,
          _endAt,
          _startAfter,
          _endBefore
        } = parseQuery(action.input.query);
        const { data } = state;
        if (path.length % 2 === 0) {
          if (any(complement(isNil))([_limit, _sort, _filter]))
            err();
          const { doc: _data } = getDoc(
            data,
            path,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            SmartWeave2
          );
          return {
            result: isNil(_data.__data) ? null : cursor ? {
              id: last(path),
              setter: _data.setter,
              data: _data.__data || null
            } : _data.__data || null
          };
        } else {
          let index = getColIndex(state, data, path, _sort);
          if (isNil(index))
            err("index doesn't exist");
          const { doc: _data } = path.length === 1 ? { doc: data } : getDoc(
            data,
            slice(0, -1, path),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            SmartWeave2
          );
          const docs = (path.length === 1 ? _data : _data.subs)[last(path)]?.__docs || {};
          let _docs = [];
          let start = null;
          let end = null;
          let _start = _startAt || _startAfter;
          let _end = _endAt || _endBefore;
          if (!isNil(_start)) {
            if (is(Object)(_start[1]) && hasPath([1, "id"])(_start)) {
              start = bsearch(
                index,
                [
                  "startAt",
                  map(
                    (v) => v[0] === "__id__" ? _start[1].id : docs[_start[1].id].__data[v[0]]
                  )(_sort || [["__id__"]])
                ],
                _sort || [["__id__"]],
                docs
              );
              for (let i = start; i < index.length; i++) {
                if (index[i] === _start[1].id) {
                  start = i;
                  break;
                }
              }
              if (!isNil(start)) {
                if (_start[0] === "startAfter")
                  start += 1;
                index.splice(0, start);
              }
            } else {
              start = bsearch(index, _start, _sort || [["__id__"]], docs);
              index.splice(0, start);
            }
          }
          if (!isNil(_end)) {
            if (!isNil(_start)) {
              const len = Math.min(_end.length, _start.length) - 1;
              const val = take(
                len,
                addIndex(map)((v, i) => ({
                  desc: _sort[i][1] === "desc",
                  val: v
                }))(tail(_start))
              );
              if (comp(val, tail(_end)) === -1)
                err();
            }
            if (is(Object)(_end[1]) && hasPath([1, "id"])(_end)) {
              end = bsearch(
                index,
                [
                  "startAt",
                  map(
                    (v) => v[0] === "__id__" ? _end[1].id : docs[_end[1].id].__data[v[0]]
                  )(_sort || [["__id__"]])
                ],
                _sort || [["__id__"]],
                docs
              );
              for (let i = end; i < index.length; i++) {
                if (index[i] === _end[1].id) {
                  end = i;
                  break;
                }
              }
              if (!isNil(end)) {
                if (_end[0] === "endBefore" && end !== 0)
                  end -= 1;
                index.splice(end + 1, index.length - end);
              }
            } else {
              end = bsearch(index, _end, _sort || [["__id__"]], docs);
              index.splice(end + 1, index.length - end);
            }
          }
          let res = index;
          if (!isNil(_filter)) {
            res = [];
            const sort_field = compose(
              uniq,
              pluck(0),
              filter((v) => includes(v[1])([">", ">=", "<", "<=", "!=", "not-in"])),
              values
            )(_filter);
            if (sort_field.length > 1) {
              err();
            }
            if (sort_field.length === 1 && (isNil(_sort) || _sort[0][0] !== sort_field[0])) {
              err();
            }
            const getField = (_path, data2) => __path(_path.split("."), data2);
            for (let _v of index) {
              const v = docs[_v].__data;
              let ok = true;
              for (let v2 of values(_filter)) {
                if (isNil(v[v2[0]]) && v[v2[0]] !== null) {
                  ok = false;
                }
                const field = getField(v2[0], v);
                switch (v2[1]) {
                  case ">":
                    ok = field > v2[2];
                    break;
                  case "<":
                    ok = field < v2[2];
                    break;
                  case ">=":
                    ok = field >= v2[2];
                    break;
                  case "<=":
                    ok = field <= v2[2];
                    break;
                  case "=":
                  case "==":
                    ok = field === v2[2];
                    break;
                  case "!=":
                    ok = field !== v2[2];
                    break;
                  case "in":
                    ok = includes(field)(v2[2]);
                    break;
                  case "not-in":
                    ok = !includes(field)(v2[2]);
                    break;
                  case "array-contains":
                    ok = is(Array, field) && includes(v2[2])(field);
                    break;
                  case "array-contains-any":
                    ok = is(Array, field) && intersection(v2[2])(field).length > 0;
                    break;
                }
                if (!ok)
                  break;
              }
              if (ok) {
                res.push(_v);
                if (!isNil(_limit) && res.length >= _limit)
                  break;
              }
            }
          }
          return {
            result: compose(
              when(o(complement(isNil), always(_limit)), take(_limit)),
              map(
                (v) => cursor ? {
                  id: v,
                  setter: docs[v].setter,
                  data: docs[v].__data
                } : docs[v].__data
              )
            )(res)
          };
        }
      };
      module.exports = { get, parseQuery };
    }
  });

  // sdk/contracts/weavedb/actions/read/getSchema.js
  var require_getSchema = __commonJS({
    "sdk/contracts/weavedb/actions/read/getSchema.js"(exports, module) {
      var { isNil, mergeLeft } = require_src();
      var { parse } = require_utils();
      var getSchema = async (state, action) => {
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "getSchema"
        );
        return { result: _data.schema || null };
      };
      module.exports = { getSchema };
    }
  });

  // sdk/contracts/weavedb/actions/read/getRules.js
  var require_getRules = __commonJS({
    "sdk/contracts/weavedb/actions/read/getRules.js"(exports, module) {
      var { parse } = require_utils();
      var getRules = async (state, action) => {
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "getRules"
        );
        return { result: _data.rules || null };
      };
      module.exports = { getRules };
    }
  });

  // sdk/contracts/weavedb/actions/read/getIndexes.js
  var require_getIndexes = __commonJS({
    "sdk/contracts/weavedb/actions/read/getIndexes.js"(exports, module) {
      var { isNil } = require_src();
      var { err } = require_utils();
      var { getIndex } = require_lib();
      var scanIndexes = (ind) => {
        let indexes = [];
        for (let k in ind) {
          for (let k2 in ind[k]) {
            const _ind = [[k, k2]];
            if (!isNil(ind[k][k2]._))
              indexes.push(_ind);
            if (!isNil(ind[k][k2].subs)) {
              const sub_indexes = scanIndexes(ind[k][k2].subs);
              for (let v of sub_indexes) {
                indexes.push([..._ind, ...v]);
              }
            }
          }
        }
        return indexes;
      };
      var getIndexes = async (state, action) => {
        const path = action.input.query;
        if (path.length % 2 === 0)
          err();
        const index = getIndex(state, path);
        return {
          result: scanIndexes(index)
        };
      };
      module.exports = { getIndexes };
    }
  });

  // sdk/contracts/weavedb/actions/read/getCrons.js
  var require_getCrons = __commonJS({
    "sdk/contracts/weavedb/actions/read/getCrons.js"(exports, module) {
      var { isNil } = require_src();
      var getCrons = async (state, action) => {
        if (isNil(state.crons)) {
          state.crons = { lastExecuted: Math.round(Date.now() / 1e3), crons: {} };
        }
        return {
          result: state.crons
        };
      };
      module.exports = { getCrons };
    }
  });

  // sdk/contracts/weavedb/actions/read/getAlgorithms.js
  var require_getAlgorithms = __commonJS({
    "sdk/contracts/weavedb/actions/read/getAlgorithms.js"(exports, module) {
      var { isNil } = require_src();
      var getAlgorithms = async (state, action) => {
        if (isNil(state.auth.algorithms)) {
          state.auth.algorithms = ["secp256k1", "ed25519", "rsa256", "poseidon"];
        }
        return {
          result: state.auth.algorithms
        };
      };
      module.exports = {
        getAlgorithms
      };
    }
  });

  // sdk/contracts/weavedb/actions/read/getLinkedContract.js
  var require_getLinkedContract = __commonJS({
    "sdk/contracts/weavedb/actions/read/getLinkedContract.js"(exports, module) {
      var { isNil } = require_src();
      var getLinkedContract = async (state, action) => {
        const contracts = state.contracts || {};
        return {
          result: contracts[action.input.query[0]] || null
        };
      };
      module.exports = {
        getLinkedContract
      };
    }
  });

  // sdk/contracts/weavedb/actions/read/getOwner.js
  var require_getOwner = __commonJS({
    "sdk/contracts/weavedb/actions/read/getOwner.js"(exports, module) {
      var { is, of } = require_src();
      var getOwner = async (state, action) => {
        let owner = state.owner || [];
        if (is(String)(owner))
          owner = of(owner);
        return { result: owner };
      };
      module.exports = { getOwner };
    }
  });

  // sdk/contracts/weavedb/actions/read/getAddressLink.js
  var require_getAddressLink = __commonJS({
    "sdk/contracts/weavedb/actions/read/getAddressLink.js"(exports, module) {
      var { is, isNil } = require_src();
      var getAddressLink = async (state, action) => {
        const { address } = action.input.query;
        const link = state.auth.links[address.toLowerCase()];
        if (isNil(link))
          return { result: null };
        let _address = is(Object, link) ? link.address : link;
        let _expiry = is(Object, link) ? link.expiry || 0 : 0;
        return {
          result: { address: _address, expiry: _expiry }
        };
      };
      module.exports = { getAddressLink };
    }
  });

  // sdk/contracts/weavedb/actions/read/getRelayerJob.js
  var require_getRelayerJob = __commonJS({
    "sdk/contracts/weavedb/actions/read/getRelayerJob.js"(exports, module) {
      var getRelayerJob = async (state, action) => {
        const jobs = state.relayers || {};
        return { result: jobs[action.input.query[0]] || null };
      };
      module.exports = { getRelayerJob };
    }
  });

  // sdk/contracts/weavedb/actions/read/listRelayerJobs.js
  var require_listRelayerJobs = __commonJS({
    "sdk/contracts/weavedb/actions/read/listRelayerJobs.js"(exports, module) {
      var { keys } = require_src();
      var listRelayerJobs = async (state, action) => {
        return {
          result: keys(state.relayers || {})
        };
      };
      module.exports = { listRelayerJobs };
    }
  });

  // sdk/contracts/weavedb/actions/read/getEvolve.js
  var require_getEvolve = __commonJS({
    "sdk/contracts/weavedb/actions/read/getEvolve.js"(exports, module) {
      var { pickAll } = require_src();
      var { isEvolving } = require_utils();
      var getEvolve = async (state, action) => {
        let evolve = pickAll(["canEvolve", "evolve"])(state);
        evolve.history = state.evolveHistory || [];
        evolve.isEvolving = isEvolving(state);
        return { result: evolve };
      };
      module.exports = { getEvolve };
    }
  });

  // sdk/contracts/weavedb/actions/read/listCollections.js
  var require_listCollections = __commonJS({
    "sdk/contracts/weavedb/actions/read/listCollections.js"(exports, module) {
      var { keys, isNil, mergeLeft } = require_src();
      var { parse } = require_utils();
      var listCollections = async (state, action) => {
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "listCollections"
        );
        return {
          result: keys(path.length === 0 ? data : _data.subs)
        };
      };
      module.exports = {
        listCollections
      };
    }
  });

  // sdk/contracts/weavedb/actions/read/getInfo.js
  var require_getInfo = __commonJS({
    "sdk/contracts/weavedb/actions/read/getInfo.js"(exports, module) {
      var { pick } = require_src();
      var { isEvolving } = require_utils();
      var getInfo = async (state, action) => {
        let info = pick(
          [
            "auth",
            "canEvolve",
            "contracts",
            "evolve",
            "secure",
            "owner",
            "contracts"
          ],
          state
        );
        delete info.auth.links;
        info.version = state.version || null;
        info.evolveHistory = state.evolveHistory || [];
        info.isEvolving = isEvolving(state);
        return { result: info };
      };
      module.exports = { getInfo };
    }
  });

  // sdk/contracts/weavedb/lib/validate.js
  var require_validate = __commonJS({
    "sdk/contracts/weavedb/lib/validate.js"(exports, module) {
      var { is, includes, isNil } = require_src();
      var { err, read } = require_utils();
      var validate = async (state, action, func, SmartWeave2, use_nonce = true) => {
        const {
          query,
          nonce,
          signature,
          caller,
          type = "secp256k1",
          pubKey
        } = action.input;
        if (!includes(type)(
          state.auth.algorithms || ["secp256k1", "secp256k1-2", "ed25519", "rsa256"]
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
          verifyingContract: isNil(SmartWeave2.contract) ? "exm" : SmartWeave2.contract.id
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
        if (type === "ed25519") {
          const { isValid } = await read(
            state.contracts.dfinity,
            {
              function: "verify",
              data: _data,
              signature,
              signer: caller
            },
            SmartWeave2
          );
          if (isValid) {
            signer = caller;
          } else {
            err(`The wrong signature`);
          }
        } else if (type === "rsa256") {
          let encoded_data = JSON.stringify(_data);
          if (typeof TextEncoder !== "undefined") {
            const enc = new TextEncoder();
            encoded_data = enc.encode(encoded_data);
          }
          const _crypto = SmartWeave2.arweave.crypto || SmartWeave2.arweave.wallets.crypto;
          const isValid = await _crypto.verify(
            pubKey,
            encoded_data,
            Buffer.from(signature, "hex")
          );
          if (isValid) {
            signer = caller;
          } else {
            err(`The wrong signature`);
          }
        } else if (type == "secp256k1") {
          signer = (await read(
            state.contracts.ethereum,
            {
              function: "verify712",
              data: _data,
              signature
            },
            SmartWeave2
          )).signer;
        } else if (type == "secp256k1-2") {
          signer = (await read(
            state.contracts.ethereum,
            {
              function: "verify",
              data: _data,
              signature
            },
            SmartWeave2
          )).signer;
        }
        if (includes(type)(["secp256k1", "secp256k1-2"])) {
          if (/^0x/.test(signer))
            signer = signer.toLowerCase();
          if (/^0x/.test(_caller))
            _caller = _caller.toLowerCase();
        }
        let original_signer = signer;
        let _signer = signer;
        if (_signer !== _caller) {
          const link = state.auth.links[_signer];
          if (!isNil(link)) {
            let _address = is(Object, link) ? link.address : link;
            let _expiry = is(Object, link) ? link.expiry || 0 : 0;
            if (_expiry === 0 || SmartWeave2.block.timestamp <= _expiry) {
              _signer = _address;
            }
          }
        }
        if (_signer !== _caller)
          err(`signer[${_signer}] is not caller[${_caller}]`);
        let next_nonce = (state.nonces[original_signer] || 0) + 1;
        if (next_nonce !== nonce) {
          err(
            `The wrong nonce[${nonce}] for ${original_signer}: expected ${next_nonce}`
          );
        }
        if (isNil(state.nonces[original_signer]))
          state.nonces[original_signer] = 0;
        if (use_nonce !== false)
          state.nonces[original_signer] += 1;
        return { signer: _signer, original_signer };
      };
      module.exports = { validate };
    }
  });

  // sdk/contracts/weavedb/actions/write/set.js
  var require_set2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/set.js"(exports, module) {
      var { init, last, isNil, clone } = require_src();
      var { err, wrapResult, parse, validateSchema } = require_utils();
      var { validate } = require_validate();
      var { updateData, addData, getIndex } = require_lib();
      var set = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "set",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path, schema, col, next_data } = await parse(state, action, "set", signer, 0, contractErr, SmartWeave2);
        let prev = clone(_data.__data);
        validateSchema(schema, next_data, contractErr);
        let ind = getIndex(state, init(path));
        if (isNil(prev)) {
          addData(last(path), next_data, ind, col.__docs);
        } else {
          updateData(last(path), next_data, prev, ind, col.__docs);
        }
        _data.__data = next_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { set };
    }
  });

  // sdk/contracts/weavedb/actions/write/upsert.js
  var require_upsert = __commonJS({
    "sdk/contracts/weavedb/actions/write/upsert.js"(exports, module) {
      var { isNil, init, last } = require_src();
      var { wrapResult, parse, clone, validateSchema } = require_utils();
      var { validate } = require_validate();
      var { updateData, addData, getIndex } = require_lib();
      var upsert = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "upsert",
            SmartWeave2
          ));
        }
        let { data, query, _signer, new_data, path, schema, _data, col, next_data } = await parse(state, action, "upsert", signer, 0, contractErr, SmartWeave2);
        let prev = clone(_data.__data);
        validateSchema(schema, next_data, contractErr);
        let ind = getIndex(state, init(path));
        if (isNil(prev)) {
          addData(last(path), next_data, ind, col.__docs);
        } else {
          updateData(last(path), next_data, prev, ind, col.__docs);
        }
        _data.__data = next_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { upsert };
    }
  });

  // sdk/contracts/weavedb/actions/write/update.js
  var require_update2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/update.js"(exports, module) {
      var { isNil, init, last } = require_src();
      var {
        wrapResult,
        err,
        clone,
        parse,
        validateSchema
      } = require_utils();
      var { validate } = require_validate();
      var { updateData, getIndex } = require_lib();
      var update = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "update",
            SmartWeave2
          ));
        }
        let { data, query, new_data, path, _data, schema, col, next_data } = await parse(state, action, "update", signer, 0, contractErr, SmartWeave2);
        if (isNil(_data.__data))
          err(`Data doesn't exist`);
        let prev = clone(_data.__data);
        validateSchema(schema, next_data, contractErr);
        let ind = getIndex(state, init(path));
        updateData(last(path), next_data, prev, ind, col.__docs);
        _data.__data = next_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { update };
    }
  });

  // sdk/contracts/weavedb/actions/write/remove.js
  var require_remove2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/remove.js"(exports, module) {
      var { isNil, last, init } = require_src();
      var { wrapResult, err, parse } = require_utils();
      var { validate } = require_validate();
      var { removeData, getIndex } = require_lib();
      var remove = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "delete",
            SmartWeave2
          ));
        }
        const { data, query, new_data, path, _data, col } = await parse(
          state,
          action,
          "delete",
          signer,
          0,
          contractErr,
          SmartWeave2
        );
        if (isNil(_data.__data))
          err(`Data doesn't exist`);
        let ind = getIndex(state, init(path));
        removeData(last(path), ind, col.__docs);
        _data.__data = null;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { remove };
    }
  });

  // sdk/contracts/weavedb/actions/write/addOwner.js
  var require_addOwner = __commonJS({
    "sdk/contracts/weavedb/actions/write/addOwner.js"(exports, module) {
      var { err, wrapResult, isOwner } = require_utils();
      var { includes, is, of, append, isNil } = require_src();
      var { validate } = require_validate();
      var addOwner = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "addOwner",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (!is(String)(action.input.query.address)) {
          err("Value must be string.");
        }
        if (!is(String)(action.input.query.address)) {
          err("Value must be string.");
        }
        if (includes(action.input.query.address, owner)) {
          err("The owner already exists.");
        }
        state.owner = append(action.input.query.address, owner);
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { addOwner };
    }
  });

  // sdk/contracts/weavedb/actions/write/removeOwner.js
  var require_removeOwner = __commonJS({
    "sdk/contracts/weavedb/actions/write/removeOwner.js"(exports, module) {
      var { wrapResult, err, isOwner } = require_utils();
      var { isNil, without, includes, is, of } = require_src();
      var { validate } = require_validate();
      var removeOwner = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "removeOwner",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (!is(String)(action.input.query.address)) {
          err("Value must be string.");
        }
        if (!includes(action.input.query.address, owner)) {
          err("The owner doesn't exist.");
        }
        state.owner = without([action.input.query.address], owner);
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { removeOwner };
    }
  });

  // sdk/contracts/weavedb/actions/write/setAlgorithms.js
  var require_setAlgorithms = __commonJS({
    "sdk/contracts/weavedb/actions/write/setAlgorithms.js"(exports, module) {
      var { isNil, is, intersection } = require_src();
      var { parse, err, wrapResult } = require_utils();
      var { validate } = require_validate();
      var setAlgorithms = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "setAlgorithms",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "setAlgorithms",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        if (!is(Array)(new_data) || intersection(new_data)(["secp256k1", "ed25519", "rsa256", "secp256k1-2"]).length !== new_data.length) {
          err(`The wrong algorithms`);
        }
        state.auth.algorithms = new_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { setAlgorithms };
    }
  });

  // sdk/contracts/weavedb/actions/write/setCanEvolve.js
  var require_setCanEvolve = __commonJS({
    "sdk/contracts/weavedb/actions/write/setCanEvolve.js"(exports, module) {
      var { wrapResult, err, isOwner } = require_utils();
      var { isNil, is } = require_src();
      var { validate } = require_validate();
      var setCanEvolve = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "setCanEvolve",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (!is(Boolean)(action.input.query.value)) {
          err("Value must be a boolean.");
        }
        state.canEvolve = action.input.query.value;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { setCanEvolve };
    }
  });

  // sdk/contracts/weavedb/actions/write/setSecure.js
  var require_setSecure = __commonJS({
    "sdk/contracts/weavedb/actions/write/setSecure.js"(exports, module) {
      var { wrapResult, err, isOwner } = require_utils();
      var { isNil, is } = require_src();
      var { validate } = require_validate();
      var setSecure = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "setSecure",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (!is(Boolean)(action.input.query.value)) {
          err("Value must be a boolean.");
        }
        state.secure = action.input.query.value;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { setSecure };
    }
  });

  // sdk/contracts/weavedb/actions/write/setSchema.js
  var require_setSchema = __commonJS({
    "sdk/contracts/weavedb/actions/write/setSchema.js"(exports, module) {
      var { isNil, mergeLeft } = require_src();
      var { err, wrapResult, clone, parse, mergeData } = require_utils();
      var { validate } = require_validate();
      var { validate: validator } = require_jsonschema();
      var setSchema = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "setSchema",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "setSchema",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        _data.schema = new_data;
        try {
          validator(void 0, clone(_data.schema));
        } catch (e) {
          err("schema error");
        }
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { setSchema };
    }
  });

  // sdk/contracts/weavedb/actions/write/addIndex.js
  var require_addIndex2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/addIndex.js"(exports, module) {
      var { o, flatten, isNil, mergeLeft, includes, init } = require_src();
      var { parse } = require_utils();
      var { wrapResult, err } = require_utils();
      var { validate } = require_validate();
      var { addIndex: _addIndex, getIndex } = require_lib();
      var addIndex = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "addIndex",
            SmartWeave2
          ));
        }
        let { col, _data, data, query, new_data, path } = await parse(
          state,
          action,
          "addIndex",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        let ind = getIndex(state, path);
        if (o(includes("__id__"), flatten)(new_data)) {
          err("index cannot contain __id__");
        }
        _addIndex(new_data, ind, col.__docs);
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { addIndex };
    }
  });

  // sdk/contracts/weavedb/actions/write/removeIndex.js
  var require_removeIndex = __commonJS({
    "sdk/contracts/weavedb/actions/write/removeIndex.js"(exports, module) {
      var { isNil, mergeLeft, init } = require_src();
      var { err, wrapResult, parse, mergeData } = require_utils();
      var { validate } = require_validate();
      var { removeIndex: _removeIndex, getIndex } = require_lib();
      var removeIndex = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "removeIndex",
            SmartWeave2
          ));
        }
        let { col, _data, data, query, new_data, path } = await parse(
          state,
          action,
          "removeIndex",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        let ind = getIndex(state, path);
        _removeIndex(new_data, ind, col.__docs);
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { removeIndex };
    }
  });

  // sdk/contracts/weavedb/actions/write/setRules.js
  var require_setRules = __commonJS({
    "sdk/contracts/weavedb/actions/write/setRules.js"(exports, module) {
      var { isNil, mergeLeft, includes, difference, is } = require_src();
      var { wrapResult, err, parse, mergeData } = require_utils();
      var { validate } = require_validate();
      var jsonLogic = require_logic();
      var setRules = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "setRules",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "setRules",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        for (let k in new_data) {
          const keys = k.split(" ");
          const permission = keys[0];
          if (keys.length !== 2 && permission !== "let")
            err();
          if (!includes(permission)(["allow", "deny", "let"]))
            err();
          if (keys.length === 2) {
            const ops = keys[1].split(",");
            if (difference(ops, ["write", "create", "update", "delete"]).length > 0) {
              err();
            }
          }
          if (permission !== "let" && !is(Boolean)(jsonLogic.apply(new_data[k], {}))) {
            err();
          }
        }
        _data.rules = new_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { setRules };
    }
  });

  // sdk/contracts/weavedb/actions/write/removeCron.js
  var require_removeCron = __commonJS({
    "sdk/contracts/weavedb/actions/write/removeCron.js"(exports, module) {
      var { isNil, mergeLeft, init } = require_src();
      var {
        wrapResult,
        err,
        isOwner,
        parse,
        mergeData
      } = require_utils();
      var { validate } = require_validate();
      var { addIndex: _addIndex, getIndex } = require_lib();
      var removeCron = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "removeCron",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (isNil(state.crons)) {
          state.crons = { lastExecuted: SmartWeave2.block.timestamp, crons: {} };
        }
        const [key] = action.input.query;
        if (isNil(state.crons.crons[key]))
          err("cron doesn't exist");
        delete state.crons.crons[key];
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { removeCron };
    }
  });

  // sdk/contracts/weavedb/actions/write/addRelayerJob.js
  var require_addRelayerJob = __commonJS({
    "sdk/contracts/weavedb/actions/write/addRelayerJob.js"(exports, module) {
      var { isNil, is, intersection } = require_src();
      var { parse, wrapResult, err, clone } = require_utils();
      var { validate } = require_validate();
      var { validate: validator } = require_jsonschema();
      var addRelayerJob = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "addRelayerJob",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "addRelayerJob",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        const [jobID, job] = query;
        if (!isNil(job.relayers) && !is(Array, job.relayers)) {
          err("relayers must be Array");
        }
        if (!isNil(job.signers) && !is(Array, job.signers)) {
          err("signers must be Array");
        }
        if (!isNil(job.schema)) {
          try {
            validator(void 0, clone(job.schema));
          } catch (e) {
            err("schema error");
          }
        }
        if (isNil(state.relayers))
          state.relayers = {};
        state.relayers[jobID] = job;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { addRelayerJob };
    }
  });

  // sdk/contracts/weavedb/actions/write/removeRelayerJob.js
  var require_removeRelayerJob = __commonJS({
    "sdk/contracts/weavedb/actions/write/removeRelayerJob.js"(exports, module) {
      var { isNil, is, intersection } = require_src();
      var { parse, wrapResult, err, clone } = require_utils();
      var { validate } = require_validate();
      var { validate: validator } = require_jsonschema();
      var removeRelayerJob = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "removeRelayerJob",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "removeRelayerJob",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        const [jobID] = query;
        if (isNil(state.relayers[jobID]))
          err("relayer job doesn't exist");
        delete state.relayers[jobID];
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { removeRelayerJob };
    }
  });

  // sdk/contracts/weavedb/actions/write/linkContract.js
  var require_linkContract = __commonJS({
    "sdk/contracts/weavedb/actions/write/linkContract.js"(exports, module) {
      var { isNil, is } = require_src();
      var { validate } = require_validate();
      var { wrapResult, err, parse } = require_utils();
      var linkContract = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "linkContract",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "linkContract",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        const [key, address] = action.input.query;
        if (isNil(key) || isNil(address)) {
          err(`Key or Address not specified`);
        }
        if (isNil(state.contracts))
          state.contracts = {};
        state.contracts[key] = address;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { linkContract };
    }
  });

  // sdk/contracts/weavedb/actions/write/unlinkContract.js
  var require_unlinkContract = __commonJS({
    "sdk/contracts/weavedb/actions/write/unlinkContract.js"(exports, module) {
      var { isNil, is } = require_src();
      var { validate } = require_validate();
      var { wrapResult, err, parse } = require_utils();
      var unlinkContract = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "unlinkContract",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path } = await parse(
          state,
          action,
          "unlinkContract",
          signer,
          null,
          contractErr,
          SmartWeave2
        );
        const [key] = action.input.query;
        if (isNil(key)) {
          throw new ContractError(`Key not specified`);
        }
        if (isNil(state.contracts))
          state.contracts = {};
        delete state.contracts[key];
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { unlinkContract };
    }
  });

  // sdk/contracts/weavedb/actions/write/removeAddressLink.js
  var require_removeAddressLink = __commonJS({
    "sdk/contracts/weavedb/actions/write/removeAddressLink.js"(exports, module) {
      var { is, isNil } = require_src();
      var { validate } = require_validate();
      var { err, wrapResult } = require_utils();
      var removeAddressLink = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "removeAddressLink",
            SmartWeave2
          ));
        }
        const { address } = action.input.query;
        const link = state.auth.links[address.toLowerCase()];
        if (isNil(link))
          err("link doesn't exist");
        let _address = is(Object, link) ? link.address : link;
        if (signer !== address.toLowerCase() && signer !== _address) {
          err("signer is neither owner nor delegator");
        }
        delete state.auth.links[address.toLowerCase()];
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { removeAddressLink };
    }
  });

  // sdk/contracts/weavedb/actions/write/add.js
  var require_add2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/add.js"(exports, module) {
      var { isNil, over, lensPath, append, init, last } = require_src();
      var {
        err,
        parse,
        mergeData,
        getCol,
        validateSchema,
        wrapResult
      } = require_utils();
      var { validate } = require_validate();
      var { addData, getIndex } = require_lib();
      var add = async (state, action, signer, salt = 0, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "add",
            SmartWeave2
          ));
        }
        let { _data, data, query, new_data, path, schema, col, next_data } = await parse(state, action, "add", signer, salt, contractErr, SmartWeave2);
        if (!isNil(_data.__data))
          err("doc already exists");
        validateSchema(schema, next_data, contractErr);
        let ind = getIndex(state, init(path));
        addData(last(path), next_data, ind, col.__docs);
        _data.__data = next_data;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { add };
    }
  });

  // sdk/contracts/weavedb/actions/write/batch.js
  var require_batch = __commonJS({
    "sdk/contracts/weavedb/actions/write/batch.js"(exports, module) {
      var { includes, isNil, clone } = require_src();
      var { wrapResult, err, parse, mergeData } = require_utils();
      var { validate } = require_validate();
      var { set } = require_set2();
      var { add } = require_add2();
      var { update } = require_update2();
      var { upsert } = require_upsert();
      var { remove } = require_remove2();
      var { setRules } = require_setRules();
      var { setSchema } = require_setSchema();
      var { setCanEvolve } = require_setCanEvolve();
      var { setSecure } = require_setSecure();
      var { setAlgorithms } = require_setAlgorithms();
      var { addIndex } = require_addIndex2();
      var { addOwner } = require_addOwner();
      var { addRelayerJob } = require_addRelayerJob();
      var { removeCron } = require_removeCron();
      var { removeIndex } = require_removeIndex();
      var { removeOwner } = require_removeOwner();
      var { removeRelayerJob } = require_removeRelayerJob();
      var batch = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "batch",
            SmartWeave2
          ));
        }
        let _state = state;
        let i = 0;
        for (let v of action.input.query) {
          let [op, ...query] = v;
          const _action = includes(op)(["addOwner", "removeOwner"]) ? {
            input: { function: op, query: { address: query[0] } },
            caller: action.caller
          } : includes(op)(["setCanEvolve", "setSecure"]) ? {
            input: { function: op, query: { value: query[0] } },
            caller: action.caller
          } : { input: { function: op, query }, caller: action.caller };
          let res = null;
          switch (op) {
            case "add":
              res = await add(_state, _action, signer, i, contractErr, SmartWeave2);
              break;
            case "set":
              res = await set(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "update":
              res = await update(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "upsert":
              res = await upsert(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "delete":
              res = await remove(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "setRules":
              res = await setRules(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "setSchema":
              res = await setSchema(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "setCanEvolve":
              res = await setCanEvolve(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            case "setSecure":
              res = await setSecure(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "setAlgorithms":
              res = await setAlgorithms(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            case "addIndex":
              res = await addIndex(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "addOwner":
              res = await addOwner(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "addRelayerJob":
              res = await addRelayerJob(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            case "addCron":
              const { addCron } = require_addCron();
              res = await addCron(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "removeCron":
              res = await removeCron(_state, _action, signer, contractErr, SmartWeave2);
              break;
            case "removeIndex":
              res = await removeIndex(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            case "removeOwner":
              res = await removeOwner(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            case "removeRelayerJob":
              res = await removeRelayerJob(
                _state,
                _action,
                signer,
                contractErr,
                SmartWeave2
              );
              break;
            default:
              const msg = `No function supplied or function not recognised: "${op}"`;
              if (contractErr) {
                err(msg);
              } else {
                throw msg;
              }
          }
          _state = res.state;
          i++;
        }
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { batch };
    }
  });

  // sdk/contracts/weavedb/lib/cron.js
  var require_cron = __commonJS({
    "sdk/contracts/weavedb/lib/cron.js"(exports, module) {
      var fpjson = require_cjs();
      var { path, is, map, isNil, includes, sortBy, prop, head } = require_src();
      var { clone } = require_utils();
      var { get } = require_get();
      var { upsert } = require_upsert();
      var { update } = require_update2();
      var { add } = require_add2();
      var { remove } = require_remove2();
      var { set } = require_set2();
      var { batch } = require_batch();
      var executeCron = async (cron2, state, SmartWeave2) => {
        let vars = {
          block: {
            height: SmartWeave2.block.height,
            timestamp: SmartWeave2.block.timestamp
          }
        };
        let ops = { upsert, update, add, delete: remove, set, batch };
        const parse = (query) => {
          if (is(Array, query)) {
            query = map((v) => is(Object, v) ? parse(v) : v)(query);
          } else if (is(Object, query)) {
            if (is(String, query.var)) {
              return path(query.var.split("."))(vars);
            } else {
              query = map((v) => parse(v))(query);
            }
          }
          return query;
        };
        for (let job of cron2.crons.jobs) {
          const op = head(job);
          let _var = null;
          let query = null;
          if (includes(op)(["get", "let"])) {
            _var = job[1];
            query = job[2];
          } else {
            query = job[1];
          }
          if (op === "do") {
            fpjson(query, vars);
          } else if (op === "let") {
            vars[_var] = fpjson(query, vars);
          } else if (op === "get") {
            const _default = job[3];
            vars[_var] = (await get(state, {
              caller: state.owner,
              input: { function: "get", query: await parse(query) }
            })).result || _default;
          } else if (includes(op)(["set", "upsert", "add", "delete", "update", "batch"])) {
            let params = [
              state,
              {
                caller: state.owner,
                input: { function: op, query: await parse(query) }
              },
              true
            ];
            if (op === "add")
              params.push(0);
            params.push(false);
            params.push(SmartWeave2);
            await ops[op](...params);
          }
        }
      };
      var cron = async (state, SmartWeave2) => {
        const now = SmartWeave2.block.timestamp;
        if (isNil(state.crons)) {
          state.crons = { lastExecuted: now, crons: {} };
        }
        const last = state.crons.lastExecuted;
        let crons = [];
        for (let k in state.crons.crons) {
          const v = state.crons.crons[k];
          let start = v.start;
          let end = v.end;
          let times = v.do ? 1 : 0;
          while (start <= now && (isNil(v.times) || v.times >= times)) {
            if (start > last && isNil(end) || end >= start) {
              if (start !== v.start || v.do)
                crons.push({ start, crons: v });
            }
            start += v.span;
            times += 1;
          }
        }
        crons = sortBy(prop("start"))(crons);
        let _state = clone(state);
        for (let cron2 of crons) {
          try {
            await executeCron(cron2, _state, SmartWeave2);
          } catch (e) {
            console.log(e);
          }
        }
        _state.crons.lastExecuted = SmartWeave2.block.timestamp;
        return { state: _state };
      };
      module.exports = { cron, executeCron };
    }
  });

  // sdk/contracts/weavedb/actions/write/addCron.js
  var require_addCron = __commonJS({
    "sdk/contracts/weavedb/actions/write/addCron.js"(exports, module) {
      var { isNil } = require_src();
      var { wrapResult, err, clone, isOwner } = require_utils();
      var { validate } = require_validate();
      var { executeCron } = require_cron();
      var c = require_cron();
      var addCron = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "addCron",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (isNil(state.crons)) {
          state.crons = { lastExecuted: SmartWeave2.block.timestamp, crons: {} };
        }
        const [cron, key] = action.input.query;
        let _cron = clone(cron);
        if (isNil(_cron.start)) {
          _cron.start = SmartWeave2.block.timestamp;
        }
        if (SmartWeave2.block.timestamp > _cron.start) {
          err("start cannot be before the block time");
        }
        if (!isNil(_cron.end) && SmartWeave2.block.timestamp > _cron.end) {
          err("end cannot be before start");
        }
        if (isNil(_cron.jobs) || _cron.jobs.length === 0) {
          err("cron has no jobs");
        }
        if (isNil(_cron.span) || Number.isNaN(_cron.span * 1) || _cron.span <= 0) {
          err("span must be greater than 0");
        }
        state.crons.crons[key] = _cron;
        if (_cron.do) {
          try {
            await executeCron({ start: _cron.start, crons: _cron }, state, SmartWeave2);
          } catch (e) {
            console.log(e);
            err("cron failed to execute");
          }
        }
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { addCron };
    }
  });

  // sdk/contracts/weavedb/actions/write/addAddressLink.js
  var require_addAddressLink = __commonJS({
    "sdk/contracts/weavedb/actions/write/addAddressLink.js"(exports, module) {
      var { is, isNil } = require_src();
      var { err, wrapResult } = require_utils();
      var { validate } = require_validate();
      var addAddressLink = async (state, action, signer, contractErr = true, SmartWeave2, _linkTo) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "addAddressLink",
            SmartWeave2
          ));
        }
        const { address, signature, expiry, linkTo } = action.input.query;
        if ((!isNil(linkTo) || !isNil(_linkTo)) && linkTo !== _linkTo)
          err("linkTo doesn't match");
        if (!isNil(expiry) && !is(Number, expiry))
          err("expiry must be a number");
        const { nonce } = action.input;
        let _expiry = expiry || 0;
        const EIP712Domain = [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "verifyingContract", type: "string" }
        ];
        const domain = {
          name: state.auth.name,
          version: state.auth.version,
          verifyingContract: SmartWeave2.contract.id
        };
        let query = typeof expiry === "undefined" ? { address: signer } : { address: signer, expiry };
        if (!isNil(linkTo))
          query.linkTo = linkTo;
        const message = {
          nonce,
          query: JSON.stringify({
            func: "auth",
            query
          })
        };
        const data = {
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
        let signer2 = (await SmartWeave2.contracts.viewContractState(state.contracts.ethereum, {
          function: "verify712",
          data,
          signature
        })).result.signer;
        const _signer = signer2.toLowerCase();
        if (_signer !== address.toLowerCase())
          err();
        const link = state.auth.links[address.toLowerCase()];
        if (!isNil(link)) {
          let prev_expiry = is(Object, link) ? link.expiry || 0 : 0;
          if (SmartWeave2.block.timestamp < prev_expiry) {
            err("link already exists");
          }
        }
        state.auth.links[address.toLowerCase()] = {
          address: linkTo || signer,
          expiry: expiry === 0 ? 0 : SmartWeave2.block.timestamp + expiry
        };
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { addAddressLink };
    }
  });

  // sdk/contracts/weavedb/actions/write/evolve.js
  var require_evolve2 = __commonJS({
    "sdk/contracts/weavedb/actions/write/evolve.js"(exports, module) {
      var { isNil, is, of, includes, mergeLeft } = require_src();
      var { wrapResult, err, isOwner } = require_utils();
      var { validate } = require_validate();
      var evolve = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "evolve",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (action.input.value !== action.input.query.value) {
          err("Values don't match.");
        }
        if (state.canEvolve) {
          state.evolve = action.input.value;
        } else {
          err(`This contract cannot evolve.`);
        }
        state.evolveHistory ||= [];
        state.evolveHistory.push({
          signer,
          block: SmartWeave2.block.height,
          date: SmartWeave2.block.timestamp,
          srcTxId: action.input.value,
          oldVersion: state.version
        });
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { evolve };
    }
  });

  // node_modules/pako/lib/zlib/trees.js
  var require_trees = __commonJS({
    "node_modules/pako/lib/zlib/trees.js"(exports, module) {
      "use strict";
      var Z_FIXED = 4;
      var Z_BINARY = 0;
      var Z_TEXT = 1;
      var Z_UNKNOWN = 2;
      function zero(buf) {
        let len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      }
      var STORED_BLOCK = 0;
      var STATIC_TREES = 1;
      var DYN_TREES = 2;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var Buf_size = 16;
      var MAX_BL_BITS = 7;
      var END_BLOCK = 256;
      var REP_3_6 = 16;
      var REPZ_3_10 = 17;
      var REPZ_11_138 = 18;
      var extra_lbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
      var extra_dbits = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
      var extra_blbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]);
      var bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var DIST_CODE_LEN = 512;
      var static_ltree = new Array((L_CODES + 2) * 2);
      zero(static_ltree);
      var static_dtree = new Array(D_CODES * 2);
      zero(static_dtree);
      var _dist_code = new Array(DIST_CODE_LEN);
      zero(_dist_code);
      var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
      zero(_length_code);
      var base_length = new Array(LENGTH_CODES);
      zero(base_length);
      var base_dist = new Array(D_CODES);
      zero(base_dist);
      function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
        this.static_tree = static_tree;
        this.extra_bits = extra_bits;
        this.extra_base = extra_base;
        this.elems = elems;
        this.max_length = max_length;
        this.has_stree = static_tree && static_tree.length;
      }
      var static_l_desc;
      var static_d_desc;
      var static_bl_desc;
      function TreeDesc(dyn_tree, stat_desc) {
        this.dyn_tree = dyn_tree;
        this.max_code = 0;
        this.stat_desc = stat_desc;
      }
      var d_code = (dist) => {
        return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
      };
      var put_short = (s, w) => {
        s.pending_buf[s.pending++] = w & 255;
        s.pending_buf[s.pending++] = w >>> 8 & 255;
      };
      var send_bits = (s, value, length) => {
        if (s.bi_valid > Buf_size - length) {
          s.bi_buf |= value << s.bi_valid & 65535;
          put_short(s, s.bi_buf);
          s.bi_buf = value >> Buf_size - s.bi_valid;
          s.bi_valid += length - Buf_size;
        } else {
          s.bi_buf |= value << s.bi_valid & 65535;
          s.bi_valid += length;
        }
      };
      var send_code = (s, c, tree) => {
        send_bits(s, tree[c * 2], tree[c * 2 + 1]);
      };
      var bi_reverse = (code, len) => {
        let res = 0;
        do {
          res |= code & 1;
          code >>>= 1;
          res <<= 1;
        } while (--len > 0);
        return res >>> 1;
      };
      var bi_flush = (s) => {
        if (s.bi_valid === 16) {
          put_short(s, s.bi_buf);
          s.bi_buf = 0;
          s.bi_valid = 0;
        } else if (s.bi_valid >= 8) {
          s.pending_buf[s.pending++] = s.bi_buf & 255;
          s.bi_buf >>= 8;
          s.bi_valid -= 8;
        }
      };
      var gen_bitlen = (s, desc) => {
        const tree = desc.dyn_tree;
        const max_code = desc.max_code;
        const stree = desc.stat_desc.static_tree;
        const has_stree = desc.stat_desc.has_stree;
        const extra = desc.stat_desc.extra_bits;
        const base = desc.stat_desc.extra_base;
        const max_length = desc.stat_desc.max_length;
        let h;
        let n, m;
        let bits;
        let xbits;
        let f;
        let overflow = 0;
        for (bits = 0; bits <= MAX_BITS; bits++) {
          s.bl_count[bits] = 0;
        }
        tree[s.heap[s.heap_max] * 2 + 1] = 0;
        for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
          n = s.heap[h];
          bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
          if (bits > max_length) {
            bits = max_length;
            overflow++;
          }
          tree[n * 2 + 1] = bits;
          if (n > max_code) {
            continue;
          }
          s.bl_count[bits]++;
          xbits = 0;
          if (n >= base) {
            xbits = extra[n - base];
          }
          f = tree[n * 2];
          s.opt_len += f * (bits + xbits);
          if (has_stree) {
            s.static_len += f * (stree[n * 2 + 1] + xbits);
          }
        }
        if (overflow === 0) {
          return;
        }
        do {
          bits = max_length - 1;
          while (s.bl_count[bits] === 0) {
            bits--;
          }
          s.bl_count[bits]--;
          s.bl_count[bits + 1] += 2;
          s.bl_count[max_length]--;
          overflow -= 2;
        } while (overflow > 0);
        for (bits = max_length; bits !== 0; bits--) {
          n = s.bl_count[bits];
          while (n !== 0) {
            m = s.heap[--h];
            if (m > max_code) {
              continue;
            }
            if (tree[m * 2 + 1] !== bits) {
              s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
              tree[m * 2 + 1] = bits;
            }
            n--;
          }
        }
      };
      var gen_codes = (tree, max_code, bl_count) => {
        const next_code = new Array(MAX_BITS + 1);
        let code = 0;
        let bits;
        let n;
        for (bits = 1; bits <= MAX_BITS; bits++) {
          code = code + bl_count[bits - 1] << 1;
          next_code[bits] = code;
        }
        for (n = 0; n <= max_code; n++) {
          let len = tree[n * 2 + 1];
          if (len === 0) {
            continue;
          }
          tree[n * 2] = bi_reverse(next_code[len]++, len);
        }
      };
      var tr_static_init = () => {
        let n;
        let bits;
        let length;
        let code;
        let dist;
        const bl_count = new Array(MAX_BITS + 1);
        length = 0;
        for (code = 0; code < LENGTH_CODES - 1; code++) {
          base_length[code] = length;
          for (n = 0; n < 1 << extra_lbits[code]; n++) {
            _length_code[length++] = code;
          }
        }
        _length_code[length - 1] = code;
        dist = 0;
        for (code = 0; code < 16; code++) {
          base_dist[code] = dist;
          for (n = 0; n < 1 << extra_dbits[code]; n++) {
            _dist_code[dist++] = code;
          }
        }
        dist >>= 7;
        for (; code < D_CODES; code++) {
          base_dist[code] = dist << 7;
          for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
            _dist_code[256 + dist++] = code;
          }
        }
        for (bits = 0; bits <= MAX_BITS; bits++) {
          bl_count[bits] = 0;
        }
        n = 0;
        while (n <= 143) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        while (n <= 255) {
          static_ltree[n * 2 + 1] = 9;
          n++;
          bl_count[9]++;
        }
        while (n <= 279) {
          static_ltree[n * 2 + 1] = 7;
          n++;
          bl_count[7]++;
        }
        while (n <= 287) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        gen_codes(static_ltree, L_CODES + 1, bl_count);
        for (n = 0; n < D_CODES; n++) {
          static_dtree[n * 2 + 1] = 5;
          static_dtree[n * 2] = bi_reverse(n, 5);
        }
        static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
        static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
        static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
      };
      var init_block = (s) => {
        let n;
        for (n = 0; n < L_CODES; n++) {
          s.dyn_ltree[n * 2] = 0;
        }
        for (n = 0; n < D_CODES; n++) {
          s.dyn_dtree[n * 2] = 0;
        }
        for (n = 0; n < BL_CODES; n++) {
          s.bl_tree[n * 2] = 0;
        }
        s.dyn_ltree[END_BLOCK * 2] = 1;
        s.opt_len = s.static_len = 0;
        s.sym_next = s.matches = 0;
      };
      var bi_windup = (s) => {
        if (s.bi_valid > 8) {
          put_short(s, s.bi_buf);
        } else if (s.bi_valid > 0) {
          s.pending_buf[s.pending++] = s.bi_buf;
        }
        s.bi_buf = 0;
        s.bi_valid = 0;
      };
      var smaller = (tree, n, m, depth) => {
        const _n2 = n * 2;
        const _m2 = m * 2;
        return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
      };
      var pqdownheap = (s, tree, k) => {
        const v = s.heap[k];
        let j = k << 1;
        while (j <= s.heap_len) {
          if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
            j++;
          }
          if (smaller(tree, v, s.heap[j], s.depth)) {
            break;
          }
          s.heap[k] = s.heap[j];
          k = j;
          j <<= 1;
        }
        s.heap[k] = v;
      };
      var compress_block = (s, ltree, dtree) => {
        let dist;
        let lc;
        let sx = 0;
        let code;
        let extra;
        if (s.sym_next !== 0) {
          do {
            dist = s.pending_buf[s.sym_buf + sx++] & 255;
            dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
            lc = s.pending_buf[s.sym_buf + sx++];
            if (dist === 0) {
              send_code(s, lc, ltree);
            } else {
              code = _length_code[lc];
              send_code(s, code + LITERALS + 1, ltree);
              extra = extra_lbits[code];
              if (extra !== 0) {
                lc -= base_length[code];
                send_bits(s, lc, extra);
              }
              dist--;
              code = d_code(dist);
              send_code(s, code, dtree);
              extra = extra_dbits[code];
              if (extra !== 0) {
                dist -= base_dist[code];
                send_bits(s, dist, extra);
              }
            }
          } while (sx < s.sym_next);
        }
        send_code(s, END_BLOCK, ltree);
      };
      var build_tree = (s, desc) => {
        const tree = desc.dyn_tree;
        const stree = desc.stat_desc.static_tree;
        const has_stree = desc.stat_desc.has_stree;
        const elems = desc.stat_desc.elems;
        let n, m;
        let max_code = -1;
        let node;
        s.heap_len = 0;
        s.heap_max = HEAP_SIZE;
        for (n = 0; n < elems; n++) {
          if (tree[n * 2] !== 0) {
            s.heap[++s.heap_len] = max_code = n;
            s.depth[n] = 0;
          } else {
            tree[n * 2 + 1] = 0;
          }
        }
        while (s.heap_len < 2) {
          node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
          tree[node * 2] = 1;
          s.depth[node] = 0;
          s.opt_len--;
          if (has_stree) {
            s.static_len -= stree[node * 2 + 1];
          }
        }
        desc.max_code = max_code;
        for (n = s.heap_len >> 1; n >= 1; n--) {
          pqdownheap(s, tree, n);
        }
        node = elems;
        do {
          n = s.heap[1];
          s.heap[1] = s.heap[s.heap_len--];
          pqdownheap(s, tree, 1);
          m = s.heap[1];
          s.heap[--s.heap_max] = n;
          s.heap[--s.heap_max] = m;
          tree[node * 2] = tree[n * 2] + tree[m * 2];
          s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
          tree[n * 2 + 1] = tree[m * 2 + 1] = node;
          s.heap[1] = node++;
          pqdownheap(s, tree, 1);
        } while (s.heap_len >= 2);
        s.heap[--s.heap_max] = s.heap[1];
        gen_bitlen(s, desc);
        gen_codes(tree, max_code, s.bl_count);
      };
      var scan_tree = (s, tree, max_code) => {
        let n;
        let prevlen = -1;
        let curlen;
        let nextlen = tree[0 * 2 + 1];
        let count = 0;
        let max_count = 7;
        let min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        tree[(max_code + 1) * 2 + 1] = 65535;
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            s.bl_tree[curlen * 2] += count;
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              s.bl_tree[curlen * 2]++;
            }
            s.bl_tree[REP_3_6 * 2]++;
          } else if (count <= 10) {
            s.bl_tree[REPZ_3_10 * 2]++;
          } else {
            s.bl_tree[REPZ_11_138 * 2]++;
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      };
      var send_tree = (s, tree, max_code) => {
        let n;
        let prevlen = -1;
        let curlen;
        let nextlen = tree[0 * 2 + 1];
        let count = 0;
        let max_count = 7;
        let min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            do {
              send_code(s, curlen, s.bl_tree);
            } while (--count !== 0);
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              send_code(s, curlen, s.bl_tree);
              count--;
            }
            send_code(s, REP_3_6, s.bl_tree);
            send_bits(s, count - 3, 2);
          } else if (count <= 10) {
            send_code(s, REPZ_3_10, s.bl_tree);
            send_bits(s, count - 3, 3);
          } else {
            send_code(s, REPZ_11_138, s.bl_tree);
            send_bits(s, count - 11, 7);
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      };
      var build_bl_tree = (s) => {
        let max_blindex;
        scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
        scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
        build_tree(s, s.bl_desc);
        for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
          if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
            break;
          }
        }
        s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
        return max_blindex;
      };
      var send_all_trees = (s, lcodes, dcodes, blcodes) => {
        let rank;
        send_bits(s, lcodes - 257, 5);
        send_bits(s, dcodes - 1, 5);
        send_bits(s, blcodes - 4, 4);
        for (rank = 0; rank < blcodes; rank++) {
          send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
        }
        send_tree(s, s.dyn_ltree, lcodes - 1);
        send_tree(s, s.dyn_dtree, dcodes - 1);
      };
      var detect_data_type = (s) => {
        let block_mask = 4093624447;
        let n;
        for (n = 0; n <= 31; n++, block_mask >>>= 1) {
          if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
            return Z_BINARY;
          }
        }
        if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
          return Z_TEXT;
        }
        for (n = 32; n < LITERALS; n++) {
          if (s.dyn_ltree[n * 2] !== 0) {
            return Z_TEXT;
          }
        }
        return Z_BINARY;
      };
      var static_init_done = false;
      var _tr_init = (s) => {
        if (!static_init_done) {
          tr_static_init();
          static_init_done = true;
        }
        s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
        s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
        s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
        s.bi_buf = 0;
        s.bi_valid = 0;
        init_block(s);
      };
      var _tr_stored_block = (s, buf, stored_len, last) => {
        send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
        bi_windup(s);
        put_short(s, stored_len);
        put_short(s, ~stored_len);
        if (stored_len) {
          s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
        }
        s.pending += stored_len;
      };
      var _tr_align = (s) => {
        send_bits(s, STATIC_TREES << 1, 3);
        send_code(s, END_BLOCK, static_ltree);
        bi_flush(s);
      };
      var _tr_flush_block = (s, buf, stored_len, last) => {
        let opt_lenb, static_lenb;
        let max_blindex = 0;
        if (s.level > 0) {
          if (s.strm.data_type === Z_UNKNOWN) {
            s.strm.data_type = detect_data_type(s);
          }
          build_tree(s, s.l_desc);
          build_tree(s, s.d_desc);
          max_blindex = build_bl_tree(s);
          opt_lenb = s.opt_len + 3 + 7 >>> 3;
          static_lenb = s.static_len + 3 + 7 >>> 3;
          if (static_lenb <= opt_lenb) {
            opt_lenb = static_lenb;
          }
        } else {
          opt_lenb = static_lenb = stored_len + 5;
        }
        if (stored_len + 4 <= opt_lenb && buf !== -1) {
          _tr_stored_block(s, buf, stored_len, last);
        } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
          send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
          compress_block(s, static_ltree, static_dtree);
        } else {
          send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
          send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
          compress_block(s, s.dyn_ltree, s.dyn_dtree);
        }
        init_block(s);
        if (last) {
          bi_windup(s);
        }
      };
      var _tr_tally = (s, dist, lc) => {
        s.pending_buf[s.sym_buf + s.sym_next++] = dist;
        s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
        s.pending_buf[s.sym_buf + s.sym_next++] = lc;
        if (dist === 0) {
          s.dyn_ltree[lc * 2]++;
        } else {
          s.matches++;
          dist--;
          s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
          s.dyn_dtree[d_code(dist) * 2]++;
        }
        return s.sym_next === s.sym_end;
      };
      module.exports._tr_init = _tr_init;
      module.exports._tr_stored_block = _tr_stored_block;
      module.exports._tr_flush_block = _tr_flush_block;
      module.exports._tr_tally = _tr_tally;
      module.exports._tr_align = _tr_align;
    }
  });

  // node_modules/pako/lib/zlib/adler32.js
  var require_adler32 = __commonJS({
    "node_modules/pako/lib/zlib/adler32.js"(exports, module) {
      "use strict";
      var adler32 = (adler, buf, len, pos) => {
        let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
        while (len !== 0) {
          n = len > 2e3 ? 2e3 : len;
          len -= n;
          do {
            s1 = s1 + buf[pos++] | 0;
            s2 = s2 + s1 | 0;
          } while (--n);
          s1 %= 65521;
          s2 %= 65521;
        }
        return s1 | s2 << 16 | 0;
      };
      module.exports = adler32;
    }
  });

  // node_modules/pako/lib/zlib/crc32.js
  var require_crc32 = __commonJS({
    "node_modules/pako/lib/zlib/crc32.js"(exports, module) {
      "use strict";
      var makeTable = () => {
        let c, table = [];
        for (var n = 0; n < 256; n++) {
          c = n;
          for (var k = 0; k < 8; k++) {
            c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
          }
          table[n] = c;
        }
        return table;
      };
      var crcTable = new Uint32Array(makeTable());
      var crc32 = (crc, buf, len, pos) => {
        const t = crcTable;
        const end = pos + len;
        crc ^= -1;
        for (let i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
        }
        return crc ^ -1;
      };
      module.exports = crc32;
    }
  });

  // node_modules/pako/lib/zlib/messages.js
  var require_messages = __commonJS({
    "node_modules/pako/lib/zlib/messages.js"(exports, module) {
      "use strict";
      module.exports = {
        2: "need dictionary",
        1: "stream end",
        0: "",
        "-1": "file error",
        "-2": "stream error",
        "-3": "data error",
        "-4": "insufficient memory",
        "-5": "buffer error",
        "-6": "incompatible version"
      };
    }
  });

  // node_modules/pako/lib/zlib/constants.js
  var require_constants = __commonJS({
    "node_modules/pako/lib/zlib/constants.js"(exports, module) {
      "use strict";
      module.exports = {
        Z_NO_FLUSH: 0,
        Z_PARTIAL_FLUSH: 1,
        Z_SYNC_FLUSH: 2,
        Z_FULL_FLUSH: 3,
        Z_FINISH: 4,
        Z_BLOCK: 5,
        Z_TREES: 6,
        Z_OK: 0,
        Z_STREAM_END: 1,
        Z_NEED_DICT: 2,
        Z_ERRNO: -1,
        Z_STREAM_ERROR: -2,
        Z_DATA_ERROR: -3,
        Z_MEM_ERROR: -4,
        Z_BUF_ERROR: -5,
        Z_NO_COMPRESSION: 0,
        Z_BEST_SPEED: 1,
        Z_BEST_COMPRESSION: 9,
        Z_DEFAULT_COMPRESSION: -1,
        Z_FILTERED: 1,
        Z_HUFFMAN_ONLY: 2,
        Z_RLE: 3,
        Z_FIXED: 4,
        Z_DEFAULT_STRATEGY: 0,
        Z_BINARY: 0,
        Z_TEXT: 1,
        Z_UNKNOWN: 2,
        Z_DEFLATED: 8
      };
    }
  });

  // node_modules/pako/lib/zlib/deflate.js
  var require_deflate = __commonJS({
    "node_modules/pako/lib/zlib/deflate.js"(exports, module) {
      "use strict";
      var { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = require_trees();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var msg = require_messages();
      var {
        Z_NO_FLUSH,
        Z_PARTIAL_FLUSH,
        Z_FULL_FLUSH,
        Z_FINISH,
        Z_BLOCK,
        Z_OK,
        Z_STREAM_END,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_BUF_ERROR,
        Z_DEFAULT_COMPRESSION,
        Z_FILTERED,
        Z_HUFFMAN_ONLY,
        Z_RLE,
        Z_FIXED,
        Z_DEFAULT_STRATEGY,
        Z_UNKNOWN,
        Z_DEFLATED
      } = require_constants();
      var MAX_MEM_LEVEL = 9;
      var MAX_WBITS = 15;
      var DEF_MEM_LEVEL = 8;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
      var PRESET_DICT = 32;
      var INIT_STATE = 42;
      var GZIP_STATE = 57;
      var EXTRA_STATE = 69;
      var NAME_STATE = 73;
      var COMMENT_STATE = 91;
      var HCRC_STATE = 103;
      var BUSY_STATE = 113;
      var FINISH_STATE = 666;
      var BS_NEED_MORE = 1;
      var BS_BLOCK_DONE = 2;
      var BS_FINISH_STARTED = 3;
      var BS_FINISH_DONE = 4;
      var OS_CODE = 3;
      var err = (strm, errorCode) => {
        strm.msg = msg[errorCode];
        return errorCode;
      };
      var rank = (f) => {
        return f * 2 - (f > 4 ? 9 : 0);
      };
      var zero = (buf) => {
        let len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      };
      var slide_hash = (s) => {
        let n, m;
        let p;
        let wsize = s.w_size;
        n = s.hash_size;
        p = n;
        do {
          m = s.head[--p];
          s.head[p] = m >= wsize ? m - wsize : 0;
        } while (--n);
        n = wsize;
        p = n;
        do {
          m = s.prev[--p];
          s.prev[p] = m >= wsize ? m - wsize : 0;
        } while (--n);
      };
      var HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
      var HASH = HASH_ZLIB;
      var flush_pending = (strm) => {
        const s = strm.state;
        let len = s.pending;
        if (len > strm.avail_out) {
          len = strm.avail_out;
        }
        if (len === 0) {
          return;
        }
        strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
        strm.next_out += len;
        s.pending_out += len;
        strm.total_out += len;
        strm.avail_out -= len;
        s.pending -= len;
        if (s.pending === 0) {
          s.pending_out = 0;
        }
      };
      var flush_block_only = (s, last) => {
        _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
        s.block_start = s.strstart;
        flush_pending(s.strm);
      };
      var put_byte = (s, b) => {
        s.pending_buf[s.pending++] = b;
      };
      var putShortMSB = (s, b) => {
        s.pending_buf[s.pending++] = b >>> 8 & 255;
        s.pending_buf[s.pending++] = b & 255;
      };
      var read_buf = (strm, buf, start, size) => {
        let len = strm.avail_in;
        if (len > size) {
          len = size;
        }
        if (len === 0) {
          return 0;
        }
        strm.avail_in -= len;
        buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
        if (strm.state.wrap === 1) {
          strm.adler = adler32(strm.adler, buf, len, start);
        } else if (strm.state.wrap === 2) {
          strm.adler = crc32(strm.adler, buf, len, start);
        }
        strm.next_in += len;
        strm.total_in += len;
        return len;
      };
      var longest_match = (s, cur_match) => {
        let chain_length = s.max_chain_length;
        let scan = s.strstart;
        let match;
        let len;
        let best_len = s.prev_length;
        let nice_match = s.nice_match;
        const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
        const _win = s.window;
        const wmask = s.w_mask;
        const prev = s.prev;
        const strend = s.strstart + MAX_MATCH;
        let scan_end1 = _win[scan + best_len - 1];
        let scan_end = _win[scan + best_len];
        if (s.prev_length >= s.good_match) {
          chain_length >>= 2;
        }
        if (nice_match > s.lookahead) {
          nice_match = s.lookahead;
        }
        do {
          match = cur_match;
          if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
            continue;
          }
          scan += 2;
          match++;
          do {
          } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
          len = MAX_MATCH - (strend - scan);
          scan = strend - MAX_MATCH;
          if (len > best_len) {
            s.match_start = cur_match;
            best_len = len;
            if (len >= nice_match) {
              break;
            }
            scan_end1 = _win[scan + best_len - 1];
            scan_end = _win[scan + best_len];
          }
        } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
        if (best_len <= s.lookahead) {
          return best_len;
        }
        return s.lookahead;
      };
      var fill_window = (s) => {
        const _w_size = s.w_size;
        let n, more, str;
        do {
          more = s.window_size - s.lookahead - s.strstart;
          if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
            s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
            s.match_start -= _w_size;
            s.strstart -= _w_size;
            s.block_start -= _w_size;
            if (s.insert > s.strstart) {
              s.insert = s.strstart;
            }
            slide_hash(s);
            more += _w_size;
          }
          if (s.strm.avail_in === 0) {
            break;
          }
          n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
          s.lookahead += n;
          if (s.lookahead + s.insert >= MIN_MATCH) {
            str = s.strstart - s.insert;
            s.ins_h = s.window[str];
            s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
            while (s.insert) {
              s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
              s.prev[str & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = str;
              str++;
              s.insert--;
              if (s.lookahead + s.insert < MIN_MATCH) {
                break;
              }
            }
          }
        } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
      };
      var deflate_stored = (s, flush) => {
        let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
        let len, left, have, last = 0;
        let used = s.strm.avail_in;
        do {
          len = 65535;
          have = s.bi_valid + 42 >> 3;
          if (s.strm.avail_out < have) {
            break;
          }
          have = s.strm.avail_out - have;
          left = s.strstart - s.block_start;
          if (len > left + s.strm.avail_in) {
            len = left + s.strm.avail_in;
          }
          if (len > have) {
            len = have;
          }
          if (len < min_block && (len === 0 && flush !== Z_FINISH || flush === Z_NO_FLUSH || len !== left + s.strm.avail_in)) {
            break;
          }
          last = flush === Z_FINISH && len === left + s.strm.avail_in ? 1 : 0;
          _tr_stored_block(s, 0, 0, last);
          s.pending_buf[s.pending - 4] = len;
          s.pending_buf[s.pending - 3] = len >> 8;
          s.pending_buf[s.pending - 2] = ~len;
          s.pending_buf[s.pending - 1] = ~len >> 8;
          flush_pending(s.strm);
          if (left) {
            if (left > len) {
              left = len;
            }
            s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
            s.strm.next_out += left;
            s.strm.avail_out -= left;
            s.strm.total_out += left;
            s.block_start += left;
            len -= left;
          }
          if (len) {
            read_buf(s.strm, s.strm.output, s.strm.next_out, len);
            s.strm.next_out += len;
            s.strm.avail_out -= len;
            s.strm.total_out += len;
          }
        } while (last === 0);
        used -= s.strm.avail_in;
        if (used) {
          if (used >= s.w_size) {
            s.matches = 2;
            s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
            s.strstart = s.w_size;
            s.insert = s.strstart;
          } else {
            if (s.window_size - s.strstart <= used) {
              s.strstart -= s.w_size;
              s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
              if (s.matches < 2) {
                s.matches++;
              }
              if (s.insert > s.strstart) {
                s.insert = s.strstart;
              }
            }
            s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
            s.strstart += used;
            s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
          }
          s.block_start = s.strstart;
        }
        if (s.high_water < s.strstart) {
          s.high_water = s.strstart;
        }
        if (last) {
          return BS_FINISH_DONE;
        }
        if (flush !== Z_NO_FLUSH && flush !== Z_FINISH && s.strm.avail_in === 0 && s.strstart === s.block_start) {
          return BS_BLOCK_DONE;
        }
        have = s.window_size - s.strstart;
        if (s.strm.avail_in > have && s.block_start >= s.w_size) {
          s.block_start -= s.w_size;
          s.strstart -= s.w_size;
          s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
          if (s.matches < 2) {
            s.matches++;
          }
          have += s.w_size;
          if (s.insert > s.strstart) {
            s.insert = s.strstart;
          }
        }
        if (have > s.strm.avail_in) {
          have = s.strm.avail_in;
        }
        if (have) {
          read_buf(s.strm, s.window, s.strstart, have);
          s.strstart += have;
          s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
        }
        if (s.high_water < s.strstart) {
          s.high_water = s.strstart;
        }
        have = s.bi_valid + 42 >> 3;
        have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
        min_block = have > s.w_size ? s.w_size : have;
        left = s.strstart - s.block_start;
        if (left >= min_block || (left || flush === Z_FINISH) && flush !== Z_NO_FLUSH && s.strm.avail_in === 0 && left <= have) {
          len = left > have ? have : left;
          last = flush === Z_FINISH && s.strm.avail_in === 0 && len === left ? 1 : 0;
          _tr_stored_block(s, s.block_start, len, last);
          s.block_start += len;
          flush_pending(s.strm);
        }
        return last ? BS_FINISH_STARTED : BS_NEED_MORE;
      };
      var deflate_fast = (s, flush) => {
        let hash_head;
        let bflush;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
              s.match_length--;
              do {
                s.strstart++;
                s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              } while (--s.match_length !== 0);
              s.strstart++;
            } else {
              s.strstart += s.match_length;
              s.match_length = 0;
              s.ins_h = s.window[s.strstart];
              s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
            }
          } else {
            bflush = _tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_slow = (s, flush) => {
        let hash_head;
        let bflush;
        let max_insert;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          s.prev_length = s.match_length;
          s.prev_match = s.match_start;
          s.match_length = MIN_MATCH - 1;
          if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
            if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
              s.match_length = MIN_MATCH - 1;
            }
          }
          if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
            max_insert = s.strstart + s.lookahead - MIN_MATCH;
            bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
            s.lookahead -= s.prev_length - 1;
            s.prev_length -= 2;
            do {
              if (++s.strstart <= max_insert) {
                s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              }
            } while (--s.prev_length !== 0);
            s.match_available = 0;
            s.match_length = MIN_MATCH - 1;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          } else if (s.match_available) {
            bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
            if (bflush) {
              flush_block_only(s, false);
            }
            s.strstart++;
            s.lookahead--;
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          } else {
            s.match_available = 1;
            s.strstart++;
            s.lookahead--;
          }
        }
        if (s.match_available) {
          bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
          s.match_available = 0;
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_rle = (s, flush) => {
        let bflush;
        let prev;
        let scan, strend;
        const _win = s.window;
        for (; ; ) {
          if (s.lookahead <= MAX_MATCH) {
            fill_window(s);
            if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.match_length = 0;
          if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
            scan = s.strstart - 1;
            prev = _win[scan];
            if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
              strend = s.strstart + MAX_MATCH;
              do {
              } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
              s.match_length = MAX_MATCH - (strend - scan);
              if (s.match_length > s.lookahead) {
                s.match_length = s.lookahead;
              }
            }
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            s.strstart += s.match_length;
            s.match_length = 0;
          } else {
            bflush = _tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_huff = (s, flush) => {
        let bflush;
        for (; ; ) {
          if (s.lookahead === 0) {
            fill_window(s);
            if (s.lookahead === 0) {
              if (flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              break;
            }
          }
          s.match_length = 0;
          bflush = _tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      function Config(good_length, max_lazy, nice_length, max_chain, func) {
        this.good_length = good_length;
        this.max_lazy = max_lazy;
        this.nice_length = nice_length;
        this.max_chain = max_chain;
        this.func = func;
      }
      var configuration_table = [
        new Config(0, 0, 0, 0, deflate_stored),
        new Config(4, 4, 8, 4, deflate_fast),
        new Config(4, 5, 16, 8, deflate_fast),
        new Config(4, 6, 32, 32, deflate_fast),
        new Config(4, 4, 16, 16, deflate_slow),
        new Config(8, 16, 32, 32, deflate_slow),
        new Config(8, 16, 128, 128, deflate_slow),
        new Config(8, 32, 128, 256, deflate_slow),
        new Config(32, 128, 258, 1024, deflate_slow),
        new Config(32, 258, 258, 4096, deflate_slow)
      ];
      var lm_init = (s) => {
        s.window_size = 2 * s.w_size;
        zero(s.head);
        s.max_lazy_match = configuration_table[s.level].max_lazy;
        s.good_match = configuration_table[s.level].good_length;
        s.nice_match = configuration_table[s.level].nice_length;
        s.max_chain_length = configuration_table[s.level].max_chain;
        s.strstart = 0;
        s.block_start = 0;
        s.lookahead = 0;
        s.insert = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        s.ins_h = 0;
      };
      function DeflateState() {
        this.strm = null;
        this.status = 0;
        this.pending_buf = null;
        this.pending_buf_size = 0;
        this.pending_out = 0;
        this.pending = 0;
        this.wrap = 0;
        this.gzhead = null;
        this.gzindex = 0;
        this.method = Z_DEFLATED;
        this.last_flush = -1;
        this.w_size = 0;
        this.w_bits = 0;
        this.w_mask = 0;
        this.window = null;
        this.window_size = 0;
        this.prev = null;
        this.head = null;
        this.ins_h = 0;
        this.hash_size = 0;
        this.hash_bits = 0;
        this.hash_mask = 0;
        this.hash_shift = 0;
        this.block_start = 0;
        this.match_length = 0;
        this.prev_match = 0;
        this.match_available = 0;
        this.strstart = 0;
        this.match_start = 0;
        this.lookahead = 0;
        this.prev_length = 0;
        this.max_chain_length = 0;
        this.max_lazy_match = 0;
        this.level = 0;
        this.strategy = 0;
        this.good_match = 0;
        this.nice_match = 0;
        this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
        this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
        this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
        zero(this.dyn_ltree);
        zero(this.dyn_dtree);
        zero(this.bl_tree);
        this.l_desc = null;
        this.d_desc = null;
        this.bl_desc = null;
        this.bl_count = new Uint16Array(MAX_BITS + 1);
        this.heap = new Uint16Array(2 * L_CODES + 1);
        zero(this.heap);
        this.heap_len = 0;
        this.heap_max = 0;
        this.depth = new Uint16Array(2 * L_CODES + 1);
        zero(this.depth);
        this.sym_buf = 0;
        this.lit_bufsize = 0;
        this.sym_next = 0;
        this.sym_end = 0;
        this.opt_len = 0;
        this.static_len = 0;
        this.matches = 0;
        this.insert = 0;
        this.bi_buf = 0;
        this.bi_valid = 0;
      }
      var deflateStateCheck = (strm) => {
        if (!strm) {
          return 1;
        }
        const s = strm.state;
        if (!s || s.strm !== strm || s.status !== INIT_STATE && s.status !== GZIP_STATE && s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) {
          return 1;
        }
        return 0;
      };
      var deflateResetKeep = (strm) => {
        if (deflateStateCheck(strm)) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.total_in = strm.total_out = 0;
        strm.data_type = Z_UNKNOWN;
        const s = strm.state;
        s.pending = 0;
        s.pending_out = 0;
        if (s.wrap < 0) {
          s.wrap = -s.wrap;
        }
        s.status = s.wrap === 2 ? GZIP_STATE : s.wrap ? INIT_STATE : BUSY_STATE;
        strm.adler = s.wrap === 2 ? 0 : 1;
        s.last_flush = -2;
        _tr_init(s);
        return Z_OK;
      };
      var deflateReset = (strm) => {
        const ret = deflateResetKeep(strm);
        if (ret === Z_OK) {
          lm_init(strm.state);
        }
        return ret;
      };
      var deflateSetHeader = (strm, head) => {
        if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
          return Z_STREAM_ERROR;
        }
        strm.state.gzhead = head;
        return Z_OK;
      };
      var deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        let wrap = 1;
        if (level === Z_DEFAULT_COMPRESSION) {
          level = 6;
        }
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else if (windowBits > 15) {
          wrap = 2;
          windowBits -= 16;
        }
        if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) {
          return err(strm, Z_STREAM_ERROR);
        }
        if (windowBits === 8) {
          windowBits = 9;
        }
        const s = new DeflateState();
        strm.state = s;
        s.strm = strm;
        s.status = INIT_STATE;
        s.wrap = wrap;
        s.gzhead = null;
        s.w_bits = windowBits;
        s.w_size = 1 << s.w_bits;
        s.w_mask = s.w_size - 1;
        s.hash_bits = memLevel + 7;
        s.hash_size = 1 << s.hash_bits;
        s.hash_mask = s.hash_size - 1;
        s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
        s.window = new Uint8Array(s.w_size * 2);
        s.head = new Uint16Array(s.hash_size);
        s.prev = new Uint16Array(s.w_size);
        s.lit_bufsize = 1 << memLevel + 6;
        s.pending_buf_size = s.lit_bufsize * 4;
        s.pending_buf = new Uint8Array(s.pending_buf_size);
        s.sym_buf = s.lit_bufsize;
        s.sym_end = (s.lit_bufsize - 1) * 3;
        s.level = level;
        s.strategy = strategy;
        s.method = method;
        return deflateReset(strm);
      };
      var deflateInit = (strm, level) => {
        return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
      };
      var deflate = (strm, flush) => {
        if (deflateStateCheck(strm) || flush > Z_BLOCK || flush < 0) {
          return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
        }
        const s = strm.state;
        if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH) {
          return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
        }
        const old_flush = s.last_flush;
        s.last_flush = flush;
        if (s.pending !== 0) {
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === FINISH_STATE && strm.avail_in !== 0) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === INIT_STATE && s.wrap === 0) {
          s.status = BUSY_STATE;
        }
        if (s.status === INIT_STATE) {
          let header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          let level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
          s.status = BUSY_STATE;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
        if (s.status === GZIP_STATE) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        }
        if (s.status === EXTRA_STATE) {
          if (s.gzhead.extra) {
            let beg = s.pending;
            let left = (s.gzhead.extra.length & 65535) - s.gzindex;
            while (s.pending + left > s.pending_buf_size) {
              let copy = s.pending_buf_size - s.pending;
              s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
              s.pending = s.pending_buf_size;
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              s.gzindex += copy;
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK;
              }
              beg = 0;
              left -= copy;
            }
            let gzhead_extra = new Uint8Array(s.gzhead.extra);
            s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
            s.pending += left;
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            s.gzindex = 0;
          }
          s.status = NAME_STATE;
        }
        if (s.status === NAME_STATE) {
          if (s.gzhead.name) {
            let beg = s.pending;
            let val;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                if (s.pending !== 0) {
                  s.last_flush = -1;
                  return Z_OK;
                }
                beg = 0;
              }
              if (s.gzindex < s.gzhead.name.length) {
                val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            s.gzindex = 0;
          }
          s.status = COMMENT_STATE;
        }
        if (s.status === COMMENT_STATE) {
          if (s.gzhead.comment) {
            let beg = s.pending;
            let val;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                if (s.pending !== 0) {
                  s.last_flush = -1;
                  return Z_OK;
                }
                beg = 0;
              }
              if (s.gzindex < s.gzhead.comment.length) {
                val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
          }
          s.status = HCRC_STATE;
        }
        if (s.status === HCRC_STATE) {
          if (s.gzhead.hcrc) {
            if (s.pending + 2 > s.pending_buf_size) {
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
          }
          s.status = BUSY_STATE;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
        if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
          let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
          if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
            s.status = FINISH_STATE;
          }
          if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
            if (strm.avail_out === 0) {
              s.last_flush = -1;
            }
            return Z_OK;
          }
          if (bstate === BS_BLOCK_DONE) {
            if (flush === Z_PARTIAL_FLUSH) {
              _tr_align(s);
            } else if (flush !== Z_BLOCK) {
              _tr_stored_block(s, 0, 0, false);
              if (flush === Z_FULL_FLUSH) {
                zero(s.head);
                if (s.lookahead === 0) {
                  s.strstart = 0;
                  s.block_start = 0;
                  s.insert = 0;
                }
              }
            }
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          }
        }
        if (flush !== Z_FINISH) {
          return Z_OK;
        }
        if (s.wrap <= 0) {
          return Z_STREAM_END;
        }
        if (s.wrap === 2) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          put_byte(s, strm.adler >> 16 & 255);
          put_byte(s, strm.adler >> 24 & 255);
          put_byte(s, strm.total_in & 255);
          put_byte(s, strm.total_in >> 8 & 255);
          put_byte(s, strm.total_in >> 16 & 255);
          put_byte(s, strm.total_in >> 24 & 255);
        } else {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        flush_pending(strm);
        if (s.wrap > 0) {
          s.wrap = -s.wrap;
        }
        return s.pending !== 0 ? Z_OK : Z_STREAM_END;
      };
      var deflateEnd = (strm) => {
        if (deflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const status = strm.state.status;
        strm.state = null;
        return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
      };
      var deflateSetDictionary = (strm, dictionary) => {
        let dictLength = dictionary.length;
        if (deflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const s = strm.state;
        const wrap = s.wrap;
        if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
          return Z_STREAM_ERROR;
        }
        if (wrap === 1) {
          strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
        }
        s.wrap = 0;
        if (dictLength >= s.w_size) {
          if (wrap === 0) {
            zero(s.head);
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
          let tmpDict = new Uint8Array(s.w_size);
          tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
          dictionary = tmpDict;
          dictLength = s.w_size;
        }
        const avail = strm.avail_in;
        const next = strm.next_in;
        const input = strm.input;
        strm.avail_in = dictLength;
        strm.next_in = 0;
        strm.input = dictionary;
        fill_window(s);
        while (s.lookahead >= MIN_MATCH) {
          let str = s.strstart;
          let n = s.lookahead - (MIN_MATCH - 1);
          do {
            s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
          } while (--n);
          s.strstart = str;
          s.lookahead = MIN_MATCH - 1;
          fill_window(s);
        }
        s.strstart += s.lookahead;
        s.block_start = s.strstart;
        s.insert = s.lookahead;
        s.lookahead = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        strm.next_in = next;
        strm.input = input;
        strm.avail_in = avail;
        s.wrap = wrap;
        return Z_OK;
      };
      module.exports.deflateInit = deflateInit;
      module.exports.deflateInit2 = deflateInit2;
      module.exports.deflateReset = deflateReset;
      module.exports.deflateResetKeep = deflateResetKeep;
      module.exports.deflateSetHeader = deflateSetHeader;
      module.exports.deflate = deflate;
      module.exports.deflateEnd = deflateEnd;
      module.exports.deflateSetDictionary = deflateSetDictionary;
      module.exports.deflateInfo = "pako deflate (from Nodeca project)";
    }
  });

  // node_modules/pako/lib/utils/common.js
  var require_common = __commonJS({
    "node_modules/pako/lib/utils/common.js"(exports, module) {
      "use strict";
      var _has = (obj, key) => {
        return Object.prototype.hasOwnProperty.call(obj, key);
      };
      module.exports.assign = function(obj) {
        const sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
          const source = sources.shift();
          if (!source) {
            continue;
          }
          if (typeof source !== "object") {
            throw new TypeError(source + "must be non-object");
          }
          for (const p in source) {
            if (_has(source, p)) {
              obj[p] = source[p];
            }
          }
        }
        return obj;
      };
      module.exports.flattenChunks = (chunks) => {
        let len = 0;
        for (let i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        const result = new Uint8Array(len);
        for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
          let chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      };
    }
  });

  // node_modules/pako/lib/utils/strings.js
  var require_strings = __commonJS({
    "node_modules/pako/lib/utils/strings.js"(exports, module) {
      "use strict";
      var STR_APPLY_UIA_OK = true;
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch (__) {
        STR_APPLY_UIA_OK = false;
      }
      var _utf8len = new Uint8Array(256);
      for (let q = 0; q < 256; q++) {
        _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
      }
      _utf8len[254] = _utf8len[254] = 1;
      module.exports.string2buf = (str) => {
        if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
          return new TextEncoder().encode(str);
        }
        let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
        for (m_pos = 0; m_pos < str_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
        }
        buf = new Uint8Array(buf_len);
        for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          if (c < 128) {
            buf[i++] = c;
          } else if (c < 2048) {
            buf[i++] = 192 | c >>> 6;
            buf[i++] = 128 | c & 63;
          } else if (c < 65536) {
            buf[i++] = 224 | c >>> 12;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          } else {
            buf[i++] = 240 | c >>> 18;
            buf[i++] = 128 | c >>> 12 & 63;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          }
        }
        return buf;
      };
      var buf2binstring = (buf, len) => {
        if (len < 65534) {
          if (buf.subarray && STR_APPLY_UIA_OK) {
            return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
          }
        }
        let result = "";
        for (let i = 0; i < len; i++) {
          result += String.fromCharCode(buf[i]);
        }
        return result;
      };
      module.exports.buf2string = (buf, max) => {
        const len = max || buf.length;
        if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
          return new TextDecoder().decode(buf.subarray(0, max));
        }
        let i, out;
        const utf16buf = new Array(len * 2);
        for (out = 0, i = 0; i < len; ) {
          let c = buf[i++];
          if (c < 128) {
            utf16buf[out++] = c;
            continue;
          }
          let c_len = _utf8len[c];
          if (c_len > 4) {
            utf16buf[out++] = 65533;
            i += c_len - 1;
            continue;
          }
          c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
          while (c_len > 1 && i < len) {
            c = c << 6 | buf[i++] & 63;
            c_len--;
          }
          if (c_len > 1) {
            utf16buf[out++] = 65533;
            continue;
          }
          if (c < 65536) {
            utf16buf[out++] = c;
          } else {
            c -= 65536;
            utf16buf[out++] = 55296 | c >> 10 & 1023;
            utf16buf[out++] = 56320 | c & 1023;
          }
        }
        return buf2binstring(utf16buf, out);
      };
      module.exports.utf8border = (buf, max) => {
        max = max || buf.length;
        if (max > buf.length) {
          max = buf.length;
        }
        let pos = max - 1;
        while (pos >= 0 && (buf[pos] & 192) === 128) {
          pos--;
        }
        if (pos < 0) {
          return max;
        }
        if (pos === 0) {
          return max;
        }
        return pos + _utf8len[buf[pos]] > max ? pos : max;
      };
    }
  });

  // node_modules/pako/lib/zlib/zstream.js
  var require_zstream = __commonJS({
    "node_modules/pako/lib/zlib/zstream.js"(exports, module) {
      "use strict";
      function ZStream() {
        this.input = null;
        this.next_in = 0;
        this.avail_in = 0;
        this.total_in = 0;
        this.output = null;
        this.next_out = 0;
        this.avail_out = 0;
        this.total_out = 0;
        this.msg = "";
        this.state = null;
        this.data_type = 2;
        this.adler = 0;
      }
      module.exports = ZStream;
    }
  });

  // node_modules/pako/lib/deflate.js
  var require_deflate2 = __commonJS({
    "node_modules/pako/lib/deflate.js"(exports, module) {
      "use strict";
      var zlib_deflate = require_deflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var toString = Object.prototype.toString;
      var {
        Z_NO_FLUSH,
        Z_SYNC_FLUSH,
        Z_FULL_FLUSH,
        Z_FINISH,
        Z_OK,
        Z_STREAM_END,
        Z_DEFAULT_COMPRESSION,
        Z_DEFAULT_STRATEGY,
        Z_DEFLATED
      } = require_constants();
      function Deflate(options) {
        this.options = utils.assign({
          level: Z_DEFAULT_COMPRESSION,
          method: Z_DEFLATED,
          chunkSize: 16384,
          windowBits: 15,
          memLevel: 8,
          strategy: Z_DEFAULT_STRATEGY
        }, options || {});
        let opt = this.options;
        if (opt.raw && opt.windowBits > 0) {
          opt.windowBits = -opt.windowBits;
        } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
          opt.windowBits += 16;
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        let status = zlib_deflate.deflateInit2(
          this.strm,
          opt.level,
          opt.method,
          opt.windowBits,
          opt.memLevel,
          opt.strategy
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        if (opt.header) {
          zlib_deflate.deflateSetHeader(this.strm, opt.header);
        }
        if (opt.dictionary) {
          let dict;
          if (typeof opt.dictionary === "string") {
            dict = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            dict = new Uint8Array(opt.dictionary);
          } else {
            dict = opt.dictionary;
          }
          status = zlib_deflate.deflateSetDictionary(this.strm, dict);
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          this._dict_set = true;
        }
      }
      Deflate.prototype.push = function(data, flush_mode) {
        const strm = this.strm;
        const chunkSize = this.options.chunkSize;
        let status, _flush_mode;
        if (this.ended) {
          return false;
        }
        if (flush_mode === ~~flush_mode)
          _flush_mode = flush_mode;
        else
          _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.string2buf(data);
        } else if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        for (; ; ) {
          if (strm.avail_out === 0) {
            strm.output = new Uint8Array(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
            this.onData(strm.output.subarray(0, strm.next_out));
            strm.avail_out = 0;
            continue;
          }
          status = zlib_deflate.deflate(strm, _flush_mode);
          if (status === Z_STREAM_END) {
            if (strm.next_out > 0) {
              this.onData(strm.output.subarray(0, strm.next_out));
            }
            status = zlib_deflate.deflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === Z_OK;
          }
          if (strm.avail_out === 0) {
            this.onData(strm.output);
            continue;
          }
          if (_flush_mode > 0 && strm.next_out > 0) {
            this.onData(strm.output.subarray(0, strm.next_out));
            strm.avail_out = 0;
            continue;
          }
          if (strm.avail_in === 0)
            break;
        }
        return true;
      };
      Deflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Deflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          this.result = utils.flattenChunks(this.chunks);
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function deflate(input, options) {
        const deflator = new Deflate(options);
        deflator.push(input, true);
        if (deflator.err) {
          throw deflator.msg || msg[deflator.err];
        }
        return deflator.result;
      }
      function deflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return deflate(input, options);
      }
      function gzip(input, options) {
        options = options || {};
        options.gzip = true;
        return deflate(input, options);
      }
      module.exports.Deflate = Deflate;
      module.exports.deflate = deflate;
      module.exports.deflateRaw = deflateRaw;
      module.exports.gzip = gzip;
      module.exports.constants = require_constants();
    }
  });

  // node_modules/pako/lib/zlib/inffast.js
  var require_inffast = __commonJS({
    "node_modules/pako/lib/zlib/inffast.js"(exports, module) {
      "use strict";
      var BAD = 16209;
      var TYPE = 16191;
      module.exports = function inflate_fast(strm, start) {
        let _in;
        let last;
        let _out;
        let beg;
        let end;
        let dmax;
        let wsize;
        let whave;
        let wnext;
        let s_window;
        let hold;
        let bits;
        let lcode;
        let dcode;
        let lmask;
        let dmask;
        let here;
        let op;
        let len;
        let dist;
        let from;
        let from_source;
        let input, output;
        const state = strm.state;
        _in = strm.next_in;
        input = strm.input;
        last = _in + (strm.avail_in - 5);
        _out = strm.next_out;
        output = strm.output;
        beg = _out - (start - strm.avail_out);
        end = _out + (strm.avail_out - 257);
        dmax = state.dmax;
        wsize = state.wsize;
        whave = state.whave;
        wnext = state.wnext;
        s_window = state.window;
        hold = state.hold;
        bits = state.bits;
        lcode = state.lencode;
        dcode = state.distcode;
        lmask = (1 << state.lenbits) - 1;
        dmask = (1 << state.distbits) - 1;
        top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op === 0) {
                  output[_out++] = here & 65535;
                } else if (op & 16) {
                  len = here & 65535;
                  op &= 15;
                  if (op) {
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                    len += hold & (1 << op) - 1;
                    hold >>>= op;
                    bits -= op;
                  }
                  if (bits < 15) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  here = dcode[hold & dmask];
                  dodist:
                    for (; ; ) {
                      op = here >>> 24;
                      hold >>>= op;
                      bits -= op;
                      op = here >>> 16 & 255;
                      if (op & 16) {
                        dist = here & 65535;
                        op &= 15;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                          if (bits < op) {
                            hold += input[_in++] << bits;
                            bits += 8;
                          }
                        }
                        dist += hold & (1 << op) - 1;
                        if (dist > dmax) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                        hold >>>= op;
                        bits -= op;
                        op = _out - beg;
                        if (dist > op) {
                          op = dist - op;
                          if (op > whave) {
                            if (state.sane) {
                              strm.msg = "invalid distance too far back";
                              state.mode = BAD;
                              break top;
                            }
                          }
                          from = 0;
                          from_source = s_window;
                          if (wnext === 0) {
                            from += wsize - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          } else if (wnext < op) {
                            from += wsize + wnext - op;
                            op -= wnext;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = 0;
                              if (wnext < len) {
                                op = wnext;
                                len -= op;
                                do {
                                  output[_out++] = s_window[from++];
                                } while (--op);
                                from = _out - dist;
                                from_source = output;
                              }
                            }
                          } else {
                            from += wnext - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                          while (len > 2) {
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            len -= 3;
                          }
                          if (len) {
                            output[_out++] = from_source[from++];
                            if (len > 1) {
                              output[_out++] = from_source[from++];
                            }
                          }
                        } else {
                          from = _out - dist;
                          do {
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            len -= 3;
                          } while (len > 2);
                          if (len) {
                            output[_out++] = output[from++];
                            if (len > 1) {
                              output[_out++] = output[from++];
                            }
                          }
                        }
                      } else if ((op & 64) === 0) {
                        here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                        continue dodist;
                      } else {
                        strm.msg = "invalid distance code";
                        state.mode = BAD;
                        break top;
                      }
                      break;
                    }
                } else if ((op & 64) === 0) {
                  here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dolen;
                } else if (op & 32) {
                  state.mode = TYPE;
                  break top;
                } else {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break top;
                }
                break;
              }
          } while (_in < last && _out < end);
        len = bits >> 3;
        _in -= len;
        bits -= len << 3;
        hold &= (1 << bits) - 1;
        strm.next_in = _in;
        strm.next_out = _out;
        strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
        strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
        state.hold = hold;
        state.bits = bits;
        return;
      };
    }
  });

  // node_modules/pako/lib/zlib/inftrees.js
  var require_inftrees = __commonJS({
    "node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
      "use strict";
      var MAXBITS = 15;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var lbase = new Uint16Array([
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        13,
        15,
        17,
        19,
        23,
        27,
        31,
        35,
        43,
        51,
        59,
        67,
        83,
        99,
        115,
        131,
        163,
        195,
        227,
        258,
        0,
        0
      ]);
      var lext = new Uint8Array([
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        20,
        20,
        20,
        20,
        21,
        21,
        21,
        21,
        16,
        72,
        78
      ]);
      var dbase = new Uint16Array([
        1,
        2,
        3,
        4,
        5,
        7,
        9,
        13,
        17,
        25,
        33,
        49,
        65,
        97,
        129,
        193,
        257,
        385,
        513,
        769,
        1025,
        1537,
        2049,
        3073,
        4097,
        6145,
        8193,
        12289,
        16385,
        24577,
        0,
        0
      ]);
      var dext = new Uint8Array([
        16,
        16,
        16,
        16,
        17,
        17,
        18,
        18,
        19,
        19,
        20,
        20,
        21,
        21,
        22,
        22,
        23,
        23,
        24,
        24,
        25,
        25,
        26,
        26,
        27,
        27,
        28,
        28,
        29,
        29,
        64,
        64
      ]);
      var inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
        const bits = opts.bits;
        let len = 0;
        let sym = 0;
        let min = 0, max = 0;
        let root = 0;
        let curr = 0;
        let drop = 0;
        let left = 0;
        let used = 0;
        let huff = 0;
        let incr;
        let fill;
        let low;
        let mask;
        let next;
        let base = null;
        let match;
        const count = new Uint16Array(MAXBITS + 1);
        const offs = new Uint16Array(MAXBITS + 1);
        let extra = null;
        let here_bits, here_op, here_val;
        for (len = 0; len <= MAXBITS; len++) {
          count[len] = 0;
        }
        for (sym = 0; sym < codes; sym++) {
          count[lens[lens_index + sym]]++;
        }
        root = bits;
        for (max = MAXBITS; max >= 1; max--) {
          if (count[max] !== 0) {
            break;
          }
        }
        if (root > max) {
          root = max;
        }
        if (max === 0) {
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          opts.bits = 1;
          return 0;
        }
        for (min = 1; min < max; min++) {
          if (count[min] !== 0) {
            break;
          }
        }
        if (root < min) {
          root = min;
        }
        left = 1;
        for (len = 1; len <= MAXBITS; len++) {
          left <<= 1;
          left -= count[len];
          if (left < 0) {
            return -1;
          }
        }
        if (left > 0 && (type === CODES || max !== 1)) {
          return -1;
        }
        offs[1] = 0;
        for (len = 1; len < MAXBITS; len++) {
          offs[len + 1] = offs[len] + count[len];
        }
        for (sym = 0; sym < codes; sym++) {
          if (lens[lens_index + sym] !== 0) {
            work[offs[lens[lens_index + sym]]++] = sym;
          }
        }
        if (type === CODES) {
          base = extra = work;
          match = 20;
        } else if (type === LENS) {
          base = lbase;
          extra = lext;
          match = 257;
        } else {
          base = dbase;
          extra = dext;
          match = 0;
        }
        huff = 0;
        sym = 0;
        len = min;
        next = table_index;
        curr = root;
        drop = 0;
        low = -1;
        used = 1 << root;
        mask = used - 1;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        for (; ; ) {
          here_bits = len - drop;
          if (work[sym] + 1 < match) {
            here_op = 0;
            here_val = work[sym];
          } else if (work[sym] >= match) {
            here_op = extra[work[sym] - match];
            here_val = base[work[sym] - match];
          } else {
            here_op = 32 + 64;
            here_val = 0;
          }
          incr = 1 << len - drop;
          fill = 1 << curr;
          min = fill;
          do {
            fill -= incr;
            table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
          } while (fill !== 0);
          incr = 1 << len - 1;
          while (huff & incr) {
            incr >>= 1;
          }
          if (incr !== 0) {
            huff &= incr - 1;
            huff += incr;
          } else {
            huff = 0;
          }
          sym++;
          if (--count[len] === 0) {
            if (len === max) {
              break;
            }
            len = lens[lens_index + work[sym]];
          }
          if (len > root && (huff & mask) !== low) {
            if (drop === 0) {
              drop = root;
            }
            next += min;
            curr = len - drop;
            left = 1 << curr;
            while (curr + drop < max) {
              left -= count[curr + drop];
              if (left <= 0) {
                break;
              }
              curr++;
              left <<= 1;
            }
            used += 1 << curr;
            if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
              return 1;
            }
            low = huff & mask;
            table[low] = root << 24 | curr << 16 | next - table_index | 0;
          }
        }
        if (huff !== 0) {
          table[next + huff] = len - drop << 24 | 64 << 16 | 0;
        }
        opts.bits = root;
        return 0;
      };
      module.exports = inflate_table;
    }
  });

  // node_modules/pako/lib/zlib/inflate.js
  var require_inflate = __commonJS({
    "node_modules/pako/lib/zlib/inflate.js"(exports, module) {
      "use strict";
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var inflate_fast = require_inffast();
      var inflate_table = require_inftrees();
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var {
        Z_FINISH,
        Z_BLOCK,
        Z_TREES,
        Z_OK,
        Z_STREAM_END,
        Z_NEED_DICT,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_MEM_ERROR,
        Z_BUF_ERROR,
        Z_DEFLATED
      } = require_constants();
      var HEAD = 16180;
      var FLAGS = 16181;
      var TIME = 16182;
      var OS = 16183;
      var EXLEN = 16184;
      var EXTRA = 16185;
      var NAME = 16186;
      var COMMENT = 16187;
      var HCRC = 16188;
      var DICTID = 16189;
      var DICT = 16190;
      var TYPE = 16191;
      var TYPEDO = 16192;
      var STORED = 16193;
      var COPY_ = 16194;
      var COPY = 16195;
      var TABLE = 16196;
      var LENLENS = 16197;
      var CODELENS = 16198;
      var LEN_ = 16199;
      var LEN = 16200;
      var LENEXT = 16201;
      var DIST = 16202;
      var DISTEXT = 16203;
      var MATCH = 16204;
      var LIT = 16205;
      var CHECK = 16206;
      var LENGTH = 16207;
      var DONE = 16208;
      var BAD = 16209;
      var MEM = 16210;
      var SYNC = 16211;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var MAX_WBITS = 15;
      var DEF_WBITS = MAX_WBITS;
      var zswap32 = (q) => {
        return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
      };
      function InflateState() {
        this.strm = null;
        this.mode = 0;
        this.last = false;
        this.wrap = 0;
        this.havedict = false;
        this.flags = 0;
        this.dmax = 0;
        this.check = 0;
        this.total = 0;
        this.head = null;
        this.wbits = 0;
        this.wsize = 0;
        this.whave = 0;
        this.wnext = 0;
        this.window = null;
        this.hold = 0;
        this.bits = 0;
        this.length = 0;
        this.offset = 0;
        this.extra = 0;
        this.lencode = null;
        this.distcode = null;
        this.lenbits = 0;
        this.distbits = 0;
        this.ncode = 0;
        this.nlen = 0;
        this.ndist = 0;
        this.have = 0;
        this.next = null;
        this.lens = new Uint16Array(320);
        this.work = new Uint16Array(288);
        this.lendyn = null;
        this.distdyn = null;
        this.sane = 0;
        this.back = 0;
        this.was = 0;
      }
      var inflateStateCheck = (strm) => {
        if (!strm) {
          return 1;
        }
        const state = strm.state;
        if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) {
          return 1;
        }
        return 0;
      };
      var inflateResetKeep = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        strm.total_in = strm.total_out = state.total = 0;
        strm.msg = "";
        if (state.wrap) {
          strm.adler = state.wrap & 1;
        }
        state.mode = HEAD;
        state.last = 0;
        state.havedict = 0;
        state.flags = -1;
        state.dmax = 32768;
        state.head = null;
        state.hold = 0;
        state.bits = 0;
        state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
        state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
        state.sane = 1;
        state.back = -1;
        return Z_OK;
      };
      var inflateReset = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        state.wsize = 0;
        state.whave = 0;
        state.wnext = 0;
        return inflateResetKeep(strm);
      };
      var inflateReset2 = (strm, windowBits) => {
        let wrap;
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else {
          wrap = (windowBits >> 4) + 5;
          if (windowBits < 48) {
            windowBits &= 15;
          }
        }
        if (windowBits && (windowBits < 8 || windowBits > 15)) {
          return Z_STREAM_ERROR;
        }
        if (state.window !== null && state.wbits !== windowBits) {
          state.window = null;
        }
        state.wrap = wrap;
        state.wbits = windowBits;
        return inflateReset(strm);
      };
      var inflateInit2 = (strm, windowBits) => {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        const state = new InflateState();
        strm.state = state;
        state.strm = strm;
        state.window = null;
        state.mode = HEAD;
        const ret = inflateReset2(strm, windowBits);
        if (ret !== Z_OK) {
          strm.state = null;
        }
        return ret;
      };
      var inflateInit = (strm) => {
        return inflateInit2(strm, DEF_WBITS);
      };
      var virgin = true;
      var lenfix;
      var distfix;
      var fixedtables = (state) => {
        if (virgin) {
          lenfix = new Int32Array(512);
          distfix = new Int32Array(32);
          let sym = 0;
          while (sym < 144) {
            state.lens[sym++] = 8;
          }
          while (sym < 256) {
            state.lens[sym++] = 9;
          }
          while (sym < 280) {
            state.lens[sym++] = 7;
          }
          while (sym < 288) {
            state.lens[sym++] = 8;
          }
          inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
          sym = 0;
          while (sym < 32) {
            state.lens[sym++] = 5;
          }
          inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
          virgin = false;
        }
        state.lencode = lenfix;
        state.lenbits = 9;
        state.distcode = distfix;
        state.distbits = 5;
      };
      var updatewindow = (strm, src, end, copy) => {
        let dist;
        const state = strm.state;
        if (state.window === null) {
          state.wsize = 1 << state.wbits;
          state.wnext = 0;
          state.whave = 0;
          state.window = new Uint8Array(state.wsize);
        }
        if (copy >= state.wsize) {
          state.window.set(src.subarray(end - state.wsize, end), 0);
          state.wnext = 0;
          state.whave = state.wsize;
        } else {
          dist = state.wsize - state.wnext;
          if (dist > copy) {
            dist = copy;
          }
          state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
          copy -= dist;
          if (copy) {
            state.window.set(src.subarray(end - copy, end), 0);
            state.wnext = copy;
            state.whave = state.wsize;
          } else {
            state.wnext += dist;
            if (state.wnext === state.wsize) {
              state.wnext = 0;
            }
            if (state.whave < state.wsize) {
              state.whave += dist;
            }
          }
        }
        return 0;
      };
      var inflate = (strm, flush) => {
        let state;
        let input, output;
        let next;
        let put;
        let have, left;
        let hold;
        let bits;
        let _in, _out;
        let copy;
        let from;
        let from_source;
        let here = 0;
        let here_bits, here_op, here_val;
        let last_bits, last_op, last_val;
        let len;
        let ret;
        const hbuf = new Uint8Array(4);
        let opts;
        let n;
        const order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
        if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.mode === TYPE) {
          state.mode = TYPEDO;
        }
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        _in = have;
        _out = left;
        ret = Z_OK;
        inf_leave:
          for (; ; ) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  if (state.wbits === 0) {
                    state.wbits = 15;
                  }
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                }
                if (len > 15 || len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << state.wbits;
                state.flags = 0;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = hold >> 8 & 1;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  hbuf[2] = hold >>> 16 & 255;
                  hbuf[3] = hold >>> 24 & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512 && state.wrap & 4) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = hold >>> 8 & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Uint8Array(state.head.extra_len);
                      }
                      state.head.extra.set(
                        input.subarray(
                          next,
                          next + copy
                        ),
                        len
                      );
                    }
                    if (state.flags & 512 && state.wrap & 4) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512 && state.wrap & 4) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512 && state.wrap & 4) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (state.wrap & 4 && hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = state.flags >> 9 & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = zswap32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case COPY_:
                state.mode = COPY;
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  output.set(input.subarray(next, next + copy), put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (; ; ) {
                    here = state.lencode[hold & (1 << state.lenbits) - 1];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              case DIST:
                for (; ; ) {
                  here = state.distcode[hold & (1 << state.distbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (state.wrap & 4 && _out) {
                    strm.adler = state.check = state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              default:
                return Z_STREAM_ERROR;
            }
          }
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
          if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
            state.mode = MEM;
            return Z_MEM_ERROR;
          }
        }
        _in -= strm.avail_in;
        _out -= strm.avail_out;
        strm.total_in += _in;
        strm.total_out += _out;
        state.total += _out;
        if (state.wrap & 4 && _out) {
          strm.adler = state.check = state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
        }
        strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
        if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
          ret = Z_BUF_ERROR;
        }
        return ret;
      };
      var inflateEnd = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        let state = strm.state;
        if (state.window) {
          state.window = null;
        }
        strm.state = null;
        return Z_OK;
      };
      var inflateGetHeader = (strm, head) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        if ((state.wrap & 2) === 0) {
          return Z_STREAM_ERROR;
        }
        state.head = head;
        head.done = false;
        return Z_OK;
      };
      var inflateSetDictionary = (strm, dictionary) => {
        const dictLength = dictionary.length;
        let state;
        let dictid;
        let ret;
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.wrap !== 0 && state.mode !== DICT) {
          return Z_STREAM_ERROR;
        }
        if (state.mode === DICT) {
          dictid = 1;
          dictid = adler32(dictid, dictionary, dictLength, 0);
          if (dictid !== state.check) {
            return Z_DATA_ERROR;
          }
        }
        ret = updatewindow(strm, dictionary, dictLength, dictLength);
        if (ret) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
        state.havedict = 1;
        return Z_OK;
      };
      module.exports.inflateReset = inflateReset;
      module.exports.inflateReset2 = inflateReset2;
      module.exports.inflateResetKeep = inflateResetKeep;
      module.exports.inflateInit = inflateInit;
      module.exports.inflateInit2 = inflateInit2;
      module.exports.inflate = inflate;
      module.exports.inflateEnd = inflateEnd;
      module.exports.inflateGetHeader = inflateGetHeader;
      module.exports.inflateSetDictionary = inflateSetDictionary;
      module.exports.inflateInfo = "pako inflate (from Nodeca project)";
    }
  });

  // node_modules/pako/lib/zlib/gzheader.js
  var require_gzheader = __commonJS({
    "node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
      "use strict";
      function GZheader() {
        this.text = 0;
        this.time = 0;
        this.xflags = 0;
        this.os = 0;
        this.extra = null;
        this.extra_len = 0;
        this.name = "";
        this.comment = "";
        this.hcrc = 0;
        this.done = false;
      }
      module.exports = GZheader;
    }
  });

  // node_modules/pako/lib/inflate.js
  var require_inflate2 = __commonJS({
    "node_modules/pako/lib/inflate.js"(exports, module) {
      "use strict";
      var zlib_inflate = require_inflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var GZheader = require_gzheader();
      var toString = Object.prototype.toString;
      var {
        Z_NO_FLUSH,
        Z_FINISH,
        Z_OK,
        Z_STREAM_END,
        Z_NEED_DICT,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_MEM_ERROR
      } = require_constants();
      function Inflate(options) {
        this.options = utils.assign({
          chunkSize: 1024 * 64,
          windowBits: 15,
          to: ""
        }, options || {});
        const opt = this.options;
        if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
          opt.windowBits = -opt.windowBits;
          if (opt.windowBits === 0) {
            opt.windowBits = -15;
          }
        }
        if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
          opt.windowBits += 32;
        }
        if (opt.windowBits > 15 && opt.windowBits < 48) {
          if ((opt.windowBits & 15) === 0) {
            opt.windowBits |= 15;
          }
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        let status = zlib_inflate.inflateInit2(
          this.strm,
          opt.windowBits
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this.header = new GZheader();
        zlib_inflate.inflateGetHeader(this.strm, this.header);
        if (opt.dictionary) {
          if (typeof opt.dictionary === "string") {
            opt.dictionary = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            opt.dictionary = new Uint8Array(opt.dictionary);
          }
          if (opt.raw) {
            status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
            if (status !== Z_OK) {
              throw new Error(msg[status]);
            }
          }
        }
      }
      Inflate.prototype.push = function(data, flush_mode) {
        const strm = this.strm;
        const chunkSize = this.options.chunkSize;
        const dictionary = this.options.dictionary;
        let status, _flush_mode, last_avail_out;
        if (this.ended)
          return false;
        if (flush_mode === ~~flush_mode)
          _flush_mode = flush_mode;
        else
          _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        for (; ; ) {
          if (strm.avail_out === 0) {
            strm.output = new Uint8Array(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_inflate.inflate(strm, _flush_mode);
          if (status === Z_NEED_DICT && dictionary) {
            status = zlib_inflate.inflateSetDictionary(strm, dictionary);
            if (status === Z_OK) {
              status = zlib_inflate.inflate(strm, _flush_mode);
            } else if (status === Z_DATA_ERROR) {
              status = Z_NEED_DICT;
            }
          }
          while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
            zlib_inflate.inflateReset(strm);
            status = zlib_inflate.inflate(strm, _flush_mode);
          }
          switch (status) {
            case Z_STREAM_ERROR:
            case Z_DATA_ERROR:
            case Z_NEED_DICT:
            case Z_MEM_ERROR:
              this.onEnd(status);
              this.ended = true;
              return false;
          }
          last_avail_out = strm.avail_out;
          if (strm.next_out) {
            if (strm.avail_out === 0 || status === Z_STREAM_END) {
              if (this.options.to === "string") {
                let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
                let tail = strm.next_out - next_out_utf8;
                let utf8str = strings.buf2string(strm.output, next_out_utf8);
                strm.next_out = tail;
                strm.avail_out = chunkSize - tail;
                if (tail)
                  strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
                this.onData(utf8str);
              } else {
                this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
              }
            }
          }
          if (status === Z_OK && last_avail_out === 0)
            continue;
          if (status === Z_STREAM_END) {
            status = zlib_inflate.inflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return true;
          }
          if (strm.avail_in === 0)
            break;
        }
        return true;
      };
      Inflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Inflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function inflate(input, options) {
        const inflator = new Inflate(options);
        inflator.push(input);
        if (inflator.err)
          throw inflator.msg || msg[inflator.err];
        return inflator.result;
      }
      function inflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return inflate(input, options);
      }
      module.exports.Inflate = Inflate;
      module.exports.inflate = inflate;
      module.exports.inflateRaw = inflateRaw;
      module.exports.ungzip = inflate;
      module.exports.constants = require_constants();
    }
  });

  // node_modules/pako/index.js
  var require_pako = __commonJS({
    "node_modules/pako/index.js"(exports, module) {
      "use strict";
      var { Deflate, deflate, deflateRaw, gzip } = require_deflate2();
      var { Inflate, inflate, inflateRaw, ungzip } = require_inflate2();
      var constants = require_constants();
      module.exports.Deflate = Deflate;
      module.exports.deflate = deflate;
      module.exports.deflateRaw = deflateRaw;
      module.exports.gzip = gzip;
      module.exports.Inflate = Inflate;
      module.exports.inflate = inflate;
      module.exports.inflateRaw = inflateRaw;
      module.exports.ungzip = ungzip;
      module.exports.constants = constants;
    }
  });

  // sdk/contracts/weavedb/actions/write/relay.js
  var require_relay = __commonJS({
    "sdk/contracts/weavedb/actions/write/relay.js"(exports, module) {
      var {
        intersection,
        is,
        uniq,
        includes,
        map,
        toLower,
        init,
        last,
        isNil,
        head,
        nth
      } = require_src();
      var { wrapResult, err, read, validateSchema } = require_utils();
      var { validate } = require_validate();
      var { add } = require_add2();
      var { set } = require_set2();
      var { update } = require_update2();
      var { upsert } = require_upsert();
      var { remove } = require_remove2();
      var { addAddressLink } = require_addAddressLink();
      var { batch } = require_batch();
      var relay = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let [jobID, input, query] = action.input.query;
        let relayer = null;
        const relayers = state.relayers || {};
        if (isNil(relayers[jobID]))
          err("relayer jobID doesn't exist");
        let original_signer = null;
        if (relayers[jobID].internalWrites !== true) {
          if (isNil(signer)) {
            ;
            ({ signer, original_signer } = await validate(
              state,
              action,
              "relay",
              SmartWeave2,
              false
            ));
          }
          relayer = signer;
        } else {
          relayer = action.caller;
        }
        if (input.jobID !== jobID)
          err("the wrong jobID");
        let action2 = { input, relayer, extra: query, jobID };
        if (!isNil(relayers[jobID].relayers)) {
          const allowed_relayers = map((v) => /^0x.+$/.test(v) ? toLower(v) : v)(
            relayers[jobID].relayers || []
          );
          if (!includes(relayer)(allowed_relayers))
            err("relayer is not allowed");
        }
        if (includes(relayers[jobID].multisig_type)(["number", "percent"])) {
          const allowed_signers = map(toLower)(relayers[jobID].signers || []);
          let signers = [];
          if (is(Array)(action.input.multisigs)) {
            const data = {
              extra: action2.extra,
              jobID,
              params: input
            };
            for (const signature of action.input.multisigs) {
              const _signer = (await read(
                state.contracts.ethereum,
                {
                  function: "verify",
                  data,
                  signature
                },
                SmartWeave2
              )).signer;
              signers.push(_signer);
            }
          }
          const matched_signers = intersection(allowed_signers, signers);
          let min = 1;
          if (relayers[jobID].multisig_type === "percent") {
            min = Math.ceil(
              relayers[jobID].signers.length * (relayers[jobID].multisig || 100) / 100
            );
          } else if (relayers[jobID].multisig_type === "number") {
            min = relayers[jobID].multisig || 1;
          }
          if (matched_signers.length < min) {
            err(
              `not enough number of allowed signers [${matched_signers.length}/${min}] for the job[${jobID}]`
            );
          }
        }
        if (!isNil(relayers[jobID].schema)) {
          try {
            validateSchema(relayers[jobID].schema, query);
          } catch (e) {
            err("relayer data validation error");
          }
        }
        switch (action2.input.function) {
          case "add":
            return await add(state, action2, null, void 0, null, SmartWeave2);
          case "set":
            return await set(state, action2, null, null, SmartWeave2);
          case "update":
            return await update(state, action2, null, null, SmartWeave2);
          case "upsert":
            return await upsert(state, action2, null, null, SmartWeave2);
          case "delete":
            return await remove(state, action2, null, null, SmartWeave2);
          case "batch":
            return await batch(state, action2, null, null, SmartWeave2);
          case "addAddressLink":
            return await addAddressLink(
              state,
              action2,
              null,
              null,
              SmartWeave2,
              action2.extra.linkTo
            );
          default:
            err(
              `No function supplied or function not recognised: "${action2.input.function}"`
            );
        }
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { relay };
    }
  });

  // sdk/contracts/weavedb/actions/write/bundle.js
  var require_bundle = __commonJS({
    "sdk/contracts/weavedb/actions/write/bundle.js"(exports, module) {
      var pako = require_pako();
      var { validate } = require_validate();
      var { clone, wrapResult, err } = require_utils();
      var { isNil } = require_src();
      var { set } = require_set2();
      var { add } = require_add2();
      var { update } = require_update2();
      var { upsert } = require_upsert();
      var { remove } = require_remove2();
      var { relay } = require_relay();
      var { setRules } = require_setRules();
      var { setSchema } = require_setSchema();
      var { setCanEvolve } = require_setCanEvolve();
      var { setSecure } = require_setSecure();
      var { setAlgorithms } = require_setAlgorithms();
      var { addIndex } = require_addIndex2();
      var { addOwner } = require_addOwner();
      var { addRelayerJob } = require_addRelayerJob();
      var { removeCron } = require_removeCron();
      var { removeIndex } = require_removeIndex();
      var { removeOwner } = require_removeOwner();
      var { removeRelayerJob } = require_removeRelayerJob();
      var bundle = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "bundle",
            SmartWeave2
          ));
        }
        const compressed = new Uint8Array(
          Buffer.from(action.input.query, "base64").toString("binary").split("").map(function(c) {
            return c.charCodeAt(0);
          })
        );
        const queries = JSON.parse(pako.inflate(compressed, { to: "string" }));
        let validity = [];
        let errors = [];
        let i = 0;
        for (const q of queries) {
          let valid = true;
          let error = null;
          try {
            const op = q.function;
            let res = null;
            switch (op) {
              case "add":
                res = await add(
                  clone(state),
                  { input: q },
                  void 0,
                  i,
                  false,
                  SmartWeave2
                );
                break;
              case "set":
                res = await set(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "update":
                res = await update(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "upsert":
                res = await upsert(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "delete":
                res = await remove(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "setRules":
                res = await setRules(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "setSchema":
                res = await setSchema(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "setCanEvolve":
                res = await setCanEvolve(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "setSecure":
                res = await setSecure(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "setAlgorithms":
                res = await setAlgorithms(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "addIndex":
                res = await addIndex(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "addOwner":
                res = await addOwner(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "addRelayerJob":
                res = await addRelayerJob(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "addCron":
                const { addCron } = require_addCron();
                res = await addCron(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "removeCron":
                res = await removeCron(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "removeIndex":
                res = await removeIndex(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "removeOwner":
                res = await removeOwner(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              case "removeRelayerJob":
                res = await removeRelayerJob(
                  clone(state),
                  { input: q },
                  void 0,
                  false,
                  SmartWeave2
                );
                break;
              default:
                throw new Error(
                  `No function supplied or function not recognised: "${q}"`
                );
            }
            if (!isNil(res))
              state = res.state;
          } catch (e) {
            error = e?.toString?.() || "unknown error";
            valid = false;
          }
          validity.push(valid);
          errors.push(error);
          i++;
        }
        return wrapResult(state, original_signer, SmartWeave2, { validity, errors });
      };
      module.exports = { bundle };
    }
  });

  // sdk/contracts/weavedb/lib/version.js
  var require_version2 = __commonJS({
    "sdk/contracts/weavedb/lib/version.js"(exports, module) {
      module.exports = "0.26.3";
    }
  });

  // sdk/contracts/weavedb/actions/write/migrate.js
  var require_migrate = __commonJS({
    "sdk/contracts/weavedb/actions/write/migrate.js"(exports, module) {
      var { isNil, is, of, includes, mergeLeft, last } = require_src();
      var { wrapResult, isEvolving, err, isOwner } = require_utils();
      var { validate } = require_validate();
      var version = require_version2();
      var migrate = async (state, action, signer, contractErr = true, SmartWeave2) => {
        let original_signer = null;
        if (isNil(signer)) {
          ;
          ({ signer, original_signer } = await validate(
            state,
            action,
            "migrate",
            SmartWeave2
          ));
        }
        const owner = isOwner(signer, state);
        if (version !== action.input.query.version) {
          err(`version doesn't match (${version} : ${action.input.query.version})`);
        }
        if (!isEvolving(state))
          err(`contract is not ready to migrate`);
        state.version = version;
        state.evolveHistory[state.evolveHistory.length - 1].newVersion = version;
        return wrapResult(state, original_signer, SmartWeave2);
      };
      module.exports = { migrate };
    }
  });

  // sdk/contracts/weavedb/contract.js
  var require_contract = __commonJS({
    "sdk/contracts/weavedb/contract.js"(exports, module) {
      var { ids } = require_ids();
      var { nonce } = require_nonce();
      var { version } = require_version();
      var { hash } = require_hash();
      var { get } = require_get();
      var { getSchema } = require_getSchema();
      var { getRules } = require_getRules();
      var { getIndexes } = require_getIndexes();
      var { getCrons } = require_getCrons();
      var { getAlgorithms } = require_getAlgorithms();
      var { getLinkedContract } = require_getLinkedContract();
      var { getOwner } = require_getOwner();
      var { getAddressLink } = require_getAddressLink();
      var { getRelayerJob } = require_getRelayerJob();
      var { listRelayerJobs } = require_listRelayerJobs();
      var { getEvolve } = require_getEvolve();
      var { listCollections } = require_listCollections();
      var { getInfo } = require_getInfo();
      var { set } = require_set2();
      var { upsert } = require_upsert();
      var { update } = require_update2();
      var { remove } = require_remove2();
      var { addOwner } = require_addOwner();
      var { removeOwner } = require_removeOwner();
      var { setAlgorithms } = require_setAlgorithms();
      var { setCanEvolve } = require_setCanEvolve();
      var { setSecure } = require_setSecure();
      var { setSchema } = require_setSchema();
      var { addIndex } = require_addIndex2();
      var { removeIndex } = require_removeIndex();
      var { setRules } = require_setRules();
      var { removeCron } = require_removeCron();
      var { addRelayerJob } = require_addRelayerJob();
      var { removeRelayerJob } = require_removeRelayerJob();
      var { linkContract } = require_linkContract();
      var { unlinkContract } = require_unlinkContract();
      var { removeAddressLink } = require_removeAddressLink();
      var { addCron } = require_addCron();
      var { addAddressLink } = require_addAddressLink();
      var { evolve } = require_evolve2();
      var { add } = require_add2();
      var { batch } = require_batch();
      var { bundle } = require_bundle();
      var { relay } = require_relay();
      var { migrate } = require_migrate();
      var { cron } = require_cron();
      var { err, isEvolving } = require_utils();
      var { includes, isNil } = require_src();
      var writes = [
        "relay",
        "set",
        "setSchema",
        "setRules",
        "addIndex",
        "removeIndex",
        "add",
        "upsert",
        "remove",
        "batch",
        "bundle",
        "addCron",
        "removeCron",
        "setAlgorithms",
        "addRelayerJob",
        "linkContract",
        "unlinkContract",
        "setCanEvolve",
        "setSecure",
        "addOwner",
        "removeOwner",
        "addAddressLink",
        "removeAddressLink"
      ];
      async function handle2(state, action, _SmartWeave) {
        if (typeof SmartWeave !== "undefined")
          _SmartWeave = SmartWeave;
        if (isEvolving(state) && includes(action.input.function)(writes)) {
          err("contract needs migration");
        }
        try {
          ;
          ({ state } = await cron(state, _SmartWeave));
        } catch (e) {
          console.log(e);
        }
        const addHash = async ({ state: state2, result }) => {
          if (isNil(state2.hash)) {
            state2.hash = _SmartWeave.transaction.id;
          } else {
            const hashes = _SmartWeave.arweave.utils.concatBuffers([
              _SmartWeave.arweave.utils.stringToBuffer(state2.hash),
              _SmartWeave.arweave.utils.stringToBuffer(_SmartWeave.transaction.id)
            ]);
            const hash2 = await _SmartWeave.arweave.crypto.hash(hashes, "SHA-384");
            state2.hash = _SmartWeave.arweave.utils.bufferTob64(hash2);
          }
          return { state: state2, result };
        };
        switch (action.input.function) {
          case "get":
            return await get(state, action, false, _SmartWeave);
          case "cget":
            return await get(state, action, true, _SmartWeave);
          case "getAddressLink":
            return await getAddressLink(state, action, _SmartWeave);
          case "listCollections":
            return await listCollections(state, action, _SmartWeave);
          case "getInfo":
            return await getInfo(state, action, _SmartWeave);
          case "getCrons":
            return await getCrons(state, action, _SmartWeave);
          case "getAlgorithms":
            return await getAlgorithms(state, action, _SmartWeave);
          case "getLinkedContract":
            return await getLinkedContract(state, action, _SmartWeave);
          case "listRelayerJobs":
            return await listRelayerJobs(state, action, _SmartWeave);
          case "getRelayerJob":
            return await getRelayerJob(state, action, _SmartWeave);
          case "getIndexes":
            return await getIndexes(state, action, _SmartWeave);
          case "getSchema":
            return await getSchema(state, action, _SmartWeave);
          case "getRules":
            return await getRules(state, action, _SmartWeave);
          case "ids":
            return await ids(state, action, _SmartWeave);
          case "nonce":
            return await nonce(state, action, _SmartWeave);
          case "hash":
            return await hash(state, action, _SmartWeave);
          case "version":
            return await version(state, action, _SmartWeave);
          case "getOwner":
            return await getOwner(state, action, _SmartWeave);
          case "getEvolve":
            return await getEvolve(state, action, _SmartWeave);
          case "add":
            return await addHash(
              await add(state, action, void 0, void 0, void 0, _SmartWeave)
            );
          case "set":
            return await addHash(
              await set(state, action, void 0, void 0, _SmartWeave)
            );
          case "upsert":
            return await addHash(
              await upsert(state, action, void 0, void 0, _SmartWeave)
            );
          case "update":
            return await addHash(
              await update(state, action, void 0, void 0, _SmartWeave)
            );
          case "delete":
            return await addHash(
              await remove(state, action, void 0, void 0, _SmartWeave)
            );
          case "batch":
            return await addHash(
              await batch(state, action, void 0, void 0, _SmartWeave)
            );
          case "bundle":
            return await addHash(
              await bundle(state, action, void 0, void 0, _SmartWeave)
            );
          case "relay":
            return await addHash(
              await relay(state, action, void 0, void 0, _SmartWeave)
            );
          case "addOwner":
            return await addHash(
              await addOwner(state, action, void 0, void 0, _SmartWeave)
            );
          case "removeOwner":
            return await addHash(
              await removeOwner(state, action, void 0, void 0, _SmartWeave)
            );
          case "setAlgorithms":
            return await addHash(
              await setAlgorithms(state, action, void 0, void 0, _SmartWeave)
            );
          case "setCanEvolve":
            return await addHash(
              await setCanEvolve(state, action, void 0, void 0, _SmartWeave)
            );
          case "setSecure":
            return await addHash(
              await setSecure(state, action, void 0, void 0, _SmartWeave)
            );
          case "setSchema":
            return await addHash(
              await setSchema(state, action, void 0, void 0, _SmartWeave)
            );
          case "addIndex":
            return await addHash(
              await addIndex(state, action, void 0, void 0, _SmartWeave)
            );
          case "removeIndex":
            return await addHash(
              await removeIndex(state, action, void 0, void 0, _SmartWeave)
            );
          case "setRules":
            return await addHash(
              await setRules(state, action, void 0, void 0, _SmartWeave)
            );
          case "removeCron":
            return await addHash(
              await removeCron(state, action, void 0, void 0, _SmartWeave)
            );
          case "addRelayerJob":
            return await addHash(
              await addRelayerJob(state, action, void 0, void 0, _SmartWeave)
            );
          case "removeRelayerJob":
            return await addHash(
              await removeRelayerJob(state, action, void 0, void 0, _SmartWeave)
            );
          case "linkContract":
            return await addHash(
              await linkContract(state, action, void 0, void 0, _SmartWeave)
            );
          case "unlinkContract":
            return await addHash(
              await unlinkContract(state, action, void 0, void 0, _SmartWeave)
            );
          case "removeAddressLink":
            return await addHash(
              await removeAddressLink(
                state,
                action,
                void 0,
                void 0,
                _SmartWeave
              )
            );
          case "addCron":
            return await addHash(
              await addCron(state, action, void 0, void 0, _SmartWeave)
            );
          case "addAddressLink":
            return await addHash(
              await addAddressLink(state, action, void 0, void 0, _SmartWeave)
            );
          case "evolve":
            return await addHash(
              await evolve(state, action, void 0, void 0, _SmartWeave)
            );
          case "migrate":
            return await addHash(
              await migrate(state, action, void 0, void 0, _SmartWeave)
            );
          default:
            err(
              `No function supplied or function not recognised: "${action.input.function}"`
            );
        }
        return { state };
      }
      module.exports = { handle: handle2 };
    }
  });

  // contracts/warp/contract.js
  var import_contract = __toESM(require_contract());
  async function handle(state, action) {
    return await (0, import_contract.handle)(state, action);
  }

/*! https://mths.be/punycode v1.3.2 by @mathias */
