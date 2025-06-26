import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import { useNavigate } from 'react-router-dom';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { handleFormError } from '../../utils/handleFormError';
import { deleteLead, getAllLeads } from '../../services/leadServices';
import BasicDataGrid from '../../components/CustomComponents/BasicDataGrid';
import { renderStatus } from '../../internals/data/GridData';
import { Box, Typography, useTheme, Link, Stack } from '@mui/material';

const LeadsList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);

  const [leads, setLeads] = useState(null);

  // Permission flags (adjust keys as per your permissions structure)
  const canUpdate = currentUser?.role?.permissions?.leads?.update;
  const canDelete = currentUser?.role?.permissions?.leads?.delete;
  const canFollowup = currentUser?.role?.permissions?.leads?.followup;

  const handleEdit = (id) => {
    dispatch(startLoading());
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    await deleteLead(id);
    setLeads((prevLeads) =>
      prevLeads.filter((lead) => lead?.id?.toString() !== id)
    );
  };

  const renderAction = (baseLink, text) => (
    <Link
      href={`${baseLink}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.mode === 'dark' ? '#4e9cff' : 'blue',
      }}
    >
      {text}
    </Link>
  );

  const renderButton = (onClick, text) => (
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

  const AllLeadsColumns = [
    { field: 'name', headerName: 'Student', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    { field: 'source', headerName: 'Source', flex: 1 },
    { field: 'stage', headerName: 'Stage', flex: 1 },
    { field: 'createdBy', headerName: 'Created By', flex: 1 },
    { field: 'note', headerName: 'Initial Remarks', flex: 1 },
    { field: 'counselorNote', headerName: 'Last Followup Remarks', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {canFollowup &&
            renderAction(`/leads/${params.row.id}/followup`, 'Followup')}
          {canUpdate && renderButton(() => handleEdit(params.row.id), 'Edit')}
          {canDelete &&
            renderButton(() => handleDelete(params.row.id), 'Delete')}
        </Stack>
      ),
    },
  ];

  const formatLeads = (leads) =>
    leads.map((lead) => ({
      id: lead?._id ?? 'N/A',
      name: lead?.name ?? 'N/A',
      phone: lead?.phone ?? 'N/A',
      email: lead?.email ?? 'N/A',
      status: lead?.status ?? 'N/A',
      source: lead?.leadSource?.source ?? 'N/A',
      stage: lead?.stage ?? 'N/A',
      createdBy: lead?.createdBy?.name ?? 'N/A',
      note: lead?.initialNote ?? 'N/A',
      counselorNote:
        lead?.followup?.[lead?.followup?.length - 1]?.notes ?? 'N/A',
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(startLoading());
        const { data } = await getAllLeads();
        const formattedLeads = formatLeads(data.leads);
        setLeads(formattedLeads);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      <BasicDataGrid columns={AllLeadsColumns} rows={leads} checkbox={false} />
    </Box>
  );
};

export default LeadsList;
