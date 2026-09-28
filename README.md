# CI/CD Sandbox — Página web + Docker

Página web simples cujo pipeline (GitHub Actions) corre a cada `push` para `main`
e tem 4 fases:

1. **Lint** — valida o HTML (`htmlhint`); falha o pipeline se houver erros.
2. **Carimbo** — substitui `PLACEHOLDER_BUILD_INFO` por nº de build, data e commit.
3. **Imagem Docker** — constrói a imagem (ver `Dockerfile`) e publica-a no
   GitHub Container Registry (`ghcr.io`). Esta é a ponte CI/CD ↔ containers.
4. **Deploy** — publica a página no GitHub Pages (URL ao vivo).

## Configuração (formador, antes da sessão)

1. Cria o repositório **público** no GitHub e envia estes ficheiros
   (atenção à pasta oculta `.github`).
2. Ativa **Settings → General → Template repository**.
3. Corre o pipeline uma vez (qualquer commit). Isto cria a branch `gh-pages`
   e a primeira imagem no registry.
4. **Settings → Pages** → Source: "Deploy from a branch" → `gh-pages` / `(root)`.
5. Confirma que a imagem apareceu em **Packages** (coluna da direita do repositório).
   Se o pacote ficar privado, abre-o → *Package settings* → *Change visibility* → Public
   (só é necessário se quiseres fazer `docker pull` sem autenticação).

## Para os participantes

1. **Use this template** → criar a cópia.
2. Correr o pipeline uma vez e ativar Pages (passos 3-4 acima) — passo manual único.
3. Editar `index.html` no browser (adicionar o próprio nome à lista) e fazer commit em `main`.
4. Em **Actions**, acompanhar as 4 fases.
5. Ver a página ao vivo e a imagem em **Packages**.

## Exercício "quebrar e corrigir"
Apagar uma tag de fecho (ex: `</li>`) → o **lint** falha e nada é construído nem
publicado. Corrigir e voltar a fazer commit.

## Ficheiros
- `Dockerfile` — receita da imagem (nginx + a nossa página)
- `DEMO-DOCKER.md` — guião da demo de Docker para o formador
