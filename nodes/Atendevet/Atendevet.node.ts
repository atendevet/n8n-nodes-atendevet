import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { clientDescription } from './resources/client';
import { documentSignatureDescription, documentTemplateDescription } from './resources/document';
import { leadDescription } from './resources/lead';
import { patientDescription } from './resources/patient';
import { saleDescription, salesReportDescription } from './resources/sale';

export class Atendevet implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendevet',
		name: 'atendevet',
		icon: { light: 'file:../../icons/atendevet.svg', dark: 'file:../../icons/atendevet.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Read patients, clients, sales, reports, CRM leads and documents from your Atendevet veterinary clinic',
		defaults: {
			name: 'Atendevet',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'atendevetApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Client', value: 'client' },
					{ name: 'Document Signature', value: 'documentSignature' },
					{ name: 'Document Template', value: 'documentTemplate' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Patient', value: 'patient' },
					{ name: 'Sale', value: 'sale' },
					{ name: 'Sales Report', value: 'salesReport' },
				],
				default: 'patient',
			},
			...clientDescription,
			...documentSignatureDescription,
			...documentTemplateDescription,
			...leadDescription,
			...patientDescription,
			...saleDescription,
			...salesReportDescription,
		],
	};
}
