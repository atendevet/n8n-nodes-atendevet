import type {
	IDataObject,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const CREDENTIAL = 'atendevetApi';

const DEFAULT_BASE_URL = 'https://api.atendevet.app';

type Context = ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions;

/** Atendevet answers business errors with 400 and a list of { message }. */
export function apiErrorMessage(error: unknown): string | undefined {
	const candidates = [
		(error as { response?: { data?: unknown } })?.response?.data,
		(error as { cause?: { response?: { data?: unknown } } })?.cause?.response?.data,
		(error as { description?: unknown })?.description,
	];
	for (const candidate of candidates) {
		let value = candidate;
		if (typeof value === 'string') {
			try {
				value = JSON.parse(value);
			} catch {
				continue;
			}
		}
		if (Array.isArray(value)) {
			const messages = value
				.map((n) => (n as IDataObject)?.message ?? (n as IDataObject)?.Message)
				.filter((m): m is string => typeof m === 'string' && m.length > 0);
			if (messages.length > 0) return messages.join(' ');
		}
	}
	return undefined;
}

export async function atendevetApiRequest(
	this: Context,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<unknown> {
	const credentials = await this.getCredentials(CREDENTIAL);
	const baseUrl =
		typeof credentials.baseUrl === 'string' && credentials.baseUrl
			? credentials.baseUrl
			: DEFAULT_BASE_URL;

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl.replace(/\/+$/, '')}${path}`,
		body,
		json: true,
	};
	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, options);
	} catch (error) {
		const message = apiErrorMessage(error);
		throw new NodeApiError(this.getNode(), error as JsonObject, message ? { message } : {});
	}
}
