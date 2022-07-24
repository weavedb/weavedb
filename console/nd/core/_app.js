import React, { Fragment } from "react"
import { RecoilRoot } from "recoil"
import Head from "next/head"
import "isomorphic-fetch"
import { conf } from "nd"

import {
  reduce,
  includes,
  concat,
  values,
  is,
  addIndex,
  __,
  compose,
  evolve,
  map,
  keys
} from "ramda"
const Icon = props => (
  <Head>
    <link
      key="shortcut-icon"
      rel="shortcut icon"
      href={`/static/favicon.ico`}
      type="image/x-icon"
    />
    <link
      key="icon"
      rel="icon"
      href={`/static/favicon.ico`}
      type="image/x-icon"
    />
    <link
      key="icon-192"
      rel="icon"
      sizes="192x192"
      href="/static/images/icon-192x192.png"
    />
    <link
      key="apple-touch-icon"
      rel="apple-touch-icon"
      href="/static/images/icon-192x192.png"
    />
  </Head>
)

const Base = props => {
  return (
    <Head>
      <meta key="charset" charset="utf-8" />
      <title>{props.html.title}</title>
      <meta
        key="description"
        name="description"
        content={props.html.description}
      />
      <link key="manifest" rel="manifest" href="/static/manifest.json" />
      <meta
        key="theme-color"
        name="theme-color"
        content={props.html["theme-color"]}
      />
    </Head>
  )
}

const Twitter = props => (
  <Head>
    <meta
      key="twitter:card"
      property="twitter:card"
      content="summary_large_image"
    />
    <meta
      key="twitter:title"
      property="twitter:title"
      content={props.html.title}
    />
    <meta
      key="twitter:description"
      property="twitter:description"
      content={props.html.description}
    />

    <meta
      key="twitter:image"
      property="twitter:image"
      content={props.html.image}
    />
  </Head>
)

const OG = props => (
  <Head>
    <meta key="og:title" property="og:title" content={props.html.title} />
    <meta
      key="og:description"
      property="og:description"
      content={props.html.description}
    />
    <meta key="og:image" property="og:image" content={props.html.image} />
  </Head>
)

export default ({ links = [], scripts = [], fonts = [], plugins }) => {
  const { css, js } = compose(
    evolve({
      js: map(v => {
        let obj = is(String)(v) ? { src: v } : v
        if (includes("integrity")(keys(obj))) obj.crossorigin = "anonymous"
        return obj
      }),
      css: map(v => {
        let obj = is(String)(v) ? { href: v } : v
        if (includes("integrity")(keys(obj))) obj.crossorigin = "anonymous"
        obj.rel = "stylesheet"
        obj.type = "text/css"
        return obj
      })
    }),
    reduce(
      (acc, v) => {
        return evolve(
          { js: concat(__, v.js || []), css: concat(__, v.css || []) },
          acc
        )
      },
      { js: [], css: [] }
    ),
    values
  )(plugins)

  const _links = concat(links, css)
  const _scripts = concat(scripts, js)

  const MyHead = () => {
    return (
      <Fragment>
        <Base {...conf} />
        <Icon {...conf} />
        <Twitter {...conf} />
        <OG {...conf} />
        <Head>
          <link
            key="fontawesome"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css"
            rel="stylesheet"
          />
          {addIndex(map)((v, i) => <link key={`css-${i}`} {...v} />)(_links)}
          {addIndex(map)((v, i) => (
            <link
              key={`font-${i}`}
              href={`https://fonts.googleapis.com/css?family=${v}`}
              rel="stylesheet"
              type="text/css"
            />
          ))(fonts || [])}
        </Head>
      </Fragment>
    )
  }

  const PostScripts = () => (
    <Fragment>
      <script src="https://www.gstatic.com/firebasejs/7.8.0/firebase.js" />
      {map(v => <script {...v} />)(_scripts)}
    </Fragment>
  )
  return ({ Component, pageProps }) => (
    <RecoilRoot>
      <MyHead />
      <Component {...pageProps} conf={conf} />
      <PostScripts />
    </RecoilRoot>
  )
}
