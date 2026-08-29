# To-Do List

Aplicação de lista de tarefas feita em HTML, CSS e JavaScript (sem build, sem dependências instaladas), com categorias, prioridades, datas limite e persistência local.

## Funcionalidades

- **Tarefas** — criar, editar (inline), concluir, marcar como importante (estrela) e apagar (com confirmação).
- **Categorias personalizadas** — criar, renomear e apagar categorias próprias, além da lista padrão "Tasks".
- **Prioridade** (Low / Medium / High) e **data limite** por tarefa, com destaque visual para tarefas de hoje (`today`) e atrasadas (`overdue`).
- **Vistas rápidas** — *My Day* (tarefas de hoje), *Important* (marcadas com estrela) e *Tasks* (caixa de entrada), além de uma vista por categoria.
- **Busca e filtros** — pesquisa por texto e filtro por estado (todas / abertas / concluídas / hoje / atrasadas).
- **Reordenar por arrastar** (drag-and-drop) dentro da caixa de entrada ou de uma categoria.
- **Limpar concluídas** de uma só vez.
- **Tema claro/escuro**, alternável e persistido.
- **Interface responsiva**, com menu lateral recolhível em ecrãs pequenos.
- Todos os dados (tarefas, categorias e tema) são guardados no `localStorage` do navegador — não há backend.

## Tecnologias

- HTML5, CSS3 e JavaScript vanilla (sem frameworks)
- [Bootstrap 5](https://getbootstrap.com/) — usado para os modais (nova categoria, confirmação de eliminação), via CDN
- [Bootstrap Icons](https://icons.getbootstrap.com/) — ícones, via CDN

## Como executar

Não há build nem instalação de dependências — basta abrir o [index.html](index.html) diretamente no navegador, ou servir a pasta com qualquer servidor estático:

```bash
# opção 1: abrir diretamente
# (duplo clique em index.html, ou "Abrir com" o navegador)

# opção 2: servir localmente (exemplo com a extensão Live Server do VS Code,
# ou com Python)
python -m http.server 5500
```

## Estrutura do projeto

```
to_do_list/
├── index.html   # estrutura da página (sidebar, toolbar, formulário, modais)
├── style.css    # estilos, temas (claro/escuro) e layout responsivo
└── script.js    # estado da aplicação, renderização e persistência em localStorage
```

## Autora

- [GitHub](https://github.com/xTixa)
