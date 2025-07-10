import * as Yup from 'yup';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HighlightedCard from './HighlightedCard';
import StatCard from './StatCard';
import CustomLineChart from './CustomComponents/CustomLineChart';
import CustomCard from './CustomComponents/CustomCard';
import BasicDataGrid from './CustomComponents/BasicDataGrid';
import { useEffect, useRef, useState } from 'react';
import {
  formatDate,
  recentAdmissionsColumns,
  renderStatus,
} from '../internals/data/GridData';
import { useTheme } from '@mui/material/styles';
import { Chip, Link, Skeleton } from '@mui/material';
import CustomInput from './CustomComponents/CustomInput';
import DraggableDialog from './CustomComponents/DraggableDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomComboBox from './CustomComponents/CustomComboBox';
import { showAlert } from '../redux/alertSlice';
import { useNavigate } from 'react-router-dom';
import { stopLoading } from '../redux/loadingSlice';
import { handleFormError } from '../utils/handleFormError';
import { getDashboard } from '../services/indexServices';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuButton from './MenuButton';
import DividerText from './CustomComponents/DividerText';
import { setAssignee } from '../services/leadServices';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

const schema = Yup.object().shape({
  assignTo: Yup.string().required('Assign To is Required'),
  studentId: Yup.string().required('Student Id is Required'),
});

const minHeight = 389;
const maxHeight = 389;

const labelColors = {
  up: 'success',
  down: 'error',
  neutral: 'default',
};

const defaultCardData = [
  {
    title: 'Leads',
    value: '0',
    interval: 'Last 30 days',
    trend: 'up',
    data: [],
    days: [],
  },
  {
    title: 'Eligibility',
    value: '0',
    interval: 'Last 30 days',
    trend: 'down',
    data: [],
    days: [],
  },
  {
    title: 'Tickets',
    value: '0',
    interval: 'Last 30 days',
    trend: 'neutral',
    data: [],
    days: [],
  },
];

const initialData = {
  sources: null,
  sourceDays: null,
  sourceLeadsCount: null,
  trendValue: null,
  trend: null,
  todaysLeads: null,
  todayTrendValue: null,
  todayTrend: null,
  todaysTodos: null,
  activeTodos: null,
  todayTodosTrendValue: null,
  todayTodosTrend: null,
  totalTodos: null,
};

const initialAssignLead = {
  studentId: '',
  student: '',
  phone: '',
  assignedTo: '',
  assignTo: '',
};

const MainGrid = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const sourceData = useRef(initialData);

  const assignLeadFormValues = useRef(initialAssignLead);

  const { currentUser } = useSelector((state) => state.user);

  const [assignLeadFormErrors, setAssignLeadFormErrors] = useState(null);

  const [cardData, setCardData] = useState(defaultCardData);

  const [todaysLeads, setTodaysLeads] = useState(null);

  const [recentAdmissions, setRecentAdmissions] = useState(null);

  const [unAssignedLeads, setUnAssignedLeads] = useState(0);

  const [open, setOpen] = useState(false);

  const [formattedUsers, setFormattedUsers] = useState([]);

  const [currentTodo, setCurrentTodo] = useState(null);

  const assignLeadInputData = [
    {
      name: 'student',
      label: 'student',
      type: 'text',
      mode: 'common',
      disabled: true,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      mode: 'common',
      disabled: true,
    },
    {
      name: 'assignedTo',
      label: 'Assigned To',
      type: 'text',
      mode: 'common',
      disabled: true,
    },
    {
      name: 'assignTo',
      label: 'Assign To',
      mode: 'combobox',
      placeholder: 'Select',
      data: formattedUsers,
    },
  ];

  const renderAction = (id, text) => {
    const theme = useTheme();

    return (
      <Link
        component="button"
        variant="body2"
        color={theme.palette.mode === 'dark' ? '#4e9cff' : 'blue'}
        onClick={() => handleClickOpen(id)}
      >
        {text}
      </Link>
    );
  };

  const handleClickKnowMore = (link) => {
    navigate(link);
  };

  const handleClickOpen = (id) => {
    assignLeadFormValues.current = initialAssignLead;
    setAssignLeadFormErrors(null);
    const findStudent = todaysLeads.find((lead) => lead._id == id);

    if (!findStudent) {
      console.error('Lead not found');
      return;
    }

    const fieldsToMap = [
      { key: 'student', value: findStudent.name },
      { key: 'studentId', value: findStudent._id },
      { key: 'phone', value: findStudent.phone },
      { key: 'assignedTo', value: findStudent.assignedTo || 'N/A' },
    ];

    fieldsToMap.forEach(({ key, value }) => {
      assignLeadFormValues.current[key] = value;
    });

    setOpen(true);
  };

  const TodaysLeadsColumns = [
    { field: 'name', headerName: 'Student', flex: 1 },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
    },
    {
      field: 'source',
      headerName: 'Source',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    {
      field: 'eligibility',
      headerName: 'Eligibility',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    {
      field: 'assignedBy',
      headerName: 'Assigned By',
      flex: 1,
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      flex: 1,
    },
    {
      field: 'note',
      headerName: 'Assigned Remarks',
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) =>
        renderAction(
          params.row._id,
          params.row.assignedTo && params.row.assignedTo !== 'Unassigned'
            ? 'Reassign'
            : 'Assign'
        ),
    },
  ];

  const handleInputChange = async (event) => {
    const { name, value } = event.target;

    assignLeadFormValues.current = {
      ...assignLeadFormValues.current,
      [name]: value,
    };
    try {
      await Yup.reach(schema, name).validate(value);
      setAssignLeadFormErrors({ ...assignLeadFormErrors, [name]: null });
    } catch (error) {
      setAssignLeadFormErrors({
        ...assignLeadFormErrors,
        [name]: error.message,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(assignLeadFormValues.current, {
        abortEarly: false,
      });

      const { data } = await setAssignee(assignLeadFormValues.current);

      const updatedLead = data?.updatedLead;

      let unAssignedCount = 0;

      const formattedLeads = todaysLeads.map((lead) => {
        if (!lead?.assignedTo || lead?.assignedTo === 'Unassigned') {
          unAssignedCount += 1;
        }

        if (lead?._id === updatedLead?._id) {
          return {
            id: lead?.id,
            _id: updatedLead?._id,
            name: updatedLead?.name || 'N/A',
            phone: updatedLead?.phone || 'N/A',
            status: updatedLead?.status || 'N/A',
            eligibility: updatedLead?.eligibility || 'N/A',
            assignedBy: updatedLead?.assigned?.assignedBy?.name || 'N/A',
            assignedTo: updatedLead?.assigned?.staff?.name || 'Unassigned',
            note: updatedLead?.initialNote || 'N/A',
            source: updatedLead?.leadSource.source || 'N/A',
          };
        }

        return lead;
      });

      setUnAssignedLeads(unAssignedCount);
      setTodaysLeads(formattedLeads);
      setOpen(false);

      dispatch(
        showAlert({
          type: 'success',
          message: `The Lead Assigned To ${updatedLead?.assigned?.staff?.name}.`,
        })
      );
    } catch (error) {
      const validationErrors = {};
      if (error?.inner && Array.isArray(error.inner)) {
        error.inner.forEach((innerError) => {
          validationErrors[innerError.path] = innerError.message;
        });
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong.';

      if (import.meta.env.VITE_NODE_ENV === 'development') {
        console.error(error); // Log the full error in development
      }

      setAssignLeadFormErrors(validationErrors);

      dispatch(
        showAlert({
          type: error.response ? 'error' : 'warning',
          message: errorMessage,
        })
      );
    }
  };

  const assignLeadContent = (
    <>
      <Grid container columns={12} columnSpacing={2} rowSpacing={1}>
        {assignLeadInputData.map((entry, index) => {
          if (entry.mode === 'common') {
            return (
              <Grid key={index} size={{ xs: 12, sm: 6 }}>
                <CustomInput
                  label={entry?.label}
                  placeholder={entry?.placeholder}
                  value={assignLeadFormValues?.current[entry?.name]}
                  name={entry?.name}
                  type={entry?.type}
                  disabled={entry?.disabled}
                  onChange={handleInputChange}
                  error={
                    (assignLeadFormErrors &&
                      assignLeadFormErrors[entry?.name]) ||
                    null
                  }
                />
              </Grid>
            );
          } else {
            return (
              <Grid key={index} size={{ xs: 12, sm: 6 }}>
                <CustomComboBox
                  {...entry}
                  value={assignLeadFormValues.current[entry?.name]}
                  onChange={handleInputChange}
                  error={
                    (assignLeadFormErrors &&
                      assignLeadFormErrors[entry?.name]) ||
                    null
                  }
                />
              </Grid>
            );
          }
        })}
      </Grid>
    </>
  );

  const NumberFormatter = (number) => number.toLocaleString();
  const customAbbreviate = (num) => {
    if (num >= 1e3 && num < 1e6) {
      return (num / 1e3).toFixed(1) + 'K'; // For thousands
    } else if (num >= 1e6 && num < 1e9) {
      return (num / 1e6).toFixed(1) + 'M'; // For millions
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B'; // For billions
    } else {
      return num.toString(); // For numbers less than 1000
    }
  };

  const handleClickHighlightedCard = () => {
    navigate('/settings', { state: { value: 'Integration' } });
  };

  const handleScrollTodo = (action) => {
    const value = action === 'prev' ? currentTodo.idx - 1 : currentTodo.idx + 1;

    setCurrentTodo(sourceData?.current?.totalTodos[value || 0]);
  };

  const getType = (number) => {
    return number === 0 ? 'neutral' : number > 0 ? 'up' : 'down';
  };

  const percentageFormatter = (number) => {
    return number > 0 ? `+${number}%` : `${number}%`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getDashboard();

        let thisMonthLeads = 0;
        let previousMonthLeads =
          data?.leadsData?.previousMonthLeads[0]?.count || 0;
        const formattedLeadsData = [];
        const formattedLeadsDays = data?.leadsData?.formattedLeadsData?.map(
          (item) => {
            thisMonthLeads += item.count;
            formattedLeadsData.push(item?.count);

            return item.date;
          }
        );

        let leadsPercentageChange = null;

        if (previousMonthLeads === 0) {
          leadsPercentageChange = thisMonthLeads === 0 ? 0 : 100; // or handle however you want
        } else {
          leadsPercentageChange = Math.round(
            ((thisMonthLeads - previousMonthLeads) / previousMonthLeads) * 100
          );
        }

        let thisMonthTodos = 0;
        let previousMonthTodos =
          data?.todosData?.previousMonthTodos[0]?.count || 0;
        const formattedTodosData = [];
        const formattedTodosDays = data?.todosData?.formattedTodosData?.map(
          (item) => {
            thisMonthTodos += item.count;
            formattedTodosData.push(item?.count);

            return item.date;
          }
        );

        let todosPercentageChange = null;

        if (previousMonthTodos === 0) {
          todosPercentageChange = thisMonthTodos === 0 ? 0 : 100; // or handle however you want
        } else {
          todosPercentageChange = Math.round(
            ((thisMonthTodos - previousMonthTodos) / previousMonthTodos) * 100
          );
        }

        let thisMonthConversions = 0;
        let previousMonthConversions =
          data?.leadsData?.previousMonthConversions[0]?.count || 0;
        const formattedConversionData = [];
        const formattedConversionDays =
          data?.leadsData?.formattedConversionData?.map((item) => {
            thisMonthConversions += item.count;
            formattedConversionData.push(item?.count);

            return item.date;
          });

        let conversionPercentageChange = null;

        if (previousMonthConversions === 0) {
          conversionPercentageChange = thisMonthConversions === 0 ? 0 : 100; // or handle however you want
        } else {
          conversionPercentageChange = Math.round(
            ((thisMonthConversions - previousMonthConversions) /
              previousMonthConversions) *
              100
          );
        }

        const formattedData = [
          {
            title: 'Leads',
            value: NumberFormatter(thisMonthLeads),
            interval: `Last ${formattedLeadsData?.length} days`,
            data: formattedLeadsData,
            days: formattedLeadsDays,
            trendValue: percentageFormatter(leadsPercentageChange),
            trend: getType(leadsPercentageChange),
          },
          {
            title: 'Eligibility',
            value: NumberFormatter(thisMonthConversions),
            interval: `Last ${formattedConversionData?.length} days`,
            data: formattedConversionData,
            days: formattedConversionDays,
            trendValue: percentageFormatter(conversionPercentageChange),
            trend: getType(conversionPercentageChange),
          },
          {
            title: 'Todos',
            value: NumberFormatter(thisMonthTodos),
            interval: `Last ${formattedTodosData?.length} days`,
            data: formattedTodosData,
            days: formattedTodosDays,
            trendValue: percentageFormatter(todosPercentageChange),
            trend: getType(todosPercentageChange),
          },
        ];

        if (currentUser?.company?.settings?.adAccounts?.length) {
          let thisMonthFBLeads = 0;
          let previousMonthFBLeads =
            data?.leadsData?.previousMonthFBLeads[0]?.count || 0;
          const formattedFBLeadsData = [];
          const formattedFBLeadsDays =
            data?.leadsData?.formattedFBLeadsData?.map((item) => {
              thisMonthFBLeads += item.count;
              formattedFBLeadsData.push(item?.count);

              return item.date;
            });

          let fBLeadsPercentageChange = null;

          if (previousMonthFBLeads === 0) {
            fBLeadsPercentageChange = thisMonthFBLeads === 0 ? 0 : 100; // or handle however you want
          } else {
            fBLeadsPercentageChange = Math.round(
              ((thisMonthFBLeads - previousMonthFBLeads) /
                previousMonthFBLeads) *
                100
            );
          }

          formattedData.push({
            title: 'FB Leads',
            value: NumberFormatter(thisMonthFBLeads),
            interval: `Last ${formattedFBLeadsData?.length} days`,
            data: formattedFBLeadsData,
            days: formattedFBLeadsDays,
            trendValue: percentageFormatter(fBLeadsPercentageChange),
            trend: getType(fBLeadsPercentageChange),
          });
        }

        let unAssignedCount = 0;

        const formattedTodaysLeads = data?.leadsData?.todaysLeads?.map(
          (lead, index) => {
            if (!lead?.assigned?.staff) {
              unAssignedCount += 1;
            }

            return {
              id: index + 1,
              _id: lead?._id,
              name: lead?.name || 'N/A',
              phone: lead?.phone || 'N/A',
              status: lead?.status || 'N/A',
              eligibility: lead?.eligibility || 'N/A',
              assignedBy: lead?.assigned?.assignedBy?.name || 'N/A',
              assignedTo: lead?.assigned?.staff?.name || 'Unassigned',
              note: lead?.initialNote || 'N/A',
              source: lead?.leadSource.source || 'N/A',
            };
          }
        );

        const formattedAdmissions = [];

        data?.leadsData?.recentAdmissions?.forEach((lead) => {
          formattedAdmissions.push({
            id: formattedAdmissions.length + 1,
            _id: lead?._id,
            student: lead?.name,
            status: lead?.status,
            assignedTo: lead?.assigned?.staff?.name,
            eligibility: lead?.eligibility,
          });
        });

        const formattedFacebookData = [];
        const formattedGoogleData = [];
        const formattedYoutubeData = [];
        const formattedSourceDays = [];
        let totalSourceLeads = 0;
        let previousMonthSources =
          data?.leadsData?.previousMonthSources[0]?.count || 0;

        data?.leadsData?.formattedSource?.forEach((source) => {
          formattedFacebookData.push(source['Facebook']);
          formattedGoogleData.push(source['Google']);
          formattedYoutubeData.push(source['Youtube']);

          formattedSourceDays.push(source.date);
          totalSourceLeads +=
            source['Facebook'] + source['Google'] + source['Youtube'];
        });

        let sourcePercentageChange = null;

        if (previousMonthSources === 0) {
          sourcePercentageChange = totalSourceLeads === 0 ? 0 : 100; // or handle however you want
        } else {
          sourcePercentageChange = Math.round(
            ((totalSourceLeads - previousMonthSources) / previousMonthSources) *
              100
          );
        }

        const formattedSource = [
          {
            id: 'facebook',
            label: 'Facebook',
            showMark: false,
            curve: 'linear',
            stack: 'total',
            area: true,
            stackOrder: 'ascending',
            data: formattedFacebookData,
          },
          {
            id: 'google',
            label: 'Google',
            showMark: false,
            curve: 'linear',
            stack: 'total',
            area: true,
            stackOrder: 'ascending',
            data: formattedGoogleData,
          },
          {
            id: 'youtube',
            label: 'Youtube',
            showMark: false,
            curve: 'linear',
            stack: 'total',
            stackOrder: 'ascending',
            data: formattedYoutubeData,
            area: true,
          },
        ];

        const todayLead = formattedTodaysLeads?.length;
        const yesterdayLead = data?.leadsData?.yesterdaysLeads[0]?.count || 0;

        let leadPercentageChange = null;

        if (yesterdayLead === 0) {
          leadPercentageChange = todayLead === 0 ? 0 : 100; // or handle however you want
        } else {
          leadPercentageChange = Math.round(
            ((todayLead - yesterdayLead) / yesterdayLead) * 100
          );
        }

        const todayTodos =
          formattedTodosData[formattedTodosData.length - 1] || 0;
        const yesterdayTodos =
          formattedTodosData[formattedTodosData.length - 2] || 0;

        let todayTodoPercentageChange = null;

        if (yesterdayTodos === 0) {
          todayTodoPercentageChange = todayTodos === 0 ? 0 : 100; // or handle however you want
        } else {
          todayTodoPercentageChange = Math.round(
            ((todayTodos - yesterdayTodos) / yesterdayTodos) * 100
          );
        }

        setCardData(formattedData);
        setTodaysLeads(formattedTodaysLeads);
        setUnAssignedLeads(unAssignedCount);
        setRecentAdmissions(formattedAdmissions);
        sourceData.current.sources = formattedSource;
        sourceData.current.sourceDays = formattedSourceDays;
        sourceData.current.sourceLeadsCount = totalSourceLeads;
        sourceData.current.trendValue = percentageFormatter(
          sourcePercentageChange
        );
        sourceData.current.trend = getType(sourcePercentageChange);

        sourceData.current.todaysLeads = todayLead;
        sourceData.current.todayTrendValue =
          percentageFormatter(leadPercentageChange);
        sourceData.current.todayTrend = getType(leadPercentageChange);

        sourceData.current.todaysTodos = todayTodos;
        sourceData.current.todayTodosTrendValue = percentageFormatter(
          todayTodoPercentageChange
        );
        sourceData.current.todayTodosTrend = getType(todayTodoPercentageChange);

        sourceData.current.totalTodos = data?.todosData?.activeTodos?.map(
          (entry, index) => ({ ...entry, idx: index })
        );

        if (sourceData?.current?.totalTodos?.length) {
          setCurrentTodo(sourceData.current.totalTodos[0]);
        }

        const formatUser = data?.users?.map((entry) => ({
          label: entry?.name || 'N/A',
          value: entry?._id,
        }));

        setFormattedUsers(formatUser);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ overflow: 'visible' }}>
      {/* re-assign-lead */}
      <DraggableDialog
        open={open}
        setOpen={setOpen}
        title={'Assign Lead'}
        content={assignLeadContent}
        onSubmit={handleSubmit}
        buttonText={'Submit'}
      />
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>{console.log(cardData)}
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
        ))}{console.log(currentUser?.company?.settings?.adAccounts?.length)}
        {!currentUser?.company?.settings?.adAccounts?.length && (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <HighlightedCard
              title={'Connect Facebook Leads'}
              buttonName={'Setup Now'}
              icon={<InsightsRoundedIcon />}
              onClick={handleClickHighlightedCard}
              description={
                'Set up Facebook API to start receiving leads directly from your ad campaigns.'
              }
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomLineChart
            title={'Sources'}
            subTitle={NumberFormatter(sourceData.current.sourceLeadsCount || 0)}
            trendValue={sourceData.current.trendValue}
            trend={sourceData.current.trend}
            description={`Source per day for the last ${
              sourceData?.current?.sourceDays?.length || 0
            } ${sourceData?.current?.sourceDays?.length > 1 ? 'days' : 'day'}`}
            series={sourceData.current.sources}
            days={sourceData.current.sourceDays}
            interval={true}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomCard
            title={'Recent Admissions'}
            content={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '305px',
                  minHeight: '305px',
                }}
              >
                <BasicDataGrid
                  columns={recentAdmissionsColumns}
                  rows={recentAdmissions}
                />
              </div>
            }
          />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Leads & Tasks
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ md: 12, lg: 9 }}>
          <CustomCard
            title={
              <Box display={'flex'} gap={2}>
                Today's Leads{' '}
                {unAssignedLeads > 0 ? (
                  <Link href="/leads/unassigned-leads" color={'red'}>
                    You Have {unAssignedLeads} Unassigned{' '}
                    {unAssignedLeads === 1 ? 'Lead' : 'Leads'}
                  </Link>
                ) : (
                  ''
                )}
              </Box>
            }
            subTitle={NumberFormatter(sourceData.current.todaysLeads || 0)}
            chipLabel={sourceData.current.todayTrendValue}
            chipColor={labelColors[sourceData.current.todayTrend]}
            content={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight,
                  minHeight,
                }}
              >
                <BasicDataGrid
                  columns={TodaysLeadsColumns}
                  rows={todaysLeads}
                  checkbox={true}
                />
              </div>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <CustomCard
            title={
              <Box
                display={'flex'}
                gap={2}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Stack>
                  <Typography component="h2" variant="subtitle2" gutterBottom>
                    Active Todos
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{
                      alignContent: { xs: 'center', sm: 'flex-start' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h4" component="p">
                      {NumberFormatter(
                        sourceData?.current?.totalTodos?.length || 0
                      )}
                    </Typography>
                    <Chip
                      size="small"
                      color={labelColors[sourceData.current.todayTodosTrend]}
                      label={sourceData.current.todayTodosTrendValue}
                    />
                  </Stack>
                </Stack>
                <Stack direction={'row'} gap={1} justifyContent={'end'}>
                  <MenuButton
                    aria-label="back"
                    sx={{ width: '32px', height: '32px', padding: 0 }}
                    onClick={() => handleScrollTodo('prev')}
                    disabled={
                      sourceData?.current?.totalTodos?.length < 2 ||
                      currentTodo?.idx === 0
                    }
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: '10px !important' }} />
                  </MenuButton>
                  <MenuButton
                    aria-label="forward"
                    sx={{ width: '32px', height: '32px', padding: 0 }}
                    onClick={() => handleScrollTodo('next')}
                    disabled={
                      sourceData?.current?.totalTodos?.length < 2 ||
                      sourceData?.current?.totalTodos?.length - 1 ===
                        currentTodo?.idx
                    }
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: '10px !important' }} />
                  </MenuButton>
                </Stack>
              </Box>
            }
            content={
              <div style={{ height: '384px' }}>
                <CustomCard
                  // title={'Framework Building'}
                  // titleSx={{ mb: 0 }}
                  content={
                    currentTodo ? (
                      <Box>
                        <Typography
                          component="h2"
                          variant="subtitle2"
                          gutterBottom
                          mb={0}
                        >
                          {currentTodo?.name || 'N/A'}
                        </Typography>
                        <Typography
                          variant="caption"
                          gutterBottom
                          sx={{ display: 'block' }}
                        >
                          {currentTodo?.description || 'N/A'}
                        </Typography>

                        <Stack spacing={1}>
                          <Box>
                            <Stack direction="row">
                              <div style={{ display: 'flex', flex: 1 }}>
                                <span className="todo-dashboard-label">
                                  Due Date
                                </span>
                                <span className="todo-dashboard-divider"></span>
                              </div>
                              <div style={{ display: 'flex', flex: 1 }}>
                                <span className="todo-dashboard-label">
                                  Priority
                                </span>
                                <span className="todo-dashboard-divider"></span>
                              </div>
                            </Stack>

                            <Stack direction={'row'}>
                              <div style={{ flex: 1 }}>
                                <Chip
                                  size="small"
                                  color={'default'}
                                  label={formatDate(currentTodo?.endDate)}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Chip
                                  size="small"
                                  color={
                                    currentTodo?.priority === 'High'
                                      ? 'error'
                                      : currentTodo?.priority === 'Medium'
                                      ? 'warning'
                                      : 'success'
                                  }
                                  label={currentTodo?.priority}
                                />
                              </div>
                            </Stack>
                          </Box>

                          <DividerText text={'Checklist'} />

                          <Box>
                            <ul style={{ padding: '0 20px' }}>
                              {currentTodo?.checklist?.map((entry, idx) => (
                                <li key={idx}>{entry?.title}</li>
                              ))}
                            </ul>
                          </Box>
                        </Stack>
                      </Box>
                    ) : (
                      <Stack spacing={1}>
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                      </Stack>
                    )
                  }
                />
              </div>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainGrid;
