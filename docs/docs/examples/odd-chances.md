---
sidebar_position: 7
---
# Odd Chances Game

This is a tutorial on how to create the Odd Chances game with WeaveDB and [Next.js](https://nextjs.org/).

It is simply a game of chance. A user guesses whether the number produced by the block timestamp is odd or even. Players are limited to 1 guess per block.

## Deploy WeaveDB contract

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
node scripts/generate-wallet.js mainnet
yarn deploy
```
A new wallet is stored at `/scripts/.wallets/wallet-mainnet.json`

`yarn deploy` returns `contractTxId` and `srcTxId`

## Configure DB Instance

We will only use one collection `game_results`

We will show you a single command script to set up everything in the end, but these are what needs to be set up.

### Set up Data Schema

```js
const schema_game_results = {
  type: "object",
  required: ["is_even", "user_address", "date", "last_guess_date", "has_won"],
  properties: {
    is_even: {
      type: "boolean",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
    last_guess_date: {
      type: "number",
    },
    has_won: {
      type: "boolean",
    },
  },
};
await db.setSchema(schema_game_results, "game_results")
```

- `game_results` collection must have 5 fields (`is_even`, `user_address`, `date`, `last_guess_date`, `has_won`).

### Set up Access Control Rules

```js
const rules_game_results = {
  "let create": {
    "resource.newData.has_won": [
      "equals",
      ["equals", ["modulo", { var: "resource.newData.date" }, 2], 0],
      { var: "resource.newData.is_even" },
    ],
  },

  "allow create": {
    and: [
      {
        "!=": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.last_guess_date" },
        ],
      },
      {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
      {
        "==": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.date" },
        ],
      },
    ],
  },
};
await db.setRules(schema_game_results, "game_results")
```
- `let create` forces the field `has_won` to store the result of the defined JsonLogic every time a document is created to the `game_results` collection.
- The FPJSON code in `let create` checks if the `date`(block timestamp) is an even number, returning a boolean value that is compared to the player's guess stored in the `is_even` boolean field.
- `has_won` field will be set to `true` if both comparison are equals, else set to `false`.
- `allow create` defines the rules when a document is created to the `game_results` collection.
- `last_guess_date` must not be the same as the `block.timestamp`
- `user_address` must be `signer` of the transaction.
- `date` must be the `block.timestamp`

### Set up Everything with Script

Run the following script to set up the schema and the rules with a single command.

Replace `CONTRACT_TX_ID` with the `contractTxId` returned when deploying the WeaveDB contract.

```bash
node scripts/oddchances-setup.js mainnet CONTRACT_TX_ID
```

Now the database setup is all done!

## NextJS Frontend Dapp

We are going to build the front end dapp using [NextJS](https://nextjs.org/)

### Create NextJS Project

Set up a NextJS project with the app name `odd-chances`.

```bash
yarn create next-app odd-chances
cd odd-chances
yarn dev
```
Now your dapp should be running at [localhost:3000](http://localhost:3000).

To keep things simple, we'll put everything in one file at `/page/index.js`

### Install Dependencies

Open a new terminal and move to the project root directry.
```bash
cd odd-chances
yarn add ramda localforage weavedb-sdk buffer ethers chart.js react-toastify @chakra-ui/react @emotion/react @emotion/styled framer-motion @chakra-ui/icons
```

We use these minimum dependencies.

- [WeaveDB SDK](https://weavedb.dev) - to connect with WeaveDB
- [Buffer](https://github.com/feross/buffer) - a dependency for WeaveDB
- [Ramda.js](https://ramdajs.com) - functional programming utilities
- [Chakra UI](https://chakra-ui.com) - UI library
- [Ethers.js](https://docs.ethers.io) - to connect with Metamask
- [localForage](https://localforage.github.io/localForage/) - IndexedDB wrapper to store a disposal wallet
- [Chart.js](https://www.chartjs.org) - JavaScript charting library

### Import Dependencies

Open `/page/index.js` and replace everything.

```js
import {  Box,  ChakraProvider,  Flex,  Text,  useColorMode,  Stat,  StatLabel,  StatNumber,} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { isNil, map } from "ramda";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import lf from "localforage";
import SDK from "weavedb-sdk";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chart } from "chart.js/auto";
import { Buffer } from "buffer";
```

### Define Variables

Replace `CONTRACT_TX_ID` with the `contractTxId` returned when deploying the WeaveDB contract.

```js
let db;
const contractTxId = "CONTRACT_TX_ID";
const COLLECTION_NAME = "game_results";
const LAST_GUESS_DATE_DEFAULT = 0;
```

- `db` - to assign the WeaveDB instance later
- `contractTxID` - WeaveDB contract tx id

### Define React States

```js
export default function Home() {
  const [user, setUser] = useState(null);
  const [initDB, setInitDB] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [totalCount, setTotalCount] = useState(-1);
  const [lastGuessDate, setLastGuessDate] = useState(LAST_GUESS_DATE_DEFAULT);
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  return (...)
}
```
- `user` - logged in user
- `initDB` - to determine if the WeaveDB instance is ready to use
- `winCount` - number of wins for the logged-in user
- `lossCount` - number of losses for the logged-in user
- `totalCount` - total number of guesses made by the logged in user
- `lastGuessDate` - date when the logged-in user last played
- `chart` - instance of Chart.js
- `chartRef` - reference to Chart.js

### Define Functions

#### setupWeaveDB

`Buffer` needs to be exposed to `window`.

```js
  const setupWeaveDB = async () => {
    window.Buffer = Buffer;
    db = new SDK({
      contractTxId,
    });
    await db.initializeWithoutWallet();
    setInitDB(true);
    console.log("<<setupWeaveDB()");
  };
```

#### checkUser

When the page is loaded, check if the user is logged in.

```js
  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`);
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      );
      if (!isNil(identity)) {
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        });
      }
    }
    console.log("<<checkUser()");
  };
```

#### login

We will generate a disposal account the first time a user logs in, link it with the Metamask address within WeaveDB, and save it locally in the browser's IndexedDB.

`{ wallet, privateKey }` is how we need to pass the user object to the SDK when making transactions, so we will save it like so.

```js
  const login = async () => {
    console.log(">>login()");
    const provider = new ethers.BrowserProvider(window.ethereum, "any");
    const signer = await provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    const wallet_address = await signer.getAddress();
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    );
    let tx;
    let err;
    if (isNil(identity)) {
      ({ tx, identity, err } = await db.createTempAddress(wallet_address));
      const linked = await db.getAddressLink(identity.address);
      if (isNil(linked)) {
        alert("something went wrong");
        return;
      }
    } else {
      await lf.setItem("temp_address:current", wallet_address);

      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
      return;
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx;
      identity.linked_address = wallet_address;
      await lf.setItem("temp_address:current", wallet_address);
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        identity
      );
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
    }
    console.log("<<login()");
  };
```

#### logout

We will simply remove the current logged in state. The disposal address will be reused the next time the user logs in.

```js
  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current");
      setUser(null, "temp_current");
    }
    console.log("<<logout()");
  };
```

#### addGuess

```js
  const onClickOdd = async () => {
    addGuess(false);
  };

  const onClickEven = async () => {
    addGuess(true);
  };

  const addGuess = async (isEven) => {
    console.log("addGuess() : isEven", isEven);
    console.log("addGuess() : lastGuessDate", lastGuessDate);

    try {
      const result = await db.add(
        {
          is_even: isEven,
          date: db.ts(),
          user_address: db.signer(),
          last_guess_date: lastGuessDate,
        },
        COLLECTION_NAME,
        user
      );

      if (result.success === false) {
        console.log(result);
        toast(result.error.dryWrite.errorMessage);
      } else {
        const str = result?.doc?.is_even ? "EVEN" : "ODD";
        result.doc.has_won
          ? toast("You won! Your guess is " + str + "=" + result.doc.date)
          : toast("You lost! Your guess is " + str + "=" + result.doc.date);

        getMyGameResults();
      }
    } catch (e) {
      toast(e.message);
      console.log(e);
    }
  };
```

#### getMyGameResults

```js
  const getMyGameResults = async () => {
    try {
      if (!isNil(user)) {
        const result = await db.cget(
          COLLECTION_NAME,
          ["user_address", "=", user.wallet.toLowerCase()],
          ["date", "desc"]
        );
        setLastGuessDate(result[0]?.data?.date ?? LAST_GUESS_DATE_DEFAULT);

        let winCount = 0;
        let lossCount = 0;
        map((v) => {
          v.data.has_won ? winCount++ : lossCount++;
        })(result);
        setWinCount(winCount);
        setLossCount(lossCount);
        setTotalCount(winCount + lossCount);
      }
    } catch (e) {
      toast(e.message);
      console.log(e);
    }
    console.log("<<getMyGameResults()");
    setupPieChart();
  };
```

#### setupPieChart

```js
  const chart_data = {
    labels: ["Win", "Loss"],
    datasets: [
      {
        data: [winCount, lossCount],
        backgroundColor: ["#0080ff", "#ff0080"],
      },
    ],
  };

  const chart_config = {
    type: "doughnut",
    data: chart_data,
  };

  const setupPieChart = async () => {
    if (!isNil(chart)) {
      chart.destroy();
    }
    const context = chartRef.current;
    const chartInstance = new Chart(context, chart_config);
    setChart(chartInstance);
    console.log("<<setupPieChart()");
  };
```

### Define React Components

#### NavBar

```jsx
  const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
      <Flex p={3} position="fixed" top={0} w="100%" bg="#7928ca" color="white">
        <Box flex={1} />
        <Box
          py={2}
          mx={8}
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
          onClick={() => toggleColorMode()}
        >
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Box>
        <Box
          bg="#ff0080"
          py={2}
          px={6}
          borderRadius="lg"
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
        >
          {!isNil(user) ? (
            <Box onClick={() => logout()}>{user.wallet.slice(0, 8)}</Box>
          ) : (
            <Box onClick={() => login()}>Connect Wallet</Box>
          )}
        </Box>
      </Flex>
    );
  };
```

#### AnswerButton

```jsx
  const AnswerButton = (props) => {
    const { btnText, btnClick } = props;

    return (
      <Box
        borderRadius="lg"
        p={4}
        background="linear-gradient(to bottom, #ff0080, #7928ca)"
        minW="200px"
        cursor="pointer"
        _hover={{ opacity: 0.75 }}
        onClick={btnClick}
      >
        <Text
          fontSize="5xl"
          fontWeight="bold"
          textAlign="center"
          color="white"
          fontFamily="monospace"
        >
          {btnText}
        </Text>
      </Box>
    );
  };

  const AnswerButtons = () => {
    return (
      <Flex justifyContent="space-between" my={8}>
        <AnswerButton btnText="ODD" btnClick={onClickOdd} />
        <AnswerButton btnText="EVEN" btnClick={onClickEven} />
      </Flex>
    );
  };
```

#### GameResultStats

```jsx
  const GameResultStats = () => {
    return (
      <>
        <Flex borderWidth="1px" borderRadius="lg" p={3} mb={8}>
          <Stat>
            <StatLabel>Win</StatLabel>
            <StatNumber>{winCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Loss</StatLabel>
            <StatNumber>{lossCount}</StatNumber>
          </Stat>
        </Flex>
      </>
    );
  };
```

#### Transactions

```jsx
  const Transactions = () => {
    return (
      <Flex justify="center" my={18}>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          textDecoration="underline"
        >
          view transactions
        </Box>
      </Flex>
    );
  };
```

### Define Reactive State Changes

```js
  useEffect(() => {
    checkUser();
    setupWeaveDB();
  }, []);

  useEffect(() => {
    console.log("useEffect() initDB", initDB);
    if (initDB) {
      if (!isNil(user)) getMyGameResults();
    }
  }, [initDB, totalCount, winCount, lossCount, user]);
```

- When the page is loaded, check if the user is logged in and set up WeaveDB.
- Get user game results, when a user is logged in.

### Return Components

```jsx
  return (
    <>
      <ToastContainer />
      <ChakraProvider>
        <NavBar />
        <Flex mt="60px" justify="center" p={3}>
          <Box w="100%" maxW="600px">
            <AnswerButtons />
            {!isNil(user) ? (
              <>
                <GameResultStats /> <canvas ref={chartRef} />
              </>
            ) : null}
          </Box>
        </Flex>
        <Transactions />
      </ChakraProvider>
    </>
  );
```

### The Complete Code

```js  title="/pages/index.js"
import {
  Box,
  ChakraProvider,
  Flex,
  Text,
  useColorMode,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { isNil, map } from "ramda";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import lf from "localforage";
import SDK from "weavedb-sdk";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chart } from "chart.js/auto";
import { Buffer } from "buffer";

let db;
const contractTxId = "lbOlx5cpz1xQA_8-FyIgFj6Nakjkdp6EoJBhE4Y-hnk";
const COLLECTION_NAME = "game_results";
const LAST_GUESS_DATE_DEFAULT = 0;

export default function Home() {
  const [user, setUser] = useState(null);
  const [initDB, setInitDB] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [totalCount, setTotalCount] = useState(-1);
  const [lastGuessDate, setLastGuessDate] = useState(LAST_GUESS_DATE_DEFAULT);
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);

  const setupWeaveDB = async () => {
    window.Buffer = Buffer;
    db = new SDK({
      contractTxId,
    });
    await db.initializeWithoutWallet();
    setInitDB(true);
    console.log("<<setupWeaveDB()");
  };

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`);
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      );
      if (!isNil(identity)) {
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        });
      }
    }
    console.log("<<checkUser()");
  };

  const login = async () => {
    console.log(">>login()");
    const provider = new ethers.BrowserProvider(window.ethereum, "any");
    const signer = await provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    const wallet_address = await signer.getAddress();
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    );
    let tx;
    let err;
    if (isNil(identity)) {
      ({ tx, identity, err } = await db.createTempAddress(wallet_address));
      const linked = await db.getAddressLink(identity.address);
      if (isNil(linked)) {
        alert("something went wrong");
        return;
      }
    } else {
      await lf.setItem("temp_address:current", wallet_address);

      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
      return;
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx;
      identity.linked_address = wallet_address;
      await lf.setItem("temp_address:current", wallet_address);
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        identity
      );
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
    }
    console.log("<<login()");
  };

  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current");
      setUser(null, "temp_current");
    }
    console.log("<<logout()");
  };

  const onClickOdd = async () => {
    addGuess(false);
  };

  const onClickEven = async () => {
    addGuess(true);
  };

  const addGuess = async (isEven) => {
    console.log("addGuess() : isEven", isEven);
    console.log("addGuess() : lastGuessDate", lastGuessDate);

    try {
      const result = await db.add(
        {
          is_even: isEven,
          date: db.ts(),
          user_address: db.signer(),
          last_guess_date: lastGuessDate,
        },
        COLLECTION_NAME,
        user
      );

      if (result.success === false) {
        console.log(result);
        toast(result.error.dryWrite.errorMessage);
      } else {
        const str = result?.doc?.is_even ? "EVEN" : "ODD";
        result.doc.has_won
          ? toast("You won! Your guess is " + str + "=" + result.doc.date)
          : toast("You lost! Your guess is " + str + "=" + result.doc.date);

        getMyGameResults();
      }
    } catch (e) {
      toast(e.message);
      console.log(e);
    }
  };

  const getMyGameResults = async () => {
    try {
      if (!isNil(user)) {
        const result = await db.cget(
          COLLECTION_NAME,
          ["user_address", "=", user.wallet.toLowerCase()],
          ["date", "desc"]
        );
        setLastGuessDate(result[0]?.data?.date ?? LAST_GUESS_DATE_DEFAULT);

        let winCount = 0;
        let lossCount = 0;
        map((v) => {
          v.data.has_won ? winCount++ : lossCount++;
        })(result);
        setWinCount(winCount);
        setLossCount(lossCount);
        setTotalCount(winCount + lossCount);
      }
    } catch (e) {
      toast(e.message);
      console.log(e);
    }
    console.log("<<getMyGameResults()");
    setupPieChart();
  };

  const chart_data = {
    labels: ["Win", "Loss"],
    datasets: [
      {
        data: [winCount, lossCount],
        backgroundColor: ["#0080ff", "#ff0080"],
      },
    ],
  };

  const chart_config = {
    type: "doughnut",
    data: chart_data,
  };

  const setupPieChart = async () => {
    if (!isNil(chart)) {
      chart.destroy();
    }
    const context = chartRef.current;
    const chartInstance = new Chart(context, chart_config);
    setChart(chartInstance);
    console.log("<<setupPieChart()");
  };

  const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
      <Flex p={3} position="fixed" top={0} w="100%" bg="#7928ca" color="white">
        <Box flex={1} />
        <Box
          py={2}
          mx={8}
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
          onClick={() => toggleColorMode()}
        >
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Box>
        <Box
          bg="#ff0080"
          py={2}
          px={6}
          borderRadius="lg"
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
        >
          {!isNil(user) ? (
            <Box onClick={() => logout()}>{user.wallet.slice(0, 8)}</Box>
          ) : (
            <Box onClick={() => login()}>Connect Wallet</Box>
          )}
        </Box>
      </Flex>
    );
  };

  const AnswerButton = (props) => {
    const { btnText, btnClick } = props;

    return (
      <Box
        borderRadius="lg"
        p={4}
        background="linear-gradient(to bottom, #ff0080, #7928ca)"
        minW="200px"
        cursor="pointer"
        _hover={{ opacity: 0.75 }}
        onClick={btnClick}
      >
        <Text
          fontSize="5xl"
          fontWeight="bold"
          textAlign="center"
          color="white"
          fontFamily="monospace"
        >
          {btnText}
        </Text>
      </Box>
    );
  };

  const AnswerButtons = () => {
    return (
      <Flex justifyContent="space-between" my={8}>
        <AnswerButton btnText="ODD" btnClick={onClickOdd} />
        <AnswerButton btnText="EVEN" btnClick={onClickEven} />
      </Flex>
    );
  };

  const GameResultStats = () => {
    return (
      <>
        <Flex borderWidth="1px" borderRadius="lg" p={3} mb={8}>
          <Stat>
            <StatLabel>Win</StatLabel>
            <StatNumber>{winCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Loss</StatLabel>
            <StatNumber>{lossCount}</StatNumber>
          </Stat>
        </Flex>
      </>
    );
  };

  const Transactions = () => {
    return (
      <Flex justify="center" my={18}>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          textDecoration="underline"
        >
          view transactions
        </Box>
      </Flex>
    );
  };

  useEffect(() => {
    checkUser();
    setupWeaveDB();
  }, []);

  useEffect(() => {
    console.log("useEffect() initDB", initDB);
    if (initDB) {
      if (!isNil(user)) getMyGameResults();
    }
  }, [initDB, totalCount, winCount, lossCount, user]);

  return (
    <>
      <ToastContainer />
      <ChakraProvider>
        <NavBar />
        <Flex mt="60px" justify="center" p={3}>
          <Box w="100%" maxW="600px">
            <AnswerButtons />
            {!isNil(user) ? (
              <>
                <GameResultStats /> <canvas ref={chartRef} />
              </>
            ) : null}
          </Box>
        </Flex>
        <Transactions />
      </ChakraProvider>
    </>
  );
}
```