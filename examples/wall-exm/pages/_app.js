import "../styles/globals.css"
import { Roid } from "roidjs"
import { ChakraProvider } from "@chakra-ui/react"

function MyApp({ Component, pageProps }) {
  return (
    <Roid defaults={{ user_map: {}, posts: [] }}>
      <ChakraProvider>
        <style jsx global>{`
          html,
          #__next,
          body {
            height: 100%;
          }
        `}</style>

        <Component {...pageProps} />
      </ChakraProvider>
    </Roid>
  )
}

export default MyApp
