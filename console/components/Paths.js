import { Box, Flex } from "@chakra-ui/react"
import { per_page } from "../lib/const"
import { addIndex, map, isNil, take, last } from "ramda"
import {
  read,
  setDocuments,
  setLoadMore,
  setDocdata,
  setSubCollections,
} from "../lib/weavedb"
import { inject } from "roidjs"
export default inject(
  [],
  ({
    contractTxId,
    _addIndex,
    setDocPath,
    setCollections,
    doc_path,
    db,
    fn,
  }) => (
    <Flex mb={3} align="center" fontSize="14px">
      WeaveDB ({isNil(contractTxId) ? "-" : contractTxId.slice(0, 7)})
      {addIndex(map)((v, i) => (
        <>
          <Box mx={2} as="i" className="fas fa-angle-right" />
          <Box
            onClick={async () => {
              const dpath = doc_path.slice(0, i + 1)
              if (i !== doc_path.length - 1) {
                setDocPath(take(i + 1, dpath))
                setCollections(
                  await fn(read)({
                    db,
                    m: "listCollections",
                    q: [
                      ...(dpath.length % 2 === 0
                        ? dpath.slice(0, -2)
                        : dpath.slice(0, -1)),
                      true,
                    ],
                  })
                )
                const _docs = await fn(read)({
                  db,
                  m: "cget",
                  q: [
                    ...(dpath.length % 2 === 0 ? dpath.slice(0, -1) : dpath),
                    per_page,
                    true,
                  ],
                })
                setDocuments(_docs)
                setLoadMore(_docs.length === per_page ? last(_docs) : null)
                if (dpath.length % 2 === 0) {
                  setDocdata(
                    await fn(read)({ db, m: "cget", q: [...dpath, true] })
                  )
                  setSubCollections(
                    await fn(read)({
                      db,
                      m: "listCollections",
                      q: [...dpath, true],
                    })
                  )
                } else {
                  setDocdata(null)
                  setSubCollections([])
                }
              }
            }}
            sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
            as="span"
            color={i === doc_path.length - 1 ? "#6441AF" : ""}
          >
            {v}
          </Box>
        </>
      ))(doc_path)}
    </Flex>
  )
)
