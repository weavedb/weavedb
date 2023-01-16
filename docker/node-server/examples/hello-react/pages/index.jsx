import Head from "next/head";

import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import config from "../weavedb.config.js";
import WeaveDB from "weavedb-client";

const db = new WeaveDB({
  contractTxId: config.contractTxId,
  rpc: "http://localhost:8080", // gRPC node URL
});

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [messages, setMessages] = useState({});

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("");
    setLoading(true);
    try {
      console.log("add messages");
      await db.add(
        { text: "text=" + message + ",date=" + new Date().toString() },
        "test_messages"
      );

      console.log("get messages");
      const _messagess = await db.get("test_messages", 10);
      console.log("set messages");
      setMessages(_messagess);
      setMessage("");
      setResult("ok");

      console.log("messages: ", messages);
    } catch (e) {
      console.log(e);
      setResult(e.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    console.log("useeffect");
    const test = async () => {
      console.log("useeffect test ");
      const _messagess = await db.get("test_messages", 10);
      setMessages(_messagess);
      console.log("messages: ", _messagess);
    };
    test();
  }, []);

  return (
    <>
      <Head>
        <title>Hello WeaveDB Light Client </title>
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <div>
            <br />
            <h2>Hello WeaveDB Light Client</h2>
            <br /> <ConnectButton />
            <br />
            {result}
            <br />
            <form noValidate onSubmit={onSubmit}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? <>posting...</> : <>post</>}
              </button>{" "}
            </form>
            <br />
            <ul>
              {Object.keys(messages).map((id, message) => {
                return (
                  <>
                    <li>
                      {id}: {messages[id].text}
                    </li>
                  </>
                );
              })}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
