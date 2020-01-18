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

export function hasDirectives(names: string[], doc: DocumentNode) {
  return getDirectiveNames(doc).some(
    (name: string) => names.indexOf(name) > -1,
  );
}
