# PetClinic Manager — Frontend

Interface web para o sistema de prontuário eletrônico veterinário PetClinic. Permite gerenciar tutores, animais e consultas clínicas consumindo a PetClinic API.

## Pré-requisitos

- Browser moderno (Chrome, Firefox, Edge, Safari)
- [PetClinic API](https://github.com/paulopacifico/petclinic-api) rodando em `http://localhost:5001`

## Como usar

1. Clone este repositório:
   ```bash
   git clone https://github.com/paulopacifico/petclinic-app
   cd petclinic-app
   ```

2. Inicie a PetClinic API (em outro terminal):
   ```bash
   cd petclinic-api
   source .venv/bin/activate
   python app.py
   ```

3. Abra `index.html` diretamente no browser — sem servidor necessário.

## Funcionalidades

| Seção | O que faz |
|-------|-----------|
| Dashboard | Contadores em tempo real de tutores e animais |
| Tutores | Listar, cadastrar, excluir tutores e ver seus animais |
| Animais | Cards de pacientes, filtro por espécie, cadastrar, excluir |
| Consultas | Registrar nova consulta, histórico por animal |

## Estrutura do projeto

```
petclinic-app/
├── index.html       — SPA principal
├── css/
│   └── style.css    — estilos customizados
├── js/
│   ├── api.js       — funções de acesso à API (11 rotas)
│   └── app.js       — navegação e renderização
└── README.md
```

## Rotas da API utilizadas

`GET /tutores` · `POST /tutores` · `GET /tutores/:id` · `DELETE /tutores/:id` · `GET /tutores/:id/animais` · `GET /animais` · `POST /animais` · `GET /animais/:id` · `DELETE /animais/:id` · `GET /animais/:id/consultas` · `POST /consultas`
