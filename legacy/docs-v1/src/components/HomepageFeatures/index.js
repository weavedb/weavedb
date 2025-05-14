import React from "react"
import clsx from "clsx"
import styles from "./styles.module.css"
import { Image, Box, Flex, Input } from "@chakra-ui/react"

const FeatureList = [
  {
    title: "Web3 Dapps with Web2 UX",
    Svg: require("@site/static/img/undraw_ux.svg").default,
    description: (
      <>
        Smart contract transactions are auto-signed, free and instant for dapp
        users, which enables web2 like smooth UX for fully decentralized web3
        dapps.
      </>
    ),
  },
  {
    title: "Crypto Authentication",
    Svg: require("@site/static/img/undraw_crypto.svg").default,
    description: (
      <>
        WeaveDB is permissionless with granular access controls with pure
        cryptography. Anyone can access with a one-time Metamask signature.
      </>
    ),
  },
  {
    title: "Powerful Logics for Complex Dapps",
    Svg: require("@site/static/img/undraw_logics.svg").default,
    description: (
      <>
        WeaveDB allows JSON-based functional programming on data, which opens up
        possibilities for building highly complex dapps with ease.
      </>
    ),
  },
]

function Feature({ Svg, title, description }) {
  return (
    <Box className={clsx("col col--4")} my={6}>
      <div className="text--center padding-horiz--md">
        <Flex justify="center" className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </Flex>
        <Box
          fontSize="20px"
          my={3}
          sx={{ fontFamily: "'Righteous', cursive", fontWeight: "normal" }}
        >
          {title}
        </Box>
        <Box lineHeight="180%">{description}</Box>
      </div>
    </Box>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
