import { of, pof } from "./monade.js"
const db = async obj => await pof(obj)
export default db
