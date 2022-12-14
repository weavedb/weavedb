import Head from "next/head"

export default function AppHead() {
  const title = "The Wall EXM"
  const description = "WeaveDB Demo Dapp on EXM"
  const image =
    "https://raw.githubusercontent.com/weavedb/weavedb/master/assets/the-wall-exm.png"
  return (
    <Head>
      <title>{title}</title>
      <meta key="description" name="description" content={description} />
      <link
        key="shortcut-icon"
        rel="shortcut icon"
        href={`/favicon.ico`}
        type="image/x-icon"
      />
      <link key="icon" rel="icon" href={`/favicon.ico`} type="image/x-icon" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap"
        rel="stylesheet"
      />
      <link
        key="fontawesome"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css"
        rel="stylesheet"
      />
    </Head>
  )
}
