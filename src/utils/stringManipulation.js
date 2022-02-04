export function nameToCamelCase(name) {
  if (name) {
    let arr = name.split(' ')
    let newName = '';
    arr.forEach(element => {
      newName += element.charAt(0).toUpperCase() + element.slice(1);
    });
    return newName;
  }
}