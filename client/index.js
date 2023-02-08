import { Web3Storage, File, Web3File } from "web3.storage";
import Web3 from "web3";
import contractConfiguration from "../build/contracts/storageIndexing.json";
import "bootstrap/dist/css/bootstrap.css";

/* Conexión con el endpoint de almacenamiento IPFS */
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZhNEMwNEU2NzE0OWJmMDAwRGQ1MDdGMGI1ZUJmMDk0Nzc0NjE2NjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjYwMDAwNTIwODgsIm5hbWUiOiJ3ZWIzSVBGUyJ9.6yW9F47r4GUkse86Cnu9v6qQRCrn9P-AKkf4OrAOBi8";

const storage = new Web3Storage({ token });

/* Conexión con el despliegue del contrato */
const CONTRACT_ADDRESS = "0xa856b89dd4c7c45339e14fd857511021f22c83a5";
const CONTRACT_ABI = contractConfiguration.abi;

/* Variable global para instanciar después web3js*/
let web3;

/* Variable global para instanciar después el contrato */
let contract;

/* Variables para guardar las cuentas disponibles en la blockchain */
var chosenAccount = {
  address: "",
  files: [],
};

/* Declaración del buffer de subida*/
var uploadFiles = [];

/* Elementos de la interfaz de usuario */
const chooseFileElement = document.getElementById("chooseFile");
const submitFileElement = document.getElementById("submitFile");
const selectAccountElement = document.getElementById("select");
const tableElement = document.getElementById("table");
const selectDivElement = document.getElementById("selectDiv");
const enableEthereumElement = document.getElementById("enableEthereum");

/* Función para descargar el documento al equipo desde IPFS */
function retrieveFileFromIPFS(cid, filename) {
  if (cid == "") {
    throw new Error(`No se ha podido obtener el archivo ${filename}`);
  }
  var url = `https://${cid}.ipfs.w3s.link/${filename}`;
  window.open(url);
}

/* Función para mostrar en la tabla los documentos de cada cuenta */
function renderDataInTheTable(file) {
  const tableBody = document.getElementById("docsTable");

  let newRow = document.createElement("tr");
  let nameCell = document.createElement("td");
  let dwCell = document.createElement("td");
  let dwButton = document.createElement("button");

  nameCell.innerText = file.name;

  dwButton.innerHTML = "Get File";
  dwButton.className = "btn btn-outline-success";
  dwButton.addEventListener("click", downloadToSystem, false);
  dwButton.cid = file.cid;
  dwButton.filename = file.name;
  dwCell.appendChild(dwButton);

  newRow.appendChild(nameCell);
  newRow.appendChild(dwCell);
  tableBody.appendChild(newRow);
}

/* Funcion para mostrar todos los documentos de una cuenta en la tabla */
function renderFullTable() {
  for (let i = 0; i < chosenAccount.files.length; i++) {
    renderDataInTheTable(chosenAccount.files[i]);
  }
}

/* Función para resetear la tabla cada vez que se cambia de cuenta */
function clearTable() {
  let oldTableBody = document.getElementById("docsTable");
  let newTableBody = document.createElement("tbody");

  newTableBody.id = "docsTable";
  oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody);
}

/* Función que guarda en el buffer de subida el archivo seleccionado
 Se activa tras seleccionar el archivo con el botón "Choose file" */
function prepareFiles() {
  var file = this.files[0];

  uploadFiles.push(file);
  this.files[0] = null;
}

/* Función para añadir un fichero a una cuenta conforme se sube */
function addFileToAccount(cid) {
  chosenAccount.files.push({ cid: cid, name: uploadFiles[0].name });
}

/* Función encargada de subir el archivo al servicio IPFS y de guardar el identificador recibido en el smart contract
 Se activa con el botón "Submit" */
async function putFileToIPFS() {
  alert("Submitting file to IPFS...");
  var cid = await storage.put(uploadFiles);
  for (let i = 0; i < chosenAccount.files.length; i++) {
    if (cid === chosenAccount.files[i].cid) {
      alert("ERROR: el archivo ya existe");
      uploadFiles = [];
      throw new Error("El archivo ya existe");
    }
  }
  await contract.methods
    .store(uploadFiles[0].name, cid)
    .send({ from: chosenAccount.address, gas: 500000 })
    .on("error", function (error) {
      alert("ETH insuficiente");
      throw new Error("ETH insuficiente");
    });
  alert("File submitted!");
  addFileToAccount(cid);
  renderDataInTheTable({ name: uploadFiles[0].name, cid: cid });
  uploadFiles = [];
}

/* Función encargada de recuperar el identificador de un fichero desde el smart contract para después descargarlo desde el sevicio IPFS
  Se activa con el botón "Get file" */
async function downloadToSystem(evt) {
  retrieveFileFromIPFS(evt.target.cid, evt.target.filename);
}

async function retrieveAll() {
  var files = await contract.methods
    .retrieveAll()
    .call({ from: chosenAccount.address, gas: 500000 });

  for (let i = 0; i < files.length; i++) {
    chosenAccount.files.push({ cid: files[i].cid, name: files[i].name });
  }
}

/* Cambia la cuenta activa cuando se selecciona otra distinta en el selector */
async function changeAccount() {
  document.getElementById("uploadDiv").hidden = false;
  selectAccountElement.value = chosenAccount.address;
  clearTable();
  chosenAccount.files = [];
  await retrieveAll();
  renderFullTable();
}

/* Declaración del evento de cambio de cuenta en MetaMask para cambiar la cuenta en la interfaz */
ethereum.on("accountsChanged", (accounts) => {
  chosenAccount.address = accounts[0];
  changeAccount();
});

/* Función encargada de activar MetaMask y la interfaz al pulsar el boton de Log In */
function activate() {
  enableEthereumElement.hidden = true;
  ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    chosenAccount.address = accounts[0];
    changeAccount();
    selectDivElement.hidden = false;
    selectAccountElement.hidden = false;
    tableElement.hidden = false;
  });
}

/* Declaración de los listeners para cuando el usuario pulse cada uno de los botones */
chooseFileElement.addEventListener("change", prepareFiles, false);
submitFileElement.addEventListener("click", putFileToIPFS, false);
selectAccountElement.addEventListener("change", changeAccount, false);
enableEthereumElement.addEventListener("click", activate, false);
