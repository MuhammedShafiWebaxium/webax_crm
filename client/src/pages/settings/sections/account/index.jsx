import { Box } from '@mui/system';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import BasicTabs from '../../../../components/CustomComponents/BasicTabs';
import RoleList from './panels/roles';

const sx = {
  display: 'flex',
  minWidth: '240px',
};

const AccountSetting = () => {
  const tabData = [
    {
      label: 'Roles',
      content: <RoleList />,
      disabled: false,
    },
    {
      label: 'Mail Configuration',
      content: '',
      disabled: true,
      icon: <LockOutlineIcon />,
    },
    {
      label: 'Email Templates',
      content: '',
      disabled: true,
      icon: <LockOutlineIcon />,
    },
    {
      label: 'WhatsApp Templates',
      content: '',
      disabled: true,
      icon: <LockOutlineIcon />,
    },
    {
      label: 'Change Password',
      content: '',
      disabled: true,
      icon: <LockOutlineIcon />,
    },
  ];

  return (
    <Box>
      <BasicTabs
        data={tabData}
        sx={sx}
        tabSx={{ justifyContent: 'start' }}
        orientation="vertical"
      />
    </Box>
  );
};

export default AccountSetting;
