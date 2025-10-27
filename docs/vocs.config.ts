import { defineConfig } from "vocs"

export default defineConfig({
  iconUrl: "/favicon.svg",
  logoUrl: "/images/weavedb.png",
  title: "WeaveDB",
  topNav: [
    { text: "Litepaper", link: "/litepaper" },
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
      link: "/litepaper",
    },
    {
      text: "Technology",
      collapsed: false,
      items: [
	{
          text: "FPJSON",
          link: "/tech/fpjson",
        },
        {
          text: "zkJSON",
          link: "/tech/zkjson",
        },
        {
          text: "zkDB",
          link: "/tech/zkdb",
        },
        {
          text: "ARJSON",
          link: "/tech/arjson",
        },
        {
          text: "Monade",
          link: "/tech/monade",
        },
	{
          text: "AI3",
          link: "/tech/ai3",
        },
      ],
    },
    {
      text: "Tokenomics",
      collapsed: false,
      items: [
	{
          text: "Allocation",
          link: "/tokenomics/allocation",
        },
	{
          text: "Fair Launch",
          link: "/tokenomics/fair-launch",
        },
	{
          text: "DB Launch",
          link: "/tokenomics/db-launch",
        },
	{
          text: "Utilities",
          link: "/tokenomics/utilities",
        },
        {
          text: "Tokenomics Math",
          link: "/tokenomics/math",
        },
        {
          text: "Formal Verification",
          link: "/tokenomics/formal-verification",
        },
        {
          text: "Protocol Owned AI Agents",
          link: "/tokenomics/poaia",
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
          text: "Advanced Start",
          link: "/build/advanced-start",
        },
        {
          text: "DB Structure",
          link: "/build/structure",
        },
        {
          text: "Data Schemas",
          link: "/build/schemas",
        },
        {
          text: "Auth Rules",
          link: "/build/auth",
        },
        {
          text: "Indexes",
          link: "/build/indexes",
        },
        {
          text: "Triggers",
          link: "/build/triggers",
        },
        {
          text: "ZK Circuits",
          link: "/build/zk-circuits",
        },
      ],
    },
    {
      text: "Node Operator Guide",
      collapsed: false,
      items: [
	{
          text: "HyperBEAM",
          link: "/ops/hyperbeam",
        },
        {
          text: "DB Rollup",
          link: "/ops/rollup",
        },
	{
          text: "WeaveDB Scan",
          link: "/ops/scan",
        },
        {
          text: "Httpsig Bundler",
          link: "/ops/bundler",
        },
        {
          text: "Compute Unit",
          link: "/ops/cu",
        },
        {
          text: "Validator Node",
          link: "/ops/validator",
        },
        {
          text: "Scheduler Unit",
          link: "/ops/su",
        },
        {
          text: "ZK Proover",
          link: "/ops/zkp",
        },
        {
          text: "Remote Domains",
          link: "/ops/remote-servers",
        },
      ],
    },
    {
      text: "WDB Specs",
      collapsed: false,
      items: [
        {
          text: "WDB20 Fungible Token",
          link: "/specs/wdb20",
        },
        {
          text: "WDB23 Address",
          link: "/specs/wdb23",
        },
        {
          text: "WDB64 Timestamp",
          link: "/specs/wdb64",
        },
        {
          text: "WDB160 Hash",
          link: "/specs/wdb160",
        }
	
      ],
    },
    {
      text: "API Reference",
      collapsed: false,
      items: [
        {
          text: "wdb-sdk",
          link: "/api/wdb-sdk",
        },
        {
          text: "wdb-cli",
          link: "/api/wdb-cli",
        },
        {
          text: "wdb-core",
          link: "/api/wdb-core",
        },
	{
          text: "monade",
          link: "/api/monade",
        },
	{
          text: "fpjson-lang",
          link: "/api/fpjson-lang",
        },
	{
          text: "arjson",
          link: "/api/arjson",
        },
	{
          text: "zkjson",
          link: "/api/zkjson",
        }

      ],
    },
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
            name: "Forward Research",
            link: "https://fwd.g8way.io",
            image: "/images/forward-research.png",
          }
        ],
        [
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
          {
            name: "Hansa",
            link: "https://hansa.capital",
            image: "/images/hansa.svg",
          }
        ],
        [
          {
            name: "Next Web Capital",
            link: "https://nextweb.capital",
            image: "/images/next-web-capital.png",
          },
          {
            name: "CMT Digital",
            link: "https://cmt.digital/",
            image: "/images/cmtd.png",
          },
          {
            name: "Formless Capital",
            link: "https://formless.capital",
            image: "/images/formless-capital.webp",
          }
        ],
        [
          {
            name: "Scott Moore",
            link: "https://gitcoin.co",
            image: "/images/scott-moore.png",
          },
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
        ],
      ],
    },
  ],
})
