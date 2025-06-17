import { defineConfig } from 'vocs'

export default defineConfig({
  iconUrl: '/favicon.png',
  title: 'WeaveDB Litepaper',
  socials: [
    {
      icon: 'discord',
      link: 'https://discord.com/invite/YMe3eqf69M',
    },
    {
      icon: 'github',
      link: 'https://github.com/weavedb/weavedb',
    },
    {
      icon: 'x',
      link: 'https://twitter.com/weave_db',
    },
  ],
  sidebar: [
    {
      text: 'Abstract',
      link: '/abstract',
    },
    {
      text: 'Decentralized Log-Structured Engine',
      link: '/log-structured-storage',
    },
    {
      text: 'Modular Database',
      link: '/modular-database',
    },
    {
      text: 'Http Message Queries',
      link: '/queries',
    },
    {
      text: 'JSON Database',
      link: '/json',
    },
    {
      text: 'Zero Knowledge Provable DB',
      link: '/zkdb',
    },
    {
      text: 'HyperBEAM WAL',
      link: '/wal',
    },
    {
      text: 'ARJSON Compaction',
      link: '/arjson',
    },
    {
      text: '$DB Tokenomics',
      link: '/tokenomics',
    },
    {
      text: 'Appendices',
      link: '/appendices',
    }
  ],
})
