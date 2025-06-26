import * as Yup from 'yup';
import Grid from '@mui/material/Grid2';
import { useEffect, useRef, useState } from 'react';
import CustomInput from './customComponents/CustomInput';
import CustomComboBox from './customComponents/CustomComboBox';
import { formatDateTime, todoPriorityOptions } from '../constants';
import { Box, Button, Checkbox, FormControlLabel, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { createTodo, updateTodo } from '../services/todosServices';
import { handleFormError } from '../utils/handleFormError';
import { setTodos } from '../redux/todoSlice';
import CustomTextarea from './customComponents/CustomTextArea';
import { showAlert } from '../redux/alertSlice';
import { useNavigate } from 'react-router-dom';

const inputDetails = [
  {
    label: 'Name',
    name: 'name',
    placeholder: 'Type',
    mode: 'common',
    type: 'text',
  },
  {
    label: 'Team Name',
    name: 'teamName',
    placeholder: 'Type',
    mode: 'common',
    type: 'text',
    hidden: true,
  },
  {
    label: 'Priority',
    name: 'priority',
    placeholder: 'Select',
    mode: 'combobox',
    data: todoPriorityOptions,
  },
  {
    label: 'Start Date',
    name: 'startDate',
    mode: 'common',
    type: 'datetime-local',
  },
  {
    label: 'End Date',
    name: 'endDate',
    mode: 'common',
    type: 'datetime-local',
  },
  {
    label: 'Description',
    name: 'description',
    mode: 'textarea',
    placeholder: 'Type...',
  },
];

const initialFormValue = {
  name: '',
  teamName: '',
  description: '',
  startDate: '',
  endDate: '',
  priority: '',
  priorityDefault: null,
  assignToInputValue: '',
  assignTo: [],
  discard: false,
};

const CreateTodo = ({
  handleClose,
  selectedTodo,
  open,
  canCreate,
  formatTodos,
}) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const formValues = useRef({ ...initialFormValue });

  const { users } = useSelector((state) => state.company);

  const { todos } = useSelector((state) => state.todo);

  const [inputData, setInputData] = useState([...inputDetails]);

  const [formErrors, setFormErrors] = useState(null);

  const [checklist, setChecklist] = useState([]);

  const [unAssign, setUnassign] = useState([]);

  const [selected, setSelected] = useState('Self');

  const [loadings, setLoadings] = useState(true);

  const [loading, setLoading] = useState(false);

  const today = selectedTodo ? new Date(selectedTodo.startDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const schema = Yup.object().shape({
    name: Yup.string().required('Name is Required'),
    teamName:
      formValues?.current?.assignTo?.length > 1
        ? Yup.string().required('Team Name is Required')
        : Yup.string(),
    priority: Yup.string().required('Priority is Required'),
    description: Yup.string().required('Description is Required'),
    startDate: Yup.date()
      .required('Start Date is Required')
      .typeError('Start Date is Required')
      .min(today, 'Start Date cannot be before today'),
    endDate: Yup.date()
      .required('End Date is Required')
      .typeError('End Date is Required')
      .test(
        'is-after-startDate',
        'End Date must be after Start Date',
        function (endDate) {
          const startDate = this.resolve(Yup.ref('startDate'));
          return startDate && endDate
            ? endDate.getTime() > startDate.getTime()
            : true;
        }
      ),
    assignTo:
      selected === 'Assigned'
        ? Yup.array().min(1, 'Assign To is Required')
        : Yup.array(),
  });

  const formatUsers = () => {
    return (
      users?.map((entry) => ({ label: entry?.name, value: entry?._id })) || []
    );
  };

  const handleChangeType = (type) => {
    formValues.current.assignTo = [];
    setSelected(type);
    setUnassign(formatUsers);
  };

  const handleClickDiscard = () => {
    formValues.current = { ...initialFormValue };
    formValues.current.assignTo = [];
    // formValues.current.discard = true;

    setInputData([...inputDetails]);
    setChecklist([]);
    setUnassign(formatUsers);

    if (selected !== 'Self') setSelected('Self');

    handleClose();
  };

  const handleNewChecklist = () => {
    setChecklist((prev) => {
      let uniqueId;
      do {
        uniqueId = Math.floor(Math.random() * 10000);
      } while (prev.some((item) => item.id === uniqueId));

      return [{ id: uniqueId, value: '' }, ...prev];
    });
  };

  const handleDeleteChecklist = (id) => {
    setChecklist((prev) => prev.filter((list) => list.id !== id));
  };

  const handleChecklistInputChange = ({ target }, id) => {
    setChecklist((prev) =>
      prev.map((list) =>
        list.id === id ? { ...list, value: target.value } : list
      )
    );
  };

  const handleAssignToInputChange = ({ target }) => {
    formValues.current.assignTo.push({
      label: target?.label,
      value: target?.value,
    });

    formValues.current.assignToInputValue = '';

    if (formValues.current.assignTo.length > 1) {
      setInputData((prev) =>
        prev.map((entry) => {
          if (entry.name === 'teamName') {
            return {
              ...entry,
              hidden: false,
            };
          }

          return entry;
        })
      );
    }

    setUnassign((prev) => prev.filter((user) => user.value !== target.value));
  };

  const handleDeleteAssignTo = (id) => {
    let user = null;

    formValues.current.assignTo = formValues.current.assignTo.filter((list) => {
      if (list.value === id) {
        user = list;

        return false;
      }

      return true;
    });

    if (formValues.current.assignTo.length === 1) {
      formValues.current.teamName = '';

      setInputData((prev) =>
        prev.map((entry) => {
          if (entry.name === 'teamName') {
            return {
              ...entry,
              hidden: true,
            };
          }

          return entry;
        })
      );
    }

    setUnassign((prev) => [user, ...prev]);
  };

  const handleInputChange = async (event, isValid) => {
    const { name, value } = event.target;

    formValues.current = {
      ...formValues.current,
      discard: false,
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

      const { assignToInputValue, discard, priorityDefault, ...rest } =
        formValues.current;

      const formData = { ...rest, checklist, type: selected };

      const { data } = selectedTodo
        ? await updateTodo(selectedTodo?.id, formData)
        : await createTodo(formData);

      let updatedTodos = null;

      const formattedTodo = formatTodos([data?.todo]);

      if (selectedTodo) {
        updatedTodos = todos?.map((entry) => {
          if (String(entry?.id) === String(selectedTodo.id)) {
            return {
              ...formattedTodo[0],
              id: entry?.id,
            };
          }

          return entry;
        });
      } else {
        updatedTodos = [...(todos || []), formattedTodo[0]];
      }

      dispatch(setTodos(updatedTodos));

      handleClickDiscard();

      dispatch(
        showAlert({
          type: 'success',
          message: `Task ${
            selectedTodo ? 'Updated' : 'Created'
          }  Successfully!`,
        })
      );
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormValues = () => {
    formValues.current = {
      ...formValues.current,
      name: selectedTodo?.name,
      teamName: selectedTodo?.teamName,
      description: selectedTodo?.description,
      startDate: formatDateTime(selectedTodo?.startDate),
      endDate: formatDateTime(selectedTodo?.endDate),
      priority: selectedTodo?.priority,
      priorityDefault: {
        label: selectedTodo?.priority,
        value: selectedTodo?.priority,
      },
      assignTo: selectedTodo?.assignedTo?.map((entry) => ({
        label: entry?.name,
        value: entry?._id,
      })),
    };

    setSelected(selectedTodo.type);

    const newCheckList = selectedTodo.checklist.map((entry, index) => {
      return {
        value: entry?.title,
        id: index * Date.now(),
      };
    });

    setChecklist(newCheckList);
  };

  useEffect(() => {
    if (selectedTodo) {
      handleUpdateFormValues();

      if (users) {
        const updatedUsers = users.filter(
          (entry) =>
            !selectedTodo.assignedTo?.some((list) => list._id === entry._id)
        );

        setUnassign(updatedUsers);
      }
      setLoadings(false);
    } else {
      if (users) {
        setUnassign(formatUsers());
      }
      formValues.current = { ...initialFormValue };

      setSelected('Self');
      setChecklist([]);
      setLoadings(false);
    }
  }, [selectedTodo, users]);

  useEffect(() => {
    if (!open) {
      handleClickDiscard();
    }
  }, [open]);

  return (
    <>
      {canCreate && (
        <Box>
          <Box component="label">Type</Box>
          <Stack direction={'row'}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected === 'Self'}
                  onChange={() => handleChangeType('Self')}
                  sx={{ p: 0 }}
                />
              }
              label="Self"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected === 'Assigned'}
                  onChange={() => handleChangeType('Assigned')}
                  sx={{ p: 0 }}
                />
              }
              label="Assigned"
            />
          </Stack>
        </Box>
      )}

      {!loadings && (
        <>
          <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
            {inputData?.map(
              (data, index) =>
                !data.hidden && (
                  <Grid
                    key={index}
                    size={
                      data.mode === 'textarea' ? { xs: 12 } : { xs: 12, sm: 6 }
                    }
                  >
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
                    ) : data.mode === 'textarea' ? (
                      <CustomTextarea
                        name={data.name}
                        label={data.label}
                        value={formValues?.current[data?.name]}
                        placeholder={data.placeholder}
                        onChange={handleInputChange}
                        error={(formErrors && formErrors[data?.name]) || null}
                        rows={2}
                      />
                    ) : (
                      <CustomComboBox
                        {...data}
                        onChange={handleInputChange}
                        // clearValue={formValues.current.discard}
                        defaultValue={
                          data?.name === 'priority' &&
                          formValues.current.priorityDefault
                            ? formValues.current.priorityDefault
                            : null
                        }
                        error={(formErrors && formErrors[data?.name]) || null}
                      />
                    )}
                  </Grid>
                )
            )}
          </Grid>

          <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <Box component="label">Checklist</Box>
                  <IconButton
                    size="small"
                    sx={{
                      p: 0.8,
                      height: 'auto',
                      width: 'auto',
                      borderRadius: '50%',
                    }}
                    onClick={handleNewChecklist}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {checklist &&
                  checklist?.length > 0 &&
                  checklist.map((entry) => (
                    <Stack
                      direction={'row'}
                      alignItems={'center'}
                      spacing={1}
                      key={entry.id}
                    >
                      <Box width={'100%'}>
                        <CustomInput
                          name="checklist"
                          type="text"
                          onChange={(e) =>
                            handleChecklistInputChange(e, entry.id)
                          }
                          value={entry?.value}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        sx={{
                          p: 0.8,
                          height: 'auto',
                          width: 'auto',
                          borderRadius: '50%',
                        }}
                        onClick={() => handleDeleteChecklist(entry.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
              </Stack>
            </Grid>
            {selected === 'Assigned' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Box component="label" sx={{ minHeight: '31px' }}>
                    {(formErrors && formErrors?.assignTo) || 'Assign To'}
                  </Box>
                  <Box width={'100%'}>
                    <CustomComboBox
                      data={unAssign}
                      onChange={handleAssignToInputChange}
                      placeholder={'Select'}
                      clearValue={formValues.current.assignToInputValue === ''}
                      error={(formErrors && formErrors?.assignTo) || null}
                    />
                  </Box>

                  {formValues?.current?.assignTo?.map((entry, index) => (
                    <Stack
                      direction={'row'}
                      alignItems={'center'}
                      spacing={1}
                      key={index}
                    >
                      <Box width={'100%'}>
                        <CustomInput
                          name="assignTo"
                          type="text"
                          value={entry.label}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        sx={{
                          p: 0.8,
                          height: 'auto',
                          width: 'auto',
                          borderRadius: '50%',
                        }}
                        onClick={() => handleDeleteAssignTo(entry.value)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>

          <Box textAlign={'end'}>
            <Button onClick={handleClickDiscard}>Discard</Button>
            <Button loading={loading} onClick={handleSubmit}>
              {selectedTodo ? 'Update' : 'Add'}
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default CreateTodo;
