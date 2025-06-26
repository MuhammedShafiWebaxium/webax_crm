import { format } from 'date-fns';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

export const formatDateTime = (dateString) => {
  return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
};

const sourceList = [
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
];

export const sourceListOptions = sourceList.map((item) => ({
  label: item,
  value: item,
}));

const stageList = [
  'New Lead',
  'Follow-up',
  'Negotiation', // Discussion on terms, pricing, or customizations.
  'Closed',
];

export const stageListOptions = stageList.map((item) => ({
  label: item,
  value: item,
}));

const statusList = [
  'New',
  'Invalid Number', // The phone number is incorrect or not in service.
  'No Response', // Multiple attempts made, but no reply from the lead.
  'Wrong Contact', // The number belongs to someone else, not the intended lead.
  'Call Back Later', // The lead asked to be contacted at a later time.
  'Contacted',
  'Interested',
  'Not Interested',
  'Lost', // Lead decided not to proceed or chose a competitor.
  'Re-engaging', // Trying to revive a lost or inactive lead.
  'Converted', // Lead has become a customer.
];

export const statusListOptions = statusList.map((item) => ({
  label: item,
  value: item,
}));
const source = ['Facebook', 'Google', 'WhatsApp', 'Email'];

export const sources = source.map((item) => ({
  label: item,
  value: item,
}));

const industry = ['Facebook', 'Google', 'WhatsApp', 'Email'];

export const industries = industry.map((item) => ({
  label: item,
  value: item,
}));

// export const roles = [
//   'Admin',
//   'Team Lead',
//   'Sales Representative',
//   'Support Staff',
//   'HR',
//   'Finance',
//   'Marketing',
//   'Developer',
//   'Viewer',
// ];

// export const roleOptions = roles.map((item) => ({
//   label: item,
//   value: item,
// }));

const gender = ['Male', 'Female', 'Prefer Not To Say'];

export const genderOptions = gender.map((item) => ({
  label: item,
  value: item,
}));

const eligibility = ['Unknown', 'Eligible', 'Ineligible'];

export const eligibilityOptions = eligibility.map((item) => ({
  label: item,
  value: item,
}));

const todoPriority = ['Low', 'Medium', 'High'];

export const todoPriorityOptions = todoPriority.map((item) => ({
  label: item,
  value: item,
}));
