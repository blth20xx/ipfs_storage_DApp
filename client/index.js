import { Web3Storage, File, Web3File } from "web3.storage";
import Web3 from "web3";
import contractConfiguration from "../build/contracts/storageIndexing.json";
import "bootstrap/dist/css/bootstrap.css";

/* Conexión con el endpoint de almacenamiento IPFS */
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZhNEMwNEU2NzE0OWJmMDAwRGQ1MDdGMGI1ZUJmMDk0Nzc0NjE2NjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjYwMDAwNTIwODgsIm5hbWUiOiJ3ZWIzSVBGUyJ9.6yW9F47r4GUkse86Cnu9v6qQRCrn9P-AKkf4OrAOBi8";

const storage = new Web3Storage({ token });

/* Conexión con el despliegue del contrato */
const CONTRACT_ADDRESS = contractConfiguration.networks["5777"].address;
const CONTRACT_ABI = contractConfiguration.abi;

/* Se instancia la API de web3 para poder trabajar con ella */
const provider = new Web3.providers.HttpProvider("http://localhost:7545");
const web3 = new Web3(provider);

/* Instanciación del contrato con sus parámetros de conexión */
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

/* Variables para guardar las cuentas disponibles en la blockchain */
var accounts = [];
var chosenAccount;
var chosenAccountIndex;

/* Declaración de los buffers de subida y descarga de archivos */
var uploadFiles = [];
var retrievedFiles = [];

/* Elementos de la interfaz de usuario */
const chooseFileElement = document.getElementById("chooseFile");
const submitFileElement = document.getElementById("submitFile");
const getFileElement = document.getElementById("getFile");
const wantedFileElement = document.getElementById("wantedFile");
const file2DeleteElement = document.getElementById("file2Delete");
const deleteFileElement = document.getElementById("deleteFile");
const selectAccountElement = document.getElementById("select");

/* Función para descargar el documento al equipo desde IPFS */
function downloadToSystem(cid) {
  if (cid == "") {
    throw new Error(
      `No se ha podido obtener el archivo ${wantedFileElement.value}`
    );
  }
  var url = `https://${cid}.ipfs.w3s.link/${wantedFileElement.value}`;
  window.open(url);
}

/* Función para descargar el documento a la consola del navegador desde IPFS */
async function downloadToBrowser(cid) {
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

/* Función para mostrar en la tabla los documentos de cada cuenta */
function renderDataInTheTable() {
  const mytable = document.getElementById("docsTable");
  for (let i = 0; i < accounts[chosenAccountIndex].files.length; i++) {
    let newRow = document.createElement("tr");
    let cell = document.createElement("td");
    cell.innerText = accounts[chosenAccountIndex].files[i];
    newRow.appendChild(cell);
    mytable.appendChild(newRow);
  }
}

/* Función que guarda en el buffer de subida el archivo seleccionado
 Se activa tras seleccionar el archivo con el botón "Choose file" */
function prepareFiles() {
  var file = this.files[0];
  uploadFiles.push(file);
}

/* Función para añadir un fichero a una cuenta conforme se sube */
function addFileToAccount() {
  accounts[chosenAccountIndex].files.push(uploadFiles[0].name);
}

/* Función encargada de subir el archivo al servicio IPFS y de guardar el identificador recibido en el smart contract
 Se activa con el botón "Submit" */
async function putFileToIPFS() {
  console.log("Submitting file to IPFS...");
  var cid = await storage.put(uploadFiles);
  await contract.methods
    .store(uploadFiles[0].name, cid)
    .send({ from: chosenAccount, gas: 500000 });
  console.log("File submitted!");
  addFileToAccount();
  renderDataInTheTable();
  uploadFiles = [];
}

/* Función encargada de recuperar el identificador de un fichero desde el smart contract para después descargarlo desde el sevicio IPFS
  Se activa con el botón "Get file" */
async function retrieveFileFromIPFS() {
  var cid = await contract.methods
    .retrieve(wantedFileElement.value)
    .call({ from: chosenAccount, gas: 500000 });
  console.log("Retrieving file...");
  downloadToSystem(cid);
  //downloadToBrowser(cid);
}

/* Función para borrar el identificador de un fichero en el contrato */
async function deleteFile() {
  await contract.methods
    .clear(file2DeleteElement.value)
    .send({ from: chosenAccount, gas: 500000 });
  console.log(`${file2DeleteElement.value}'s cid deleted from contract`);
}

/* Cambia la cuenta activa cuando se selecciona otra distinta en el selector */
function changeAccount() {
  var index = selectAccountElement.selectedIndex;
  if (index > 0) {
    index--;
  }
  chosenAccount = accounts[index].address;
  chosenAccountIndex = index;
}

/* Declaración de los listeners para cuando el usuario pulse cada uno de los botones */
chooseFileElement.addEventListener("change", prepareFiles, false);
submitFileElement.addEventListener("click", putFileToIPFS, false);
getFileElement.addEventListener("click", retrieveFileFromIPFS, false);
deleteFileElement.addEventListener("click", deleteFile, false);
selectAccountElement.addEventListener("change", changeAccount, false);

async function main() {
  var foundAccounts = await web3.eth.getAccounts();
  for (let i = 0; i < foundAccounts.length; i++) {
    var account = {
      address: foundAccounts[i],
      files: [],
    };
    accounts.push(account);
  }
  for (let i = 0; i < 5; i++) {
    selectAccountElement.options[i + 1].innerHTML = foundAccounts[i];
  }
}

main();
