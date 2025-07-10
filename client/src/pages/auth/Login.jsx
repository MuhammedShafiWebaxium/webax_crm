import * as React from 'react';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from '../../components/ForgotPassword';
import {
  FacebookIcon,
  GoogleIcon,
  SitemarkIcon,
} from '../../internals/components/CustomIcons';
import CustomInput from '../../components/CustomComponents/CustomInput';
import CustomButton from '../../components/CustomComponents/CustomButton';
import { loginUser } from '../../services/indexServices';
import { useDispatch, useSelector } from 'react-redux';
import { stopLoading } from '../../redux/loadingSlice';
import { logOut, setUser } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { handleFormError } from '../../utils/handleFormError';
import { showAlert } from '../../redux/alertSlice';

const schema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid Email Address')
    .matches(
      /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
      'Invalid Email Address Format'
    )
    .required('Email is Required'),
  password: Yup.string().required('Password is Required'),
});

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const LogInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const inputData = [
  {
    label: 'Email',
    name: 'email',
    placeholder: 'your@email.com',
    mode: 'common',
    type: 'email',
  },
  {
    label: 'Password',
    name: 'password',
    placeholder: '••••••',
    mode: 'common',
    type: 'password',
  },
];

const initialFormValue = {
  email: '',
  password: '',
};

export default function LogIn() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const formValues = React.useRef(initialFormValue);

  const [formErrors, setFormErrors] = React.useState(null);

  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = async (event) => {
    const { name, value } = event.target;

    formValues.current = {
      ...formValues.current,
      [name]: value,
    };
    try {
      await Yup.reach(schema, name).validate(value);

      setFormErrors({ ...formErrors, [name]: null });
    } catch (error) {
      setFormErrors({ ...formErrors, [name]: error.message });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await schema.validate(formValues.current, { abortEarly: false });

      const { data } = await loginUser(formValues.current);

      dispatch(setUser(data.user));

      dispatch(
        showAlert({
          type: 'success',
          message: `Hi ${data?.user?.name}, everything's ready for you. Let's get started!`,
        })
      );

      navigate('/');
    } catch (error) {
      if (error?.response?.data?.message === 'Invalid credentials') {
        console.log(error);
        const innerError = [
          { path: 'email', message: error?.response?.data?.message },
          { path: 'password', message: error?.response?.data?.message },
        ];

        error.inner = innerError;
      }

      handleFormError(error, setFormErrors, dispatch, navigate);

      if (currentUser) {
        dispatch(logOut());
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    dispatch(stopLoading());
  }, []);

  return (
    <LogInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        {/* <SitemarkIcon /> */}
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Log in
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {inputData.map((data, index) => (
              <Box key={index}>
                <CustomInput
                  label={data?.label}
                  placeholder={data?.placeholder}
                  value={formValues?.current[data?.name]}
                  name={data?.name}
                  type={data?.type}
                  onChange={handleInputChange}
                  error={(formErrors && formErrors[data?.name]) || null}
                />
              </Box>
            ))}
          </Box>
          <ForgotPassword open={open} handleClose={handleClose} />
          <CustomButton
            sx={{ textAlign: 'end', mt: 1 }}
            name={'Submit'}
            onClick={handleSubmit}
            loading={loading}
            fullWidth={true}
          />
          <Link
            component="button"
            type="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >
            Forgot your password?
          </Link>
        </Box>
        <Divider>or</Divider>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => alert('In progress')}
            startIcon={<GoogleIcon />}
          >
            Log in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => alert('In progress')}
            startIcon={<FacebookIcon />}
          >
            Log in with Facebook
          </Button>
          {/* <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/material-ui/getting-started/templates/sign-in/"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign up
            </Link>
          </Typography> */}
        </Box>
      </Card>
    </LogInContainer>
  );
}
