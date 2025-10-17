import { ka } from "monade"
import schema from "./dev_schema.js"
import { putData } from "./utils.js"
import trigger from "./dev_trigger.js"

export default ka().map(schema).map(putData).map(trigger)
