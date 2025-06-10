document.addEventListener('DOMContentLoaded', function () {
    const createBtn = document.getElementById('createVolunteerBtn');
    const formDiv = document.getElementById('volunteerCreateForm');
    const displayContainer = document.getElementById('volunteerDisplayContainer');
    const cancelBtn = document.getElementById('cancelCreateBtn');

    const clearBtn = document.getElementById('clearSearchBtn');
    const searchForm = document.getElementById('volunteerSearchForm');
    const searchInput = document.getElementById('searchInput');
    const filterDropdown = document.getElementById('volunteerFilterDropdown');
    const viewFilter = document.getElementById('viewFilter');

    if (createBtn && formDiv && displayContainer) {
        createBtn.addEventListener('click', () => {
            const isFormVisible = formDiv.style.display === 'block';
            formDiv.style.display = isFormVisible ? 'none' : 'block';
            displayContainer.style.display = isFormVisible ? 'block' : 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    if (clearBtn && searchForm && searchInput && filterDropdown && viewFilter) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterDropdown.value = 'Default';
            viewFilter.value = 'all';
            searchForm.submit();
        });
    }

    const toggleButtons = document.querySelectorAll('.toggle-applicants-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.dataset.postid;
            const box = document.getElementById(`applicants-${postId}`);
            const isHidden = box.style.display === 'none';
            box.style.display = isHidden ? 'block' : 'none';
            btn.textContent = isHidden ? 'Hide Applicants' : 'View Applicants';
        });
    });

    function filterView(type) {
        const cards = document.querySelectorAll('.volunteering-card');
        cards.forEach(card => {
            const isMine = card.classList.contains('mine');
            if (type === 'mine') {
                card.style.display = isMine ? 'block' : 'none';
            } else if (type === 'others') {
                card.style.display = !isMine ? 'block' : 'none';
            }
        });
    }

    const viewToggles = document.querySelectorAll('.filter-btn');
    viewToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-view');
            filterView(type);
        });
    });

    const expiredBtn = document.getElementById('showExpiredBtn');
    if (expiredBtn) {
        let expiredVisible = false;
        expiredBtn.addEventListener('click', () => {
            expiredVisible = !expiredVisible;
            document.querySelectorAll('.volunteering-card.expired').forEach(card => {
                card.style.display = expiredVisible ? 'block' : 'none';
            });
            
        });
    }

    filterView('others');
});
