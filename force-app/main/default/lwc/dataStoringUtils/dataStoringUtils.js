/**
 * Formats phone to readable way
 * @param {string} phoneNumber the number of the phone
 */
export const getFormattedPhone = phoneNumber => {
    return (phoneNumber.length > 0 ? ("(" + phoneNumber.slice(0, 3) + ")") : "") +
        (phoneNumber.length > 3 ? (" " + phoneNumber.slice(3, 6)) : "") +
        (phoneNumber.length > 6 ? ("-" + phoneNumber.slice(6, 8)) : "") +
        (phoneNumber.length > 8 ? ("-" + phoneNumber.slice(8, 10)) : "") +
        (phoneNumber.length > 10 ? (" [" + phoneNumber.slice(10) + "]") : "");
}
