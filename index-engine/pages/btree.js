import { useState, useEffect } from "react"
import { Box, Flex } from "@chakra-ui/react"

class Node {
  constructor() {
    this.keys = []
    this.children = []
    this.parentIdx = null
  }
}

class BPlusTree {
  constructor(order = 3) {
    this.nodes = [new Node()]
    this.order = order
  }

  get root() {
    return this.nodes[0]
  }

  insert(key) {
    let nodeIdx = this._findNode(key, 0)
    this._insertIntoNode(key, nodeIdx)
  }

  _findNode(key, nodeIdx) {
    const node = this.nodes[nodeIdx]

    if (node.children.length === 0) {
      return nodeIdx
    }

    for (let i = 0; i < node.keys.length; i++) {
      if (key < node.keys[i]) {
        return this._findNode(key, node.children[i])
      }
    }

    return this._findNode(key, node.children[node.children.length - 1])
  }

  _insertIntoNode(key, nodeIdx) {
    const node = this.nodes[nodeIdx]
    node.keys.push(key)
    node.keys.sort((a, b) => a - b)

    if (node.keys.length >= this.order) {
      this._splitNode(nodeIdx)
    }
  }

  _splitNode(nodeIdx) {
    const node = this.nodes[nodeIdx]
    const middleIndex = Math.floor(node.keys.length / 2)
    const middleKey = node.keys[middleIndex]

    const leftNode = new Node()
    const rightNode = new Node()

    leftNode.keys = node.keys.slice(0, middleIndex)
    rightNode.keys = node.keys.slice(middleIndex + 1)

    if (node.children.length > 0) {
      leftNode.children = node.children.slice(0, middleIndex + 1)
      rightNode.children = node.children.slice(middleIndex + 1)

      leftNode.children.forEach(
        childIdx => (this.nodes[childIdx].parentIdx = this.nodes.length)
      )
      rightNode.children.forEach(
        childIdx => (this.nodes[childIdx].parentIdx = this.nodes.length + 1)
      )
    }

    if (node.parentIdx === null) {
      const newRoot = new Node()
      newRoot.keys = [middleKey]
      newRoot.children = [this.nodes.length, this.nodes.length + 1]

      leftNode.parentIdx = 0
      rightNode.parentIdx = 0

      this.nodes.unshift(newRoot)
    } else {
      leftNode.parentIdx = node.parentIdx
      rightNode.parentIdx = node.parentIdx

      const parent = this.nodes[node.parentIdx]
      const insertIndex = parent.children.indexOf(nodeIdx)
      parent.keys.splice(insertIndex, 0, middleKey)
      parent.children.splice(
        insertIndex,
        1,
        this.nodes.length,
        this.nodes.length + 1
      )

      if (parent.keys.length >= this.order) {
        this._splitNode(node.parentIdx)
      }
    }

    this.nodes.push(leftNode, rightNode)
  }
}

const BPlusTreeComponent = () => {
  const [tree, setTree] = useState(new BPlusTree())

  useEffect(() => {
    tree.insert(10)
    tree.insert(20)
    /*tree.insert(30)
    tree.insert(40)
    tree.insert(50)*/
    console.log(tree)
    setTree({ ...tree })
  }, [])

  const renderNode = nodeIdx => {
    const node = tree.nodes[nodeIdx]
    return (
      <Box
        borderWidth="1px"
        borderColor="gray.300"
        borderRadius="md"
        bg="gray.100"
        px={4}
        py={2}
      >
        <Flex justifyContent="center" alignItems="center">
          {node.keys.map((key, idx) => (
            <Box
              key={idx}
              mx={1}
              fontWeight="bold"
              fontSize="lg"
              fontFamily="mono"
            >
              {key}
            </Box>
          ))}
        </Flex>
        <Flex
          justifyContent="space-between"
          width="100%"
          position="relative"
          mt={4}
        >
          {node.children.map((childIdx, idx) => (
            <Flex
              key={idx}
              flex="1"
              justifyContent="center"
              alignItems="flex-start"
            >
              {renderNode(childIdx)}
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      <Flex justifyContent="center" alignItems="center">
        {renderNode(0)}
      </Flex>
    </Box>
  )
}

export default BPlusTreeComponent
