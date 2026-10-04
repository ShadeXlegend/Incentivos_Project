export var gsUrlApi = "";
export var gsUrlApiS3 = "";
var sAmbiente = "dev";
export var gsUpFiles = ""

switch (sAmbiente) {
    case "PRODUCCION":
        gsUrlApi = 'https://isoft.onrender.com';
        break;

    case "dev":
        gsUrlApi = 'http://localhost:3001';
        break;

    default:
        gsUrlApi = 'http://localhost:3001';
        break;
}

