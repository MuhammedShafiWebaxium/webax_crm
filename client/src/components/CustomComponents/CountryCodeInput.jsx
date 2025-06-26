import React, { useEffect, useState } from 'react';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { checkInternationalPhone } from '../../utils/validation';
import { Box } from '@mui/material';

const CountryCodeInput = ({
  label,
  placeholder,
  country,
  initialValue,
  name,
  code,
  onChange,
  error,
}) => {
  const [phone, setPhone] = useState(initialValue || '');
  const [valid, setValid] = useState(true);
  // const [formatted, setFormatted] = useState('');

  const handleChange = (value, data) => {
    // setFormatted(value.slice(data.dialCode.length));
    setPhone(value);
    const isValid = checkInternationalPhone(value.slice(data.dialCode.length));

    setValid(isValid);
    onChange(
      { target: { name, value: '+' + value } },
      !isValid ? 'Phone is Not Valid' : false
    );
    code && onChange({ target: { name: code, value: data.countryCode } });
  };

  // useEffect(() => {
  //   if (initialValue.length) {
  //     setPhone(initialValue);
  //   }
  // }, [initialValue]);

  const isError = error || (phone && !valid);

  return (
    <div className="container">
      <Box
        component="label"
        mb={0.5}
        display="block"
        // className={isError ? 'text-error' : ''}
      >
        {isError ? (phone && !valid ? 'Phone is Not Valid' : error) : label}
      </Box>
      <ReactPhoneInput
        className={`phone-input ${isError ? 'input-error' : ''}`}
        value={phone}
        isValid={checkInternationalPhone}
        onChange={handleChange}
        country={country}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CountryCodeInput;