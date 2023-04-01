import { Box, Flex } from "@chakra-ui/react"
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
export default function Footer() {
  return (
    <Flex justify="center" width="100%" pb={4} pt={[2, null, 4]}>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
      >
        Contract Transactions
      </Box>
    </Flex>
  )
}
