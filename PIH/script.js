(() => {
  const playbackRates = [1, 2, 3, 4, 6];
  let playbackRateIndex = 0;

  function getPlaybackRate() {
    return playbackRates[playbackRateIndex];
  }

  function updatePlaybackRate() {
    const rate = getPlaybackRate();
    document.querySelectorAll(".relighting-tile video, .gallery-slide-video").forEach((video) => {
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
    });
    document.querySelectorAll("[data-playback-speed]").forEach((button) => {
      button.textContent = `Playback: ${rate}×`;
      button.setAttribute("aria-label", `Change playback speed (current ${rate}×)`);
    });
  }

  function cyclePlaybackRate() {
    playbackRateIndex = (playbackRateIndex + 1) % playbackRates.length;
    updatePlaybackRate();
  }

  const teaserVideo = document.querySelector(".teaser-video");
  if (teaserVideo) {
    teaserVideo.play().catch(() => {});
  }

  const relightingScenes = ["192", "022", "034", "112", "261"];
  const lightingPanels = [
    { id: "original", label: "Original rendering" },
    { id: "left", label: "Left", image: "./assets/images/left_chromeball.png" },
    { id: "right", label: "Right", image: "./assets/images/right_chromeball.png" },
    { id: "highlight", label: "Highlight", image: "./assets/images/highlight_chromeball.png" },
    { id: "pink", label: "Pink", image: "./assets/images/pink_chromeball.png" },
    { id: "night", label: "Night", image: "./assets/images/night_chromeball.png" }
  ];

  const relightingGrid = document.querySelector("#relighting-grid");
  const relightingDots = document.querySelector("#relighting-dots");
  let sceneIndex = 0;

  function makeRelightingTile(scene, sceneNumber, panel, index) {
    const tile = document.createElement("article");
    tile.className = "relighting-tile";
    tile.setAttribute("aria-label", `${panel.label}, scene ${sceneNumber}`);

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.defaultPlaybackRate = getPlaybackRate();
    video.playbackRate = getPlaybackRate();
    video.preload = index < 3 ? "auto" : "metadata";
    video.src = `./assets/videos/web/relighting/grid/scene_${scene}_${panel.id}.mp4`;
    video.setAttribute("aria-label", `${panel.label}, scene ${sceneNumber}`);
    video.addEventListener("loadedmetadata", () => {
      video.play().catch(() => {});
    }, { once: true });

    const overlay = document.createElement("div");
    overlay.className = "relighting-tile-overlay";

    const label = document.createElement("span");
    label.className = "relighting-tile-label";
    label.textContent = panel.label;
    overlay.append(label);

    if (panel.image) {
      const image = document.createElement("img");
      image.className = "relighting-tile-chromeball";
      image.src = panel.image;
      image.alt = `${panel.label} lighting Chromeball`;
      overlay.append(image);
    }

    tile.append(video, overlay);
    return tile;
  }

  function renderRelightingDots() {
    relightingDots.replaceChildren();
    relightingScenes.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "relighting-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Scene ${index + 1}`);
      dot.setAttribute("aria-selected", String(index === sceneIndex));
      dot.addEventListener("click", () => setScene(index));
      relightingDots.append(dot);
    });
  }

  function renderRelightingGrid(direction = 0) {
    const scene = relightingScenes[sceneIndex];
    relightingGrid.replaceChildren();

    lightingPanels.forEach((panel, index) => {
      relightingGrid.append(makeRelightingTile(scene, sceneIndex + 1, panel, index));
    });

    relightingGrid.classList.remove("is-slide-next", "is-slide-prev");
    if (direction) {
      void relightingGrid.offsetWidth;
      relightingGrid.classList.add(direction > 0 ? "is-slide-next" : "is-slide-prev");
    }
    renderRelightingDots();
  }

  function setScene(index, direction = index >= sceneIndex ? 1 : -1) {
    sceneIndex = (index + relightingScenes.length) % relightingScenes.length;
    renderRelightingGrid(direction);
  }

  document.querySelector("#relighting-prev").addEventListener("click", () => setScene(sceneIndex - 1, -1));
  document.querySelector("#relighting-next").addEventListener("click", () => setScene(sceneIndex + 1, 1));
  renderRelightingGrid();

  const gallerySources = {
    waymo: [
      "./assets/videos/web/waymo/090.mp4",
      "./assets/videos/web/waymo/137.mp4",
      "./assets/videos/web/waymo/153.mp4",
      "./assets/videos/web/waymo/178.mp4",
      "./assets/videos/web/waymo/210.mp4",
      "./assets/videos/web/waymo/249.mp4"
    ],
    nuplan: [
      "./assets/videos/web/nuplan/2021.05.12.23.36.44_veh-35_00152_00504.mp4",
      "./assets/videos/web/nuplan/2021.05.12.23.36.44_veh-35_01133_01535.mp4"
    ],
    pandaset: [
      "./assets/videos/web/pandaset/004.mp4",
      "./assets/videos/web/pandaset/006.mp4",
      "./assets/videos/web/pandaset/012.mp4",
      "./assets/videos/web/pandaset/013.mp4",
      "./assets/videos/web/pandaset/014.mp4",
      "./assets/videos/web/pandaset/024.mp4",
      "./assets/videos/web/pandaset/027.mp4",
      "./assets/videos/web/pandaset/043.mp4"
    ]
  };

  const galleryIndex = { waymo: 0, nuplan: 0, pandaset: 0 };
  const galleryTabs = [...document.querySelectorAll(".dataset-tabs [data-dataset]")];
  const galleryPanes = [...document.querySelectorAll(".gallery-pane")];

  function renderGalleryDots(dataset) {
    const dots = document.querySelector(`[data-gallery-dots="${dataset}"]`);
    dots.replaceChildren();
    gallerySources[dataset].forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `${dataset} video ${index + 1}`);
      dot.setAttribute("aria-selected", String(index === galleryIndex[dataset]));
      dot.addEventListener("click", () => setGallerySlide(dataset, index));
      dots.append(dot);
    });
  }

  function setGallerySlide(dataset, index, direction = 0) {
    const sources = gallerySources[dataset];
    const previousIndex = galleryIndex[dataset];
    galleryIndex[dataset] = (index + sources.length) % sources.length;
    const pane = document.querySelector(`[data-pane="${dataset}"]`);
    const stage = pane.querySelector(".gallery-stage");
    const video = pane.querySelector("[data-gallery-video]");
    if (!direction && galleryIndex[dataset] !== previousIndex) {
      direction = galleryIndex[dataset] > previousIndex ? 1 : -1;
    }
    stage.classList.remove("is-slide-next", "is-slide-prev");
    if (direction) {
      void stage.offsetWidth;
    }
    video.pause();
    video.src = sources[galleryIndex[dataset]];
    video.defaultPlaybackRate = getPlaybackRate();
    video.playbackRate = getPlaybackRate();
    video.load();
    video.play().catch(() => {});
    video.setAttribute("aria-label", `${dataset} gallery video ${galleryIndex[dataset] + 1}`);
    if (direction) {
      stage.classList.add(direction > 0 ? "is-slide-next" : "is-slide-prev");
    }
    renderGalleryDots(dataset);
  }

  function clearGalleryPane(pane) {
    const video = pane.querySelector("[data-gallery-video]");
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  function syncGallery(dataset) {
    galleryTabs.forEach((tab) => {
      const selected = tab.dataset.dataset === dataset;
      tab.setAttribute("aria-selected", String(selected));
      tab.classList.toggle("is-dark", selected);
      tab.classList.toggle("is-light", !selected);
    });

    galleryPanes.forEach((pane) => {
      const active = pane.dataset.pane === dataset;
      pane.hidden = !active;
      if (active) {
        setGallerySlide(dataset, galleryIndex[dataset]);
      } else {
        clearGalleryPane(pane);
      }
    });
  }

  galleryTabs.forEach((tab) => {
    tab.addEventListener("click", () => syncGallery(tab.dataset.dataset));
  });

  Object.keys(gallerySources).forEach((dataset) => {
    document.querySelector(`[data-gallery-prev="${dataset}"]`).addEventListener("click", () => {
      setGallerySlide(dataset, galleryIndex[dataset] - 1, -1);
    });
    document.querySelector(`[data-gallery-next="${dataset}"]`).addEventListener("click", () => {
      setGallerySlide(dataset, galleryIndex[dataset] + 1, 1);
    });
  });

  document.querySelectorAll("[data-playback-speed]").forEach((button) => {
    button.addEventListener("click", cyclePlaybackRate);
  });

  syncGallery("waymo");
  updatePlaybackRate();
})();
