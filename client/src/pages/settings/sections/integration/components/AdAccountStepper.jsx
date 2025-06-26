import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { List, ListItem, ListItemText } from '@mui/material';
import AdAccountForm from './AdAccountForm';
import { stopLoading } from '../../../../../redux/loadingSlice';
import { useDispatch } from 'react-redux';
import CustomButton from '../../../../../components/CustomComponents/CustomButton';
import { useNavigate } from 'react-router-dom';

const steps = ['App Setup', 'Create ad account'];

const AdAccountStepper = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [activeStep, setActiveStep] = React.useState(0);

  const [error, setError] = React.useState(false);

  const handleNext = () => {
    if (activeStep < 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoBack = () => {
    navigate('/settings', { state: { value: 'Integration' } });
  };

  React.useEffect(() => {
    dispatch(stopLoading());
  }, []);
  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Add Ad Account
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const labelProps = {};

            if (index === 1 && error) {
              labelProps.optional = (
                <Typography variant="caption" color="error">
                  Error while adding ad account
                </Typography>
              );

              labelProps.error = true;
            }
            return (
              <Step key={label}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <React.Fragment>
          {activeStep === 0 ? (
            <Box px={5}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Follow these steps to connect your Facebook Ad Account and start
                receiving leads:
              </Typography>

              <List sx={{ listStyleType: 'decimal', pl: 2 }} disablePadding>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Go to Facebook Developers and create an app at https://developers.facebook.com/apps/" />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="In your app dashboard, add the 'Leads Retrieval' product." />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Generate a long-lived access token with 'leads_retrieval', 'pages_read_engagement', and 'ads_management' permissions." />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Get your Facebook Page ID and Ad Account ID. You can find these in your Facebook Business Manager." />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText primary="Subscribe your app to the Facebook Page to receive lead notifications via webhook. Ensure your webhook endpoint is publicly accessible." />
                </ListItem>
              </List>

              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Need help? Refer to the{' '}
                <a
                  href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook Lead Ads Guide
                </a>
                .
              </Typography>
            </Box>
          ) : activeStep === 1 ? (
            <AdAccountForm
              error={error}
              setError={setError}
              setActiveStep={setActiveStep}
            />
          ) : (
            <Box textAlign="center" mt={4}>
              <Typography variant="h6" gutterBottom>
                🎉 Your Facebook Ad Account has been successfully connected!
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                You will now start receiving leads directly from your Facebook
                campaigns.
              </Typography>
              <CustomButton
                name="Go Back To Integrations"
                onClick={handleGoBack}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            {activeStep === 1 && (
              <Button color="inherit" onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === 0 && <Button onClick={handleNext}>Next</Button>}
          </Box>
        </React.Fragment>
      </Box>
    </Box>
  );
};

export default AdAccountStepper;
