import {getExternal, getInternal} from 'app/views/discover/aggregations/utils';
import {getQueryStringFromQuery} from 'app/views/discover/utils';

export function getDiscoverUrlPathFromDiscoverQuery({organization, selection, query}) {
  const {
    datetime,
    environments, // eslint-disable-line no-unused-vars
    ...restSelection
  } = selection;

  // Discover does not support importing these
  const {
    groupby, // eslint-disable-line no-unused-vars
    rollup, // eslint-disable-line no-unused-vars
    name, // eslint-disable-line no-unused-vars
    orderby,
    ...restQuery
  } = query;

  const orderbyTimeIndex = orderby.indexOf('time');
  const visual = orderbyTimeIndex === -1 ? 'table' : 'line-by-day';

  const aggregations = query.aggregations.map(aggregation =>
    getExternal(getInternal(aggregation))
  );
  const [, , aggregationAlias] = (aggregations.length && aggregations[0]) || [];

  // Discover expects the aggregation aliases to be in a specific format
  restQuery.orderby = `${orderbyTimeIndex === 0 ? '' : '-'}${aggregationAlias || ''}`;
  restQuery.aggregations = aggregations;

  return `/organizations/${organization.slug}/discover/${getQueryStringFromQuery({
    ...restQuery,
    ...restSelection,
    start: datetime.start,
    end: datetime.end,
    range: datetime.period,
    limit: 1000,
  })}&visualization=${visual}`;
}

export function getDiscover2UrlPathFromDiscoverQuery({organization, selection, query}) {
  console.log(organization);
  console.log(selection);
  console.log('query', query);

  const newQuery = {
    name: query.name,
    field: [...query.fields, 'count()'],
    sort: query.orderby,
    statsPeriod: selection?.datetime?.period,
  };

  console.log('newQuery', newQuery);
  const queryQueries = query.conditions.map(c => {
    const tag = c[0];
    // const val = c[2].includes(' ') ? `"${c[2]}"` : c[2];
    const val = c[2];

    const operator = c[1];
    const isNot = operator.includes('!') || operator.includes('NOT');
    const isNull = operator.includes('NULL');
    const isLike = operator.includes('LIKE');

    const hasSpace = c[2].includes(' ');

    const q = [];
    if (isNot) {
      q.push('!');
    }

    q.push(tag);
    q.push(':');

    if (hasSpace) {
      q.push('"');
    }

    if (hasSpace) {
      q.push('"');
    }

    return q.join('');
  });

  const queryQuery = queryQueries.join(' ');

  return '';
}
