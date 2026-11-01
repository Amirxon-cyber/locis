(() => {
    "use strict";

    const storageKeys = {
        user: "transline-demo-user",
        accounts: "transline-demo-accounts",
        trucks: "transline-demo-trucks",
        drivers: "transline-demo-drivers",
        clients: "transline-demo-clients",
        company: "transline-demo-company",
        activity: "transline-demo-activity",
        theme: "transline-demo-theme",
        routeSubscriptions: "transline-demo-route-subscriptions"
    };
    const starterTrucks = [
        { id: "RF-204", plate: "А781МР 799", driver: "Сергей Козлов", from: "Москва", to: "Казань", location: "Трасса М-7, 42 км", status: "moving", eta: "14:30", progress: 68, x: 54, y: 48 },
        { id: "RF-118", plate: "В320ОР 77", driver: "Андрей Морозов", from: "Москва", to: "Тверь", location: "Химки, Московская обл.", status: "moving", eta: "11:45", progress: 35, x: 25, y: 43 },
        { id: "RF-073", plate: "Е902КТ 50", driver: "Иван Петров", from: "Нижний Новгород", to: "Казань", location: "Трасса М-7, пробка", status: "delayed", eta: "16:10", progress: 47, x: 68, y: 59 },
        { id: "RF-091", plate: "К115АА 77", driver: "Дмитрий Волков", from: "Москва", to: "Самара", location: "Рязань, пункт отдыха", status: "stopped", eta: "Завтра, 09:00", progress: 52, x: 72, y: 76 },
        { id: "RF-312", plate: "М544ХС 799", driver: "Олег Смирнов", from: "Тверь", to: "Москва", location: "Солнечногорск, М-10", status: "moving", eta: "12:20", progress: 81, x: 32, y: 31 },
        { id: "RF-156", plate: "Р661УН 77", driver: "Максим Орлов", from: "Москва", to: "Нижний Новгород", location: "Владимирская обл., М-7", status: "moving", eta: "15:05", progress: 39, x: 47, y: 62 }
    ];
    const statusLabels = { moving: "В пути", delayed: "Задержка", stopped: "Стоянка", delivered: "Доставлен", cancelled: "Отменён" };
    const starterDrivers = [
        { id: "DR-101", name: "Сергей Козлов", phone: "+7 916 234-18-07", license: "Водитель категории Е", status: "На маршруте" },
        { id: "DR-102", name: "Андрей Морозов", phone: "+7 903 512-40-26", license: "Водитель категории Е", status: "На маршруте" },
        { id: "DR-103", name: "Иван Петров", phone: "+7 925 888-31-54", license: "Водитель категории Е", status: "На маршруте" },
        { id: "DR-104", name: "Дмитрий Волков", phone: "+7 916 771-02-13", license: "Водитель категории СЕ", status: "Отдых" },
        { id: "DR-105", name: "Олег Смирнов", phone: "+7 905 432-50-19", license: "Водитель категории Е", status: "На маршруте" },
        { id: "DR-106", name: "Максим Орлов", phone: "+7 999 180-71-62", license: "Водитель категории СЕ", status: "На маршруте" },
        { id: "DR-107", name: "Анна Белова", phone: "+7 926 314-88-20", license: "Логист", status: "На базе" }
    ];
    const starterClients = [
        { id: "CL-201", name: "Вектор Маркет", contact: "Мария Соколова", email: "logistics@vector.example", phone: "+7 495 120-44-31", city: "Москва", orders: 28 },
        { id: "CL-202", name: "Северный склад", contact: "Илья Фомин", email: "supply@north.example", phone: "+7 812 302-14-08", city: "Санкт-Петербург", orders: 16 },
        { id: "CL-203", name: "ВолгаТорг", contact: "Елена Крылова", email: "delivery@volga.example", phone: "+7 843 221-09-50", city: "Казань", orders: 12 },
        { id: "CL-204", name: "Городские продукты", contact: "Павел Романов", email: "cargo@city.example", phone: "+7 491 220-61-92", city: "Рязань", orders: 9 }
    ];
    const truckPhotos = ["assets/trucks/truck-highway.jpg", "assets/trucks/truck-freight.jpg"];
    const cityCoordinates = {
        "москва": [55.7558, 37.6173],
        "тверь": [56.8587, 35.9176],
        "казань": [55.7961, 49.1064],
        "нижний новгород": [56.2965, 43.9361],
        "самара": [53.1959, 50.1002],
        "смоленск": [54.7826, 32.0453],
        "рязань": [54.6292, 39.7364],
        "санкт-петербург": [59.9311, 30.3609],
        "ярославль": [57.6261, 39.8845],
        "владимир": [56.129, 40.407],
        "воронеж": [51.6608, 39.2003],
        "екатеринбург": [56.8389, 60.6057]
    };
    const truckMarkerSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>';

    const byId = (id) => document.getElementById(id);
    const fleetList = byId("fleetList");
    const mapMarkers = byId("mapMarkers");
    const routesTableBody = byId("routesTableBody");
    const toast = byId("toast");
    let fleetMap = null;
    let leafletMarkers = new Map();
    let leafletRoutes = new Map();
    let trucks = loadTrucks();
    let drivers = loadCollection(storageKeys.drivers, starterDrivers, (item) => item && ["id", "name", "phone", "license", "status"].every((key) => typeof item[key] === "string"));
    let clients = loadCollection(storageKeys.clients, starterClients, (item) => item && ["id", "name", "contact", "email", "phone", "city"].every((key) => typeof item[key] === "string") && Number.isFinite(item.orders));
    let activities = loadCollection(storageKeys.activity, [
        { id: "EV-1", title: "Доставка завершена", description: "RF-204 доставил груз в Казань · Сергей Козлов", kind: "delivered", createdAt: Date.now() - 12 * 60_000 },
        { id: "EV-2", title: "Новый рейс", description: "RF-118 выехал из Москвы · Андрей Морозов", kind: "departed", createdAt: Date.now() - 34 * 60_000 },
        { id: "EV-3", title: "Задержка в пути", description: "RF-073 задерживается на трассе М-7 · Иван Петров", kind: "warning", createdAt: Date.now() - 48 * 60_000 }
    ], (item) => item && ["id", "title", "description", "kind"].every((key) => typeof item[key] === "string") && Number.isFinite(item.createdAt));
    let routeSubscriptions = loadCollection(storageKeys.routeSubscriptions, [],
        (item) => item && ["id", "query"].every((key) => typeof item[key] === "string") && Number.isFinite(item.createdAt));
    let activeFilter = "all";
    let selectedTruckId = trucks[0]?.id ?? null;
    let searchQuery = "";
    let toastTimer;
    let lastFocusedElement = null;
    let currentPage = "overview";
    let currentRecordType = "";
    let editingRecordId = null;
    let activeTripFilter = "active";
    let tripDateFrom = "";
    let tripDateTo = "";
    let currentTheme = loadThemePreference();
    document.documentElement.dataset.theme = currentTheme;

    function loadThemePreference() {
        try {
            return localStorage.getItem(storageKeys.theme) === "dark" ? "dark" : "light";
        } catch (error) {
            console.error("Не удалось загрузить настройку темы.", error);
            return "light";
        }
    }

    function setTheme(theme, notify = true) {
        currentTheme = theme === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = currentTheme;
        const isDark = currentTheme === "dark";
        const toggle = byId("themeToggle");
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
        toggle.title = isDark ? "Светлая тема" : "Тёмная тема";
        toggle.innerHTML = isDark
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z"/></svg>';
        const settingsToggle = byId("settingsThemeToggle");
        if (settingsToggle) {
            settingsToggle.textContent = isDark ? "Переключить на светлую" : "Переключить на тёмную";
            settingsToggle.setAttribute("aria-pressed", String(isDark));
        }
        try {
            localStorage.setItem(storageKeys.theme, currentTheme);
        } catch (error) {
            console.error("Не удалось сохранить настройку темы.", error);
            if (notify) showToast("Тема сменена, но не сохранена. Проверьте настройки хранения браузера.", true);
            return;
        }
        if (notify) showToast(isDark ? "Включена тёмная тема." : "Включена светлая тема.");
    }

    function loadCollection(key, defaults, validate) {
        try {
            const saved = localStorage.getItem(key);
            if (!saved) return defaults.map((item) => ({ ...item }));
            const records = JSON.parse(saved);
            if (!Array.isArray(records) || !records.every(validate)) throw new Error(`В хранилище ${key} обнаружены неверные данные.`);
            const isLegacyCustomOnly = records.length > 0 && records.every((record) => !defaults.some((item) => item.id === record.id));
            return isLegacyCustomOnly ? [...records, ...defaults.map((item) => ({ ...item }))] : records;
        } catch (error) {
            console.error("Не удалось загрузить сохранённые записи.", error);
            return defaults.map((item) => ({ ...item }));
        }
    }

    function applyTripFilters() {
        byId("workspacePage").querySelectorAll("[data-trip-filter]").forEach((button) => {
            button.classList.toggle("active", button.dataset.tripFilter === activeTripFilter);
        });
        const query = byId("pageSearch")?.value.trim().toLocaleLowerCase("ru") || "";
        byId("tripsTableBody")?.querySelectorAll("tr[data-status]").forEach((row) => {
            const status = row.dataset.status;
            const date = row.dataset.date;
            const statusMatches = activeTripFilter === "all"
                || (activeTripFilter === "active" && ["moving", "delayed"].includes(status))
                || (activeTripFilter === "delayed" && status === "delayed")
                || (activeTripFilter === "delivered" && status === "delivered")
                || (activeTripFilter === "cancelled" && status === "cancelled");
            const dateMatches = (!tripDateFrom || date >= tripDateFrom) && (!tripDateTo || date <= tripDateTo);
            const searchMatches = !query || row.textContent.toLocaleLowerCase("ru").includes(query);
            row.hidden = !(statusMatches && dateMatches && searchMatches);
        });
        const hasVisibleTrips = [...(byId("tripsTableBody")?.querySelectorAll("tr[data-status]") || [])].some((row) => !row.hidden);
        const noResults = byId("tripNoResults");
        if (noResults) noResults.hidden = hasVisibleTrips || trucks.length === 0;
    }

    function saveCollection(key, records, defaults) {
        try {
            localStorage.setItem(key, JSON.stringify(records));
        } catch (error) {
            console.error(`Не удалось сохранить данные (${key}).`, error);
            showToast("Не удалось сохранить изменения. Проверьте свободное место в браузере.", true);
        }
    }

    function loadTrucks() {
        try {
            const saved = localStorage.getItem(storageKeys.trucks);
            if (!saved) return normalizeTrucks(starterTrucks);
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed) || !parsed.every(isValidTruck)) {
                throw new Error("Сохранённые демо-рейсы имеют неверный формат.");
            }
            const isLegacyCustomOnly = parsed.length > 0 && parsed.every((truck) => !starterTrucks.some((starter) => starter.id === truck.id));
            const records = isLegacyCustomOnly ? [...parsed, ...starterTrucks.map((truck) => ({ ...truck }))] : parsed;
            return normalizeTrucks(records);
        } catch (error) {
            console.error("Не удалось загрузить сохранённые рейсы.", error);
            return normalizeTrucks(starterTrucks);
        }
    }

    function normalizeTrucks(records) {
        const fallbackCreatedAt = Date.now();
        return records.map((truck) => ({
            ...truck,
            createdAt: Number.isFinite(truck.createdAt) ? truck.createdAt : fallbackCreatedAt
        }));
    }

    function isValidTruck(item) {
        return item && typeof item === "object"
            && ["id", "plate", "driver", "from", "to", "location", "status", "eta"].every((key) => typeof item[key] === "string")
            && ["moving", "delayed", "stopped", "delivered", "cancelled"].includes(item.status)
            && Number.isFinite(item.progress) && Number.isFinite(item.x) && Number.isFinite(item.y)
            && (item.gps === undefined || (item.gps && Number.isFinite(item.gps.latitude) && Number.isFinite(item.gps.longitude)
                && (item.gps.accuracy === undefined || Number.isFinite(item.gps.accuracy))
                && (item.gps.source === undefined || ["device", "manual"].includes(item.gps.source))
                && Number.isFinite(item.gps.updatedAt)));
    }

    function saveTrucks() {
        try {
            localStorage.setItem(storageKeys.trucks, JSON.stringify(trucks));
        } catch (error) {
            console.error("Не удалось сохранить демо-рейс.", error);
            showToast("Не удалось сохранить рейс в браузере. Он останется в списке до перезагрузки.", true);
        }
    }

    function saveRouteSubscriptions(nextSubscriptions = routeSubscriptions) {
        try {
            localStorage.setItem(storageKeys.routeSubscriptions, JSON.stringify(nextSubscriptions));
            routeSubscriptions = nextSubscriptions;
            return true;
        } catch (error) {
            console.error("Не удалось сохранить подписки на маршруты.", error);
            showToast("Не удалось сохранить подписку в браузере.", true);
            return false;
        }
    }

    function normalizeSearchText(value) {
        return value.toLocaleLowerCase("ru").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
    }

    function isRecentListing(record) {
        return Number.isFinite(record.createdAt) && record.createdAt >= Date.now() - 365 * 24 * 60 * 60 * 1000;
    }

    function findMatchingTrucks(query) {
        const terms = normalizeSearchText(query).split(" ").filter(Boolean);
        if (!terms.length) return [];
        return trucks.filter((truck) => ["moving", "delayed", "stopped"].includes(truck.status)
            && isRecentListing(truck)
            && terms.every((term) => normalizeSearchText([
                truck.from, truck.to, truck.cargo || "", truck.client || "", truck.driver, truck.plate, truck.id
            ].join(" ")).includes(term)));
    }

    function renderSmartSearchResults(query) {
        const results = byId("smartSearchResults");
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) {
            results.hidden = true;
            results.replaceChildren();
            return;
        }
        const matchingTrucks = findMatchingTrucks(query);
        const matchingClients = clients.filter((client) =>
            normalizeSearchText([client.name, client.city, client.contact].join(" ")).includes(normalizedQuery));
        const cards = matchingTrucks.map((truck) => {
            const client = clients.find((item) => item.name === truck.client);
            const companyStatus = client?.verified === true
                ? '<span class="verification-badge verified">✓ Проверена</span>'
                : '<span class="verification-badge">Проверка не проводилась</span>';
            const lastUpdated = Number.isFinite(client?.updatedAt)
                ? `Контакты обновлены ${new Intl.DateTimeFormat("ru-RU").format(client.updatedAt)}`
                : "Дата обновления контактов не указана";
            return `<article class="search-result-card"><div><span class="search-route">${escapeHTML(truck.from)} <b>→</b> ${escapeHTML(truck.to)}</span><small>${escapeHTML(truck.cargo || "Груз не указан")} · ${escapeHTML(truck.id)}</small></div><div class="search-result-meta"><span class="table-status ${escapeHTML(truck.status)}">${escapeHTML(statusLabels[truck.status])}</span>${client ? `${companyStatus}<small>${escapeHTML(lastUpdated)}</small>` : '<span class="verification-badge">Компания не указана</span>'}</div><button type="button" class="table-action" data-search-trip="${escapeHTML(truck.id)}">Открыть рейсы →</button></article>`;
        }).join("");
        const companyCards = matchingClients.map((client) => {
            const status = client.verified === true
                ? '<span class="verification-badge verified">✓ Проверена</span>'
                : '<span class="verification-badge">Проверка не проводилась</span>';
            const updated = Number.isFinite(client.updatedAt)
                ? new Intl.DateTimeFormat("ru-RU").format(client.updatedAt)
                : "дата не указана";
            return `<article class="search-result-card"><div><span class="search-route">${escapeHTML(client.name)}</span><small>${escapeHTML(client.city)} · ${escapeHTML(client.contact)}</small></div><div class="search-result-meta">${status}<small>Контакты обновлены: ${updated}</small></div></article>`;
        }).join("");
        const emptyMessage = `<p class="search-empty">Свежих совпадений не найдено. Проверьте запрос или добавьте рейс. Записи старше года не показываются в поиске.</p>`;
        results.innerHTML = `<div class="search-results-heading"><strong>Результаты поиска</strong><span>${matchingTrucks.length} рейсов · ${matchingClients.length} компаний</span></div>${cards}${companyCards}${cards || companyCards ? "" : emptyMessage}<p class="search-data-note">Демо-данные. Статус проверки компании подтверждается только после внешней проверки документов; здесь она не подключена.</p>`;
        results.hidden = false;
        results.querySelectorAll("[data-search-trip]").forEach((button) => {
            button.addEventListener("click", () => document.querySelector('.nav-link[data-page="trips"]').click());
        });
    }

    function addRouteSubscription(query) {
        const normalized = normalizeSearchText(query);
        if (normalized.length < 3) {
            showToast("Введите маршрут или ключевые слова для подписки.", true);
            byId("smartSearchQuery").focus();
            return;
        }
        if (routeSubscriptions.some((item) => normalizeSearchText(item.query) === normalized)) {
            showToast("Такая подписка уже сохранена.", true);
            return;
        }
        const nextSubscriptions = [{ id: `SUB-${Date.now()}`, query: query.trim(), createdAt: Date.now() }, ...routeSubscriptions];
        if (saveRouteSubscriptions(nextSubscriptions)) {
            showToast("Маршрут сохранён. Сейчас подписка работает только в этом браузере; Telegram пока не подключён.");
            if (currentPage === "market") renderWorkspacePage("market");
        }
    }

    function truckIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        const shapes = [
            ["path", { d: "M3 7h11v10H3zM14 10h4l3 3v4h-7" }],
            ["circle", { cx: "7.5", cy: "18", r: "2" }],
            ["circle", { cx: "17.5", cy: "18", r: "2" }]
        ];
        shapes.forEach(([tag, attributes]) => {
            const shape = document.createElementNS("http://www.w3.org/2000/svg", tag);
            Object.entries(attributes).forEach(([name, value]) => shape.setAttribute(name, value));
            svg.append(shape);
        });
        return svg;
    }

    function visibleTrucks() {
        const normalizedQuery = searchQuery.toLocaleLowerCase("ru");
        return trucks.filter((truck) => {
            const matchesStatus = activeFilter === "all" || truck.status === activeFilter;
            const searchable = `${truck.id} ${truck.plate} ${truck.driver} ${truck.location} ${truck.from} ${truck.to}`.toLocaleLowerCase("ru");
            return matchesStatus && searchable.includes(normalizedQuery);
        });
    }

    function renderFleet() {
        const visible = visibleTrucks();
        fleetList.replaceChildren();

        if (visible.length === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "empty-state";
            emptyState.textContent = "Машины не найдены. Попробуйте изменить запрос или фильтр.";
            fleetList.append(emptyState);
        }

        visible.forEach((truck) => {
            const row = document.createElement("button");
            row.type = "button";
            row.className = `truck-row${truck.id === selectedTruckId ? " selected" : ""}`;
            row.dataset.truckId = truck.id;
            const icon = document.createElement("span");
            icon.className = `truck-avatar ${truck.status}`;
            const photo = document.createElement("img");
            photo.src = truckPhoto(truck);
            photo.alt = `Фура ${truck.plate}`;
            photo.loading = "lazy";
            icon.append(photo);

            const copy = document.createElement("span");
            copy.className = "truck-copy";
            const titleLine = document.createElement("span");
            titleLine.className = "truck-title-line";
            const id = document.createElement("strong");
            id.textContent = truck.id;
            const status = document.createElement("span");
            status.className = `truck-status ${truck.status}`;
            status.textContent = statusLabels[truck.status];
            titleLine.append(id, status);
            const driver = document.createElement("span");
            driver.className = "truck-subtitle";
            driver.textContent = `${truck.plate} · ${truck.driver}`;
            const route = document.createElement("span");
            route.className = "truck-route";
            route.textContent = `${truck.from} → ${truck.to} · ${truck.location}`;
            copy.append(titleLine, driver, route);
            row.append(icon, copy);
            row.addEventListener("click", () => selectTruck(truck.id));
            fleetList.append(row);
        });

        renderMarkers();
        renderSelected();
        updateFilterCounts();
    }

    function renderMarkers() {
        mapMarkers.replaceChildren();
        if (fleetMap) {
            const currentIds = new Set();
            trucks.forEach((truck) => {
                const coordinates = getTruckCoordinates(truck);
                const position = [coordinates.latitude, coordinates.longitude];
                const routePoints = [getCityCoordinates(truck.from), getCityCoordinates(truck.to)];
                const routeColor = truck.status === "delayed" ? "#d69a47" : truck.status === "cancelled" ? "#c76b65" : "#5273ed";
                let route = leafletRoutes.get(truck.id);
                if (!route) {
                    route = window.L.polyline(routePoints, {
                        color: routeColor,
                        weight: 3,
                        opacity: 0.48,
                        dashArray: "6 7",
                        lineCap: "round"
                    }).addTo(fleetMap);
                    leafletRoutes.set(truck.id, route);
                } else {
                    route.setLatLngs(routePoints);
                    route.setStyle({ color: routeColor });
                }
                let marker = leafletMarkers.get(truck.id);
                if (!marker) {
                    marker = window.L.marker(position, {
                        icon: window.L.divIcon({
                            className: "",
                            html: `<span class="truck-map-marker ${escapeHTML(truck.status)}${truck.id === selectedTruckId ? " selected" : ""}">${truckMarkerSvg}</span>`,
                            iconSize: [38, 38],
                            iconAnchor: [19, 19]
                        })
                    }).addTo(fleetMap);
                    marker.on("click", () => selectTruck(truck.id));
                    leafletMarkers.set(truck.id, marker);
                } else {
                    marker.setLatLng(position);
                    marker.setIcon(window.L.divIcon({
                        className: "",
                        html: `<span class="truck-map-marker ${escapeHTML(truck.status)}${truck.id === selectedTruckId ? " selected" : ""}">${truckMarkerSvg}</span>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 19]
                    }));
                }
                const positionLabel = coordinates.isGps ? "GPS устройства" : "примерная позиция";
                marker.bindPopup(`<div class="map-popup"><strong>${escapeHTML(truck.id)} · ${escapeHTML(truck.plate)}</strong><span>${escapeHTML(truck.from)} → ${escapeHTML(truck.to)}</span><span>${escapeHTML(truck.driver)} · ${escapeHTML(statusLabels[truck.status])}</span><small>${positionLabel}: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}</small></div>`);
                currentIds.add(truck.id);
            });
            leafletMarkers.forEach((marker, id) => {
                if (!currentIds.has(id)) {
                    fleetMap.removeLayer(marker);
                    leafletMarkers.delete(id);
                }
            });
            leafletRoutes.forEach((route, id) => {
                if (!currentIds.has(id)) {
                    fleetMap.removeLayer(route);
                    leafletRoutes.delete(id);
                }
            });
            return;
        }
        trucks.forEach((truck) => {
            const marker = document.createElement("button");
            marker.type = "button";
            marker.className = `truck-marker ${truck.status}${truck.id === selectedTruckId ? " selected" : ""}`;
            marker.style.left = `${truck.x}%`;
            marker.style.top = `${truck.y}%`;
            marker.setAttribute("aria-label", `${truck.id}, ${statusLabels[truck.status]}, ${truck.location}`);
            marker.title = `${truck.id} · ${truck.location}`;
            marker.append(truckIcon());
            marker.addEventListener("click", () => selectTruck(truck.id));
            mapMarkers.append(marker);
        });
    }

    function renderSelected() {
        const truck = trucks.find((item) => item.id === selectedTruckId);
        byId("selectedTruck").textContent = truck ? `${truck.id} · ${truck.location}` : "Выберите машину в списке";
        document.querySelectorAll(".truck-row").forEach((row) => {
            row.classList.toggle("selected", row.dataset.truckId === selectedTruckId);
        });
    }

    function selectTruck(id) {
        selectedTruckId = id;
        renderFleet();
        const truck = trucks.find((item) => item.id === id);
        if (fleetMap && truck) {
            const coordinates = getTruckCoordinates(truck);
            fleetMap.setView([coordinates.latitude, coordinates.longitude], Math.max(fleetMap.getZoom(), coordinates.isGps ? 10 : 6));
            const marker = leafletMarkers.get(id);
            if (marker) marker.openPopup();
        }
    }

    function renderRoutes() {
        routesTableBody.replaceChildren();
        const activeRoutes = trucks.filter((truck) => !["stopped", "delivered", "cancelled"].includes(truck.status)
            && isRecentListing(truck)).slice(0, 4);
        if (activeRoutes.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = '<td colspan="4" class="table-empty"><span>Активных рейсов пока нет.</span><button class="empty-create-button" type="button">Создать первый рейс</button></td>';
            row.querySelector("button").addEventListener("click", openTripModal);
            routesTableBody.append(row);
        }
        activeRoutes.forEach((truck) => {
            const row = document.createElement("tr");
            const vehicleCell = document.createElement("td");
            const vehicle = document.createElement("div");
            vehicle.className = "route-vehicle";
            const icon = document.createElement("span");
            icon.className = `route-vehicle-icon${truck.status === "delayed" ? " delayed" : ""}`;
            icon.append(truckIcon());
            const details = document.createElement("span");
            const identity = document.createElement("strong");
            identity.textContent = `${truck.id} · ${truck.plate}`;
            const driver = document.createElement("small");
            driver.textContent = truck.driver;
            details.append(identity, driver);
            vehicle.append(icon, details);
            vehicleCell.append(vehicle);

            const destinationCell = document.createElement("td");
            const destination = document.createElement("span");
            destination.className = "route-destination";
            const cities = document.createElement("strong");
            cities.textContent = `${truck.from} → ${truck.to}`;
            const current = document.createElement("small");
            current.textContent = truck.location;
            destination.append(cities, current);
            destinationCell.append(destination);

            const etaCell = document.createElement("td");
            const eta = document.createElement("span");
            eta.className = "route-destination";
            const etaLabel = document.createElement("strong");
            etaLabel.textContent = truck.eta;
            const etaCaption = document.createElement("small");
            etaCaption.textContent = "Ожидаемое прибытие";
            eta.append(etaLabel, etaCaption);
            etaCell.append(eta);

            const progressCell = document.createElement("td");
            const progress = document.createElement("span");
            progress.className = "route-progress";
            const track = document.createElement("span");
            track.className = "progress-track";
            const fill = document.createElement("i");
            fill.style.width = `${Math.max(0, Math.min(100, truck.progress))}%`;
            track.append(fill);
            const percent = document.createElement("small");
            percent.textContent = `${truck.progress}%`;
            progress.append(track, percent);
            progressCell.append(progress);
            row.append(vehicleCell, destinationCell, etaCell, progressCell);
            routesTableBody.append(row);
        });
        byId("navRouteCount").textContent = trucks.filter((truck) => !["stopped", "delivered", "cancelled"].includes(truck.status)).length;
    }

    function updateFilterCounts() {
        byId("allFilterCount").textContent = trucks.length;
        document.querySelectorAll(".filter-chip").forEach((button) => {
            button.classList.toggle("active", button.dataset.filter === activeFilter);
            const status = button.dataset.filter;
            const count = status === "all" ? trucks.length : trucks.filter((truck) => truck.status === status).length;
            const existingCount = button.querySelector(".filter-count");
            if (status !== "all" && existingCount) existingCount.remove();
            if (status !== "all" && count > 0) {
                const badge = document.createElement("span");
                badge.className = "filter-count";
                badge.textContent = count;
                button.append(badge);
            }
        });
    }

    function updateMetrics() {
        const moving = trucks.filter((truck) => truck.status === "moving").length;
        const delayed = trucks.filter((truck) => truck.status === "delayed").length;
        byId("totalTrucks").textContent = trucks.length;
        byId("movingTrucks").textContent = moving;
        byId("delayedTrucks").textContent = delayed;
        byId("fleetCount").textContent = trucks.length;
        byId("navFleetCount").textContent = trucks.length;
        byId("movingTrack").style.width = `${trucks.length ? Math.round(moving / trucks.length * 100) : 0}%`;
        byId("delayedTrack").style.width = `${trucks.length ? Math.round(delayed / trucks.length * 100) : 0}%`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function currency(value) {
        return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
    }

    function formatDateInput(timestamp) {
        const date = new Date(timestamp);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }

    function truckPhoto(truck) {
        const number = Number(truck.id.match(/\d+/)?.[0]) || 0;
        return truckPhotos[number % truckPhotos.length];
    }

    function getTruckCoordinates(truck) {
        if (truck.gps && Number.isFinite(truck.gps.latitude) && Number.isFinite(truck.gps.longitude)) {
            return { latitude: truck.gps.latitude, longitude: truck.gps.longitude, isGps: true };
        }
        const from = getCityCoordinates(truck.from);
        const to = getCityCoordinates(truck.to, from);
        const progress = Math.max(0, Math.min(100, Number(truck.progress) || 0)) / 100;
        return {
            latitude: from[0] + (to[0] - from[0]) * progress,
            longitude: from[1] + (to[1] - from[1]) * progress,
            isGps: false
        };
    }

    function getCityCoordinates(city, fallback = cityCoordinates["москва"]) {
        return cityCoordinates[String(city || "").trim().toLocaleLowerCase("ru")] || fallback;
    }

    function initializeFleetMap() {
        if (!window.L) {
            byId("mapSourcePill").textContent = "Карта";
            return;
        }
        fleetMap = window.L.map("fleetMap", { scrollWheelZoom: false }).setView([56.3, 42.8], 5);
        window.L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
        }).addTo(fleetMap);
        byId("mapSourcePill").textContent = "OSM";
        byId("mapContainer").classList.add("has-map");
    }

    function relativeTime(timestamp) {
        const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
        if (minutes < 1) return "только что";
        if (minutes < 60) return `${minutes} мин. назад`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ч. назад`;
        return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(timestamp);
    }

    function renderActivityList() {
        const containers = [byId("activityList"), byId("activityModalList")];
        containers.forEach((container) => {
            if (!container) return;
            container.replaceChildren();
            activities.slice(0, container.id === "activityList" ? 3 : 30).forEach((activity) => {
                const item = document.createElement("div");
                item.className = "activity-item";
                const icon = document.createElement("span");
                icon.className = `activity-icon ${activity.kind}`;
                icon.textContent = activity.kind === "delivered" ? "✓" : activity.kind === "warning" ? "!" : activity.kind === "created" ? "+" : "↗";
                const copy = document.createElement("div");
                const title = document.createElement("p");
                const strong = document.createElement("strong");
                strong.textContent = activity.title;
                title.append(strong, document.createTextNode(` · ${activity.description}`));
                const time = document.createElement("time");
                time.textContent = relativeTime(activity.createdAt);
                copy.append(title, time);
                item.append(icon, copy);
                container.append(item);
            });
        });
    }

    function addActivity(title, description, kind = "departed") {
        activities.unshift({
            id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            description,
            kind,
            createdAt: Date.now()
        });
        activities = activities.slice(0, 100);
        saveCollection(storageKeys.activity, activities, []);
        renderActivityList();
    }

    function showTruckDetails(truck) {
        const coordinates = getTruckCoordinates(truck);
        byId("detailsTitle").textContent = `${truck.id} · ${truck.plate}`;
        byId("detailsSubtitle").textContent = `${truck.from} → ${truck.to}`;
        byId("truckDetailsPhoto").innerHTML = `<img src="${truckPhoto(truck)}" alt="Фура ${escapeHTML(truck.plate)}">`;
        const status = ensureGpsStatus();
        status.className = `gps-status${truck.gps ? " is-live" : ""}`;
        if (truck.gps) {
            const source = truck.gps.source === "manual" ? "Координаты введены вручную" : "GPS этого устройства";
            const updated = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(truck.gps.updatedAt);
            status.textContent = `${source} · ${updated}${truck.gps.accuracy ? ` · точность ${Math.round(truck.gps.accuracy)} м` : ""}`;
        } else {
            status.textContent = "Позиция примерная. Добавьте координаты или получите GPS этого устройства.";
        }
        const rows = [
            ["Статус", statusLabels[truck.status]],
            ["Водитель", truck.driver],
            ["Местоположение", truck.location],
            [coordinates.isGps ? truck.gps.source === "manual" ? "Введённые координаты" : "GPS устройства" : "Примерные координаты", `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}${truck.gps?.accuracy ? ` · точность ${Math.round(truck.gps.accuracy)} м` : ""}`],
            ["Ожидаемое прибытие", truck.eta],
            ["Прогресс рейса", `${truck.progress}%`],
            ["Клиент", truck.client || "Не указан"],
            ["Стоимость", truck.amount ? currency(truck.amount) : "Не указана"]
        ];
        const list = byId("truckDetailsList");
        list.replaceChildren();
        rows.forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "detail-row";
            const name = document.createElement("span");
            name.textContent = label;
            const content = document.createElement("strong");
            content.textContent = value;
            row.append(name, content);
            list.append(row);
        });
        byId("editSelectedTruck").onclick = () => {
            closeModal(byId("truckDetailsModal"));
            openRecordModal("truck", truck.id);
        };
        byId("locateSelectedTruck").onclick = () => captureTruckGps(truck.id);
        byId("resetTruckGps").hidden = !truck.gps;
        byId("resetTruckGps").onclick = () => resetTruckGps(truck.id);
        const manualForm = ensureManualGpsForm();
        manualForm.elements.latitude.value = truck.gps?.latitude ?? "";
        manualForm.elements.longitude.value = truck.gps?.longitude ?? "";
        const formError = manualForm.querySelector(".gps-form-error");
        formError.textContent = "";
        formError.hidden = true;
        manualForm.onsubmit = (event) => saveManualGps(event, truck.id);
        openModal("truckDetailsModal");
    }

    function ensureGpsStatus() {
        let status = byId("gpsStatus");
        if (!status) {
            status = document.createElement("p");
            status.id = "gpsStatus";
            status.className = "gps-status";
            status.setAttribute("role", "status");
            byId("detailsSubtitle").after(status);
        }
        return status;
    }

    function ensureManualGpsForm() {
        let form = byId("manualGpsForm");
        if (!form) {
            form = document.createElement("form");
            form.id = "manualGpsForm";
            form.className = "gps-manual-form";
            form.innerHTML = `<label>Широта<input name="latitude" type="number" min="-90" max="90" step="any" placeholder="55.7558" required></label><label>Долгота<input name="longitude" type="number" min="-180" max="180" step="any" placeholder="37.6173" required></label><button class="button button-outline" type="submit">Сохранить координаты</button><p class="gps-form-error" role="alert" hidden></p>`;
            byId("truckDetailsList").after(form);
        }
        return form;
    }

    function setGpsError(message) {
        ensureGpsStatus().textContent = message;
        ensureGpsStatus().classList.remove("is-live");
        showToast(message, true);
    }

    function saveManualGps(event, id) {
        event.preventDefault();
        const form = event.currentTarget;
        const latitude = Number(form.elements.latitude.value);
        const longitude = Number(form.elements.longitude.value);
        const error = form.querySelector(".gps-form-error");
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
            || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            error.textContent = "Введите широту от −90 до 90 и долготу от −180 до 180.";
            error.hidden = false;
            return;
        }
        error.hidden = true;
        const truck = trucks.find((item) => item.id === id);
        if (!truck) {
            setGpsError("Машина больше не найдена. Обновите список и попробуйте снова.");
            return;
        }
        const gps = { latitude, longitude, source: "manual", updatedAt: Date.now() };
        trucks = trucks.map((item) => item.id === id
            ? { ...item, gps, location: `Координаты введены · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }
            : item);
        const updatedTruck = trucks.find((item) => item.id === id);
        saveTrucks();
        renderFleet();
        renderRoutes();
        addActivity("Обновлены координаты машины", `${id} · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, "created");
        byId("lastUpdated").textContent = "только что";
        showTruckDetails(updatedTruck);
        if (fleetMap) fleetMap.setView([latitude, longitude], 12);
        showToast(`Координаты сохранены для ${id}.`);
    }

    async function captureTruckGps(id) {
        const truck = trucks.find((item) => item.id === id);
        if (!truck) {
            setGpsError("Сначала выберите машину в автопарке.");
            return;
        }
        if (!navigator.geolocation) {
            setGpsError("В этом браузере нет GPS. Введите координаты вручную или откройте сайт в актуальном браузере.");
            return;
        }
        const localHost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
        if (!window.isSecureContext && !localHost) {
            setGpsError("Браузер блокирует GPS в незашифрованной версии сайта. Откройте HTTPS-адрес или localhost; координаты можно ввести вручную ниже.");
            return;
        }
        const detailsAreOpen = !byId("truckDetailsModal").hidden;
        const status = ensureGpsStatus();
        status.className = "gps-status is-pending";
        status.textContent = "Запрашиваю GPS устройства… Подтвердите доступ в браузере.";
        showToast("Запрашиваю GPS устройства. Если появится запрос браузера — разрешите доступ.");
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const gps = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                source: "device",
                updatedAt: Date.now()
            };
            trucks = trucks.map((item) => item.id === id
                ? { ...item, gps, location: `GPS устройства · ${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}` }
                : item);
            const updatedTruck = trucks.find((item) => item.id === id);
            saveTrucks();
            renderFleet();
            renderRoutes();
            addActivity("Получены GPS-координаты", `${id} · точность ${Math.round(gps.accuracy)} м`, "created");
            byId("lastUpdated").textContent = "только что";
            if (detailsAreOpen) showTruckDetails(updatedTruck);
            if (fleetMap) fleetMap.setView([gps.latitude, gps.longitude], 12);
            showToast(`GPS устройства сохранён для ${id} · точность около ${Math.round(gps.accuracy)} м.`);
        }, (error) => {
            const messages = {
                1: "Браузер запретил GPS. Нажмите замок рядом с адресом сайта → Настройки сайта → Местоположение → Разрешить, затем повторите запрос.",
                2: "Устройство не смогло определить GPS. Включите геолокацию Windows/телефона и Wi‑Fi или введите координаты вручную.",
                3: "GPS не ответил за 30 секунд. Проверьте сигнал и повторите запрос или введите координаты вручную."
            };
            const message = messages[error.code] || `GPS-ошибка${error.message ? `: ${error.message}` : ""}. Проверьте разрешение браузера или введите координаты вручную.`;
            if (detailsAreOpen) {
                ensureGpsStatus().textContent = message;
                ensureGpsStatus().classList.remove("is-live", "is-pending");
            }
            showToast(message, true);
        }, { enableHighAccuracy: true, timeout: 30_000, maximumAge: 10_000 });
    }

    function resetTruckGps(id) {
        const truck = trucks.find((item) => item.id === id);
        if (!truck?.gps) return;
        trucks = trucks.map((item) => item.id === id
            ? { ...item, gps: undefined, location: `${item.from} → ${item.to} · демо-позиция` }
            : item);
        const updatedTruck = trucks.find((item) => item.id === id);
        saveTrucks();
        renderFleet();
        renderRoutes();
        addActivity("GPS-привязка сброшена", id, "warning");
        showTruckDetails(updatedTruck);
        showToast(`Для ${id} восстановлена примерная демо-позиция.`);
    }

    function makePageHeader(title, description, actionLabel = "", action = "") {
        return `<div class="workspace-heading"><div><p class="workspace-eyebrow">ТРАНСЛАЙН · УПРАВЛЕНИЕ</p><h1>${title}</h1><p>${description}</p></div><div class="workspace-heading-actions"><label class="page-search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></svg><input id="pageSearch" type="search" placeholder="Поиск..." aria-label="Поиск на странице"></label>${actionLabel ? `<button class="button button-primary" data-action="${action}"><span>＋</span>${actionLabel}</button>` : ""}</div></div>`;
    }

    function renderFleetPage() {
        const rows = trucks.map((truck) => `<tr data-status="${escapeHTML(truck.status)}" data-date="${formatDateInput(truck.createdAt)}">
            <td><div class="fleet-table-vehicle"><img src="${truckPhoto(truck)}" alt="Фура ${escapeHTML(truck.plate)}" loading="lazy"><span><strong>${escapeHTML(truck.id)}</strong><small>${escapeHTML(truck.plate)}</small></span></div></td>
            <td>${escapeHTML(truck.driver)}</td><td>${escapeHTML(truck.from)} → ${escapeHTML(truck.to)}</td>
            <td><span class="table-status ${escapeHTML(truck.status)}">${escapeHTML(statusLabels[truck.status])}</span></td>
            <td>${escapeHTML(truck.location)}</td>
            <td><button class="table-action" data-action="edit-truck" data-id="${escapeHTML(truck.id)}">Изменить</button><button class="table-action danger" data-action="delete-truck" data-id="${escapeHTML(truck.id)}">Удалить</button></td>
        </tr>`).join("");
        return `${makePageHeader("Автопарк", "Машины, водители и их текущий статус.", "Добавить машину", "add-truck")}
          <div class="page-stat-row"><article><span>Всего машин</span><strong>${trucks.length}</strong></article><article><span>В пути</span><strong>${trucks.filter((item) => item.status === "moving").length}</strong></article><article><span>Нужна проверка</span><strong>${trucks.filter((item) => item.status === "delayed").length}</strong></article><article><span>На стоянке</span><strong>${trucks.filter((item) => item.status === "stopped").length}</strong></article></div>
          <div class="panel data-panel"><div class="data-panel-head"><div><h2>Все машины</h2><p>Нажмите «Изменить», чтобы обновить данные транспорта</p></div><span class="table-total">${trucks.length} машин</span></div><div class="responsive-table"><table class="data-table"><thead><tr><th>ТРАНСПОРТ</th><th>ВОДИТЕЛЬ</th><th>МАРШРУТ</th><th>СТАТУС</th><th>МЕСТОПОЛОЖЕНИЕ</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="6" class="table-empty">Машин пока нет. Добавьте первую машину.</td></tr>`}</tbody></table></div></div>`;
    }

    function renderTripsPage() {
        const rows = trucks.map((truck) => `<tr data-status="${escapeHTML(truck.status)}" data-date="${formatDateInput(truck.createdAt)}">
            <td><strong>${escapeHTML(truck.id)}</strong><small>${escapeHTML(truck.plate)}</small></td>
            <td><span class="route-city">${escapeHTML(truck.from)} <b>→</b> ${escapeHTML(truck.to)}</span><small>${escapeHTML(truck.location)}</small></td>
            <td>${escapeHTML(truck.driver)}</td><td>${escapeHTML(truck.eta)}</td>
            <td><div class="table-progress"><span><i style="width:${Math.max(0, Math.min(100, truck.progress))}%"></i></span>${truck.progress}%</div></td>
            <td><span class="table-status ${escapeHTML(truck.status)}">${escapeHTML(statusLabels[truck.status])}</span></td>
            <td><button class="table-action" data-action="edit-truck" data-id="${escapeHTML(truck.id)}">Открыть</button>${truck.status === "moving" || truck.status === "delayed" ? `<button class="table-action success" data-action="complete-trip" data-id="${escapeHTML(truck.id)}">Доставлен</button><button class="table-action danger" data-action="cancel-trip" data-id="${escapeHTML(truck.id)}">Отменить</button>` : ""}</td>
        </tr>`).join("");
        return `${makePageHeader("Рейсы", "Планируйте перевозки и следите за выполнением заказов.", "Создать рейс", "add-trip")}
          <div class="page-toolbar"><div class="segmented-control"><button class="segment ${activeTripFilter === "active" ? "active" : ""}" data-trip-filter="active">Активные</button><button class="segment ${activeTripFilter === "all" ? "active" : ""}" data-trip-filter="all">Все рейсы</button><button class="segment ${activeTripFilter === "delayed" ? "active" : ""}" data-trip-filter="delayed">Задержки</button><button class="segment ${activeTripFilter === "delivered" ? "active" : ""}" data-trip-filter="delivered">Доставлены</button><button class="segment ${activeTripFilter === "cancelled" ? "active" : ""}" data-trip-filter="cancelled">Отменены</button></div><div class="date-filter"><label>С <input type="date" id="tripDateFrom" value="${escapeHTML(tripDateFrom)}" aria-label="Рейсы с даты"></label><label>По <input type="date" id="tripDateTo" value="${escapeHTML(tripDateTo)}" aria-label="Рейсы по дату"></label></div><button class="button button-outline" data-action="export-trips">↓ Экспорт CSV</button></div>
          <div class="panel data-panel"><div class="responsive-table"><table class="data-table"><thead><tr><th>РЕЙС</th><th>МАРШРУТ И ПОЗИЦИЯ</th><th>ВОДИТЕЛЬ</th><th>ПРИБЫТИЕ</th><th>ПРОГРЕСС</th><th>СТАТУС</th><th></th></tr></thead><tbody id="tripsTableBody">${rows || `<tr><td colspan="7" class="table-empty">Рейсов пока нет. Создайте первый — он появится здесь.</td></tr>`}<tr id="tripNoResults" hidden><td colspan="7" class="table-empty">Нет рейсов по выбранным условиям. Измените фильтры или период.</td></tr></tbody></table></div></div>`;
    }

    function renderDriversPage() {
        const cards = drivers.map((driver) => {
            const assigned = trucks.find((truck) => truck.driver === driver.name && ["moving", "delayed"].includes(truck.status));
            const initials = driver.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("ru");
            return `<article class="person-card"><div class="person-card-top"><span class="person-avatar">${escapeHTML(initials)}</span><span class="person-status ${assigned ? "on-route" : ""}">${assigned ? "На маршруте" : escapeHTML(driver.status)}</span></div><h3>${escapeHTML(driver.name)}</h3><p>${escapeHTML(driver.license)}</p><div class="person-detail"><span>Телефон</span><strong>${escapeHTML(driver.phone)}</strong></div><div class="person-detail"><span>Текущий рейс</span><strong>${assigned ? escapeHTML(assigned.id) + " · " + escapeHTML(assigned.to) : "Свободен"}</strong></div><div class="person-actions"><button data-action="edit-driver" data-id="${escapeHTML(driver.id)}">Изменить</button><button data-action="delete-driver" data-id="${escapeHTML(driver.id)}">Удалить</button></div></article>`;
        }).join("");
        return `${makePageHeader("Водители", "Контакты сотрудников и распределение по рейсам.", "Добавить водителя", "add-driver")}
          <div class="page-stat-row"><article><span>В команде</span><strong>${drivers.length}</strong></article><article><span>На маршруте</span><strong>${drivers.filter((driver) => trucks.some((truck) => truck.driver === driver.name && truck.status === "moving")).length}</strong></article><article><span>Свободны</span><strong>${drivers.filter((driver) => !trucks.some((truck) => truck.driver === driver.name && truck.status === "moving")).length}</strong></article></div>
          <div class="people-grid">${cards || `<div class="panel table-empty">Добавьте первого водителя в команду.</div>`}</div>`;
    }

    function renderClientsPage() {
        const rows = clients.map((client) => {
            const verification = client.verified === true
                ? '<span class="verification-badge verified">✓ Проверена</span>'
                : '<span class="verification-badge">Не проверена</span>';
            const updated = Number.isFinite(client.updatedAt)
                ? `Обновлено ${new Intl.DateTimeFormat("ru-RU").format(client.updatedAt)}`
                : "Обновление не указано";
            return `<tr><td><strong>${escapeHTML(client.name)}</strong><small>${escapeHTML(client.id)}</small>${verification}<small>${updated}</small></td><td>${escapeHTML(client.contact)}</td><td>${escapeHTML(client.email)}</td><td>${escapeHTML(client.phone)}</td><td>${escapeHTML(client.city)}</td><td>${client.orders}</td><td><button class="table-action" data-action="edit-client" data-id="${escapeHTML(client.id)}">Изменить</button><button class="table-action danger" data-action="delete-client" data-id="${escapeHTML(client.id)}">Удалить</button></td></tr>`;
        }).join("");
        return `${makePageHeader("Клиенты", "Компании-заказчики, контакты и история отправок.", "Добавить клиента", "add-client")}
          <div class="page-stat-row"><article><span>Клиентов</span><strong>${clients.length}</strong></article><article><span>Перевозок выполнено</span><strong>${clients.reduce((total, item) => total + item.orders, 0)}</strong></article><article><span>Городов доставки</span><strong>${new Set(clients.map((item) => item.city)).size}</strong></article></div>
          <div class="verification-notice">Статус «Проверена» можно показывать только после проверки документов по официальным реестрам. В демо-версии проверка не выполняется; для старых записей дата обновления не указана.</div>
          <div class="panel data-panel"><div class="data-panel-head"><div><h2>База клиентов</h2><p>Контакты, статус проверки и актуальность данных</p></div><span class="table-total">${clients.length} компаний</span></div><div class="responsive-table"><table class="data-table"><thead><tr><th>КОМПАНИЯ И СТАТУС</th><th>КОНТАКТ</th><th>ПОЧТА</th><th>ТЕЛЕФОН</th><th>ГОРОД</th><th>ЗАКАЗЫ</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="7" class="table-empty">Пока нет клиентов. Добавьте первого заказчика.</td></tr>`}</tbody></table></div></div>`;
    }

    function renderMarketPage() {
        const subscriptions = routeSubscriptions.map((subscription) =>
            `<article class="subscription-card"><div><strong>${escapeHTML(subscription.query)}</strong><small>Создана ${new Intl.DateTimeFormat("ru-RU").format(subscription.createdAt)}</small></div><button class="table-action danger" data-action="delete-route-subscription" data-id="${escapeHTML(subscription.id)}">Удалить</button></article>`
        ).join("");
        const recentCount = trucks.filter((truck) => ["moving", "delayed", "stopped"].includes(truck.status) && isRecentListing(truck)).length;
        const borderItems = [
            ["Казахстан", "Очереди и режимы пропуска: оперативный источник не подключён."],
            ["Узбекистан", "Пошлины и правила транзита: требуется проверка по официальным актуальным источникам."],
            ["Таджикистан", "Маршрутные условия и документы: оперативная база не подключена."]
        ].map(([country, detail]) => `<article class="border-info-card"><span class="border-country">${country}</span><p>${detail}</p><span class="border-feed-status"><i></i> Нет live-данных</span></article>`).join("");
        return `${makePageHeader("Ставки и маршруты", "Ищите свежие демо-предложения, сохраняйте направления и проверяйте актуальность данных.")}
          <div class="page-stat-row"><article><span>Свежих демо-рейсов</span><strong>${recentCount}</strong></article><article><span>Подписок на маршруты</span><strong>${routeSubscriptions.length}</strong></article><article><span>Проверенных компаний</span><strong>${clients.filter((client) => client.verified === true).length}</strong></article></div>
          <div class="market-grid">
            <section class="panel market-section"><div class="data-panel-head"><div><h2>Подписки на направления</h2><p>Сохранённые запросы остаются в этом браузере</p></div></div><div class="subscription-list">${subscriptions || '<p class="table-empty">Подписок пока нет. Сохраните запрос с главной страницы.</p>'}</div><p class="market-note">Оповещения пока показываются только внутри этого браузера при добавлении подходящего демо-рейса. Для Telegram нужен серверный бот и API.</p></section>
            <section class="panel market-section"><div class="data-panel-head"><div><h2>Границы и транзит</h2><p>Очереди и пошлины не загружаются автоматически</p></div></div><div class="border-info-list">${borderItems}</div><p class="market-note">Не используйте эти карточки как таможенную консультацию: подключите подтверждённые официальные источники и регулярно обновляемый API.</p></section>
          </div>
          <section class="panel market-section market-freshness"><div class="data-panel-head"><div><h2>Актуальность предложений</h2><p>Старые активные записи скрываются из поиска автоматически</p></div></div><p>Рейсы старше 365 дней не отображаются в поиске на главной. История и исходные записи не удаляются из браузера.</p></section>`;
    }

    function renderAnalyticsPage() {
        const statuses = [
            { label: "В пути", amount: trucks.filter((truck) => truck.status === "moving").length, className: "moving" },
            { label: "Задержка", amount: trucks.filter((truck) => truck.status === "delayed").length, className: "delayed" },
            { label: "Стоянка", amount: trucks.filter((truck) => truck.status === "stopped").length, className: "stopped" },
            { label: "Доставлено", amount: trucks.filter((truck) => truck.status === "delivered").length + 18, className: "delivered" },
            { label: "Отменено", amount: trucks.filter((truck) => truck.status === "cancelled").length, className: "cancelled" }
        ];
        const max = Math.max(1, ...statuses.map((status) => status.amount));
        const bars = statuses.map((status) => `<div class="chart-column"><div class="chart-column-value">${status.amount}</div><div class="chart-column-track"><i class="${status.className}" style="height:${Math.max(8, status.amount / max * 100)}%"></i></div><span>${status.label}</span></div>`).join("");
        const routes = trucks.filter((truck) => ["moving", "delayed"].includes(truck.status)).slice(0, 5).map((truck) => `<div class="analytics-route"><span><strong>${escapeHTML(truck.from)} → ${escapeHTML(truck.to)}</strong><small>${escapeHTML(truck.id)} · ${escapeHTML(truck.driver)}</small></span><b>${truck.progress}%</b></div>`).join("");
        const reportableTrucks = trucks.filter((truck) => truck.status !== "cancelled");
        const onTimeRate = reportableTrucks.length
            ? Math.round((reportableTrucks.length - reportableTrucks.filter((truck) => truck.status === "delayed").length) / reportableTrucks.length * 100)
            : 0;
        return `${makePageHeader("Аналитика", "Ключевые показатели автопарка и выполнения доставок.")}
          <div class="analytics-cards"><article class="analytics-kpi"><span>Активных рейсов</span><strong>${trucks.filter((truck) => truck.status === "moving" || truck.status === "delayed").length}</strong><small>Сейчас на маршрутах</small></article><article class="analytics-kpi"><span>Доля доставок вовремя</span><strong>${onTimeRate}%</strong><small>По текущим статусам</small></article><article class="analytics-kpi"><span>Средний прогресс</span><strong>${trucks.length ? Math.round(trucks.reduce((sum, truck) => sum + truck.progress, 0) / trucks.length) : 0}%</strong><small>По активным рейсам</small></article></div>
          <div class="analytics-grid"><article class="panel chart-panel"><div class="data-panel-head"><div><h2>Статус перевозок</h2><p>Распределение машин автопарка</p></div><span class="table-total">СЕЙЧАС</span></div><div class="bar-chart">${bars}</div></article><article class="panel chart-panel"><div class="data-panel-head"><div><h2>Выполнение рейсов</h2><p>Прогресс активных доставок</p></div></div><div class="analytics-routes">${routes || `<p class="table-empty">Нет активных рейсов.</p>`}</div></article></div>`;
    }

    function renderFinancePage() {
        const active = trucks.filter((truck) => !["stopped", "cancelled"].includes(truck.status));
        const revenue = active.reduce((sum, truck) => sum + Number(truck.amount || 68400), 0);
        const costs = Math.round(revenue * .68);
        const rows = active.map((truck) => `<tr><td><strong>${escapeHTML(truck.id)}</strong><small>${escapeHTML(truck.plate)}</small></td><td>${escapeHTML(truck.from)} → ${escapeHTML(truck.to)}</td><td>${escapeHTML(truck.driver)}</td><td>${currency(Number(truck.amount || 68400))}</td><td><span class="table-status ${truck.status}">${escapeHTML(statusLabels[truck.status])}</span></td></tr>`).join("");
        return `${makePageHeader("Финансы", "Плановая выручка по рейсам. Расчёты демонстрационные.", "Скачать отчёт", "export-finance")}
          <div class="finance-cards"><article><span>Плановая выручка</span><strong>${currency(revenue)}</strong><small>По активным рейсам</small></article><article><span>Расходы на перевозки</span><strong>${currency(costs)}</strong><small>Оценка · 68% от выручки</small></article><article><span>Плановая маржа</span><strong>${currency(revenue - costs)}</strong><small>${revenue ? Math.round((revenue - costs) / revenue * 100) : 0}% от выручки</small></article></div>
          <div class="panel data-panel"><div class="data-panel-head"><div><h2>Рейсы и начисления</h2><p>Суммы ориентировочные, внесите реальные данные в учётной системе</p></div></div><div class="responsive-table"><table class="data-table"><thead><tr><th>РЕЙС</th><th>МАРШРУТ</th><th>ВОДИТЕЛЬ</th><th>ПЛАНОВАЯ СУММА</th><th>СТАТУС</th></tr></thead><tbody>${rows || `<tr><td colspan="5" class="table-empty">Нет рейсов для расчёта.</td></tr>`}</tbody></table></div></div>`;
    }

    function calculateTransportEstimate(from, to, weight, body) {
        const fromCoordinates = cityCoordinates[from.trim().toLocaleLowerCase("ru")];
        const toCoordinates = cityCoordinates[to.trim().toLocaleLowerCase("ru")];
        if (!fromCoordinates || !toCoordinates) {
            return { error: "Выберите города из списка — для них доступна примерная оценка маршрута." };
        }
        if (from.trim().toLocaleLowerCase("ru") === to.trim().toLocaleLowerCase("ru")) {
            return { error: "Город отправления и город доставки должны отличаться." };
        }
        if (!Number.isFinite(weight) || weight <= 0 || weight > 40) {
            return { error: "Укажите вес груза больше 0 и не более 40 тонн." };
        }
        const toRadians = (degrees) => degrees * Math.PI / 180;
        const [fromLatitude, fromLongitude] = fromCoordinates.map(toRadians);
        const [toLatitude, toLongitude] = toCoordinates.map(toRadians);
        const latitudeDelta = toLatitude - fromLatitude;
        const longitudeDelta = toLongitude - fromLongitude;
        const haversine = Math.sin(latitudeDelta / 2) ** 2
            + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
        const straightDistance = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        const distance = Math.round(straightDistance * 1.28 / 10) * 10;
        const weightMultiplier = weight <= 5 ? 0.85 : weight <= 10 ? 1 : weight <= 20 ? 1.25 : 1.6;
        const bodyMultipliers = { tent: 1, curtain: 1.05, refrigerated: 1.35, container: 1.2, flatbed: 1.15 };
        const bodyLabels = {
            tent: "Тент",
            curtain: "Шторный",
            refrigerated: "Рефрижератор",
            container: "Контейнеровоз",
            flatbed: "Бортовой"
        };
        const basePrice = Math.round((15000 + distance * 120) * weightMultiplier * bodyMultipliers[body]);
        return { distance, price: Math.round(basePrice / 1000) * 1000, bodyLabel: bodyLabels[body] };
    }

    function renderCalculatorPage() {
        const cityOptions = Object.keys(cityCoordinates)
            .map((city) => `<option value="${escapeHTML(city.replace(/^./, (letter) => letter.toLocaleUpperCase("ru")))}"></option>`)
            .join("");
        return `${makePageHeader("Калькулятор перевозки", "Рассчитайте ориентировочную стоимость по маршруту, весу и типу кузова.")}
          <div class="calculator-layout">
            <form class="panel calculator-form" id="calculatorForm">
              <div class="data-panel-head calculator-heading"><div><h2>Параметры груза</h2><p>Заполните данные для предварительной оценки</p></div></div>
              <div class="calculator-fields">
                <label class="form-field"><span>Откуда</span><input id="calculatorFrom" list="calculatorCities" placeholder="Например, Москва" autocomplete="off" required></label>
                <label class="form-field"><span>Куда</span><input id="calculatorTo" list="calculatorCities" placeholder="Например, Казань" autocomplete="off" required></label>
                <datalist id="calculatorCities">${cityOptions}</datalist>
                <label class="form-field"><span>Вес груза, тонн</span><input id="calculatorWeight" type="number" min="0.1" max="40" step="0.1" placeholder="Например, 5" required></label>
                <label class="form-field"><span>Тип кузова</span><select id="calculatorBody" required><option value="tent">Тент</option><option value="curtain">Шторный</option><option value="refrigerated">Рефрижератор</option><option value="container">Контейнеровоз</option><option value="flatbed">Бортовой</option></select></label>
              </div>
              <button class="button button-primary calculator-submit" type="submit">Рассчитать стоимость <span>→</span></button>
              <p class="calculator-note">Список городов для расчёта: Москва, Тверь, Казань, Нижний Новгород, Самара, Смоленск, Рязань, Санкт-Петербург, Ярославль, Владимир, Воронеж и Екатеринбург.</p>
            </form>
            <section class="panel calculator-result" id="calculatorResult" aria-live="polite">
              <div class="calculator-result-icon">₽</div>
              <p class="workspace-eyebrow">ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА</p>
              <h2>Узнайте стоимость перевозки</h2>
              <p class="calculator-result-copy">Укажите маршрут, вес и тип кузова — здесь появится ориентир для планирования.</p>
            </section>
          </div>
          <p class="calculator-disclaimer">Это демонстрационный расчёт, а не тариф или коммерческое предложение перевозчика. Дистанция оценивается по координатам городов, а итоговая цена зависит от маршрута, груза, сезона, доступности транспорта и условий перевозки.</p>`;
    }

    function renderSettingsPage() {
        const account = readSavedUser();
        let company = account?.company || "СеверТранс";
        try {
            company = account?.company || localStorage.getItem(storageKeys.company) || company;
        } catch (error) {
            console.error("Не удалось прочитать настройки компании.", error);
        }
        return `${makePageHeader("Настройки", "Персонализируйте рабочее пространство и сохраните данные.")}
          <div class="settings-grid"><article class="panel settings-card"><div class="settings-title"><span class="settings-icon">⌂</span><span><strong>Рабочее пространство</strong><small>Основная информация о компании</small></span></div><form id="companyForm" class="settings-form"><label class="form-field"><span>Название компании</span><input id="settingsCompany" value="${escapeHTML(company)}" maxlength="60" required></label><button class="button button-primary" type="submit">Сохранить изменения</button></form></article>
          <article class="panel settings-card"><div class="settings-title"><span class="settings-icon blue">◐</span><span><strong>Внешний вид</strong><small>Настройте интерфейс под себя</small></span></div><p class="settings-description">Выбранная тема сохранится в этом браузере и применится при следующем входе.</p><button class="button button-outline" id="settingsThemeToggle" data-action="toggle-theme" aria-pressed="${currentTheme === "dark"}">${currentTheme === "dark" ? "Переключить на светлую" : "Переключить на тёмную"}</button></article>
          <article class="panel settings-card"><div class="settings-title"><span class="settings-icon blue">⇩</span><span><strong>Данные и резервная копия</strong><small>Демо-данные хранятся в этом браузере</small></span></div><p class="settings-description">Сохраните копию рейсов, машин, водителей и клиентов в JSON-файле или сбросьте демонстрационные изменения.</p><div class="settings-actions"><button class="button button-outline" data-action="export-backup">Скачать копию</button><button class="button button-outline" data-action="import-backup">Восстановить из файла</button><button class="button button-outline danger-outline" data-action="reset-data">Сбросить изменения</button><input id="backupFile" type="file" accept=".json,application/json" hidden></div></article>
          <article class="panel settings-card"><div class="settings-title"><span class="settings-icon green">✓</span><span><strong>Подключение</strong><small>Статус текущей версии</small></span></div><div class="settings-info"><span>Режим работы</span><strong>Демо · локальное хранение</strong></div><div class="settings-info"><span>GPS-телематика</span><strong>Не подключена</strong></div><div class="settings-info"><span>Синхронизация команды</span><strong>Нужен сервер</strong></div></article></div>`;
    }

    const pageRenderers = {
        fleet: renderFleetPage,
        trips: renderTripsPage,
        drivers: renderDriversPage,
        clients: renderClientsPage,
        analytics: renderAnalyticsPage,
        finance: renderFinancePage,
        calculator: renderCalculatorPage,
        market: renderMarketPage,
        settings: renderSettingsPage
    };

    function renderWorkspacePage(page = currentPage) {
        currentPage = page;
        const overview = page === "overview";
        byId("overviewPage").hidden = !overview;
        byId("workspacePage").hidden = overview;
        if (overview) return;
        const renderer = pageRenderers[page];
        if (!renderer) {
            currentPage = "overview";
            renderWorkspacePage("overview");
            return;
        }
        byId("workspacePage").innerHTML = renderer();
        byId("workspacePage").querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", () => handlePageAction(button.dataset.action, button.dataset.id));
        });
        const search = byId("pageSearch");
        if (search) search.addEventListener("input", () => {
            if (currentPage === "trips") {
                applyTripFilters();
                return;
            }
            const query = search.value.toLocaleLowerCase("ru");
            byId("workspacePage").querySelectorAll(".data-table tbody tr, .person-card").forEach((row) => {
                row.hidden = !row.textContent.toLocaleLowerCase("ru").includes(query);
            });
        });
        byId("workspacePage").querySelectorAll("[data-trip-filter]").forEach((button) => {
            button.addEventListener("click", () => {
                activeTripFilter = button.dataset.tripFilter;
                applyTripFilters();
            });
        });
        byId("workspacePage").querySelector("#tripDateFrom")?.addEventListener("change", (event) => {
            tripDateFrom = event.currentTarget.value;
            applyTripFilters();
        });
        byId("workspacePage").querySelector("#tripDateTo")?.addEventListener("change", (event) => {
            tripDateTo = event.currentTarget.value;
            applyTripFilters();
        });
        if (currentPage === "trips") applyTripFilters();
        byId("workspacePage").querySelector("#companyForm")?.addEventListener("submit", saveCompanySettings);
        byId("workspacePage").querySelector("#backupFile")?.addEventListener("change", importBackup);
        byId("workspacePage").querySelector("#calculatorForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            const from = byId("calculatorFrom").value;
            const to = byId("calculatorTo").value;
            const weight = Number(byId("calculatorWeight").value);
            const body = byId("calculatorBody").value;
            const estimate = calculateTransportEstimate(from, to, weight, body);
            const result = byId("calculatorResult");
            if (estimate.error) {
                result.innerHTML = `<div class="calculator-result-icon error">!</div><p class="workspace-eyebrow">НЕ УДАЛОСЬ РАССЧИТАТЬ</p><h2>Проверьте данные</h2><p class="calculator-result-copy">${escapeHTML(estimate.error)}</p>`;
                return;
            }
            const currency = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
            result.innerHTML = `<div class="calculator-result-icon">₽</div><p class="workspace-eyebrow">ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА</p><h2>${currency.format(estimate.price)}</h2><p class="calculator-result-copy">${escapeHTML(from)} → ${escapeHTML(to)}</p><div class="calculator-breakdown"><div><span>Расстояние, ориентировочно</span><strong>≈ ${estimate.distance.toLocaleString("ru-RU")} км</strong></div><div><span>Вес груза</span><strong>${weight.toLocaleString("ru-RU")} т</strong></div><div><span>Тип кузова</span><strong>${escapeHTML(estimate.bodyLabel)}</strong></div></div>`;
        });
    }

    function handlePageAction(action, id) {
        if (action === "add-trip") return openTripModal();
        if (action === "add-truck") return openRecordModal("truck");
        if (action === "add-driver") return openRecordModal("driver");
        if (action === "add-client") return openRecordModal("client");
        if (action === "edit-truck") return openRecordModal("truck", id);
        if (action === "edit-driver") return openRecordModal("driver", id);
        if (action === "edit-client") return openRecordModal("client", id);
        if (action === "delete-truck") return deleteRecord("truck", id);
        if (action === "delete-driver") return deleteRecord("driver", id);
        if (action === "delete-client") return deleteRecord("client", id);
        if (action === "complete-trip") return completeTrip(id);
        if (action === "cancel-trip") return cancelTrip(id);
        if (action === "export-trips") return exportCSV(trucks.map((truck) => ({
            id: truck.id,
            plate: truck.plate,
            route: `${truck.from} → ${truck.to}`,
            driver: truck.driver,
            eta: truck.eta,
            createdAt: new Intl.DateTimeFormat("ru-RU").format(truck.createdAt),
            status: statusLabels[truck.status],
            progress: `${truck.progress}%`,
            amount: truck.amount || 0
        })), "reisy-transline.csv");
        if (action === "export-finance") return exportCSV(trucks.filter((truck) => !["stopped", "cancelled"].includes(truck.status)).map((truck) => ({ id: truck.id, route: `${truck.from} → ${truck.to}`, driver: truck.driver, amount: truck.amount || 68400, status: statusLabels[truck.status] })), "finansy-transline.csv");
        if (action === "export-backup") return exportBackup();
        if (action === "import-backup") return byId("backupFile").click();
        if (action === "reset-data") return resetDemoData();
        if (action === "toggle-theme") return setTheme(currentTheme === "dark" ? "light" : "dark");
        if (action === "delete-route-subscription") {
            const nextSubscriptions = routeSubscriptions.filter((item) => item.id !== id);
            if (saveRouteSubscriptions(nextSubscriptions)) {
                renderWorkspacePage("market");
                showToast("Подписка удалена.");
            }
        }
    }

    function openTripModal() {
        byId("tripError").classList.remove("visible");
        byId("tripForm").reset();
        const driverSelect = byId("tripDriver");
        driverSelect.replaceChildren(new Option("Выберите водителя", ""));
        drivers.forEach((driver) => driverSelect.add(new Option(`${driver.name} · ${driver.status}`, driver.name)));
        const clientSelect = byId("tripClient");
        clientSelect.replaceChildren(new Option("Не выбран", ""));
        clients.forEach((client) => clientSelect.add(new Option(client.name, client.name)));
        openModal("tripModal");
    }

    function openRecordModal(type, id = null) {
        currentRecordType = type;
        editingRecordId = id;
        const records = type === "truck" ? trucks : type === "driver" ? drivers : clients;
        const record = id ? records.find((item) => item.id === id) : null;
        const isEdit = Boolean(record);
        const fields = {
            truck: [
                ["plate", "Госномер", "А123ВС 799", true],
                ["driver", "Водитель", "Имя Фамилия", true],
                ["from", "Откуда", "Москва", true],
                ["to", "Куда", "Казань", true],
                ["location", "Текущая позиция", "Например, трасса М-7", true],
                ["eta", "Прибытие", "Сегодня, 18:30", true],
                ["amount", "Стоимость рейса, ₽", "68000", false],
                ["progress", "Прогресс, %", "0", false],
                ["status", "Статус машины", "Выберите статус", true]
            ],
            driver: [
                ["name", "Имя и фамилия", "Например, Анна Смирнова", true],
                ["phone", "Телефон", "+7 900 000-00-00", true],
                ["license", "Категория / должность", "Водитель категории Е", true],
                ["status", "Статус", "На базе", true]
            ],
            client: [
                ["name", "Компания", "Название компании", true],
                ["contact", "Контактное лицо", "Имя Фамилия", true],
                ["email", "Электронная почта", "mail@company.ru", true],
                ["phone", "Телефон", "+7 900 000-00-00", true],
                ["city", "Город", "Москва", true],
                ["orders", "Количество заказов", "0", false]
            ]
        }[type];
        const title = { truck: "машину", driver: "водителя", client: "клиента" }[type];
        byId("recordEyebrow").textContent = isEdit ? "РЕДАКТИРОВАНИЕ ДАННЫХ" : "НОВАЯ ЗАПИСЬ";
        byId("recordTitle").textContent = `${isEdit ? "Изменить" : "Добавить"} ${title}`;
        byId("recordDescription").textContent = "Информация сохранится в этом браузере.";
        byId("recordForm").innerHTML = `<div class="record-form-grid">${fields.map(([key, label, placeholder, required]) => {
            const value = record?.[key] ?? (key === "status" ? (type === "truck" ? "moving" : "На базе") : key === "orders" || key === "progress" || key === "amount" ? "" : "");
            if (key === "status" && type === "truck") {
                return `<label class="form-field"><span>${label}</span><select name="status" required>${Object.entries(statusLabels).map(([status, caption]) => `<option value="${status}" ${value === status ? "selected" : ""}>${caption}</option>`).join("")}</select></label>`;
            }
            if (key === "status" && type === "driver") {
                return `<label class="form-field"><span>${label}</span><select name="status" required>${["На базе", "На маршруте", "Отдых", "Выходной"].map((status) => `<option ${value === status ? "selected" : ""}>${status}</option>`).join("")}</select></label>`;
            }
            const numeric = ["orders", "progress", "amount"].includes(key);
            return `<label class="form-field ${fields.length > 4 ? "" : "single-field"}"><span>${label}</span><input name="${key}" ${numeric ? `type="number" min="0" ${key === "progress" ? 'max="100"' : ""}` : "type=\"text\""} value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" ${required ? "required" : ""} maxlength="80"></label>`;
        }).join("")}</div><p class="form-error" id="recordError" role="alert"></p><button class="button button-primary modal-submit" type="submit">${isEdit ? "Сохранить изменения" : `Добавить ${title}`} <span>→</span></button>`;
        byId("recordForm").onsubmit = saveRecord;
        openModal("recordModal");
    }

    function saveRecord(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const values = Object.fromEntries(formData.entries());
        const error = byId("recordError");
        if (currentRecordType === "truck") {
            const duplicate = trucks.some((truck) => truck.plate.toLocaleLowerCase("ru") === values.plate.trim().toLocaleLowerCase("ru") && truck.id !== editingRecordId);
            if (duplicate) {
                error.textContent = "Машина с таким госномером уже есть в автопарке.";
                error.classList.add("visible");
                return;
            }
            const existing = trucks.find((truck) => truck.id === editingRecordId);
            const truck = {
                ...(existing || {}),
                id: existing?.id || `RF-${String(Math.max(300, ...trucks.map((item) => Number(item.id.replace(/\D/g, "")) || 0)) + 1).padStart(3, "0")}`,
                plate: values.plate.trim(),
                driver: values.driver.trim(),
                from: values.from.trim(),
                to: values.to.trim(),
                location: values.location.trim(),
                eta: values.eta.trim(),
                status: values.status || existing?.status || "stopped",
                createdAt: existing?.createdAt || Date.now(),
                amount: Number(values.amount) || 0,
                progress: Math.max(0, Math.min(100, Number(values.progress) || 0)),
                x: existing?.x ?? 20 + Math.random() * 60,
                y: existing?.y ?? 25 + Math.random() * 50
            };
            if (existing) trucks = trucks.map((item) => item.id === truck.id ? truck : item);
            else trucks.unshift(truck);
            addActivity(existing ? "Данные машины изменены" : "Машина добавлена", `${truck.id} · ${truck.plate}`, "created");
            saveTrucks();
            updateMetrics();
            renderFleet();
            renderRoutes();
        } else if (currentRecordType === "driver") {
            const record = { id: editingRecordId || `DR-${Date.now().toString().slice(-6)}`, name: values.name.trim(), phone: values.phone.trim(), license: values.license.trim(), status: values.status.trim() || "На базе" };
            drivers = editingRecordId ? drivers.map((item) => item.id === editingRecordId ? record : item) : [record, ...drivers];
            saveCollection(storageKeys.drivers, drivers, starterDrivers);
            addActivity(editingRecordId ? "Данные водителя изменены" : "Водитель добавлен", record.name, "created");
        } else {
            const existing = clients.find((item) => item.id === editingRecordId);
            const record = {
                ...(existing || {}),
                id: existing?.id || `CL-${Date.now().toString().slice(-6)}`,
                name: values.name.trim(),
                contact: values.contact.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                city: values.city.trim(),
                orders: Math.max(0, Number(values.orders) || 0),
                updatedAt: Date.now()
            };
            clients = editingRecordId ? clients.map((item) => item.id === editingRecordId ? record : item) : [record, ...clients];
            saveCollection(storageKeys.clients, clients, starterClients);
            addActivity(editingRecordId ? "Карточка клиента изменена" : "Клиент добавлен", record.name, "created");
        }
        closeModal(byId("recordModal"));
        renderWorkspacePage(currentPage);
        showToast(editingRecordId ? "Изменения сохранены." : "Запись добавлена.");
    }

    function deleteRecord(type, id) {
        const collections = { truck: [trucks, storageKeys.trucks, starterTrucks], driver: [drivers, storageKeys.drivers, starterDrivers], client: [clients, storageKeys.clients, starterClients] };
        const [collection] = collections[type];
        const record = collection.find((item) => item.id === id);
        if (!record || !window.confirm(`Удалить запись «${type === "truck" ? record.plate : record.name}»?`)) return;
        if (type === "truck") {
            trucks = trucks.filter((item) => item.id !== id);
            if (selectedTruckId === id) selectedTruckId = trucks[0]?.id ?? null;
            saveTrucks();
            updateMetrics();
            renderFleet();
            renderRoutes();
            addActivity("Машина удалена", `${record.id} · ${record.plate}`, "warning");
        } else if (type === "driver") {
            drivers = drivers.filter((item) => item.id !== id);
            saveCollection(storageKeys.drivers, drivers, starterDrivers);
            addActivity("Водитель удалён", record.name, "warning");
        } else {
            clients = clients.filter((item) => item.id !== id);
            saveCollection(storageKeys.clients, clients, starterClients);
            addActivity("Клиент удалён", record.name, "warning");
        }
        renderWorkspacePage(currentPage);
        showToast("Запись удалена.");
    }

    function completeTrip(id) {
        const trip = trucks.find((truck) => truck.id === id);
        if (!trip || !["moving", "delayed"].includes(trip.status)) return;
        trucks = trucks.map((truck) => truck.id === id ? { ...truck, status: "delivered", progress: 100, location: `Доставлено: ${truck.to}` } : truck);
        saveTrucks();
        addActivity("Доставка завершена", `${trip.id} прибыл в ${trip.to} · ${trip.driver}`, "delivered");
        updateMetrics();
        renderFleet();
        renderRoutes();
        renderWorkspacePage(currentPage);
        showToast(`Рейс ${id} отмечен как доставленный.`);
    }

    function cancelTrip(id) {
        const trip = trucks.find((truck) => truck.id === id);
        if (!trip || !["moving", "delayed"].includes(trip.status)) return;
        if (!window.confirm(`Отменить рейс ${trip.id} по маршруту ${trip.from} → ${trip.to}?`)) return;
        trucks = trucks.map((truck) => truck.id === id ? { ...truck, status: "cancelled" } : truck);
        saveTrucks();
        addActivity("Рейс отменён", `${trip.id} · ${trip.from} → ${trip.to}`, "warning");
        updateMetrics();
        renderFleet();
        renderRoutes();
        renderWorkspacePage(currentPage);
        showToast(`Рейс ${id} отменён.`);
    }

    function exportCSV(rows, filename) {
        if (!rows.length) {
            showToast("Нет данных для экспорта.", true);
            return;
        }
        const headers = Object.keys(rows[0]);
        const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
            .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
        downloadFile(`\uFEFF${csv}`, filename, "text/csv;charset=utf-8");
    }

    function exportBackup() {
        const backup = { app: "transline-demo", version: 1, exportedAt: new Date().toISOString(), trucks, drivers, clients, activities, routeSubscriptions };
        downloadFile(JSON.stringify(backup, null, 2), "transline-backup.json", "application/json");
    }

    async function importBackup(event) {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;
        if (file.size > 2_000_000) {
            showToast("Файл слишком большой. Максимальный размер — 2 МБ.", true);
            return;
        }
        try {
            const backup = JSON.parse(await file.text());
            const isValid = backup?.app === "transline-demo" && backup.version === 1
                && Array.isArray(backup.trucks) && backup.trucks.every(isValidTruck)
                && Array.isArray(backup.drivers) && backup.drivers.every((item) => item && ["id", "name", "phone", "license", "status"].every((key) => typeof item[key] === "string"))
                && Array.isArray(backup.clients) && backup.clients.every((item) => item && ["id", "name", "contact", "email", "phone", "city"].every((key) => typeof item[key] === "string") && Number.isFinite(item.orders))
                && (!backup.activities || (Array.isArray(backup.activities) && backup.activities.every((item) => item && ["id", "title", "description", "kind"].every((key) => typeof item[key] === "string") && Number.isFinite(item.createdAt))))
                && (!backup.routeSubscriptions || (Array.isArray(backup.routeSubscriptions) && backup.routeSubscriptions.every((item) => item && ["id", "query"].every((key) => typeof item[key] === "string") && Number.isFinite(item.createdAt))));
            if (!isValid) throw new Error("Это не резервная копия ТрансЛайн или файл содержит неверные данные.");
            const nextActivities = backup.activities || [];
            const entries = [
                [storageKeys.trucks, backup.trucks],
                [storageKeys.drivers, backup.drivers],
                [storageKeys.clients, backup.clients],
                [storageKeys.activity, nextActivities],
                [storageKeys.routeSubscriptions, backup.routeSubscriptions || []]
            ];
            const previous = entries.map(([key]) => [key, localStorage.getItem(key)]);
            try {
                entries.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
            } catch (error) {
                previous.forEach(([key, value]) => {
                    if (value === null) localStorage.removeItem(key);
                    else localStorage.setItem(key, value);
                });
                throw error;
            }
            trucks = normalizeTrucks(backup.trucks);
            drivers = backup.drivers;
            clients = backup.clients;
            activities = nextActivities;
            routeSubscriptions = backup.routeSubscriptions || [];
            selectedTruckId = trucks[0]?.id ?? null;
            updateMetrics();
            renderFleet();
            renderRoutes();
            renderActivityList();
            renderWorkspacePage(currentPage);
            showToast("Резервная копия восстановлена.");
        } catch (error) {
            console.error("Не удалось восстановить резервную копию.", error);
            showToast(error.message || "Не удалось восстановить данные из этого файла.", true);
        }
    }

    function downloadFile(contents, filename, type) {
        const url = URL.createObjectURL(new Blob([contents], { type }));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast(`Файл «${filename}» подготовлен.`);
    }

    function resetDemoData() {
        if (!window.confirm("Сбросить машины, водителей и клиентов к исходным демо-данным?")) return;
        trucks = normalizeTrucks(starterTrucks);
        drivers = starterDrivers.map((item) => ({ ...item }));
        clients = starterClients.map((item) => ({ ...item }));
        routeSubscriptions = [];
        activities = [
            { id: "EV-1", title: "Доставка завершена", description: "RF-204 доставил груз в Казань · Сергей Козлов", kind: "delivered", createdAt: Date.now() - 12 * 60_000 },
            { id: "EV-2", title: "Новый рейс", description: "RF-118 выехал из Москвы · Андрей Морозов", kind: "departed", createdAt: Date.now() - 34 * 60_000 },
            { id: "EV-3", title: "Задержка в пути", description: "RF-073 задерживается на трассе М-7 · Иван Петров", kind: "warning", createdAt: Date.now() - 48 * 60_000 }
        ];
        selectedTruckId = trucks[0].id;
        try {
            [storageKeys.trucks, storageKeys.drivers, storageKeys.clients, storageKeys.activity, storageKeys.routeSubscriptions].forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error("Не удалось очистить сохранённые демо-данные.", error);
            showToast("Не удалось очистить браузерное хранилище.", true);
            return;
        }
        updateMetrics();
        renderFleet();
        renderRoutes();
        renderActivityList();
        renderWorkspacePage(currentPage);
        showToast("Демо-данные восстановлены.");
    }

    function saveCompanySettings(event) {
        event.preventDefault();
        const company = byId("settingsCompany").value.trim();
        if (!company) return;
        try {
            localStorage.setItem(storageKeys.company, company);
            const account = readSavedUser();
            if (account) {
                account.company = company;
                localStorage.setItem(storageKeys.user, JSON.stringify(account));
                const stored = JSON.parse(localStorage.getItem(storageKeys.accounts) || "[]");
                const updated = stored.map((item) => item.email === account.email ? { ...item, company } : item);
                localStorage.setItem(storageKeys.accounts, JSON.stringify(updated));
                setUser(account);
            } else {
                byId("companyName").textContent = company;
            }
            showToast("Название компании обновлено.");
            addActivity("Настройки компании изменены", company, "created");
        } catch (error) {
            console.error("Не удалось сохранить название компании.", error);
            showToast("Не удалось сохранить настройки компании.", true);
        }
    }

    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.classList.toggle("error-toast", isError);
        toast.classList.add("visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3300);
    }

    function openModal(id) {
        const modal = byId(id);
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        const field = modal.querySelector("input");
        if (field) window.setTimeout(() => field.focus(), 50);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
    }

    function closeAllModals() {
        document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(closeModal);
    }

    function refreshGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
        const firstName = readSavedUser()?.name.split(/\s+/)[0] || "Алексей";
        byId("greetingName").textContent = `${greeting}, ${firstName}`;
        byId("todayDate").textContent = new Intl.DateTimeFormat("ru-RU", {
            weekday: "long", day: "numeric", month: "long"
        }).format(now).toLocaleUpperCase("ru");
    }

    function readSavedUser() {
        try {
            const saved = localStorage.getItem(storageKeys.user);
            if (!saved) return null;
            const account = JSON.parse(saved);
            if (account && typeof account === "object" && typeof account.name === "string") {
                return {
                    name: account.name,
                    company: typeof account.company === "string" ? account.company : "СеверТранс",
                    email: typeof account.email === "string" ? account.email : ""
                };
            }
            return null;
        } catch (error) {
            console.error("Не удалось прочитать демо-аккаунт.", error);
            return null;
        }
    }

    function setUser(account) {
        const name = account.name;
        const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("ru");
        const firstName = name.split(/\s+/)[0] || "Диспетчер";
        byId("topName").textContent = name;
        byId("sideName").textContent = name;
        byId("greetingName").textContent = `${new Date().getHours() < 12 ? "Доброе утро" : new Date().getHours() < 18 ? "Добрый день" : "Добрый вечер"}, ${firstName}`;
        byId("companyName").textContent = account.company || "СеверТранс";
        byId("topAvatar").textContent = initials;
        byId("sideAvatar").textContent = initials;
        byId("sideRole").textContent = "Демо-аккаунт";
        byId("loginButton").textContent = "Выйти";
        byId("loginButton").setAttribute("aria-label", "Выйти из аккаунта");
    }

    function logout() {
        try {
            localStorage.removeItem(storageKeys.user);
            byId("topName").textContent = "Алексей Морозов";
            byId("sideName").textContent = "Алексей Морозов";
            byId("sideRole").textContent = "Диспетчер";
            byId("companyName").textContent = "СеверТранс";
            byId("topAvatar").textContent = "АМ";
            byId("sideAvatar").textContent = "АМ";
            byId("loginButton").textContent = "Войти";
            byId("loginButton").setAttribute("aria-label", "Войти");
            refreshGreeting();
            showAuth("login");
        } catch (error) {
            console.error("Не удалось завершить демо-сессию.", error);
            showToast("Не удалось завершить демо-сессию. Проверьте настройки браузера.", true);
        }
    }

    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop")));
    });
    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
        backdrop.addEventListener("click", (event) => {
            if (event.target === backdrop) closeModal(backdrop);
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeAllModals();
        if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
            event.preventDefault();
            if (byId("dashboard").hidden) return;
            const pageSearch = byId("pageSearch");
            if (currentPage !== "overview" && pageSearch) pageSearch.focus();
            else byId("truckSearch").focus();
        }
    });

    byId("loginButton").addEventListener("click", () => {
        if (readSavedUser()) logout();
        else showAuth("login");
    });
    byId("themeToggle").addEventListener("click", () => setTheme(currentTheme === "dark" ? "light" : "dark"));
    byId("logoutButton").addEventListener("click", () => {
        if (readSavedUser()) logout();
        else showAuth("login");
    });
    function setAuthTab(tab) {
        const isRegister = tab === "register";
        byId("registerForm").hidden = !isRegister;
        byId("loginForm").hidden = isRegister;
        byId("registerTab").classList.toggle("active", isRegister);
        byId("loginTab").classList.toggle("active", !isRegister);
        byId("registerTab").setAttribute("aria-selected", String(isRegister));
        byId("loginTab").setAttribute("aria-selected", String(!isRegister));
        byId("authTitle").textContent = isRegister ? "Создайте аккаунт" : "С возвращением";
        byId("authDescription").textContent = isRegister
            ? "Начните управлять перевозками в одном месте."
            : "Войдите в панель управления своей компании.";
        byId("authSwitchText").textContent = isRegister ? "Уже есть аккаунт?" : "Впервые здесь?";
        byId("authSwitchButton").textContent = isRegister ? "Войти" : "Создать аккаунт";
        byId(isRegister ? "registerError" : "loginError").classList.remove("visible");
        const firstInput = byId(isRegister ? "registerName" : "loginEmail");
        window.setTimeout(() => firstInput.focus(), 50);
    }

    function showAuth(tab) {
        byId("dashboard").hidden = true;
        byId("authScreen").hidden = false;
        setAuthTab(tab);
    }

    function showDashboard() {
        byId("authScreen").hidden = true;
        byId("dashboard").hidden = false;
        window.setTimeout(() => fleetMap?.invalidateSize(), 50);
    }

    byId("registerTab").addEventListener("click", () => setAuthTab("register"));
    byId("loginTab").addEventListener("click", () => setAuthTab("login"));
    byId("authSwitchButton").addEventListener("click", () => {
        setAuthTab(byId("registerForm").hidden ? "register" : "login");
    });
    document.querySelectorAll("[data-toggle-password]").forEach((button) => {
        button.addEventListener("click", () => {
            const passwordInput = byId(button.dataset.togglePassword);
            const isVisible = passwordInput.type === "text";
            passwordInput.type = isVisible ? "password" : "text";
            button.textContent = isVisible ? "Показать" : "Скрыть";
            button.setAttribute("aria-label", isVisible ? "Показать пароль" : "Скрыть пароль");
            button.setAttribute("aria-pressed", String(!isVisible));
        });
    });
    byId("registerForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = byId("registerName").value.trim();
        const company = byId("registerCompany").value.trim();
        const email = byId("registerEmail").value.trim().toLocaleLowerCase("ru");
        const password = byId("registerPassword").value;
        const errorMessage = byId("registerError");
        if (!name || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
            errorMessage.textContent = "Заполните поля и укажите корректную почту. Пароль — не короче 8 символов.";
            errorMessage.classList.add("visible");
            return;
        }
        try {
            if (!crypto.subtle) throw new Error("Для создания демо-аккаунта откройте страницу через localhost или современный браузер.");
            const storedAccounts = localStorage.getItem(storageKeys.accounts);
            const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
            if (!Array.isArray(accounts)) throw new Error("Не удалось прочитать сохранённые аккаунты. Очистите данные сайта и попробуйте снова.");
            if (accounts.some((account) => account.email === email)) {
                errorMessage.textContent = "Аккаунт с этой почтой уже есть. Перейдите во вкладку «Войти».";
                errorMessage.classList.add("visible");
                return;
            }
            const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
            const passwordHash = await hashPassword(password, salt);
            const account = { name, company, email, salt, passwordHash };
            accounts.push(account);
            localStorage.setItem(storageKeys.accounts, JSON.stringify(accounts));
            localStorage.setItem(storageKeys.user, JSON.stringify({ name, company, email }));
            setUser(account);
            errorMessage.classList.remove("visible");
            byId("registerForm").reset();
            showDashboard();
            showToast(`Аккаунт компании «${company}» создан. Это демонстрационный режим.`);
        } catch (error) {
            console.error("Не удалось создать демо-аккаунт.", error);
            errorMessage.textContent = error.name === "QuotaExceededError"
                ? "В браузере недостаточно места для сохранения аккаунта."
                : error.message || "Не удалось создать аккаунт. Проверьте настройки браузера и попробуйте снова.";
            errorMessage.classList.add("visible");
        }
    });

    async function hashPassword(password, salt) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    byId("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = byId("loginEmail").value.trim().toLocaleLowerCase("ru");
        const password = byId("loginPassword").value;
        const errorMessage = byId("loginError");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
            errorMessage.textContent = "Укажите корректную почту и пароль не короче 8 символов.";
            errorMessage.classList.add("visible");
            return;
        }
        try {
            const storedAccounts = localStorage.getItem(storageKeys.accounts);
            const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
            if (!Array.isArray(accounts)) throw new Error("Не удалось прочитать сохранённые аккаунты. Очистите данные сайта и попробуйте снова.");
            const account = accounts.find((item) => item.email === email);
            if (!account || !account.salt || !account.passwordHash || await hashPassword(password, account.salt) !== account.passwordHash) {
                errorMessage.textContent = "Почта или пароль не подошли. Проверьте данные или создайте новый аккаунт.";
                errorMessage.classList.add("visible");
                return;
            }
            localStorage.setItem(storageKeys.user, JSON.stringify({ name: account.name, company: account.company, email: account.email }));
            setUser(account);
            showDashboard();
            errorMessage.classList.remove("visible");
            byId("loginForm").reset();
            showToast(`Вы вошли в рабочее пространство «${account.company}».`);
        } catch (error) {
            console.error("Не удалось сохранить демо-сессию.", error);
            errorMessage.textContent = error.message || "Не удалось войти. Проверьте настройки браузера и попробуйте снова.";
            errorMessage.classList.add("visible");
        }
    });

    byId("newTripButton").addEventListener("click", openTripModal);
    byId("tripForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const plate = byId("tripPlate").value.trim();
        const driver = byId("tripDriver").value;
        const from = byId("tripFrom").value.trim();
        const to = byId("tripTo").value.trim();
        const cargo = byId("tripCargo").value.trim();
        const client = byId("tripClient").value;
        const amount = Number(byId("tripAmount").value) || 0;
        const etaInput = byId("tripEta").value;
        const errorMessage = byId("tripError");
        if (![plate, driver, from, to].every(Boolean)) {
            errorMessage.textContent = "Выберите водителя и заполните номер машины и маршрут.";
            errorMessage.classList.add("visible");
            return;
        }
        if (drivers.some((item) => item.name === driver && trucks.some((truck) => truck.driver === driver && ["moving", "delayed"].includes(truck.status)))) {
            errorMessage.textContent = "У этого водителя уже есть активный рейс. Выберите свободного водителя.";
            errorMessage.classList.add("visible");
            return;
        }
        if (trucks.some((truck) => truck.plate.toLocaleLowerCase("ru") === plate.toLocaleLowerCase("ru"))) {
            errorMessage.textContent = "Машина с таким номером уже есть в автопарке.";
            errorMessage.classList.add("visible");
            byId("tripPlate").focus();
            return;
        }
        const sequence = Math.max(300, ...trucks.map((truck) => Number(truck.id.replace(/\D/g, "")) || 0)) + 1;
        const position = trucks.length;
        const newTruck = {
            id: `RF-${String(sequence).padStart(3, "0")}`,
            plate, driver, from, to, cargo,
            location: `Выезд из г. ${from}`,
            client,
            amount,
            status: "moving",
            createdAt: Date.now(),
            eta: etaInput ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(etaInput)) : "Расчёт ETA",
            progress: 4,
            x: 17 + ((position * 13 + 19) % 70),
            y: 25 + ((position * 17 + 23) % 55)
        };
        trucks.unshift(newTruck);
        selectedTruckId = newTruck.id;
        activeFilter = "all";
        searchQuery = "";
        byId("truckSearch").value = "";
        errorMessage.classList.remove("visible");
        byId("tripForm").reset();
        saveTrucks();
        updateMetrics();
        renderFleet();
        renderRoutes();
        addActivity("Создан новый рейс", `${newTruck.id} · ${from} → ${to} · ${driver}`, "created");
        if (currentPage === "trips") renderWorkspacePage("trips");
        closeModal(byId("tripModal"));
        const matchesSubscription = routeSubscriptions.some((subscription) =>
            normalizeSearchText(subscription.query).split(" ").filter(Boolean).every((term) =>
                normalizeSearchText([newTruck.from, newTruck.to, newTruck.cargo, newTruck.client, newTruck.driver].join(" ")).includes(term)));
        showToast(matchesSubscription
            ? `Рейс ${newTruck.id} совпал с подпиской. Уведомление показано только здесь; Telegram не подключён.`
            : `Рейс ${newTruck.id} добавлен в демо-автопарк.`);
    });

    byId("demoAccessButton").addEventListener("click", () => {
        byId("topName").textContent = "Гость";
        byId("sideName").textContent = "Демо-доступ";
        byId("sideRole").textContent = "Без регистрации";
        byId("topAvatar").textContent = "Д";
        byId("sideAvatar").textContent = "Д";
        byId("companyName").textContent = "СеверТранс";
        byId("loginButton").textContent = "Войти";
        byId("loginButton").setAttribute("aria-label", "Войти в свой аккаунт");
        byId("greetingName").textContent = `${new Date().getHours() < 12 ? "Доброе утро" : new Date().getHours() < 18 ? "Добрый день" : "Добрый вечер"}, гость`;
        showDashboard();
        showToast("Открыт демо-доступ. Создайте аккаунт, чтобы попробовать регистрацию.");
    });

    document.querySelectorAll(".filter-chip").forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            renderFleet();
        });
    });
    byId("truckSearch").addEventListener("input", (event) => {
        searchQuery = event.currentTarget.value.trim();
        renderFleet();
    });
    byId("resetFiltersButton").addEventListener("click", () => {
        activeFilter = "all";
        searchQuery = "";
        byId("truckSearch").value = "";
        renderFleet();
        showToast("Фильтры сброшены — показаны все машины.");
    });

    byId("refreshButton").addEventListener("click", () => {
        byId("lastUpdated").textContent = "только что";
        renderFleet();
        renderRoutes();
        showToast("Демо-данные автопарка обновлены.");
    });
    byId("zoomMapButton").addEventListener("click", (event) => {
        const zoomed = byId("mapContainer").classList.toggle("is-zoomed");
        if (fleetMap) {
            if (zoomed) fleetMap.zoomIn();
            else fleetMap.zoomOut();
        }
        event.currentTarget.setAttribute("aria-label", zoomed ? "Уменьшить карту" : "Увеличить карту");
        event.currentTarget.title = zoomed ? "Уменьшить карту" : "Увеличить карту";
    });
    byId("locateDeviceButton").addEventListener("click", () => captureTruckGps(selectedTruckId));
    byId("truckDetailsButton").addEventListener("click", () => {
        const truck = trucks.find((item) => item.id === selectedTruckId);
        if (!truck) {
            showToast("Сначала выберите машину в автопарке.", true);
            return;
        }
        showTruckDetails(truck);
    });

    document.querySelectorAll(".nav-link").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item === button));
            byId("currentSection").textContent = button.dataset.section;
            renderWorkspacePage(button.dataset.page || "overview");
            window.scrollTo({ top: 0, behavior: "smooth" });
            byId("sidebar").classList.remove("mobile-open");
        });
    });
    document.querySelectorAll(".portal-shortcut").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelector(`.nav-link[data-page="${button.dataset.page}"]`).click();
        });
    });
    byId("smartSearchForm").addEventListener("submit", (event) => {
        event.preventDefault();
        renderSmartSearchResults(byId("smartSearchQuery").value);
    });
    byId("subscribeSearchButton").addEventListener("click", () => {
        addRouteSubscription(byId("smartSearchQuery").value);
    });
    byId("portalCreateTrip").addEventListener("click", openTripModal);
    byId("allRoutesButton").addEventListener("click", () => {
        document.querySelector('[data-section="Рейсы"]').click();
    });
    byId("activityButton").addEventListener("click", () => {
        renderActivityList();
        openModal("activityModal");
    });
    byId("notificationsButton").addEventListener("click", () => {
        renderActivityList();
        openModal("activityModal");
    });
    byId("supportButton").addEventListener("click", () => showToast("Демо-поддержка: support@transline.example"));
    byId("companyName").closest(".company-switch").addEventListener("click", () => {
        document.querySelector('[data-page="settings"]').click();
    });
    byId("mobileMenuButton").addEventListener("click", () => byId("sidebar").classList.toggle("mobile-open"));
    document.addEventListener("click", (event) => {
        if (window.innerWidth <= 620 && byId("sidebar").classList.contains("mobile-open")
            && !byId("sidebar").contains(event.target) && !byId("mobileMenuButton").contains(event.target)) {
            byId("sidebar").classList.remove("mobile-open");
        }
    });

    setTheme(currentTheme, false);
    const savedUser = readSavedUser();
    if (savedUser) {
        setUser(savedUser);
        showDashboard();
    } else {
        showAuth("register");
    }
    refreshGreeting();
    initializeFleetMap();
    updateMetrics();
    renderFleet();
    renderRoutes();
    renderActivityList();
})();