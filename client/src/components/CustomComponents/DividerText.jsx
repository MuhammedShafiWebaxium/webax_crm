import Divider from '@mui/material/Divider';

export default function DividerText({ textAlign, text }) {
  return (
    <Divider textAlign={textAlign}>
      {text}
    </Divider>
  );
}
