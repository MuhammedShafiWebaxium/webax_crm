import * as Yup from 'yup';
import { use, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Link,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import BasicDataGrid from '../../../../../../components/CustomComponents/BasicDataGrid';
import CustomInput from '../../../../../../components/CustomComponents/CustomInput';
import CheckboxLabels from '../../../../../../components/CustomComponents/CheckboxLabels';
import CustomButton from '../../../../../../components/CustomComponents/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { showAlert } from '../../../../../../redux/alertSlice';
import { handleFormError } from '../../../../../../utils/handleFormError';
import {
  activateRole,
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
} from '../../../../../../services/settingServices';
import {
  startLoading,
  stopLoading,
} from '../../../../../../redux/loadingSlice';
import {
  centeredTooltipText,
  formatDate,
  renderStatus,
} from '../../../../../../internals/data/GridData';
import { useNavigate } from 'react-router-dom';

const renderButton = (onClick, text, theme) => (
  <Link
    component="button"
    onClick={onClick}
    style={{
      textDecoration: 'none',
      color: theme.palette.mode === 'dark' ? '#4e9cff' : 'blue',
    }}
  >
    {text}
  </Link>
);

const renderPermissionCell = (params) => {
  const permissions = params.value;

  if (!permissions || typeof permissions !== 'object') {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {Object.entries(permissions)
        .filter(([_, value]) => value) // only show true permissions
        .map(([key], index) => (
          <Box key={key + index}>{renderStatus(key)}</Box>
        ))}
    </Stack>
  );
};

const initialRoleColumns = [
  {
    field: 'name',
    headerName: 'Role',
    flex: 1,
    renderCell: (params) => (
      <Box
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          width: '100%',
        }}
      >
        <Tooltip
          title={params.value}
          disableInteractive
          slots={{ transition: Zoom }}
        >
          {params.value}
        </Tooltip>
      </Box>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    renderCell: (params) => (
      <Box
      // sx={{
      //   height: '100%',
      //   display: 'flex',
      //   alignItems: 'center',
      //   overflow: 'hidden',
      // }}
      >
        {renderStatus(params.value)}
      </Box>
    ),
  },
  {
    field: 'createdBy',
    headerName: 'Created By',
    flex: 1,
    renderCell: (params) => (
      <Box
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          width: '100%',
        }}
      >
        <Tooltip
          title={params.value}
          disableInteractive
          slots={{ transition: Zoom }}
        >
          {params.value}
        </Tooltip>
      </Box>
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    flex: 1,
  },
  {
    field: 'companies',
    headerName: 'Companies',
    flex: 1,
    hidden: true,
    renderCell: renderPermissionCell,
  },
  {
    field: 'users',
    headerName: 'Users',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'leads',
    headerName: 'Leads',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'todos',
    headerName: 'Todos',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'settings',
    headerName: 'Settings',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'exports',
    headerName: 'Exports',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'filters',
    headerName: 'Filters',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'about',
    headerName: 'About',
    flex: 1,
    renderCell: renderPermissionCell,
  },
  {
    field: 'feedback',
    headerName: 'Feedback',
    flex: 1,
    renderCell: renderPermissionCell,
  },
];

const modulesPermissions = [
  {
    module: 'Users',
    actions: ['Select All', 'Create', 'Read', 'Update', 'Delete'],
  },
  {
    module: 'Leads',
    actions: [
      'Select All',
      'Create',
      'Read',
      'Update',
      'Delete',
      'Assign',
      'Followup',
    ],
  },
  {
    module: 'Todos',
    actions: ['Select All', 'Create', 'Read', 'Update', 'Delete', 'Assign'],
  },
  {
    module: 'Settings',
    actions: ['Select All', 'Create', 'Read', 'Update', 'Delete'],
  },
  {
    module: 'Filters',
    actions: ['Allowed'],
  },
  {
    module: 'Exports',
    actions: ['Allowed'],
  },
  {
    module: 'About',
    actions: ['Read'],
  },
  {
    module: 'Feedback',
    actions: ['Read'],
  },
];

const initialFormValue = {
  name: '',
  users: [],
  leads: [],
  todos: [],
  settings: [],
  filters: [],
  exports: [],
  about: [],
  feedback: [],
};

const schema = Yup.object().shape({
  name: Yup.string().required('Name is Required'),
  users: Yup.array(),
  leads: Yup.array(),
  todos: Yup.array(),
  settings: Yup.array(),
  filters: Yup.array(),
  exports: Yup.array(),
  about: Yup.array(),
  feedback: Yup.array(),
});

const RoleList = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const theme = useTheme();

  const formValues = useRef(initialFormValue);

  const [roles, setRoles] = useState([]);

  const [roleColumns, setRoleColumns] = useState(initialRoleColumns);

  const [loading, setLoading] = useState(true);

  const [permissionBtnLoading, setPermissionBtnLoading] = useState(false);

  const [switchRoleMode, setSwitchRoleMode] = useState('list');

  const [formErrors, setFormErrors] = useState(null);

  const [selectedRole, setSelectedRole] = useState(null);

  const canCreate = currentUser?.role?.permissions?.settings?.create;

  const canUpdate = currentUser?.role?.permissions?.settings?.update;

  const canDelete = currentUser?.role?.permissions?.settings?.delete;

  const canCreateCompanies = currentUser?.role?.permissions?.companies?.create;

  const handleSwitchRoleMode = () => {
    formValues.current = initialFormValue;

    setSwitchRoleMode(switchRoleMode === 'list' ? 'add' : 'list');
    setSelectedRole(null);
  };

  const handleRoleStatusChange = async (id, value) => {
    try {
      const { data } =
        value === 'Activate' ? await activateRole(id) : await deleteRole(id);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: data?.message || 'Status updated successfully.',
          })
        );

        const formattedRoles = formatRoles([data.role]);

        const updatedRoles = roles.map((entry) => {
          if (String(entry.id) === String(id)) {
            return formattedRoles[0] || {};
          }

          return entry;
        });

        setRoles(updatedRoles);
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const getTruthyKeys = (obj) => {
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  };

  const handleClickEdit = (id) => {
    const findRole = roles?.find((entry) => String(entry.id) === String(id));

    if (findRole) {
      setSelectedRole(findRole);
      formValues.current = {
        name: findRole.name || '',
        users: getTruthyKeys(findRole.users),
        leads: getTruthyKeys(findRole.leads),
        todos: getTruthyKeys(findRole.todos),
        settings: getTruthyKeys(findRole.settings),
        about: getTruthyKeys(findRole.about),
        feedback: getTruthyKeys(findRole.feedback),
        exports: getTruthyKeys(findRole.exports),
        filters: getTruthyKeys(findRole.filters),
      };
      setSwitchRoleMode('add');
    } else {
      formValues.current = initialFormValue;
      setSelectedRole(null);
    }
  };

  const handleAddNewRoleInputChange = async (event, module) => {
    const { name, value, checked, type } = event.target;

    const moduleKey = module?.toLowerCase();
    const isCheckbox = type === 'checkbox';

    const handleCheckboxLogic = () => {
      const currentPermissions = formValues.current[moduleKey] || [];

      // Case 1: "Select All" checkbox
      if (name === 'select all') {
        return checked
          ? getModuleActions(module) // If checked, add all actions
          : []; // If unchecked, clear all
      }

      // Case 2: Individual checkbox
      return checked
        ? [...new Set([...currentPermissions, name])] // Add action if checked
        : currentPermissions.filter((item) => item !== name); // Remove if unchecked
    };

    // Helper to fetch all actions for a module
    const getModuleActions = (module) => {
      const moduleEntry = modulesPermissions.find(
        (entry) => entry.module === module
      );
      return moduleEntry?.actions.map((action) => action.toLowerCase()) || [];
    };

    // Handle form updates immutably
    formValues.current = {
      ...formValues.current,
      [isCheckbox ? moduleKey : name]: isCheckbox
        ? handleCheckboxLogic()
        : value,
    };

    try {
      await Yup.reach(schema, name).validate(value);

      setFormErrors({ ...formErrors, [name]: null });
    } catch (error) {
      setFormErrors({ ...formErrors, [name]: error.message });
    }
  };

  const formatRoles = (roles) =>
    roles.map((role) => ({
      id: role?._id ?? 'N/A',
      name: role?.name ?? 'N/A',
      status: role?.active ? 'Active' : 'Inactive',
      createdBy: role?.createdBy?.name ?? 'N/A',
      createdAt: formatDate(role?.createdAt) ?? 'N/A',
      companies: canCreateCompanies ? role.permissions?.companies : [],
      users: role.permissions?.users || [],
      leads: role.permissions?.leads || [],
      todos: role.permissions?.todos || [],
      settings: role.permissions?.settings || [],
      exports: role.permissions?.exports || [],
      filters: role.permissions?.filters || [],
      about: role.permissions?.about || [],
      feedback: role.permissions?.feedback || [],
    }));

  const handleSubmitAddNewRole = async () => {
    setPermissionBtnLoading(true);
    setLoading(true);
    try {
      await schema.validate(formValues.current, { abortEarly: false });

      const { data } = selectedRole
        ? await updateRole(selectedRole.id, formValues.current)
        : await createRole(formValues.current);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `Role ${
              selectedRole ? 'Updated' : 'Created'
            } Successfully!`,
          })
        );

        formValues.current = initialFormValue;
        const formattedRoles = formatRoles(data.roles);
        setRoles(formattedRoles);

        handleSwitchRoleMode();
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, setFormErrors, dispatch, navigate);
    } finally {
      setPermissionBtnLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // dispatch(startLoading());
        const { data } = await getAllRoles();
        const formattedRoles = formatRoles(data.roles);

        setRoles(formattedRoles);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        setLoading(false);
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const dynamicColumns = [
        ...initialRoleColumns,
        {
          field: 'action',
          headerName: 'Action',
          flex: 1.4,
          renderCell: (params) => {
            const { id, status } = params.row;
            if (!canUpdate && !canDelete) return null;

            return (
              <Stack
                direction="row"
                spacing={2}
                // alignItems={'center'}
                // height={'100%'}
              >
                {canDelete &&
                  renderButton(
                    () =>
                      handleRoleStatusChange(
                        id,
                        status === 'Active' ? 'Deactivate' : 'Activate'
                      ),
                    status === 'Active' ? 'Deactivate' : 'Activate',
                    theme
                  )}
                {canUpdate &&
                  renderButton(() => handleClickEdit(id), 'Edit', theme)}
              </Stack>
            );
          },
        },
      ];

      // Now apply dynamic column visibility like companies permission
      const modified = dynamicColumns.map((col) =>
        col.field === 'companies' && canCreateCompanies
          ? { ...col, hidden: false }
          : col
      );

      setRoleColumns(modified);
    }
  }, [canUpdate, canDelete, canCreateCompanies, loading]);

  return (
    <>
      {switchRoleMode === 'list' ? (
        <BasicDataGrid
          columns={roleColumns?.filter((entry) => !entry.hidden)}
          rows={roles}
          checkbox={false}
          onCustomButtonClick={canCreate ? () => handleSwitchRoleMode() : null}
          startIcon={<AddIcon />}
          buttonLabel="Add New"
          getRowHeight={() => 'auto'}
        />
      ) : canCreate && switchRoleMode === 'add' ? (
        <Box>
          <Stack direction={'row'} alignItems={'center'} mb={2}>
            <Typography component="h2" variant="h6">
              {selectedRole ? 'Edit' : 'Add'} Role
            </Typography>
            <Button
              onClick={() => handleSwitchRoleMode()}
              startIcon={<SwapHorizIcon />}
              sx={{
                padding: '8px 12px',
                height: '2.25rem',
                fontSize: '13px',
                marginLeft: 'auto',
              }}
            >
              Switch to List
            </Button>
          </Stack>

          <Stack gap={2}>
            <Box>
              <CustomInput
                label={'Name'}
                placeholder={'Enter Role Name'}
                value={formValues.current.name}
                name={'name'}
                type={'text'}
                onChange={handleAddNewRoleInputChange}
                error={(formErrors && formErrors?.name) || null}
              />
            </Box>
            {modulesPermissions.map(({ module, actions }) => (
              <Stack key={module} direction="row" alignItems="center" gap={10}>
                <Typography
                  variant="button"
                  gutterBottom
                  mb={0}
                  sx={{ minWidth: '75px' }}
                >
                  {module}
                </Typography>
                <Stack direction="row" gap={2} alignItems="center">
                  {actions.map((action) => (
                    <CheckboxLabels
                      key={action}
                      checked={formValues.current[
                        module.toLowerCase()
                      ].includes(action.toLowerCase())}
                      label={action}
                      name={action?.toLowerCase()}
                      onChange={(e) => handleAddNewRoleInputChange(e, module)}
                    />
                  ))}
                </Stack>
              </Stack>
            ))}

            <CustomButton
              sx={{ textAlign: 'end', mt: 1 }}
              name={selectedRole ? 'Update' : 'Submit'}
              onClick={handleSubmitAddNewRole}
              loading={permissionBtnLoading}
            />
          </Stack>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
};

export default RoleList;
