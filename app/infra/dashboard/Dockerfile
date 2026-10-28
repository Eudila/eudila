# Panel del psicólogo (vista previa) en modo standalone. El build ocurre antes, en el
# contenedor de compilación de deploy-release.sh; acá solo se copia lo necesario para correr.
FROM node:24-bookworm-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY standalone ./
COPY static ./dashboard/.next/static
RUN chmod -R a+rX /app
USER node
EXPOSE 3000
CMD ["node", "dashboard/server.js"]
