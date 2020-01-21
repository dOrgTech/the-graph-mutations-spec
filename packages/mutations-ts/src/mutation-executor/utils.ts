import { DocumentNode } from 'graphql'
import { visit } from 'graphql/language/visitor';

export function getDirectiveNames(doc: DocumentNode) {
  const names: string[] = [];

  visit(doc, {
    Directive(node) {
      names.push(node.name.value);
    },
  });

  return names;
}

export function getMutations(doc: DocumentNode) {
  let names: string [] = [];
  visit(doc, {
    OperationDefinition(node) {
      names = node.selectionSet.selections.reduce(function(result: string[], selection){
        if(selection.kind === "Field"){
          result.push(selection.name.value)
        }
        return result;
      }, [])
    },
  })

  return handleRepeated(names)
  
}

export function hasDirectives(names: string[], doc: DocumentNode) {
  return getDirectiveNames(doc).some(
    (name: string) => names.indexOf(name) > -1,
  );
}

function handleRepeated(array: string[]){
  const map: any = {};
  const count = array.map(function(val) {
      return map[val] = (typeof map[val] === "undefined") ? 1 : map[val] + 1;
  });

  return array.map(function(val, index) {
      return val + (map[val] != 1 ? '_' + count[index] : '');
  });
}
