import { Box, Flex } from "@chakra-ui/react"
import {
  sortBy,
  is,
  concat,
  reject,
  propEq,
  isNil,
  indexBy,
  prop,
  compose,
  join,
  map,
  append,
  pluck,
  values,
  last,
  mapObjIndexed,
} from "ramda"
import { read, queryDB } from "../lib/weavedb.js"
import { inject } from "roidjs"
import { per_page } from "../lib/const"
export default inject(
  ["temp_current", "tx_logs"],
  ({
    col,
    documents,
    setAddData,
    loadMore,
    setCollections,
    subCollections,
    setLoadMore,
    setDocuments,
    db,
    docdata,
    base_path,
    setAddDoc,
    setDocPath,
    setDocdata,
    setSubCollections,
    contractTxId,
    doc_path,
    doc,
    fn,
  }) => (
    <>
      <Flex
        flex={1}
        sx={{ border: "1px solid #555", overflowX: "hidden" }}
        direction="column"
      >
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          <Box>Docs</Box>
          <Box flex={1} />
          {isNil(col) ? null : (
            <Box
              onClick={() => setAddDoc(true)}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              <Box as="i" className="fas fa-plus" />
            </Box>
          )}
        </Flex>
        <Box flex={1} sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              overflowY: "auto",
            }}
          >
            {map(v => (
              <Flex
                onClick={async () => {
                  setDocPath(concat(base_path, [col, v]))
                  setDocdata(
                    await fn(read)({
                      db,
                      m: "cget",
                      q: concat(base_path, [col, v]),
                    })
                  )
                  setSubCollections(
                    await fn(read)({
                      db,
                      m: "listCollections",
                      q: concat(base_path, [col, v]),
                    })
                  )
                }}
                bg={doc === v ? "#ddd" : ""}
                p={2}
                px={3}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box mr={3} flex={1} sx={{ overflowX: "hidden" }}>
                  {v}
                </Box>
                <Box
                  color="#999"
                  sx={{
                    cursor: "pointer",
                    ":hover": {
                      opacity: 0.75,
                      color: "#6441AF",
                    },
                  }}
                  onClick={async e => {
                    e.stopPropagation()
                    if (isNil(indexBy(prop("id"), documents)[v])) {
                      alert("Doc doesn't exist")
                      return
                    }
                    let col_path = compose(
                      join(", "),
                      map(v2 => `"${v2}"`),
                      append(col)
                    )(base_path)
                    let query = `${col_path}, "${v}"`
                    if (confirm("Would you like to delete the doc?")) {
                      const res = await fn(queryDB)({
                        method: "delete",
                        query,
                        contractTxId,
                      })
                      if (/^Error:/.test(res)) {
                        alert("Something went wrong")
                      }
                      if (!isNil(docdata) && v === docdata.id) {
                        setDocdata(null)
                      }
                      setDocuments(reject(propEq("id", v))(documents))
                    }
                  }}
                >
                  <Box as="i" className="fas fa-trash" />
                </Box>
              </Flex>
            ))(pluck("id", documents))}

            {isNil(loadMore) ? null : (
              <Flex align="center" justify="center">
                <Flex
                  px={10}
                  py={1}
                  m={3}
                  bg="#999"
                  color="white"
                  sx={{
                    borderRadius: "5px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    let _docs = await fn(read)({
                      db,
                      m: "cget",
                      q: [
                        ...base_path,
                        col,
                        ["startAfter", loadMore],
                        per_page,
                      ],
                    })
                    if (_docs.length > 0) {
                      setDocuments(
                        compose(
                          map(prop("v")),
                          sortBy(prop("k")),
                          values,
                          mapObjIndexed((v, k) => ({ v, k })),
                          indexBy(prop("id")),
                          concat(documents)
                        )(_docs)
                      )
                    }
                    setLoadMore(_docs.length === per_page ? last(_docs) : null)
                  }}
                >
                  Load More
                </Flex>
              </Flex>
            )}
          </Box>
        </Box>
      </Flex>
      <Flex
        flex={1}
        sx={{ border: "1px solid #555", overflowX: "hidden" }}
        direction="column"
      >
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          <Box>Data</Box>
          <Box flex={1} />
          {isNil(docdata) ? null : (
            <Box
              onClick={() => setAddData(true)}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              <Box as="i" className="fas fa-plus" />
            </Box>
          )}
        </Flex>
        <Box flex={1} sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              overflowY: "auto",
            }}
          >
            {compose(
              map(v => {
                return (
                  <Flex
                    align="center"
                    p={2}
                    px={3}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                    onClick={async () => {
                      const _doc_path = append(v)(doc_path)
                      setDocPath(_doc_path)
                      setDocdata(null)
                      setSubCollections([])
                      setCollections(subCollections)
                      const _docs = await fn(read)({
                        db,
                        m: "cget",
                        q: [..._doc_path, per_page],
                      })
                      setDocuments(_docs)
                      setLoadMore(
                        _docs.length === per_page ? last(_docs) : null
                      )
                    }}
                  >
                    <Box
                      mr={2}
                      px={3}
                      bg="#333"
                      color="white"
                      sx={{ borderRadius: "3px" }}
                    >
                      Sub Collection
                    </Box>
                    {v}
                  </Flex>
                )
              })
            )(subCollections)}
            {compose(
              values,
              mapObjIndexed((v, k) => {
                return (
                  <Flex align="flex-start" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      {k}
                    </Box>
                    <Box flex={1} sx={{ overflowX: "hidden" }} mr={2}>
                      {is(Object)(v)
                        ? JSON.stringify(v)
                        : is(Boolean)(v)
                        ? v
                          ? "true"
                          : "false"
                        : v}
                    </Box>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (isNil(docdata.data[k])) {
                          alert("Field doesn't exist")
                          return
                        }
                        let query = ""
                        const method = "update"
                        let _doc_path = compose(
                          join(", "),
                          map(v => `"${v}"`),
                          concat(base_path)
                        )([col, doc])
                        query = `{ "${k}": ${JSON.stringify(
                          db.del()
                        )}}, ${_doc_path}`
                        if (confirm("Would you like to delete the field?")) {
                          const res = await fn(queryDB)({
                            method,
                            query,
                            contractTxId,
                          })
                          if (/^Error:/.test(res)) {
                            alert("Something went wrong")
                          }
                          setDocdata(
                            await fn(read)({
                              db,
                              m: "cget",
                              q: [...doc_path],
                            })
                          )
                          setSubCollections(
                            await fn(read)({
                              db,
                              m: "listCollections",
                              q: [...doc_path],
                            })
                          )
                        }
                      }}
                    >
                      <Box as="i" className="fas fa-trash" />
                    </Box>
                  </Flex>
                )
              })
            )(isNil(docdata) ? {} : docdata.data)}
          </Box>
        </Box>
      </Flex>
    </>
  )
)
