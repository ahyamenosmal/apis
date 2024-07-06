const imputMonto = document.getElementById("moneda");
const selectMonto = document.getElementById("selectMonto");
const resultado = document.getElementById("resultado");

const apiUrl = "https://mindicador.cl/api/";

let valorDolar;
let valorEuro;
let historicoDolar;
let historicoEuro;
let myChart;

async function obtenerValores() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Error al obtener los valores.");
    }

    const data = await response.json();
    valorDolar = data.dolar.valor;
    valorEuro = data.euro.valor;
    console.log(`Valor del dólar: ${valorDolar}, valor del euro: ${valorEuro}`);
  } catch (error) {
    console.error("Error al obtener los valores:", error);
  }
}

async function obtenerDatosHistoricos() {
  try {
    const responseDolar = await fetch(apiUrl + "dolar");
    const responseEuro = await fetch(apiUrl + "euro");

    if (!responseDolar.ok || !responseEuro.ok) {
      throw new Error(
        "Error en la solicitud HTTP para obtener datos históricos"
      );
    }

    const dataDolar = await responseDolar.json();
    const dataEuro = await responseEuro.json();

    if (!dataDolar || !dataDolar.serie || !dataEuro || !dataEuro.serie) {
      throw new Error("Datos de dolar o euro no encontrados en la respuesta");
    }

    historicoDolar = dataDolar.serie.slice(-10).map((entry) => ({
      fecha: new Date(entry.fecha).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      valor: entry.valor,
    }));

    historicoEuro = dataEuro.serie.slice(-10).map((entry) => ({
      fecha: new Date(entry.fecha).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      valor: entry.valor,
    }));

    console.log("Histórico del Dólar:", historicoDolar);
    console.log("Histórico del Euro:", historicoEuro);

    return { historicoDolar, historicoEuro };
  } catch (error) {
    console.error("Error al obtener datos históricos:", error.message);
    return null;
  }
}

async function convertirYDibujarGrafico() {
  const monto = imputMonto.value.trim();
  const moneda = selectMonto.value;

  if (!monto || monto <= 0 || moneda === "Seleccione moneda") {
    resultado.textContent = "Ingrese un monto válido y seleccione una moneda";
    return;
  }

  let conversion;
  if (moneda === "dolar") {
    conversion = monto / valorDolar;
  } else if (moneda === "euro") {
    conversion = monto / valorEuro;
  }

  resultado.textContent = `El resultado es: ${conversion.toFixed(2)}`;

  const datos = await obtenerDatosHistoricos();
  if (!datos) return;


  if (window.myChart instanceof Chart) {
    window.myChart.destroy();
  }

  const ctx = document.getElementById("myChart").getContext("2d");
  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.historicoDolar.map((entry) => entry.fecha),
      datasets: [
        {
          label: "Valor del Dólar (CLP)",
          data: datos.historicoDolar.map((entry) => entry.valor),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
        },
        {
          label: "Valor del Euro (CLP)",
          data: datos.historicoEuro.map((entry) => entry.valor),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });

  console.log(window.myChart);
}

document.getElementById("btn").onclick = convertirYDibujarGrafico;

window.onload = async function () {
  await obtenerValores();
};
