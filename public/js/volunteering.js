document.addEventListener('DOMContentLoaded', function () {
    //create volunteer post form
    const createBtn = document.getElementById('createVolunteerBtn');
    const formDiv = document.getElementById('volunteerCreateForm');
    const displayContainer = document.getElementById('volunteerDisplayContainer');
    const cancelBtn = document.getElementById('cancelCreateBtn');

    //search + filter dropdowns
    const clearBtn = document.getElementById('clearSearchBtn');
    const searchForm = document.getElementById('volunteerSearchForm');
    const searchInput = document.getElementById('searchInput');
    const filterDropdown = document.getElementById('volunteerFilterDropdown');
    const viewFilter = document.getElementById('viewFilter');

    //active filter + expired posts
    const expiredBtn = document.getElementById('showExpiredBtn');
    let currentView = 'others';
    let expiredVisible = false;

    //form visibility- shows form + hides listings/searchbar when '+' clicked
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

    //clears filter + searchbar
    if (clearBtn && searchForm && searchInput && filterDropdown && viewFilter) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterDropdown.value = 'Default';
            viewFilter.value = 'all';
            searchForm.submit();
        });
    }

    //toggle view of applicants list 
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

    //filter posts to separate between 'your listings' and 'opportunities' 
    function filterView(type) {
        currentView = type;
        const cards = document.querySelectorAll('.volunteering-card');
        let visibleCount = 0;
    
        cards.forEach(card => {
            const isMine = card.classList.contains('mine');
            const isExpired = card.classList.contains('expired');
    
            //check if should show based on current filters + expiry
            let shouldShow = false;
            if (type === 'mine') {
                shouldShow = isMine && (!isExpired || expiredVisible);
            } else if (type === 'others') {
                shouldShow = !isMine && (!isExpired || expiredVisible);
            }
    
            //count how many posts visible- if not, show message
            card.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) visibleCount++;
        });
    
        const message = document.getElementById('noResultsMessage');
        if (message) {
            message.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
    
    //toggle switch between 'your listings' and 'opportunities'
    const viewToggles = document.querySelectorAll('.filter-btn');
    viewToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-view');
            viewToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterView(type);
        });
    });

    //toggle expired posts
    if (expiredBtn) {
        expiredBtn.addEventListener('click', () => {
            expiredVisible = !expiredVisible;
            filterView(currentView);
        });
    }

    //confirm before deleting a post
    document.querySelectorAll('form[action^="/volunteering/delete/"]').forEach(form => {
        form.addEventListener('submit', function (e) {
            if (!confirm('Delete this post?')) {
                e.preventDefault();
            }
        });
    });


    //default view 
    filterView('mine');
});
