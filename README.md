# Desafío - Servidores Node.js / Cluster / Nginx:

- Agregar en la vista info, el número de procesadores presentes en el servidor
  
      >> Agregado número de núcleos disponibles en ventana de información

- Ejecutar el servidor (modo fork y cluster) con nodemon
  
      >> 'nodemon server.js --mode=cluster' (ejecuta en modo cluster)
      >> 'nodemon server.js --mode=fork' (ejecuta modo fork)
      >> 'nodemon server.js' (ejecuta modo fork por defecto)

- Ejecutar el servidor (con los parámetros adecuados) utilizando Forever. Listar los procesos por Forever y por sistema operativo
  
      >> Los comandos son iguales que con nodemon pero reemplazo nodemon por forever ej. 'forever server.js' para iniciar en modo fork por defecto
      >> Para listar los procesos con forever uso 'forever list'
          >> Se observa el proceso principal en forever
      >> Para listar los procesos en el sistema operativo prefiero usar 'ps ax | grep node' en Linux tambien podría usar 'htop'
          >> Se observan tantos procesos como procesadores disponibles

- Ejecutar el servidor (con los parámetros adecuados: modo fork) utilizando PM2 en sus modos fork y cluster. Listar los procesos por PM2 y por sistema operativo
  
      >> 'pm2 start server.js --name="nodeServerFork"' para inciar en modo Fork de PM2
      >> 'pm2 start server.js --name="nodeServerCluster" -i max' para iniciar en modo Cluster de PM2 utilizando todos los núcleos

- Tanto en Forever como en PM2 permitir el modo escucha, para que la actualización del código del servidor se vea reflejado inmediatamente en todos los procesos
  
      >> 'forever -w server.js' agregamos el parámetro -w para permitir el modo watch o escucha
      >> 'pm2 start server.js --name="nodeServerCluster" --watch -i max' agregamos el parámetro --watch para permitir el modo watch o escucha

- Hacer pruebas de finalización de procesos Fork y Cluster en los casos que corresponda
  
      >> Realizado con 'kill' sobre los procesos hijos, se observa que se vuelven a forkear correctamente, en el caso de pm2 no observo un proceso padre como sucede con forever o nodemon, en el caso de forever al matar al proceso padre vuelve a iniciar el servidor y en el caso de nodemon arroja una advertencia de crasheo y no incia automáticamente

# Consigna

Configurar nginx para balancear cargas en nustro servidor de la siguiente manera:

- Redirigir todas las consultas a /api/randoms a un cluster de servidores escuchando en el puerto 8081. El cluster será creado en node utilizando el módulo nativo cluster
    >> Inicio el servidor random en modo cluster con 'pm2 start random.js --name=ramdomCluster --watch -- --port=8081 --mode=cluster'

- El resto de consultas, redirigirlas a un servidor individual escuchando en el puerto 8080
    >> Inicio el servidor general en modo fork con 'pm2 start index.js --name=serverFork --watch -- --port=8080'

- Verificar que todo funcione correctamente
    >> Inicio nginx utilizando la configuración 'nginx/nginx_nodecluster.conf', funciona el servidor general informando que es un servidor express, el PID y la hora local. El servidor random responde informando el ID del worker además de los números random para confirmar que estamos ante un cluster.

- Luego, modificar la configuración para que todas las consultas a /api/randoms sean dirigidas a un cluster de servidores gestionado desde nginx, repartiendolas equitativamente entre 4 instancias escuchando en los puertos 8082, 8083, 8084 y 8085 respectivamente
    >> Para esta prueba el servidor general se mantiene igual que antes y se inicia de la misma forma, pero el servidor random se incian cuatro instancias 'pm2 start random.js --name=ramdomCluster --watch -- --port=8082' cambiando el número de puerto para que sean 8082, 8083, 8084 y 8085. Sin especificar el modo cluster para que por defecto inicie cada uno en modo fork. Para esta prueba nginx utilizará la configuración del archivo 'nginx/nginx.conf' el cual se comento el servidor random en el puerto 8081 y se sumaron los otros servidores sin definir peso para que nginx haga el balance de carga equitativo.