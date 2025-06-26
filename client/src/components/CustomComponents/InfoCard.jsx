import {
  Avatar,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

const InfoCard = ({ logo, title, description, onClick }) => {
  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Avatar
            alt="university"
            src={logo}
            sx={{ width: '64px', height: '100%' }}
          />
          <Stack
            direction="column"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'start',
              flexGrow: '1',
              gap: 1,
            }}
          >
            <Stack>
              <Typography component="h2" variant="h6" sx={{ mb: 0 }} gutterBottom>
                {title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
                gutterBottom
              >
                {description}
              </Typography>
            </Stack>

            <Button onClick={onClick} variant="outlined" size="small">
              Know more
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
