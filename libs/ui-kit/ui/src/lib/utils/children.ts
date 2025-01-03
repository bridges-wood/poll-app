import { Children, isValidElement, ReactNode } from 'react';

/**
 * Gets only the valid children of a component,
 * and ignores any nullish or falsy child.
 *
 * @param children the children
 */
export function getValidChildren(children: React.ReactNode) {
  return Children.toArray(children).filter((child) =>
    isValidElement(child),
  ) as React.ReactElement[];
}

/**
 * Partitions the children of a component into two arrays based on the type of the children.
 * @param children The children to partition
 * @param typeFilter The type of child to remove from the children
 * @returns A tuple containing the children without the target child and the target children
 */
export function extractChildrenOfType<T = ReactNode>(
  children: T[] | T,
  typeFilter: React.ElementType,
): [T[] | undefined, T[] | undefined] {
  const matchingChildren: T[] = [];

  const remainingChildren = Children.map(children, (item) => {
    if (!isValidElement(item)) return item;
    if (item.type === typeFilter) {
      matchingChildren.push(item as T);

      return null;
    }

    return item;
  })?.filter(Boolean) as T[];

  return [
    remainingChildren,
    matchingChildren.length > 0 ? matchingChildren : undefined,
  ];
}
