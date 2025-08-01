import { useEffect, useState } from 'react';
import { handleFormError } from '../../utils/handleFormError';
import { stopLoading } from '../../redux/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from '../../components/CustomComponents/CustomDialog';
import CreateTodo from '../../components/CreateTodo';
import {
  deleteTodo,
  getTodosDashboardData,
  markTodoCompleted,
} from '../../services/todosServices';
import { setUsers } from '../../redux/companySlice';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { setTodos } from '../../redux/todoSlice';
import { Chip, Link, Stack, Typography, useTheme } from '@mui/material';
import BasicDataGrid from '../../components/CustomComponents/BasicDataGrid';
import { useNavigate } from 'react-router-dom';
import CustomizedAccordions from '../../components/CustomComponents/CustomizedAccordions';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { renderStatus as renderChip } from '../../internals/data/GridData';

const displayDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd-MM-yyyy');
};

const TodosList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);
  const { todos } = useSelector((state) => state.todo);

  const [selectedTodo, setSelectedTodo] = useState(null);
  const [open, setOpen] = useState(false);

  const [activeTodos, setActiveTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);

  // Flattened permissions object (e.g. { 'todos.read': true, 'todos.create': true, ... })
  const permissions = currentUser?.role?.permissions || {};

  // Check for permissions
  const canRead = permissions.todos.read;
  const canCreate = permissions.todos.create;
  const canUpdate = permissions.todos.update;
  const canDelete = permissions.todos.delete;
  const canAssign = permissions.todos.assign;

  const handleClickOpen = () => {
    setSelectedTodo(null);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedTodo(null);
    setOpen(false);
  };

  const handleDelete = async (id) => {
    if (!canDelete) return; // block if no permission
    try {
      const { data } = await deleteTodo(id);
      if (data.status) {
        const updatedTodos = todos.filter(
          (todo) => todo?.id?.toString() !== id
        );
        dispatch(setTodos(formatTodos(updatedTodos)));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleComplete = async (id) => {
    if (!canUpdate) return; // treat complete as update permission required

    try {
      const { data } = await markTodoCompleted(id);

      if (data.status) {
        const updatedTodos = todos.map((todo) => {
          if (String(todo?.id) === String(id)) {
            return {
              ...todo,
              status: data?.todo?.status,
            };
          }
          return todo;
        });

        const formattedTodos = formatTodos(updatedTodos);
        dispatch(setTodos(formattedTodos));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleClickEdit = (id) => {
    if (!canUpdate) return; // block if no update permission
    const todo = todos.find((entry) => String(entry?.id) === String(id));

    setSelectedTodo(todo);
    setOpen(true);
  };

  const renderButton = (onClick, text, disabled = false) => {
    return (
      <Link
        component={'button'}
        onClick={onClick}
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
  };

  const renderStatus = (status) => {
    return (
      <Stack direction={'row'} alignItems={'center'} height={'100%'} gap={0.5}>
        <Typography variant="body2" gutterBottom mb={0}>
          {status}
        </Typography>
        {status === 'Active' ? (
          <RocketLaunchIcon fontSize="small" sx={{ color: 'blue' }} />
        ) : status === 'Pending' ? (
          <AddAlarmIcon fontSize="small" sx={{ color: 'blue' }} />
        ) : (
          <CheckBoxIcon fontSize="small" sx={{ color: 'green' }} />
        )}
      </Stack>
    );
  };

  const AllTodosColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      renderCell: (params) => renderChip(params.row.priority),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => renderStatus(params.row.status),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {canUpdate &&
            renderButton(() => handleClickEdit(params.row.id), 'Edit')}
          {canDelete &&
            renderButton(() => handleDelete(params.row.id), 'Delete')}
          {canRead &&
            renderButton(() => handleComplete(params.row.id), 'Complete')}
        </Stack>
      ),
    },
  ];

  const formatTodos = (todos) => {
    return todos.map((todo) => {
      const isPending = new Date(todo?.endDate) < new Date();
      const status =
        todo?.status !== 'Completed' && isPending
          ? 'Pending'
          : todo?.status ?? 'N/A';

      return {
        id: todo?._id || todo?.id,
        name: todo?.name ?? 'N/A',
        type: todo?.type ?? 'N/A',
        description: todo?.description ?? 'N/A',
        startDate: todo?.startDate ?? 'N/A',
        endDate: todo?.endDate ?? 'N/A',
        assignTo: todo?.assignedTo ?? 'N/A',
        checklist: todo?.checklist ?? 'N/A',
        isTeamTask: todo?.isTeamTask ?? 'N/A',
        teamName: todo?.teamName ?? 'N/A',
        createdBy: todo?.createdBy?.name ?? 'N/A',
        date: displayDate(todo?.endDate) ?? 'N/A',
        priority: todo?.priority ?? 'N/A',
        status,
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getTodosDashboardData();

        if (data.users) {
          dispatch(setUsers(data.users));
        }

        const formattedTodos = formatTodos(data?.todos);

        dispatch(setTodos(formattedTodos || []));
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (todos?.length) {
      const activeTodos = todos?.filter(
        (entry) => entry.status !== 'Completed'
      );
      const completedTodos = todos?.filter(
        (entry) => entry.status == 'Completed'
      );

      setActiveTodos(activeTodos);
      setCompletedTodos(completedTodos);
    }
  }, [todos]);

  return (
    <>
      <Stack direction={'row'} alignItems={'center'} mb={2} spacing={2}>
        <CustomDialog
          open={open}
          handleClose={handleClose}
          title={selectedTodo ? 'Edit Task' : 'Add New Task'}
          content={
            <CreateTodo
              handleClose={handleClose}
              selectedTodo={selectedTodo}
              open={open}
              canCreate={canCreate}
              formatTodos={formatTodos}
            />
          }
        />
        <Typography component="h2" variant="h6">
          Todos
        </Typography>

        {canCreate && renderButton(handleClickOpen, 'Add Todo')}
      </Stack>

      <CustomizedAccordions
        panelData={[
          {
            title: (
              <Stack direction="row" spacing={1} alignItems={'center'}>
                <Typography variant="subtitle2" gutterBottom>
                  Active Tasks
                </Typography>
                <Chip label={activeTodos?.length} />
              </Stack>
            ),
            content: (
              <BasicDataGrid
                columns={AllTodosColumns}
                rows={activeTodos}
                checkbox={false}
              />
            ),
          },
          {
            title: (
              <Stack direction="row" spacing={1} alignItems={'center'}>
                <Typography variant="subtitle2" gutterBottom>
                  Completed Tasks
                </Typography>
                <Chip label={completedTodos?.length} />
              </Stack>
            ),
            content: (
              <BasicDataGrid
                columns={AllTodosColumns?.filter(
                  (entry) => entry?.headerName !== 'Action'
                )}
                rows={completedTodos}
                checkbox={false}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default TodosList;
