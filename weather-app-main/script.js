const mensaje = document.getElementById("mensaje");
const contenido = document.getElementById("contenido");
const formulario = document.getElementById("formulario");
const busqueda = document.getElementById("busqueda");

const btnUnidades = document.getElementById("btn-unidades");
const menuUnidades = document.getElementById("menu-unidades");
const btnCambiar = document.getElementById("btn-cambiar");
const btnCelsius = document.getElementById("btn-celsius");
const btnFahrenheit = document.getElementById("btn-fahrenheit");
const btnKmh = document.getElementById("btn-kmh");
const btnMph = document.getElementById("btn-mph");
const btnMm = document.getElementById("btn-mm");
const btnInch = document.getElementById("btn-inch");

const ciudad = document.getElementById("ciudad");
const fecha = document.getElementById("fecha");
const iconoHoy = document.getElementById("icono-hoy");
const tempHoy = document.getElementById("temp-hoy");
const sensacion = document.getElementById("sensacion");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");
const lluvia = document.getElementById("lluvia");
const dias = document.getElementById("dias");
const selectDia = document.getElementById("select-dia");
const listaHoras = document.getElementById("lista-horas");

const tarjetaHoy = document.querySelector(".hoy");
const consejo = document.createElement("p");
consejo.className = "consejo";
tarjetaHoy.children[0].appendChild(consejo);

let nombreCiudad = "Berlin, Germany";
let latitud = 52.52;
let longitud = 13.41;

let unidadTemp = "celsius";
let unidadViento = "kmh";
let unidadLluvia = "mm";

let datos = null;
let diaElegido = 0;

function obtenerIcono(codigo) {
  if (codigo === 0) {
    return "icon-sunny.webp";
  }
  if (codigo === 1 || codigo === 2) {
    return "icon-partly-cloudy.webp";
  }
  if (codigo === 3) {
    return "icon-overcast.webp";
  }
  if (codigo === 45 || codigo === 48) {
    return "icon-fog.webp";
  }
  if (codigo >= 51 && codigo <= 57) {
    return "icon-drizzle.webp";
  }
  if ((codigo >= 61 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) {
    return "icon-rain.webp";
  }
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) {
    return "icon-snow.webp";
  }
  if (codigo >= 95) {
    return "icon-storm.webp";
  }
  return "icon-overcast.webp";
}

function obtenerClase(codigo) {
  if (codigo <= 2) {
    return "soleado";
  }
  if (codigo >= 71 && codigo <= 77) {
    return "nevado";
  }
  if (codigo === 85 || codigo === 86) {
    return "nevado";
  }
  if (codigo >= 51) {
    return "lluvioso";
  }
  return "nublado";
}

function obtenerConsejo(codigo) {
  if (codigo <= 2) {
    return "Great day to go outside!";
  }
  if (codigo === 3 || codigo === 45 || codigo === 48) {
    return "A bit grey today";
  }
  if (codigo >= 95) {
    return "Stay inside, storm ahead!";
  }
  if (codigo >= 71 && codigo <= 77) {
    return "Bundle up, it's snowing!";
  }
  if (codigo >= 51) {
    return "Don't forget your umbrella!";
  }
  return "Have a nice day!";
}

function nombreDia(texto, formato) {
  const f = new Date(texto.slice(0, 10) + "T12:00:00");
  return f.toLocaleDateString("en-US", { weekday: formato });
}

function formatoHora(texto) {
  let hora = Number(texto.slice(11, 13));
  let sufijo = "AM";
  if (hora >= 12) {
    sufijo = "PM";
  }
  hora = hora % 12;
  if (hora === 0) {
    hora = 12;
  }
  return hora + " " + sufijo;
}

function grados(numero) {
  return Math.round(numero) + "°";
}

async function pedirClima() {
  mensaje.hidden = false;
  mensaje.textContent = "Loading...";
  contenido.style.display = "none";

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + latitud +
      "&longitude=" + longitud +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
      "&hourly=temperature_2m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=auto" +
      "&temperature_unit=" + unidadTemp +
      "&wind_speed_unit=" + unidadViento +
      "&precipitation_unit=" + unidadLluvia;

    const respuesta = await fetch(url);
    datos = await respuesta.json();

    diaElegido = 0;
    mensaje.hidden = true;
    contenido.style.display = "grid";
    mostrarTodo();
  } catch (error) {
    mensaje.textContent = "Something went wrong. Please try again.";
  }
}

async function buscarCiudad(nombre) {
  mensaje.hidden = false;
  mensaje.textContent = "Search in progress...";

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(nombre) +
      "&count=1&language=en";

    const respuesta = await fetch(url);
    const resultado = await respuesta.json();

    if (!resultado.results) {
      contenido.style.display = "none";
      mensaje.textContent = "No search result found!";
      return;
    }

    const lugar = resultado.results[0];
    nombreCiudad = lugar.name + ", " + lugar.country;
    latitud = lugar.latitude;
    longitud = lugar.longitude;

    pedirClima();
  } catch (error) {
    mensaje.textContent = "Something went wrong. Please try again.";
  }
}

function mostrarTodo() {
  const actual = datos.current;
  const diario = datos.daily;

  ciudad.textContent = nombreCiudad;
  const f = new Date(actual.time.slice(0, 10) + "T12:00:00");
  fecha.textContent = f.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  iconoHoy.src = "./assets/images/" + obtenerIcono(actual.weather_code);
  tempHoy.textContent = grados(actual.temperature_2m);

  tarjetaHoy.className = "hoy " + obtenerClase(actual.weather_code);
  consejo.textContent = obtenerConsejo(actual.weather_code);

  sensacion.textContent = grados(actual.apparent_temperature);
  humedad.textContent = Math.round(actual.relative_humidity_2m) + "%";
  viento.textContent = Math.round(actual.wind_speed_10m) + " " + datos.current_units.wind_speed_10m;
  lluvia.textContent = actual.precipitation + " " + datos.current_units.precipitation;

  let htmlDias = "";
  for (let i = 0; i < diario.time.length; i++) {
    htmlDias += `
      <div class="dia">
        <span>${nombreDia(diario.time[i], "short")}</span>
        <img src="./assets/images/${obtenerIcono(diario.weather_code[i])}" alt="">
        <div class="temps">
          <span>${grados(diario.temperature_2m_max[i])}</span>
          <span>${grados(diario.temperature_2m_min[i])}</span>
        </div>
      </div>
    `;
  }
  dias.innerHTML = htmlDias;

  let htmlOpciones = "";
  for (let i = 0; i < diario.time.length; i++) {
    htmlOpciones += `<option value="${i}">${nombreDia(diario.time[i], "long")}</option>`;
  }
  selectDia.innerHTML = htmlOpciones;
  selectDia.value = diaElegido;

  mostrarHoras();
}

function mostrarHoras() {
  const horario = datos.hourly;
  const diaTexto = datos.daily.time[diaElegido];

  let htmlHoras = "";
  for (let i = 0; i < horario.time.length; i++) {
    if (horario.time[i].slice(0, 10) === diaTexto) {
      htmlHoras += `
        <div class="hora">
          <img src="./assets/images/${obtenerIcono(horario.weather_code[i])}" alt="">
          <span class="texto-hora">${formatoHora(horario.time[i])}</span>
          <span>${grados(horario.temperature_2m[i])}</span>
        </div>
      `;
    }
  }
  listaHoras.innerHTML = htmlHoras;
  listaHoras.scrollTop = 0;
}

function marcar(boton, activo) {
  if (activo) {
    boton.classList.add("activo");
  } else {
    boton.classList.remove("activo");
  }
}

function actualizarBotones() {
  marcar(btnCelsius, unidadTemp === "celsius");
  marcar(btnFahrenheit, unidadTemp === "fahrenheit");
  marcar(btnKmh, unidadViento === "kmh");
  marcar(btnMph, unidadViento === "mph");
  marcar(btnMm, unidadLluvia === "mm");
  marcar(btnInch, unidadLluvia === "inch");

  if (unidadTemp === "fahrenheit") {
    btnCambiar.textContent = "Switch to Metric";
  } else {
    btnCambiar.textContent = "Switch to Imperial";
  }
}

btnUnidades.addEventListener("click", function () {
  menuUnidades.hidden = !menuUnidades.hidden;
});

btnCelsius.addEventListener("click", function () {
  unidadTemp = "celsius";
  actualizarBotones();
  pedirClima();
});

btnFahrenheit.addEventListener("click", function () {
  unidadTemp = "fahrenheit";
  actualizarBotones();
  pedirClima();
});

btnKmh.addEventListener("click", function () {
  unidadViento = "kmh";
  actualizarBotones();
  pedirClima();
});

btnMph.addEventListener("click", function () {
  unidadViento = "mph";
  actualizarBotones();
  pedirClima();
});

btnMm.addEventListener("click", function () {
  unidadLluvia = "mm";
  actualizarBotones();
  pedirClima();
});

btnInch.addEventListener("click", function () {
  unidadLluvia = "inch";
  actualizarBotones();
  pedirClima();
});

btnCambiar.addEventListener("click", function () {
  if (unidadTemp === "celsius") {
    unidadTemp = "fahrenheit";
    unidadViento = "mph";
    unidadLluvia = "inch";
  } else {
    unidadTemp = "celsius";
    unidadViento = "kmh";
    unidadLluvia = "mm";
  }
  actualizarBotones();
  pedirClima();
});

selectDia.addEventListener("change", function () {
  diaElegido = Number(selectDia.value);
  mostrarHoras();
});

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const texto = busqueda.value.trim();
  if (texto !== "") {
    buscarCiudad(texto);
  }
});

actualizarBotones();
pedirClima();