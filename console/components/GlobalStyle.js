export default () => (
  <style global jsx>{`
    /* ===== Scrollbar CSS ===== */
    /* Firefox */
    * {
      scrollbar-width: auto;
      scrollbar-color: #666 #ffffff;
    }

    /* Chrome, Edge, and Safari */
    *::-webkit-scrollbar {
      width: 10px;
    }

    *::-webkit-scrollbar-track {
      background: #ffffff;
    }

    *::-webkit-scrollbar-thumb {
      background-color: #666;
      border-radius: 10px;
      border: 3px solid #ffffff;
    }
    html,
    #__next,
    body {
      height: 100%;
      background: #333;
    }
  `}</style>
)
