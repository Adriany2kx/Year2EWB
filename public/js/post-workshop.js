// runs after page fully loads
document.addEventListener("DOMContentLoaded", () => {
    // get elements used in the workshop modal and search/filter
    const postWorkshop = document.getElementById("postWorkshop");
    const create = document.getElementById("createWorkshop");
    const cancel = document.getElementById("cancel");
    const searchInput = document.querySelector('input[type="search"]');
    const filterDropdown = document.getElementById("sort-dropdown");

    // exit if modal or main buttons aren't found
    if (!postWorkshop || !create || !cancel) return;

    // open the modal on plus button click
    create.addEventListener("click", () => postWorkshop.showModal());
    // close modal on cancel button click
    cancel.addEventListener("click", () => postWorkshop.close());

    // close modal if click is outside modal area
    postWorkshop.addEventListener("click", (event) => {
        const rectangle = postWorkshop.getBoundingClientRect();
        if (
            event.clientX < rectangle.left ||
            event.clientX > rectangle.right ||
            event.clientY < rectangle.top ||
            event.clientY > rectangle.bottom
        ) {
            postWorkshop.close();
        }
    });

    // submit search when enter is pressde
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); 
                searchInput.form.submit();
            }
        });
    }

    // auto-submit filter when changed
    if (filterDropdown) {
        filterDropdown.addEventListener("change", () => {
            filterDropdown.form.submit();
        });
    }
});