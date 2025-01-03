import { extractChildrenOfType, getValidChildren } from './children';

describe('getValidChildren', () => {
  it('should return only valid children', () => {
    const children = [
      <div key="1">Valid Child 1</div>,
      null,
      <span key="2">Valid Child 2</span>,
      false,
      undefined,
    ];

    const validChildren = getValidChildren(children);

    expect(validChildren).toHaveLength(2);
    expect(validChildren[0].type).toBe('div');
    expect(validChildren[1].type).toBe('span');
  });

  it('should return an empty array if no valid children', () => {
    const children = [null, false, undefined];

    const validChildren = getValidChildren(children);

    expect(validChildren).toHaveLength(0);
  });
});

describe('partitionChildren', () => {
  it('should partition children based on the target child type', () => {
    const children = [
      <div key="1">Child 1</div>,
      <span key="2">Child 2</span>,
      <div key="3">Child 3</div>,
    ];

    const [remainingChildren, matchedChildren] = extractChildrenOfType(
      children,
      'div',
    );

    expect(remainingChildren).toHaveLength(1);
    expect(remainingChildren?.[0].type).toBe('span');
    expect(matchedChildren).toHaveLength(2);
    expect(matchedChildren?.[0].type).toBe('div');
    expect(matchedChildren?.[1].type).toBe('div');
  });

  it('should return all children in the first array if no target children found', () => {
    const children = [
      <span key="1">Child 1</span>,
      <span key="2">Child 2</span>,
    ];

    const [remainingChildren, matchedChildren] = extractChildrenOfType(
      children,
      'div',
    );

    expect(remainingChildren).toHaveLength(2);
    expect(remainingChildren?.[0].type).toBe('span');
    expect(remainingChildren?.[1].type).toBe('span');
    expect(matchedChildren).toBeUndefined();
  });

  it('should return an empty array if no children are provided', () => {
    const [remainingChildren, matchedChildren] = extractChildrenOfType(
      undefined,
      'div',
    );

    expect(remainingChildren).toBeUndefined();
    expect(matchedChildren).toBeUndefined();
  });

  it('should return an empty array if no valid children are provided', () => {
    const [remainingChildren, matchedChildren] = extractChildrenOfType(
      [null, false, undefined],
      'div',
    );

    expect(remainingChildren).toHaveLength(0);
    expect(matchedChildren).toBeUndefined();
  });
});
