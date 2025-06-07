document.addEventListener("DOMContentLoaded", () => {
    const postJob = document.getElementById("postJob");
    const create = document.getElementById("createJob");
    const cancel = document.getElementById("cancel");

    if (!postJob || !create || !cancel) return;

    create.addEventListener("click", () => postJob.showModal());
    cancel.addEventListener("click", () => postJob.close());

    postJob.addEventListener("click", (event) => {
        const rectangle = postJob.getBoundingClientRect();
        if (
            event.clientX < rectangle.left ||
            event.clientX > rectangle.right ||
            event.clientY < rectangle.top ||
            event.clientY > rectangle.bottom
        ) {
            jobPost.close();
        }
    });
});