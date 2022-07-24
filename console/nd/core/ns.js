import plugins from "nd/.plugins"
import { hasPath } from "ramda"
export default plugin => (name = null) => {
  if (name === null) {
    return hasPath([plugin, "namespace"])(plugins) &&
      plugins[plugin].namespace !== null
      ? plugins[plugin].namespace
      : plugin
  } else {
    const suffix =
      hasPath([plugin, "namespace"])(plugins) &&
      plugins[plugin].namespace !== null
        ? `$${plugins[plugin].namespace}`
        : hasPath([plugin, "core"])(plugins) && plugins[plugin].core
          ? ""
          : `$${plugin}`
    return name + suffix
  }
}
