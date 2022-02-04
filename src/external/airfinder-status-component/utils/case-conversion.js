export function convertToTitleCase(input) {
  if (typeof input === "string") {
    return input.replace(/[a-zA-Z]+/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
  return input;
}
