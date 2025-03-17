import {
  KEY_PLAN,
  KEY_PLANS,
  KEY_ALIAS,
  KEY_FILTER,
  KEY_OUTPUT,
  KEY_SCHEMA,
  KEY_REL_NAME,
  KEY_NODE_TYPE,
  KEY_HASH_COND,
  KEY_INDEX_COND,
  KEY_JOIN_FILTER,
  KEY_RECHECK_COND,
  KEY_FUNCTION_NAME,
} from './constants.js';

function setContext(context, plan) {
  switch (plan[KEY_NODE_TYPE]) {
    case 'ModifyTable':
      context.isModifyTable = true;
      return;

    case 'Function Scan':
      if (plan[KEY_SCHEMA] !== 'pg_catalog') {
        context.noCaches.push({
          reason: 'NO_SQL_FUNCTION',
          relation: plan[KEY_SCHEMA] + '.' + plan[KEY_FUNCTION_NAME],
        });
      }
      break;
  }

  if (plan[KEY_ALIAS] && plan[KEY_SCHEMA] && plan[KEY_REL_NAME]) {
    switch (plan[KEY_SCHEMA]) {
      case 'pg_catalog':
      case 'information_schema':
        break;

      default:
        context.setAlias(plan[KEY_ALIAS], plan[KEY_SCHEMA], plan[KEY_REL_NAME]);
    }
  }

  if (plan[KEY_OUTPUT]) {
    for (const name of plan[KEY_OUTPUT]) {
      context.outputs.add(name);
    }
  }

  if (plan[KEY_FILTER]) {
    context.addCondition(plan[KEY_FILTER]);
  }

  if (plan[KEY_HASH_COND]) {
    context.addCondition(plan[KEY_HASH_COND]);
  }

  if (plan[KEY_INDEX_COND]) {
    context.addCondition(plan[KEY_INDEX_COND]);
  }

  if (plan[KEY_JOIN_FILTER]) {
    context.addCondition(plan[KEY_JOIN_FILTER]);
  }

  if (plan[KEY_RECHECK_COND]) {
    context.addCondition(plan[KEY_RECHECK_COND]);
  }

  if (plan[KEY_PLAN]) {
    setContext(context, plan[KEY_PLAN]);
  }

  if (plan[KEY_PLANS]) {
    for (const subPlan of plan[KEY_PLANS]) {
      setContext(context, subPlan);
    }
  }
}

export function explain(context, plans) {
  // console.dir(plans, {
  //   depth: null,
  //   colors: true,
  // });

  for (let i = 0; i < plans.length; i++) {
    setContext(context, plans[i]);
  }
}
