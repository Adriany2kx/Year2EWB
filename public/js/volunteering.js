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

    const expiredBtn = document.getElementById('showExpiredBtn');
    let currentView = 'others';
    let expiredVisible = false;

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
        currentView = type;
        const cards = document.querySelectorAll('.volunteering-card');
        cards.forEach(card => {
            const isMine = card.classList.contains('mine');
            const isExpired = card.classList.contains('expired');

            let shouldShow = false;
            if (type === 'mine') {
                shouldShow = isMine && (!isExpired || expiredVisible);
            } else if (type === 'others') {
                shouldShow = !isMine && (!isExpired || expiredVisible);
            }

            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    const viewToggles = document.querySelectorAll('.filter-btn');
    viewToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-view');
            viewToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterView(type);
        });
    });

    if (expiredBtn) {
        expiredBtn.addEventListener('click', () => {
            expiredVisible = !expiredVisible;
            filterView(currentView);
        });
    }

    filterView('others');
});
