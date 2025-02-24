export function reportNoCache({ relation, reason }) {
  console.warn(`SQL query not cached because: ${relation} - ${reason}`);
}
