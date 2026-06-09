export function internalServerError(res, err) {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
