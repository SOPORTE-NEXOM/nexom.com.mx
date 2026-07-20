/**
 * =====================================================
 * CHATBOT DE NEXOM CON BASE DE CONOCIMIENTO JSON
 * =====================================================
 *
 * Este chatbot:
 * - Lee información desde un archivo JSON.
 * - Responde mediante reglas y palabras clave.
 * - No utiliza inteligencia artificial.
 * - No inventa teléfonos, correos o direcciones.
 * - Usa una respuesta de respaldo cuando no encuentra datos.
 */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /*
     * Variable donde se guardará la información
     * obtenida desde el archivo JSON.
     */
    let nexomKnowledgeBase = null;

    /*
     * Obtener los elementos del chatbot.
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
     * Verificar que todos los elementos existan.
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
            "[NEXOM Chatbot] No se encontraron todos los elementos HTML."
        );

        return;
    }

    /*
     * Cargar la base de conocimiento.
     */
    cargarBaseDeConocimiento();

    /*
     * Abrir o cerrar el chatbot.
     */
    chatbotButton.addEventListener("click", function () {
        const estaAbierto =
            chatbotWindow.classList.contains(
                "nexom-chatbot-is-open"
            );

        if (estaAbierto) {
            cerrarChatbot();
        } else {
            abrirChatbot();
        }
    });

    /*
     * Cerrar mediante la X.
     */
    chatbotClose.addEventListener("click", function () {
        cerrarChatbot();
    });

    /*
     * Cerrar mediante Escape.
     */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            cerrarChatbot();
        }
    });

    /*
     * Procesar mensajes.
     */
    chatbotForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const mensajeUsuario =
            chatbotInput.value.trim();

        if (mensajeUsuario === "") {
            return;
        }

        agregarMensajeUsuario(mensajeUsuario);

        chatbotInput.value = "";
        chatbotInput.focus();

        /*
         * Si el JSON todavía no terminó de cargar,
         * se informa al usuario.
         */
        if (!nexomKnowledgeBase) {
            agregarMensajeBot(
                "La información de NEXOM todavía se está cargando. " +
                "Por favor, intenta nuevamente en unos segundos."
            );

            return;
        }

        mostrarIndicadorEscritura();

        window.setTimeout(function () {
            eliminarIndicadorEscritura();

            const respuesta =
                obtenerRespuestaChatbot(mensajeUsuario);

            agregarMensajeBot(respuesta);
        }, 600);
    });

    /**
     * Carga el archivo JSON.
     */
    async function cargarBaseDeConocimiento() {
        try {
            const respuesta = await fetch(
                "data/nexom-knowledge-base.json",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    "No fue posible cargar el archivo JSON. " +
                    "Código HTTP: " +
                    respuesta.status
                );
            }

            nexomKnowledgeBase =
                await respuesta.json();

            validarBaseDeConocimiento(
                nexomKnowledgeBase
            );

            console.log(
                "[NEXOM Chatbot] Base de conocimiento cargada correctamente."
            );
        } catch (error) {
            nexomKnowledgeBase = null;

            console.error(
                "[NEXOM Chatbot] Error al cargar la base de conocimiento:",
                error
            );

            agregarMensajeBot(
                "En este momento no fue posible cargar la información. " +
                "Por favor, intenta nuevamente más tarde."
            );
        }
    }

    /**
     * Comprueba que existan las secciones principales.
     */
    function validarBaseDeConocimiento(base) {
        if (!base || typeof base !== "object") {
            throw new Error(
                "La base de conocimiento no es válida."
            );
        }

        const seccionesObligatorias = [
            "metadata",
            "contact",
            "company",
            "services",
            "projects",
            "responseRules"
        ];

        seccionesObligatorias.forEach(
            function (seccion) {
                if (!base[seccion]) {
                    throw new Error(
                        "Falta la sección obligatoria: " +
                        seccion
                    );
                }
            }
        );

        if (!Array.isArray(base.services)) {
            throw new Error(
                "La propiedad services debe ser una lista."
            );
        }

        if (!Array.isArray(base.projects)) {
            throw new Error(
                "La propiedad projects debe ser una lista."
            );
        }
    }

    /**
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

        window.setTimeout(function () {
            chatbotInput.focus();
            moverScrollHaciaAbajo();
        }, 250);
    }

    /**
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

    /**
     * Decide qué respuesta mostrar.
     */
    function obtenerRespuestaChatbot(mensajeOriginal) {
        const mensaje =
            normalizarTexto(mensajeOriginal);

        /*
         * Saludo.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "hola",
                    "buenos dias",
                    "buenas tardes",
                    "buenas noches",
                    "que tal"
                ]
            )
        ) {
            return (
                "¡Hola! Bienvenido a NEXOM.\n\n" +
                "Puedes preguntarme sobre:\n" +
                "• Servicios\n" +
                "• Automatización\n" +
                "• Capacitación\n" +
                "• Consultoría\n" +
                "• Proyectos\n" +
                "• Datos de contacto"
            );
        }

        /*
         * Datos generales de contacto.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "datos de contacto",
                    "como los contacto",
                    "como puedo contactarlos",
                    "contactar nexom",
                    "contacto de nexom"
                ]
            )
        ) {
            return crearRespuestaDeContacto();
        }

        /*
         * Teléfono.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "telefono",
                    "numero de telefono",
                    "numero para llamar",
                    "llamar"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.phone,
                "• Teléfono de contacto: "
            );
        }

        /*
         * WhatsApp.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "whatsapp",
                    "whats",
                    "numero de whatsapp"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.whatsapp,
                "• WhatsApp: "
            );
        }

        /*
         * Correo.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "correo",
                    "email",
                    "correo electronico"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.email,
                "• Correo electrónico: "
            );
        }

        /*
         * Dirección.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "direccion",
                    "ubicacion",
                    "donde estan",
                    "donde se ubican",
                    "oficina"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.address,
                "• Dirección publicada: "
            );
        }

        /*
         * Horarios.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "horario",
                    "horarios",
                    "hora de atencion",
                    "cuando atienden"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.businessHours,
                "• Horario: "
            );
        }

        /*
         * Cobertura.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "cobertura",
                    "todo mexico",
                    "trabajan en mexico",
                    "atienden fuera",
                    "otras ciudades",
                    "otros estados"
                ]
            )
        ) {
            return obtenerDatoVerificado(
                nexomKnowledgeBase.contact.coverage,
                "• Cobertura: "
            );
        }

        /*
         * Precio o cotización.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "precio",
                    "precios",
                    "costo",
                    "costos",
                    "cuanto cuesta",
                    "cotizacion",
                    "cotizar"
                ]
            )
        ) {
            return obtenerRespuestaDesconocida();
        }

        /*
         * Lista completa de servicios.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "servicios",
                    "que servicios ofrecen",
                    "que ofrece nexom",
                    "que hacen",
                    "soluciones"
                ]
            )
        ) {
            return crearListaDeServicios();
        }

        /*
         * Buscar un servicio específico.
         */
        const servicioEncontrado =
            buscarServicio(mensaje);

        if (servicioEncontrado) {
            return crearRespuestaDeServicio(
                servicioEncontrado
            );
        }

        /*
         * Proyectos y casos de éxito.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "proyectos",
                    "casos de exito",
                    "casos",
                    "trabajos realizados",
                    "clientes"
                ]
            )
        ) {
            return crearListaDeProyectos();
        }

        /*
         * Buscar proyecto específico.
         */
        const proyectoEncontrado =
            buscarProyecto(mensaje);

        if (proyectoEncontrado) {
            return crearRespuestaDeProyecto(
                proyectoEncontrado
            );
        }

        /*
         * Información general de NEXOM.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
                [
                    "que es nexom",
                    "quienes son",
                    "acerca de nexom",
                    "informacion de nexom"
                ]
            )
        ) {
            return nexomKnowledgeBase.company.description;
        }

        /*
         * Despedida.
         */
        if (
            contieneAlgunaExpresion(
                mensaje,
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
                "Estoy disponible para ayudarte con otra consulta."
            );
        }

        /*
         * Respuesta cuando no existe información.
         */
        return obtenerRespuestaDesconocida();
    }

    /**
     * Crea una respuesta con los contactos permitidos.
     */
    function crearRespuestaDeContacto() {
        const contacto =
            nexomKnowledgeBase.contact;

        const lineas = [
            "Puedes comunicarte con NEXOM mediante:"
        ];

        if (
            contacto.phone &&
            contacto.phone.status === "verified"
        ) {
            lineas.push(
                "• Teléfono: " +
                contacto.phone.value
            );
        }

        if (
            contacto.email &&
            contacto.email.status === "verified"
        ) {
            lineas.push(
                "• Correo: " +
                contacto.email.value
            );
        }

        if (
            contacto.address &&
            contacto.address.status === "verified"
        ) {
            lineas.push(
                "• Dirección: " +
                contacto.address.value
            );
        }

        if (lineas.length === 1) {
            return obtenerRespuestaDesconocida();
        }

        return lineas.join("\n");
    }

    /**
     * Devuelve un dato solo cuando está verificado.
     */
    function obtenerDatoVerificado(
        dato,
        prefijo
    ) {
        if (
            dato &&
            dato.status === "verified" &&
            typeof dato.value === "string" &&
            dato.value.trim() !== ""
        ) {
            return prefijo + dato.value;
        }

        return obtenerRespuestaDesconocida();
    }

    /**
     * Crea una lista de servicios.
     */
    function crearListaDeServicios() {
        const servicios =
            nexomKnowledgeBase.services;

        if (
            !Array.isArray(servicios) ||
            servicios.length === 0
        ) {
            return obtenerRespuestaDesconocida();
        }

        const lineas = [
            "NEXOM ofrece los siguientes servicios:"
        ];

        servicios.forEach(function (servicio) {
            lineas.push(
                "• " +
                servicio.name +
                ": " +
                servicio.description
            );
        });

        return lineas.join("\n");
    }

    /**
     * Busca un servicio por palabras clave.
     */
    function buscarServicio(mensaje) {
        return nexomKnowledgeBase.services.find(
            function (servicio) {
                if (
                    mensaje.includes(
                        normalizarTexto(servicio.name)
                    )
                ) {
                    return true;
                }

                return servicio.keywords.some(
                    function (palabra) {
                        return mensaje.includes(
                            normalizarTexto(palabra)
                        );
                    }
                );
            }
        );
    }

    /**
     * Crea una respuesta detallada de un servicio.
     */
    function crearRespuestaDeServicio(servicio) {
        const lineas = [
            servicio.name + ":",
            servicio.description
        ];

        if (
            Array.isArray(servicio.benefits) &&
            servicio.benefits.length > 0
        ) {
            lineas.push("");
            lineas.push("Beneficios principales:");

            servicio.benefits.forEach(
                function (beneficio) {
                    lineas.push(
                        "• " + beneficio
                    );
                }
            );
        }

        return lineas.join("\n");
    }

    /**
     * Crea la lista completa de proyectos.
     */
    function crearListaDeProyectos() {
        const proyectos =
            nexomKnowledgeBase.projects;

        if (
            !Array.isArray(proyectos) ||
            proyectos.length === 0
        ) {
            return obtenerRespuestaDesconocida();
        }

        const lineas = [
            "NEXOM presenta los siguientes proyectos o casos generales:"
        ];

        proyectos.forEach(function (proyecto) {
            lineas.push(
                "• " +
                proyecto.name +
                ": " +
                proyecto.scope.join(", ")
            );
        });

        return lineas.join("\n");
    }

    /**
     * Busca un proyecto por palabras clave.
     */
    function buscarProyecto(mensaje) {
        return nexomKnowledgeBase.projects.find(
            function (proyecto) {
                if (
                    mensaje.includes(
                        normalizarTexto(proyecto.name)
                    )
                ) {
                    return true;
                }

                return proyecto.keywords.some(
                    function (palabra) {
                        return mensaje.includes(
                            normalizarTexto(palabra)
                        );
                    }
                );
            }
        );
    }

    /**
     * Crea la respuesta para un proyecto.
     */
    function crearRespuestaDeProyecto(proyecto) {
        const lineas = [
            proyecto.name + ":",
            "• Sector: " + proyecto.sector
        ];

        proyecto.scope.forEach(
            function (alcance) {
                lineas.push(
                    "• " + alcance
                );
            }
        );

        return lineas.join("\n");
    }

    /**
     * Devuelve la respuesta oficial para datos desconocidos.
     */
    function obtenerRespuestaDesconocida() {
        if (
            nexomKnowledgeBase.responseRules &&
            nexomKnowledgeBase.responseRules
                .unknownDataResponse
        ) {
            return nexomKnowledgeBase.responseRules
                .unknownDataResponse;
        }

        return (
            "Por el momento no dispongo de esa información exacta, " +
            "pero puedes dejarnos tus datos para que un asesor te contacte."
        );
    }

    /**
     * Normaliza texto:
     * - Convierte a minúsculas.
     * - Elimina acentos.
     * - Elimina espacios repetidos.
     */
    function normalizarTexto(texto) {
        return String(texto)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    /**
     * Comprueba si un texto contiene una expresión.
     */
    function contieneAlgunaExpresion(
        mensaje,
        expresiones
    ) {
        return expresiones.some(
            function (expresion) {
                return mensaje.includes(
                    normalizarTexto(expresion)
                );
            }
        );
    }

    /**
     * Agrega el mensaje del usuario.
     */
    function agregarMensajeUsuario(texto) {
        const mensaje =
            document.createElement("div");

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-user";

        const burbuja =
            document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo =
            document.createElement("p");

        parrafo.textContent = texto;

        burbuja.appendChild(parrafo);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /**
     * Agrega la respuesta del chatbot.
     */
    function agregarMensajeBot(texto) {
        const mensaje =
            document.createElement("div");

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-bot";

        const avatar =
            document.createElement("div");

        avatar.className =
            "nexom-chatbot-message-avatar";

        avatar.textContent = "🤖";

        const burbuja =
            document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo =
            document.createElement("p");

        /*
         * white-space: pre-line permitirá mostrar
         * los saltos de línea del texto.
         */
        parrafo.textContent = texto;

        burbuja.appendChild(parrafo);
        mensaje.appendChild(avatar);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /**
     * Muestra el indicador "Escribiendo...".
     */
    function mostrarIndicadorEscritura() {
        eliminarIndicadorEscritura();

        const mensaje =
            document.createElement("div");

        mensaje.id =
            "nexom-chatbot-typing";

        mensaje.className =
            "nexom-chatbot-message " +
            "nexom-chatbot-message-bot";

        const avatar =
            document.createElement("div");

        avatar.className =
            "nexom-chatbot-message-avatar";

        avatar.textContent = "🤖";

        const burbuja =
            document.createElement("div");

        burbuja.className =
            "nexom-chatbot-message-bubble";

        const parrafo =
            document.createElement("p");

        parrafo.textContent = "Escribiendo...";

        burbuja.appendChild(parrafo);
        mensaje.appendChild(avatar);
        mensaje.appendChild(burbuja);
        chatbotMessages.appendChild(mensaje);

        moverScrollHaciaAbajo();
    }

    /**
     * Elimina el indicador de escritura.
     */
    function eliminarIndicadorEscritura() {
        const indicador =
            document.getElementById(
                "nexom-chatbot-typing"
            );

        if (indicador) {
            indicador.remove();
        }
    }

    /**
     * Baja automáticamente al último mensaje.
     */
    function moverScrollHaciaAbajo() {
        window.requestAnimationFrame(
            function () {
                chatbotMessages.scrollTop =
                    chatbotMessages.scrollHeight;
            }
        );
    }
});