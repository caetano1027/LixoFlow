
# EcoColeta - App de Pontos de Coleta de Recicláveis

## Visão Geral
App com mapa interativo que mostra a localização do usuário e os pontos de coleta de material reciclável mais próximos, com autenticação por email e painel admin para gerenciar os pontos.

## Funcionalidades

### 1. Autenticação
- Tela de login e cadastro com email/senha
- Proteção de rotas (admin e favoritos requerem login)

### 2. Mapa Principal (página inicial)
- Mapa do Google Maps ocupando a tela toda
- Botão para centralizar na localização atual do usuário
- Marcadores coloridos nos pontos de coleta
- Ao clicar num marcador: card com nome, endereço, horário de funcionamento e distância do usuário
- Botão "Como chegar" que abre o Google Maps com rota
- Lista dos pontos mais próximos abaixo do mapa, ordenados por distância

### 3. Painel Admin
- Tela protegida para administradores
- Formulário para adicionar novo ponto de coleta: nome, endereço, latitude/longitude (com clique no mapa para selecionar), horário de funcionamento e tipos de material aceito
- Lista de pontos cadastrados com opções de editar e excluir

### 4. Banco de Dados (Lovable Cloud / Supabase)
- Tabela `collection_points`: id, nome, endereço, latitude, longitude, horário, tipos de material, status ativo/inativo
- Tabela `user_roles`: controle de acesso admin
- Tabela `profiles`: dados básicos do usuário
- RLS para proteger os dados

### 5. Design
- Visual limpo e moderno com tons de verde (tema ecológico)
- Responsivo para uso em celular
- Cards com ícones de reciclagem
- Header com logo e navegação

### Nota sobre Google Maps
- Será utilizada a biblioteca `@react-google-maps/api`
- Você precisará criar uma chave API gratuita no Google Cloud Console (te guiarei no processo)
