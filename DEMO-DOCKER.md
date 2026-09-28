# Guião da demo de Docker (~10-12 min) — para o formador

Pré-requisito: Docker instalado na tua máquina e esta pasta aberta no terminal.

## 1. O problema (1 min)
"Na minha máquina funciona." Pergunta à sala quem já ouviu/disse isto.
Ideia: um container leva a aplicação **e** tudo o que ela precisa, e corre igual em qualquer sítio.

## 2. Mostrar o Dockerfile (2 min)
Abre o `Dockerfile` (3 instruções úteis). Explica linha a linha:
- `FROM` → ponto de partida (uma imagem com nginx já pronta)
- `COPY` → põe a nossa página lá dentro
- `EXPOSE` → porta que a aplicação usa

## 3. Construir a imagem (2 min)
    docker build -t painel-equipa .
    docker images
Ponto-chave: **imagem = molde/receita** (não está a correr). Ainda não há nenhum container.

## 4. Correr um container (2 min)
    docker run -d -p 8080:80 --name painel painel-equipa
    docker ps
Abre http://localhost:8080 no browser. Vais ver o `PLACEHOLDER_BUILD_INFO` no rodapé:
é normal, o carimbo só é posto pelo pipeline. (Bom gancho: "reparem que aqui falta
o passo automático — é exatamente isso que o pipeline faz por nós".)
Ponto-chave: **container = instância a correr** de uma imagem. Podes correr vários da mesma imagem:
    docker run -d -p 8081:80 --name painel2 painel-equipa

## 5. "E se crashar?" (2 min) — gancho para Kubernetes
    docker kill painel
    docker ps
O container morreu e ninguém o repôs. Pergunta: "e se fosse produção, às 3 da manhã?"
→ É aqui que entra o Kubernetes: mantém o número desejado de containers sempre a correr.

## 6. Ligar ao pipeline (2 min)
Mostra no GitHub o pacote publicado (separador Packages do repositório) e diz:
"Esta imagem foi construída pelo pipeline, não por mim." Opcional, com a imagem já publicada:
    docker run -d -p 8082:80 ghcr.io/TEU-UTILIZADOR/NOME-DO-REPO:latest

## Limpeza
    docker rm -f painel painel2 2>/dev/null
