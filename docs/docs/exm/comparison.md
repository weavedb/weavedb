---
sidebar_position: 2
---
# Comparison with Warp

Some features require further research and are disabled on EXM.

| Features | EXM | Warp |
| ----------- | ----------- | ----------- |
| Linking Addresses | disabled | enabled |
| Cross-chain Authentication | only Arweave | EVM / Arweave / DFINITY / Intmax |
| Cron Jobs | disabled | enabled |
| Reading Other Contracts | not possible | possible |
| CL REPL | not implemented | implemented |
| Web Console | not implemented | implemented |
| gRPC Nodes | not implemented | implemented |
| Computation & Cache | cloud | client-side |
| Reading Outside Data | any source (deterministic) | only Arweave (unsafe) |

One big advantage of using EXM over Warp would be [deterministicFetch](https://docs.exm.dev/executor/apis/js-globals/exm-globals/deterministicfetch).

Warp can only do unsafe data fetch from Arweave, which might not always be deterministic.
