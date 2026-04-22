import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/ui/form-field';

jest.mock('@/context/theme-context', () => ({
  useTheme: () => ({
    colors: {
      text: '#000',
      subtext: '#666',
      border: '#ddd',
      card: '#fff',
      background: '#fff',
    },
  }),
}));

describe('FormField', () => {
  it('renders the label and fires onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByText, getByLabelText } = render(
      <FormField label="Name" value="" onChangeText={onChangeText} />
    );

    expect(getByText('Name')).toBeTruthy();
    fireEvent.changeText(getByLabelText('Name'), 'Alice');
    expect(onChangeText).toHaveBeenCalledWith('Alice');
  });
});