import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AtendevetApi implements ICredentialType {
	name = 'atendevetApi';

	displayName = 'Atendevet API';

	icon: Icon = { light: 'file:../icons/atendevet.svg', dark: 'file:../icons/atendevet.dark.svg' };

	documentationUrl = 'https://github.com/atendevet/n8n-nodes-atendevet#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Key created in Atendevet under Profile → Settings → Integrations. Choose "AI agent" so the key comes with the queries and the event notifications.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.atendevet.app',
			description: 'Change only to connect to another Atendevet environment',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/integracao/chave',
			method: 'GET',
		},
	};
}
