import { environment } from '../../environments/environment';

export enum ApiEndpoint {
  Models = '/models',
  ChatCompletions = '/chat/completions',
}

export const apiUrl = (endpoint: ApiEndpoint): string => `${environment.apiBaseUrl}${endpoint}`;
