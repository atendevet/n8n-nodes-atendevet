import type { INodeProperties } from 'n8n-workflow';
import { idField } from './fields';

const show = { resource: ['patient'] };

export const patientDescription: INodeProperties[] = [
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
				action: 'Get a patient',
				description: 'Get a patient (pet) with species, breed, birth date and client',
				routing: { request: { method: 'GET', url: '=/paciente/{{$parameter.patientId}}' } },
			},
			{
				name: 'Get History',
				value: 'getHistory',
				action: 'Get the history of a patient',
				description:
					'List the actions recorded for a patient: visits, vaccines, documents and sales',
				routing: { request: { method: 'GET', url: '=/paciente/{{$parameter.patientId}}/resume' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many patients',
				description: 'Search patients by name or by client',
				routing: {
					request: { method: 'GET', url: '/paciente/search', qs: { Page: 1, Active: true } },
				},
			},
			{
				name: 'Get Medical Background',
				value: 'getBackground',
				action: 'Get the medical background of a patient',
				description: 'Get allergies, chronic conditions and other background of a patient',
				routing: {
					request: { method: 'GET', url: '=/paciente/antecedentes/{{$parameter.patientId}}' },
				},
			},
			{
				name: 'Get Recent',
				value: 'getRecent',
				action: 'Get recently seen patients',
				description: 'List the patients seen most recently by the clinic',
				routing: { request: { method: 'GET', url: '/paciente' } },
			},
			{
				name: 'Get Weights',
				value: 'getWeights',
				action: 'Get the weights of a patient',
				description: 'List the weight records of a patient',
				routing: { request: { method: 'GET', url: '=/paciente/pesagem/{{$parameter.patientId}}' } },
			},
		],
		default: 'get',
	},
	idField(
		'Patient ID',
		'patientId',
		{ ...show, operation: ['get', 'getHistory', 'getBackground', 'getWeights'] },
		'ID of the patient in Atendevet',
	),
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		placeholder: 'e.g. Thor',
		description: 'Name of the patient or of the client',
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		routing: { send: { type: 'query', property: 'Param', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		routing: { send: { type: 'query', property: 'PageSize' } },
	},
];
