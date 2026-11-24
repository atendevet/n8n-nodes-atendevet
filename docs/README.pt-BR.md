# Nós do Atendevet para o n8n

[English](../README.md) · **Português**

Nós oficiais do [Atendevet](https://www.atendevet.com.br) para o n8n. O Atendevet é o sistema de gestão de clínicas, hospitais e médicos-veterinários de atendimento domiciliar.

- **Atendevet Trigger** começa um fluxo quando algo acontece na clínica: um agendamento é marcado, um pagamento é recebido, uma vacina está para vencer, um documento é assinado, chega um lead novo no CRM e cerca de 40 outros eventos.
- **Atendevet** lê os dados da clínica num passo do fluxo: pacientes, responsáveis legais, vendas, relatórios de vendas, leads do CRM, modelos de documento e a situação da assinatura de documentos. Também funciona como ferramenta do agente de IA do n8n.

[Instalação](#instalação) · [Credencial](#credencial) · [Gatilho](#atendevet-trigger) · [Operações](#operações-do-nó-atendevet) · [Agentes de IA e MCP](#agentes-de-ia-e-mcp) · [Fluxos prontos](#fluxos-prontos) · [Links](#links)

## Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) de nós da comunidade do n8n e instale `@atendevet/n8n-nodes-atendevet`. No n8n: **Settings → Community Nodes → Install**.

## Credencial

Os nós usam uma chave de API do Atendevet.

1. No Atendevet, abra **Perfil → Configurações → Integrações** e crie uma chave. Escolha **Agente de IA**: a chave já vem com todas as leituras que você pode liberar, inclusive *Receber avisos de eventos*.
2. Copie a chave (começa com `avk_`). Ela aparece uma vez só.
3. No n8n, crie uma credencial **Atendevet API** e cole a chave. Deixe o **Base URL** como `https://api.atendevet.app`.

Cada chave só enxerga a clínica e as permissões com que foi criada. Você revoga a chave no Atendevet quando quiser.

## Atendevet Trigger

Escolha um ou mais eventos. Quando o fluxo é ativado, o nó assina esses eventos no Atendevet; quando é desativado, a assinatura é apagada. As assinaturas criadas pelo n8n se chamam `n8n: <nome do fluxo>` e aparecem no Atendevet em **Perfil → Configurações → Integrações**.

Cada entrega vem assinada com HMAC-SHA256 (`X-Atendevet-Signature`), com um segredo gerado pelo próprio nó, e o nó recusa a entrega com assinatura errada.

Cada execução recebe o envelope do evento:

```json
{
  "id": "6f1c…",
  "evento": "agendamento.criado",
  "criadoEm": "2026-11-24T13:05:00Z",
  "teste": false,
  "versao": 1,
  "dados": { "…": "dados do evento" }
}
```

A lista de eventos no nó mostra o que cada evento leva.

Para testar, clique em **Listen for test event** e depois em **Testar** no webhook `n8n:` dentro do Atendevet. O Atendevet manda um exemplo de cada evento assinado, com `"teste": true`.

O Atendevet só entrega em endereço `https` público. No n8n instalado no seu servidor, configure `N8N_WEBHOOK_URL` (`WEBHOOK_URL` nas versões antigas) com o endereço https público dele.

## Operações do nó Atendevet

| Recurso | Operações |
| --- | --- |
| Client (responsável legal) | Get, Get Address, Get Many |
| Document Signature (assinatura de documento) | Get Status |
| Document Template (modelo de documento) | Get, Get Many |
| Lead (CRM) | Get, Get Funnel, Get Many |
| Patient (paciente) | Get, Get History, Get Many, Get Medical Background, Get Recent, Get Weights |
| Sale (venda) | Get, Get Items, Get Many |
| Sales Report (relatório de vendas) | Get Summary, Get by Client |

Os nomes ficam em inglês porque a tela do n8n é em inglês. Cada operação precisa da permissão correspondente na chave (por exemplo, *Consultar pacientes (pets)* para o recurso Patient). Sem a permissão, a resposta é um erro 403. A referência completa da API por trás dessas operações está em [api.atendevet.app/scalar/integracao](https://api.atendevet.app/scalar/integracao).

## Agentes de IA e MCP

O Atendevet também tem um servidor MCP oficial em `https://api.atendevet.app/mcp`, com cerca de 50 ferramentas: agenda, pacientes, internação, carteira de saúde, orçamentos e mais. As ferramentas que gravam criam **propostas**, que alguém da clínica aprova no Atendevet, a não ser que a clínica tenha liberado a gravação direta.

Para usar num agente de IA do n8n, adicione o **MCP Client Tool**, que já vem no n8n:

1. **Endpoint**: `https://api.atendevet.app/mcp`
2. **Server Transport**: HTTP Streamable
3. **Authentication**: Header Auth, com o nome `X-Api-Key` e a chave do Atendevet como valor (a chave precisa de *Ativar o agente de IA*)

O nó **Atendevet** pode entrar no mesmo agente como ferramenta.

## Fluxos prontos

A pasta [`workflows`](../workflows) tem fluxos prontos para importar no n8n (copie o conteúdo do arquivo e cole com Ctrl+V na tela de um fluxo novo):

- Resumo de vendas do dia no Telegram
- Agendamento novo no Google Agenda
- Vacinas para vencer numa planilha do Google Planilhas, para a busca ativa
- Pagamento recebido avisado no Slack
- Assistente da clínica: agente de IA com o servidor MCP do Atendevet
- Trilha da clínica no WhatsApp: as etapas da campanha saem pelo seu WhatsApp Business e o assistente do Atendevet responde quem escrever

## Compatibilidade

Testado com o n8n 2.49 e o Node.js 24.

## Links

- [Atendevet](https://www.atendevet.com.br)
- [Use o Atendevet no ChatGPT, no Claude e no n8n](https://www.atendevet.com.br/conectar-ia)
- [Referência da API do Atendevet](https://api.atendevet.app/scalar/integracao)
- [Documentação de nós da comunidade do n8n](https://docs.n8n.io/integrations/#community-nodes)

## Licença

[MIT](../LICENSE)
