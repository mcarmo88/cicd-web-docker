# Demo: "morre um, nasce outro" (~15-20 min) — para o formador

Objetivo: mostrar a diferença entre **reiniciar** um container (Docker) e
**garantir um estado desejado** (Kubernetes) — agora com a web e a API a
correrem em simultâneo, tal como em produção.

Pré-requisitos: Docker Desktop; para a parte B, Kubernetes ativo em
Docker Desktop → Settings → Kubernetes → Enable Kubernetes (o menu pode variar
consoante a versão). Confirma com `kubectl get nodes`.

---

## Parte A — Docker Compose (web + api, 3 réplicas da web, reinício automático)

O `docker-compose.yml` já define os dois serviços (`api` e `web`, esta última
com 3 réplicas) e a ligação entre eles pelo nome `api`. Não precisas de correr
`docker build` à parte — o `docker compose up` trata disso.

    docker compose up -d --build
    docker compose ps

Devem aparecer 4 containers: 1x `api` e 3x `web`.

    curl localhost:8080/whoami
    curl localhost:8081/whoami
    curl localhost:8082/whoami
    curl localhost:8080/api/quote

Os três primeiros mostram nomes de container diferentes (a rotação entre as
réplicas da web). O último mostra que **qualquer uma das 3 réplicas da web
consegue chegar à API**, através do nome de serviço `api`.

Simula um **crash da aplicação** (mata o nginx por dentro de um container web):

    docker exec <nome-do-container-web> nginx -s stop
    docker compose ps

O container sai e, passados segundos, volta a estar "Up" (repara no tempo de
execução, que reiniciou). Funciona por causa de `restart: always`.

> Nota: `docker kill` e `docker stop` **não** disparam o reinício, porque o
> Docker os trata como uma paragem deliberada do operador. A política de
> restart só atua quando o container cai por si (crash). Podes usar isto como
> ponto extra na sessão.

Repete a experiência com a API:

    docker exec <nome-do-container-api> kill 1
    docker compose ps
    curl localhost:8080/api/quote

A API reinicia da mesma forma, e a web volta a conseguir chamá-la assim que
ela estiver de novo em pé — boa forma de mostrar que **um serviço depender
de outro** introduz um novo tipo de falha (a API em baixo, mesmo que a web
esteja bem).

**Ponto a sublinhar:** foi sempre o *mesmo* container que reiniciou. Não há
noção de "quero sempre 3", não há atualizações graduais, e tudo está numa só
máquina.

    docker compose down

---

## Parte B — Kubernetes (web + api, 3 pods de web, novo pod criado automaticamente)

O `k8s/` já tem os 4 manifestos: `deployment.yaml` + `service.yaml` (web, 3
réplicas, exposta em `localhost:8090`) e `api-deployment.yaml` +
`api-service.yaml` (api, 1 réplica, só acessível dentro do cluster).

Confirma antes de aplicar que o `k8s/deployment.yaml` e o
`k8s/api-deployment.yaml` apontam para as tuas imagens no ghcr
(`ghcr.io/TEU-UTILIZADOR/NOME-DO-REPO-web:latest` e `...-api:latest`, tudo em
minúsculas) e que os pacotes estão públicos.

    kubectl apply -f k8s/
    kubectl get pods

Deves ver 1 pod `api-...` e 3 pods `painel-...`, todos `1/1 Running`.

Abre **três terminais** lado a lado.

Terminal 1 (observar os pods):

    kubectl get pods -w

Terminal 2 (pedidos contínuos ao serviço da web, mostra quem responde):

    # macOS/Linux
    while true; do curl -sS localhost:8090/whoami; sleep 1; done
    # Windows PowerShell
    while ($true) { curl.exe -sS localhost:8090/whoami; Start-Sleep 1 }

Terminal 3 (confirmar que a web alcança a api através do serviço):

    curl -sS localhost:8090/api/quote

Verás os 3 nomes de pod da web a alternar no terminal 2, e frases diferentes
a cada pedido no terminal 3 (a web está a chamar a api pelo nome do serviço
`api`, tal como fazia com `api:3000` no compose — em Kubernetes, o nome do
Service faz o mesmo papel de DNS interno).

Agora, num quarto terminal, mata um pod da web:

    kubectl get pods
    kubectl delete pod <nome-de-um-pod-painel>

No terminal 1: o pod vai para `Terminating` e **surge logo um pod novo, com
nome diferente**. No terminal 2: as respostas nunca param, porque os outros 2
pods continuam a servir.

Repete matando o pod da **api** (só há 1 réplica, por isso o efeito é mais
visível):

    kubectl delete pod <nome-do-pod-api>
    kubectl get pods -w

Vê o pedido a `/api/quote` (terminal 3) durante alguns segundos: pode falhar
ou demorar enquanto o novo pod da api não está pronto, e volta a responder
assim que o Kubernetes o repuser. Bom gancho para falar de `replicas: 1`
como ponto único de falha, e porque em produção também se dá réplicas a
serviços internos como a api.

**Ponto a sublinhar:** tu declaraste "quero 3" (web) e "quero 1" (api). O
Kubernetes compara continuamente o estado real com o desejado e corrige a
diferença, pod a pod, serviço a serviço.

Extras (1 min cada):

    kubectl scale deployment painel --replicas=5
    kubectl get pods
    kubectl scale deployment painel --replicas=3

Limpeza:

    kubectl delete -f k8s/

---

## Se algo correr mal
- `EXTERNAL-IP <pending>` no serviço da web: confirma que o Kubernetes do
  Docker Desktop está ativo e espera uns segundos. Como plano B,
  `kubectl port-forward svc/painel 8090:80` (mas fica ligado a um só pod, não
  mostra a rotação).
- Pods em `ErrImageNeverPull` ou `ImagePullBackOff`: confirma o nome da
  imagem em cada `k8s/*.yaml` (minúsculas) e que os pacotes estão públicos em
  *Packages*. Testa com `docker pull` do mesmo nome — se funcionar no teu
  terminal, o cluster também consegue.
- `/api/quote` dá erro 502 a partir da web, mas os pods estão `Running`: o
  serviço `api` tem de se chamar exatamente `api` (é o nome usado no
  `proxy_pass` do `default.conf`). Confirma com `kubectl get svc`.
- Portas ocupadas: para o compose (`docker compose down`) e confirma que não
  há containers antigos (`docker ps -a`).
