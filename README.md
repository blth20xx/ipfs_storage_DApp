Requisitos previos:
- Contar con un dispositivo Ubuntu preferiblemente, ya que es el SO con el que se ha trabajado
- Instalar Truffle (y a su vez sus requisitos): https://trufflesuite.com/docs/truffle/how-to/install/
- Instalar Ganache: https://trufflesuite.com/ganache/
- Crear una cuenta en web3.storage para obtener el API token y poder utilizar IPFS: https://web3.storage/
- Establecer Chromium/Google Chrome como navegador predeterminado, ya que el selector de archivos de la interfaz web da problemas en Firefox

Pasos para replicar el funcionamiento de la aplicación:
1. Descomprimir el código, y desde la carpeta client, instalar todas las dependencias con "npm install"
2. Ejecutar Ganache, y en la pantalla principal seleccionar "New workspace". Una vez dentro, seleccionar "Add project", y añadir el fichero truffle-config.js 
3. En la pestaña "Server", dejar los siguientes parámetros:
  - HOSTNAME: 127.0.0.1
  - PORT: 7545
  - NETWORK ID: 5777
4. Presionar "Save workspace"
5. Con la blockchain arrancada, desde la raíz del proyecto, ejecutar el comando "truffle migrate"
6. En el fichero index.js, colocar el token de web3.storage obtenido en la constante "token"
7. Desde la carpeta client, ejecutar el comando "npm start"
8. Acceder a la ruta que aparece por consola desde el navegador
9. Listo
