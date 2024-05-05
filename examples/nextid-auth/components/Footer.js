import { Box, Flex } from "@chakra-ui/react"
const contractTxId = process.env.NEXT_PUBLIC_CONTRACT_TX_ID
export default function Footer() {
  return (
    <Flex justify="center" width="100%" py={4}>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}?network=mainnet`}
      >
        Contract Transactions
      </Box>
    </Flex>
  )
}
