import { mergeAll } from "ramda"
let local = {}
let auto = {}
const prod = {
  id: "next-dapp",
  html: {
    title: "Next Dapp | The Bridge between Web 2.0 and 3.0",
    description:
      "Next Dapp is a web framework to progressively connect web 2.0 with 3.0.",
    image: "https://picsum.photos/1000/500",
    "theme-color": "#03414D",
  },
}
module.exports = mergeAll([auto, prod, local])
