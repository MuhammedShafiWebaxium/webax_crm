import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getLead } from '../../services/leadServices';
import { handleFormError } from '../../utils/handleFormError';
import { stopLoading } from '../../redux/loadingSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const LeadProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getLead(id);
        setLead(data?.lead);
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };
    fetchData();
  }, [id]);

  return (
    <Card elevation={4} sx={{ margin: 'auto', p: 3 }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {lead?.name || 'Unnamed Lead'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lead ID: {lead?.leadId || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Details Grid */}
        <Grid container columnSpacing={3} rowSpacing={3}>
          {/* Contact Info */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Email</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon fontSize="small" />
              <Typography variant="body1">{lead?.email || 'N/A'}</Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Phone</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneIcon fontSize="small" />
              <Typography variant="body1">
                {lead?.phoneCode} {lead?.phone || 'N/A'}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Alternative Phone</Typography>
            <Typography variant="body1">
              {lead?.alternativePhoneCode} {lead?.alternativeNumber || 'N/A'}
            </Typography>
          </Grid>

          {/* Status Info */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Gender</Typography>
            <Chip label={lead?.gender || 'N/A'} variant="outlined" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Eligibility</Typography>
            <Chip
              label={lead?.eligibility || 'Unknown'}
              color={lead?.eligibility === 'Eligible' ? 'success' : 'default'}
              variant="outlined"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Status</Typography>
            <Chip
              label={lead?.status || 'N/A'}
              color="info"
              variant="outlined"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Stage</Typography>
            <Chip
              label={lead?.stage || 'N/A'}
              color="warning"
              variant="outlined"
            />
          </Grid>

          {/* Lead Source */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">Lead Source Details</Typography>
            <Typography variant="body2">
              Source: {lead?.leadSource?.source || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              Source Lead ID: {lead?.leadSource?.sourceLeadId || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Account: {lead?.leadSource?.accountInfo?.accountName || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Campaign: {lead?.leadSource?.campaignInfo?.campaignName || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Ad Set ID: {lead?.leadSource?.campaignInfo?.adSetId || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Ad ID: {lead?.leadSource?.campaignInfo?.adId || 'N/A'}
            </Typography>
          </Grid>

          {/* Follow-up Info */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Last Follow-up</Typography>
            <Typography variant="body1">
              {lead?.lastFollowup
                ? new Date(lead.lastFollowup).toLocaleString()
                : 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Next Follow-up</Typography>
            <Typography variant="body1">
              {lead?.nextFollowup
                ? new Date(lead.nextFollowup).toLocaleString()
                : 'N/A'}
            </Typography>
          </Grid>

          {/* Converted Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Converted Date</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthIcon fontSize="small" />
              <Typography>
                {lead?.convertedDate
                  ? new Date(lead.convertedDate).toLocaleDateString()
                  : 'Not Converted'}
              </Typography>
            </Stack>
          </Grid>

          {/* Initial Note */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">Initial Note</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {lead?.initialNote || 'No notes available.'}
            </Typography>
          </Grid>

          {/* Assigned To */}
          {lead?.assigned?.staff && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">Assigned To</Typography>
              <Typography variant="body2">
                {lead?.assigned.staff.name ||
                  `Staff ID: ${lead?.assigned.staff}`}
              </Typography>
            </Grid>
          )}

          {/* Assignment History */}
          {lead?.assigned?.history?.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">Assignment History</Typography>
              {lead.assigned.history.map((entry, index) => (
                <Box key={index} mb={1}>
                  <Typography variant="body2">
                    {entry.type} to{' '}
                    <strong>{entry.staff?.name || 'Staff'}</strong> on{' '}
                    {new Date(entry.assignedDate).toLocaleString()}
                  </Typography>
                  {entry.assignedNote && (
                    <Typography variant="caption" color="text.secondary">
                      Note: {entry.assignedNote}
                    </Typography>
                  )}
                </Box>
              ))}
            </Grid>
          )}

          {/* Lead History */}
          {lead?.history?.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">Lead History</Typography>
              {lead.history.map((log, index) => (
                <Box key={index} mb={1}>
                  <Typography variant="body2">
                    [{log.type}] {log.notes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.date).toLocaleString()} by{' '}
                    {log.actionDoneBy?.name || 'User'}
                  </Typography>
                </Box>
              ))}
            </Grid>
          )}

          {/* Created Date */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Created:{' '}
              {lead?.createdAt
                ? new Date(lead.createdAt).toLocaleString()
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LeadProfile;
