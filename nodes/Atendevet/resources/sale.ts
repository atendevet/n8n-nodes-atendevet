import type { INodeProperties } from 'n8n-workflow';
import { dateField, idField } from './fields';

const show = { resource: ['sale'] };
const report = { resource: ['salesReport'] };

export const saleDescription: INodeProperties[] = [
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
				action: 'Get a sale',
				description: 'Get a sale or quote with status, totals and client',
				routing: { request: { method: 'GET', url: '=/nota/{{$parameter.saleId}}' } },
			},
			{
				name: 'Get Items',
				value: 'getItems',
				action: 'Get the items of a sale',
				description: 'Get the services, products, professionals and payments of a sale',
				routing: { request: { method: 'GET', url: '=/nota/{{$parameter.saleId}}/servicos' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many sales',
				description: 'List sales and quotes of a period',
				routing: { request: { method: 'GET', url: '/nota/geradas' } },
			},
		],
		default: 'get',
	},
	idField(
		'Sale ID',
		'saleId',
		{ ...show, operation: ['get', 'getItems'] },
		'ID of the sale in Atendevet',
	),
	dateField(
		'From',
		'from',
		'dataInicio',
		{ ...show, operation: ['getAll'] },
		'First day of the period',
		true,
	),
	dateField(
		'To',
		'to',
		'dataFim',
		{ ...show, operation: ['getAll'] },
		'Last day of the period',
		true,
	),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Client ID',
				name: 'clientId',
				type: 'number',
				default: 0,
				description: 'Only sales of this client',
				routing: { send: { type: 'query', property: 'clienteId' } },
			},
			{
				displayName: 'Only Receivable',
				name: 'receivable',
				type: 'boolean',
				default: false,
				description: 'Whether to return only sales with an amount still to be received',
				routing: { send: { type: 'query', property: 'aReceber' } },
			},
		],
	},
];

export const salesReportDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: report },
		options: [
			{
				name: 'Get Summary',
				value: 'getSummary',
				action: 'Get the sales summary of a period',
				description: 'Get the total, paid and open amounts of the period, by status',
				routing: { request: { method: 'GET', url: '/relatorio/venda/resumo' } },
			},
			{
				name: 'Get by Client',
				value: 'getByClient',
				action: 'Get the sales of a period by client',
				description: 'List how much each client bought in the period',
				routing: { request: { method: 'GET', url: '/relatorio/venda/cliente' } },
			},
		],
		default: 'getSummary',
	},
	dateField('From', 'from', 'inicio', report, 'First day of the period', true),
	dateField('To', 'to', 'fim', report, 'Last day of the period', true),
];
