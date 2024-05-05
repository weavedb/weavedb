const initDIDParams = Object.freeze({
  method: "",
  id: "",
  idStrings: [],
  params: [],
  path: "",
  pathSegments: [],
  query: "",
  fragment: "",
})

class StringUtils {
  static isNotValidIDChar(char) {
    return (
      StringUtils.isNotAlpha(char) &&
      StringUtils.isNotDigit(char) &&
      char !== "." &&
      char !== "-"
    )
  }

  static isNotValidParamChar(char) {
    return (
      StringUtils.isNotAlpha(char) &&
      StringUtils.isNotDigit(char) &&
      char !== "." &&
      char !== "-" &&
      char !== "_" &&
      char !== ":"
    )
  }

  static isNotValidQueryOrFragmentChar(char) {
    return StringUtils.isNotValidPathChar(char) && char !== "/" && char !== "?"
  }

  static isNotValidPathChar(char) {
    return (
      StringUtils.isNotUnreservedOrSubdelim(char) &&
      char !== ":" &&
      char !== "@"
    )
  }

  static isNotUnreservedOrSubdelim(char) {
    switch (char) {
      case "-":
      case ".":
      case "_":
      case "~":
      case "!":
      case "$":
      case "&":
      case "'":
      case "(":
      case ")":
      case "*":
      case "+":
      case ",":
      case ";":
      case "=":
        return false
      default:
        if (StringUtils.isNotAlpha(char) && StringUtils.isNotDigit(char)) {
          return true
        }
        return false
    }
  }

  static isNotHexDigit(char) {
    return (
      StringUtils.isNotDigit(char) &&
      (char < "\x41" || char > "\x46") &&
      (char < "\x61" || char > "\x66")
    )
  }

  static isNotDigit(char) {
    // '\x30' is digit 0, '\x39' is digit 9
    return char < "\x30" || char > "\x39"
  }

  // StringUtils.isNotAlpha returns true if a byte is not a big letter between A-Z or small letter between a-z
  // https://tools.ietf.org/html/rfc5234#appendix-B.1
  static isNotAlpha(char) {
    return (
      StringUtils.isNotSmallLetter(char) && StringUtils.isNotBigLetter(char)
    )
  }

  // isNotBigLetter returns true if a byte is not a big letter between A-Z
  // in US-ASCII http://www.columbia.edu/kermit/ascii.html
  // https://tools.ietf.org/html/rfc5234#appendix-B.1
  static isNotBigLetter(char) {
    // '\x41' is big letter A, '\x5A' small letter Z
    return char < "\x41" || char > "\x5A"
  }

  // isNotSmallLetter returns true if a byte is not a small letter between a-z
  // in US-ASCII http://www.columbia.edu/kermit/ascii.html
  // https://tools.ietf.org/html/rfc5234#appendix-B.1
  static isNotSmallLetter(char) {
    // '\x61' is small letter a, '\x7A' small letter z
    return char < "\x61" || char > "\x7A"
  }
}
class Parser {
  constructor(input) {
    this.currentIndex = 0
    this.out = { ...initDIDParams }
    this.input = input
  }

  checkLength() {
    const inputLength = this.input.length

    if (inputLength < 7) {
      throw new Error("input length is less than 7")
    }

    return this.parseScheme.bind(this)
  }

  // parseScheme is a parserStep that validates that the input begins with 'did:'
  parseScheme() {
    const currentIndex = 3 // 4 bytes in 'did:', i.e index 3
    // the grammar requires `did:` prefix
    if (this.input.slice(0, currentIndex + 1) !== "did:") {
      throw new Error("input does not begin with 'did:' prefix")
    }

    this.currentIndex = currentIndex
    return this.parseMethod.bind(this)
  }

  parseMethod() {
    const input = this.input
    const inputLength = input.length
    let currentIndex = this.currentIndex + 1
    const startIndex = currentIndex

    for (;;) {
      if (currentIndex === inputLength) {
        // we got to the end of the input and didn't find a second ':'
        throw new Error(
          "input does not have a second `:` marking end of method name"
        )
      }

      // read the input character at currentIndex
      const char = input[currentIndex]

      if (char === ":") {
        // we've found the second : in the input that marks the end of the method
        if (currentIndex === startIndex) {
          // return error is method is empty, ex- did::1234
          throw new Error(`method is empty, ${currentIndex}`)
        }
        break
      }

      // as per the grammar method can only be made of digits 0-9 or small letters a-z
      if (StringUtils.isNotDigit(char) && StringUtils.isNotSmallLetter(char)) {
        throw new Error(`"character is not a-z OR 0-9, ${currentIndex}`)
      }

      // move to the next char
      currentIndex = currentIndex + 1
    }

    // set parser state
    this.currentIndex = currentIndex
    this.out.method = input.slice(startIndex, currentIndex)

    // method is followed by specific-idstring, parse that next
    return this.parseId.bind(this)
  }

  parseId() {
    const input = this.input
    const inputLength = input.length
    let currentIndex = this.currentIndex + 1
    const startIndex = currentIndex

    let next = null

    for (;;) {
      if (currentIndex === inputLength) {
        // we've reached end of input, no next state
        next = null
        break
      }

      const char = input[currentIndex]

      if (char === ":") {
        // encountered : input may have another idstring, parse ID again
        next = this.parseId
        break
      }

      if (char === ";") {
        // encountered ; input may have a parameter, parse that next
        next = this.parseParamName
        break
      }

      if (char === "/") {
        // encountered / input may have a path following specific-idstring, parse that next
        next = this.parsePath
        break
      }

      if (char === "?") {
        // encountered ? input may have a query following specific-idstring, parse that next
        next = this.parseQuery
        break
      }

      if (char === "#") {
        // encountered # input may have a fragment following specific-idstring, parse that next
        next = this.parseFragment
        break
      }

      // make sure current char is a valid idchar
      // idchar = ALPHA / DIGIT / "." / "-"
      if (StringUtils.isNotValidIDChar(char)) {
        throw new Error(
          `byte is not ALPHA OR DIGIT OR '.' OR '-', ${currentIndex}`
        )
      }

      // move to the next char
      currentIndex = currentIndex + 1
    }

    if (currentIndex === startIndex) {
      // idstring length is zero
      // from the grammar:
      //   idstring = 1*idchar
      // return error because idstring is empty, ex- did:a::123:456
      throw new Error(`idstring must be atleast one char long, ${currentIndex}`)
    }

    // set parser state
    this.currentIndex = currentIndex
    this.out.idStrings = [
      ...this.out.idStrings,
      input.slice(startIndex, currentIndex),
    ]

    // return the next parser step
    return next ? next.bind(this) : null
  }

  parseParamName() {
    const input = this.input
    const startIndex = this.currentIndex + 1
    const next = this.paramTransition()
    const currentIndex = this.currentIndex

    if (currentIndex === startIndex) {
      throw new Error(
        `Param name must be at least one char long, ${currentIndex}`
      )
    }

    // Create a new param with the name
    this.out.params = [
      ...this.out.params,
      new Param(input.slice(startIndex, currentIndex), ""),
    ]

    // return the next parser step
    return next ? next.bind(this) : null
  }

  parseParamValue() {
    const input = this.input
    const startIndex = this.currentIndex + 1
    const next = this.paramTransition()
    const currentIndex = this.currentIndex
    this.out.params[this.out.params.length - 1].value = input.slice(
      startIndex,
      currentIndex
    )
    return next ? next.bind(this) : null
  }

  paramTransition() {
    const input = this.input
    const inputLength = input.length
    let currentIndex = this.currentIndex + 1

    let indexIncrement
    let next
    let percentEncoded

    for (;;) {
      if (currentIndex === inputLength) {
        // we've reached end of input, no next state
        next = null
        break
      }

      const char = input[currentIndex]

      if (char === ";") {
        // encountered : input may have another param, parse paramName again
        next = this.parseParamName
        break
      }

      // Separate steps for name and value?
      if (char === "=") {
        // parse param value
        next = this.parseParamValue
        break
      }

      if (char === "/") {
        // encountered / input may have a path following current param, parse that next
        next = this.parsePath
        break
      }

      if (char === "?") {
        // encountered ? input may have a query following current param, parse that next
        next = this.parseQuery
        break
      }

      if (char == "#") {
        // encountered # input may have a fragment following current param, parse that next
        next = this.parseFragment
        break
      }

      if (char == "%") {
        // a % must be followed by 2 hex digits
        if (
          currentIndex + 2 >= inputLength ||
          StringUtils.isNotHexDigit(input[currentIndex + 1]) ||
          StringUtils.isNotHexDigit(input[currentIndex + 2])
        ) {
          throw new Error(`% is not followed by 2 hex digits', ${currentIndex}`)
        }
        // if we got here, we're dealing with percent encoded char, jump three chars
        percentEncoded = true
        indexIncrement = 3
      } else {
        // not percent encoded
        percentEncoded = false
        indexIncrement = 1
      }

      // make sure current char is a valid param-char
      // idchar = ALPHA / DIGIT / "." / "-"
      if (!percentEncoded && StringUtils.isNotValidParamChar(char)) {
        throw new Error(
          `character is not allowed in param - ${char}',  ${currentIndex}`
        )
      }

      // move to the next char
      currentIndex = currentIndex + indexIncrement
    }

    // set parser state
    this.currentIndex = currentIndex

    return next ? next.bind(this) : null
  }

  parsePath() {
    const input = this.input
    const inputLength = input.length
    let currentIndex = this.currentIndex + 1
    const startIndex = currentIndex

    let indexIncrement
    let next
    let percentEncoded

    for (;;) {
      if (currentIndex === inputLength) {
        next = null
        break
      }

      const char = input[currentIndex]

      if (char === "/") {
        // encountered / input may have another path segment, try to parse that next
        next = this.parsePath
        break
      }

      if (char === "?") {
        // encountered ? input may have a query following path, parse that next
        next = this.parseQuery
        break
      }

      if (char === "%") {
        // a % must be followed by 2 hex digits
        if (
          currentIndex + 2 >= inputLength ||
          StringUtils.isNotHexDigit(input[currentIndex + 1]) ||
          StringUtils.isNotHexDigit(input[currentIndex + 2])
        ) {
          throw new Error(`% is not followed by 2 hex digits, ${currentIndex}`)
        }
        // if we got here, we're dealing with percent encoded char, jump three chars
        percentEncoded = true
        indexIncrement = 3
      } else {
        // not pecent encoded
        percentEncoded = false
        indexIncrement = 1
      }

      // pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
      if (!percentEncoded && StringUtils.isNotValidPathChar(char)) {
        throw new Error(`character is not allowed in path, ${currentIndex}`)
      }

      // move to the next char
      currentIndex = currentIndex + indexIncrement
    }

    if (currentIndex == startIndex && this.out.pathSegments.length === 0) {
      throw new Error(
        `first path segment must have atleast one character, ${currentIndex}`
      )
    }

    // update parser state
    this.currentIndex = currentIndex
    this.out.pathSegments = [
      ...this.out.pathSegments,
      input.slice(startIndex, currentIndex),
    ]

    return next ? next.bind(this) : null
  }

  parseQuery() {
    const input = this.input
    const inputLength = input.length
    let currentIndex = this.currentIndex + 1
    const startIndex = currentIndex

    let indexIncrement
    let next = null
    let percentEncoded

    for (;;) {
      if (currentIndex === inputLength) {
        break
      }

      const char = input[currentIndex]

      if (char === "#") {
        // encountered # input may have a fragment following the query, parse that next
        next = this.parseFragment
        break
      }

      if (char === "%") {
        // a % must be followed by 2 hex digits
        if (
          currentIndex + 2 >= inputLength ||
          StringUtils.isNotHexDigit(input[currentIndex + 1]) ||
          StringUtils.isNotHexDigit(input[currentIndex + 2])
        ) {
          throw new Error(`% is not followed by 2 hex digits, ${currentIndex}`)
        }
        // if we got here, we're dealing with percent encoded char, jump three chars
        percentEncoded = true
        indexIncrement = 3
      } else {
        // not pecent encoded
        percentEncoded = false
        indexIncrement = 1
      }
      if (!percentEncoded && StringUtils.isNotValidQueryOrFragmentChar(char)) {
        throw new Error(`character is not allowed in query - ${char}`)
      }

      // move to the next char
      currentIndex = currentIndex + indexIncrement
    }

    // update parser state
    this.currentIndex = currentIndex
    this.out.query = input.slice(startIndex, currentIndex)

    return next ? next.bind(this) : null
  }

  parseFragment() {
    const input = this.input
    const inputLength = this.input.length
    let currentIndex = this.currentIndex + 1
    const startIndex = currentIndex

    let indexIncrement
    let percentEncoded

    for (;;) {
      if (currentIndex === inputLength) {
        break
      }

      const char = input[currentIndex]

      if (char === "%") {
        // a % must be followed by 2 hex digits
        if (
          currentIndex + 2 >= inputLength ||
          StringUtils.isNotHexDigit(input[currentIndex + 1]) ||
          StringUtils.isNotHexDigit(input[currentIndex + 2])
        ) {
          throw new Error(`% is not followed by 2 hex digits, ${currentIndex}`)
        }
        // if we got here, we're dealing with percent encoded char, jump three chars
        percentEncoded = true
        indexIncrement = 3
      } else {
        // not pecent encoded
        percentEncoded = false
        indexIncrement = 1
      }

      if (!percentEncoded && StringUtils.isNotValidQueryOrFragmentChar(char)) {
        throw new Error(`character is not allowed in fragment - ${char}`)
      }

      // move to the next char
      currentIndex = currentIndex + indexIncrement
    }

    // update parser state
    this.currentIndex = currentIndex
    this.out.fragment = input.slice(startIndex, currentIndex)

    // no more parsing needed after a fragment,
    // cause the state machine to exit by returning nil
    return null
  }
}
module.exports = { Parser }
