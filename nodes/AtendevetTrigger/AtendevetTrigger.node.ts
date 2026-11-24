import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IHookFunctions,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';
import { atendevetApiRequest } from '../Atendevet/shared/transport';

interface Subscription {
	id: number;
	endpointUrl: string;
	eventos?: string[];
	ativo?: boolean;
}

interface CatalogEvent {
	chave: string;
	grupo?: string;
	descricao?: string;
	dadosTrafegados?: string;
}

function sameEvents(a: string[], b: string[]): boolean {
	const left = [...new Set(a.map((e) => e.toLowerCase()))].sort();
	const right = [...new Set(b.map((e) => e.toLowerCase()))].sort();
	return left.length === right.length && left.every((event, i) => event === right[i]);
}

function signatureMatches(received: unknown, body: Buffer, secret: string): boolean {
	if (typeof received !== 'string') return false;
	const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(body).digest('hex')}`);
	const actual = Buffer.from(received.trim().toLowerCase());
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export class AtendevetTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendevet Trigger',
		name: 'atendevetTrigger',
		icon: { light: 'file:../../icons/atendevet.svg', dark: 'file:../../icons/atendevet.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when something happens in your Atendevet clinic',
		defaults: {
			name: 'Atendevet Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'atendevetApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event Names or IDs',
				name: 'events',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getEvents',
				},
				required: true,
				default: [],
				description:
					'Clinic events that start the workflow. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName:
					'To try it, click "Listen for test event" and then click "Test" on this webhook in Atendevet, under Perfil → Configurações → Integrações',
				name: 'testNotice',
				type: 'notice',
				default: '',
			},
		],
	};

	methods = {
		loadOptions: {
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const catalog = (await atendevetApiRequest.call(
					this,
					'GET',
					'/webhook-assinatura/catalogo',
				)) as CatalogEvent[];
				return (catalog ?? [])
					.map((event) => ({
						name: event.grupo
							? `${event.grupo}: ${event.descricao ?? event.chave}`
							: (event.descricao ?? event.chave),
						value: event.chave,
						description: event.dadosTrafegados
							? `${event.chave} · ${event.dadosTrafegados}`
							: event.chave,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				if (staticData.subscriptionId === undefined) return false;

				const url = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const subscriptions = (await atendevetApiRequest.call(
					this,
					'GET',
					'/webhook-assinatura',
				)) as Subscription[];
				const current = (subscriptions ?? []).find((s) => s.id === staticData.subscriptionId);

				if (
					current &&
					current.endpointUrl === url &&
					current.ativo !== false &&
					sameEvents(events, current.eventos ?? [])
				) {
					return true;
				}

				if (current) {
					await atendevetApiRequest.call(this, 'DELETE', `/webhook-assinatura/${current.id}`);
				}
				delete staticData.subscriptionId;
				delete staticData.secret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default') as string;
				if (!/^https:\/\//i.test(url)) {
					throw new NodeOperationError(
						this.getNode(),
						'Atendevet only sends events to public https addresses. Set the n8n public URL (N8N_WEBHOOK_URL) to an https address and try again.',
					);
				}

				const events = this.getNodeParameter('events') as string[];
				const secret = randomBytes(32).toString('hex');
				const name = `n8n: ${this.getWorkflow().name ?? 'workflow'}`.slice(0, 100);

				const created = (await atendevetApiRequest.call(this, 'POST', '/webhook-assinatura', {
					nome: name,
					endpointUrl: url,
					eventos: events,
					segredo: secret,
				})) as Subscription;

				const staticData = this.getWorkflowStaticData('node');
				staticData.subscriptionId = created.id;
				staticData.secret = secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				if (staticData.subscriptionId !== undefined) {
					try {
						await atendevetApiRequest.call(
							this,
							'DELETE',
							`/webhook-assinatura/${String(staticData.subscriptionId)}`,
						);
					} catch (error) {
						this.logger.warn('Atendevet: could not delete the webhook subscription', {
							subscriptionId: staticData.subscriptionId,
							error: (error as Error).message,
						});
						return false;
					}
				}
				delete staticData.subscriptionId;
				delete staticData.secret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const secret = this.getWorkflowStaticData('node').secret as string | undefined;
		const request = this.getRequestObject() as unknown as { rawBody?: Buffer; body?: unknown };
		const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));

		if (
			!secret ||
			!signatureMatches(this.getHeaderData()['x-atendevet-signature'], rawBody, secret)
		) {
			const response = this.getResponseObject();
			response.status(401).send('Invalid Atendevet signature');
			return { noWebhookResponse: true };
		}

		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events') as string[];
		if (events.length > 0 && !events.includes(String(body.evento))) {
			return { webhookResponse: { ignored: true } };
		}

		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
