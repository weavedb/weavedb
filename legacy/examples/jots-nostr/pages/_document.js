import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  const title = "Jots Social"
  const description = "Decentralized Social Protocol"
  const image = "https://jots.weavedb.dev/images/cover.png"
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="72x72"
          href="/images/icon-72x72.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta key="description" name="description" content={description} />
        <meta
          key="twitter:card"
          property="twitter:card"
          content="summary_large_image"
        />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta
          key="twitter:description"
          property="twitter:description"
          content={description}
        />

        <meta key="twitter:image" property="twitter:image" content={image} />
        <meta key="og:title" property="og:title" content={title} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <meta key="og:image" property="og:image" content={image} />
        <link
          key="fontawesome"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
