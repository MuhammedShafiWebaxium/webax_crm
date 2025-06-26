import * as React from 'react';
import Alert from '@mui/material/Alert';

export default function SimpleAlert({ icon, severity, text }) {
  return (
    <Alert icon={icon} severity={severity}>
      {text}
    </Alert>
  );
}
