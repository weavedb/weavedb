import Head from "next/head"
import Hero from "../components/Hero"
import Nav from "../components/Nav"
import Style from "../components/Style"
import TechStack from "../components/TechStack"
import CTA from "../components/CTA"
import Backers from "../components/Backers"
import Blog from "../components/Blog"
import Footer from "../components/Footer"
import Problem from "../components/Problem"
import Community from "../components/Community"
import Roadmap from "../components/Roadmap"
import Economics from "../components/Economics"
import UseCases from "../components/UseCases"

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WeaveDB | Layer-0 Database Protocol</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <Style />
      <Nav />
      <Hero />
      <Problem />
      <TechStack />
      <UseCases />
      <Backers />
      <Economics />
      <Roadmap />
      <Blog />
      <Community />
      <CTA />
      <Footer />
    </>
  )
}
