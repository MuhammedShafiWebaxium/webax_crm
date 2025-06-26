import * as Yup from 'yup';
import { Box, Typography } from '@mui/material';
import StatCard from '../../components/StatCard';
import Grid from '@mui/material/Grid2';
import CustomInput from '../../components/CustomComponents/CustomInput';
import CustomComboBox from '../../components/CustomComponents/CustomComboBox';
import CustomButton from '../../components/CustomComponents/CustomButton';
import { useNavigate, useParams } from 'react-router-dom';
import CountryCodeInput from '../../components/CustomComponents/CountryCodeInput';
import { useEffect, useRef, useState } from 'react';
import { showAlert } from '../../redux/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { genderOptions } from '../../constants';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { handleFormError } from '../../utils/handleFormError';
import CustomTextarea from '../../components/CustomComponents/CustomTextArea';
import {
  createLead,
  getLeadFormData,
  updateLead,
} from '../../services/leadServices';

const initialFormValue = {
  name: '',
  phone: '',
  phoneCode: '',
  alternativeNumber: '',
  alternativePhoneCode: '',
  email: '',
  gender: '',
  leadSource: '',
  salesRepresentative: '',
  salesRepresentativeName: '',
  initialNote: '',
};

const cardData = [
  {
    title: 'Leads',
    value: '15K',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
    days: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30,
    ],
    trendValue: '+25%',
  },
];

const inputDetails = [
  {
    label: 'Lead Name',
    name: 'name',
    placeholder: 'Enter full name',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Phone',
    name: 'phone',
    code: 'phoneCode',
    placeholder: 'e.g., +91 9876543210',
    mode: 'phone',
    country: 'in',
  },
  {
    label: 'Alternative Phone',
    name: 'alternativeNumber',
    code: 'alternativePhoneCode',
    placeholder: 'e.g., +91 9876543210',
    mode: 'phone',
    country: 'in',
  },
  {
    label: 'Email',
    name: 'email',
    placeholder: 'e.g., example@domain.com',
    mode: 'common',
    type: 'email',
  },
  {
    label: 'Gender',
    name: 'gender',
    placeholder: 'Select',
    mode: 'combobox',
    data: genderOptions,
  },
  {
    label: 'Source',
    name: 'leadSource',
    placeholder: 'Unknown',
    mode: 'combobox',
    data: [],
  },
  {
    label: 'Sales Representative',
    name: 'salesRepresentative',
    placeholder: 'Select',
    mode: 'combobox',
    data: [],
    hidden: true,
  },
];

const textareaData = [
  {
    label: 'Notes',
    placeholder: 'Add any additional details...',
    rows: 3,
    name: 'initialNote',
  },
];

const LeadForm = () => {
  const formValues = useRef(initialFormValue);

  const navigate = useNavigate();

  const { id } = useParams();

  const dispatch = useDispatch();

  const { global } = useSelector((state) => state.loading);

  const { currentUser } = useSelector((state) => state.user);

  const [inputData, setInputData] = useState(inputDetails);

  const [formErrors, setFormErrors] = useState(null);

  const [loading, setLoading] = useState(false);

  const canAssign = currentUser?.role?.permissions?.leads?.assign;

  const schema = Yup.object().shape({
    name: Yup.string().required('Lead Name is Required'),
    phone: Yup.string().required('Phone is Required'),
    phoneCode: Yup.string().trim().required('Phone Code is Required'),
    alternativeNumber: Yup.string(),
    email: Yup.string()
      .email('Invalid Email Address')
      .required('Email is required')
      .matches(
        /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
        'Invalid Email Address Format'
      ),
    gender: Yup.string().required('Gender is Required'),
    leadSource: Yup.string().required('Source is Required'),
    initialNote: Yup.string().required('Notes is Required'),
    salesRepresentative: canAssign
      ? Yup.string().required('Sales Representative is Required')
      : Yup.string().nullable(),
  });

  const handleInputChange = async (event, isValid) => {
    const { name, value, label } = event.target;

    formValues.current = {
      ...formValues.current,
      [name]: value,
    };

    if (name === 'salesRepresentative') {
      formValues.current.salesRepresentativeName = label;
    }

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
        ? await updateLead(id, formValues.current)
        : await createLead(formValues.current);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `Lead ${id ? 'Updated' : 'Created'} Successfully!`,
          })
        );

        dispatch(startLoading());
        navigate('/leads');
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const updateFormValues = (lead) => {
    formValues.current = lead
      ? {
          ...formValues.current,
          name: lead?.name,
          phone: lead?.phone,
          phoneCode: lead?.phoneCode,
          alternativeNumber: lead?.alternativeNumber,
          alternativePhoneCode: lead?.alternativePhoneCode,
          email: lead?.email,
          gender: lead?.gender,
          leadSource: lead?.leadSource.source,
          salesRepresentative: lead?.assigned?.staff?._id,
          salesRepresentativeName: lead?.assigned?.staff?.name,
          initialNote: lead?.initialNote,
        }
      : { ...initialFormValue };
  };

  const updateInputData = (users, settings) => {
    const sourceListOptions = settings.lead.source.map((entry) => ({
      label: entry,
      value: entry,
    }));

    const updatedInputData = inputData.map((entry) => {
      if (entry.name === 'salesRepresentative' && users) {
        return {
          ...entry,
          data: users,
          hidden: false,
        };
      }

      if (entry.name === 'leadSource') {
        return {
          ...entry,
          data: sourceListOptions,
        };
      }

      return entry;
    });

    setInputData(updatedInputData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!global) {
          dispatch(startLoading());
        }

        const { data } = await getLeadFormData(id);

        if (canAssign) {
          const formattedUsers = data?.users?.map((user) => {
            return {
              value: user?._id,
              label: user?.name,
            };
          });

          if (id && data?.lead?.assigned?.staff) {
            if (
              !formattedUsers?.find(
                (user) =>
                  String(user.value) ===
                  String(data?.lead?.assigned?.staff?._id)
              )
            ) {
              formattedUsers.push({
                value: data?.lead?.assigned?.staff?._id,
                label: data?.lead?.assigned?.staff?.name,
              });
            }
          }

          updateInputData(formattedUsers, data.settings);
        } else {
          updateInputData(null, data.settings);
        }

        updateFormValues(data.lead);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
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
        {id ? 'Edit Lead' : 'Add Lead'}
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

      <Grid container spacing={2} columns={12}>
        {textareaData?.map((data, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <CustomTextarea
              label={data?.label}
              placeholder={data?.placeholder}
              rows={data?.rows}
              name={data?.name}
              value={formValues?.current[data?.name]}
              onChange={handleInputChange}
              error={(formErrors && formErrors[data?.name]) || null}
            />
          </Grid>
        ))}
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

export default LeadForm;
