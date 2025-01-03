/* eslint-disable @typescript-eslint/no-empty-function */
import { filterDOMProps } from './filter-dom-props';

describe('filterDOMProps', () => {
  it('should return all props if enabled is false', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
    };
    const options = { enabled: false };
    const result = filterDOMProps(props, options);
    expect(result).toEqual(props);
  });

  it('should filter out props not in DOMPropNames', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
      customProp: 'custom',
    };
    const result = filterDOMProps(props);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
      onClick: props.onClick,
    });
  });

  it('should include props in propNames', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
      customProp: 'custom',
    };
    const options = { propNames: new Set(['customProp']) };
    const result = filterDOMProps(props, options);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
      onClick: props.onClick,
      customProp: 'custom',
    });
  });

  it('should omit props in omitPropNames', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
      customProp: 'custom',
    };
    const options = { omitPropNames: new Set(['customProp']) };
    const result = filterDOMProps(props, options);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
      onClick: props.onClick,
    });
  });

  it('should omit event props if omitEventProps is true', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
    };
    const options = { omitEventProps: true };
    const result = filterDOMProps(props, options);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
    });
  });

  it('should omit data-* props if omitDataProps is true', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
    };
    const options = { omitDataProps: true };
    const result = filterDOMProps(props, options);
    expect(result).toEqual({
      'aria-label': 'label',
      onClick: props.onClick,
    });
  });

  it('should omit event names in omitEventNames', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
    };
    const options = { omitEventNames: new Set(['onClick']) };
    const result = filterDOMProps(props, options);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
    });
  });

  it('should omit unrecognized event props', () => {
    const props = {
      'aria-label': 'label',
      'data-test': 'test',
      onClick: () => {},
      onCustomEvent: () => {},
    };
    const result = filterDOMProps(props);
    expect(result).toEqual({
      'aria-label': 'label',
      'data-test': 'test',
      onClick: props.onClick,
    });
  });
});
