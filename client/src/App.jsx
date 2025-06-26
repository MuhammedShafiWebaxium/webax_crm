import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from './theme/shared/AppTheme';

import RootLayout from './layout/RootLayout';
import Dashboard from './pages/home';
import CompaniesList from './pages/companies';
import CompanyForm from './pages/companies/CompanyForm';
import LeadForm from './pages/leads/LeadForm';
import Login from './pages/auth/Login';
import UserForm from './pages/users/UserForm';
import UsersList from './pages/users';
import LeadsList from './pages/leads';
import LeadFollowup from './pages/leads/LeadFollowup';
import TodosList from './pages/todo';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import Unauthorized from './pages/errors/Unauthorized';
import ServerError from './pages/errors/ServerError';
import NotFound from './pages/errors/NotFound';
import Settings from './pages/settings';
import AdAccountStepper from './pages/settings/sections/integration/components/AdAccountStepper';
import AdAccountForm from './pages/settings/sections/integration/components/AdAccountForm';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

function App(props) {
  return (
    <>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RootLayout />}>
                {/* Dashboard accessible to all authenticated users */}
                <Route index element={<Dashboard />} />

                {/* Companies */}
                <Route
                  path="companies"
                  element={
                    <ProtectedRoute
                      module="companies"
                      requiredPermission="read"
                    />
                  }
                >
                  <Route index element={<CompaniesList />} />
                  <Route
                    path="create-new"
                    element={
                      <ProtectedRoute
                        module="companies"
                        requiredPermission="create"
                      />
                    }
                  >
                    <Route index element={<CompanyForm />} />
                  </Route>
                  <Route
                    path=":id/edit"
                    element={
                      <ProtectedRoute
                        module="companies"
                        requiredPermission="update"
                      />
                    }
                  >
                    <Route index element={<CompanyForm />} />
                  </Route>
                </Route>

                {/* Users */}
                <Route
                  path="users"
                  element={
                    <ProtectedRoute module="users" requiredPermission="read" />
                  }
                >
                  <Route index element={<UsersList />} />
                  <Route
                    path="create-new"
                    element={
                      <ProtectedRoute
                        module="users"
                        requiredPermission="create"
                      />
                    }
                  >
                    <Route index element={<UserForm />} />
                  </Route>
                  <Route
                    path=":id/edit"
                    element={
                      <ProtectedRoute
                        module="users"
                        requiredPermission="update"
                      />
                    }
                  >
                    <Route index element={<UserForm />} />
                  </Route>
                </Route>

                {/* Leads */}
                <Route
                  path="leads"
                  element={
                    <ProtectedRoute module="leads" requiredPermission="read" />
                  }
                >
                  <Route index element={<LeadsList />} />
                  <Route
                    path="create-new"
                    element={
                      <ProtectedRoute
                        module="leads"
                        requiredPermission="create"
                      />
                    }
                  >
                    <Route index element={<LeadForm />} />
                  </Route>
                  <Route
                    path=":id/edit"
                    element={
                      <ProtectedRoute
                        module="leads"
                        requiredPermission="update"
                      />
                    }
                  >
                    <Route index element={<LeadForm />} />
                  </Route>
                  <Route
                    path=":id/followup"
                    element={
                      <ProtectedRoute
                        module="leads"
                        requiredPermission="followup"
                      />
                    }
                  >
                    <Route index element={<LeadFollowup />} />
                  </Route>
                </Route>

                {/* Todos */}
                <Route
                  path="todos"
                  element={
                    <ProtectedRoute module="todos" requiredPermission="read" />
                  }
                >
                  <Route index element={<TodosList />} />
                </Route>

                {/* Settings */}
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute
                      module="settings"
                      requiredPermission="read"
                    />
                  }
                >
                  <Route index element={<Settings />} />

                  <Route
                    path="integration/ad-account/create-new"
                    element={
                      <ProtectedRoute
                        module="settings"
                        requiredPermission="create"
                      />
                    }
                  >
                    <Route index element={<AdAccountStepper />} />
                  </Route>
                  <Route
                    path="integration/ad-account/:id/edit"
                    element={
                      <ProtectedRoute
                        module="settings"
                        requiredPermission="update"
                      />
                    }
                  >
                    <Route index element={<AdAccountForm />} />
                  </Route>
                </Route>

                {/* Error Pages */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/server-error" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppTheme>
    </>
  );
}

export default App;
