import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const borderSx = {
  horizontal: {
    borderBottom: 1,
    borderColor: 'divider',
  },
  vertical: {
    borderRight: 1,
    borderColor: 'divider',
    minWidth: '200px',
  },
};

export default function BasicTabs({
  data,
  sx,
  tabSx,
  orientation = 'horizontal',
  initialValue = 0,
}) {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Box sx={sx}>
      <Box sx={borderSx[orientation]}>
        <Tabs
          value={value}
          orientation={orientation}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'hsl(235.9deg 54.57% 44.32%)',
            },
          }}
        >
          {data?.map(({ label, disabled, icon }, index) => (
            <Tab
              key={index}
              label={label}
              {...a11yProps(index)}
              disabled={disabled}
              icon={icon}
              iconPosition="end"
              sx={tabSx}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ width: '100%', overflow: 'auto' }}>
        {data?.map(({ content }, index) => (
          <CustomTabPanel
            key={index}
            value={value}
            index={index}
            style={{ textAlign: 'left' }}
          >
            {content}
          </CustomTabPanel>
        ))}
      </Box>
    </Box>
  );
}
