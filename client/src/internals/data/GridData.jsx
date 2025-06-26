import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Box, Button, Link, Tooltip, Typography, Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';

const BtuLogo = '';
const NeftuLogo = '';
const CujLogo = '';

function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

export const renderAction = (id, baseLink, text) => {
  const theme = useTheme();

  return (
    <Link
      href={`${baseLink}${id}`}
      style={{
        textDecoration: 'none',
        color: theme.palette.mode === 'dark' ? '#4e9cff' : 'blue', // Adjust color based on mode
      }}
    >
      {text}
    </Link>
  );
};

const renderLinkWithIcon = (id, baseLink, text) => {
  const theme = useTheme();

  return (
    <Link
      href={`${baseLink}${id}`}
      style={{
        border: 0,
        display: 'flex',
        gap: 1,
        textDecoration: 'none',
        color: theme.palette.mode === 'dark' ? '#4e9cff' : 'blue', // Adjust color based on mode
      }}
    >
      <Typography fontSize="small">{text}</Typography>
      <DownloadIcon fontSize="small" />
    </Link>
  );
};

export const renderStatus = (status) => {
  const colors = {
    Eligible: 'success',
    create: 'default',
    read: 'default',
    allowed: 'default',
    assign: 'default',
    followup: 'default',
    Active: 'success',
    Admitted: 'success',
    Pending: 'warning',
    'Awaiting Approval': 'warning',
    update: 'default',
    Offline: 'default',
    Unknown: 'default',
    Rejected: 'error',
    Inactive: 'error',
    Ineligible: 'error',
    delete: 'default',
  };

  return <Chip label={status} color={colors[status]} size="small" />;
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

export const centeredTooltipText = (value) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}
  >
    <Tooltip title={value} disableInteractive slots={{ transition: Zoom }}>
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-block',
          width: '100%',
        }}
      >
        {value}
      </span>
    </Tooltip>
  </Box>
);

export const renderAssignStatus = (status) => {
  const color =
    status === 'N/A' || status === 'Unassigned' ? 'error' : 'success';

  return <Chip label={status} color={color} size="small" />;
};

function renderSparklineCell(params) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  { field: 'pageTitle', headerName: 'Page Title', flex: 1.5, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'users',
    headerName: 'Users',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'eventCount',
    headerName: 'Event Count',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'viewsPerUser',
    headerName: 'Views per User',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'averageTime',
    headerName: 'Average Time',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  // {
  //   field: 'conversions',
  //   headerName: 'Daily Conversions',
  //   flex: 1,
  //   minWidth: 150,
  //   renderCell: renderSparklineCell,
  // },
];

export const recentAdmissionsColumns = [
  { field: 'id', headerName: 'Sl.No', flex: 0.5 },
  {
    field: 'student',
    headerName: 'Student',
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    flex: 1,
  },
  {
    field: 'eligibility',
    headerName: 'Eligibility',
    flex: 1,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    renderCell: (params) => {
      if (params.row.admissionStatus === 'Pending') {
        return renderAction(
          params.row._id,
          '/admissions/approve-admission/',
          'Approve'
        );
      } else {
        return renderAction(
          params.row._id,
          '/leads/view-profile/',
          'View Profile'
        );
      }
    },
  },
];