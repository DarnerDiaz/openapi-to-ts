// Format support for date, uuid, email, etc.
export const FORMAT_MAP = {
  'date': 'string',  // Format: date (YYYY-MM-DD)
  'date-time': 'string',  // Format: date-time (ISO8601)
  'uuid': 'string',  // Format: uuid
  'email': 'string',  // Format: email
  'uri': 'string',  // Format: uri
  'ipv4': 'string',  // Format: ipv4
  'binary': 'Buffer',  // Format: binary
};
