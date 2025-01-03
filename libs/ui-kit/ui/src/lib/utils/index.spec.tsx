import { render, screen } from '@testing-library/react';
import React from 'react';
import { forwardRef, mapPropsVariants, useDOMRef } from './index';

describe('forwardRef', () => {
  it('should forward ref to the component', () => {
    const TestComponent = forwardRef((props, ref) => (
      <div ref={ref} {...props}>
        Test
      </div>
    ));

    const ref = React.createRef<HTMLDivElement>();
    render(<TestComponent ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveProperty('textContent', 'Test');
  });
});

describe('mapPropsVariants', () => {
  it('should separate variant props from other props', () => {
    const props = { variant1: 'value1', variant2: 'value2', other: 'value3' };
    const [omitted, picked] = mapPropsVariants(props, ['variant1', 'variant2']);

    expect(omitted).toEqual({ other: 'value3' });
    expect(picked).toEqual({ variant1: 'value1', variant2: 'value2' });
  });

  it('should return all props if no variant keys are provided', () => {
    const props = { variant1: 'value1', variant2: 'value2', other: 'value3' };
    const [omitted, picked] = mapPropsVariants(props);

    expect(omitted).toEqual(props);
    expect(picked).toEqual({});
  });

  it('should not remove variant props if removeVariantProps is false', () => {
    const props = { variant1: 'value1', variant2: 'value2', other: 'value3' };
    const [mapped, picked] = mapPropsVariants(
      props,
      ['variant1', 'variant2'],
      false,
    );

    expect(mapped).toEqual({
      variant1: 'value1',
      variant2: 'value2',
      other: 'value3',
    });
    expect(picked).toEqual({
      variant1: 'value1',
      variant2: 'value2',
    });
  });
});

describe('useDOMRef', () => {
  it('should return a ref to the DOM element', () => {
    const TestComponent = () => {
      const domRef = useDOMRef<HTMLDivElement>();
      return <div ref={domRef}>Test</div>;
    };

    render(<TestComponent />);
    const element = screen.getByText('Test');

    expect(element).toBeInstanceOf(HTMLDivElement);
  });

  it('should forward ref to the DOM element', () => {
    const TestComponent = React.forwardRef<HTMLDivElement>((props, ref) => {
      const domRef = useDOMRef(ref);
      return <div ref={domRef}>Test</div>;
    });

    const ref = React.createRef<HTMLDivElement>();
    render(<TestComponent ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveProperty('textContent', 'Test');
  });
});
