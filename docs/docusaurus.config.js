// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "WeaveDB",
  tagline: "NoSQL Database as a Smart Contract on Arweave",
  url: "https://weavedb.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "weavedb", // Usually your GitHub org/user name.
  projectName: "weavedb", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: "twitter:image",
          content:
            "https://mirror-media.imgix.net/publication-images/oiiz3ON1zBm9UJbEbzgIs.jpeg",
        },
        {
          name: "og:image",
          content:
            "https://mirror-media.imgix.net/publication-images/oiiz3ON1zBm9UJbEbzgIs.jpeg",
        },
      ],
      navbar: {
        title: "WeaveDB",
        logo: {
          alt: "WeaveDB Logo",
          src: "img/favicon.ico",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Get Started",
          },
          {
            to: "/docs/category/example-dapps",
            label: "Demo Dapps",
            position: "left",
          },
          {
            href: "https://github.com/weavedb/weavedb",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://fpjson.weavedb.dev/",
            label: "FPJSON",
            position: "right",
          },
          {
            href: "https://weavedb.mirror.xyz/",
            label: "Blog",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Get Started",
                to: "/docs/intro",
              },
              {
                label: "Demo Dapps",
                to: "/docs/category/example-dapps",
              },
              {
                label: "Mirror Blog",
                to: "https://weavedb.mirror.xyz",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.com/invite/YMe3eqf69M",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/weave_db",
              },
              {
                label: "GitHub",
                href: "https://github.com/weavedb/weavedb",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "WeaveDB",
                href: "https://weavedb.dev",
              },
              {
                label: "FPJSON",
                href: "https://fpjson.weavedb.dev",
              },
            ],
          },
        ],
        copyright: "Powered by Arweave",
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: "93NNZMMTYN",
        apiKey: "12057167e7530f1503c0bb73da722e7b",
        indexName: "weavedb",
        contextualSearch: true,
        externalUrlRegex: "external\\.com|domain\\.com",
        replaceSearchResultPathname: {
          from: "/docs/",
          to: "/",
        },
        searchParameters: {},
        searchPagePath: "search",
      },
    }),
}

module.exports = config
