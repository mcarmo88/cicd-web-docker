# Demo: "morre um, nasce outro" (~15 min) — para o formador

Objetivo: mostrar a diferença entre **reiniciar** um container (Docker) e
**garantir um estado desejado** (Kubernetes).

Pré-requisitos: Docker Desktop; para a parte B, Kubernetes ativo em
Docker Desktop → Settings → Kubernetes → Enable Kubernetes (o menu pode variar
consoante a versão). Confirma com `kubectl get nodes`.

Primeiro constrói a imagem (já inclui o endpoint /whoami):

    docker build -t painel-equipa .

---

## Parte A — Docker Compose (3 containers, reinício automático)

    docker compose up -d
    docker compose ps
    curl localhost:8080/whoami
    curl localhost:8081/whoami
    curl localhost:8082/whoami

Cada resposta mostra um nome diferente (o id do container).

Mata um:

    docker kill <nome-do-container>
    docker compose ps

Passados segundos volta a estar "Up" (repara no tempo de execução, que reiniciou). Funciona por causa de `restart: always`.

**Ponto a sublinhar:** foi o *mesmo* container que reiniciou. Não há noção de
"quero sempre 3", não há atualizações graduais, e tudo está numa só máquina.

    docker compose down

---

## Parte B — Kubernetes (3 pods, novo pod criado automaticamente)

    kubectl apply -f k8s/

Abre **dois terminais** lado a lado.

Terminal 1 (observar os pods):

    kubectl get pods -w

Terminal 2 (pedidos contínuos ao serviço, mostra quem responde):

    # macOS/Linux
    while true; do curl -s localhost:8090/whoami; sleep 1; done
    # Windows PowerShell
    while ($true) { curl.exe -s localhost:8090/whoami; Start-Sleep 1 }

Verás os 3 nomes de pod a alternar. Agora, num terceiro terminal, mata um pod:

    kubectl delete pod <nome-de-um-pod>

No terminal 1: o pod vai para `Terminating` e **surge logo um pod novo, com nome
diferente**. No terminal 2: as respostas nunca param, porque os outros 2 pods
continuam a servir.

**Ponto a sublinhar:** tu declaraste "quero 3" (replicas: 3). O Kubernetes
compara continuamente o estado real com o desejado e corrige a diferença.

Extras (1 min cada):

    kubectl scale deployment painel --replicas=5     # escalar
    kubectl get pods
    kubectl scale deployment painel --replicas=3

Limpeza:

    kubectl delete -f k8s/

---

## Se algo correr mal
- `EXTERNAL-IP <pending>` no serviço: confirma que o Kubernetes do Docker Desktop
  está ativo e espera uns segundos. Como plano B, `kubectl port-forward svc/painel 8090:80`
  (mas fica ligado a um só pod, não mostra a rotação).
- Pod em `ErrImageNeverPull`: a imagem `painel-equipa` não existe localmente
  (repete o `docker build`) ou o cluster é do tipo kind (usa a imagem do ghcr no YAML).
- Portas ocupadas: para o compose (`docker compose down`) e containers antigos.
