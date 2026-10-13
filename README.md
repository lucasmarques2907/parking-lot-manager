# parking-lot-manager

API REST para gerenciar as vagas de um estacionamento: estacionar, consultar e remover veículos.

## Visão geral

- Base URL local: `http://localhost:8080` (porta definida em `PORT`)
- Requisições com body devem enviar `Content-Type: application/json`
- Todas as respostas (exceto `204`) são JSON
- Erros sempre seguem o formato:

```json
{ "error": "mensagem" }
```

### Vagas

O estacionamento possui 30 vagas fixas, criadas pelo seed:

| Vagas         | Tipo         |
| ------------- | ------------ |
| `1A` a `20A`  | `car`        |
| `21B` a `30B` | `motorcycle` |

### Placas

Aceita os formatos antigo (`ABC1234`) e Mercosul (`ABC1D23`). No cadastro, a placa é normalizada: letras são convertidas para maiúsculas e hífens/espaços são removidos (`abc-1d23` vira `ABC1D23`).

Nas rotas que recebem `:plate` na URL a placa **não** é normalizada, então use sempre o formato salvo (`ABC1D23`).

### Rate limit

60 requisições por minuto por IP. As respostas incluem os headers `RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining` e `RateLimit-Reset`. Ao exceder o limite:

`429 Too Many Requests` (com header `Retry-After`)

```json
{ "error": "Muitas requisições. Por favor, aguarde e tente novamente." }
```

### Erro interno

Qualquer erro não tratado retorna:

`500 Internal Server Error`

```json
{ "error": "Algo deu errado" }
```

---

## Endpoints

| Método   | Rota               | Descrição                          |
| -------- | ------------------ | ---------------------------------- |
| `GET`    | `/parking-spaces`  | Lista todas as vagas e sua ocupação |
| `GET`    | `/vehicles`        | Lista os veículos estacionados     |
| `GET`    | `/vehicles/:plate` | Busca um veículo pela placa        |
| `POST`   | `/vehicles`        | Estaciona um veículo em uma vaga   |
| `DELETE` | `/vehicles/:plate` | Remove um veículo da vaga          |

---

### `GET /parking-spaces`

Lista todas as vagas ordenadas pelo número. Vagas livres retornam `vehicleId` e `plate` como `null`.

**Resposta** `200 OK`

```json
[
  {
    "code": "1A",
    "type": "car",
    "vehicleId": "3f8b2c1e-6a4d-4e7b-9c2a-1d5e8f0a7b3c",
    "plate": "ABC1D23"
  },
  {
    "code": "2A",
    "type": "car",
    "vehicleId": null,
    "plate": null
  },
  {
    "code": "21B",
    "type": "motorcycle",
    "vehicleId": null,
    "plate": null
  }
]
```

---

### `GET /vehicles`

Lista os veículos estacionados, do mais antigo para o mais recente.

**Resposta** `200 OK`

```json
[
  {
    "id": "3f8b2c1e-6a4d-4e7b-9c2a-1d5e8f0a7b3c",
    "createdAt": "2026-10-06T13:45:12.345Z",
    "updatedAt": "2026-10-06T13:45:12.345Z",
    "plate": "ABC1D23",
    "type": "car",
    "parkingSpaceCode": "1A"
  }
]
```

Retorna `[]` quando não há veículos.

---

### `GET /vehicles/:plate`

Busca um veículo estacionado pela placa.

**Exemplo:** `GET /vehicles/ABC1D23`

**Resposta** `200 OK`

```json
{
  "id": "3f8b2c1e-6a4d-4e7b-9c2a-1d5e8f0a7b3c",
  "createdAt": "2026-10-06T13:45:12.345Z",
  "updatedAt": "2026-10-06T13:45:12.345Z",
  "plate": "ABC1D23",
  "type": "car",
  "parkingSpaceCode": "1A"
}
```

**Erros**

| Status | Mensagem                                           |
| ------ | -------------------------------------------------- |
| `404`  | `Veículo com a placa ABC1D23 não encontrado.`      |

---

### `POST /vehicles`

Estaciona um veículo em uma vaga livre.

**Body**

| Campo          | Tipo   | Obrigatório | Descrição                                   |
| -------------- | ------ | ----------- | ------------------------------------------- |
| `plate`        | string | sim         | Placa do veículo (`ABC1234` ou `ABC1D23`)   |
| `type`         | string | sim         | `car` ou `motorcycle`                       |
| `parkingSpace` | string | sim         | Código da vaga (ex.: `1A`, `21B`)           |

```json
{
  "plate": "abc-1d23",
  "type": "car",
  "parkingSpace": "1a"
}
```

**Resposta** `201 Created`

```json
{
  "id": "3f8b2c1e-6a4d-4e7b-9c2a-1d5e8f0a7b3c",
  "createdAt": "2026-10-06T13:45:12.345Z",
  "updatedAt": "2026-10-06T13:45:12.345Z",
  "plate": "ABC1D23",
  "type": "car",
  "parkingSpaceCode": "1A"
}
```

**Erros** (na ordem em que são validados)

| Status | Mensagem                                           | Quando                                         |
| ------ | -------------------------------------------------- | ---------------------------------------------- |
| `400`  | `Campos obrigatórios não preenchidos corretamente` | Falta `plate`, `type` ou `parkingSpace`        |
| `400`  | `Tipo inválido. Use: car, motorcycle`              | `type` diferente de `car` ou `motorcycle`      |
| `400`  | `Placa inválida. Use o formato: ABC1D23`           | Placa fora do padrão antigo ou Mercosul        |
| `404`  | `Vaga 99A não existe`                              | Código de vaga inexistente                     |
| `422`  | `Vaga 21B não é para esse tipo de veículo`         | Tipo do veículo diferente do tipo da vaga      |
| `409`  | `Vaga 1A já está ocupada`                          | Vaga já possui um veículo                      |
| `409`  | `Veículo ABC1D23 já está na vaga 1A`               | Placa já estacionada em outra vaga             |

---

### `DELETE /vehicles/:plate`

Remove o veículo da vaga, liberando-a.

**Exemplo:** `DELETE /vehicles/ABC1D23`

**Resposta** `204 No Content` (sem body)

**Erros**

| Status | Mensagem                                     |
| ------ | -------------------------------------------- |
| `404`  | `Veículo com a placa ABC1D23 não encontrado` |

---

## Resumo de status

| Status | Significado                                          |
| ------ | ---------------------------------------------------- |
| `200`  | Sucesso                                              |
| `201`  | Veículo estacionado                                  |
| `204`  | Veículo removido                                     |
| `400`  | Dados inválidos ou ausentes                          |
| `404`  | Vaga ou veículo não encontrado                       |
| `409`  | Conflito: vaga ocupada ou veículo já estacionado     |
| `422`  | Tipo do veículo incompatível com a vaga              |
| `429`  | Limite de requisições excedido                       |
| `500`  | Erro interno                                         |
