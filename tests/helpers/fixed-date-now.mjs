const fixed = Date.parse(process.env.FIXED_DATE_NOW ?? '');
if (!Number.isFinite(fixed)) {
  throw new Error('fixed-date-now: FIXED_DATE_NOW must be an ISO 8601 timestamp');
}
Date.now = () => fixed;
