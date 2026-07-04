# Sistema de Design de Botões - Mapeia

Este documento descreve o sistema padronizado de botões utilizado no sistema Mapeia.

## Componente Base

Todos os botões no sistema utilizam o componente `Button` localizado em `src/app/components/ui/button.tsx`.

## Variantes

### `primary` (padrão)
- **Cor**: Verde institucional (#3B5935)
- **Uso**: Ações principais e CTAs (Call-to-Action)
- **Exemplos**: "Entrar no Sistema", "Enviar Denúncia", "Concluir Cadastro"

```tsx
<Button variant="primary">Ação Principal</Button>
```

### `danger`
- **Cor**: Vermelho (#EC3759)
- **Uso**: Ações de alerta, denúncias, ou que requerem atenção
- **Exemplos**: "Nova Denúncia", "Excluir"

```tsx
<Button variant="danger">Nova Denúncia</Button>
```

### `warning`
- **Cor**: Amarelo (#F2C94C)
- **Uso**: Ações de aviso ou que requerem cuidado
- **Exemplos**: Alertas, confirmações sensíveis

```tsx
<Button variant="warning">Atenção</Button>
```

### `outline`
- **Estilo**: Fundo branco com borda
- **Uso**: Ações secundárias, cancelar, voltar
- **Exemplos**: "Cancelar", "Voltar", "Editar informações"

```tsx
<Button variant="outline">Cancelar</Button>
```

### `ghost`
- **Estilo**: Sem fundo, apenas texto
- **Uso**: Ações terciárias, navegação sutil, tabs
- **Exemplos**: Ícones de fechar, navegação de tabs

```tsx
<Button variant="ghost">Ação Sutil</Button>
```

### `link`
- **Estilo**: Texto verde com underline ao hover
- **Uso**: Links textuais, navegação secundária
- **Exemplos**: "Esqueceu a senha?", "Ir para o Portal do Cidadão"

```tsx
<Button variant="link">Link de Navegação</Button>
```

## Tamanhos

### `sm` (pequeno)
- **Uso**: Botões compactos, filtros, tags
- **Padding**: `px-3 py-2`
- **Texto**: `text-xs`

```tsx
<Button size="sm">Pequeno</Button>
```

### `default` (padrão)
- **Uso**: Maioria dos botões
- **Padding**: `px-4 py-2.5`
- **Texto**: `text-sm`

```tsx
<Button>Padrão</Button>
```

### `lg` (grande)
- **Uso**: CTAs principais, formulários importantes
- **Padding**: `px-6 py-3.5`
- **Texto**: `text-sm`

```tsx
<Button size="lg">Grande</Button>
```

### `icon` (ícone)
- **Uso**: Botões apenas com ícone
- **Tamanho**: `size-9` (36x36px)

```tsx
<Button variant="outline" size="icon">
  <Menu className="w-6 h-6" />
</Button>
```

## Características do Design

- **Border-radius**: `rounded-xl` (12px) - cantos arredondados
- **Tipografia**: Fonte Poppins, peso Bold
- **Transições**: `transition-colors` para hover suave
- **Sombras**: Variantes principais têm `shadow-lg` com cor da marca
- **Estados de foco**: Ring de foco com cor apropriada à variante
- **Ícones**: Tamanho padrão `w-4 h-4`, integrados com `gap-2`

## Cores da Identidade Visual

- **Verde (Primary)**: #3B5935
- **Vermelho (Danger)**: #EC3759
- **Amarelo (Warning)**: #F2C94C
- **Marrom (Accent)**: #8C3A27
- **Texto Principal**: #1E1E1E
- **Fundo**: Branco (#FFFFFF) e Cinza (#F9FAFB)

## Uso com Ícones

```tsx
import { Plus } from 'lucide-react';

<Button variant="primary">
  <Plus className="w-4 h-4" />
  Adicionar Novo
</Button>
```

## Botões de Largura Completa

```tsx
<Button variant="primary" className="w-full">
  Botão de Largura Completa
</Button>
```

## Estados Desabilitados

```tsx
<Button disabled>Botão Desabilitado</Button>
```

O botão automaticamente aplica `opacity-50` e `pointer-events-none` quando desabilitado.

## Boas Práticas

1. **Use `primary` para a ação mais importante** de cada tela ou seção
2. **Limite a 1-2 botões `primary`** visíveis ao mesmo tempo
3. **Use `outline` para ações secundárias** próximas a botões primários
4. **Prefira `ghost` para navegação** e ações terciárias
5. **Use `link` para ações de navegação** que não requerem destaque
6. **Reserve `danger` para ações destrutivas** ou de alerta
7. **Adicione ícones quando melhoram a compreensão**, mas não sobrecarregue

## Acessibilidade

- Todos os botões possuem estados de foco visíveis
- Tamanho mínimo de toque respeitado (44x44px no mobile)
- Contraste de cores adequado (WCAG AA)
- Use `aria-label` para botões apenas com ícone

```tsx
<Button variant="outline" size="icon" aria-label="Fechar menu">
  <X className="w-4 h-4" />
</Button>
```
