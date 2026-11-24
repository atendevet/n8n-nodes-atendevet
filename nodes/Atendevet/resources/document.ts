import type { INodeProperties } from 'n8n-workflow';
import { idField } from './fields';

const template = { resource: ['documentTemplate'] };
const signature = { resource: ['documentSignature'] };

export const documentTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: template },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a document template',
				description: 'Get a prescription, certificate or consent template of the clinic',
				routing: {
					request: { method: 'GET', url: '=/documento/modelo/{{$parameter.templateId}}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many document templates',
				description: 'List the document templates of the clinic',
				routing: { request: { method: 'GET', url: '/documento/modelo' } },
			},
		],
		default: 'getAll',
	},
	idField(
		'Template ID',
		'templateId',
		{ ...template, operation: ['get'] },
		'ID of the document template in Atendevet',
	),
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Part of the template name',
		displayOptions: { show: { ...template, operation: ['getAll'] } },
		routing: { send: { type: 'query', property: 'param', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Only Active',
		name: 'active',
		type: 'boolean',
		default: true,
		description: 'Whether to return only templates in use',
		displayOptions: { show: { ...template, operation: ['getAll'] } },
		routing: { send: { type: 'query', property: 'ativo' } },
	},
];

export const documentSignatureDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: signature },
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get the signature status of a document',
				description: 'Check whether a document sent for electronic signature was signed',
				routing: {
					request: { method: 'GET', url: '=/documento/assinatura/{{$parameter.externalId}}' },
				},
			},
		],
		default: 'getStatus',
	},
	{
		displayName: 'Signature ID',
		name: 'externalId',
		type: 'string',
		required: true,
		default: '',
		description: 'Signature ID sent in the "documento.emitido" event or shown in Atendevet',
		displayOptions: { show: signature },
	},
];
