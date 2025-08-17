import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { db } from './db';
import type { ApiConnection } from '@shared/schema';

export class ApiConnector {
  private clients: Map<string, AxiosInstance> = new Map();

  async testConnection(connection: ApiConnection): Promise<boolean> {
    try {
      const client = this.createAxiosClient(connection);
      
      // Tentar uma requisição simples (GET na base URL ou endpoint de health)
      const testEndpoint = connection.baseUrl.endsWith('/') ? 'health' : '/health';
      
      try {
        await client.get(testEndpoint, { timeout: 5000 });
        return true;
      } catch (error: any) {
        // Se o endpoint /health não existir, tentar a base URL
        if (error.response?.status === 404) {
          await client.get('/', { timeout: 5000 });
          return true;
        }
        
        // Se retornou qualquer resposta HTTP, a conexão está OK
        if (error.response) {
          return true;
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Erro ao testar conexão API:', error);
      return false;
    }
  }

  private createAxiosClient(connection: ApiConnection): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: connection.baseUrl,
      timeout: connection.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...connection.headers
      }
    };

    // Configurar autenticação baseada no tipo
    switch (connection.authType) {
      case 'bearer':
        if (connection.authConfig.token) {
          config.headers!['Authorization'] = `Bearer ${connection.authConfig.token}`;
        }
        break;
      
      case 'apikey':
        if (connection.authConfig.apiKey && connection.authConfig.headerName) {
          config.headers![connection.authConfig.headerName] = connection.authConfig.apiKey;
        }
        break;
      
      case 'basic':
        if (connection.authConfig.username && connection.authConfig.password) {
          const credentials = Buffer.from(`${connection.authConfig.username}:${connection.authConfig.password}`).toString('base64');
          config.headers!['Authorization'] = `Basic ${credentials}`;
        }
        break;
      
      case 'oauth':
        // OAuth seria implementado com fluxo completo
        if (connection.authConfig.accessToken) {
          config.headers!['Authorization'] = `Bearer ${connection.authConfig.accessToken}`;
        }
        break;
    }

    return axios.create(config);
  }

  async executeRequest(connectionId: string, endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    // Buscar conexão no banco
    const [connection]: any = await db.execute(
      `SELECT * FROM api_connections WHERE id = '${connectionId}'`
    );

    if (!connection) {
      throw new Error('Conexão API não encontrada');
    }

    const client = this.createAxiosClient(connection);
    
    // Cache do client para reutilização
    this.clients.set(connectionId, client);

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: endpoint,
      data: method.toUpperCase() !== 'GET' ? data : undefined,
      params: method.toUpperCase() === 'GET' ? data : undefined
    };

    try {
      const response = await client.request(config);
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        // Erro HTTP com resposta
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: true
        };
      } else {
        // Erro de rede ou timeout
        throw new Error(`Erro na requisição: ${error.message}`);
      }
    }
  }

  async getEndpoints(connectionId: string): Promise<string[]> {
    try {
      // Tentar descobrir endpoints através de convenções comuns
      const commonEndpoints = [
        '/api/docs',
        '/swagger',
        '/openapi.json',
        '/api/schema',
        '/docs',
        '/_health',
        '/health',
        '/status',
        '/ping'
      ];

      const [connection]: any = await db.execute(
        `SELECT * FROM api_connections WHERE id = '${connectionId}'`
      );

      if (!connection) {
        return [];
      }

      const client = this.createAxiosClient(connection);
      const availableEndpoints: string[] = [];

      for (const endpoint of commonEndpoints) {
        try {
          const response = await client.get(endpoint, { timeout: 2000 });
          if (response.status === 200) {
            availableEndpoints.push(endpoint);
            
            // Se for um endpoint de documentação, extrair mais endpoints
            if (endpoint.includes('swagger') || endpoint.includes('openapi')) {
              const schema = response.data;
              if (schema.paths) {
                availableEndpoints.push(...Object.keys(schema.paths));
              }
            }
          }
        } catch (error) {
          // Ignorar erros e tentar próximo endpoint
        }
      }

      return availableEndpoints;
    } catch (error) {
      console.error('Erro ao descobrir endpoints:', error);
      return [];
    }
  }

  async discoverSchema(connectionId: string, endpoint: string): Promise<any> {
    try {
      const response = await this.executeRequest(connectionId, endpoint, 'GET');
      
      if (response.error) {
        return null;
      }

      // Analisar estrutura da resposta para criar schema
      const data = response.data;
      
      if (Array.isArray(data) && data.length > 0) {
        // Array de objetos - extrair schema do primeiro item
        return {
          type: 'array',
          itemSchema: this.extractObjectSchema(data[0])
        };
      } else if (typeof data === 'object' && data !== null) {
        // Objeto único
        return {
          type: 'object',
          schema: this.extractObjectSchema(data)
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao descobrir schema:', error);
      return null;
    }
  }

  private extractObjectSchema(obj: any): any {
    const schema: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        schema[key] = { type: 'null' };
      } else if (typeof value === 'string') {
        schema[key] = { type: 'string' };
      } else if (typeof value === 'number') {
        schema[key] = { type: 'number' };
      } else if (typeof value === 'boolean') {
        schema[key] = { type: 'boolean' };
      } else if (Array.isArray(value)) {
        schema[key] = { 
          type: 'array',
          itemType: value.length > 0 ? typeof value[0] : 'unknown'
        };
      } else if (typeof value === 'object') {
        schema[key] = {
          type: 'object',
          schema: this.extractObjectSchema(value)
        };
      }
    }

    return schema;
  }
}

export const apiConnector = new ApiConnector();