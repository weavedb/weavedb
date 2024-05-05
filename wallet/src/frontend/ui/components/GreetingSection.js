import { useState } from "react"

// Dfinity
import { makeHelloActor } from "../service/actor-locator"

export const GreetingSection = () => {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState("")
  const [greetingMessage, setGreetingMessage] = useState("")

  function onChangeName(e) {
    const newName = e.target.value
    setName(newName)
  }

  async function sayGreeting() {
    setGreetingMessage("")
    setLoading("Loading...", name)
    const helloActor = makeHelloActor()
    const greeting = await helloActor.greet(name)
    setLoading("")
    setGreetingMessage(greeting)
  }

  return (
    <div>
      <section>
        <h2>Greeting</h2>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input
          id="name"
          alt="Name"
          type="text"
          value={name}
          onChange={onChangeName}
        />
        <button onClick={sayGreeting}>Send</button>
      </section>
      <section>
        <label>Response: &nbsp;</label>
        {loading}
        {greetingMessage}
      </section>
    </div>
  )
}
