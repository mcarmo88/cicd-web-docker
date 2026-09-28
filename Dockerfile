# Imagem base: nginx (servidor web) numa versão leve
FROM nginx:alpine

# Configuração do nginx (inclui o endpoint /whoami usado na demo de resiliência)
COPY default.conf /etc/nginx/conf.d/default.conf

# Copia os ficheiros da página para a pasta que o nginx serve
COPY index.html style.css /usr/share/nginx/html/

# O nginx escuta na porta 80 dentro do container
EXPOSE 80
