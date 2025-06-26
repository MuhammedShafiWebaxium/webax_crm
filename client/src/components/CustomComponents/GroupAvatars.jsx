import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

export default function GroupAvatars({ data, max = 4 }) {
  return (
    <AvatarGroup max={max}>
      {data?.map((entry) => (
        <Avatar alt={entry?.jpg} src={entry?.jpg} />
      ))}
    </AvatarGroup>
  );
}
