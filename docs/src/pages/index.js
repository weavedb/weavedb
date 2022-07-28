import { ChakraProvider } from "@chakra-ui/react"
import React from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import HomepageFeatures from "@site/src/components/HomepageFeatures"
import { Image, Box, Flex, Input } from "@chakra-ui/react"
import styles from "./index.module.css"
import { range, map } from "ramda"
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Box
      className={clsx("hero hero--primary", styles.heroBanner)}
      sx={{
        backgroundImage:
          "linear-gradient(to left bottom, #f50057, #c1297d, #804084, #48426e, #303846)",
      }}
    >
      <Flex justify="center" w="100%">
        <Flex justify="center" w="100%" maxW="1060px" align="center">
          <Box className="container" mb={["15px", "25px", "45px"]}>
            <Box
              fontSize={["50px", "70px", "120px"]}
              mb={0}
              sx={{ fontFamily: "'Righteous', cursive", fontWeight: "normal" }}
            >
              {siteConfig.title}
            </Box>
            <Box mb="40px" fontSize={["12px", "16px", "25px"]}>
              {siteConfig.tagline}
            </Box>
            <div className={styles.buttons}>
              <Box mx={[2, 4, 6]}>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/intro"
                >
                  Get Started
                </Link>
              </Box>
              <Box mx={[2, 4, 6]}>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/category/example-dapps"
                >
                  Demo Dapps
                </Link>
              </Box>
            </div>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <ChakraProvider>
      <Layout
        title={`${siteConfig.title}`}
        description="Decentralized NoSQL Database on Arweave"
      >
        <HomepageHeader />
        <main>
          <HomepageFeatures />
        </main>
      </Layout>
    </ChakraProvider>
  )
}
