/**
 * =====================================================
 * CHATBOT BÁSICO DE NEXOM
 * =====================================================
 *
 * Este chatbot funciona con respuestas predefinidas.
 * No utiliza inteligencia artificial.
 * No utiliza API.
 * No necesita servidor.
 */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /*
     * 1. Obtener los elementos del HTML.
     */

    const chatbotWindow = document.getElementById(
        "nexom-chatbot-window"
    );

    const chatbotButton = document.getElementById(
        "nexom-chatbot-button"
    );

    const chatbotClose = document.getElementById(
        "nexom-chatbot-close"
    );

    const chatbotForm = document.getElementById(
        "nexom-chatbot-form"
    );

    const chatbotInput = document.getElementById(
        "nexom-chatbot-input"
    );

    const chatbotMessages = document.getElementById(
        "nexom-chatbot-messages"
    );

    /*
     * 2. Verificar que los elementos existan.
     */

    if (
        !chatbotWindow ||
        !chatbotButton ||
        !chatbotClose ||
        !chatbotForm ||
        !chatbotInput ||
        !chatbotMessages
    ) {
        console.error(
            "No se pudo iniciar el chatbot de NEXOM."
        );

        return;
    }

    /*
     * 3. Abrir o cerrar el chatbot cuando el usuario
     *    presiona el botón flotante.
     */

    chatbotButton.addEventListener("click", function () {
        const chatbotEstaAbierto =
            chatbotWindow.classList.contains(
                "nexom-chatbot-is-open"
            );

        if (chatbotEstaAbierto) {
            cerrarChatbot();
        } else {
            abrirChatbot();
        }
    });

    /*
     * 4. Cerrar el chatbot con el botón X.
     */

    chatbotClose.addEventListener("click", function () {
        cerrarChatbot();
    });

    /*
     * 5. Cerrar el chatbot al presionar Escape.
     */

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            cerrarChatbot();
        }
    });

    /*
     * 6. Detectar cuando el usuario envía un mensaje.
     */

    chatbotForm.addEventListener("submit", function (event) {
        /*
         * Evita que el formulario recargue la página.
         */
        event.preventDefault();

        /*
         * Obtener el texto escrito por el usuario.
         */
        const mensajeUsuario = chatbotInput.value.trim();

        /*
         * No continuar si el campo está vacío.
         */
        if (mensajeUsuario === "") {
            return;
        }

        /*
         * Mostrar el mensaje del usuario.
         */
        agregarMensajeUsuario(mensajeUsuario);

        /*
         * Limpiar el campo de texto.
         */
        chatbotInput.value = "";

        /*
         * Mantener el cursor dentro del campo.
         */
        chatbotInput.focus();

        /*
         * Mostrar indicador de escritura.
         */
        mostrarIndicadorEscritura();

        /*
         * Simular un pequeño tiempo de espera.
         */
        setTimeout(function () {
            eliminarIndicadorEscritura();

            /*
             * Buscar una respuesta predefinida.
             */
            const respuestaBot =
                obtenerRespuestaChatbot(mensajeUsuario);

            /*
             * Mostrar la respuesta.
             */
            agregarMensajeBot(respuestaBot);
        }, 700);
    });

    /*
     * Abre la ventana del chatbot.
     */

    function abrirChatbot() {
        chatbotWindow.classList.add(
            "nexom-chatbot-is-open"
        );

        chatbotButton.classList.add(
            "nexom-chatbot-is-open"
        );

        chatbotWindow.setAttribute(
            "aria-hidden",
            "false"
        );

        chatbotButton.setAttribute(
            "aria-expanded",
            "true"
        );

        chatbotButton.setAttribute(
            "aria-label",
            "Cerrar chatbot de NEXOM"
        );

        /*
         * Esperar a que termine la animación y colocar
         * el cursor en el campo.
         */
        setTimeout(function () {
            chatbotInput.focus();
            moverScrollHaciaAbajo();
        }, 250);
    }

    /*
     * Cierra la ventana del chatbot.
     */

    function cerrarChatbot() {
        chatbotWindow.classList.remove(
            "nexom-chatbot-is-open"
        );

        chatbotButton.classList.remove(
            "nexom-chatbot-is-open"
        );

        chatbotWindow.setAttribute(
            "aria-hidden",
            "true"
        );

        chatbotButton.setAttribute(
            "aria-expanded",
            "false"
        );

        chatbotButton.setAttribute(
            "aria-label",
            "Abrir chatbot de NEXOM"
        );
    }

    /*
     * Agrega un mensaje escrito por el usuario.
     */

    function agregarMensajeUsuario(texto) {
        const mensaje = document.createElement("div");

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-user";

        const burbuja = document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo = document.createElement("p");

        /*
         * textContent evita que se ejecute código HTML
         * escrito dentro del campo.
         */
        parrafo.textContent = texto;

        burbuja.appendChild(parrafo);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /*
     * Agrega una respuesta del chatbot.
     */

    function agregarMensajeBot(texto) {
        const mensaje = document.createElement("div");

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-bot";

        const avatar = document.createElement("div");

        avatar.className =
            "nexom-chatbot-message-avatar";

        avatar.textContent = "🤖";

        const burbuja = document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo = document.createElement("p");

        parrafo.textContent = texto;

        burbuja.appendChild(parrafo);
        mensaje.appendChild(avatar);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /*
     * Muestra el texto "Escribiendo...".
     */

    function mostrarIndicadorEscritura() {
        eliminarIndicadorEscritura();

        const mensaje = document.createElement("div");

        mensaje.id = "nexom-chatbot-typing";

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-bot";

        const avatar = document.createElement("div");

        avatar.className =
            "nexom-chatbot-message-avatar";

        avatar.textContent = "🤖";

        const burbuja = document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo = document.createElement("p");

        parrafo.textContent = "Escribiendo...";

        burbuja.appendChild(parrafo);
        mensaje.appendChild(avatar);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /*
     * Elimina el indicador de escritura.
     */

    function eliminarIndicadorEscritura() {
        const indicador = document.getElementById(
            "nexom-chatbot-typing"
        );

        if (indicador) {
            indicador.remove();
        }
    }

    /*
     * Selecciona una respuesta según las palabras
     * que escribió el visitante.
     */

    function obtenerRespuestaChatbot(mensaje) {
        /*
         * Convertir el mensaje a minúsculas.
         */
        const mensajeNormalizado = mensaje
            .toLowerCase()

            /*
             * Eliminar acentos.
             */
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        /*
         * Saludos.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "hola",
                    "buen dia",
                    "buenos dias",
                    "buenas tardes",
                    "buenas noches",
                    "que tal"
                ]
            )
        ) {
            return (
                "¡Hola! Bienvenido a NEXOM. " +
                "Puedo proporcionarte información sobre " +
                "servicios, automatización, inteligencia " +
                "artificial, contacto y cotizaciones."
            );
        }

        /*
         * Servicios.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "servicio",
                    "servicios",
                    "que hacen",
                    "que ofrece nexom",
                    "soluciones"
                ]
            )
        ) {
            return (
                "NEXOM ofrece soluciones de automatización " +
                "estratégica e implementación de inteligencia " +
                "artificial para pequeñas y medianas empresas."
            );
        }

        /*
         * Automatización.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "automatizacion",
                    "automatizar",
                    "procesos",
                    "flujo",
                    "flujos"
                ]
            )
        ) {
            return (
                "La automatización permite reducir tareas " +
                "repetitivas, ahorrar tiempo, disminuir errores " +
                "y mejorar la eficiencia de los procesos de una empresa."
            );
        }

        /*
         * Inteligencia artificial.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "inteligencia artificial",
                    "ia",
                    "artificial",
                    "machine learning"
                ]
            )
        ) {
            return (
                "NEXOM ayuda a las empresas a identificar e " +
                "implementar soluciones de inteligencia artificial " +
                "de acuerdo con sus necesidades y procesos."
            );
        }

        /*
         * Pequeñas y medianas empresas.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "pyme",
                    "pymes",
                    "empresa",
                    "negocio"
                ]
            )
        ) {
            return (
                "Las soluciones de NEXOM están orientadas a " +
                "pequeñas y medianas empresas que buscan mejorar " +
                "su eficiencia, reducir errores y hacer escalables " +
                "sus operaciones."
            );
        }

        /*
         * Cotización.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "cotizacion",
                    "cotizar",
                    "precio",
                    "precios",
                    "costo",
                    "costos",
                    "cuanto cuesta"
                ]
            )
        ) {
            return (
                "El costo depende de las necesidades y del alcance " +
                "del proyecto. Para recibir una cotización, puedes " +
                "comunicarte con el equipo de NEXOM mediante el " +
                "formulario de contacto del sitio web."
            );
        }

        /*
         * Contacto.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "contacto",
                    "contactar",
                    "correo",
                    "telefono",
                    "asesoria",
                    "asesor"
                ]
            )
        ) {
            return (
                "Puedes contactar a NEXOM desde el formulario " +
                "de contacto disponible en este sitio web. " +
                "Un integrante del equipo dará seguimiento a tu solicitud."
            );
        }

        /*
         * Horarios.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "horario",
                    "horarios",
                    "hora",
                    "atienden",
                    "atencion"
                ]
            )
        ) {
            return (
                "Para consultar los horarios de atención vigentes, " +
                "revisa la sección de contacto del sitio web de NEXOM."
            );
        }

        /*
         * Despedidas.
         */
        if (
            contienePalabra(
                mensajeNormalizado,
                [
                    "gracias",
                    "adios",
                    "hasta luego",
                    "nos vemos"
                ]
            )
        ) {
            return (
                "Gracias por comunicarte con NEXOM. " +
                "Estoy disponible para responder otra consulta."
            );
        }

        /*
         * Respuesta cuando no existe una coincidencia.
         */
        return (
            "No encontré una respuesta exacta para tu consulta. " +
            "Puedes preguntarme por servicios, automatización, " +
            "inteligencia artificial, contacto o cotizaciones."
        );
    }

    /*
     * Revisa si el mensaje contiene alguna palabra
     * de la lista recibida.
     */

    function contienePalabra(
        mensajeNormalizado,
        listaDePalabras
    ) {
        return listaDePalabras.some(function (palabra) {
            return mensajeNormalizado.includes(palabra);
        });
    }

    /*
     * Desplaza el área de mensajes hasta el final.
     */

    function moverScrollHaciaAbajo() {
        requestAnimationFrame(function () {
            chatbotMessages.scrollTop =
                chatbotMessages.scrollHeight;
        });
    }
});