// import 'rsuite/dist/rsuite.min.css'; // Necessary for styling RSuite components
// import { DateRangePicker } from 'rsuite';
// import { Box } from '@mui/material';
// import { useLocation, useNavigate } from 'react-router-dom';

// const CustomDateRange = () => {
//   const location = useLocation();
//   const state = location.state; // Get state from the location

//   const navigate = useNavigate();

//   const handleDateChange = (value) => {
//     if (value && value.length === 2) {
//       // Format date to local time zone in YYYY-MM-DD format
//       const formatDate = (date) => {
//         const d = new Date(date);
//         const year = d.getFullYear();
//         const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
//         const day = d.getDate().toString().padStart(2, '0');
//         return `${year}-${month}-${day}`;
//       };

//       const formattedStart = formatDate(value[0]);
//       const formattedEnd = formatDate(value[1]);

//       const path = location.pathname;

//       const data = {
//         start: formattedStart,
//         end: formattedEnd,
//       };

//       navigate(path, { state: data });
//     }
//   };

//   // Set initial value if state has start and end dates
//   const initialValue =
//     state && state.start && state.end
//       ? [new Date(state.start), new Date(state.end)]
//       : undefined;

//   return (
//     <Box
//       sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 200 }}
//     >
//       <DateRangePicker
//         style={{ width: '100%' }} // Ensures it adapts well in an MUI layout
//         appearance="default"
//         placeholder="Select Date Range"
//         placement="auto" // Auto-adjusts dropdown position
//         preventOverflow // Prevents it from overflowing
//         onChange={handleDateChange}
//         value={initialValue} // Set value to initialValue if available
//       />
//     </Box>
//   );
// };

// export default CustomDateRange;
