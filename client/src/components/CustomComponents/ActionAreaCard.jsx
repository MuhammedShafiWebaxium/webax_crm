import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

export default function ActionAreaCard({ data: { label, data, description } }) {
  return (
    <Card sx={{ maxWidth: 345, p: 0 }}>
      <CardActionArea>
        <CardContent
          sx={{
            '&.MuiCardContent-root': {
              padding: '16px',
            },
          }}
        >
          <Typography gutterBottom variant="h5" component="div">
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
