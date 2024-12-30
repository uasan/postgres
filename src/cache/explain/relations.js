import {
  KEY_ALIAS,
  KEY_FILTER,
  KEY_HASH_COND,
  KEY_INDEX_COND,
  KEY_JOIN_FILTER,
  KEY_OUTPUT,
  KEY_PLAN,
  KEY_PLANS,
  KEY_REL_NAME,
  KEY_SCHEMA,
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

  if (plan[KEY_PLAN]) {
    setContext(context, plan[KEY_PLAN]);
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

function addCondition(context, sql) {
  if (sql.includes(' = ')) {
    context.conditions.add(sql.slice(1, -1));
  }
}

export function setConditions(context) {
  for (let sql of context.conditions) {
    sql;
  }
}

export function setRelations(context, plans) {
  for (const plan of plans) {
    setContext(context, plan);
  }
}
