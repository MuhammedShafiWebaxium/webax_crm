import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSelector } from 'react-redux';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupIcon from '@mui/icons-material/Group';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';

const menuItems = [
  {
    id: '1',
    label: 'Dashboard',
    icon: <HomeRoundedIcon />,
    path: '/',
  },
  {
    id: '2',
    label: 'Companies',
    icon: <ApartmentIcon />,
    required: { module: 'companies', action: 'read' },
    children: [
      {
        id: '2.1',
        label: 'Create Company',
        path: '/companies/create-new',
        required: { module: 'companies', action: 'create' },
      },
      {
        id: '2.2',
        label: 'Companies List',
        path: '/companies',
        required: { module: 'companies', action: 'read' },
      },
    ],
  },
  {
    id: '3',
    label: 'Users',
    icon: <EngineeringIcon />,
    required: { module: 'users', action: 'read' },
    children: [
      {
        id: '3.1',
        label: 'Create User',
        path: '/users/create-new',
        required: { module: 'users', action: 'create' },
      },
      {
        id: '3.2',
        label: 'Users List',
        path: '/users',
        required: { module: 'users', action: 'read' },
      },
    ],
  },
  {
    id: '4',
    label: 'Leads',
    icon: <GroupIcon />,
    required: { module: 'leads', action: 'read' },
    children: [
      {
        id: '4.1',
        label: 'Create Lead',
        path: '/leads/create-new',
        required: { module: 'leads', action: 'create' },
      },
      {
        id: '4.2',
        label: 'Leads List',
        path: '/leads',
        required: { module: 'leads', action: 'read' },
      },
    ],
  },
  {
    id: '5',
    label: 'Todos',
    icon: <AssignmentRoundedIcon />,
    path: '/todos',
    required: { module: 'todos', action: 'read' },
  },
  {
    id: '11',
    label: 'Ticket',
    icon: <SupportAgentIcon />,
    children: [
      {
        id: '11.1',
        label: 'Dashboard',
        path: '/tickets',
        required: { module: 'tickets', action: 'read' },
      },
      {
        id: '11.3',
        label: 'Closed Tickets',
        path: '/support/closed-tickets',
        required: { module: 'tickets', action: 'read' },
      },
    ],
  },
];

const reviewUrl =
  'https://search.google.com/local/writereview?placeid=ChIJo-tLFPgNCDsRZMadXE25LiU';

const secondaryListItems = [
  {
    label: 'Settings',
    icon: <SettingsRoundedIcon />,
    path: '/settings',
    required: { module: 'settings', action: 'read' },
  },
  {
    label: 'About',
    icon: <InfoRoundedIcon />,
    path: '/about-us',
    required: { module: 'about', action: 'read' },
  },
  {
    label: 'Feedback',
    icon: <HelpRoundedIcon />,
    path: reviewUrl,
    required: { module: 'feedback', action: 'read' },
  },
];

export default function MenuContent({ collapse }) {
  const navigate = useNavigate();

  const location = useLocation();

  const { currentUser } = useSelector((state) => state.user);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null); // null by default
  const [submenu, setSubmenu] = React.useState(null); // submenu state

  const handleClickListItem = (path, index, children, filter) => {
    setSelected(index);
    setOpen(
      children && selected !== index && open ? true : children ? !open : false
    );
    if (path) handleNavigate(path, filter);
  };

  const handleClickSubmenu = (id, path, filter) => {
    setSubmenu(id);
    if (path) handleNavigate(path, filter);
  };

  const handleNavigate = (path, filter) => {
    navigate(path ? path : '/', filter ? { state: filter } : '');
  };

  const handleClickSecondaryList = (path) => {
    setSelected(null);
    setSubmenu(null);

    if (path.startsWith('http') || path.startsWith('/https')) {
      // Open external link in a new tab
      window.open(path, '_blank');
    } else {
      // Navigate within the app
      handleNavigate(path);
    }
  };

  const hasPermission = (required, permissions) => {
    if (!required) return true;
    const { module, action } = required;
    return permissions?.[module]?.[action] === true;
  };

  const filterMenu = (items, permissions) => {
    return items
      .filter((item) => hasPermission(item.required, permissions))
      .map((item) => ({
        ...item,
        children: item.children
          ? item.children.filter((child) =>
              hasPermission(child.required, permissions)
            )
          : undefined,
      }))
      .filter(
        (item) => item.children === undefined || item.children.length > 0
      );
  };

  const filteredMenu = filterMenu(menuItems, currentUser?.role?.permissions);
  const filteredSecondaryList = filterMenu(secondaryListItems, currentUser?.role?.permissions);

  React.useEffect(() => {
    for (let index = 0; index < filteredMenu.length; index++) {
      const item = filteredMenu[index];

      if (item.path === location.pathname) {
        setSelected(index);
        break; // Stop the loop when a match is found
      } else if (item.children) {
        for (let child of item.children) {
          if (child.path === location.pathname) {
            setSelected(index);
            setSubmenu(child.id);
            setOpen(true);
            break; // Stop the loop when a match is found
          }
        }
      }
    }
  }, [location.pathname]);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List
        dense
        sx={{ overflowY: 'auto', overflowX: 'hidden', height: '260px' }}
      >
        {filteredMenu?.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ display: 'block' }}
            onClick={() =>
              handleClickListItem(item.path, index, item.children, item.filter)
            }
          >
            <ListItemButton
              selected={index === selected}
              sx={{ minHeight: '32px', justifyContent: 'center' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {!collapse && (
                <>
                  <ListItemText primary={item.label} />
                  {index === selected && open ? (
                    <KeyboardArrowDownIcon />
                  ) : (
                    item.children && <KeyboardArrowRightIcon />
                  )}
                </>
              )}
            </ListItemButton>

            {item?.children &&
              !collapse &&
              item?.children?.map((children) => (
                <Collapse
                  key={children.id}
                  in={index === selected && open}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ py: '2px' }}>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      selected={children.id === submenu}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickSubmenu(
                          children.id,
                          children.path,
                          children.filter
                        );
                      }}
                    >
                      <ListItemText primary={children.label} />
                    </ListItemButton>
                  </List>
                </Collapse>
              ))}
          </ListItem>
        ))}
      </List>

      <List dense>
        {filteredSecondaryList.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleClickSecondaryList(item.path)}
              selected={item.path === location.pathname}
              sx={{ minHeight: '32px' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {!collapse && <ListItemText primary={item.label} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
