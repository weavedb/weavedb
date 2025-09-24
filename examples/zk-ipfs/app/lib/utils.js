// lib/utils.js
import { ethers } from "ethers"
import { DB } from "wdb-sdk"
import { pad, path as _path } from "zkjson"

// Contract Configuration
export const ZKNFT_ABI = [
  "function mint(address to, string memory uri) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]

export const ZKNFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ETH_CONTRACT ||
  "0x09dcAf47e3d70804355609e97Ebb1d04DB41b586"

export const RPC_URLS = [
  "https://sepolia.drpc.org",
  "https://ethereum-sepolia.publicnode.com",
  "https://1rpc.io/sepolia",
  "https://sepolia.gateway.tenderly.co",
]

// Field Types Configuration
export const FIELD_TYPES = [
  { value: "string", label: "String" },
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "boolean", label: "Boolean" },
  { value: "array", label: "Array" },
  { value: "object", label: "Object" },
]

// Database instance
let dbInstance = null

// Initialize Database
export const initializeDB = async () => {
  if (!dbInstance) {
    dbInstance = new DB({
      id: process.env.NEXT_PUBLIC_DB_ID,
      url: process.env.NEXT_PUBLIC_RU_URL,
      hb: process.env.NEXT_PUBLIC_HB_URL,
    })
  }
  return dbInstance
}

export const getDB = () => dbInstance

// Database Functions
export const fetchPosts = async db => {
  if (!db) return []
  return await db.cget("ipfs", ["date", "desc"], 10)
}

export const searchByCID = async (db, cid) => {
  if (!db || !cid.trim()) return []
  const cleanCID = cid.replace(/^ipfs:\/\//, "")
  return await db.cget("ipfs", ["cid"], ["cid", "==", cleanCID], 10)
}

export const uploadToIPFS = async (db, json) => {
  if (!db) throw new Error("Database not initialized")

  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
  }

  const res = await db.set("add:json", { json }, "ipfs")
  return res
}

// RPC Provider Functions
export const getWorkingProvider = async () => {
  for (const rpcUrl of RPC_URLS) {
    try {
      console.log(`Trying RPC: ${rpcUrl}`)
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      await provider.getNetwork()
      console.log(`RPC working: ${rpcUrl}`)
      return provider
    } catch (e) {
      console.log(`RPC failed: ${rpcUrl}`)
      continue
    }
  }
  throw new Error("All RPC endpoints failed")
}

// NFT Functions
export const fetchLatestNFTs = async db => {
  try {
    const provider = await getWorkingProvider()
    const contract = new ethers.Contract(
      ZKNFT_CONTRACT_ADDRESS,
      ZKNFT_ABI,
      provider,
    )

    const nfts = []

    for (let tokenId = 0; tokenId < 30 && nfts.length < 10; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId)
        console.log(`Token ${tokenId} exists, owner: ${owner}`)

        try {
          const tokenURI = await contract.tokenURI(tokenId)
          const cid = tokenURI.replace("ipfs://", "")

          let metadata = null
          let docId = null

          if (db && cid) {
            try {
              const results = await db.cget(
                "ipfs",
                ["cid"],
                ["cid", "==", cid],
                1,
              )
              if (results.length > 0) {
                metadata = results[0].data.json
                docId = results[0].id
              }
            } catch (e) {
              console.log("No metadata found for CID:", cid)
            }
          }

          nfts.push({
            tokenId,
            tokenURI,
            cid,
            metadata,
            id: docId,
            owner: `${owner.slice(0, 6)}...${owner.slice(-4)}`,
          })
        } catch (uriError) {
          console.error(`Failed to get URI for token ${tokenId}:`, uriError)
          nfts.push({
            tokenId,
            tokenURI: "",
            cid: "",
            metadata: null,
            id: null,
            owner: `${owner.slice(0, 6)}...${owner.slice(-4)}`,
          })
        }
      } catch (e) {
        // Token doesn't exist, continue
      }
    }

    console.log(`Found ${nfts.length} NFTs total`)
    return nfts
  } catch (error) {
    console.error("Failed to fetch latest NFTs:", error)
    return []
  }
}

export const fetchOwnedNFTs = async (account, wallet, db) => {
  if (!account || !wallet) return []

  try {
    const contract = new ethers.Contract(
      ZKNFT_CONTRACT_ADDRESS,
      ZKNFT_ABI,
      wallet,
    )

    const balance = await contract.balanceOf(account)
    const nftCount = Number(balance)

    if (nftCount === 0) return []

    console.log(`User has ${nftCount} NFTs`)

    const nfts = []

    // Try to fetch from transfer events first
    try {
      const filterTo = contract.filters.Transfer(null, account)
      const eventsTo = await contract.queryFilter(filterTo, -50000, "latest")

      const filterFrom = contract.filters.Transfer(account, null)
      const eventsFrom = await contract.queryFilter(
        filterFrom,
        -50000,
        "latest",
      )

      const receivedTokens = new Map()
      for (const event of eventsTo) {
        const tokenId = Number(event.args[2])
        receivedTokens.set(tokenId, event.blockNumber)
      }

      for (const event of eventsFrom) {
        const tokenId = Number(event.args[2])
        const receivedBlock = receivedTokens.get(tokenId)
        if (receivedBlock && event.blockNumber > receivedBlock) {
          receivedTokens.delete(tokenId)
        }
      }

      for (const [tokenId] of receivedTokens) {
        try {
          const currentOwner = await contract.ownerOf(tokenId)
          if (currentOwner.toLowerCase() === account.toLowerCase()) {
            const nftData = await fetchNFTData(contract, tokenId, db)
            if (nftData) nfts.push(nftData)
          }
        } catch (e) {
          continue
        }
      }
    } catch (e) {
      console.error("Failed to fetch Transfer events:", e)
    }

    // Fallback: check token IDs directly if needed
    if (nfts.length < nftCount) {
      const maxTokensToCheck = 100
      for (
        let tokenId = 0;
        tokenId < maxTokensToCheck && nfts.length < nftCount;
        tokenId++
      ) {
        if (nfts.some(nft => nft.tokenId === tokenId)) continue

        try {
          const owner = await contract.ownerOf(tokenId)
          if (owner.toLowerCase() === account.toLowerCase()) {
            const nftData = await fetchNFTData(contract, tokenId, db)
            if (nftData) nfts.push(nftData)
          }
        } catch (e) {
          continue
        }
      }
    }

    nfts.sort((a, b) => a.tokenId - b.tokenId)
    return nfts
  } catch (error) {
    console.error("Failed to fetch owned NFTs:", error)
    return []
  }
}

const fetchNFTData = async (contract, tokenId, db) => {
  try {
    const tokenURI = await contract.tokenURI(tokenId)
    const cid = tokenURI.replace("ipfs://", "")

    let metadata = null
    let docId = null

    if (db && cid) {
      try {
        const results = await db.cget("ipfs", ["cid"], ["cid", "==", cid], 1)
        if (results.length > 0) {
          metadata = results[0].data.json
          docId = results[0].id
        }
      } catch (e) {
        console.error("Failed to fetch metadata from DB:", e)
      }
    }

    return {
      tokenId,
      tokenURI,
      cid,
      metadata,
      id: docId,
    }
  } catch (e) {
    console.error(`Failed to fetch NFT data for token ${tokenId}:`, e)
    return null
  }
}

export const mintNFT = async (cid, account, wallet) => {
  if (!wallet) throw new Error("Wallet not available")

  const signer = await wallet.getSigner()
  const contract = new ethers.Contract(
    ZKNFT_CONTRACT_ADDRESS,
    ZKNFT_ABI,
    signer,
  )

  const tx = await contract.mint(account, `ipfs://${cid}`)
  const receipt = await tx.wait()

  return receipt
}

// Wallet Functions
export const connectWallet = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed")
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  })

  const provider = new ethers.BrowserProvider(window.ethereum)

  // Try to switch to Sepolia
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    })
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Chain not added, try to add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: {
              name: "SepoliaETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://sepolia.infura.io/v3/"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      })
    }
  }

  return {
    account: accounts[0],
    provider,
  }
}

// Wallet Event Handlers
export const setupWalletListeners = (onAccountsChanged, onChainChanged) => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("accountsChanged", onAccountsChanged)
    window.ethereum.on("chainChanged", onChainChanged)

    return () => {
      window.ethereum.removeAllListeners("accountsChanged")
      window.ethereum.removeAllListeners("chainChanged")
    }
  }
  return () => {}
}

// JSON Path Functions
export const getJsonPaths = (obj, prefix = "") => {
  const paths = []

  if (obj === null || obj === undefined) {
    return []
  }

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return [prefix || "root"]
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const currentPath = prefix ? `${prefix}.${index}` : `${index}`
      paths.push(...getJsonPaths(item, currentPath))
    })
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key
      paths.push(...getJsonPaths(obj[key], currentPath))
    })
  }

  return paths
}

// Field Management
export const createField = () => ({
  id: Date.now(),
  name: "",
  type: "string",
  value: "",
})

export const updateFieldProperty = (fields, id, property, value) => {
  return fields.map(field =>
    field.id === id ? { ...field, [property]: value } : field,
  )
}

export const removeFieldById = (fields, id) => {
  return fields.filter(field => field.id !== id)
}

export const getFieldValue = field => {
  if (field.type === "boolean" && field.value) {
    const val = field.value.toLowerCase()
    return val === "true" ? "true" : val === "false" ? "false" : field.value
  }
  return field.value
}

// Field Validation Functions
export const validateField = field => {
  const errors = []

  if (!field.name.trim()) {
    errors.push("Field name is required")
  }

  if (field.value.trim()) {
    switch (field.type) {
      case "string":
        if (field.value.length > 650) {
          errors.push("String cannot exceed 650 characters")
        }
        break
      case "int":
        if (
          isNaN(parseInt(field.value)) ||
          !Number.isInteger(Number(field.value))
        ) {
          errors.push("Must be a valid integer")
        }
        break
      case "float":
        if (isNaN(Number(field.value))) {
          errors.push("Must be a valid number")
        }
        break
      case "boolean":
        const boolValue = field.value.toLowerCase()
        if (boolValue !== "true" && boolValue !== "false") {
          errors.push('Must be "true" or "false"')
        }
        break
      case "array":
        try {
          const parsed = JSON.parse(field.value)
          if (!Array.isArray(parsed)) {
            errors.push('Must be a valid JSON array (e.g., ["item1", "item2"])')
          }
        } catch {
          errors.push("Must be valid JSON array format")
        }
        break
      case "object":
        try {
          const parsed = JSON.parse(field.value)
          if (
            typeof parsed !== "object" ||
            Array.isArray(parsed) ||
            parsed === null
          ) {
            errors.push('Must be a valid JSON object (e.g., {"key": "value"})')
          }
        } catch {
          errors.push("Must be valid JSON object format")
        }
        break
    }
  }

  return errors
}

export const validateForm = fields => {
  const errors = {}
  let isValid = true

  if (fields.length === 0) {
    return { isValid: false, errors, message: "Please add at least one field" }
  }

  const json = generateJSON(fields)
  const jsonString = JSON.stringify(json)
  if (jsonString.length > 650) {
    return {
      isValid: false,
      errors,
      message: `Total JSON size (${jsonString.length} characters) exceeds 650 character limit. Please reduce your data.`,
    }
  }

  const fieldNames = fields
    .map(f => f.name.trim().toLowerCase())
    .filter(Boolean)
  const duplicates = fieldNames.filter(
    (name, index) => fieldNames.indexOf(name) !== index,
  )

  fields.forEach(field => {
    const fieldErrors = validateField(field)

    if (duplicates.includes(field.name.trim().toLowerCase())) {
      fieldErrors.push("Field name must be unique")
    }

    if (fieldErrors.length > 0) {
      errors[field.id] = fieldErrors[0]
      isValid = false
    }
  })

  return { isValid, errors, message: null }
}

export const generateJSON = fields => {
  const json = {}
  fields.forEach(field => {
    if (field.name.trim()) {
      let value = field.value.trim()
      if (value) {
        switch (field.type) {
          case "int":
            value = parseInt(value)
            break
          case "float":
            value = parseFloat(value)
            break
          case "boolean":
            value = value.toLowerCase() === "true"
            break
          case "array":
            try {
              value = JSON.parse(value)
            } catch {
              value = []
            }
            break
          case "object":
            try {
              value = JSON.parse(value)
            } catch {
              value = {}
            }
            break
          default:
            value = field.value.trim()
        }
        json[field.name.trim()] = value
      }
    }
  })
  return json
}

// ZK Proof Functions
export const generateZKProof = async (cid, docId, tokenId, path) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_ZKP_URL}/cid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cid,
      dir: "ipfs",
      doc: docId || `token-${tokenId}`,
      path: path?.trim() || "root",
      pid: process.env.NEXT_PUBLIC_ZKP_ID,
    }),
  })

  const result = await response.json()

  if (!result.zkp) {
    throw new Error("Transaction not finalized yet")
  }
  result.path = pad(_path(path), 5)
  return result
}

// Utility Functions
export const getFieldType = value => {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") {
    return Number.isInteger(value) ? "int" : "float"
  }
  return "string"
}

export const getEtherscanLink = fieldType => {
  const baseUrl = `https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_ETH_CONTRACT}#readContract`
  switch (fieldType) {
    case "boolean":
      return `${baseUrl}#F9`
    case "int":
      return `${baseUrl}#F13`
    case "float":
      return `${baseUrl}#F11`
    default:
      return `${baseUrl}#F15`
  }
}

export const getEtherscanTokenLink = tokenId => {
  return `https://sepolia.etherscan.io/token/${ZKNFT_CONTRACT_ADDRESS}?a=${tokenId}`
}

export const getEtherscanTxLink = txHash => {
  return `https://sepolia.etherscan.io/tx/${txHash}`
}

export const getScanLink = () => {
  return `${process.env.NEXT_PUBLIC_SCAN_URL}/db/${process.env.NEXT_PUBLIC_DB_ID}?url=${process.env.NEXT_PUBLIC_RU_URL}`
}

export const getTransactionLink = slot => {
  return `${process.env.NEXT_PUBLIC_SCAN_URL}/db/${process.env.NEXT_PUBLIC_DB_ID}/tx/${slot}?url=${process.env.NEXT_PUBLIC_RU_URL}`
}

export const copyToClipboard = async text => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand("copy")
      } catch (err) {
        throw new Error("Copy failed")
      } finally {
        textArea.remove()
      }
    }
    return true
  } catch (err) {
    console.error("Failed to copy:", err)
    return false
  }
}

// Toast Management
export const createToast = (message, type = "info") => {
  return {
    id: Date.now(),
    message,
    type,
  }
}

// Format wallet address
export const formatAddress = address => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Complex handlers that combine multiple operations
export const handleMintProcess = async (cid, account, wallet, onConnect) => {
  let finalAccount = account
  let finalWallet = wallet

  if (!account || !wallet) {
    const { account: newAccount, provider } = await connectWallet()
    if (!newAccount) {
      throw new Error("Wallet connection cancelled")
    }
    finalAccount = newAccount
    finalWallet = provider
    onConnect?.(newAccount, provider)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const receipt = await mintNFT(cid, finalAccount, finalWallet)
  window.open(getEtherscanTxLink(receipt.hash), "_blank")

  return receipt
}

export const handleFormSubmission = async (fields, db) => {
  const validation = validateForm(fields)

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      message: validation.message,
    }
  }

  const json = generateJSON(fields)
  const res = await uploadToIPFS(db, json)
  if (!res.success) {
    return {
      success: false,
      message: "Upload failed",
    }
  }

  const posts = await fetchPosts(db)
  const newPosts = await db.cget("ipfs", ["cid"], 1)
  return {
    success: true,
    slot: res.result.result.i,
    posts,
    newCID: res.result?.data?.cid,
    searchResult: newPosts[0] || null,
  }
}

export const handleProofGeneration = async (v, path) => {
  const id = v.tokenId || v.id
  const cidToUse = v.cid || v.data?.cid

  const result = await generateZKProof(cidToUse, v.id, v.tokenId, path)

  if (!result.zkp) {
    throw new Error("Proof generation failed")
  }

  return {
    id,
    proof: result.zkp,
    path: result.path,
  }
}

export const extractValueFromPath = (obj, path) => {
  if (!path || !obj) return obj

  const pathParts = path.split(".")
  let currentValue = obj

  for (const part of pathParts) {
    if (currentValue && typeof currentValue === "object") {
      currentValue = currentValue[part]
    }
  }

  return currentValue
}

// Error message helpers
export const getErrorMessage = error => {
  if (error.code === "ACTION_REJECTED" || error.code === 4001) {
    return "Transaction rejected by user"
  } else if (error.code === "INSUFFICIENT_FUNDS") {
    return "Insufficient funds for gas"
  } else if (error.message?.includes("network")) {
    return "Network error. Please check your connection."
  } else {
    return error.message?.slice(0, 50) || "Unknown error"
  }
}

// Placeholder helpers for field types
export const getFieldPlaceholder = type => {
  switch (type) {
    case "int":
      return "e.g., 42"
    case "float":
      return "e.g., 3.14"
    case "array":
      return '["item1", "item2"]'
    case "object":
      return '{"key": "value"}'
    default:
      return "Enter text"
  }
}
