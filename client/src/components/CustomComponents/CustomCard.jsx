import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

const CustomCard = ({
  title,
  subTitle,
  chipLabel,
  chipColor,
  description,
  content,
  variant,
  titleSx,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <CardContent>
        <Typography
          component="h2"
          variant={variant ? variant : 'subtitle2'}
          gutterBottom
          sx={titleSx}
        >
          {title}
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          {subTitle && (
            <Stack
              direction="row"
              sx={{
                alignContent: { xs: 'center', sm: 'flex-start' },
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="h4" component="p">
                {subTitle}
              </Typography>
              {chipLabel && (
                <Chip size="small" color={chipColor} label={chipLabel} />
              )}
            </Stack>
          )}
          {description && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          )}
        </Stack>
        {content}
      </CardContent>
    </Card>
  );
};

export default CustomCard;
