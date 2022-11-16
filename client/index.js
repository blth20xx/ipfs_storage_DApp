import { Web3Storage, File, Web3File } from "web3.storage";
import Web3 from "web3";
import contractConfiguration from "../build/contracts/storageIndexing.json";
import "bootstrap/dist/css/bootstrap.css";

// Conexión con el endpoint de almacenamiento IPFS
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZhNEMwNEU2NzE0OWJmMDAwRGQ1MDdGMGI1ZUJmMDk0Nzc0NjE2NjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjYwMDAwNTIwODgsIm5hbWUiOiJ3ZWIzSVBGUyJ9.6yW9F47r4GUkse86Cnu9v6qQRCrn9P-AKkf4OrAOBi8";

const storage = new Web3Storage({ token });

// Conexión con el despliegue del contrato
const CONTRACT_ADDRESS = contractConfiguration.networks["5777"].address;
const CONTRACT_ABI = contractConfiguration.abi;

// Se instancia la API de web3 para poder trabajar con ella
const provider = new Web3.providers.HttpProvider("http://localhost:7545");
const web3 = new Web3(provider);

// Instanciación del contrato con sus parámetros de conexión
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Cuenta en la blockchain con la que se pagarán los costes del contrato
var account;

// Declaración de los buffers de subida y descarga de archivos
var uploadFiles = [];
var retrievedFiles = [];

// Elementos de la interfaz de usuario
const chooseFileElement = document.getElementById("chooseFile");
const submitFileElement = document.getElementById("submitFile");
const getFileElement = document.getElementById("getFile");
const wantedFileElement = document.getElementById("wantedFile");
const file2DeleteElement = document.getElementById("file2Delete");
const deleteFileElement = document.getElementById("deleteFile");

// Función para descargar el documento al equipo desde IPFS
function download(cid) {
  const a = document.createElement("a");
  a.href = `${cid}.ipfs.w3s.link/${wantedFileElement.value}`;
  a.download = wantedFileElement.value;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Función que guarda en el buffer de subida el archivo seleccionado
// Se activa tras seleccionar el archivo con el botón "Choose file"
function prepareFiles() {
  var file = this.files[0];
  uploadFiles.push(file);
}

// Función encargada de subir el archivo al servicio IPFS y de guardar el identificador recibido en el smart contract
// Se activa con el botón "Submit"
async function putFileToIPFS() {
  console.log("Submitting file to IPFS...");
  var cid = await storage.put(uploadFiles);
  await contract.methods
    .store(cid, uploadFiles[0].name)
    .send({ from: account, gas: 500000 });
  console.log("File submitted!");
  uploadFiles = [];
}

// Función encargada de recuperar el identificador de un fichero desde el smart contract para después descargarlo desde el sevicio IPFS
// Se activa con el botón "Get file"
async function retrieveFileFromIPFS() {
  var cid = await contract.methods
    .retrieve(wantedFileElement.value)
    .call({ from: account, gas: 500000 });
  console.log("Retrieving file...");
  //download(cid);
  const response = await storage.get(cid);
  if (!response.ok) {
    throw new Error(
      `No se ha podido obtener el archivo ${wantedFileElement.value}`
    );
  }
  const files = await response.files();
  retrievedFiles.push(files);
  console.log(retrievedFiles);
}

// Función para borrar el identificador de un fichero en el contrato
async function deleteFile() {
  await contract.methods
    .clear(file2DeleteElement.value)
    .send({ from: account, gas: 500000 });
  console.log(`${file2DeleteElement.value}'s cid deleted from contract`);
}

// Declaración de los listeners para cuando el usuario pulse cada uno de los botones
chooseFileElement.addEventListener("change", prepareFiles, false);
submitFileElement.addEventListener("click", putFileToIPFS, false);
getFileElement.addEventListener("click", retrieveFileFromIPFS, false);
deleteFileElement.addEventListener("click", deleteFile, false);

async function main() {
  account = (await web3.eth.getAccounts())[0]; // Obtención de una de las cuentas de la blockchain de ganache para poder pagar los costes con ella
}

main();
