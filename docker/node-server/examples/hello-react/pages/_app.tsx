import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";

import { getDefaultProvider } from "ethers";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { fantom } from "wagmi/chains";

import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains([fantom], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "My wagmi + RainbowKit App",
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
