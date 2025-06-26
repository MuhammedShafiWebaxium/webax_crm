import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import { handleFormError } from '../../utils/handleFormError';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { followupLead, getLead } from '../../services/leadServices';
import { Box, Divider, Stack, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { eligibilityOptions, genderOptions } from '../../constants';
import CustomInput from '../../components/customComponents/CustomInput';
import CustomComboBox from '../../components/customComponents/CustomComboBox';
import CountryCodeInput from '../../components/customComponents/CountryCodeInput';
import CustomButton from '../../components/customComponents/CustomButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { showAlert } from '../../redux/alertSlice';
import CustomTextarea from '../../components/customComponents/CustomTextArea';

const statusInputHelper = (
  <Stack direction="row" alignItems="center">
    Status
    <Tooltip
      title=<>
        • <b>Invalid Number:</b> The phone number is incorrect or not in
        service. <br />• <b>No Response:</b> Multiple attempts made, but no
        reply from the lead. <br />• <b>Wrong Contact:</b> The number belongs to
        someone else, not the intended lead. <br />• <b>Lost:</b> Lead decided
        not to proceed or chose a competitor. <br />• <b>Re-engaging:</b> Trying
        to revive a lost or inactive lead.
      </>
    >
      <HelpOutlineIcon sx={{ height: '16px' }} />
    </Tooltip>
  </Stack>
);

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
    label: 'Eligibility',
    name: 'eligibility',
    placeholder: 'Select',
    mode: 'combobox',
    data: eligibilityOptions,
  },
  {
    label: statusInputHelper,
    name: 'status',
    placeholder: 'Select',
    mode: 'combobox',
    data: [],
  },
  {
    label: 'Next Followup',
    name: 'nextFollowupDate',
    mode: 'common',
    type: 'datetime-local',
  },
];

const exCludeFollowupDate = [
  'Invalid Number',
  'Wrong Contact',
  'Not Interested',
  'Converted',
];

const followupDateNotMandatory = ['No Response', 'Lost'];

const initialFormValue = {
  name: '',
  phone: '',
  phoneCode: '',
  alternativeNumber: '',
  alternativePhoneCode: '',
  email: '',
  gender: '',
  leadSource: '',
  eligibility: '',
  status: '',
  nextFollowupDate: '',
  notes: '',
};

const LeadFollowup = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { global } = useSelector((state) => state.loading);

  const formValues = useRef(initialFormValue);

  const [inputData, setInputData] = useState(inputDetails);

  const [formErrors, setFormErrors] = useState(null);

  const [loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    name: Yup.string().required('Lead Name is Required'),
    phone: Yup.string().required('Phone is Required'),
    alternativeNumber: Yup.string(),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .matches(
        /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
        'Invalid email address format'
      ),
    gender: Yup.string().required('Gender is Required'),
    leadSource: Yup.string().required('Source is Required'),
    eligibility: Yup.string().required('Eligibility is Required'),
    status: Yup.string().required('Status is Required'),
    nextFollowupDate:
      exCludeFollowupDate.includes(formValues.current.status) ||
      followupDateNotMandatory.includes(formValues.current.status)
        ? Yup.string()
        : Yup.string().required('Next Followup is Required'),
    notes: Yup.string().required('Notes is Required'),
  });

  const handleInputChange = async (event, isValid) => {
    const { name, value } = event.target;

    formValues.current = {
      ...formValues.current,
      [name]: value,
    };

    if (name === 'status') {
      updateInputData(value);
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

      const { followup, ...rest } = formValues.current;

      const { data } = await followupLead(id, rest);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `Lead ${id ? 'Updated' : 'Created'} Successfully!`,
          })
        );

        updateFormValues(data?.lead);
        updateInputData(data?.lead?.status);
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
          ...initialFormValue,
          name: lead?.name,
          phone: lead?.phone,
          phoneCode: lead?.phoneCode,
          alternativeNumber: lead?.alternativeNumber,
          alternativePhoneCode: lead?.alternativePhoneCode,
          email: lead?.email,
          gender: lead?.gender,
          leadSource: lead?.leadSource.source,
          status: lead?.status,
          eligibility: lead?.eligibility,
          followup: lead?.followup,
        }
      : { ...initialFormValue };
  };

  const updateInputData = (status, settings) => {
    let sourceListOptions,
      statusListOptions = null;

    if (settings) {
      sourceListOptions = settings?.lead?.source?.map((entry) => ({
        label: entry,
        value: entry,
      }));

      statusListOptions = settings?.lead?.status?.map((entry) => ({
        label: entry,
        value: entry,
      }));
    }

    const updatedInputData = inputData?.map((entry) => {
      if (entry.name === 'nextFollowupDate') {
        if (exCludeFollowupDate.includes(status)) {
          formValues.current.nextFollowupDate = '';
        }

        return {
          ...entry,
          hidden: exCludeFollowupDate.includes(status) ? true : false,
        };
      }

      if (entry.name === 'leadSource' && settings) {
        return {
          ...entry,
          data: sourceListOptions,
        };
      }

      if (entry.name === 'status' && settings) {
        return {
          ...entry,
          data: statusListOptions,
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

        const { data } = await getLead(id);

        updateFormValues(data?.lead);
        updateInputData(data?.lead?.status, data?.settings);
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
        Followup Lead
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextarea
            label="Notes"
            placeholder="Add any additional details..."
            rows="3"
            name="notes"
            value={formValues?.current?.notes}
            onChange={handleInputChange}
            error={(formErrors && formErrors.notes) || null}
          />
        </Grid>
      </Grid>

      <CustomButton
        sx={{ textAlign: 'end', my: 2 }}
        name={'Submit'}
        onClick={handleSubmit}
        loading={loading}
      />

      <Divider textAlign="center">Previous Followups</Divider>

      <Stack flex={1} id="log" mt={2}>
        {formValues?.current.followup?.length > 0 ? (
          [...formValues?.current.followup].reverse().map((remark, index) => (
            <Box key={index} mb={2}>
              <Typography variant="body1">
                <strong>Status:</strong> {remark?.status}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong>{' '}
                {new Date(remark?.date).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body1">
                <strong>Next Followup Date:</strong>{' '}
                {new Date(remark?.nextFollowupDate).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body1">
                <strong>Message:</strong> {remark?.notes}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography align="center">Empty</Typography>
        )}
      </Stack>
    </Box>
  );
};

export default LeadFollowup;
