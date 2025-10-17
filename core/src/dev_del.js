import { ka } from "monade"
import { delData } from "./utils.js"
import trigger from "./dev_trigger.js"

export default ka().map(delData).map(trigger)
