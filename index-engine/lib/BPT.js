const {
  equals,
  init,
  concat,
  without,
  addIndex,
  range,
  splitAt,
  tail,
  indexOf,
  last,
  splitWhen,
  lt,
  objOf,
  flatten,
  zip,
  median,
  prop,
  isNil,
  map,
} = require("ramda")

const KV = require("./KV")

class BPT {
  constructor(order = 4, sort_fields = "number", kv) {
    this.kv = kv
    this.order = order
    this.sort_fields = sort_fields
    this.max_vals = this.order - 1
    this.min_vals = Math.ceil(this.order / 2) - 1
  }
  get = async key => await this.kv.get(key)
  put = async (key, val) => await this.kv.put(key, val)
  del = async key => await this.kv.del(key)
  putData = async (key, val) => await this.put(`data/${key}`, val)
  putNode = async node => await this.put(node.id, node)
  data = async (key, cache = {}) => {
    if (typeof cache[key] !== "undefined") return cache[key]
    let _data = (await this.get(`data/${key}`)) ?? null
    cache[key] = _data
    return _data
  }
  root = async () => (await this.get("root")) ?? null
  setRoot = async id => (await this.put("root", id)) ?? null
  isOver = (node, plus = 0) => node.vals.length + plus > this.max_vals
  isUnder = (node, plus = 0) => node.vals.length + plus < this.min_vals
  comp(a, b) {
    if (typeof this.sort_fields === "string") {
      return a === b ? 0 : a < b ? 1 : -1
    } else {
      for (const v of this.sort_fields) {
        if (a[v[0]] !== b[v[0]]) {
          return (
            (isNil(a[v[0]])
              ? 1 * (v[1] === "desc" ? -1 : 1)
              : isNil(b[v[0]])
              ? -1 * (v[1] === "desc" ? -1 : 1)
              : a[v[0]] < b[v[0]]
              ? 1
              : -1) * (v[1] === "desc" ? -1 : 1)
          )
        }
      }
      return 0
    }
  }

  async id() {
    const count = ((await this.get("count")) ?? -1) + 1
    await this.put("count", count)
    return count.toString()
  }

  async init(key) {
    let new_node = {
      leaf: true,
      id: await this.id(),
      vals: [key],
      parent: null,
      next: null,
      prev: null,
    }
    await this.putNode(new_node)
    await this.setRoot(new_node.id)
  }

  async search(val, key) {
    let node = await this.get(key ?? (await this.root()) ?? "0")
    if (isNil(node)) return null
    if (node.leaf) return node
    let i = 0
    for (const v of node.vals) {
      if (isNil(val) || this.comp(val, v) === 1) {
        return await this.search(val, node.children[i])
      }
      i++
    }
    return await this.search(val, node.children[i])
  }
  async getOne(key) {
    return { key, val: (await this.searchByKey(key))[0] }
  }
  async getVals(node, vals, index = 0, opt, cache = {}) {
    // should have starting, index, direction, optional conditions
    for (let i = index; i < node.vals.length; i++) {
      const v = node.vals[i]
      vals.push({ key: v, val: await this.data(v, cache) })
      if (!isNil(opt.limit) && vals.length === opt.limit) return
    }
    if (!isNil(node.next)) {
      const next = await this.get(node.next)
      await this.getVals(next, vals, 0, opt, cache)
    }
  }
  async findIndex(_index, node, val, cache) {
    let index = _index
    let isPrev = false
    if (_index === 0) {
      isPrev = !isNil(node.prev)
    } else {
      _index ??= node.vals.length
      for (let i = _index - 1; i >= 0; i--) {
        const _val = await this.data(node.vals[i], cache)
        if (this.comp(_val, val) !== 0) break
        index = i
        if (i === 0) isPrev = !isNil(node.prev)
      }
    }
    if (isPrev) {
      let prev = await this.get(node.prev)
      const [new_index, new_node] = await this.findIndex(null, prev, val, cache)
      return !isNil(new_index) ? [new_index, new_node] : [_index, node]
    } else {
      return [index, node]
    }
  }
  async findLastIndex(_index, node, val, cache) {
    let index = null
    let isNext = false
    if (_index >= node.vals.length - 1) {
      isNext = !isNil(node.next)
    } else {
      for (let i = _index + 1; i < node.vals.length; i++) {
        const _val = await this.data(node.vals[i], cache)
        if (this.comp(_val, val) !== 0) {
          index = i
          break
        }
        if (i === node.vals.length - 1) isNext = !isNil(node.next)
      }
    }
    if (isNext) {
      let next = await this.get(node.next)
      const [new_index, new_node] = await this.findLastIndex(
        -1,
        next,
        val,
        cache
      )
      return !isNil(new_index) ? [new_index, new_node] : [_index, node]
    } else {
      return [index, node]
    }
  }

  async findLastGtIndex(_index, node, val, cache) {
    let index = null
    let isNext = false
    if (_index >= node.vals.length - 1) {
      isNext = !isNil(node.next)
    } else {
      for (let i = _index + 1; i < node.vals.length; i++) {
        const _val = await this.data(node.vals[i], cache)
        if (this.comp(_val, val) === -1) {
          index = i
          break
        }
        if (i === node.vals.length - 1) isNext = !isNil(node.next)
      }
    }
    if (isNext) {
      let next = await this.get(node.next)
      const [new_index, new_node] = await this.findLastGtIndex(
        -1,
        next,
        val,
        cache
      )
      return !isNil(new_index) ? [new_index, new_node] : [_index, node]
    } else {
      return [index, node]
    }
  }

  async getMulti(opt) {
    let start = opt.startAt ?? opt.startAfter
    const first_node = !isNil(start)
      ? await this.search(start)
      : await this.search()
    if (isNil(first_node)) return []
    let vals = []
    let cache = {}
    // startAt -> find the first val, startAfter find the last one before the val
    let index = 0
    let _node = first_node
    let _index = index
    if (!isNil(start)) {
      let [index, smaller, greater] = await this.binarySearch(
        first_node,
        start,
        cache
      )
      if (!isNil(opt.startAt)) {
        _index = index
        if (!isNil(greater)) {
          _index = greater
        } else if (!isNil(index)) {
          // get the index of the first item with val
          const [new_index, new_node] = await this.findIndex(
            _index,
            first_node,
            start,
            cache
          )
          if (!isNil(new_index)) {
            _index = new_index
            _node = new_node
          }
        } else if (!isNil(smaller) && !isNil(first_node.next)) {
          const next = await this.get(first_node.next)
          const [new_index, new_node] = await this.findLastGtIndex(
            -1,
            next,
            start,
            cache
          )
          if (!isNil(new_index)) {
            _index = new_index
            _node = new_node
          }
        }
      } else if (!isNil(opt.startAfter)) {
        _index = null
        if (!isNil(greater)) {
          _index = greater
        } else if (!isNil(index)) {
          // get the index of the last item with val
          const [new_index, new_node] = await this.findLastIndex(
            _index,
            first_node,
            start,
            cache
          )
          if (!isNil(new_index)) {
            _index = new_index
            _node = new_node
          }
        } else if (!isNil(smaller) && !isNil(first_node.next)) {
          const next = await this.get(first_node.next)
          const [new_index, new_node] = await this.findLastGtIndex(
            -1,
            next,
            start,
            cache
          )
          if (!isNil(new_index)) {
            _index = new_index
            _node = new_node
          }
        }
      }
    }
    if (!isNil(_index)) await this.getVals(_node, vals, _index, opt, cache)
    return vals
  }

  async searchByKey(key) {
    const val = await this.data(key)
    if (isNil(val)) return [null, null, null]
    let node = await this.search(val)
    if (isNil(node)) return [val, null, null]
    return [val, ...(await this.searchNode(node, key, val, true))]
  }

  async binarySearch(node, val, cache = {}) {
    let left = 0
    let right = node.vals.length - 1
    while (left <= right) {
      let mid = Math.floor((left + right) / 2)
      let midval = await this.data(node.vals[mid], cache)
      if (this.comp(midval, val) === 0) {
        return [mid, null, null]
      } else if (this.comp(midval, val) === 1) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return [
      null,
      right >= 0 ? right : null,
      left < node.vals.length ? left : null,
    ]
  }

  async searchNode(node, key, val, first = false, cache = {}) {
    let start = 0
    let greater = null
    let smaller = null
    if (first) {
      ;[start, smaller, greater] = await this.binarySearch(node, val, cache)
    }
    let isPrev = start === 0
    // get nodes containing the val
    if (start === null) return [null, null]
    if (start > 0) {
      //search backword first
      for (let i = start - 1; i >= 0; i--) {
        const v = node.vals[i]
        if (v === key) return [i, node]
        const _val = await this.data(v, cache)
        if (this.comp(_val, val) === 1) break
        if (i === 0) isPrev = true
      }
    }
    for (let i = 0; i < node.vals.length; i++) {
      const v = node.vals[i]
      if (v === key) return [i, node]
      const _val = await this.data(v, cache)
      if (this.comp(val, _val) === 1) {
        if (isPrev) break
        return [null, null]
      }
    }
    // search ends up the right most node, so there is no next
    return isPrev && !isNil(node.prev)
      ? await this.searchNode(await this.get(node.prev), key, val)
      : [null, null]
  }

  // can be merged with recursive balance?
  async rmIndex(val_index, child_index, node) {
    node.vals.splice(val_index, 1)
    node.children.splice(child_index, 1)
    if (this.isUnder(node)) {
      if (!isNil(node.parent)) {
        let parent = await this.get(node.parent)
        let index = indexOf(node.id, parent.children)
        let isMerged = false
        const isPrev = index > 0
        const isNext = index + 1 < parent.children.length
        let prev = null
        let next = null
        if (isPrev) {
          prev = await this.get(parent.children[index - 1])
          if (!this.isUnder(prev, -1)) {
            node.vals.unshift(parent.vals[index - 1])
            node.children.unshift(prev.children.pop())
            parent.vals[index - 1] = prev.vals.pop()
            await this.putNode(node)
            await this.putNode(prev)
            await this.putNode(parent)
            let child = await this.get(node.children[0])
            child.parent = node.id
            await this.putNode(child)
            isMerged = true
          }
        }
        if (!isMerged && isNext) {
          next = await this.get(parent.children[index + 1])
          if (!this.isUnder(next, -1)) {
            node.vals.push(parent.vals[index])
            node.children.push(next.children.shift())
            parent.vals[index] = next.vals.shift()
            await this.putNode(node)
            await this.putNode(next)
            await this.putNode(parent)
            let child = await this.get(last(node.children))
            child.parent = node.id
            await this.putNode(child)
            isMerged = true
          }
        }
        if (!isMerged && isPrev) {
          if (!this.isOver(prev, node.vals.length + 1)) {
            prev.children = concat(prev.children, node.children)
            // update parent of children
            for (const c of node.children) {
              let child = await this.get(c)
              child.parent = prev.id
              await this.putNode(child)
            }
            prev.vals.push(parent.vals[index - 1])
            prev.vals = concat(prev.vals, node.vals)
            prev.next = node.next || null
            if (!isNil(node.next)) {
              let next = await this.get(node.next)
              next.prev = node.prev || null
              await this.putNode(next)
            }
            await this.rmIndex(index - 1, index, parent)
            await this.putNode(prev)
            isMerged = true
          }
        }
        if (!isMerged && isNext) {
          if (!this.isOver(next, node.vals.length + 1)) {
            next.children = concat(node.children, next.children)
            // update parent of children
            for (const c of node.children) {
              let child = await this.get(c)
              child.parent = next.id
              await this.putNode(child)
            }
            next.vals.unshift(parent.vals[index])
            next.vals = concat(node.vals, next.vals)
            next.prev = node.prev || null
            if (!isNil(node.prev)) {
              let prev = await this.get(node.prev)
              prev.next = node.next || null
              await this.putNode(prev)
            }
            await this.rmIndex(index, index, parent)
            await this.putNode(next)
            isMerged = true
          }
        }
      } else if (node.vals.length === 0) {
        let root = null
        for (const c of node.children) {
          let child = await this.get(c)
          child.parent = null
          root = c
          await this.putNode(child)
        }
        if ((await this.root()) === node.id) {
          this.setRoot(root)
          this.del(node.id)
        }
      }
    }
  }

  async updateIndexes(index, node, val, changed) {
    if (index === 0 && !isNil(node.parent)) {
      let parent = await this.get(node.parent)
      if (isNil(parent)) return
      let parent_index = indexOf(node.id, parent.children)
      if (node.leaf) {
        if (node.vals.length > 0) {
          val = await this.data(node.vals[0])
        } else if (!isNil(node.next)) {
          let next = await this.get(node.next)
          val = await this.data(next.vals[0])
        } else {
          return
        }
      }
      // should we use comp?
      if (equals(val, changed) && parent_index > 0) {
        parent.vals[parent_index - 1] = val
        await this.putNode(parent)
      } else if (val !== changed && parent_index > 0) {
        parent.vals[parent_index - 1] = val
        await this.putNode(parent)
      } else if (parent_index === 0) {
        await this.updateIndexes(0, parent, val, changed)
      }
    }
  }

  // borrow from left, borrow from right, merge with left, merge with right
  async balance(val, child_index, node) {
    let merge_node = node
    let merge_child_index = child_index
    if (this.isUnder(node)) {
      if (!isNil(node.parent)) {
        let parent = await this.get(node.parent)
        let index = indexOf(node.id, parent.children)
        let isMerged = false
        const isPrev = index > 0
        const isNext = index + 1 < parent.children.length
        let prev = null
        let next = null
        if (isPrev) {
          // check left
          prev ??= await this.get(parent.children[index - 1])
          // check if brrowable
          if (!this.isUnder(prev, -1)) {
            isMerged = true
            node.vals.unshift(prev.vals.pop())
            parent.vals[index - 1] = await this.data(node.vals[0])
            await this.putNode(prev)
            await this.putNode(node)
          }
        }
        if (!isMerged && isNext) {
          // check right
          next ??= await this.get(parent.children[index + 1])
          // check if brrowable
          if (!this.isUnder(next, -1)) {
            isMerged = true
            node.vals.push(next.vals.shift())
            parent.vals[index] = await this.data(next.vals[0])
            await this.putNode(next)
            await this.putNode(node)
          }
        }
        if (!isMerged && isPrev) {
          // check if mergeable
          if (!this.isOver(prev, node.vals.length)) {
            prev.vals = concat(prev.vals, node.vals)
            prev.next = node.next ?? null
            if (!isNil(node.prev) && !isNil(node.next)) {
              let next = await this.get(node.next)
              next.prev = node.prev
              await this.putNode(next)
            }
            await this.putNode(prev)
            await this.rmIndex(index - 1, index, parent)
            await this.del(node.id)
            isMerged = true
          }
        }
        if (!isMerged && isNext) {
          // check if mergeable
          if (!this.isOver(next, node.vals.length)) {
            next.vals = concat(node.vals, next.vals)
            next.prev = node.prev ?? null
            if (!isNil(node.prev) && !isNil(node.next)) {
              let prev = await this.get(node.prev)
              prev.next = node.next
              await this.putNode(prev)
            }
            merge_node = next
            merge_child_index = 0
            await this.putNode(next)
            await this.rmIndex(index, index, parent)
            await this.del(node.id)
            isMerged = true
          }
        }
        await this.putNode(parent)
      } else if (node.vals.length === 0) {
        // removing root, root can have any number of vals
        await this.setRoot(null)
        await this.del(node.id)
      }
    }
    await this.updateIndexes(merge_child_index, merge_node, null, val)
  }

  async delete(key) {
    // get node containing the val, maybe searchBy key is needed, search needs to be binary search
    let [val, index, node] = await this.searchByKey(key)
    if (isNil(node)) return
    node.vals = without([key], node.vals)
    await this.putData(key, node)
    await this.balance(val, index, node)
  }

  async _insert(key, val, node) {
    let index = 0
    let exists = false
    for (let v of node.vals) {
      if (this.comp(val, await this.data(v)) >= 0) {
        node.vals.splice(index, 0, key)
        exists = true
        break
      }
      index += 1
    }
    if (!exists) node.vals.push(key)
  }

  async insert(key, val) {
    // add data to kvs
    await this.putData(key, val)

    // get node
    let node = await this.search(val)

    if (isNil(node)) {
      // init if no root
      await this.init(key)
    } else {
      // insert
      await this._insert(key, val, node)

      // if full split
      if (this.isOver(node)) await this.split(node)
      await this.putNode(node)
    }
  }

  async splitChildren(node, new_node) {
    if (!node.leaf) {
      const childrens = splitAt(node.vals.length + 1, node.children)
      node.children = childrens[0]
      new_node.children = childrens[1]

      // update parents of new_node children
      for (const v of childrens[1]) {
        let child = await this.get(v)
        child.parent = new_node.id
        await this.putNode(child)
      }
    }
  }

  async _split(node) {
    // last problem
    let nodes = splitAt(Math.ceil(node.vals.length / 2))(node.vals)
    node.vals = node.leaf ? nodes[0] : init(nodes[0])
    let new_node = {
      leaf: node.leaf,
      id: await this.id(),
      vals: nodes[1],
      prev: node.id,
      next: node.next ?? null,
    }

    // set next pointer
    if (!isNil(node.next)) {
      let next = await this.get(node.next)
      next.prev = new_node.id
      await this.putNode(next)
    }
    node.next = new_node.id
    const top = node.leaf ? nodes[1][0] : last(nodes[0])
    await this.splitChildren(node, new_node)
    return [node.leaf ? await this.data(top) : top, new_node]
  }

  async getParent(node, new_node, top) {
    const isNewParent = isNil(node.parent)
    let parent = !isNewParent
      ? await this.get(node.parent)
      : {
          leaf: false,
          id: await this.id(),
          vals: [top],
          children: [node.id, new_node.id],
        }
    if (!isNewParent) {
      const ind = indexOf(node.id, parent.children)
      parent.vals.splice(ind, 0, top)
      parent.children.splice(ind + 1, 0, new_node.id)
    }
    return [isNewParent, parent]
  }

  async split(node) {
    let [top, new_node] = await this._split(node)
    let [isNewParent, parent] = await this.getParent(node, new_node, top)
    new_node.parent = parent.id
    node.parent = parent.id
    await this.putNode(new_node)
    await this.putNode(parent)
    if (isNewParent) await this.setRoot(parent.id)
    if (this.isOver(parent)) await this.split(parent)
  }
}

module.exports = BPT
