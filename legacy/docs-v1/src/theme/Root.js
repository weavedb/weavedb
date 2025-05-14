import React from "react"
export default function Root({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Righteous&display=swap"
        rel="stylesheet"
      />
      <style global jsx>{`
        svg {
          display: inline;
        }
        .navbar__brand b {
          color: #000138;
          font-family: "Righteous", cursive;
          font-weight: normal;
        }
      `}</style>
      {children}
    </>
  )
}
