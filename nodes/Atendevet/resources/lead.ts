import type { INodeProperties } from 'n8n-workflow';
import { dateField, idField, pagedRouting, paginationFields } from './fields';

const show = { resource: ['lead'] };

export const leadDescription: INodeProperties[] = [
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
				action: 'Get a lead',
				description: 'Get a CRM lead with stage, contact and campaign',
				routing: { request: { method: 'GET', url: '=/crm/gestao/{{$parameter.leadId}}' } },
			},
			{
				name: 'Get Funnel',
				value: 'getFunnel',
				action: 'Get the CRM funnel',
				description: 'Count the leads in each stage of the funnel',
				routing: { request: { method: 'GET', url: '/crm/gestao/funil' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many leads',
				description: 'List CRM leads',
				routing: pagedRouting('/crm/gestao', 'page', 'pageSize'),
			},
		],
		default: 'getAll',
	},
	idField('Lead ID', 'leadId', { ...show, operation: ['get'] }, 'ID of the lead in Atendevet'),
	...paginationFields({ ...show, operation: ['getAll'] }, 'pageSize'),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Campaign',
				name: 'campaign',
				type: 'string',
				default: '',
				description: 'Campaign name of the link that brought the lead',
				routing: { send: { type: 'query', property: 'campanha' } },
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Name, phone or email of the lead',
				routing: { send: { type: 'query', property: 'busca' } },
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Where the lead came from, as shown in the CRM',
				routing: { send: { type: 'query', property: 'origem' } },
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'tag' } },
			},
		],
	},
	dateField(
		'Created From',
		'createdFrom',
		'criadoDe',
		{ ...show, operation: ['getAll', 'getFunnel'] },
		'Only leads created on or after this day',
	),
	dateField(
		'Created To',
		'createdTo',
		'criadoAte',
		{ ...show, operation: ['getAll', 'getFunnel'] },
		'Only leads created on or before this day',
	),
];
