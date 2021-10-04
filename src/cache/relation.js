const KEY_PLAN = 'Plan';
const KEY_PLANS = 'Plans';
const KEY_SCHEMA = 'Schema';
const KEY_TABLE = 'Relation Name';

const getRelationName = (plan, names) => {
  if (plan[KEY_SCHEMA] && plan[KEY_TABLE]) {
    const name = plan[KEY_SCHEMA] + '.' + plan[KEY_TABLE];
    names.push(name);
  }

  if (plan[KEY_PLANS]) {
    const plans = plan[KEY_PLANS];
    for (let i = 0; i < plans.length; i++) getRelationName(plans[i], names);
  }
};

export const getRelationNames = plans => {
  const names = [];

  for (let i = 0; i < plans.length; i++)
    getRelationName(plans[i][KEY_PLAN], names);
  console.log(plans[0][KEY_PLAN]);
  return names.sort();
};
