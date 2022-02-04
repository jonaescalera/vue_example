function download(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("style", "display: none");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Function to download a file to the user
 *
 * @export
 * @param {string} data
 * @param {string} fileName
 */
export function downloadInBrowser(data, fileName) {
  const blob = new Blob([data], { type: "octet/stream" });
  download(blob, fileName);
}

/**
 * Function to download a file to the user
 *
 * @export
 * @param {string} data
 * @param {string} fileName
 */
export function downloadBlobInBrowser(blob, fileName) {
  download(blob, fileName);
}
