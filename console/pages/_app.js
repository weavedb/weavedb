import { Roid } from "roidjs"
import "normalize.css"
function MyApp({ Component, pageProps }) {
  return (
    <Roid>
      <Component {...pageProps} />
    </Roid>
  )
}

export default MyApp
