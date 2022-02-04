/**
 * Function to access nested object properties via string notation
 *
 * Such as "prop1.prop2.prop3"
 *
 * @export
 * @param {(string | string[])} path
 * @param {*} obj
 * @param {string} [separator="."]
 * @returns
 */
export function resolveObjectProperty(
  path,
  obj,
  separator = "."
) {
  const properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
