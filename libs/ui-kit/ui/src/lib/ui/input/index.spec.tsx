import { act, render } from '@testing-library/react';
import { Input, InputProps } from './index';
import { UseInputProps } from './use-input';

describe('Input Component', () => {
  const defaultProps: UseInputProps = {
    isClearable: false,
    startContent: null,
    endContent: null,
    skeleton: false,
  };

  it('should render input element', () => {
    const { getByRole } = render(<Input {...defaultProps} />);
    expect(getByRole('textbox')).toBeInTheDocument();
  });

  it('should render skeleton when skeleton prop is true', () => {
    const props = { ...defaultProps, skeleton: true };
    const { container } = render(<Input {...props} />);
    expect(
      container.querySelector('[data-testid="skeleton"]'),
    ).toBeInTheDocument();
  });

  it('should render start content', () => {
    const startContent = <span>Start</span>;
    const props = { ...defaultProps, startContent };
    const { getByText } = render(<Input {...props} />);
    expect(getByText('Start')).toBeInTheDocument();
  });

  it('should render end content', () => {
    const endContent = <span>End</span>;
    const props = { ...defaultProps, endContent };
    const { getByText } = render(<Input {...props} />);
    expect(getByText('End')).toBeInTheDocument();
  });

  it('should render clear button when isClearable is true', () => {
    const props = { ...defaultProps, isClearable: true };
    const { container } = render(<Input {...props} />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('should render a placeholder when input is empty', () => {
    const props: InputProps = {
      ...defaultProps,
      placeholder: 'Placeholder',
      value: '',
    };
    const { getByPlaceholderText } = render(<Input {...props} />);
    expect(getByPlaceholderText('Placeholder')).toBeInTheDocument();
  });

  it('should render a placeholder when the input is empty when cleared', () => {
    const props: InputProps = {
      ...defaultProps,
      placeholder: 'Placeholder',
      value: 'Value',
      isClearable: true,
    };
    const { getByPlaceholderText, getByTestId } = render(<Input {...props} />);

    act(() => getByTestId('clear-button').click());
    expect(getByPlaceholderText('Placeholder')).toBeInTheDocument();
  });

  it('should focus on the input if the inner wrapper is clicked', () => {
    const props = { ...defaultProps };
    const { getByTestId } = render(<Input {...props} />);

    act(() => getByTestId('inner-wrapper').click());
    expect(document.activeElement).toBe(getByTestId('input'));
  });

  it('should not focus on the input if the startContent is clicked', () => {
    const startContent = <span>Start</span>;
    const props = { ...defaultProps, startContent };
    const { getByText } = render(<Input {...props} />);

    act(() => getByText('Start').click());
    expect(document.activeElement).not.toBe(getByText('Start'));
  });
});
