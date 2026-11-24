import type { INodeProperties } from 'n8n-workflow';
import { idField, pagedRouting, paginationFields } from './fields';

const show = { resource: ['client'] };

export const clientDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a client',
				description: 'Get a client (legal guardian of the patients) with contact details and pets',
				routing: { request: { method: 'GET', url: '=/cliente/{{$parameter.clientId}}' } },
			},
			{
				name: 'Get Address',
				value: 'getAddress',
				action: 'Get the address of a client',
				description: 'Get the address registered for a client',
				routing: { request: { method: 'GET', url: '=/cliente/{{$parameter.clientId}}/endereco' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many clients',
				description: 'Search clients by name, phone or document',
				routing: pagedRouting('/cliente/search/paginated', 'Page', 'PageSize', { Active: true }),
			},
		],
		default: 'get',
	},
	idField(
		'Client ID',
		'clientId',
		{ ...show, operation: ['get', 'getAddress'] },
		'ID of the client in Atendevet',
	),
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		placeholder: 'e.g. Maria',
		description: 'Name, phone or document of the client. Leave empty to list everyone.',
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		routing: { send: { type: 'query', property: 'Param', value: '={{ $value || undefined }}' } },
	},
	...paginationFields({ ...show, operation: ['getAll'] }, 'PageSize'),
];
