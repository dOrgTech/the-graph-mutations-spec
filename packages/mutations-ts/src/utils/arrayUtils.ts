export const makeRepeatedUnique = (array: string[]) => {
    const map: any = {};
    const count = array.map(function(val) {
        return map[val] = (typeof map[val] === "undefined") ? 1 : map[val] + 1;
    });
  
    return array.map(function(val, index) {
        return val + (map[val] != 1 ? '_' + count[index] : '');
    });
  }