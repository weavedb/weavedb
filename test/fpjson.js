const { expect } = require("chai")
const { init, stop, initBeforeEach } = require("./util")
describe("WeaveDB", function () {
  let db, arweave_wallet
  this.timeout(0)

  before(async () => {
    db = await init("web", 1, true)
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet } = await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })
  const cases = [
    {
      key: "Math A",
      tests: [
        [["inc", 0], 1],
        [["dec", 0], -1],
        [["negate", 1], -1],
      ],
    },
    {
      key: "Math B",
      tests: [
        [["add", 1, 2], 3],
        [["subtract", 2, 1], 1],
        [["multiply", 3, 2], 6],
        [["divide", 4, 2], 2],
        [["modulo", 4, 3], 1],
        [["mathMod", -3, 2], 1],
      ],
    },
    {
      key: "Math C",
      tests: [
        [["sum", [1, 2]], 3],
        [["product", [2, 1]], 2],
        [["mean", [1, 2, 3]], 2],
        [["median", [1, 2, 3]], 2],
      ],
    },
    {
      key: "Relation A",
      tests: [
        [["equals",-4,-3], false],
        [["gt",0,0], false],
        [["gte",2,-3], true],
        [["lt",1,2], true],
        [["lte",-5,1], true]
      ],
    },
    {
      key: "Relation B",
      tests: [
        [["clamp",1,8,0], 1],
        [["max",-2,-1], -1],
        [["min",0,0], 0],
        [["maxBy",["negate"],-4,-5], -5],
        [["minBy",["inc"],0,0], 0]
      ],
    },
    {
      key: "Logic A",
      tests: [
        [["and",false,true], false],
        [["or",true,true], true],
        [["xor",true,false], true],
        [["not",true], false]
      ],
    },
    {
      key: "Logic B",
      tests: [
        [[["both",["gt",2],["equals",-1]],-5], false],
        [[["either",["lt",2],["gt",-3]],3], true],
        [[["allPass",["[]",["gte",-4],["gt",-4],["lt",-5]]],-1], false],
        [[["anyPass",["[]",["gt",0],["gte",-1],["lt",2]]],2], false]
      ],
    },
    {
      key: "Logic C",
      tests: [
        [["all",["lte",2],[2,-2,-4]], false],
        [["any",["gte",-2],[-3,-2,-5]], true],
        [["none",["gte",-1],[3,-3,-5]], false]
      ],
    },
    {
      key: "Logic D",
      tests: [
        [[["defaultTo",8],2], 2],
        [["when",["lte",-1],["negate"],-5], -5],
        [["unless",["lt",2],["dec"],3], 3],
        [[["ifElse",["lt",0],["inc"],["inc"]],2], 3],
        [[["cond",[["[]",["gte",0],["modulo",-1]],["[]",["lte",2],["divide",-2]],["[]",["T"],["divide",-2]]]],-1], 0],
        [["until",["gte",2],["dec"],1], 1]
      ],
    },
    {
      key: "String A",
      tests: [
        [["toLower","dddAD"], "dddad"],
        [["toUpper","CEebC"], "CEEBC"],
        [["toString",[["multiply",-5,2],["modulo",1,-5]]], "[-10, 1]"],
        [["trim"," BBd "], "BBd"]
      ],
    },
    {
      key: "String B",
      tests: [
        [["test",["reg","c"],"ABdBE"], false],
        [["match",["reg","b"],"CeDcA"], []],
        [["replace",["reg","b"],"BccEE","AeaBD"], "AeaBD"],
        [["split",["reg","a"],"CBbCe"], ["CBbCe"]],
        [["join","E",["D","E","e"]], "DEEEe"]
      ],
    },
    {
      key: "Type A",
      tests: [
        [["is",["typ","String"],[4,1,3]], false],
        [["isNil",null], true],
        [["propIs",["typ","Object"],"a",{"e":0,"B":2,"a":0}], false],
        [["type",{"b":6,"A":4,"C":8}], "Object"]
      ],
    },
    {
      key: "List A",
      tests: [
        [["head",[8,4,5]], 8],
        [["last",[2,2,0]], 0],
        [["init",[1,3,1]], [1,3]],
        [["tail",[4,1,1]], [1,1]],
        [["uniq",[2,1,0,3,0,-2,-5,-3,-4]], [2,1,0,3,-2,-5,-3,-4]],
        [["reverse",[0,2,0]], [0,2,0]],
        [["dropRepeats",[-4,-1,1,3,-1,3,-5,2,-5]], [-4,-1,1,3,-1,3,-5,2,-5]]
      ],
    },
    {
      key: "List B",
      tests: [
        [["append",1,[5,6,7]], [5,6,7,1]],
        [["prepend",6,[8,4,3]], [6,8,4,3]],
        [["insert",2,4,[8,5,1]], [8,5,4,1]],
        [["insertAll",0,[1,4,7],[7,8,4]], [1,4,7,7,8,4]],
        [["intersperse",2,[0,5,7]], [0,2,5,2,7]],
        [["concat",[2,4,6],[6,4,8]], [2,4,6,6,4,8]],
        [["update",1,3,[0,6,3]], [0,3,3]],
        [["move",1,2,[0,0,0]], [0,0,0]],
        [["remove",0,2,[8,4,8,3,6]], [8,3,6]],
        [["without",[4,5,0],[5,3,6,6,3,2,5,6,4]], [3,6,6,3,2,6]],
        [["take",1,[3,5,3,1,2]], [3]],
        [["takeLast",4,[0,8,5,5,0]], [8,5,5,0]],
        [["drop",1,[6,7,0,5,4]], [7,0,5,4]],
        [["dropLast",3,[1,6,3,0,5]], [1,6]],
        [["slice",0,7,[6,7,0,0,3,3,2,8,6]], [6,7,0,0,3,3,2]]
      ],
    },
    {
      key: "List C",
      tests: [
        [["intersection",[2,2,0],[2,8,8]], [2]],
        [["union",[1,0,3],[8,6,7]], [1,0,3,8,6,7]],
        [["difference",[5,3,5],[1,5,7]], [3]],
        [["symmetricDifference",[7,0,3],[4,1,7]], [0,3,4,1]],
        [["unionWith",["eqBy",["negate"]],[-2,-3,2],[1,1,-5]], [-2,-3,2,1,-5]],
        [["differenceWith",["eqBy",["inc"]],[-3,2,-4],[1,-3,-2]], [2,-4]],
        [["symmetricDifferenceWith",["eqBy",["inc"]],[2,-4,-5],[3,-5,1]], [2,-4,3,1]]
      ],
    },
    {
      key: "List D",
      tests: [
        [["of",8], [8]],
        [["pair",1,3], [1,3]],
        [["range",2,5], [2,3,4]],
        [["repeat",7,3], [7,7,7]],
        [["times",["multiply",2],2], [0,2]],
        [["flatten",[[2,0,8],[6,0,3],[6,5,3]]], [2,0,8,6,0,3,6,5,3]],
        [["zipWith",["subtract"],[4,2,4],[5,0,0]], [-1,2,4]],
        [["pluck","e",[{"C":4,"E":5,"e":1},{"D":2,"c":7,"e":5},{"D":5,"b":0,"a":3}]], [1,5,null]]
      ],
    },
    {
      key: "List E",
      tests: [
        [["adjust",0,["dec"],[7,4,1]], [6,4,1]],
        [["map",["inc"],[4,8,3]], [5,9,4]],
        [["filter",["lt",-2],[0,6,1]], [0,6,1]],
        [["reject",["gte",-3],[1,2,1]], [1,2,1]],
        [["uniqBy",["inc"],[2,0,2,2,-5,-5,-1,-2,-5]], [2,0,-5,-1,-2]],
        [["uniqWith",["eqBy",["negate"]],[3,-4,-5,2,-3,-1,1,-3,-1]], [3,-4,-5,2,-3,-1,1]],
        [["dropWhile",["gte",0],[0,-3,1,-5,3]], [1,-5,3]],
        [["dropLastWhile",["lte",-1],[0,2,-2,0,1]], [0,2,-2]],
        [["dropRepeatsWith",["gt",3],[-5,3,0,2,-4,-1,3,-1,-5]], [-5]],
        [["takeWhile",["lt",-1],[1,-3,-3,3,2]], [1]],
        [["takeLastWhile",["gte",-4],[1,-3,3,0,-5]], [-5]],
        [["sort",["subtract"],[6,1,1,3,4,8,2,2,0]], [0,1,1,2,2,3,4,6,8]],
        [["sortBy",["dec"],[-4,-2,-1,0,0]], [-4,-2,-1,0,0]],
        [[["sortWith",["[]",["descend",["prop",1]],["ascend",["prop",0]]]],[[6,1,3],[2,7,1],[6,5,1]]], [[2,7,1],[6,5,1],[6,1,3]]]
      ],
    },
    {
      key: "List F",
      tests: [
        [["includes",2,[1,4,0,3,8]], false],
        [["startsWith",[2,2],[1,2,2,1,2]], false],
        [["endsWith",[2,1],[0,2,2,2,1]], true],
        [["findIndex",["lt",-4],[-3,-5,2,-2,-1]], 0],
        [["findLastIndex",["lt",-1],[1,0,-3,-2,2]], 4],
        [["indexOf",2,[5,8,8,6,7]], -1],
        [["lastIndexOf",8,[6,4,5,3,1]], -1],
        [["length",[7,1,2,1,8,0,8]], 7],
        [["count",["gte",2],[-5,2,2,-5,1]], 5],
        [["nth",1,[2,4,4,0,3]], 4],
        [["find",["gt",-1],[3,0,2,0,-3]], -3],
        [["findLast",["lt",1],[-4,-4,1,0,2]], 2]
      ],
    },
    {
      key: "List G",
      tests: [
        [["aperture",4,[3,6,7,3,5]], [[3,6,7,3],[6,7,3,5]]],
        [["collectBy",["equals",-1],[-4,2,3,-1,0]], [[-4,2,3,0],[-1]]],
        [["groupWith",["gte",-5],[0,7,7,3,4,4,3,2,3]], [[0],[7],[7],[3],[4],[4],[3],[2],[3]]],
        [["partition",["lt",-1],[-3,-3,-1,-4,1]], [[1],[-3,-3,-1,-4]]],
        [["splitAt",1,[3,1,6,5,2,4,8,2,6]], [[3],[1,6,5,2,4,8,2,6]]],
        [["splitEvery",3,[0,1,1,6,2,0,2,3,1]], [[0,1,1],[6,2,0],[2,3,1]]],
        [["splitWhen",["equals",-3],[-4,-4,3,-3,2,-3,2,1,1]], [[-4,-4,3],[-3,2,-3,2,1,1]]],
        [["splitWhenever",["equals",-5],[1,1,-5,1,-2,-1,-2,-4,-1]], [[1,1],[1,-2,-1,-2,-4,-1]]],
        [["transpose",[[8,3],[6,6],[5,4]]], [[8,6,5],[3,6,4]]],
        [["unnest",[[[8,2,7],[3,1,1]],[8,5,7]]], [[8,2,7],[3,1,1],8,5,7]],
        [["xprod",[3,4,2],[0,3,8]], [[3,0],[3,3],[3,8],[4,0],[4,3],[4,8],[2,0],[2,3],[2,8]]],
        [["zip",[7,0,1],[3,8,2]], [[7,3],[0,8],[1,2]]],
        [["toPairs",{"d":1,"B":8}], [["d",1],["B",8]]],
        [["innerJoin",["flip",["propEq","b"]],[[3,8,7],[5,6,4],[3,2,8]],[4,6,4]], []],
        [[["lift",["add"]],[6,5,0],[3,7,8]], [9,13,14,8,12,13,3,7,8]],
        [[["liftN",2,["multiply"]],[2,2,2],[6,3,3]], [12,6,6,12,6,6,12,6,6]]
      ],
    },
    {
      key: "List H",
      tests: [
        [["scan",["add"],4,[4,4,5]], [4,8,12,17]],
        [["unfold",["ifElse",["lt",0],["applySpec",["[]",["identity"],["dec"]]],["always",false]],5], [5,4,3,2,1]],
        [["mapAccum",["compose",["repeat",["__"],2],["add",-1]],2,[2,3,8]], [-1,[1,0,-1]]],
        [["mapAccumRight",["compose",["repeat",["__"],2],["subtract",-3]],6,[4,7,4]], [-9,[-9,6,-9]]],
        [["reduce",["add"],0,[2,8,7]], 17],
        [["reduceRight",["multiply"],2,[6,6,7]], 504],
        [["reduceWhile",["gt",-4],["add"],1,[6,8,2]], 1]
      ],
    },
    {
      key: "Object A",
      tests: [
        [["identical",0,2], false],
        [["isEmpty",[]], true],
        [["eqBy",["dec"],-2,-3], false],
        [["has","E",{"b":8,"c":3,"a":8}], false],
        [["hasPath",["e","e"],{"d":{"E":8,"c":7,"e":2},"e":{"A":7,"e":3,"D":5}}], true],
        [["propEq","B",0,{"e":8,"a":6,"E":0}], false],
        [["pathEq",[0,0],6,[[5,8,4],[0,1,7],[4,1,5]]], false],
        [["eqProps","e",{"d":7,"A":5,"E":6},{"a":4,"e":6}], false],
        [["propSatisfies",["lt",3],"c",{"B":1,"C":1,"e":4}], false],
        [["pathSatisfies",["lt",2],["a","d"],{"B":{"e":8,"C":8},"E":{"b":1,"d":4,"a":3}}], false],
        [["whereEq",{"b":3,"B":4},{"C":0,"E":1,"c":7}], false],
        [["where",{"A":["lte",-4]},{"d":6,"C":6,"A":3}], true],
        [["whereAny",{"a":["gt",-5]},{"E":4,"b":6,"C":2}], false]
      ],
    },
    {
      key: "Object B",
      tests: [
        [["prop","A",{"d":4,"B":3,"E":5}], []],
        [["propOr",1,"b",{"a":0,"A":0,"D":2}], 1],
        [["props",["e","B","c"],{"D":5,"a":3,"c":1}], [null,null,1]],
        [["path",["C","E"],{"A":{"C":4,"B":6,"c":0},"C":{"a":4,"A":1,"E":7},"B":{"a":7,"b":2,"c":4}}], 7],
        [["pathOr",6,["c","d"],{"D":{"a":2,"C":6},"E":{"E":8,"A":5,"b":6},"a":{"a":4,"b":7,"B":0}}], 6],
        [["paths",[["C","A"],["a","B"],["b","c"]],{"b":{"e":7,"C":3,"c":8},"d":{"e":1,"d":5},"a":{"A":8,"b":6,"B":6}}], [null,6,8]],
        [["pick",["E","d","c"],{"c":8,"b":4,"a":8}], {"c":8}],
        [["pickAll",["D","A","C"],{"e":1,"a":8,"D":1}], {"D":1}],
        [["pickBy",["equals",3],{"A":1,"a":6,"c":3}], {"c":3}],
        [["project",["c","d","C"],[{"b":0,"E":8,"B":6},{"A":3,"e":4,"b":8},{"D":3,"e":4,"a":2}]], [{},{},{}]],
        [["keys",{"D":1,"B":7,"A":6}], ["D","B","A"]],
        [["values",{"E":1,"B":7,"a":5}], [1,7,5]]
      ],
    },
    {
      key: "Object C",
      tests: [
        [["assoc","b",4,{"b":4,"c":5,"E":5}], {"b":4,"c":5,"E":5}],
        [["assocPath",["A","b"],8,{"c":{"d":8,"C":4,"E":7},"A":{"d":6,"D":8},"D":{"e":8,"E":5,"B":2}}], {"c":{"d":8,"C":4,"E":7},"A":{"d":6,"D":8,"b":8},"D":{"e":8,"E":5,"B":2}}],
        [["dissoc","b",{"E":3,"c":7}], {"E":3,"c":7}],
        [["dissocPath",["A","a"],{"C":{"E":8,"B":4,"b":5},"A":{"C":5,"d":6,"D":8}}], {"C":{"E":8,"B":4,"b":5},"A":{"C":5,"d":6,"D":8}}],
        [["omit",["D","A","C"],{"a":8,"d":3,"E":2}], {"a":8,"d":3,"E":2}],
        [["modify","A",["negate"],{"B":5,"A":1}], {"B":5,"A":-1}],
        [["modifyPath",["e","e"],["inc"],{"a":{"D":5,"B":6,"d":1},"A":{"A":5,"c":5,"e":2},"D":{"B":4,"E":0,"a":6}}], {"a":{"D":5,"B":6,"d":1},"A":{"A":5,"c":5,"e":2},"D":{"B":4,"E":0,"a":6}}],
        [["evolve",{"a":["inc"]},{"C":2,"d":3,"E":4}], {"C":2,"d":3,"E":4}],
        [["invert",{"d":0,"C":8,"A":4}], {"0":["d"],"4":["A"],"8":["C"]}],
        [["invertObj",{"e":6,"a":0,"b":1}], {"0":"a","1":"b","6":"e"}],
        [["mapObjIndexed",["inc"],{"B":0,"d":4,"b":8}], {"B":1,"d":5,"b":9}],
        [["unwind","c",{"A":[6,2,8],"d":[7,8,6],"C":[0,0,7]}], [{"A":[6,2,8],"d":[7,8,6],"C":[0,0,7]}]]
      ],
    },
    {
      key: "Object D",
      tests: [
        [["mergeAll",[{"B":6,"A":5,"e":4},{"a":1,"c":5,"A":5},{"B":2,"E":6,"c":1}]], {"B":2,"A":5,"e":4,"a":1,"c":1,"E":6}],
        [["mergeDeepLeft",{"A":{"C":6,"a":2,"e":2},"c":{"A":3,"c":6},"b":{"A":1,"D":8,"e":0}},{"B":{"E":6,"C":5,"d":8},"A":{"A":0,"b":6,"e":7},"a":{"e":2,"b":4}}], {"A":{"C":6,"a":2,"e":2,"A":0,"b":6},"c":{"A":3,"c":6},"b":{"A":1,"D":8,"e":0},"B":{"E":6,"C":5,"d":8},"a":{"e":2,"b":4}}],
        [["mergeDeepRight",{"E":{"A":5,"b":0,"E":2},"A":{"E":8,"b":2},"b":{"B":6,"E":3,"a":4}},{"a":{"d":8,"b":2,"B":4},"d":{"E":2,"D":0,"B":8},"e":{"E":1,"B":7,"C":4}}], {"E":{"A":5,"b":0,"E":2},"A":{"E":8,"b":2},"b":{"B":6,"E":3,"a":4},"a":{"d":8,"b":2,"B":4},"d":{"E":2,"D":0,"B":8},"e":{"E":1,"B":7,"C":4}}],
        [["mergeDeepWith",["add"],{"b":{"c":3,"a":5},"B":{"b":6,"D":3,"c":6},"E":{"D":6,"d":3,"a":8}},{"B":{"E":1,"B":5},"b":{"a":5,"e":8,"C":8}}], {"b":{"c":3,"a":10,"e":8,"C":8},"B":{"b":6,"D":3,"c":6,"E":1,"B":5},"E":{"D":6,"d":3,"a":8}}],
        [["mergeLeft",{"A":3,"c":4,"a":3},{"B":7,"d":4}], {"B":7,"d":4,"A":3,"c":4,"a":3}],
        [["mergeRight",{"D":6,"e":1,"c":1},{"B":2,"d":6,"b":1}], {"D":6,"e":1,"c":1,"B":2,"d":6,"b":1}],
        [["mergeWith",["multiply"],{"c":6,"E":8,"D":4},{"E":0,"d":5,"D":1}], {"c":6,"E":0,"D":4,"d":5}]
      ],
    },
    {
      key: "Object E",
      tests: [
        [["objOf","eCBab",4], {"eCBab":4}],
        [["fromPairs",[[3,7],[0,2],[7,4]]], {"0":2,"3":7,"7":4}],
        [["zipObj",[2,7,4],[6,0,0]], {"2":6,"4":0,"7":0}],
        [["groupBy",["prop","e"],[{"c":3,"B":6,"a":8},{"d":5,"b":5},{"e":0,"E":2,"c":0}]], {"0":[{"e":0,"E":2,"c":0}],"undefined":[{"c":3,"B":6,"a":8},{"d":5,"b":5}]}],
        [["indexBy",["prop","D"],[{"c":3,"D":3,"A":7},{"D":8,"e":2},{"C":0,"e":2,"d":6}]], {"3":{"c":3,"D":3,"A":7},"8":{"D":8,"e":2},"undefined":{"C":0,"e":2,"d":6}}],
        [["countBy",["dec"],[0,6,7]], {"5":1,"6":1,"-1":1}],
        [["reduceBy",["subtract",-3],2,["lte",-2],[0,3,1]], {"true":-5}],
        [[["applySpec",{"e":["negate"],"A":["negate"],"E":["negate"]}],6], {"e":-6,"A":-6,"E":-6}]
      ],
    },
    {
      key: "Function A",
      tests: [
        [["T",{"d":1,"a":2}], true],
        [["F","DEDAe"], false],
        [["identity",[7,5,7]], [7,5,7]],
        [[["always",6],false], 6],
        [["empty","DBcCD"], ""]
      ],
    },
    {
      key: "Function B",
      tests: [
        [[["complement",["lt"]],0,3], false],
        [[["addIndex",["map"]],["subtract"],[2,5,2]], [2,4,0]],
        [[["flip",["add"]],2,6], 8],
        [[["once",["negate"]],8], -8],
        [["apply",["multiply"],[5,2]], 10],
        [["call",["subtract",2],6,3], -4],
        [[["partial",["add"],[0]],7], 7],
        [[["partialRight",["multiply"],[4]],1], 4],
        [[["unapply",["product"]],4,8], 32]
      ],
    },
    {
      key: "Function C",
      tests: [
        [[["o",["dec"],["inc"]],4], 4],
        [[["compose",["add",3],["divide",-4]],0], null],
        [[["pipe",["divide",-3],["subtract",3]],6], 3.5],
        [[["promap",["inc"],["inc"],["negate"]],6], -6],
        [["applyTo",7,["negate"]], -7],
        [[["converge",["divide"],["[]",["negate"],["negate"]]],7], 1],
        [[["juxt",["[]",["subtract"],["subtract"]]],2,1], [1,1]],
        [["on",["divide"],["inc"],3,6], 0.5714285714285714],
        [[["useWith",["modulo"],["[]",["dec"],["inc"]]],5,5], 4],
        [[["chain",["append"],["head"]],[3,3,8]], [3,3,8,3]]
      ],
    },
  ]

  for (const c of cases) {
    describe(c.key, function () {
      for (const v of c.tests) {
        it(`${
          typeof v[0][0] === "string" ? v[0][0] : v[0][0][0]
        }()`, async () => {
          const rules = {
            "let create": { "resource.newData.val": v[0] },
            "allow create": true,
          }
          await db.setRules(rules, "test", { ar: arweave_wallet })
          expect((await db.set({}, "test", "doc")).doc.val).to.eql(v[1])
        })
      }
    })
  }
})
