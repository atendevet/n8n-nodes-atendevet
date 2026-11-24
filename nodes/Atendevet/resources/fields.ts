import type { IDataObject, INodeProperties, INodePropertyRouting } from 'n8n-workflow';

type Show = Record<string, string[]>;

export function idField(
	displayName: string,
	name: string,
	show: Show,
	description: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'number',
		required: true,
		default: 0,
		description,
		displayOptions: { show },
	};
}

export function dateField(
	displayName: string,
	name: string,
	query: string,
	show: Show,
	description: string,
	required = false,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'dateTime',
		required,
		default: '',
		description,
		displayOptions: { show },
		routing: {
			send: {
				type: 'query',
				property: query,
				value: '={{ $value ? $value.slice(0, 10) : undefined }}',
			},
		},
	};
}

/** Return All walks the pages while the API says there is a next one; otherwise only the first page, sized by Limit. */
export function paginationFields(show: Show, pageSizeQuery: string): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			displayOptions: { show },
			routing: { send: { paginate: '={{ $value }}' } },
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: 100 },
			default: 50,
			description: 'Max number of results to return',
			displayOptions: { show: { ...show, returnAll: [false] } },
			routing: { send: { type: 'query', property: pageSizeQuery } },
		},
	];
}

export function pagedRouting(
	url: string,
	pageQuery: string,
	pageSizeQuery: string,
	qs: IDataObject = {},
): INodePropertyRouting {
	const nextPage = `={{ Object.assign({}, $request.qs, { ${pageQuery}: $response.body ? $response.body.page + 1 : 1 }) }}`;
	return {
		request: { method: 'GET', url, qs: { ...qs, [pageQuery]: 1, [pageSizeQuery]: 100 } },
		output: { postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }] },
		operations: {
			pagination: {
				type: 'generic',
				properties: {
					continue: '={{ $response.body.hasNextPage === true }}',
					// n8n replaces the whole query string with this one, so it starts from the original request
					request: { qs: nextPage as unknown as IDataObject },
				},
			},
		},
	};
}
