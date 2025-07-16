import * as React from 'react';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid2';
import { stopLoading } from '../../../../../redux/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../../../components/CustomComponents/CustomInput';
import { handleFormError } from '../../../../../utils/handleFormError';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createAdAccount,
  getIntegration,
  updateAdAccount,
} from '../../../../../services/settingServices';
import { Box, Typography } from '@mui/material';
import CustomButton from '../../../../../components/CustomComponents/CustomButton';
import { showAlert } from '../../../../../redux/alertSlice';
import { setUser } from '../../../../../redux/userSlice';

const schema = Yup.object().shape({
  accountName: Yup.string()
    .min(3, 'Account Name must be at least 3 characters')
    .max(20, 'Account Name must be less than 20 characters')
    .required('Account Name is Required'),

  accessToken: Yup.string()
    .matches(
      /^[A-Za-z0-9-_]{20,100}$/,
      'Access Token must be alphanumeric (with - and _) and 20–100 characters long'
    )
    .required('Access Token is Required'),

  adId1: Yup.number()
    .typeError('Ad ID (1) must be a number')
    .integer('Ad ID (1) must be an integer')
    .positive('Ad ID (1) must be positive')
    .required('Ad ID (1) is Required'),

  adId2: Yup.number()
    .typeError('Ad ID (2) must be a number')
    .integer('Ad ID (2) must be an integer')
    .positive('Ad ID (2) must be positive')
    .nullable() // allows it to be null
    .notRequired(),
});

const steps = ['App Setup', 'Create ad account'];

const inputData = [
  {
    label: 'Account Name',
    name: 'accountName',
    placeholder: 'Type...',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Access Token',
    name: 'accessToken',
    placeholder: 'Type...',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Ad ID (1)',
    name: 'adId1',
    placeholder: 'Type...',
    mode: 'common',
    type: 'number',
  },
  {
    label: 'Ad ID (2) (Optional)',
    name: 'adId2',
    placeholder: 'Type...',
    mode: 'common',
    type: 'number',
  },
];

const initialFormValues = {
  accountName: '',
  accessToken: '',
  adId1: null,
  adId2: null,
};

const AdAccountForm = ({ error, setError, setActiveStep }) => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const formValues = React.useRef(initialFormValues);

  const [formErrors, setFormErrors] = React.useState(null);

  const [btnLoading, setBtnLoading] = React.useState(false);

  const [isDataFetched, setIsDataFetched] = React.useState(false);

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
    try {
      setBtnLoading(true);
      await schema.validate(formValues.current, { abortEarly: false });

      const { data } = id
        ? await updateAdAccount(formValues.current, id)
        : await createAdAccount(formValues.current);

      if (data.status) {
        if (!id) {
          formValues.current = initialFormValues;
          setActiveStep(2);

          if (error) {
            setError(false);
          }
        } else {
          formValues.current = {
            accountName: data?.adAccountData?.accountName || '',
            accessToken: data?.adAccountData?.accessToken || '',
            adId1: data?.adAccountData?.adId[0] || null,
            adId2: data?.adAccountData?.adId[1] || null,
          };
          navigate('/settings', { state: { value: 'Integration' } });
        }

        dispatch(
          showAlert({
            type: 'success',
            message: `Ad Account ${id ? 'Updated' : 'Created'} Successfully!`,
          })
        );
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      if (!id) {
        setError(true);
      }
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setBtnLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const { data } = await getIntegration(id);

        const adAccountData = data?.adAccount;

        formValues.current = {
          accountName: adAccountData?.accountName || '',
          accessToken: adAccountData?.accessToken || '',
          adId1: adAccountData?.adId[0] || null,
          adId2: adAccountData?.adId[1] || null,
        };
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        setIsDataFetched(!isDataFetched);
        dispatch(stopLoading());
      }
    };

    if (id) fetchAccountDetails();
  }, [id]);

  return (
    <Box px={id ? 0 : 5} mt={2}>
      {id && (
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Edit Ad Account
        </Typography>
      )}

      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {inputData?.map((data, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CustomInput
              label={data?.label}
              placeholder={data?.placeholder}
              value={formValues?.current[data?.name] || ''}
              name={data?.name}
              type={data?.type}
              disabled={data?.disabled}
              onChange={handleInputChange}
              error={(formErrors && formErrors[data?.name]) || null}
            />
          </Grid>
        ))}
      </Grid>

      <CustomButton
        sx={{ textAlign: 'end', mt: 2 }}
        name={'Submit'}
        onClick={handleSubmit}
        loading={btnLoading}
      />
    </Box>
  );
};

export default AdAccountForm;
