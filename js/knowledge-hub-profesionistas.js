document.addEventListener("DOMContentLoaded", function () {
  const resourcesContainer = document.getElementById("recursos-profesionistas");

  // Esta página puede no contener el listado; en ese caso no hacemos nada.
  if (!resourcesContainer) {
    return;
  }

  const resourcesEndpoint =
    "http://soportenexom.local/wp-json/wp/v2/recursos?apartados-recursos=3&_embed";

  // Convierte el contenido de WordPress en texto plano sin insertarlo como HTML.
  function getPlainText(value) {
    if (typeof value !== "string") {
      return "";
    }

    const parsedDocument = new DOMParser().parseFromString(value, "text/html");
    return parsedDocument.body.textContent.trim();
  }

  const resourcePositions = {
    featured: 6,
    secondary: 7,
    caseStudy: 8,
    tool: 9,
  };

  const positionPriority = [
    ["featured", resourcePositions.featured],
    ["caseStudy", resourcePositions.caseStudy],
    ["tool", resourcePositions.tool],
    ["secondary", resourcePositions.secondary],
  ];

  function getResourceLabel(resource) {
    const title = getPlainText(resource.title?.rendered);
    return title || `ID ${resource.id || "desconocido"}`;
  }

  function getResourcePositions(resource) {
    const positions = resource["posiciones-recursos"];

    if (!Array.isArray(positions)) {
      return [];
    }

    return positions
      .map(function (position) {
        return Number(position);
      })
      .filter(function (position) {
        return Number.isInteger(position);
      });
  }

  function classifyResources(resources) {
    const classifiedResources = {
      featured: [],
      secondary: [],
      caseStudy: [],
      tool: [],
    };

    resources.forEach(function (resource) {
      const positions = getResourcePositions(resource);
      const matchingPositions = positionPriority.filter(function (positionEntry) {
        return positions.includes(positionEntry[1]);
      });

      if (matchingPositions.length === 0) {
        console.warn(
          `El recurso "${getResourceLabel(resource)}" no tiene una posición reconocida y no se mostrará.`
        );
        return;
      }

      if (matchingPositions.length > 1) {
        console.warn(
          `El recurso "${getResourceLabel(resource)}" tiene varias posiciones. Se usará la posición de mayor prioridad.`
        );
      }

      classifiedResources[matchingPositions[0][0]].push(resource);
    });

    if (classifiedResources.featured.length > 1) {
      console.warn(
        "Hay varios recursos destacados. Solo se mostrará el primero; revisa la clasificación en WordPress."
      );
    }

    [
      ["secondary", 3, "secundarios"],
      ["caseStudy", 1, "de caso práctico"],
      ["tool", 1, "de herramienta"],
    ].forEach(function (limitConfiguration) {
      const [positionName, limit, positionLabel] = limitConfiguration;

      if (classifiedResources[positionName].length > limit) {
        console.warn(
          `Hay más recursos ${positionLabel} de los que admite la página. Solo se mostrarán los primeros ${limit}.`
        );
      }
    });

    return {
      featured: classifiedResources.featured.slice(0, 1),
      secondary: classifiedResources.secondary.slice(0, 3),
      caseStudy: classifiedResources.caseStudy.slice(0, 1),
      tool: classifiedResources.tool.slice(0, 1),
    };
  }

  function createSkeletonCard() {
    const skeletonCard = document.createElement("article");
    skeletonCard.classList.add("resource-list-card", "resource-list-card--skeleton");

    const skeletonImage = document.createElement("div");
    skeletonImage.classList.add("resource-list-skeleton", "resource-list-skeleton--image");

    const skeletonContent = document.createElement("div");
    skeletonContent.classList.add("resource-list-content");

    ["title", "text", "text-short"].forEach(function (elementType) {
      const skeletonElement = document.createElement("span");
      skeletonElement.classList.add(
        "resource-list-skeleton",
        `resource-list-skeleton--${elementType}`
      );
      skeletonContent.appendChild(skeletonElement);
    });

    skeletonCard.appendChild(skeletonImage);
    skeletonCard.appendChild(skeletonContent);
    return skeletonCard;
  }

  function showLoading() {
    const loadingStatus = document.createElement("p");
    loadingStatus.classList.add("resource-list-status");
    loadingStatus.setAttribute("role", "status");
    loadingStatus.textContent = "Cargando recursos...";

    const skeletonLayout = document.createElement("div");
    skeletonLayout.classList.add("professional-resources-loading");
    skeletonLayout.setAttribute("aria-hidden", "true");

    const featuredSkeleton = document.createElement("div");
    featuredSkeleton.classList.add("professional-resource-slot", "professional-resource-slot--loading");
    featuredSkeleton.appendChild(createSkeletonCard());

    const skeletonGrid = document.createElement("div");
    skeletonGrid.classList.add("resources-grid", "resources-grid--loading");

    for (let index = 0; index < 3; index += 1) {
      skeletonGrid.appendChild(createSkeletonCard());
    }

    skeletonLayout.appendChild(featuredSkeleton);
    skeletonLayout.appendChild(skeletonGrid);

    resourcesContainer.setAttribute("aria-busy", "true");
    resourcesContainer.replaceChildren(loadingStatus, skeletonLayout);
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

  function createResourceCard(resource, variant) {
    const article = document.createElement("article");
    article.classList.add(
      "resource-list-card",
      "professional-resource-card",
      `professional-resource-card--${variant}`
    );

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

    const heading = document.createElement("h4");
    heading.classList.add("resource-list-title");
    heading.textContent = title;
    content.appendChild(heading);

    const descriptionElement = document.createElement("p");
    descriptionElement.classList.add("resource-list-description");
    descriptionElement.textContent = description;
    content.appendChild(descriptionElement);

    article.appendChild(content);
    return article;
  }

  function createResourceSection(sectionConfiguration) {
    const section = document.createElement("section");
    const headingId = `professionals-${sectionConfiguration.id}-title`;
    section.classList.add(
      "professional-resources-section",
      `professional-resources-section--${sectionConfiguration.id}`
    );
    section.setAttribute("aria-labelledby", headingId);

    const heading = document.createElement("h3");
    heading.id = headingId;
    heading.textContent = sectionConfiguration.title;
    section.appendChild(heading);

    if (sectionConfiguration.id === "secondary") {
      const resourcesGrid = document.createElement("div");
      resourcesGrid.classList.add("resources-grid");

      sectionConfiguration.resources.forEach(function (resource) {
        resourcesGrid.appendChild(createResourceCard(resource, "secondary"));
      });

      section.appendChild(resourcesGrid);
    } else {
      const resourceSlot = document.createElement("div");
      resourceSlot.classList.add("professional-resource-slot");
      resourceSlot.appendChild(
        createResourceCard(sectionConfiguration.resources[0], sectionConfiguration.id)
      );
      section.appendChild(resourceSlot);
    }

    return section;
  }

  function renderResourceSections(classifiedResources) {
    const sectionConfigurations = [
      { id: "featured", title: "Destacado", resources: classifiedResources.featured },
      {
        id: "secondary",
        title: "Recursos secundarios",
        resources: classifiedResources.secondary,
      },
      {
        id: "case-study",
        title: "Caso práctico",
        resources: classifiedResources.caseStudy,
      },
      { id: "tool", title: "Herramienta", resources: classifiedResources.tool },
    ];
    const resourcesLayout = document.createElement("div");
    resourcesLayout.classList.add("professional-resources-layout");

    sectionConfigurations.forEach(function (sectionConfiguration) {
      if (sectionConfiguration.resources.length > 0) {
        resourcesLayout.appendChild(createResourceSection(sectionConfiguration));
      }
    });

    return resourcesLayout;
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

      const classifiedResources = classifyResources(resources);
      const resourcesLayout = renderResourceSections(classifiedResources);

      if (!resourcesLayout.hasChildNodes()) {
        showMessage("Por el momento no hay recursos disponibles.", "empty");
        return;
      }

      const loadedStatus = document.createElement("p");
      loadedStatus.classList.add("resource-list-status");
      loadedStatus.setAttribute("role", "status");
      loadedStatus.textContent = "Los recursos se cargaron correctamente.";

      resourcesContainer.setAttribute("aria-busy", "false");
      resourcesContainer.replaceChildren(loadedStatus, resourcesLayout);
    })
    .catch(function (error) {
      showMessage("No fue posible cargar los recursos en este momento.", "error");
      console.error(error);
    });
});
