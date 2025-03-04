import { addCondition } from './parser.js';
import {
  KEY_PLAN,
  KEY_PLANS,
  KEY_ALIAS,
  KEY_FILTER,
  KEY_OUTPUT,
  KEY_SCHEMA,
  KEY_REL_NAME,
  KEY_HASH_COND,
  KEY_INDEX_COND,
  KEY_JOIN_FILTER,
  KEY_RECHECK_COND,
  KEY_NODE_TYPE,
  KEY_FUNCTION_NAME,
} from './constants.js';

function setContext(context, plan) {
  if (plan[KEY_ALIAS] && plan[KEY_SCHEMA] && plan[KEY_REL_NAME]) {
    context.setAlias(plan[KEY_ALIAS], plan[KEY_SCHEMA], plan[KEY_REL_NAME]);
  }

  if (plan[KEY_OUTPUT]) {
    for (const name of plan[KEY_OUTPUT]) {
      context.outputs.add(name);
    }
  }

  if (plan[KEY_FILTER]) {
    addCondition(context, plan[KEY_FILTER]);
  }

  if (plan[KEY_HASH_COND]) {
    addCondition(context, plan[KEY_HASH_COND]);
  }

  if (plan[KEY_INDEX_COND]) {
    addCondition(context, plan[KEY_INDEX_COND]);
  }

  if (plan[KEY_JOIN_FILTER]) {
    addCondition(context, plan[KEY_JOIN_FILTER]);
  }

  if (plan[KEY_RECHECK_COND]) {
    addCondition(context, plan[KEY_RECHECK_COND]);
  }

  if (plan[KEY_PLAN]) {
    setContext(context, plan[KEY_PLAN]);
  }

  if (plan[KEY_NODE_TYPE] === 'Function Scan') {
    if (plan[KEY_SCHEMA] !== 'pg_catalog') {
      context.noCaches.push({
        reason: 'NO_SQL_FUNCTION',
        relation: plan[KEY_SCHEMA] + '.' + plan[KEY_FUNCTION_NAME],
      });
    }
  }

  if (plan[KEY_PLANS]) {
    for (const subPlan of plan[KEY_PLANS]) {
      setContext(context, subPlan);
    }
  }
}

export function setColumns(context) {
  for (let name of context.outputs) {
    if (name.includes('.')) {
      const index = name.indexOf('.');
      const alias = name.slice(0, index);

      if (context.aliases.has(alias)) {
        //context.outputs.delete(name);
        context.aliases.get(alias).addColumn(name.slice(index + 1));
      }
    }
  }
}

export function setRelations(context, plans) {
  for (let i = 0; i < plans.length; i++) {
    setContext(context, plans[i]);
  }
}
