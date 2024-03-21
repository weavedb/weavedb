const { err } = require("../../../common/lib/utils")

const getCount = async (state, action) => {
    const collectionName = action.input.query;
    if (state.data.hasOwnProperty(collectionName))
        return { result: state.data[collectionName].length }

    err(`${collectionName} does not exists.`, false)
}

module.exports = { getCount }