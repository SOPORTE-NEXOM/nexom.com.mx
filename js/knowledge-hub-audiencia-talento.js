document.addEventListener("DOMContentLoaded", function () {
  const resourcesContainer = document.getElementById("recursos-audiencia-talento");

  // Esta página puede no contener el listado; en ese caso no hacemos nada.
  if (!resourcesContainer) {
    return;
  }

  const resourcesEndpoint =
    "http://soportenexom.local/wp-json/wp/v2/recursos?apartados-recursos=4&_embed";

  // Convierte el contenido de WordPress en texto plano sin insertarlo como HTML.
  function getPlainText(value) {
    if (typeof value !== "string") {
      return "";
    }

    const parsedDocument = new DOMParser().parseFromString(value, "text/html");
    return parsedDocument.body.textContent.trim();
  }

  // Solo permite enlaces web seguros provenientes del campo personalizado.
  function getSafeResourceUrl(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    try {
      const resourceUrl = new URL(value);
      return ["http:", "https:"].includes(resourceUrl.protocol)
        ? resourceUrl.href
        : "";
    } catch (error) {
      return "";
    }
  }

  function showLoading() {
    const loadingStatus = document.createElement("p");
    loadingStatus.classList.add("resource-list-status");
    loadingStatus.setAttribute("role", "status");
    loadingStatus.textContent = "Cargando recursos...";

    const skeletonGrid = document.createElement("div");
    skeletonGrid.classList.add("resources-grid", "resources-grid--loading");
    skeletonGrid.setAttribute("aria-hidden", "true");

    for (let index = 0; index < 3; index += 1) {
      const skeletonCard = document.createElement("article");
      skeletonCard.classList.add("resource-list-card", "resource-list-card--skeleton");

      const skeletonImage = document.createElement("div");
      skeletonImage.classList.add("resource-list-skeleton", "resource-list-skeleton--image");

      const skeletonContent = document.createElement("div");
      skeletonContent.classList.add("resource-list-content");

      ["title", "text", "text-short", "button"].forEach(function (elementType) {
        const skeletonElement = document.createElement("span");
        skeletonElement.classList.add(
          "resource-list-skeleton",
          `resource-list-skeleton--${elementType}`
        );
        skeletonContent.appendChild(skeletonElement);
      });

      skeletonCard.appendChild(skeletonImage);
      skeletonCard.appendChild(skeletonContent);
      skeletonGrid.appendChild(skeletonCard);
    }

    resourcesContainer.setAttribute("aria-busy", "true");
    resourcesContainer.replaceChildren(loadingStatus, skeletonGrid);
  }

  function showMessage(message, state) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("resource-list-state", `resource-list-state--${state}`);
    messageContainer.setAttribute("role", "status");

    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    messageContainer.appendChild(paragraph);

    resourcesContainer.setAttribute("aria-busy", "false");
    resourcesContainer.replaceChildren(messageContainer);
  }

  function createResourceCard(resource) {
    const article = document.createElement("article");
    article.classList.add("resource-list-card");

    const title = getPlainText(resource.title?.rendered);
    const description = getPlainText(resource.excerpt?.rendered);
    const featuredMedia = resource._embedded?.["wp:featuredmedia"]?.[0];

    const media = document.createElement("div");
    media.classList.add("resource-list-media");

    const image = document.createElement("img");
    image.classList.add("resource-list-image");
    image.src = featuredMedia?.source_url || "../images/logo_nexom_sinfondo.png";
    image.alt = featuredMedia?.alt_text || title || "Recurso de NEXOM";
    image.loading = "lazy";

    if (!featuredMedia?.source_url) {
      image.classList.add("resource-list-image--fallback");
    }

    media.appendChild(image);

    // Campo opcional preparado para una futura etiqueta registrada en WordPress.
    const badgeText = getPlainText(
      resource.etiqueta_recurso || resource.meta?.etiqueta_recurso
    );

    if (badgeText) {
      const badge = document.createElement("span");
      badge.classList.add("resource-list-badge");
      badge.textContent = badgeText;
      media.appendChild(badge);
    }

    article.appendChild(media);

    const content = document.createElement("div");
    content.classList.add("resource-list-content");

    const heading = document.createElement("h3");
    heading.classList.add("resource-list-title");
    heading.textContent = title;
    content.appendChild(heading);

    const descriptionElement = document.createElement("p");
    descriptionElement.classList.add("resource-list-description");
    descriptionElement.textContent = description;
    content.appendChild(descriptionElement);

    const resourceUrl = getSafeResourceUrl(resource.enlace_recurso);

    if (resourceUrl) {
      const link = document.createElement("a");
      link.classList.add("resource-list-link");
      link.href = resourceUrl;
      link.textContent = "Ver recurso";
      content.appendChild(link);
    }

    article.appendChild(content);
    return article;
  }

  showLoading();

  fetch(resourcesEndpoint)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`La API respondió con el estado ${response.status}.`);
      }

      return response.json();
    })
    .then(function (resources) {
      if (!Array.isArray(resources)) {
        throw new Error("La API no devolvió una lista de recursos.");
      }

      if (resources.length === 0) {
        showMessage("Por el momento no hay recursos disponibles.", "empty");
        return;
      }

      const resourcesGrid = document.createElement("div");
      resourcesGrid.classList.add("resources-grid");

      resources.forEach(function (resource) {
        resourcesGrid.appendChild(createResourceCard(resource));
      });

      resourcesContainer.setAttribute("aria-busy", "false");
      resourcesContainer.replaceChildren(resourcesGrid);
    })
    .catch(function (error) {
      showMessage("No fue posible cargar los recursos en este momento.", "error");
      console.error(error);
    });
});
