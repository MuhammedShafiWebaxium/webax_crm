import { Box, Link, Stack, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FacebookIcon from '@mui/icons-material/Facebook';
import HighlightedCard from '../../../../components/HighlightedCard';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatCard from '../../../../components/StatCard';
import BasicDataGrid from '../../../../components/CustomComponents/BasicDataGrid';
import { formatDate, renderStatus } from '../../../../internals/data/GridData';
import {
  activateAdAccount,
  deleteAdAccount,
  getAllIntegrations,
} from '../../../../services/settingServices';
import { handleFormError } from '../../../../utils/handleFormError';
import { showAlert } from '../../../../redux/alertSlice';

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

const initialCardData = [
  {
    title: 'Connect Facebook Leads',
    buttonName: 'Start Setup',
    description:
      'Set up Facebook API to start receiving leads directly from your ad campaigns.',
    hidden: false,
  },
  {
    title: 'Conversion API',
    buttonName: 'Start Setup',
    description:
      'Set up Facebook API to start receiving leads directly from your ad campaigns.',
    hidden: false,
  },
];

const initialColumns = [
  { field: 'platform', headerName: 'Platform', flex: 1 },
  { field: 'accountName', headerName: 'Account Name', flex: 1 },
  { field: 'createdBy', headerName: 'Created By', flex: 1 },
  { field: 'createdAt', headerName: 'Created At', flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    renderCell: (params) => renderStatus(params.value),
  },
  { field: 'accessToken', headerName: 'Access Token', flex: 1 },
];

const NumberFormatter = (number) => number.toLocaleString();

const getType = (number) => {
  return number === 0 ? 'neutral' : number > 0 ? 'up' : 'down';
};

const percentageFormatter = (number) => {
  return number > 0 ? `+${number}%` : `${number}%`;
};

const IntegrationsSetting = () => {
  const theme = useTheme();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [highlightCardData, setHighlightCardData] = useState(initialCardData);

  const [cardData, setCardData] = useState([]);

  const [adAccounts, setAdAccounts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [adAccountColumns, setAdAccountColumns] = useState(initialColumns);

  const { currentUser } = useSelector((state) => state.user);

  const canCreate = currentUser?.role?.permissions?.settings?.create;

  const canUpdate = currentUser?.role?.permissions?.settings?.update;

  const canDelete = currentUser?.role?.permissions?.settings?.delete;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleClickHighlightedCard = (title) => {
    if (title === 'Connect Facebook Leads') {
      handleNavigate('/settings/integration/ad-account/create-new');
    } else {
      alert('Work in progress!');
    }
  };

  const handleAdAccountStatusChange = async (id, value) => {
    try {
      const { data } =
        value === 'Activate'
          ? await activateAdAccount(id)
          : await deleteAdAccount(id);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: data?.message || 'Status updated successfully.',
          })
        );

        const settings = data.settings;

        const formattedAdAccounts = formatAdAccount(settings.adAccounts);
        setAdAccounts(formattedAdAccounts);
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const updateCardData = (data) => {
    setHighlightCardData((prev) =>
      prev.map((entry) => {
        if (entry.title === 'Connect Facebook Leads') {
          return { ...entry, hidden: true };
        }

        return entry;
      })
    );

    let thisMonthFBLeads = 0;
    let previousMonthFBLeads = data?.fbLeadsData[0]?.previousMonthFBLeads[0]?.count || 0;
    const formattedFBLeadsData = [];
    const formattedFBLeadsDays = data?.formattedFBLeadsData?.map((item) => {
      thisMonthFBLeads += item.count;
      formattedFBLeadsData.push(item?.count);

      return item.date;
    });

    let fBLeadsPercentageChange = null;

    if (previousMonthFBLeads === 0) {
      fBLeadsPercentageChange = thisMonthFBLeads === 0 ? 0 : 100; // or handle however you want
    } else {
      fBLeadsPercentageChange = Math.round(
        ((thisMonthFBLeads - previousMonthFBLeads) / previousMonthFBLeads) * 100
      );
    }

    setCardData([
      {
        title: (
          <Box display={'flex'} alignItems={'center'} gap={0.5}>
            <FacebookIcon sx={{ color: '#1877F2' }} />
            Leads
          </Box>
        ),
        value: NumberFormatter(thisMonthFBLeads),
        interval: `Last ${formattedFBLeadsData?.length} days`,
        data: formattedFBLeadsData,
        days: formattedFBLeadsDays,
        trendValue: percentageFormatter(fBLeadsPercentageChange),
        trend: getType(fBLeadsPercentageChange),
      },
    ]);
  };

  const formatAdAccount = (adAccount) => {
    return adAccount.map((entry) => ({
      id: entry?._id,
      platform: entry?.platform || 'N/A',
      accountName: entry?.accountName || 'N/A',
      createdBy: entry?.addedBy?.name || 'N/A',
      createdAt: formatDate(entry?.addedAt),
      status: entry?.status || 'N/A',
      accessToken: entry?.accessToken || 'N/A',
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getAllIntegrations();

        const settings = data.settings;

        const formattedAdAccounts = formatAdAccount(settings.adAccounts);
        setAdAccounts(formattedAdAccounts);

        if (formattedAdAccounts?.length || !canCreate) {
          updateCardData(data);
        }
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const dynamicColumns = [
      ...initialColumns,
      {
        field: 'action',
        headerName: 'Action',
        flex: 1.4,
        renderCell: (params) => {
          const { id, status } = params.row;
          if (!canUpdate && !canDelete) return null;

          return (
            <Stack direction="row" spacing={2}>
              {canDelete &&
                renderButton(
                  () =>
                    handleAdAccountStatusChange(
                      id,
                      status === 'Active' ? 'Deactivate' : 'Activate'
                    ),
                  status === 'Active' ? 'Deactivate' : 'Activate',
                  theme
                )}
              {canUpdate &&
                renderButton(
                  () =>
                    handleNavigate(
                      `/settings/integration/ad-account/${id}/edit`
                    ),
                  'Edit',
                  theme
                )}
            </Stack>
          );
        },
      },
    ];

    setAdAccountColumns(dynamicColumns);
  }, [canUpdate, canDelete]);

  return (
    <Box>
      {!loading ? (
        <>
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

            {highlightCardData?.map(
              (entry, idx) =>
                !entry.hidden && (
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
                    <HighlightedCard
                      title={entry?.title}
                      icon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                      buttonName={entry?.buttonName}
                      description={entry?.description}
                      onClick={() => handleClickHighlightedCard(entry?.title)}
                    />
                  </Grid>
                )
            )}
          </Grid>

          <BasicDataGrid
            columns={adAccountColumns}
            rows={adAccounts}
            checkbox={false}
          />
        </>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default IntegrationsSetting;
