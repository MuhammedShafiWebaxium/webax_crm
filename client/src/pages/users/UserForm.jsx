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
import { formatDate, genderOptions } from '../../constants';
import {
  createUser,
  getUserFormData,
  updateUser,
} from '../../services/userServices';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { handleFormError } from '../../utils/handleFormError';
import SelectMultiple from '../../components/CustomComponents/SelectMultiple';

const inputDetails = [
  {
    label: 'User Name',
    name: 'name',
    placeholder: 'Enter full name',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Company',
    name: 'company',
    placeholder: 'Select',
    mode: 'combobox',
    data: [],
    hidden: true,
  },
  {
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter designation',
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
    label: 'Date of Birth',
    name: 'dob',
    placeholder: 'Select dob',
    mode: 'common',
    type: 'date',
  },
  {
    label: 'Role',
    name: 'role',
    placeholder: 'Select',
    mode: 'combobox',
    options: [],
    hidden: true,
  },
  {
    label: 'Password',
    name: 'password',
    placeholder: 'Enter password',
    mode: 'common',
    type: 'password',
    hidden: true,
  },
];

const initialFormValue = {
  name: '',
  company: '',
  companyName: '',
  roleName: '',
  designation: '',
  phone: '',
  phoneCode: '',
  email: '',
  password: '',
  gender: '',
  dob: '',
  role: '',
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

const UserForm = () => {
  const formValues = useRef(initialFormValue);

  const navigate = useNavigate();

  const { id } = useParams();

  const dispatch = useDispatch();

  const { global } = useSelector((state) => state.loading);

  const { currentUser } = useSelector((state) => state.user);

  const [formErrors, setFormErrors] = useState(null);

  const [inputData, setInputData] = useState(inputDetails);

  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState([]);

  // Flattened permissions object
  const permissions = currentUser?.role?.permissions || {};

  // Check for permissions
  const canCreateCompanies = permissions.companies.create;
  const canCreate = permissions.users.create;
  const canUpdate = permissions.users.update;

  const schema = Yup.object().shape({
    name: Yup.string().required('Lead Name is Required'),
    company: canCreateCompanies
      ? Yup.string().required('Company is Required')
      : Yup.string().nullable(),
    designation: Yup.string().required('Designation is Required'),
    phone: Yup.string().required('Phone is Required'),
    email: Yup.string()
      .email('Invalid Email Address')
      .required('Email is Required')
      .matches(
        /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
        'Invalid Email Address Format'
      ),
    password: id
      ? Yup.string().nullable()
      : Yup.string().required('Password is Required'),
    // .matches(/[A-Z]/, 'Password Must Contain at Least One Uppercase Letter')
    // .matches(/[a-z]/, 'Password Must Contain at Least One Lowercase Letter')
    // .matches(
    //   /[@$!%*?&]/,
    //   'Password Must Contain at Least One Special Character (@$!%*?&)'
    // )
    // .matches(/[0-9]/, 'Password Must Contain at Least One Digit')
    // .min(8, 'Password Must Be at Least 8 Characters Long')
    gender: Yup.string().required('Gender is Required'),
    dob: Yup.string().required('Date of Birth is Required'),
    role: Yup.string().required('Role is Required'),
  });

  const handleInputChange = async (event, isValid) => {
    const { name, value, label } = event.target;

    formValues.current = {
      ...formValues.current,
      [name]: value,
    };

    if (name === 'company') {
      formValues.current.companyName = label;

      if (canCreateCompanies) {
        const company = companies.find(
          (company) => String(company._id) === value
        );
        const roleOptions = company?.roles?.map((role) => ({
          value: role._id,
          label: role.name,
        }));

        setInputData((prev) =>
          prev.map((entry) => {
            if (entry.name === 'role') {
              return {
                ...entry,
                data: roleOptions,
                hidden: false,
              };
            }

            return entry;
          })
        );
      }
    }

    if (name === 'role') {
      formValues.current.roleName = label;
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
        ? await updateUser(id, formValues.current)
        : await createUser(formValues.current);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `User ${id ? 'Updated' : 'Created'} Successfully!`,
          })
        );

        dispatch(startLoading());
        navigate('/users');
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const updateFormValues = (user) => {
    formValues.current = user
      ? {
          ...formValues.current,
          name: user?.name,
          company: user?.company?._id,
          companyName: user?.company?.name,
          designation: user?.designation,
          phone: user?.phone,
          phoneCode: user?.phoneCode,
          email: user?.email,
          gender: user?.gender,
          dob: formatDate(user?.dob),
          role: user?.role?._id,
          roleName: user?.role?.name,
        }
      : { ...initialFormValue };
  };

  const updateInputData = (formattedCompanies, companies) => {
    const updatedInputData = inputData.map((entry) => {
      if (entry.name === 'password' && !id) {
        return {
          ...entry,
          hidden: false,
        };
      }

      if (entry.name === 'company' && canCreateCompanies) {
        return {
          ...entry,
          data: formattedCompanies,
          hidden: false,
        };
      }

      if (entry.name === 'role' && id && canUpdate) {
        const company = companies.find(
          (entry) => String(entry._id) === formValues.current.company
        );

        const roleOptions = company.roles?.map((role) => {
          return {
            value: role?._id,
            label: role?.name,
          };
        });

        return {
          ...entry,
          data: roleOptions,
          hidden: false,
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
        const { data } = await getUserFormData(id);

        const formattedCompanies =
          data?.companies?.map((company) => {
            return {
              value: company?._id,
              label: company?.name,
            };
          }) || [];

        updateFormValues(data.user);
        updateInputData(formattedCompanies, data?.companies);
        setCompanies(data?.companies);
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
        {id ? 'Edit User' : 'Add User'}
      </Typography>

      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        {inputData?.map(
          (data, index) =>
            !data?.hidden && (
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
                                data.name === 'company'
                                  ? 'companyName'
                                  : data.name === 'role'
                                  ? 'roleName'
                                  : data.name
                              ],
                            value: formValues.current[data.name],
                          }
                        : null
                    }
                    error={(formErrors && formErrors[data?.name]) || null}
                  />
                ) : data.mode === 'multi-combobox' ? (
                  <SelectMultiple
                    {...data}
                    defaultValue={id ? formValues.current[data?.name] : []}
                    onChange={handleInputChange}
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

export default UserForm;
