import { defineConfig } from "vocs"

export default defineConfig({
  iconUrl: "/favicon.svg",
  logoUrl: "/images/weavedb.png",
  title: "WeaveDB",
  topNav: [
    { text: "Litepaper", link: "/litepaper/overview" },
    { text: "Build", link: "/build/quick-start" },
    { text: "API", link: "/api/wdb-sdk" },
  ],
  socials: [
    {
      icon: "discord",
      link: "https://discord.com/invite/YMe3eqf69M",
    },
    {
      icon: "github",
      link: "https://github.com/weavedb/weavedb",
    },
    {
      icon: "x",
      link: "https://twitter.com/weave_db",
    },
  ],
  sidebar: [
    {
      text: "Litepaper",
      collapsed: false,
      items: [
        {
          text: "Overview",
          link: "/litepaper/overview",
        },
        {
          text: "Decentralized LSM Engine",
          link: "/litepaper/lsm-engine",
        },
        {
          text: "Modular Database",
          link: "/litepaper/modular-database",
        },
        {
          text: "Http Message Queries",
          link: "/litepaper/queries",
        },
        {
          text: "JSON Database",
          link: "/litepaper/json",
        },
        {
          text: "Zero Knowledge Provable DB",
          link: "/litepaper/zkdb",
        },
        {
          text: "HyperBEAM WAL",
          link: "/litepaper/wal",
        },
        {
          text: "ARJSON Compaction",
          link: "/litepaper/arjson",
        },
        {
          text: "$DB Tokenomics",
          link: "/litepaper/tokenomics",
        },
        {
          text: "WAO",
          link: "/litepaper/wao",
        },
        {
          text: "HyperAVS",
          link: "/litepaper/hyper-avs",
        },
        {
          text: "Appendices",
          link: "/litepaper/appendices",
        },
      ],
    },
    {
      text: "Developer Guide",
      collapsed: false,
      items: [
        {
          text: "Quick Start",
          link: "/build/quick-start",
        },
        {
          text: "Remote Servers",
          link: "/build/remote-servers",
        },
        /*{
          text: "WDB SDK",
          link: "/litepaper/wdb-sdk",
        },
        {
          text: "WeaveDB Scan",
          link: "/litepaper/weavedb-scan",
        },
        {
          text: "Web Console",
          link: "/litepaper/web-console",
        },
        {
          text: "Rollup Node",
          link: "/litepaper/rollup-node",
        },
        {
          text: "Validator Node",
          link: "/litepaper/validator-node",
        },
        {
          text: "ZK Proof Generator Node",
          link: "/litepaper/validator-node",
        },
        {
          text: "Staking Tokens",
          link: "/litepaper/staking-token",
        },
        {
          text: "FPJSON",
          link: "/litepaper/fpjson",
        },
        {
          text: "zkJSON / zkDB",
          link: "/litepaper/zkjson",
        },
        {
          text: "HyperBEAM / WAO",
          link: "/litepaper/wao",
        },*/
      ],
    },
    /*{
      text: "Tutorials",
      collapsed: true,
      items: [
        {
          text: "Building Decentralized X",
          link: "/tutorials/x-clone",
        },
        {
          text: "Building zkOracle",
          link: "/tutorials/zkoracle",
        },
        {
          text: "Building RAG for AI",
          link: "/tutorials/rag",
        },
      ],
    },
    {
      text: "API Reference",
      collapsed: true,
      items: [
        {
          text: "WDB SDK",
          link: "/api/wdb-sdk",
        },
        {
          text: "zkJSON",
          link: "/api/zkjson",
        },
        {
          text: "Uint Pack",
          link: "/api/uint-pack",
        },
        {
          text: "Monade",
          link: "/api/monade",
        },
        {
          text: "FPJSON",
          link: "/api/fpjson",
        },
        {
          text: "ARJSON",
          link: "/api/arjson",
        },
        {
          text: "WAO / HyperBEAM",
          link: "/api/wao",
        },
      ],
    },
    {
      text: "Recources",
      collapsed: true,
      items: [
        {
          text: "Community",
          link: "/recouces/community",
        },
      ],
    },*/
  ],
  sponsors: [
    {
      name: "Backers",
      height: 45,
      items: [
        [
          {
            name: "Permanent Ventures",
            link: "http://permanent.ventures",
            image: "/images/permanent-ventures.png",
          },
          {
            name: "IOSG",
            link: "https://iosg.vc",
            image: "/images/iosg.png",
          },
          {
            name: "Mask Network",
            link: "https://mask.io",
            image: "/images/mask.svg",
          },
        ],
        [
          {
            name: "Forward Research",
            link: "https://fwd.g8way.io",
            image: "/images/forward-research.png",
          },
          {
            name: "Hansa",
            link: "https://hansa.capital",
            image: "/images/hansa.svg",
          },
          {
            name: "Next Web Capital",
            link: "https://nextweb.capital",
            image: "/images/next-web-capital.png",
          },
        ],
        [
          {
            name: "CMT Digital",
            link: "https://cmt.digital/",
            image: "/images/cmtd.png",
          },
          {
            name: "Formless Capital",
            link: "https://formless.capital",
            image: "/images/formless-capital.webp",
          },
          {
            name: "Scott Moore",
            link: "https://gitcoin.co",
            image: "/images/scott-moore.png",
          },
        ],
        [
          {
            name: "Cogitent Ventures",
            link: "https://cogitent.ventures",
            image: "/images/cogitent.png",
          },
          {
            name: "Hub71",
            link: "https://hub71.com",
            image: "/images/hub71.svg",
          },
          {
            name: "YY Lai",
            link: "https://signum.capital",
            image: "/images/yy-lai.png",
          },
        ],
      ],
    },
  ],
})
