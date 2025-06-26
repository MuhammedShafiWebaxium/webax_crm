import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { stopLoading } from '../../redux/loadingSlice';
import { Box, Typography } from '@mui/material';
import BasicTabs from '../../components/CustomComponents/BasicTabs';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import AccountSetting from './sections/account';
import LeadsSetting from './sections/lead';
import IntegrationsSetting from './sections/integration';
import { useLocation } from 'react-router-dom';

const CustomBox = ({ children }) => (
  <Box
    width="100%"
    height="calc(100dvh - 250px)"
    p="16px 16px 0 16px"
    overflow="auto"
  >
    {children}
  </Box>
);

const tabData = [
  {
    label: 'Account',
    content: (
      <CustomBox>
        <AccountSetting />
      </CustomBox>
    ),
    disabled: false,
  },
  {
    label: 'Integration',
    content: (
      <CustomBox>
        <IntegrationsSetting />
      </CustomBox>
    ),
    disabled: false,
  },
  {
    label: 'Lead',
    content: (
      <CustomBox>
        <LeadsSetting />
      </CustomBox>
    ),
    disabled: true,
    icon: <LockOutlineIcon />,
  },
  {
    label: 'Notification',
    content: (
      <CustomBox>
        <>Item Three</>
      </CustomBox>
    ),
    disabled: true,
    icon: <LockOutlineIcon />,
  },
  {
    label: 'Subscription',
    content: (
      <CustomBox>
        <>Item Four</>
      </CustomBox>
    ),
    disabled: true,
    icon: <LockOutlineIcon />,
  },
  {
    label: 'Task',
    content: (
      <CustomBox>
        <>Item Five</>
      </CustomBox>
    ),
    disabled: true,
    icon: <LockOutlineIcon />,
  },
  {
    label: 'General',
    content: (
      <CustomBox>
        <>Item Six</>
      </CustomBox>
    ),
    disabled: true,
    icon: <LockOutlineIcon />,
  },
];

const Settings = () => {
  const dispatch = useDispatch();

  const { state } = useLocation();

  const [initialValue, setInitialValue] = useState(0);

  useEffect(() => {
    if (state?.value) {
      const integrationIndex = tabData.findIndex(
        (tab) => tab.label === 'Integration'
      );

      setInitialValue(integrationIndex);
    }

    dispatch(stopLoading());
  }, [state]);
  return (
    <Box sx={{ maxHeight: 'calc(100vh - 155px)', overflow: 'hidden' }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Settings
      </Typography>
      <BasicTabs
        data={tabData}
        sx={{ width: '100%' }}
        initialValue={initialValue}
      />
    </Box>
  );
};

export default Settings;
