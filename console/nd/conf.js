import { mergeAll } from "ramda"
let local = {}
let auto = {}
const prod = {
  id: "weavedb",
  html: {
    title: "WeaveDB Console",
    description: "NoSQL Database as a Smart Contract on Arweave",
    image: "https://picsum.photos/1000/500",
    "theme-color": "#FF0A37",
  },
}
module.exports = mergeAll([auto, prod, local])
