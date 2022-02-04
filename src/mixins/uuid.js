export const UUID = {
  computed: {
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  }
}

export const generatePassword = () => {
  let charsetLow = "abcdefghijklmnopqrstuvwxyz"
  let charsetUp = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let charsetNum = "0123456789"
  let charsetChar = "!#$%&()*+-/<=>?@^_~"
  let retVal = "";
  for (var i = 0, n = charsetLow.length; i < 4; ++i) {
    retVal += charsetLow.charAt(Math.floor(Math.random() * n));
  }
  for (var i = 0, n = charsetUp.length; i < 4; ++i) {
    retVal += charsetUp.charAt(Math.floor(Math.random() * n));
  }
  for (var i = 0, n = charsetNum.length; i < 4; ++i) {
    retVal += charsetNum.charAt(Math.floor(Math.random() * n));
  }
  for (var i = 0, n = charsetChar.length; i < 4; ++i) {
    retVal += charsetChar.charAt(Math.floor(Math.random() * n));
  }
  let shuffle = retVal.split("");

  for(var i = shuffle.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffle[i];
      shuffle[i] = shuffle[j];
      shuffle[j] = tmp;
  }
  return shuffle.join("");
};