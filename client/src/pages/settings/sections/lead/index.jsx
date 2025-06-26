import React from 'react';
import ActionAreaCard from '../../../../components/CustomComponents/ActionAreaCard';
import { Box, Stack, Typography } from '@mui/material';

const cardData = [
  {
    label: 'status',
    description:
      'Represents the current status of a lead in the sales process.',
    data: [
      'New',
      'Invalid Number',
      'No Response',
      'Wrong Contact',
      'Call Back Later',
      'Contacted',
      'Interested',
      'Not Interested',
      'Lost',
      'Re-engaging',
      'Converted',
    ],
  },
  {
    label: 'stage',
    description: 'Indicates the stage of the lead in the sales pipeline.',
    data: ['New Lead', 'Follow-up', 'Negotiation', 'Closed'],
  },
  {
    label: 'source',
    description:
      'Specifies the origin or source from which the lead was generated.',
    data: [
      'Unknown',
      'Youtube',
      'Google',
      'Facebook',
      'Referral',
      'Email',
      'WhatsApp',
      'Webinars',
      'Live Chat on Website',
      'Customer Support Calls',
    ],
  },
];

const LeadsSetting = () => {
  return (
    <>
      <Stack direction={'row'} alignItems={'center'} gap={2} mb={2}>
        <Typography component="h2" variant="h6">
          Leads Settings
        </Typography>

        <button type='button'>Add new field</button>
      </Stack>

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 2,
        }}
      >
        {cardData?.map((entry, index) => (
          <ActionAreaCard key={index} data={entry} />
        ))}
      </Box>
    </>
  );
};

export default LeadsSetting;
