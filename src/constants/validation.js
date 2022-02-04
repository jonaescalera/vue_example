export const validaionRules = {
  basic: {
    required: true,
    maxCharacters: 250
  },
  maxChracter:{
    maxCharacters: 250
  },
  email: {
    required: true,
    maxCharacter:250,
    pattern: /.+@.+\..+/
  },
  phone:{
    maxCharacters:50
  }
}
export default validaionRules;