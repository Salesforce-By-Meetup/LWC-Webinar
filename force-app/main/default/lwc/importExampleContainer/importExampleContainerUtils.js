export const getDateTime = () => {
    return "" + new Date().getTime();
}

/**
 * @typedef {string} InternalTimestamp
 */

export default getDateTime;