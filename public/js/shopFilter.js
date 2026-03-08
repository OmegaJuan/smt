document.addEventListener("DOMContentLoaded", () => {

    /* =====================
       ELEMENTS
    ====================== */

    const productGrid = document.querySelector(".product-grid");
    const productCount = document.getElementById("productCount");

    const brandCheckboxes = document.querySelectorAll("input[name='brand']");
    const departmentCheckboxes = document.querySelectorAll("input[name='department']");
    const categoryCheckboxes = document.querySelectorAll("input[name='category']");

    const minRange = document.getElementById("minRange");
    const maxRange = document.getElementById("maxRange");
    const minInput = document.getElementById("minPrice");
    const maxInput = document.getElementById("maxPrice");

    const sortSelect = document.getElementById("sortSelect");

    // 🔥 HEADER SEARCH INPUT
    const searchInput = document.querySelector(".search");


    /* =====================
       DROPDOWN TOGGLE
    ====================== */

    document.querySelectorAll(".filter-header").forEach(header => {
        header.addEventListener("click", () => {
            header.parentElement.classList.toggle("active");
        });
    });


    /* =====================
       SEARCH INSIDE FILTER
    ====================== */

    document.querySelectorAll(".filter-search").forEach(input => {
        input.addEventListener("keyup", () => {
            const value = input.value.toLowerCase();
            const items = input.parentElement.querySelectorAll(".checkbox-item");

            items.forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(value) ? "flex" : "none";
            });
        });
    });


    /* =====================
       AUTO FILTER EVENTS
    ====================== */

    [...brandCheckboxes, ...categoryCheckboxes, ...departmentCheckboxes]
        .forEach(cb => cb.addEventListener("change", applyFilters));

    if (sortSelect) {
        sortSelect.addEventListener("change", applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyFilters();
            }
        });
    }

    [minRange, maxRange].forEach(slider => {
        slider.addEventListener("input", () => {

            if (Number(minRange.value) > Number(maxRange.value)) {
                if (slider === minRange) maxRange.value = minRange.value;
                else minRange.value = maxRange.value;
            }

            minInput.value = minRange.value;
            maxInput.value = maxRange.value;

            applyFilters();
        });
    });

    [minInput, maxInput].forEach(input => {
        input.addEventListener("input", () => {
            minRange.value = minInput.value || 0;
            maxRange.value = maxInput.value || 5000;
            applyFilters();
        });
    });


    /* =====================
       APPLY FILTER
    ====================== */

    function applyFilters() {

        showSkeleton();

        const params = new URLSearchParams();

        brandCheckboxes.forEach(cb => {
            if (cb.checked) params.append("brand", cb.value);
        });

        categoryCheckboxes.forEach(cb => {
            if (cb.checked) params.append("category", cb.value);
        });

        departmentCheckboxes.forEach(cb => {
            if (cb.checked) params.append("department", cb.value);
        });

        if (minInput.value) params.append("minPrice", minInput.value);
        if (maxInput.value) params.append("maxPrice", maxInput.value);
        if (sortSelect && sortSelect.value) params.append("sort", sortSelect.value);

        // 🔥 FIXED SEARCH (ต้องใส่ก่อน fetch)
        if (searchInput && searchInput.value.trim() !== "") {
            params.append("search", searchInput.value.trim());
        }

        fetch(`/products/shop/filter?${params.toString()}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(data => {
                renderProducts(data);
                updateURL(params);
            })
            .catch(err => {
                console.error("Filter Error:", err);
                productGrid.innerHTML = "<p>Something went wrong.</p>";
            });
    }


    /* =====================
       RENDER PRODUCTS
    ====================== */

    function renderProducts(products) {

        productGrid.innerHTML = "";
        productCount.innerText = `${products.length} products`;

        if (!products.length) {
            productGrid.innerHTML = "<p>No products found.</p>";
            return;
        }

        products.forEach(product => {

            const deleteButton =
                CURRENT_USER_ROLE === "admin"
                    ? `
        <form action="/products/admin/delete/${product.id}" method="POST">
            <button type="submit" class="admin-delete-btn">
                Delete
            </button>
        </form>
        `
                    : "";

            productGrid.innerHTML += `
            <div class="product-card fade-in">
                <a href="/products/${product.id}">
                    <div 
                        class="product-image-wrapper"
                        data-images='${JSON.stringify(product.images)}'
                    >
                        <img 
                            src="${product.images[0]}" 
                            class="image-base"
                            alt=""
                        >
                        <img 
                            src="${product.images[0]}" 
                            class="image-layer"
                            alt=""
                        >
                    </div>
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                </a>

                ${deleteButton}

            </div>
        `;
        });

        initImageHover();
    }


    /* =====================
       LUXURY IMAGE HOVER LOOP
    ====================== */

    function initImageHover() {

        document.querySelectorAll(".product-card").forEach(card => {

            const wrapper = card.querySelector(".product-image-wrapper");
            if (!wrapper) return;

            const images = JSON.parse(wrapper.dataset.images || "[]");
            if (images.length <= 1) return;

            const baseImg = wrapper.querySelector(".image-base");
            const layerImg = wrapper.querySelector(".image-layer");

            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });

            let currentIndex = 0;
            let interval = null;
            let showingLayer = false;

            card.addEventListener("mouseenter", () => {

                if (interval) return;

                interval = setInterval(() => {

                    currentIndex = (currentIndex + 1) % images.length;

                    if (!showingLayer) {
                        layerImg.src = images[currentIndex];
                        layerImg.style.opacity = "1";
                    } else {
                        baseImg.src = images[currentIndex];
                        layerImg.style.opacity = "0";
                    }

                    showingLayer = !showingLayer;

                }, 1200);

            });

            card.addEventListener("mouseleave", () => {

                clearInterval(interval);
                interval = null;

                baseImg.src = images[0];
                layerImg.style.opacity = "0";
                currentIndex = 0;
                showingLayer = false;

            });

        });
    }


    /* =====================
       UTILITIES
    ====================== */

    function updateURL(params) {
        window.history.pushState({}, "", `/products/shop?${params.toString()}`);
    }

    function showSkeleton() {
        productGrid.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            productGrid.innerHTML += `
                <div class="product-card skeleton"></div>
            `;
        }
    }


    // 🔥 LOAD FIRST TIME
    applyFilters();

});