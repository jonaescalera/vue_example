import {validaionRules} from '../constants/validation';

function validate(objectKey, label){
  const rules =  [];
  const rule =  validaionRules[objectKey];
  const keys=Object.keys(rule);
  for(let key of keys){
    if (key==='required') {
      rules.push(v=>!!v || `${label} is required`);
    } else if(key === 'maxCharacters') {
      rules.push(v => ((v || '' ).length <= rule[key]) || `${label} must be less than ${rule[key]} characters`);
    } else if(key === 'pattern'){
      rules.push( v => rule[key].test(v) ||  `${label} is not valid`);
    }
  }

  return rules;
}

export default validate;