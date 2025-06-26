import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, getAllUsers } from '../../services/userServices';
import { useNavigate } from 'react-router-dom';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { handleFormError } from '../../utils/handleFormError';
import { Box, Link, Stack, Typography, useTheme } from '@mui/material';
import BasicDataGrid from '../../components/CustomComponents/BasicDataGrid';
import { renderStatus } from '../../internals/data/GridData';

const UsersList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const permissions = currentUser?.role?.permissions?.users || {};

  const [users, setUsers] = useState(null);

  const handleEdit = (id) => {
    if (!permissions.update) return;
    dispatch(startLoading());
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!permissions.delete) return;

    try {
      await deleteUser(id);
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const renderButton = (onClick, text, disabled) => (
    <Link
      component={'button'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        textDecoration: 'none',
        color: disabled
          ? theme.palette.text.disabled
          : theme.palette.mode === 'dark'
          ? '#4e9cff'
          : 'blue',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {text}
    </Link>
  );

  const AllUsersColumns = [
    { field: 'name', headerName: 'User', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {permissions.update &&
            renderButton(() => handleEdit(params.row.id), 'Edit')}
          {permissions.delete &&
            renderButton(() => handleDelete(params.row.id), 'Delete')}
        </Stack>
      ),
    },
  ];

  const formatUsers = (users) =>
    users.map((user) => ({
      id: user?._id ?? 'N/A',
      name: user?.name ?? 'N/A',
      phone: user?.phone ?? 'N/A',
      email: user?.email ?? 'N/A',
      status: user?.status ?? 'N/A',
      role: user?.role?.name ?? 'N/A',
    }));

  useEffect(() => {
    const fetchData = async () => {
      if (!permissions.read) return;

      dispatch(startLoading());

      try {
        const { data } = await getAllUsers();
        setUsers(formatUsers(data.users));
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, [permissions.read]);

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      <BasicDataGrid columns={AllUsersColumns} rows={users} checkbox={false} />
    </Box>
  );
};

export default UsersList;
