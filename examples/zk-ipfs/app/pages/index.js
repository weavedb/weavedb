import { useRef, useEffect, useState, useCallback } from "react"
import * as utils from "../lib/utils"
import {
  styles,
  globalStyles,
  mergeStyles,
  conditionalStyle,
} from "../lib/styles"

// ============= Header Components =============
const WalletButton = ({ account, onConnect, onDisconnect }) => {
  if (account) {
    return (
      <>
        <span style={styles.walletAddress}>{utils.formatAddress(account)}</span>
        <button style={styles.buttonSecondary} onClick={onDisconnect}>
          Disconnect
        </button>
      </>
    )
  }

  return (
    <button style={styles.button} onClick={onConnect}>
      Connect Wallet
    </button>
  )
}

const Header = ({ account, onConnectWallet, onDisconnectWallet }) => (
  <header style={styles.header}>
    <h1 style={styles.title}>
      <img src="/favicon.svg" height="32px" style={{ marginRight: "15px" }} />
      zkIPFS Demo
    </h1>
    <div style={styles.headerActions}>
      <WalletButton
        account={account}
        onConnect={onConnectWallet}
        onDisconnect={onDisconnectWallet}
      />
      <a
        href={utils.getScanLink()}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.linkMuted}
      >
        Scan →
      </a>
    </div>
  </header>
)

// ============= Tab Components =============
const TabButton = ({ tab, isActive, onClick }) => (
  <button
    style={mergeStyles(styles.tab, isActive ? styles.tabActive : {})}
    onClick={onClick}
    onMouseEnter={e => {
      if (!isActive) {
        e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)"
      }
    }}
    onMouseLeave={e => {
      if (!isActive) {
        e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"
      }
    }}
  >
    {tab.toUpperCase()}
    <span
      style={mergeStyles(
        styles.tabIndicator,
        isActive ? styles.tabIndicatorActive : {},
      )}
    />
  </button>
)

const TabNavigation = ({ activeTab, onTabChange }) => (
  <div style={styles.tabContainer}>
    {["about", "nft", "upload", "search"].map(tab => (
      <TabButton
        key={tab}
        tab={tab}
        isActive={activeTab === tab}
        onClick={() => onTabChange(tab)}
      />
    ))}
  </div>
)

// ============= NFT Components =============
const NFTMetadata = ({ metadata, loading }) => {
  if (loading) {
    return (
      <div style={styles.metadataLoading}>
        <span style={styles.loadingSpinner}></span>
        <span style={{ marginLeft: "12px" }}>Loading metadata...</span>
      </div>
    )
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div style={styles.metadata}>
        <span
          style={{ color: "rgba(255, 255, 255, 0.5)", fontStyle: "italic" }}
        >
          No metadata available
        </span>
      </div>
    )
  }

  return <div style={styles.metadata}>{JSON.stringify(metadata, null, 2)}</div>
}

const NFTHeader = ({ tokenId, owner, showOwner }) => (
  <div style={styles.nftHeader}>
    <div style={styles.tokenBadge}>Token #{tokenId}</div>
    {showOwner && owner && <div style={styles.ownerText}>Owner: {owner}</div>}
    <a
      href={utils.getEtherscanTokenLink(tokenId)}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.link}
    >
      View on Etherscan →
    </a>
  </div>
)

const CIDDisplay = ({ cid, onCopy }) => (
  <div style={styles.cidContainer}>
    <code style={styles.codeBlock}>{cid}</code>
    <button style={styles.buttonSecondary} onClick={e => onCopy(cid, e.target)}>
      Copy CID
    </button>
  </div>
)

const ProofDisplay = ({
  proof,
  zkpPath,
  encodedPath,
  onCopy,
  onClear,
  id,
  metadata,
}) => {
  // Extract the actual value from metadata to determine field type
  let fieldType = "string"

  if (metadata && zkpPath && zkpPath !== "root") {
    const value = utils.extractValueFromPath(metadata, zkpPath)
    fieldType = utils.getFieldType(value)
  }

  const qType =
    fieldType === "string"
      ? "qString"
      : fieldType === "int"
        ? "qInt"
        : fieldType === "float"
          ? "qFloat"
          : fieldType === "boolean"
            ? "qBool"
            : "qString"

  return (
    <>
      {/* Path Section */}
      <div style={{ marginBottom: "16px" }}>
        <label style={styles.label}>Path: {zkpPath || "root"}</label>
        <textarea
          style={mergeStyles(styles.proofTextarea, {
            height: "60px",
            marginBottom: "8px",
            color: "#d8b4fe",
          })}
          disabled
          value={encodedPath ? `[${encodedPath.join(",")}]` : "[]"}
        />
        <button
          style={mergeStyles(styles.buttonSecondary, { marginBottom: "16px" })}
          onClick={e => onCopy(`[${encodedPath?.join(",") || ""}]`, e.target)}
        >
          Copy Path
        </button>
      </div>

      {/* Proof Section */}
      <label style={styles.label}>ZK Proof</label>
      <textarea
        style={styles.proofTextarea}
        disabled
        value={`[${proof.join(",")}]`}
      />
      <div style={styles.proofActions}>
        <button
          style={styles.buttonSecondary}
          onClick={e => onCopy(`[${proof.join(",")}]`, e.target)}
        >
          Copy Proof
        </button>
        <a
          href={utils.getEtherscanLink(fieldType)}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          Copy zkp to {qType} on Etherscan →
        </a>
        <button
          style={mergeStyles(styles.buttonSecondary, { marginLeft: "auto" })}
          onClick={() => onClear(id)}
        >
          Clear
        </button>
      </div>
    </>
  )
}

const ProofGenerator = ({
  id,
  metadata,
  zkpPath,
  onPathChange,
  onGenerate,
  generating,
}) => (
  <div>
    <label style={styles.label}>ZK Proof Path</label>
    <div style={styles.proofContainer}>
      <div style={styles.proofSelector}>
        <select
          value={zkpPath || ""}
          onChange={e => onPathChange(id, e.target.value)}
          style={styles.select}
        >
          <option value="">Select a path...</option>
          {utils.getJsonPaths(metadata).map((path, index) => (
            <option key={index} value={path}>
              {path}
            </option>
          ))}
        </select>
      </div>
      <button
        style={mergeStyles(
          styles.button,
          styles.proofButton,
          conditionalStyle(
            generating || !zkpPath?.trim(),
            styles.buttonDisabled,
          ),
        )}
        disabled={generating || !zkpPath?.trim()}
        onClick={onGenerate}
      >
        {generating ? "Generating..." : "Generate ZK Proof"}
      </button>
    </div>
  </div>
)

const NFTCard = ({
  nft,
  showOwner,
  proof,
  encodedPath,
  zkpPath,
  onZkpPathChange,
  onGenerateProof,
  onCopy,
  onClearProof,
  generatingProof,
  loading,
}) => {
  const id = nft.tokenId || nft.id
  const metadata = nft.metadata || nft.data?.json
  const cid = nft.cid || nft.data?.cid

  return (
    <article style={styles.card}>
      {nft.tokenId !== undefined && (
        <NFTHeader
          tokenId={nft.tokenId}
          owner={nft.owner}
          showOwner={showOwner}
        />
      )}

      <NFTMetadata metadata={metadata} loading={loading} />

      {cid && <CIDDisplay cid={cid} onCopy={onCopy} />}

      {metadata && Object.keys(metadata).length > 0 && (
        <div style={styles.proofSection}>
          {proof ? (
            <ProofDisplay
              proof={proof}
              zkpPath={zkpPath}
              encodedPath={encodedPath}
              onCopy={onCopy}
              onClear={onClearProof}
              id={id}
              metadata={metadata}
            />
          ) : (
            <ProofGenerator
              id={id}
              metadata={metadata}
              zkpPath={zkpPath}
              onPathChange={onZkpPathChange}
              onGenerate={() => onGenerateProof(nft)}
              generating={generatingProof}
            />
          )}
        </div>
      )}
    </article>
  )
}

const NFTCollection = ({ account, nftCount, loading, onRefresh }) => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>zkNFT Collection</h2>
    <p style={styles.cardSubtitle}>
      {account ? `Your NFTs (${nftCount})` : "Latest NFTs from all users"}
    </p>
    <button
      style={mergeStyles(
        styles.button,
        styles.buttonFull,
        conditionalStyle(loading, styles.buttonDisabled),
      )}
      onClick={onRefresh}
      disabled={loading}
    >
      {loading ? "Loading..." : "Refresh NFTs"}
    </button>
  </div>
)

const NFTList = ({
  nfts,
  showOwner,
  proofs,
  encodedPaths,
  zkpPaths,
  generatingProof,
  onZkpPathChange,
  onGenerateProof,
  onCopy,
  onClearProof,
  loading,
}) => (
  <>
    {loading && nfts.length === 0 ? (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingSpinner}></span>
        <span style={{ marginLeft: "12px" }}>Loading NFTs...</span>
      </div>
    ) : (
      <>
        {nfts.map(nft => {
          const id = nft.tokenId || nft.id
          return (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              showOwner={showOwner}
              proof={proofs[id]}
              encodedPath={encodedPaths[id]}
              zkpPath={zkpPaths[id]}
              generatingProof={generatingProof[id]}
              onZkpPathChange={onZkpPathChange}
              onGenerateProof={onGenerateProof}
              onCopy={onCopy}
              onClearProof={onClearProof}
              loading={loading}
            />
          )
        })}
        {nfts.length === 0 && !loading && (
          <div style={styles.emptyState}>
            No NFTs found. Be the first to mint one!
          </div>
        )}
      </>
    )}
  </>
)

// ============= Upload Components =============
const FieldInput = ({ field, errors, onUpdate }) => {
  const { type, value } = field

  if (type === "boolean") {
    return (
      <select
        value={utils.getFieldValue(field)}
        onChange={e => onUpdate(field.id, "value", e.target.value)}
        style={styles.select}
      >
        <option value="">Select...</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  if (type === "array" || type === "object") {
    return (
      <textarea
        value={value}
        onChange={e => onUpdate(field.id, "value", e.target.value)}
        placeholder={utils.getFieldPlaceholder(type)}
        rows={3}
        style={mergeStyles(
          styles.textarea,
          conditionalStyle(errors[field.id], styles.inputError),
        )}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onUpdate(field.id, "value", e.target.value)}
      placeholder={utils.getFieldPlaceholder(type)}
      style={mergeStyles(
        styles.input,
        conditionalStyle(errors[field.id], styles.inputError),
      )}
    />
  )
}

const FieldBuilder = ({ field, errors, onUpdate, onRemove }) => (
  <div style={styles.fieldItem}>
    <button style={styles.removeButton} onClick={() => onRemove(field.id)}>
      ×
    </button>
    <div style={styles.fieldGrid}>
      <div>
        <label style={styles.label}>Field Name</label>
        <input
          type="text"
          value={field.name}
          onChange={e => onUpdate(field.id, "name", e.target.value)}
          placeholder="e.g., name"
          style={mergeStyles(
            styles.input,
            conditionalStyle(errors[field.id], styles.inputError),
          )}
        />
      </div>
      <div>
        <label style={styles.label}>Type</label>
        <select
          value={field.type}
          onChange={e => onUpdate(field.id, "type", e.target.value)}
          style={styles.select}
        >
          {utils.FIELD_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div>
      <label style={styles.label}>Value</label>
      <FieldInput field={field} errors={errors} onUpdate={onUpdate} />
      {errors[field.id] && (
        <div style={styles.errorText}>{errors[field.id]}</div>
      )}
    </div>
  </div>
)

const JSONPreview = ({ fields }) => {
  const json = utils.generateJSON(fields)
  const size = JSON.stringify(json).length
  const isOverLimit = size > 650

  return (
    <div style={styles.jsonPreview}>
      <div style={styles.jsonPreviewHeader}>
        <span style={styles.label}>JSON Preview</span>
        <span
          style={mergeStyles(styles.label, {
            color: isOverLimit ? "#ef4444" : "#cbd5e1",
          })}
        >
          {size}/650 chars
        </span>
      </div>
      <pre style={styles.jsonPreviewContent}>
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  )
}

const UploadForm = ({
  fields,
  errors,
  onAddField,
  onUpdateField,
  onRemoveField,
  onSubmit,
}) => (
  <div style={styles.card}>
    <div style={mergeStyles(styles.nftHeader, { marginBottom: "20px" })}>
      <h2 style={styles.cardTitle}>Build JSON Data</h2>
      <button style={styles.button} onClick={onAddField}>
        + Add Field
      </button>
    </div>

    {fields.length === 0 ? (
      <div style={styles.emptyState}>
        Click "Add Field" to start building your JSON
      </div>
    ) : (
      <>
        {fields.map(field => (
          <FieldBuilder
            key={field.id}
            field={field}
            errors={errors}
            onUpdate={onUpdateField}
            onRemove={onRemoveField}
          />
        ))}
        <JSONPreview fields={fields} />
      </>
    )}

    {fields.length > 0 && (
      <button
        style={mergeStyles(
          styles.button,
          styles.buttonFull,
          { marginTop: "16px" },
          conditionalStyle(fields.length === 0, styles.buttonDisabled),
        )}
        disabled={fields.length === 0}
        onClick={onSubmit}
      >
        Upload to WeaveDB
      </button>
    )}
  </div>
)

const TransactionLink = ({ slot }) => (
  <div style={styles.transactionLink}>
    <a
      href={utils.getTransactionLink(slot)}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.link}
    >
      View Transaction →
    </a>
  </div>
)

// ============= Search Components =============
const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  searching,
  hasResults,
}) => (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>Search by CID</h2>
    <div style={styles.searchContainer}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyPress={e => e.key === "Enter" && onSearch()}
        placeholder="Enter CID (e.g., Qm...)"
        style={mergeStyles(styles.input, styles.searchInput)}
      />
      <button
        style={mergeStyles(
          styles.button,
          conditionalStyle(!value.trim() || searching, styles.buttonDisabled),
        )}
        onClick={onSearch}
        disabled={!value.trim() || searching}
      >
        {searching ? "Searching..." : "Search"}
      </button>
      {hasResults && (
        <button style={styles.buttonSecondary} onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  </div>
)

// ============= About Components =============
const ArchitectureDiagram = () => (
  <svg
    viewBox="0 0 1100 300"
    style={styles.diagramContainer}
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;900&display=swap');
          .diagram-text {
            font-family: 'Roboto', sans-serif;
          }
        `}
      </style>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
      </linearGradient>

      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
      </linearGradient>

      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
      </filter>

      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background for better contrast - with equal padding */}
    <rect
      x="20"
      y="20"
      width="1060"
      height="270"
      fill="rgba(0,0,0,0.2)"
      rx="20"
    />

    {/* JSON Input */}
    <g transform="translate(150, 150)">
      <circle r="60" fill="white" filter="url(#shadow)" />
      <circle r="55" fill="#faf5ff" stroke="#a855f7" strokeWidth="3" />
      <text
        y="-7"
        textAnchor="middle"
        fill="#7c3aed"
        fontSize="20"
        fontWeight="700"
        className="diagram-text"
      >
        JSON
      </text>
      <text
        y="20"
        textAnchor="middle"
        fill="#9333ea"
        fontSize="13"
        className="diagram-text"
      >
        Metadata
      </text>
    </g>

    {/* zkIPFS Node */}
    <g transform="translate(550, 150)">
      <rect
        x="-150"
        y="-75"
        width="300"
        height="150"
        rx="25"
        fill="url(#purpleGrad)"
        filter="url(#shadow)"
      />

      <text
        y="-40"
        textAnchor="middle"
        fill="white"
        fontSize="22"
        fontWeight="700"
        className="diagram-text"
      >
        Permanent zkIPFS Node
      </text>

      <text
        y="-12"
        textAnchor="middle"
        fill="rgba(255,255,255,0.95)"
        fontSize="15"
        className="diagram-text"
      >
        WeaveDB + Arweave
      </text>

      <text
        y="8"
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize="13"
        className="diagram-text"
      >
        Stores JSON permanently
      </text>

      {/* CID Generation Box */}
      <rect
        x="-110"
        y="25"
        width="220"
        height="30"
        rx="15"
        fill="white"
        opacity="0.95"
      />
      <text
        y="44"
        textAnchor="middle"
        fill="#7c3aed"
        fontSize="12"
        fontWeight="700"
        className="diagram-text"
      >
        Generates CID & ZKP: Qm...
      </text>
    </g>

    {/* Ethereum */}
    <g transform="translate(950, 150)">
      <rect
        x="-80"
        y="-65"
        width="160"
        height="130"
        rx="20"
        fill="#3b82f6"
        filter="url(#shadow)"
      />
      <text
        y="-35"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="700"
        className="diagram-text"
      >
        EVM / zkNFT
      </text>
      <text
        y="-12"
        textAnchor="middle"
        fill="rgba(255,255,255,0.95)"
        fontSize="15"
        className="diagram-text"
      >
        Smart Contract
      </text>

      {/* White box for emphasis */}
      <rect
        x="-65"
        y="3"
        width="130"
        height="30"
        rx="12"
        fill="white"
        opacity="0.95"
      />
      <text
        y="23"
        textAnchor="middle"
        fill="#1e40af"
        fontSize="13"
        fontWeight="700"
        className="diagram-text"
      >
        ipfs://Qm...
      </text>

      <text
        y="53"
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize="11"
        fontWeight="600"
        className="diagram-text"
      >
        Only Stores CID
      </text>
    </g>

    {/* Store Arrow */}
    <g>
      <line
        x1="215"
        y1="150"
        x2="395"
        y2="150"
        stroke="white"
        strokeWidth="4"
        opacity="0.3"
      />
      <line
        x1="215"
        y1="150"
        x2="395"
        y2="150"
        stroke="#a855f7"
        strokeWidth="3"
        strokeDasharray="8,4"
        opacity="0.8"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="12"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </line>
      <polygon points="400,150 390,145 390,155" fill="#a855f7" />

      <rect
        x="250"
        y="110"
        width="100"
        height="22"
        rx="10"
        fill="rgba(0,0,0,0.6)"
      />
      <text
        x="300"
        y="125"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="600"
        className="diagram-text"
      >
        store JSON
      </text>
    </g>

    {/* CID Arrow */}
    <g>
      <line
        x1="705"
        y1="150"
        x2="865"
        y2="150"
        stroke="white"
        strokeWidth="4"
        opacity="0.3"
      />
      <line
        x1="705"
        y1="150"
        x2="865"
        y2="150"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeDasharray="8,4"
        opacity="0.8"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="12"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </line>
      <polygon points="870,150 860,145 860,155" fill="#3b82f6" />

      <rect
        x="745"
        y="110"
        width="80"
        height="22"
        rx="10"
        fill="rgba(0,0,0,0.6)"
      />
      <text
        x="785"
        y="125"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="600"
        className="diagram-text"
      >
        only CID
      </text>
    </g>

    {/* ZK Query Flow - The Magic (moved down to prevent overlap) */}
    <g>
      <path
        d="M 865 200 Q 710 240, 550 210"
        stroke="white"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 865 200 Q 710 240, 550 210"
        stroke="url(#greenGrad)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="6,3"
        opacity="0.9"
        filter="url(#glow)"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="-9"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      <polygon points="545,210 555,206 555,214" fill="#10b981" />
      <rect
        x="675"
        y="235"
        width="220"
        height="22"
        rx="10"
        fill="rgba(0,0,0,0.6)"
      />
      <text
        x="785"
        y="250"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="600"
        className="diagram-text"
      >
        Query Metadata with zkCID
      </text>
    </g>
  </svg>
)

const AboutContent = () => {
  const [hoveredBox, setHoveredBox] = useState(null)

  return (
    <div style={styles.aboutContainer}>
      <div style={styles.aboutSection}>
        <h1 style={styles.aboutTitle}>ZK Provable CID with Permanent JSON</h1>
        <p style={styles.aboutSubtitle}>
          Store JSON permanently with CID on Arweave. Query with ZKP from
          anywhere.
        </p>

        <div style={styles.cidShowcase}>
          <code style={styles.cidCode}>
            ipfs://QmYvj8RwHXcu5pJ47wfT95nvX6JPWvG6oPe9Z7WLyRNJPR
          </code>
        </div>

        {/* Three Info Boxes */}
        <div style={styles.infoBoxContainer}>
          <div
            style={mergeStyles(
              styles.infoBox,
              hoveredBox === "zkCID" ? styles.infoBoxHover : {},
            )}
            onMouseEnter={() => setHoveredBox("zkCID")}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <h3 style={styles.infoBoxTitle}>🔗 zkCID</h3>
            <p style={styles.infoBoxDescription}>
              Extension of zkJSON to prove JSON content stored with CID. Anyone
              can generate proofs.
            </p>
          </div>

          <div
            style={mergeStyles(
              styles.infoBox,
              hoveredBox === "zkIPFS" ? styles.infoBoxHover : {},
            )}
            onMouseEnter={() => setHoveredBox("zkIPFS")}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <h3 style={styles.infoBoxTitle}>♾️ zkIPFS</h3>
            <p style={styles.infoBoxDescription}>
              Permanent IPFS node storing data on Arweave via WeaveDB with
              built-in ZK proof generator.
            </p>
          </div>

          <div
            style={mergeStyles(
              styles.infoBox,
              hoveredBox === "zkNFT" ? styles.infoBoxHover : {},
            )}
            onMouseEnter={() => setHoveredBox("zkNFT")}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <h3 style={styles.infoBoxTitle}>🎨 zkNFT</h3>
            <p style={styles.infoBoxDescription}>
              ERC721 NFT with zkCID as tokenURI (ipfs://...) allowing queries to
              offchain meatada.
            </p>
          </div>
        </div>

        <ArchitectureDiagram />
      </div>
    </div>
  )
}

// ============= Footer Component =============
const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.footerContent}>
      <div>
        This demo stores data only on WeaveDB Devnet on a HyperBEAM node, but
        not on Arweave (yet).
      </div>
      <div>
        Built by{" "}
        <a
          href="https://weavedb.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.footerLink}
          onMouseEnter={e => (e.target.style.opacity = "1")}
          onMouseLeave={e => (e.target.style.opacity = "0.9")}
        >
          WeaveDB
        </a>
      </div>
    </div>
  </footer>
)

// ============= Shared Components =============
const SimplePostCard = ({ post, onCopy, onMint, minting }) => (
  <article style={styles.card}>
    <div style={styles.metadata}>{JSON.stringify(post.data.json)}</div>
    <CIDDisplay cid={post.data.cid} onCopy={onCopy} />
    <button
      onClick={() => onMint(post.data.cid)}
      disabled={minting}
      style={mergeStyles(
        styles.button,
        styles.buttonFull,
        conditionalStyle(minting, styles.buttonDisabled),
      )}
    >
      {minting ? "Minting..." : "Mint as NFT"}
    </button>
  </article>
)

const PostList = ({ posts, onCopy, onMint, minting }) => (
  <>
    {posts.map(post => (
      <SimplePostCard
        key={post.id}
        post={post}
        onCopy={onCopy}
        onMint={onMint}
        minting={minting[post.data?.cid]}
      />
    ))}
  </>
)

// ============= Toast Components =============
const Toast = ({ toast, onRemove }) => (
  <div
    style={mergeStyles(
      styles.toast,
      toast.type === "success"
        ? styles.toastSuccess
        : toast.type === "error"
          ? styles.toastError
          : styles.toastInfo,
    )}
  >
    <span style={styles.toastMessage}>{toast.message}</span>
    <button onClick={() => onRemove(toast.id)} style={styles.toastClose}>
      ×
    </button>
  </div>
)

const ToastContainer = ({ toasts, onRemove }) => (
  <div style={styles.toastContainer}>
    {toasts.map(toast => (
      <Toast key={toast.id} toast={toast} onRemove={onRemove} />
    ))}
  </div>
)

// ============= Tab Content Components =============
const NFTTabContent = ({
  account,
  ownedNFTs,
  latestNFTs,
  loadingNFTs,
  loadingLatest,
  proofs,
  encodedPaths,
  zkpPaths,
  generatingProof,
  onFetchOwned,
  onFetchLatest,
  onZkpPathChange,
  onGenerateProof,
  onClearProof,
  onCopy,
}) => (
  <>
    <NFTCollection
      account={account}
      nftCount={account ? ownedNFTs.length : latestNFTs.length}
      loading={loadingNFTs || loadingLatest}
      onRefresh={account ? onFetchOwned : onFetchLatest}
    />

    <NFTList
      nfts={account ? ownedNFTs : latestNFTs}
      showOwner={!account}
      proofs={proofs}
      encodedPaths={encodedPaths}
      zkpPaths={zkpPaths}
      generatingProof={generatingProof}
      onZkpPathChange={onZkpPathChange}
      onGenerateProof={onGenerateProof}
      onCopy={onCopy}
      onClearProof={onClearProof}
      loading={account ? loadingNFTs : loadingLatest}
    />
  </>
)

const UploadTabContent = ({
  fields,
  errors,
  slot,
  posts,
  minting,
  onAddField,
  onUpdateField,
  onRemoveField,
  onSubmit,
  onCopy,
  onMint,
}) => (
  <>
    <UploadForm
      fields={fields}
      errors={errors}
      onAddField={onAddField}
      onUpdateField={onUpdateField}
      onRemoveField={onRemoveField}
      onSubmit={onSubmit}
    />

    {slot && <TransactionLink slot={slot} />}

    <PostList posts={posts} onCopy={onCopy} onMint={onMint} minting={minting} />
  </>
)

const SearchTabContent = ({
  searchCID,
  searching,
  searchResults,
  minting,
  onSearchChange,
  onSearch,
  onClear,
  onCopy,
  onMint,
}) => (
  <>
    <SearchBar
      value={searchCID}
      onChange={onSearchChange}
      onSearch={onSearch}
      onClear={onClear}
      searching={searching}
      hasResults={searchResults.length > 0}
    />

    <PostList
      posts={searchResults}
      onCopy={onCopy}
      onMint={onMint}
      minting={minting}
    />
  </>
)

// ============= Main App Component =============
export default function Home() {
  // State
  const [state, setState] = useState({
    posts: [],
    slot: null,
    fields: [],
    proofs: {},
    encodedPaths: {},
    generatingProof: {},
    errors: {},
    zkpPaths: {},
    activeTab: "about",
    searchCID: "",
    searching: false,
    searchResults: [],
    minting: {},
    wallet: null,
    account: null,
    ownedNFTs: [],
    loadingNFTs: false,
    latestNFTs: [],
    loadingLatest: false,
    toasts: [],
  })

  const db = useRef()

  // Update state helper
  const updateState = useCallback(updates => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Toast helpers
  const showToast = useCallback(
    (message, type = "info") => {
      const toast = utils.createToast(message, type)
      updateState({ toasts: [...state.toasts, toast] })
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          toasts: prev.toasts.filter(t => t.id !== toast.id),
        }))
      }, 5000)
    },
    [state.toasts, updateState],
  )

  const removeToast = useCallback(
    id => {
      updateState({ toasts: state.toasts.filter(t => t.id !== id) })
    },
    [state.toasts, updateState],
  )

  const handleClearProof = id => {
    setState(prev => ({
      ...prev,
      proofs: Object.fromEntries(
        Object.entries(prev.proofs).filter(([key]) => key !== id.toString()),
      ),
      encodedPaths: Object.fromEntries(
        Object.entries(prev.encodedPaths).filter(
          ([key]) => key !== id.toString(),
        ),
      ),
      zkpPaths: Object.fromEntries(
        Object.entries(prev.zkpPaths).filter(([key]) => key !== id.toString()),
      ),
    }))
    showToast("Proof cleared", "info")
  }

  // Initialize
  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = globalStyles
    document.head.appendChild(styleSheet)

    const init = async () => {
      try {
        const database = await utils.initializeDB()
        db.current = database

        // Wait a moment to ensure DB is fully ready
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fetch posts first
        const posts = await utils.fetchPosts(database)
        updateState({ posts })

        // Then fetch NFTs with the properly initialized DB
        const nfts = await utils.fetchLatestNFTs(database)
        updateState({ latestNFTs: nfts })
      } catch (error) {
        console.error("Initialization error:", error)
        showToast("Failed to initialize", "error")
      }
    }

    init()

    const cleanup = utils.setupWalletListeners(
      async accounts => {
        if (accounts.length > 0) {
          const { ethers } = await import("ethers")
          const provider = new ethers.BrowserProvider(window.ethereum)
          updateState({ account: accounts[0], wallet: provider })
        } else {
          updateState({ account: null, wallet: null, ownedNFTs: [] })
        }
      },
      () => window.location.reload(),
    )

    return () => {
      document.head.removeChild(styleSheet)
      cleanup()
    }
  }, [updateState])

  // Auto-fetch NFTs with retry for metadata
  useEffect(() => {
    let retryTimeout = null

    const fetchWithRetry = async () => {
      if (state.account && state.wallet) {
        await handleFetchOwnedNFTs()

        // If any NFTs are missing metadata, retry after a delay
        if (state.ownedNFTs.some(nft => !nft.metadata && nft.cid)) {
          retryTimeout = setTimeout(() => {
            handleFetchOwnedNFTs()
          }, 3000)
        }
      } else if (!state.loadingLatest) {
        await handleFetchLatestNFTs()

        // If any NFTs are missing metadata, retry after a delay
        if (state.latestNFTs.some(nft => !nft.metadata && nft.cid)) {
          retryTimeout = setTimeout(() => {
            handleFetchLatestNFTs()
          }, 3000)
        }
      }
    }

    fetchWithRetry()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [state.account, state.wallet])

  // Handlers
  const handleConnectWallet = async () => {
    try {
      const { account, provider } = await utils.connectWallet()
      updateState({ account, wallet: provider })
      showToast("Wallet connected successfully", "success")
    } catch (error) {
      showToast(error.message || "Failed to connect wallet", "error")
    }
  }

  const handleDisconnectWallet = () => {
    updateState({ account: null, wallet: null, ownedNFTs: [] })
    showToast("Wallet disconnected", "info")
  }

  const handleFetchLatestNFTs = async () => {
    updateState({ loadingLatest: true })
    try {
      const nfts = await utils.fetchLatestNFTs(db.current)
      updateState({ latestNFTs: nfts })
    } catch (error) {
      showToast("Failed to fetch NFTs", "error")
    } finally {
      updateState({ loadingLatest: false })
    }
  }

  const handleFetchOwnedNFTs = async () => {
    updateState({ loadingNFTs: true })
    try {
      const nfts = await utils.fetchOwnedNFTs(
        state.account,
        state.wallet,
        db.current,
      )
      updateState({ ownedNFTs: nfts })
    } catch (error) {
      showToast("Failed to fetch your NFTs", "error")
    } finally {
      updateState({ loadingNFTs: false })
    }
  }

  const handleMint = async cid => {
    try {
      updateState({ minting: { ...state.minting, [cid]: true } })
      showToast("Preparing transaction...", "info")

      await utils.handleMintProcess(
        cid,
        state.account,
        state.wallet,
        (newAccount, newWallet) =>
          updateState({ account: newAccount, wallet: newWallet }),
      )

      showToast("NFT minted successfully!", "success")

      if (state.activeTab === "nft") {
        state.account ? handleFetchOwnedNFTs() : handleFetchLatestNFTs()
      }
    } catch (error) {
      showToast(utils.getErrorMessage(error), "error")
    } finally {
      updateState({ minting: { ...state.minting, [cid]: false } })
    }
  }

  const handleSearch = async () => {
    if (!state.searchCID.trim()) return

    updateState({ searching: true })
    try {
      const results = await utils.searchByCID(db.current, state.searchCID)
      updateState({ searchResults: results })
      if (results.length === 0) showToast("No data found for this CID", "info")
    } catch (error) {
      showToast("Search failed", "error")
    } finally {
      updateState({ searching: false })
    }
  }

  const handleSubmit = async () => {
    try {
      const result = await utils.handleFormSubmission(state.fields, db.current)

      if (!result.success) {
        if (result.message) showToast(result.message, "error")
        if (result.errors) updateState({ errors: result.errors })
        return
      }

      // Get the CID from the upload result
      const cid = result.newCID

      // Manually search for this CID to get the search results
      const searchResults = cid ? await utils.searchByCID(db.current, cid) : []

      // Update everything including the search box value and results
      updateState({
        slot: result.slot,
        fields: [],
        errors: {},
        posts: result.posts,
        searchCID: cid || "", // This updates the search box
        searchResults: searchResults, // This shows the results
        activeTab: "search",
      })

      showToast("Uploaded to WeaveDB successfully!", "success")
    } catch (error) {
      console.error("Submit error:", error)
      showToast("Failed to submit", "error")
    }
  }

  const handleGenerateProof = async nft => {
    const id = nft.tokenId || nft.id
    const path = state.zkpPaths[id]

    updateState({ generatingProof: { ...state.generatingProof, [id]: true } })

    try {
      const result = await utils.handleProofGeneration(nft, path)
      updateState({
        proofs: { ...state.proofs, [result.id]: result.proof },
        encodedPaths: { ...state.encodedPaths, [result.id]: result.path },
        zkpPaths: { ...state.zkpPaths, [result.id]: path }, // Preserve the path
      })
      showToast("ZK Proof generated successfully!", "success")
    } catch (error) {
      const errorMessage = error.message || "Failed to generate ZK proof"

      if (errorMessage.includes("not finalized")) {
        showToast(
          "Transaction not finalized. Please wait 30-60 seconds and try again.",
          "info",
        )
      } else if (errorMessage.includes("No CID")) {
        showToast("No CID available for this item", "error")
      } else {
        showToast(`Failed to generate ZK proof: ${errorMessage}`, "error")
      }

      console.error("Proof generation error:", error)
    } finally {
      updateState({
        generatingProof: { ...state.generatingProof, [id]: false },
      })
    }
  }

  const handleCopy = async (text, buttonElement) => {
    const success = await utils.copyToClipboard(text)
    if (success) {
      const originalText = buttonElement.textContent
      buttonElement.textContent = "Copied!"
      setTimeout(() => {
        buttonElement.textContent = originalText
      }, 2000)
    } else {
      prompt("Copy this text:", text)
    }
  }

  // Field management
  const addField = () =>
    updateState({ fields: [...state.fields, utils.createField()] })

  const updateField = (id, property, value) => {
    updateState({
      fields: utils.updateFieldProperty(state.fields, id, property, value),
      errors: { ...state.errors, [id]: "" },
    })
  }

  const removeField = id => {
    const newErrors = { ...state.errors }
    delete newErrors[id]
    updateState({
      fields: utils.removeFieldById(state.fields, id),
      errors: newErrors,
    })
  }

  // Render
  return (
    <div style={styles.container}>
      <Header
        account={state.account}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />

      <TabNavigation
        activeTab={state.activeTab}
        onTabChange={tab => updateState({ activeTab: tab })}
      />

      {state.activeTab === "about" && <AboutContent />}

      {state.activeTab === "nft" && (
        <NFTTabContent
          account={state.account}
          ownedNFTs={state.ownedNFTs}
          latestNFTs={state.latestNFTs}
          loadingNFTs={state.loadingNFTs}
          loadingLatest={state.loadingLatest}
          proofs={state.proofs}
          encodedPaths={state.encodedPaths}
          zkpPaths={state.zkpPaths}
          generatingProof={state.generatingProof}
          onFetchOwned={handleFetchOwnedNFTs}
          onFetchLatest={handleFetchLatestNFTs}
          onZkpPathChange={(id, path) =>
            updateState({ zkpPaths: { ...state.zkpPaths, [id]: path } })
          }
          onGenerateProof={handleGenerateProof}
          onClearProof={handleClearProof}
          onCopy={handleCopy}
        />
      )}

      {state.activeTab === "upload" && (
        <UploadTabContent
          fields={state.fields}
          errors={state.errors}
          slot={state.slot}
          posts={state.posts}
          minting={state.minting}
          onAddField={addField}
          onUpdateField={updateField}
          onRemoveField={removeField}
          onSubmit={handleSubmit}
          onCopy={handleCopy}
          onMint={handleMint}
        />
      )}

      {state.activeTab === "search" && (
        <SearchTabContent
          searchCID={state.searchCID}
          searching={state.searching}
          searchResults={state.searchResults}
          minting={state.minting}
          onSearchChange={value => {
            console.log("Search value changing to:", value)
            updateState({ searchCID: value })
          }}
          onSearch={handleSearch}
          onClear={() => {
            console.log("Clearing search")
            updateState({ searchCID: "", searchResults: [] })
          }}
          onCopy={handleCopy}
          onMint={handleMint}
        />
      )}

      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
      <Footer />
    </div>
  )
}
