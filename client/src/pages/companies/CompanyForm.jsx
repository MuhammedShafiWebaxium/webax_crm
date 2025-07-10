import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { sources, industries } from '../../constants';
import {
  createCompany,
  getCompany,
  updateCompany,
} from '../../services/companyServices';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import CustomInput from '../../components/CustomComponents/CustomInput';
import CountryCodeInput from '../../components/CustomComponents/CountryCodeInput';
import CustomComboBox from '../../components/CustomComponents/CustomComboBox';
import CustomButton from '../../components/CustomComponents/CustomButton';
import { showAlert } from '../../redux/alertSlice';
import { handleFormError } from '../../utils/handleFormError';

const cardData = [
  {
    title: 'Companies',
    value: '0',
    interval: 'Last 30 days',
    trend: 'neutral',
    data: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    days: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30,
    ],
    trendValue: '0%',
  },
];

const inputData = [
  {
    label: 'Company Name',
    name: 'name',
    placeholder: 'Write your company name here',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Phone',
    name: 'phone',
    code: 'phoneCode',
    placeholder: '+91',
    mode: 'phone',
    country: 'in',
  },
  {
    label: 'Email',
    name: 'email',
    placeholder: 'example@gmail.com',
    mode: 'common',
    type: 'email',
  },
  {
    label: 'Website',
    name: 'website',
    placeholder: 'Company website',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Source',
    name: 'source',
    placeholder: 'Unknown',
    data: sources,
    mode: 'combobox',
  },
  {
    label: 'Industry',
    name: 'industry',
    placeholder: 'Unknown',
    data: industries,
    mode: 'combobox',
  },
  {
    label: 'Street',
    name: 'street',
    placeholder: 'Enter street',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'City',
    name: 'city',
    placeholder: 'Enter city',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'District',
    name: 'district',
    placeholder: 'Enter district',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'State',
    name: 'state',
    placeholder: 'Enter state',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Country',
    name: 'country',
    placeholder: 'Enter country',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Postal Code',
    name: 'postalCode',
    placeholder: 'Enter postal code',
    mode: 'common',
    type: 'text',
  },
];

const initialFormValue = {
  name: '',
  phone: '',
  phoneCode: '',
  email: '',
  website: '',
  source: null,
  industry: null,
  street: '',
  city: '',
  district: '',
  state: '',
  country: '',
  postalCode: '',
};

const schema = Yup.object().shape({
  name: Yup.string().trim().required('Company Name is Required'),
  phone: Yup.string().trim().required('Phone is Required'),
  phoneCode: Yup.string().trim().required('Phone Code is Required'),
  email: Yup.string()
    .trim()
    .email('Invalid email format')
    .required('Email is required'),
  website: Yup.string().trim().url('Invalid website URL').required('Website Code is Required'),
  street: Yup.string().trim().required('Website is Required'),
  city: Yup.string().trim().required('City is Required'),
  district: Yup.string().trim().required('District is Required'),
  state: Yup.string().trim().required('State is Required'),
  country: Yup.string().trim().required('Country is Required'),
  postalCode: Yup.string()
    .trim()
    .matches(/^\d{5,6}$/, 'Invalid Postal Code')
    .required('Postal Code is Required'),
  source: Yup.string().trim().required('Source is Required'),
  industry: Yup.string().trim().required('Industry is Required'),
});

const CompanyForm = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { id } = useParams();

  const { global } = useSelector((state) => state.loading);

  const formValues = useRef(initialFormValue);

  const [formErrors, setFormErrors] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleInputChange = async (event, isValid) => {
    const { name, value } = event.target;

    formValues.current = {
      ...formValues.current,
      [name]: value,
    };

    try {
      await Yup.reach(schema, name).validate(value);
      if (isValid) throw Error(isValid);

      setFormErrors({ ...formErrors, [name]: null });
    } catch (error) {
      setFormErrors({ ...formErrors, [name]: error.message });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await schema.validate(formValues.current, { abortEarly: false });

      const { data } = id
        ? await updateCompany(id, formValues.current)
        : await createCompany(formValues.current);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `Company ${id ? 'Updated' : 'Created'} Successfully!`,
          })
        );

        dispatch(startLoading());
        navigate('/companies');
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const updateFormValues = (company) => {
    formValues.current = company
      ? {
          ...formValues.current,
          name: company.name || 'N/A',
          phone: company.phone || '',
          phoneCountry: company.phoneCode || '',
          email: company.email || 'N/A',
          website: company.website || 'N/A',
          source: company.source || 'N/A',
          industry: company.industry || 'N/A',
          street: company?.address?.street || 'N/A',
          city: company?.address?.city || 'N/A',
          district: company?.address?.district || 'N/A',
          state: company?.address?.state || 'N/A',
          country: company?.address?.country || 'N/A',
          postalCode: company?.address?.postalCode || 'N/A',
        }
      : { ...initialFormValue };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!global) {
          dispatch(startLoading());
        }

        const { data } = await getCompany(id);

        updateFormValues(data.company);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    if (id) {
      fetchData();
    } else {
      dispatch(stopLoading());
    }
  }, [id]);

  return global ? (
    <></>
  ) : (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {cardData?.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {id ? 'Edit Company' : 'Add Company'}
      </Typography>

      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        {inputData?.map(
          (data, index) =>
            !data.hidden && (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                {data.mode === 'common' ? (
                  <CustomInput
                    label={data?.label}
                    placeholder={data?.placeholder}
                    value={formValues?.current[data?.name]}
                    name={data?.name}
                    type={data?.type}
                    onChange={handleInputChange}
                    error={(formErrors && formErrors[data?.name]) || null}
                  />
                ) : data.mode === 'combobox' ? (
                  <CustomComboBox
                    {...data}
                    value={formValues.current[data?.name]}
                    onChange={handleInputChange}
                    defaultValue={
                      formValues?.current[data.name]
                        ? {
                            label:
                              formValues.current[
                                data.name === 'salesRepresentative'
                                  ? 'salesRepresentativeName'
                                  : data.name
                              ],
                            value: formValues.current[data.name],
                          }
                        : null
                    }
                    error={(formErrors && formErrors[data?.name]) || null}
                  />
                ) : (
                  <CountryCodeInput
                    label={data?.label}
                    placeholder={data?.placeholder}
                    country={data?.country}
                    initialValue={formValues?.current[data?.name]}
                    name={data?.name}
                    code={data?.code}
                    onChange={handleInputChange}
                    error={(formErrors && formErrors[data?.name]) || null}
                  />
                )}
              </Grid>
            )
        )}
      </Grid>

      <CustomButton
        sx={{ textAlign: 'end', mt: 1 }}
        name={'Submit'}
        onClick={handleSubmit}
        loading={loading}
      />
    </Box>
  );
};

export default CompanyForm;
